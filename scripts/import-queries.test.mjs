import { describe, expect, it } from "vitest";
import { datasetsToQueries, slugify } from "./import-queries.mjs";

const NOW = new Date("2026-08-19T09:00:00.000Z");

describe("slugify", () => {
  it("kebab-cases and de-duplicates", () => {
    const taken = new Set();
    expect(slugify("Ticket Statistics 90 Days", taken)).toBe("ticket-statistics-90-days");
    expect(slugify("Ticket Statistics 90 Days", taken)).toBe("ticket-statistics-90-days-2");
    expect(slugify("SLI Agreements with Additions & end date", taken)).toBe(
      "sli-agreements-with-additions-end-date"
    );
  });

  it("always produces a usable slug", () => {
    expect(slugify("*", new Set())).toBe("query");
    expect(slugify("A", new Set())).toBe("a-q");
  });
});

describe("datasetsToQueries", () => {
  it("maps a dataset onto a saved query", () => {
    const { queries } = datasetsToQueries(
      [
        {
          name: "*Time Entry Lite",
          description: "All time entries updated in the previous 14 days.",
          sql: "SELECT t.Time_RecID FROM v_rpt_time t",
        },
      ],
      NOW
    );

    expect(queries).toHaveLength(1);
    expect(queries[0]).toMatchObject({
      slug: "time-entry-lite",
      title: "Time Entry Lite",
      description: "All time entries updated in the previous 14 days.",
      source: "brightgauge",
      savedAt: "2026-08-19T09:00:00Z",
      savedBy: "import-queries",
    });
    expect(queries[0].tags).toContain("brightgauge");
  });

  it("falls back to a description when the export has none", () => {
    const { queries } = datasetsToQueries([{ name: "Companies", sql: "SELECT 1" }], NOW);
    expect(queries[0].description).toBe("Imported reporting query: Companies.");
  });

  it("records declared placeholders", () => {
    const { queries } = datasetsToQueries(
      [{ name: "Aging", sql: "SELECT 1 WHERE d >= '{{start_date}}' AND d < '{{end_date}}'" }],
      NOW
    );
    expect(queries[0].placeholders).toEqual(["start_date", "end_date"]);
  });

  it("skips what cannot be run as one statement", () => {
    const { queries, skipped } = datasetsToQueries(
      [
        { name: "Empty", sql: "  " },
        { name: "Two", sql: "SELECT 1; SELECT 2" },
        { name: "Trailing semicolon is fine", sql: "SELECT 1;" },
        { name: "Semicolon in a literal is fine", sql: "SELECT 'a; b' AS x" },
      ],
      NOW
    );

    expect(queries.map((query) => query.title)).toEqual([
      "Trailing semicolon is fine",
      "Semicolon in a literal is fine",
    ]);
    expect(skipped).toEqual([
      { name: "Empty", reason: "empty" },
      { name: "Two", reason: "multiple statements" },
    ]);
  });
});
