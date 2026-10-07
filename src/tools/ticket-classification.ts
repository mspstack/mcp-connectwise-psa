/**
 * Ticket classification (type → subType → item, team, source) and bundling.
 *
 * Classification is **board-scoped**: the same type name means different ids on
 * different boards, which is why these are passed as names or ids rather than
 * resolved once and cached. A name goes to CW as `{ name }` and CW resolves it
 * against the ticket's board; an id goes as `{ id }` and skips that.
 */

import type { Ticket } from "../cw/types.js";

/** A classification value may be given as a name or as an id. */
export type NameOrId = string | number;

/** CW reference object for a name-or-id, or undefined to leave the field alone. */
export function classificationRef(value: NameOrId | undefined): { id: number } | { name: string } | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "number") return { id: value };
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  // A numeric string is an id the caller typed as text — treat it as one.
  return /^\d+$/.test(trimmed) ? { id: Number(trimmed) } : { name: trimmed };
}

/** Fields `copy_classification_from` carries over, in CW's own spelling. */
export const COPIED_FIELDS = [
  "company",
  "contact",
  "type",
  "subType",
  "item",
  "team",
  "source",
  "priority",
] as const;

export type CopiedField = (typeof COPIED_FIELDS)[number];

/** `fields` list for reading a ticket we are about to copy classification from. */
export const CLASSIFICATION_FIELDS = `id,summary,board/id,board/name,${COPIED_FIELDS.map(
  (field) => `${field}/id,${field}/name`
).join(",")}`;

/**
 * Copy classification off an existing ticket, by id — ids are unambiguous, and
 * the source ticket has already resolved every board-scoped name. Fields the
 * source does not carry are left out rather than nulled.
 */
export function classificationFrom(ticket: Ticket): Partial<Record<CopiedField, { id: number }>> {
  const copied: Partial<Record<CopiedField, { id: number }>> = {};
  for (const field of COPIED_FIELDS) {
    const value = ticket[field] as { id?: number } | undefined;
    if (value?.id !== undefined) copied[field] = { id: value.id };
  }
  return copied;
}

export interface BundleCandidate {
  id: number;
  parentTicketId?: number | null;
}

export interface BundlePartition {
  eligible: number[];
  rejected: Array<{ id: number; reason: string }>;
}

/**
 * Decide which children can be attached. Re-parenting an already-bundled ticket
 * is the kind of change that is easy to make and tedious to undo (detaching is
 * UI-only), so an existing parent is a refusal, not an overwrite.
 */
export function partitionBundleCandidates(
  parentId: number,
  children: BundleCandidate[]
): BundlePartition {
  const eligible: number[] = [];
  const rejected: Array<{ id: number; reason: string }> = [];
  const seen = new Set<number>();

  for (const child of children) {
    if (child.id === parentId) {
      rejected.push({ id: child.id, reason: "it is the parent ticket" });
      continue;
    }
    if (seen.has(child.id)) {
      rejected.push({ id: child.id, reason: "listed twice" });
      continue;
    }
    seen.add(child.id);

    if (child.parentTicketId === parentId) {
      rejected.push({ id: child.id, reason: `already bundled under #${parentId}` });
      continue;
    }
    if (child.parentTicketId) {
      rejected.push({
        id: child.id,
        reason: `already bundled under #${child.parentTicketId} — detach it in the CW UI first`,
      });
      continue;
    }
    eligible.push(child.id);
  }

  return { eligible, rejected };
}
