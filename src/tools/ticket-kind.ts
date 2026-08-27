/**
 * Service tickets vs project tickets.
 *
 * ConnectWise splits them across two REST resources — `/service/tickets` and
 * `/project/tickets` — even though both are the same physical record, and time
 * entries against them carry a different `chargeToType`. A tool that assumes
 * "ticket" means "service ticket" silently hides project work and, worse, would
 * charge time to the wrong record type.
 *
 * Ids are unique across both, so a caller who has a number does not know (and
 * should not have to know) which resource it lives under. `resolveTicketKind`
 * finds out with a cheap lookup; every tool takes an explicit override for when
 * the caller does know, which skips the extra round trip.
 */

import { z } from "zod";
import { CWApiError, type CWClient } from "../cw/client.js";

export type TicketKind = "service" | "project";
/** What a caller may ask for on a by-id tool. */
export type TicketKindArg = TicketKind | "auto";
/** What a caller may ask for on a list tool. */
export type TicketScope = TicketKind | "both";

export const TICKET_PATHS: Record<TicketKind, string> = {
  service: "/service/tickets",
  project: "/project/tickets",
};

/** `chargeToType` for a time entry against a ticket of this kind. */
export const CHARGE_TO_TYPES: Record<TicketKind, string> = {
  service: "ServiceTicket",
  project: "ProjectTicket",
};

/** The resources a list tool should query for a given scope, in order. */
export function kindsInScope(scope: TicketScope): TicketKind[] {
  return scope === "both" ? ["service", "project"] : [scope];
}

export const ticketScopeField = z
  .enum(["both", "service", "project"])
  .default("both")
  .describe("Which tickets to include: service, project, or both (default both)");

export const ticketKindField = z
  .enum(["auto", "service", "project"])
  .default("auto")
  .describe(
    "Which resource the ticket lives under. Leave as auto to detect it (costs one extra lookup)"
  );

export function ticketPath(kind: TicketKind, id?: number, suffix?: string): string {
  const base = TICKET_PATHS[kind];
  if (id === undefined) return base;
  return suffix ? `${base}/${id}/${suffix}` : `${base}/${id}`;
}

function isNotFound(error: unknown): boolean {
  return error instanceof CWApiError && error.status === 404;
}

/**
 * Work out which resource a ticket id belongs to. Tries service first — the
 * common case — and falls back to project on a 404. A non-404 failure is the
 * caller's problem (auth, rate limit) and is rethrown as-is.
 */
export async function resolveTicketKind(
  client: CWClient,
  ticketId: number,
  hint: TicketKindArg = "auto"
): Promise<TicketKind> {
  if (hint !== "auto") return hint;

  try {
    await client.getOne(`${TICKET_PATHS.service}/${ticketId}`, "id");
    return "service";
  } catch (error) {
    if (!isNotFound(error)) throw error;
  }

  await client.getOne(`${TICKET_PATHS.project}/${ticketId}`, "id");
  return "project";
}

/**
 * Merge pages from several resources into one list, newest id first.
 *
 * Paging across two resources cannot be exact — each has its own page numbering
 * — so a page here means "page N of each source, merged". `hasMore` is true when
 * any source has more, which is what a caller needs to decide whether to ask for
 * the next page. Pure, so the ordering rule is testable.
 */
export interface CrossKindResult<T> {
  items: T[];
  hasMore: boolean;
  /** Resources that failed, when at least one other succeeded. */
  failed: Array<{ kind: TicketKind; error: unknown }>;
}

/**
 * Query every resource in scope and merge the results.
 *
 * One resource failing does not fail the tool: a security role can allow service
 * tickets and refuse project tickets, and a partial answer plus a note about
 * what was skipped is more useful than an error. If *everything* fails, the
 * first error is thrown so the normal error path reports it.
 */
export async function listAcrossKinds<T extends { id?: number }>(
  scope: TicketScope,
  fetchOne: (kind: TicketKind) => Promise<{ items: T[]; hasMore: boolean }>,
  limit?: number
): Promise<CrossKindResult<T>> {
  const kinds = kindsInScope(scope);
  const settled = await Promise.allSettled(kinds.map((kind) => fetchOne(kind)));

  const pages: Array<{ items: T[]; hasMore: boolean }> = [];
  const failed: Array<{ kind: TicketKind; error: unknown }> = [];
  settled.forEach((result, index) => {
    if (result.status === "fulfilled") pages.push(result.value);
    else failed.push({ kind: kinds[index] as TicketKind, error: result.reason });
  });

  if (pages.length === 0) throw failed[0]?.error ?? new Error("No ticket resource could be queried.");

  return { ...mergeById(pages, limit), failed };
}

export function mergeById<T extends { id?: number }>(
  pages: Array<{ items: T[]; hasMore: boolean }>,
  limit?: number
): { items: T[]; hasMore: boolean } {
  const items = pages
    .flatMap((page) => page.items)
    .sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
  const capped = limit === undefined ? items : items.slice(0, limit);
  return {
    items: capped,
    hasMore: pages.some((page) => page.hasMore) || capped.length < items.length,
  };
}
