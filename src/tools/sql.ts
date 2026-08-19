/**
 * SQL toolset — read-only queries against the on-prem ConnectWise Manage
 * database, plus the catalogs that make writing one possible.
 *
 *  - cw_db_query:      run one SELECT, bounded by rows, characters and time.
 *  - cw_db_find_table: search the bundled schema catalog.
 *  - cw_db_find_query: search the saved-query library.
 *  - cw_db_save_query: add a query to the library (the only write in the server,
 *                      and it writes to a file, never to ConnectWise).
 *
 * Opt-in: this toolset reads the database through a server-wide read-only login,
 * not the session member's API keys — so its results are not attributed to a
 * member and are not filtered by that member's ConnectWise security role. It is
 * never in `all`, never in a preset, and unregistered without CW_DB_*.
 */

import { z } from "zod";
import type { ToolRegistrar } from "./registrar.js";
import type { CWClient } from "../cw/client.js";
import { CW_DB_TABLES, type TableDoc } from "../reference/cw-db-schema.js";
import { lexicalRank } from "../reference/search.js";
import { LibraryError, type QueryLibrary, type SavedQuery } from "../sql/library.js";
import {
  cellToString,
  describeSqlError,
  isCallerSqlMistake,
  SQL_CELL_CHAR_LIMIT,
  type SqlClient,
  type SqlResult,
} from "../sql/client.js";
import { clip, failure, json, responseFormatField, text } from "./shared.js";

/** What the sql toolset needs: the database, and the query library over it. */
export interface SqlContext {
  client: SqlClient;
  library: QueryLibrary;
}

/** Above this many columns a pipe table stops being readable. */
const TABLE_COLUMN_LIMIT = 10;

const SQL_STOP: ReadonlySet<string> = new Set([
  "table",
  "tables",
  "column",
  "columns",
  "db",
  "database",
  "sql",
  "select",
  "from",
  "where",
  "join",
  "row",
  "rows",
  "field",
  "fields",
  "data",
]);

/** Rank the schema catalog for a query. Pure — exported for tests. */
export function findTables(query: string, topK = 5): TableDoc[] {
  return lexicalRank(
    CW_DB_TABLES,
    query,
    (doc) => ({
      // `keywords` is what people call the thing, and it is only set on the
      // entry points — so "tickets" lands on v_rpt_service rather than on
      // SR_Board, whose purpose merely mentions tickets.
      strong: `${doc.name} ${doc.keywords ?? ""}`,
      medium: doc.purpose,
      weak: `${doc.pk ?? ""} ${doc.keyColumns ?? ""} ${doc.joins ?? ""} ${doc.notes ?? ""} ${
        doc.coveredBy ?? ""
      } ${doc.schema}`,
    }),
    {
      topK,
      extraStop: SQL_STOP,
      bonus: nameBonus,
      // At equal score the shorter name is the one that was asked for:
      // Company beats Company_Company_Type.
      tieBreak: (a, b) => a.name.length - b.name.length,
    }
  );
}

const squash = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Plain includes() ranks SR_Team level with SR_Service for the query
 * "SR_Service" — both contain "sr". Reward naming the table outright, and
 * otherwise reward covering more of its name.
 */
function nameBonus(doc: TableDoc, tokens: string[]): number {
  const squashedName = squash(doc.name);
  if (squash(tokens.join("")) === squashedName) return 20;
  if (tokens.some((token) => squash(token) === squashedName)) return 20;

  const segments = doc.name.toLowerCase().split("_").filter(Boolean);
  const covered = segments.filter((segment) => tokens.includes(segment)).length;
  return covered === 0 ? 0 : (covered / segments.length) * 5;
}

export function tableBlock(doc: TableDoc): string {
  const lines = [`### ${doc.schema}.${doc.name}${doc.size ? `  _(${doc.size})_` : ""}`, doc.purpose];
  if (doc.pk) lines.push(`- **PK**: ${doc.pk}`);
  if (doc.keyColumns) lines.push(`- **Key columns**: ${doc.keyColumns}`);
  if (doc.joins) lines.push(`- **Joins**: ${doc.joins}`);
  if (doc.coveredBy) lines.push(`- **Prefer the curated tool(s)**: ${doc.coveredBy}`);
  if (doc.notes) lines.push(`- _${doc.notes}_`);
  return lines.join("\n");
}

export function queryBlock(query: SavedQuery): string {
  const lines = [`### ${query.title}  \`${query.slug}\``, query.description];
  if (query.placeholders?.length) {
    lines.push(`- **Substitute**: ${query.placeholders.map((p) => `{{${p}}}`).join(", ")}`);
  }
  if (query.tags?.length) lines.push(`- **Tags**: ${query.tags.join(", ")}`);
  if (query.coveredBy) lines.push(`- **Prefer the curated tool(s)**: ${query.coveredBy}`);
  if (query.savedBy || query.savedAt) {
    lines.push(`- _saved ${query.savedAt ?? ""}${query.savedBy ? ` by ${query.savedBy}` : ""}_`);
  }
  lines.push("```sql", query.statement, "```");
  return lines.join("\n");
}

/** Render a result set: a pipe table when narrow, record blocks when wide. */
export function renderRows(result: SqlResult, format: "markdown" | "json"): string {
  if (result.rows.length === 0) return "Query returned no rows.";

  if (format === "json") {
    return json({ columns: result.columns, rows: result.rows });
  }

  const header = `# ${result.rows.length} row(s) × ${result.columns.length} column(s) — ${result.elapsedMs} ms`;
  const body =
    result.columns.length > TABLE_COLUMN_LIMIT ? recordBlocks(result) : pipeTable(result);
  const footer = truncationFooter(result);
  return [header, "", body, ...(footer ? ["", "---", footer] : [])].join("\n");
}

function pipeTable(result: SqlResult): string {
  const names = result.columns.map((column) => column.name);
  const lines = [`| ${names.join(" | ")} |`, `| ${names.map(() => "---").join(" | ")} |`];
  for (const row of result.rows) {
    lines.push(`| ${row.map((cell) => cellToString(cell, SQL_CELL_CHAR_LIMIT)).join(" | ")} |`);
  }
  return lines.join("\n");
}

function recordBlocks(result: SqlResult): string {
  return result.rows
    .map((row, index) => {
      const lines = [`**Row ${index + 1}**`];
      row.forEach((cell, position) => {
        const name = result.columns[position]?.name ?? `column${position + 1}`;
        lines.push(`- ${name}: ${cellToString(cell, SQL_CELL_CHAR_LIMIT)}`);
      });
      return lines.join("\n");
    })
    .join("\n\n");
}

function truncationFooter(result: SqlResult): string {
  switch (result.truncatedBy) {
    case "row_cap":
      return (
        `Stopped at the ${result.rows.length}-row cap and cancelled server-side — there are more rows. ` +
        "Narrow with WHERE, aggregate with GROUP BY, or raise max_rows (max 1000)."
      );
    case "char_budget":
      return (
        `Stopped at the character budget after ${result.rows.length} row(s) and cancelled server-side. ` +
        "ConnectWise rows are wide — name the columns you need instead of SELECT *."
      );
    case "extra_recordsets":
      return "Only the first result set is returned — send one SELECT per call.";
    default:
      return "";
  }
}

const CLIP_HINT =
  "Name the columns you need instead of SELECT * — ConnectWise tables have 100+ columns — and add TOP n.";

export function registerSqlTools(reg: ToolRegistrar, _client: CWClient, sql?: SqlContext): void {
  if (!sql) return;
  const { client, library } = sql;

  reg.register(
    {
      name: "cw_db_query",
      title: "Query the ConnectWise Database (Read-Only SQL)",
      description:
        "Run one read-only T-SQL SELECT against the on-prem ConnectWise Manage database — for cross-table " +
        "reporting, aggregates and joins the REST API cannot express. ALWAYS bound the query: SELECT TOP n " +
        "with a WHERE on a date column. This is the LIVE PRODUCTION database technicians are working in. " +
        "Name the columns you need — tables carry 100+ columns and ntext bodies, and SELECT * blows the " +
        "response budget after a handful of rows. Start from the v_rpt_* reporting views (v_rpt_service, " +
        "v_rpt_time, v_rpt_company): they already join board, status, company and contact. Discover tables " +
        "with cw_db_find_table and check cw_db_find_query for a saved query first; prefer a curated tool " +
        "(cw_search_tickets, cw_list_unbilled_time, …) when one answers the question. Results stop at " +
        "max_rows or the character budget and the query is then cancelled server-side. The connection is a " +
        "read-only login reading at READ UNCOMMITTED — nothing but SELECT succeeds, nothing here blocks " +
        "production writers, and counts are approximate under concurrent writes.",
      inputSchema: {
        statement: z
          .string()
          .min(1)
          .describe("One T-SQL SELECT. Bound it: SELECT TOP n … WHERE <date column> >= '2026-01-01'"),
        max_rows: z
          .number()
          .int()
          .positive()
          .max(1000)
          .default(200)
          .describe("Row cap — the query is cancelled once reached (default 200, max 1000)"),
        timeout_seconds: z
          .number()
          .int()
          .positive()
          .max(120)
          .default(30)
          .describe("Cancel the query after this many seconds (default 30, max 120)"),
        response_format: responseFormatField,
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args: {
      statement: string;
      max_rows: number;
      timeout_seconds: number;
      response_format: "markdown" | "json";
    }) => {
      try {
        const result = await client.query(args.statement, {
          maxRows: args.max_rows,
          timeoutMs: args.timeout_seconds * 1000,
          session: reg.sessionLabel,
        });
        return text(clip(renderRows(result, args.response_format), CLIP_HINT));
      } catch (error) {
        // Something the model can fix comes back as plain text so it self-corrects.
        if (isCallerSqlMistake(error)) return text(describeSqlError(error));
        return failure(error, describeSqlError);
      }
    }
  );

  reg.register(
    {
      name: "cw_db_find_table",
      title: "Find a ConnectWise Database Table",
      description:
        "Find which ConnectWise database table or view holds something — keyword search over a catalog of " +
        "the cwwebapp_* schema with key columns and join hints. Database names do NOT match the REST API: " +
        "tickets are SR_Service, and the reporting view is v_rpt_service. NEVER guess a table name — search " +
        "here first. Use the result to write cw_db_query SQL, or prefer the named curated tool when one " +
        "exists. The catalog carries key columns only; for a full column list run SELECT COLUMN_NAME, " +
        "DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='…' through cw_db_query.",
      inputSchema: {
        query: z
          .string()
          .min(1)
          .describe('What you are looking for (e.g. "tickets", "unbilled time", "agreements")'),
        top_k: z.number().int().positive().max(20).default(5).describe("How many tables to return"),
        response_format: responseFormatField,
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args: { query: string; top_k: number; response_format: "markdown" | "json" }) => {
      const hits = findTables(args.query, args.top_k);
      if (hits.length === 0) {
        return text(
          `No table matched "${args.query}". Try broader keywords (tickets, time, company, agreement, invoice, configuration).`
        );
      }
      if (args.response_format === "json") return text(clip(json(hits)));
      return text(
        clip(
          [
            `# Tables for "${args.query}"`,
            "",
            ...hits.map(tableBlock),
            "",
            "Query one with **cw_db_query** — always SELECT TOP n with a date bound. For a full column list: " +
              "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='…' ORDER BY ORDINAL_POSITION",
          ].join("\n\n")
        )
      );
    }
  );

  reg.register(
    {
      name: "cw_db_find_query",
      title: "Find a Saved ConnectWise Query",
      description:
        "Search the saved-query library — reporting SQL that already works against this database, shipped " +
        "with the server or saved by earlier sessions. LOOK HERE BEFORE WRITING SQL: a saved query is " +
        "already correct about the schema. Substitute any {{placeholders}} and run the statement with " +
        "cw_db_query, editing it as needed.",
      inputSchema: {
        query: z
          .string()
          .min(1)
          .describe('What you want to report on (e.g. "unbilled time", "ticket backlog")'),
        top_k: z.number().int().positive().max(20).default(5).describe("How many queries to return"),
        response_format: responseFormatField,
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (args: { query: string; top_k: number; response_format: "markdown" | "json" }) => {
      try {
        const hits = await library.find(args.query, args.top_k);
        if (hits.length === 0) {
          return text(
            `No saved query matched "${args.query}". Write the SQL with cw_db_find_table + cw_db_query, ` +
              "then save it with cw_db_save_query so the next session finds it."
          );
        }
        if (args.response_format === "json") return text(clip(json(hits)));
        return text(
          clip(
            [
              `# Saved queries for "${args.query}"`,
              "",
              ...hits.map(queryBlock),
              "",
              "Substitute the {{placeholders}} and run it with **cw_db_query**.",
            ].join("\n\n")
          )
        );
      } catch (error) {
        return failure(error, describeSqlError);
      }
    }
  );

  if (library.writable) {
    reg.register(
      {
        name: "cw_db_save_query",
        title: "Save a ConnectWise Query for Later",
        description:
          "Add a query to the saved-query library so later sessions can find it with cw_db_find_query. " +
          "Save a query AFTER it has run successfully — never save SQL you have not executed. Describe what " +
          "question it answers, not how it works: the description is what search matches. Parameterise " +
          "anything date- or company-specific as {{placeholders}} and list them. This writes to the " +
          "library file only — it never modifies ConnectWise.",
        inputSchema: {
          slug: z
            .string()
            .min(2)
            .max(61)
            .describe('Identifier: lower-case, hyphenated, e.g. "unbilled-time-by-company"'),
          title: z.string().min(1).describe("Short human title"),
          description: z
            .string()
            .min(1)
            .describe("What question this answers, in one sentence"),
          statement: z.string().min(1).describe("The T-SQL SELECT, with {{placeholders}}"),
          tags: z.array(z.string()).optional().describe("Keywords to help future searches"),
          placeholders: z
            .array(z.string())
            .optional()
            .describe('Placeholder names used in the statement, without braces (e.g. ["start_date"])'),
          overwrite: z
            .boolean()
            .default(false)
            .describe("Replace an existing query with this slug (default false)"),
        },
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      async (args: {
        slug: string;
        title: string;
        description: string;
        statement: string;
        tags?: string[];
        placeholders?: string[];
        overwrite: boolean;
      }) => {
        try {
          const saved = await library.save(args, {
            overwrite: args.overwrite,
            savedBy: reg.sessionLabel,
          });
          return text(
            `Saved **${saved.title}** as \`${saved.slug}\`. Find it later with cw_db_find_query.`
          );
        } catch (error) {
          // A rejected slug or a duplicate is the caller's to fix.
          if (error instanceof LibraryError) return text(`Error: ${error.message}`);
          return failure(error, describeSqlError);
        }
      }
    );
  }
}
