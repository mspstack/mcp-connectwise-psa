import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_TOOLSETS,
  PRESETS,
  resolveToolsets,
  TOOLSET_KEYS,
  UnknownToolsetError,
  withoutDbToolsets,
} from "./toolsets.js";

const FALLBACK = DEFAULT_TOOLSETS;

describe("resolveToolsets", () => {
  it("falls back when the input is undefined, empty, or only separators", () => {
    expect(resolveToolsets(undefined, FALLBACK)).toEqual(FALLBACK);
    expect(resolveToolsets("", FALLBACK)).toEqual(FALLBACK);
    expect(resolveToolsets(" , , ", FALLBACK)).toEqual(FALLBACK);
  });

  it("keeps individual capability keys", () => {
    expect(resolveToolsets("tickets,finance", FALLBACK)).toEqual(["tickets", "finance"]);
  });

  it("expands presets", () => {
    expect(resolveToolsets("dispatch", FALLBACK)).toEqual(PRESETS.dispatch);
    expect(resolveToolsets("all", FALLBACK)).toEqual(PRESETS.all);
  });

  it("mixes presets and keys, deduping across them", () => {
    // tech = tickets,time,companies,configurations; + finance; + tickets (dupe)
    expect(resolveToolsets("tech,finance,tickets", FALLBACK)).toEqual([
      "tickets",
      "time",
      "companies",
      "configurations",
      "finance",
    ]);
  });

  it("is case- and whitespace-insensitive", () => {
    expect(resolveToolsets("  Dispatch , FINANCE ", FALLBACK)).toEqual([
      ...PRESETS.dispatch,
      "finance",
    ]);
  });

  it("throws on an unknown token by default (config/env)", () => {
    expect(() => resolveToolsets("tickets,bogus", FALLBACK)).toThrow(UnknownToolsetError);
  });

  it("warns and ignores unknown tokens in warn mode (request header)", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(resolveToolsets("tickets,bogus,finance", FALLBACK, "warn")).toEqual([
      "tickets",
      "finance",
    ]);
    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
  });

  it("falls back when a warn-mode list resolves to nothing", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(resolveToolsets("bogus,nonsense", FALLBACK, "warn")).toEqual(FALLBACK);
    spy.mockRestore();
  });
});

describe("the database toolset", () => {
  it("is part of all and of the default selection", () => {
    expect(PRESETS.all).toEqual([...TOOLSET_KEYS]);
    expect(DEFAULT_TOOLSETS).toEqual([...TOOLSET_KEYS]);
    expect(DEFAULT_TOOLSETS).toContain("sql");
  });

  it("resolves on its own and alongside other keys", () => {
    expect(resolveToolsets("sql", FALLBACK)).toEqual(["sql"]);
    expect(resolveToolsets("tech,sql", FALLBACK)).toEqual([...PRESETS.tech, "sql"]);
    expect(resolveToolsets("all,sql", FALLBACK)).toEqual([...TOOLSET_KEYS]);
  });

  it("stays out of the persona presets — a technician surface is not a database surface", () => {
    for (const name of ["tech", "dispatch", "invoicing"]) {
      expect(PRESETS[name], `preset "${name}"`).not.toContain("sql");
    }
  });
});

describe("withoutDbToolsets", () => {
  it("drops database-backed keys and preserves the rest in order", () => {
    expect(withoutDbToolsets(["tickets", "sql", "finance"])).toEqual(["tickets", "finance"]);
    expect(withoutDbToolsets(["tickets", "finance"])).toEqual(["tickets", "finance"]);
    expect(withoutDbToolsets(["sql"])).toEqual([]);
  });
});
