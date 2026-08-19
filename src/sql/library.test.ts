import { describe, expect, it, vi } from "vitest";
import {
  LibraryError,
  MAX_LIBRARY_ENTRIES,
  MAX_STATEMENT_CHARS,
  QueryLibrary,
  rankQueries,
  SLUG_PATTERN,
  type LibraryFs,
  type SavedQuery,
} from "./library.js";

const CORE: SavedQuery[] = [
  {
    slug: "unbilled-time-by-company",
    title: "Unbilled billable time by company",
    description: "Billable hours not yet invoiced, per customer.",
    statement: "SELECT 1",
    tags: ["billing"],
    source: "core",
  },
  {
    slug: "open-tickets-by-board",
    title: "Open tickets by board",
    description: "How many tickets are open on each board.",
    statement: "SELECT 2",
    tags: ["tickets"],
    source: "core",
  },
];

/** In-memory LibraryFs — the repo mocks no I/O, so this is the injection seam. */
function memoryFs(initial: Record<string, string> = {}) {
  const files = new Map(Object.entries(initial));
  const mtimes = new Map([...files.keys()].map((path) => [path, 1]));
  let clock = 1;
  const fs: LibraryFs & { files: Map<string, string>; writes: number } = {
    files,
    writes: 0,
    async readFile(path) {
      const value = files.get(path);
      if (value === undefined) throw new Error(`ENOENT ${path}`);
      return value;
    },
    async writeFile(path, data) {
      fs.writes += 1;
      files.set(path, data);
      mtimes.set(path, ++clock);
    },
    async rename(from, to) {
      const value = files.get(from);
      if (value === undefined) throw new Error(`ENOENT ${from}`);
      files.delete(from);
      files.set(to, value);
      mtimes.delete(from);
      mtimes.set(to, ++clock);
    },
    async mtimeMs(path) {
      return mtimes.get(path);
    },
  };
  return fs;
}

const PATH = "/data/cw-queries.json";

const overlay = (...queries: Partial<SavedQuery>[]) =>
  JSON.stringify({
    version: 1,
    queries: queries.map((query) => ({
      slug: "x",
      title: "t",
      description: "d",
      statement: "SELECT 0",
      source: "session",
      ...query,
    })),
  });

describe("QueryLibrary — reading", () => {
  it("is the core alone without a path, and not writable", async () => {
    const library = new QueryLibrary({ core: CORE });
    expect(library.writable).toBe(false);
    expect(await library.list()).toHaveLength(2);
  });

  it("merges the overlay over the core by slug", async () => {
    const fs = memoryFs({
      [PATH]: overlay(
        { slug: "open-tickets-by-board", title: "Local override", statement: "SELECT 99" },
        { slug: "site-specific", title: "Site specific" }
      ),
    });
    const library = new QueryLibrary({ path: PATH, core: CORE, fs });

    const all = await library.list();
    expect(all).toHaveLength(3);
    expect((await library.get("open-tickets-by-board"))?.title).toBe("Local override");
    expect((await library.get("unbilled-time-by-company"))?.source).toBe("core");
    expect(await library.get("site-specific")).toBeDefined();
  });

  it("falls back to the core when the overlay is unreadable", async () => {
    const fs = memoryFs({ [PATH]: "{ not json" });
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const library = new QueryLibrary({ path: PATH, core: CORE, fs });

    expect(await library.list()).toHaveLength(2);
    expect(errors).toHaveBeenCalledOnce();
    errors.mockRestore();
  });

  it("drops overlay rows with an invalid slug", async () => {
    const fs = memoryFs({ [PATH]: overlay({ slug: "Not A Slug" }, { slug: "fine-one" }) });
    const library = new QueryLibrary({ path: PATH, core: CORE, fs });
    const slugs = (await library.list()).map((query) => query.slug);
    expect(slugs).toContain("fine-one");
    expect(slugs).not.toContain("Not A Slug");
  });

  it("picks up an overlay edited underneath it", async () => {
    const fs = memoryFs({ [PATH]: overlay({ slug: "first" }) });
    const library = new QueryLibrary({ path: PATH, core: CORE, fs });
    expect(await library.get("second")).toBeUndefined();

    await fs.writeFile(PATH, overlay({ slug: "first" }, { slug: "second" }));
    expect(await library.get("second")).toBeDefined();
  });
});

describe("QueryLibrary — saving", () => {
  const entry = {
    slug: "my-query",
    title: "My query",
    description: "Answers something useful.",
    statement: "SELECT TOP 10 * FROM v_rpt_service",
  };

  it("refuses without a configured path", async () => {
    const library = new QueryLibrary({ core: CORE });
    await expect(library.save(entry)).rejects.toBeInstanceOf(LibraryError);
  });

  it("writes atomically and stamps provenance", async () => {
    const fs = memoryFs();
    const library = new QueryLibrary({ path: PATH, core: CORE, fs });

    const saved = await library.save(entry, { savedBy: "byok:abc12345" });

    expect(saved.source).toBe("session");
    expect(saved.savedBy).toBe("byok:abc12345");
    expect(saved.savedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    // written to .tmp, then renamed — never in place
    expect(fs.files.has(`${PATH}.tmp`)).toBe(false);
    expect(JSON.parse(fs.files.get(PATH) as string).queries).toHaveLength(1);
    expect(await library.get("my-query")).toMatchObject({ title: "My query" });
  });

  it("rejects a duplicate slug unless overwrite is set", async () => {
    const fs = memoryFs();
    const library = new QueryLibrary({ path: PATH, core: CORE, fs });
    await library.save(entry);

    await expect(library.save({ ...entry, title: "Second" })).rejects.toThrow(/already exists/);
    const replaced = await library.save({ ...entry, title: "Second" }, { overwrite: true });
    expect(replaced.title).toBe("Second");
    expect(JSON.parse(fs.files.get(PATH) as string).queries).toHaveLength(1);
  });

  it("refuses to shadow a core slug by accident", async () => {
    const library = new QueryLibrary({ path: PATH, core: CORE, fs: memoryFs() });
    await expect(
      library.save({ ...entry, slug: "open-tickets-by-board" })
    ).rejects.toThrow(/built in/);
    await expect(
      library.save({ ...entry, slug: "open-tickets-by-board" }, { overwrite: true })
    ).resolves.toMatchObject({ slug: "open-tickets-by-board" });
  });

  it("validates the entry", async () => {
    const library = new QueryLibrary({ path: PATH, core: CORE, fs: memoryFs() });
    await expect(library.save({ ...entry, slug: "Bad Slug" })).rejects.toThrow(/Invalid slug/);
    await expect(library.save({ ...entry, slug: "a" })).rejects.toThrow(/Invalid slug/);
    await expect(library.save({ ...entry, title: "  " })).rejects.toThrow(/title/);
    await expect(library.save({ ...entry, description: "" })).rejects.toThrow(/description/);
    await expect(
      library.save({ ...entry, statement: "x".repeat(MAX_STATEMENT_CHARS + 1) })
    ).rejects.toThrow(/limit/);
  });

  it("caps the library size", async () => {
    const many = Array.from({ length: MAX_LIBRARY_ENTRIES }, (_, i) => ({ slug: `q-${i}` }));
    const fs = memoryFs({ [PATH]: overlay(...many) });
    const library = new QueryLibrary({ path: PATH, core: CORE, fs });

    await expect(library.save(entry)).rejects.toThrow(/full/);
    // Replacing an existing entry is still allowed at the cap.
    await expect(
      library.save({ ...entry, slug: "q-1" }, { overwrite: true })
    ).resolves.toMatchObject({ slug: "q-1" });
  });

  it("keeps both of two concurrent saves", async () => {
    const fs = memoryFs();
    const library = new QueryLibrary({ path: PATH, core: CORE, fs });

    await Promise.all([
      library.save({ ...entry, slug: "first-query" }),
      library.save({ ...entry, slug: "second-query" }),
    ]);

    const slugs = JSON.parse(fs.files.get(PATH) as string).queries.map(
      (query: SavedQuery) => query.slug
    );
    expect(slugs).toEqual(["first-query", "second-query"]);
  });

  it("stays usable after a failed save", async () => {
    const library = new QueryLibrary({ path: PATH, core: CORE, fs: memoryFs() });
    await expect(library.save({ ...entry, slug: "BAD" })).rejects.toBeInstanceOf(LibraryError);
    await expect(library.save(entry)).resolves.toMatchObject({ slug: "my-query" });
  });
});

describe("rankQueries", () => {
  it("finds by description, tag and slug", async () => {
    expect(rankQueries(CORE, "unbilled")[0]?.slug).toBe("unbilled-time-by-company");
    expect(rankQueries(CORE, "billing")[0]?.slug).toBe("unbilled-time-by-company");
    expect(rankQueries(CORE, "open-tickets-by-board")[0]?.slug).toBe("open-tickets-by-board");
  });

  it("returns nothing for a query made only of noise", () => {
    expect(rankQueries(CORE, "")).toEqual([]);
    expect(rankQueries(CORE, "show me the sql query")).toEqual([]);
  });
});

describe("SLUG_PATTERN", () => {
  it("accepts the intended shape and rejects the rest", () => {
    for (const slug of ["ab", "unbilled-time", "q1", "a-b-c-1"]) {
      expect(SLUG_PATTERN.test(slug), slug).toBe(true);
    }
    for (const slug of ["a", "-leading", "Upper", "with space", "with_underscore", "x".repeat(62)]) {
      expect(SLUG_PATTERN.test(slug), slug).toBe(false);
    }
  });
});
