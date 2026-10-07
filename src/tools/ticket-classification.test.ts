import { describe, expect, it } from "vitest";
import type { Ticket } from "../cw/types.js";
import {
  CLASSIFICATION_FIELDS,
  classificationFrom,
  classificationRef,
  partitionBundleCandidates,
} from "./ticket-classification.js";

describe("classificationRef", () => {
  it("passes a name through for CW to resolve against the board", () => {
    expect(classificationRef("Automation")).toEqual({ name: "Automation" });
    expect(classificationRef("  Client Facing  ")).toEqual({ name: "Client Facing" });
  });

  it("uses an id when given one", () => {
    expect(classificationRef(46)).toEqual({ id: 46 });
    // A caller who types the id as text means the id, not a type literally named "46".
    expect(classificationRef("46")).toEqual({ id: 46 });
  });

  it("is undefined for nothing, so a spread leaves the field untouched", () => {
    expect(classificationRef(undefined)).toBeUndefined();
    expect(classificationRef("   ")).toBeUndefined();
  });
});

describe("classificationFrom", () => {
  const source = {
    id: 1,
    company: { id: 2, name: "Network Doctor" },
    contact: { id: 3, name: "Someone" },
    type: { id: 4, name: "Automation" },
    subType: { id: 5, name: "Rewst" },
    item: { id: 6, name: "Client Facing" },
    team: { id: 7, name: "CS DevOps Team" },
    source: { id: 8, name: "Internal" },
    priority: { id: 9, name: "P3 - Standard Request" },
  } as unknown as Ticket;

  it("copies every classification field by id", () => {
    expect(classificationFrom(source)).toEqual({
      company: { id: 2 },
      contact: { id: 3 },
      type: { id: 4 },
      subType: { id: 5 },
      item: { id: 6 },
      team: { id: 7 },
      source: { id: 8 },
      priority: { id: 9 },
    });
  });

  it("omits what the source does not carry rather than nulling it", () => {
    const sparse = { id: 1, type: { id: 4, name: "Automation" } } as unknown as Ticket;
    expect(classificationFrom(sparse)).toEqual({ type: { id: 4 } });
  });

  it("asks for every field it intends to copy", () => {
    for (const field of ["company", "contact", "type", "subType", "item", "team", "source", "priority"]) {
      expect(CLASSIFICATION_FIELDS).toContain(`${field}/id`);
    }
  });
});

describe("partitionBundleCandidates", () => {
  it("accepts unbundled children", () => {
    const result = partitionBundleCandidates(100, [
      { id: 1, parentTicketId: null },
      { id: 2 },
    ]);
    expect(result.eligible).toEqual([1, 2]);
    expect(result.rejected).toEqual([]);
  });

  it("refuses a child that already belongs to another parent", () => {
    const result = partitionBundleCandidates(100, [{ id: 1, parentTicketId: 99 }]);
    expect(result.eligible).toEqual([]);
    expect(result.rejected[0]?.reason).toMatch(/already bundled under #99/);
    expect(result.rejected[0]?.reason).toMatch(/CW UI/);
  });

  it("refuses one already under this parent, without calling it an error elsewhere", () => {
    const result = partitionBundleCandidates(100, [{ id: 1, parentTicketId: 100 }]);
    expect(result.eligible).toEqual([]);
    expect(result.rejected[0]?.reason).toBe("already bundled under #100");
  });

  it("refuses the parent itself", () => {
    const result = partitionBundleCandidates(100, [{ id: 100 }, { id: 5 }]);
    expect(result.eligible).toEqual([5]);
    expect(result.rejected[0]).toEqual({ id: 100, reason: "it is the parent ticket" });
  });

  it("deduplicates a repeated child", () => {
    const result = partitionBundleCandidates(100, [{ id: 7 }, { id: 7 }]);
    expect(result.eligible).toEqual([7]);
    expect(result.rejected[0]).toEqual({ id: 7, reason: "listed twice" });
  });
});
