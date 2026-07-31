import { describe, expect, it } from "vitest";
import { extraQueryParams, findEndpoints, inlineQueryOf, normalizeApiPath } from "./advanced.js";

describe("normalizeApiPath", () => {
  it("returns the path after /apis/3.0 from a full URL", () => {
    expect(normalizeApiPath("https://x.myconnectwise.net/v4_6_release/apis/3.0/procurement/catalog")).toBe(
      "/procurement/catalog"
    );
  });
  it("keeps a bare path and adds a leading slash", () => {
    expect(normalizeApiPath("sales/opportunities")).toBe("/sales/opportunities");
    expect(normalizeApiPath("/sales/opportunities")).toBe("/sales/opportunities");
  });
  it("drops an inline query string", () => {
    expect(normalizeApiPath("/procurement/catalog?fields=id")).toBe("/procurement/catalog");
  });
});

describe("inlineQueryOf", () => {
  it("returns the query string when the path carries one", () => {
    expect(inlineQueryOf("/system/audittrail?type=Ticket&id=3873332")).toBe("type=Ticket&id=3873332");
  });
  it("returns empty for a clean path", () => {
    expect(inlineQueryOf("/system/audittrail")).toBe("");
  });
});

describe("extraQueryParams", () => {
  it("stringifies string/number/boolean values", () => {
    const r = extraQueryParams({ type: "Ticket", id: 3873332, includeInactive: true });
    expect(r).toEqual({ ok: true, query: { type: "Ticket", id: "3873332", includeInactive: "true" } });
  });
  it("accepts undefined/empty params", () => {
    expect(extraQueryParams(undefined)).toEqual({ ok: true, query: {} });
    expect(extraQueryParams({})).toEqual({ ok: true, query: {} });
  });
  it("rejects every reserved grammar key, naming the argument to use", () => {
    for (const [key, arg] of [
      ["conditions", "conditions"],
      ["childConditions", "child_conditions"],
      ["child_conditions", "child_conditions"],
      ["customFieldConditions", "custom_field_conditions"],
      ["fields", "fields"],
      ["orderBy", "order_by"],
      ["order_by", "order_by"],
      ["page", "page_number"],
      ["pageSize", "page_size"],
      ["page_size", "page_size"],
    ] as const) {
      const r = extraQueryParams({ [key]: "x" });
      expect(r.ok, key).toBe(false);
      if (!r.ok) {
        expect(r.error).toContain(`"${key}"`);
        expect(r.error).toContain(`"${arg}"`);
      }
    }
  });
  it("reserved-key check is case-insensitive", () => {
    expect(extraQueryParams({ PageSize: 5 }).ok).toBe(false);
    expect(extraQueryParams({ CONDITIONS: "x" }).ok).toBe(false);
  });
  it("keeps non-reserved keys untouched (values encode later via URLSearchParams)", () => {
    const r = extraQueryParams({ recordType: "Ticket", recordId: 2896828 });
    expect(r).toEqual({ ok: true, query: { recordType: "Ticket", recordId: "2896828" } });
  });
  it("values needing URL encoding survive the URLSearchParams round-trip the client uses", () => {
    const r = extraQueryParams({ note: 'a "quoted" [2026-07-01T00:00:00Z] value & more' });
    expect(r.ok).toBe(true);
    if (r.ok) {
      const url = new URL("https://x.example/apis/3.0/system/audittrail");
      for (const [k, v] of Object.entries(r.query)) url.searchParams.set(k, v);
      expect(url.searchParams.get("note")).toBe('a "quoted" [2026-07-01T00:00:00Z] value & more');
    }
  });
});

describe("findEndpoints", () => {
  it("ranks the right endpoint for a keyword query", () => {
    expect(findEndpoints("purchase orders", 3)[0]?.path).toBe("/procurement/purchaseorders");
    expect(findEndpoints("sales opportunities pipeline", 3)[0]?.path).toBe("/sales/opportunities");
  });
  it("matches on summary text, not just the path", () => {
    const paths = findEndpoints("unbilled billable time", 5).map((e) => e.path);
    expect(paths).toContain("/time/entries");
  });
  it("returns nothing for an empty/stopword-only query", () => {
    expect(findEndpoints("", 5)).toEqual([]);
    expect(findEndpoints("how do i get the", 5)).toEqual([]);
  });
  it("respects top_k", () => {
    expect(findEndpoints("ticket", 2).length).toBeLessThanOrEqual(2);
  });
});
