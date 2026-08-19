/** Shared zod fragments and result helpers for tool implementations. */

import { z } from "zod";
import { describeError } from "../cw/client.js";

/** Hard cap on tool response size, to protect the model's context window. */
export const RESPONSE_CHAR_LIMIT = 25_000;

export const responseFormatField = z
  .enum(["markdown", "json"])
  .default("markdown")
  .describe("Output format: human-readable markdown (default) or structured JSON");

export const pageNumberField = z
  .number()
  .int()
  .positive()
  .default(1)
  .describe("Page number (default 1)");

export const pageSizeField = z
  .number()
  .int()
  .positive()
  .max(1000)
  .default(25)
  .describe("Results per page (default 25, max 1000)");

export interface ToolResult {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

export function text(value: string): ToolResult {
  return { content: [{ type: "text", text: value }] };
}

/**
 * An error result. `describe` defaults to the ConnectWise REST mapping; the
 * database tools pass their own, since a driver error has no HTTP status.
 */
export function failure(
  error: unknown,
  describe: (error: unknown) => string = describeError
): ToolResult {
  return { content: [{ type: "text", text: describe(error) }], isError: true };
}

export function json(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function clip(value: string, hint?: string): string {
  if (value.length <= RESPONSE_CHAR_LIMIT) return value;
  const note = hint ?? "Use pagination or filters to narrow the result.";
  return (
    value.slice(0, RESPONSE_CHAR_LIMIT) +
    `\n\n---\n[Truncated at ${RESPONSE_CHAR_LIMIT.toLocaleString()} characters. ${note}]`
  );
}

export function pageFooter(page: number, hasMore: boolean): string {
  const lines = ["---", `Page ${page}`];
  if (hasMore) lines.push(`More available — request page_number: ${page + 1}`);
  return lines.join("\n");
}

/** Message returned when a "my …" tool cannot determine the acting member. */
export const UNKNOWN_MEMBER_MESSAGE =
  "Error: cannot determine which ConnectWise member this session acts as. " +
  "Provide the member identifier: the x-cw-member-id header (with your own API keys) " +
  "or the CW_MEMBER_IDENTIFIER environment variable (server-wide keys).";
