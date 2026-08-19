import { describe, expect, it } from "vitest";
import { CW_DB_TABLES } from "../reference/cw-db-schema.js";
import { CW_DB_QUERY_CORE } from "../reference/cw-db-queries.js";
import { SLUG_PATTERN } from "../sql/library.js";
import type { SqlResult } from "../sql/client.js";
import { findTables, queryBlock, renderRows, tableBlock } from "./sql.js";

const result = (over: Partial<SqlResult> = {}): SqlResult => ({
  columns: [
    { name: "TicketNbr", type: "int" },
    { name: "summary", type: "nvarchar" },
  ],
  rows: [
    [123, "Outlook will not connect"],
    [124, "Printer offline"],
  ],
  truncatedBy: "none",
  elapsedMs: 42,
  ...over,
});

describe("findTables", () => {
  it("lands on the reporting view for the obvious asks", () => {
    expect(findTables("tickets")[0]?.name).toBe("v_rpt_service");
    expect(findTables("unbilled time hours").map((t) => t.name)).toContain("v_rpt_time");
    expect(findTables("invoices")[0]?.name).toBe("v_rpt_invoices");
    expect(findTables("agreements renewal").map((t) => t.name)).toContain("v_rpt_agreementlist");
  });

  it("prefers the exact name over a longer one containing it", () => {
    const names = findTables("SR_Service", 5).map((t) => t.name);
    expect(names[0]).toBe("SR_Service");
    expect(names.indexOf("SR_Service")).toBeLessThan(names.indexOf("SR_Service_SLA_Workflow"));
  });

  it("breaks ties toward the shorter name", () => {
    const names = findTables("company", 10).map((t) => t.name);
    expect(names.indexOf("Company")).toBeLessThan(names.indexOf("Company_Company_Type"));
  });

  it("surfaces the conventions entry for a naming question", () => {
    const names = findTables("recid naming convention primary key", 5).map((t) => t.name);
    expect(names).toContain("ConnectWise Manage schema conventions");
  });

  it("returns nothing for noise", () => {
    expect(findTables("")).toEqual([]);
    expect(findTables("how do i get all the")).toEqual([]);
    expect(findTables("select columns from the table")).toEqual([]);
  });

  it("respects top_k", () => {
    expect(findTables("company", 3)).toHaveLength(3);
  });
});

describe("renderRows", () => {
  it("renders a narrow result as a pipe table", () => {
    const output = renderRows(result(), "markdown");
    expect(output).toContain("# 2 row(s) × 2 column(s) — 42 ms");
    expect(output).toContain("| TicketNbr | summary |");
    expect(output.split("\n").filter((line) => line.startsWith("| ---"))).toHaveLength(1);
    expect(output).not.toContain("---\nStopped");
  });

  it("switches to record blocks when the row is wide", () => {
    const columns = Array.from({ length: 12 }, (_, i) => ({ name: `c${i}`, type: "int" }));
    const output = renderRows(
      result({ columns, rows: [columns.map((_, i) => i)] }),
      "markdown"
    );
    expect(output).toContain("**Row 1**");
    expect(output).not.toContain("| --- |");
  });

  it("keeps a hostile cell from breaking the table", () => {
    const output = renderRows(
      result({ rows: [[1, "pipe | and\nnewline"]] }),
      "markdown"
    );
    const dataRows = output.split("\n").filter((line) => line.startsWith("| 1 "));
    expect(dataRows).toHaveLength(1);
    expect(dataRows[0]).toContain("\\|");
    expect(dataRows[0]).toContain("↵");
  });

  it("renders NULL for empty cells", () => {
    expect(renderRows(result({ rows: [[null, undefined]] }), "markdown")).toContain("| NULL | NULL |");
  });

  it("reports each truncation reason, without making it an error", () => {
    expect(renderRows(result({ truncatedBy: "row_cap" }), "markdown")).toContain("max_rows");
    expect(renderRows(result({ truncatedBy: "char_budget" }), "markdown")).toContain(
      "name the columns you need"
    );
    expect(renderRows(result({ truncatedBy: "extra_recordsets" }), "markdown")).toContain(
      "one SELECT per call"
    );
  });

  it("says so plainly when there are no rows", () => {
    expect(renderRows(result({ rows: [] }), "markdown")).toBe("Query returned no rows.");
  });

  it("round-trips as JSON with positional rows", () => {
    const parsed = JSON.parse(renderRows(result(), "json")) as SqlResult;
    expect(parsed.columns.map((c) => c.name)).toEqual(["TicketNbr", "summary"]);
    expect(parsed.rows[0]).toHaveLength(parsed.columns.length);
  });
});

describe("tableBlock / queryBlock", () => {
  it("renders only the fields a doc actually has", () => {
    const block = tableBlock({ schema: "dbo", name: "X", purpose: "Something." });
    expect(block).toContain("### dbo.X");
    expect(block).not.toContain("**PK**");

    const full = tableBlock(CW_DB_TABLES.find((t) => t.name === "v_rpt_service")!);
    expect(full).toContain("**PK**");
    expect(full).toContain("**Key columns**");
    expect(full).toContain("**Prefer the curated tool(s)**");
  });

  it("renders a saved query with its SQL and placeholders", () => {
    const block = queryBlock(CW_DB_QUERY_CORE[0]!);
    expect(block).toContain("`unbilled-time-by-company`");
    expect(block).toContain("{{start_date}}");
    expect(block).toContain("```sql");
  });
});

describe("catalog integrity", () => {
  it("keeps the conventions entry first and every name unique", () => {
    expect(CW_DB_TABLES[0]?.schema).toBe("(conventions)");
    const names = CW_DB_TABLES.map((table) => `${table.schema}.${table.name}`);
    expect(new Set(names).size).toBe(names.length);
  });

  it("keeps every block small enough that top_k 20 cannot blow the response limit", () => {
    for (const table of CW_DB_TABLES) {
      expect(tableBlock(table).length, table.name).toBeLessThan(2_000);
    }
  });

  it("ships core queries with valid, unique slugs", () => {
    const slugs = CW_DB_QUERY_CORE.map((query) => query.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const query of CW_DB_QUERY_CORE) {
      expect(SLUG_PATTERN.test(query.slug), query.slug).toBe(true);
      expect(query.source).toBe("core");
      // Every placeholder it declares must actually appear in the statement.
      for (const placeholder of query.placeholders ?? []) {
        expect(query.statement, query.slug).toContain(`{{${placeholder}}}`);
      }
      // …and every placeholder in the statement must be declared.
      for (const found of query.statement.match(/\{\{(\w+)\}\}/g) ?? []) {
        const name = found.slice(2, -2);
        expect(query.placeholders ?? [], `${query.slug}:${name}`).toContain(name);
      }
    }
  });
});
