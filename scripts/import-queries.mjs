#!/usr/bin/env node
/**
 * Import an existing reporting-tool export into the saved-query overlay that
 * cw_db_find_query reads.
 *
 * Written for a BrightGauge dataset export — a datasets.json of
 * { name, description, sql, url, … } — but the mapping is one small function,
 * so another source only needs its own reader.
 *
 * The output is deliberately NOT part of this repository: imported queries are
 * a specific MSP's reporting, and can carry company names, board names and
 * rates. It is written next to the export by default, and the server picks it
 * up through CW_DB_QUERY_LIBRARY.
 *
 * Usage:
 *   node scripts/import-queries.mjs <datasets.json|export-dir> [output.json]
 *   node scripts/import-queries.mjs <…> --merge     # keep existing entries
 */

import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

/** Statement text that is not a single runnable SELECT. */
function unusableReason(sql) {
  const text = (sql ?? "").trim();
  if (!text) return "empty";
  // Strip string literals before looking for a statement separator, so a
  // semicolon inside 'a; b' does not read as two statements.
  const withoutStrings = text.replace(/'(?:[^']|'')*'/g, "''");
  const body = withoutStrings.replace(/;\s*$/, "");
  if (/;\s*\S/.test(body)) return "multiple statements";
  return undefined;
}

export function slugify(name, taken = new Set()) {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 55) || "query";
  let slug = base.length < 2 ? `${base}-q` : base;
  let n = 2;
  while (taken.has(slug)) slug = `${base}-${n++}`;
  taken.add(slug);
  return slug;
}

/** Placeholder names already present in a statement, e.g. {{start_date}}. */
function placeholdersIn(statement) {
  const found = [...statement.matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1]);
  return found.length ? [...new Set(found)] : undefined;
}

function tagsFor(dataset) {
  const words = dataset.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((word) => word.length > 3);
  return [...new Set(["brightgauge", ...words])].slice(0, 8);
}

/** Datasets → SavedQuery[]. Pure, so the mapping is testable without a file. */
export function datasetsToQueries(datasets, now = new Date()) {
  const taken = new Set();
  const queries = [];
  const skipped = [];

  for (const dataset of datasets) {
    const name = (dataset.name ?? "").replace(/^\*+/, "").trim();
    if (!name) {
      skipped.push({ name: dataset.name ?? "(unnamed)", reason: "no name" });
      continue;
    }
    const reason = unusableReason(dataset.sql);
    if (reason) {
      skipped.push({ name, reason });
      continue;
    }

    const statement = dataset.sql.trim();
    queries.push({
      slug: slugify(name, taken),
      title: name,
      description: (dataset.description ?? "").trim() || `Imported reporting query: ${name}.`,
      statement,
      tags: tagsFor({ ...dataset, name }),
      ...(placeholdersIn(statement) ? { placeholders: placeholdersIn(statement) } : {}),
      source: "brightgauge",
      savedAt: now.toISOString().replace(/\.\d{3}Z$/, "Z"),
      savedBy: "import-queries",
    });
  }

  return { queries, skipped };
}

function readDatasets(input) {
  const path = statSync(input).isDirectory() ? join(input, "datasets.json") : input;
  const parsed = JSON.parse(readFileSync(path, "utf8"));
  const datasets = Array.isArray(parsed) ? parsed : (parsed.datasets ?? Object.values(parsed)[0]);
  if (!Array.isArray(datasets)) throw new Error(`${path} does not contain a dataset array`);
  return { path, datasets };
}

function main() {
  const args = process.argv.slice(2);
  const merge = args.includes("--merge");
  const positional = args.filter((arg) => !arg.startsWith("--"));
  const input = positional[0];
  if (!input) {
    console.error("usage: node scripts/import-queries.mjs <datasets.json|export-dir> [output.json] [--merge]");
    process.exit(1);
  }

  const { path, datasets } = readDatasets(input);
  // Default next to the export, never inside this repository.
  const output = positional[1] ?? join(dirname(path), "cw-db-queries.local.json");

  const { queries, skipped } = datasetsToQueries(datasets);

  let merged = queries;
  if (merge && existsSync(output)) {
    const existing = JSON.parse(readFileSync(output, "utf8")).queries ?? [];
    const bySlug = new Map(existing.map((query) => [query.slug, query]));
    for (const query of queries) bySlug.set(query.slug, query);
    merged = [...bySlug.values()];
  }

  writeFileSync(output, `${JSON.stringify({ version: 1, queries: merged }, null, 2)}\n`);

  console.log(`${output}: ${merged.length} queries (${queries.length} imported from ${datasets.length} datasets)`);
  for (const { name, reason } of skipped) console.warn(`  ! skipped "${name}" — ${reason}`);
  console.log(`\nPoint the server at it:  CW_DB_QUERY_LIBRARY=${output}`);
  console.log("These queries are instance-specific — keep them out of the public repository.");
}

// Windows drive letters make a naive file:// comparison fail — build the URL.
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main();
