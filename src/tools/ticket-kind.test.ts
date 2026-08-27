import { describe, expect, it, vi } from "vitest";
import { CWApiError, type CWClient } from "../cw/client.js";
import {
  CHARGE_TO_TYPES,
  kindsInScope,
  listAcrossKinds,
  mergeById,
  resolveTicketKind,
  TICKET_PATHS,
  ticketPath,
} from "./ticket-kind.js";

describe("paths and charge types", () => {
  it("maps each kind to its resource and chargeToType", () => {
    expect(TICKET_PATHS).toEqual({ service: "/service/tickets", project: "/project/tickets" });
    expect(CHARGE_TO_TYPES).toEqual({ service: "ServiceTicket", project: "ProjectTicket" });
  });

  it("builds ids and sub-resources", () => {
    expect(ticketPath("service")).toBe("/service/tickets");
    expect(ticketPath("project", 42)).toBe("/project/tickets/42");
    expect(ticketPath("project", 42, "notes")).toBe("/project/tickets/42/notes");
    expect(ticketPath("service", 7, "tasks")).toBe("/service/tickets/7/tasks");
  });

  it("expands a scope to the resources to query", () => {
    expect(kindsInScope("both")).toEqual(["service", "project"]);
    expect(kindsInScope("service")).toEqual(["service"]);
    expect(kindsInScope("project")).toEqual(["project"]);
  });
});

/** Minimal CWClient stand-in — only getOne is used by resolveTicketKind. */
function fakeClient(getOne: (path: string) => Promise<unknown>): CWClient {
  return { getOne: vi.fn(getOne) } as unknown as CWClient;
}

const notFound = () => new CWApiError("Not found", 404);

describe("resolveTicketKind", () => {
  it("honours an explicit kind without any lookup", async () => {
    const client = fakeClient(() => Promise.reject(new Error("should not be called")));
    await expect(resolveTicketKind(client, 1, "project")).resolves.toBe("project");
    await expect(resolveTicketKind(client, 1, "service")).resolves.toBe("service");
    expect(client.getOne).not.toHaveBeenCalled();
  });

  it("finds a service ticket on the first try", async () => {
    const client = fakeClient(() => Promise.resolve({ id: 1 }));
    await expect(resolveTicketKind(client, 1)).resolves.toBe("service");
    expect(client.getOne).toHaveBeenCalledTimes(1);
    expect(client.getOne).toHaveBeenCalledWith("/service/tickets/1", "id");
  });

  it("falls back to the project resource on a 404", async () => {
    const client = fakeClient((path) =>
      path.startsWith("/service/") ? Promise.reject(notFound()) : Promise.resolve({ id: 2 })
    );
    await expect(resolveTicketKind(client, 2)).resolves.toBe("project");
    expect(client.getOne).toHaveBeenCalledTimes(2);
  });

  it("propagates an id that is neither", async () => {
    const client = fakeClient(() => Promise.reject(notFound()));
    await expect(resolveTicketKind(client, 3)).rejects.toBeInstanceOf(CWApiError);
  });

  it("does not treat a non-404 as 'try the other resource'", async () => {
    // A 403 on service tickets must surface, not silently query projects.
    const client = fakeClient(() => Promise.reject(new CWApiError("Denied", 403)));
    await expect(resolveTicketKind(client, 4)).rejects.toMatchObject({ status: 403 });
    expect(client.getOne).toHaveBeenCalledTimes(1);
  });
});

describe("mergeById", () => {
  it("interleaves sources newest id first", () => {
    const merged = mergeById([
      { items: [{ id: 10 }, { id: 4 }], hasMore: false },
      { items: [{ id: 7 }, { id: 1 }], hasMore: false },
    ]);
    expect(merged.items.map((i) => i.id)).toEqual([10, 7, 4, 1]);
    expect(merged.hasMore).toBe(false);
  });

  it("reports hasMore when any source has more", () => {
    expect(mergeById([{ items: [], hasMore: false }, { items: [], hasMore: true }]).hasMore).toBe(true);
  });

  it("caps to the limit and then says there is more", () => {
    const merged = mergeById(
      [
        { items: [{ id: 3 }, { id: 2 }], hasMore: false },
        { items: [{ id: 1 }], hasMore: false },
      ],
      2
    );
    expect(merged.items.map((i) => i.id)).toEqual([3, 2]);
    expect(merged.hasMore).toBe(true);
  });
});

describe("listAcrossKinds", () => {
  it("queries only the kinds in scope", async () => {
    const seen: string[] = [];
    await listAcrossKinds("service", (kind) => {
      seen.push(kind);
      return Promise.resolve({ items: [{ id: 1 }], hasMore: false });
    });
    expect(seen).toEqual(["service"]);
  });

  it("merges both resources", async () => {
    const result = await listAcrossKinds("both", (kind) =>
      Promise.resolve({
        items: kind === "service" ? [{ id: 5 }] : [{ id: 9 }],
        hasMore: false,
      })
    );
    expect(result.items.map((i) => i.id)).toEqual([9, 5]);
    expect(result.failed).toEqual([]);
  });

  it("returns a partial answer when one resource fails, naming the failure", async () => {
    const result = await listAcrossKinds("both", (kind) =>
      kind === "project"
        ? Promise.reject(new CWApiError("Permission denied", 403))
        : Promise.resolve({ items: [{ id: 5 }], hasMore: false })
    );
    expect(result.items.map((i) => i.id)).toEqual([5]);
    expect(result.failed).toHaveLength(1);
    expect(result.failed[0]?.kind).toBe("project");
  });

  it("throws when every resource fails", async () => {
    await expect(
      listAcrossKinds("both", () => Promise.reject(new CWApiError("Boom", 500)))
    ).rejects.toBeInstanceOf(CWApiError);
  });
});
