import { describe, expect, it } from "vitest";
import { checkDeduct } from "./time.js";

describe("checkDeduct", () => {
  it("accepts no deduct at all", () => {
    expect(checkDeduct(9, undefined)).toEqual({ ok: true });
  });

  it("accepts a break shorter than the span", () => {
    expect(checkDeduct(9, 2)).toEqual({ ok: true });
    expect(checkDeduct(9, 0)).toEqual({ ok: true });
    expect(checkDeduct(0.5, 0.25)).toEqual({ ok: true });
  });

  it("rejects a break that swallows the span", () => {
    // 9h span with a 9h break would bill nothing — a mistake, not an intent.
    const equal = checkDeduct(9, 9);
    expect(equal.ok).toBe(false);
    expect(equal.ok === false && equal.error).toMatch(/less than the span/);

    const longer = checkDeduct(2, 3);
    expect(longer.ok).toBe(false);
    expect(longer.ok === false && longer.error).toContain("3h");
  });

  it("reports the span it compared against", () => {
    const result = checkDeduct(1.5, 2);
    expect(result.ok === false && result.error).toContain("1.50h");
  });
});
