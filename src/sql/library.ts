/**
 * The saved-query library: the committed core plus a writable overlay file.
 *
 * The overlay is where anything instance-specific lives — queries the model
 * saved during a session, and whatever an operator imported from an existing
 * reporting tool. It is keyed by slug and wins over the core, so a deployment
 * can replace a shipped query without editing the package.
 *
 * Writing here is the only state this server mutates. It never touches the
 * ConnectWise database, which stays SELECT-only by grant.
 */

import { CW_DB_QUERY_CORE, type SavedQuery } from "../reference/cw-db-queries.js";
import { lexicalRank } from "../reference/search.js";
import type { ScoreFields } from "../reference/search.js";

export type { SavedQuery };

export const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,60}$/;
/** Keeps an over-eager caller from growing the file without bound. */
export const MAX_LIBRARY_ENTRIES = 500;
export const MAX_STATEMENT_CHARS = 10_000;

/** Words that say nothing about which query is wanted. */
const QUERY_STOP: ReadonlySet<string> = new Set([
  "query",
  "queries",
  "sql",
  "select",
  "from",
  "where",
  "join",
  "table",
  "column",
  "report",
  "show",
  "me",
]);

export class LibraryError extends Error {}

/** The filesystem surface the library needs — injected in tests. */
export interface LibraryFs {
  readFile(path: string): Promise<string>;
  writeFile(path: string, data: string): Promise<void>;
  rename(from: string, to: string): Promise<void>;
  mtimeMs(path: string): Promise<number | undefined>;
}

export interface QueryLibraryOptions {
  /** Overlay path; without one the library is the read-only core. */
  path?: string;
  core?: SavedQuery[];
  fs?: LibraryFs;
}

interface OverlayFile {
  version: 1;
  queries: SavedQuery[];
}

async function nodeFs(): Promise<LibraryFs> {
  const { readFile, writeFile, rename, stat } = await import("node:fs/promises");
  return {
    readFile: (path) => readFile(path, "utf8"),
    writeFile: (path, data) => writeFile(path, data, "utf8"),
    rename: (from, to) => rename(from, to),
    mtimeMs: async (path) => {
      try {
        return (await stat(path)).mtimeMs;
      } catch {
        return undefined;
      }
    },
  };
}

export class QueryLibrary {
  /** True when queries can be saved — i.e. an overlay path is configured. */
  readonly writable: boolean;

  private readonly core: SavedQuery[];
  private readonly path: string | undefined;
  private readonly fsPromise: Promise<LibraryFs>;
  private overlay: SavedQuery[] = [];
  private overlayMtime: number | undefined;
  private loaded = false;
  /** Serializes read-modify-write so two saves cannot lose one another. */
  private writeChain: Promise<unknown> = Promise.resolve();

  constructor(options: QueryLibraryOptions = {}) {
    this.core = options.core ?? CW_DB_QUERY_CORE;
    this.path = options.path;
    this.writable = Boolean(options.path);
    this.fsPromise = options.fs ? Promise.resolve(options.fs) : nodeFs();
  }

  /** Core ∪ overlay, overlay winning by slug. */
  async list(): Promise<SavedQuery[]> {
    await this.refresh();
    const merged = new Map<string, SavedQuery>();
    for (const query of this.core) merged.set(query.slug, query);
    for (const query of this.overlay) merged.set(query.slug, query);
    return [...merged.values()];
  }

  async find(query: string, topK = 5): Promise<SavedQuery[]> {
    return rankQueries(await this.list(), query, topK);
  }

  async get(slug: string): Promise<SavedQuery | undefined> {
    return (await this.list()).find((query) => query.slug === slug);
  }

  /**
   * Add or replace an overlay entry. Rejects rather than overwrites unless
   * `overwrite` is set — a model re-using a slug is usually a mistake.
   */
  async save(
    entry: Pick<SavedQuery, "slug" | "title" | "description" | "statement"> &
      Partial<Pick<SavedQuery, "tags" | "placeholders">>,
    options: { overwrite?: boolean; savedBy?: string } = {}
  ): Promise<SavedQuery> {
    if (!this.path) {
      throw new LibraryError(
        "This server has no writable query library — set CW_DB_QUERY_LIBRARY to a file path."
      );
    }
    validate(entry);

    const run = this.writeChain.then(async () => {
      await this.refresh(true);

      const existingCore = this.core.find((query) => query.slug === entry.slug);
      const existingOverlay = this.overlay.find((query) => query.slug === entry.slug);
      if (!options.overwrite && (existingCore || existingOverlay)) {
        throw new LibraryError(
          `A query named "${entry.slug}" already exists (${
            existingOverlay ? "saved" : "built in"
          }: ${(existingOverlay ?? existingCore)?.title}). Pick another slug, or pass overwrite.`
        );
      }
      if (!existingOverlay && this.overlay.length >= MAX_LIBRARY_ENTRIES) {
        throw new LibraryError(
          `The query library is full (${MAX_LIBRARY_ENTRIES} saved queries) — delete some before saving more.`
        );
      }

      const saved: SavedQuery = {
        slug: entry.slug,
        title: entry.title.trim(),
        description: entry.description.trim(),
        statement: entry.statement.trim(),
        ...(entry.tags?.length ? { tags: entry.tags } : {}),
        ...(entry.placeholders?.length ? { placeholders: entry.placeholders } : {}),
        source: "session",
        savedAt: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
        ...(options.savedBy ? { savedBy: options.savedBy } : {}),
      };

      this.overlay = [...this.overlay.filter((query) => query.slug !== entry.slug), saved];
      await this.persist();
      return saved;
    });

    // Keep the chain alive even when this save failed.
    this.writeChain = run.catch(() => undefined);
    return run;
  }

  private async refresh(force = false): Promise<void> {
    if (!this.path) return;
    const fs = await this.fsPromise;
    const mtime = await fs.mtimeMs(this.path);
    if (this.loaded && !force && mtime === this.overlayMtime) return;

    this.loaded = true;
    this.overlayMtime = mtime;
    if (mtime === undefined) {
      this.overlay = [];
      return;
    }

    try {
      const parsed = JSON.parse(await fs.readFile(this.path)) as OverlayFile;
      this.overlay = Array.isArray(parsed?.queries)
        ? parsed.queries.filter((query) => SLUG_PATTERN.test(query?.slug ?? ""))
        : [];
    } catch (error) {
      // A broken overlay must not take the core down with it.
      console.error(
        `[db] could not read the query library at ${this.path}: ${
          error instanceof Error ? error.message : String(error)
        } — using the built-in queries only.`
      );
      this.overlay = [];
    }
  }

  private async persist(): Promise<void> {
    if (!this.path) return;
    const fs = await this.fsPromise;
    const file: OverlayFile = { version: 1, queries: this.overlay };
    const temp = `${this.path}.tmp`;
    // Write then rename: a torn library file is worse than a lost save.
    await fs.writeFile(temp, `${JSON.stringify(file, null, 2)}\n`);
    await fs.rename(temp, this.path);
    this.overlayMtime = await fs.mtimeMs(this.path);
  }
}

/** Rank saved queries for a search. Pure — exported for tests. */
export function rankQueries(queries: SavedQuery[], query: string, topK = 5): SavedQuery[] {
  return lexicalRank(queries, query, queryFields, {
    topK,
    extraStop: QUERY_STOP,
    bonus: (item, tokens) => (tokens.includes(item.slug.toLowerCase()) ? 10 : 0),
    tieBreak: (a, b) => a.slug.length - b.slug.length,
  });
}

function queryFields(item: SavedQuery): ScoreFields {
  return {
    strong: `${item.slug} ${item.title} ${item.description}`,
    medium: (item.tags ?? []).join(" "),
    weak: `${item.statement} ${item.coveredBy ?? ""}`,
  };
}

function validate(entry: {
  slug: string;
  title: string;
  description: string;
  statement: string;
}): void {
  if (!SLUG_PATTERN.test(entry.slug)) {
    throw new LibraryError(
      `Invalid slug "${entry.slug}" — use 2-61 lower-case letters, digits and hyphens, e.g. "unbilled-time-by-company".`
    );
  }
  if (!entry.title.trim()) throw new LibraryError("title is required.");
  if (!entry.description.trim()) {
    throw new LibraryError("description is required — say what question the query answers.");
  }
  if (!entry.statement.trim()) throw new LibraryError("statement is required.");
  if (entry.statement.length > MAX_STATEMENT_CHARS) {
    throw new LibraryError(
      `statement is ${entry.statement.length} characters — the limit is ${MAX_STATEMENT_CHARS}.`
    );
  }
}
