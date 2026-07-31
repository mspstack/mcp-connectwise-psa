/**
 * Advanced (opt-in) toolset — an escape hatch for the long tail of the
 * ConnectWise API that the curated tools don't wrap.
 *
 *  - cw_find_endpoint: lexical search over a curated endpoint catalog.
 *  - cw_get: read-only GET passthrough for any endpoint.
 *
 * Not part of the tech/dispatch/invoicing presets — enable with
 * `x-cw-toolsets: advanced` (or `all`). Read-only for now.
 */

import { z } from "zod";
import type { ToolRegistrar } from "./registrar.js";
import type { CWClient } from "../cw/client.js";
import { CW_ENDPOINTS, type EndpointDoc } from "../reference/cw-endpoints.js";
import {
  clip,
  failure,
  json,
  pageNumberField,
  pageSizeField,
  responseFormatField,
  text,
} from "./shared.js";

/** Normalize a user/model-supplied path to what goes after `/apis/3.0`. */
export function normalizeApiPath(raw: string): string {
  let s = raw.trim().replace(/^https?:\/\/[^/]+/i, "");
  const marker = "/apis/3.0";
  const i = s.indexOf(marker);
  if (i >= 0) s = s.slice(i + marker.length);
  s = s.split("?")[0] ?? s; // drop any inline query — use the structured params
  if (!s.startsWith("/")) s = `/${s}`;
  return s;
}

/** The inline query string of a raw path, when one was supplied ("" if none). */
export function inlineQueryOf(raw: string): string {
  const i = raw.indexOf("?");
  return i >= 0 ? raw.slice(i + 1) : "";
}

/**
 * Query keys owned by cw_get's own arguments (CW's list-query grammar plus the
 * tool-level knobs), in every spelling a caller may plausibly use. Rejected in
 * `params` so a value is never expressible two ways (issue #4).
 */
const RESERVED_PARAM_KEYS = new Map<string, string>([
  ["conditions", "conditions"],
  ["childconditions", "child_conditions"],
  ["child_conditions", "child_conditions"],
  ["customfieldconditions", "custom_field_conditions"],
  ["custom_field_conditions", "custom_field_conditions"],
  ["fields", "fields"],
  ["orderby", "order_by"],
  ["order_by", "order_by"],
  ["page", "page_number"],
  ["page_number", "page_number"],
  ["pagesize", "page_size"],
  ["page_size", "page_size"],
  ["response_format", "response_format"],
]);

export type ExtraParamsResult =
  | { ok: true; query: Record<string, string> }
  | { ok: false; error: string };

/**
 * Validate + stringify caller-supplied extra query parameters (for endpoints
 * with their own query grammar, e.g. /system/audittrail?type=&id=). Reserved
 * keys are rejected with the name of the argument to use instead — never
 * silently overridden. Pure — exported for tests.
 */
export function extraQueryParams(
  params: Record<string, string | number | boolean> | undefined
): ExtraParamsResult {
  const query: Record<string, string> = {};
  for (const [key, value] of Object.entries(params ?? {})) {
    const ownArg = RESERVED_PARAM_KEYS.get(key.toLowerCase());
    if (ownArg) {
      return {
        ok: false,
        error: `params key "${key}" conflicts with the tool's own "${ownArg}" argument — pass it there instead of in params.`,
      };
    }
    query[key] = String(value);
  }
  return { ok: true, query };
}

const STOP = new Set(["the", "a", "an", "of", "for", "to", "and", "or", "in", "on", "by", "with", "how", "do", "i", "get", "list", "all", "cw"]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

/** Lexical relevance score of an endpoint for a set of query tokens. */
function scoreEndpoint(doc: EndpointDoc, tokens: string[]): number {
  const strong = `${doc.path} ${doc.summary}`.toLowerCase();
  const medium = `${doc.module} ${doc.keyParams ?? ""} ${doc.commonFields ?? ""}`.toLowerCase();
  const weak = `${doc.notes ?? ""} ${doc.coveredBy ?? ""}`.toLowerCase();
  let score = 0;
  for (const t of tokens) {
    if (strong.includes(t)) score += 3;
    else if (medium.includes(t)) score += 2;
    else if (weak.includes(t)) score += 1;
  }
  return score;
}

/** Rank the catalog for a query. Pure — exported for tests. */
export function findEndpoints(query: string, topK = 5): EndpointDoc[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];
  return CW_ENDPOINTS.map((doc) => ({ doc, score: scoreEndpoint(doc, tokens) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((r) => r.doc);
}

function endpointBlock(d: EndpointDoc): string {
  const lines = [`### ${d.path}  \`${d.methods}\`  _(${d.module})_`, d.summary];
  if (d.keyParams) lines.push(`- **Filters**: ${d.keyParams}`);
  if (d.commonFields) lines.push(`- **Fields**: ${d.commonFields}`);
  if (d.coveredBy) lines.push(`- **Prefer the curated tool(s)**: ${d.coveredBy}`);
  if (d.notes) lines.push(`- _${d.notes}_`);
  return lines.join("\n");
}

export function registerAdvancedTools(reg: ToolRegistrar, client: CWClient): void {
  reg.register(
    {
      name: "cw_find_endpoint",
      title: "Find a ConnectWise API Endpoint",
      description:
        "Discover which ConnectWise REST endpoint (and its filter fields) fits a task — search a curated " +
        "catalog by keywords. Use the result with cw_get, or prefer the named curated tool when one exists.",
      inputSchema: {
        query: z.string().min(1).describe('What you want to do (e.g. "purchase orders", "unbilled time")'),
        top_k: z.number().int().positive().max(20).default(5).describe("How many endpoints to return"),
        response_format: responseFormatField,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args: { query: string; top_k: number; response_format: "markdown" | "json" }) => {
      const hits = findEndpoints(args.query, args.top_k);
      if (hits.length === 0) return text(`No endpoint matched "${args.query}". Try broader keywords (module or resource name).`);
      if (args.response_format === "json") return text(clip(json(hits)));
      const lines = [`# Endpoints for "${args.query}"`, "", ...hits.map(endpointBlock), "", "Call one with **cw_get** (read-only), passing `fields` to keep the response small."];
      return text(clip(lines.join("\n\n")));
    }
  );

  reg.register(
    {
      name: "cw_get",
      title: "Call any ConnectWise GET Endpoint",
      description:
        "Read-only GET for any ConnectWise REST path (the part after /apis/3.0, e.g. /procurement/purchaseorders). " +
        "ALWAYS pass fields (CW records are huge). Filter with conditions (CW grammar: exact = for ids/names, " +
        "'contains' for text, dates as [2026-07-01T00:00:00Z]); filter on child collections (e.g. a company's " +
        "types) with child_conditions; sort with order_by. Endpoints with their OWN query parameters (e.g. " +
        '/system/audittrail needs type+id, /system/documents needs recordType+recordId) take them via params: {"type":"Ticket","id":123}. ' +
        "Discover paths with cw_find_endpoint.",
      inputSchema: {
        path: z.string().min(1).describe('Endpoint path after /apis/3.0, e.g. "/sales/opportunities" or "/procurement/catalog/741"'),
        fields: z.string().optional().describe("Comma-separated fields to return (strongly recommended)"),
        conditions: z.string().optional().describe('CW conditions, e.g. status/name="Open" AND company/id=42'),
        child_conditions: z
          .string()
          .optional()
          .describe('Filter on child-collection fields (CW rejects these in conditions), e.g. types/id=46 or types/name="MS Agreement"'),
        custom_field_conditions: z.string().optional().describe("Filter on custom fields, e.g. caption='Region' AND value='EU'"),
        order_by: z.string().optional().describe('Sort, e.g. "dateEntered desc"'),
        params: z
          .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
          .optional()
          .describe(
            'Extra query-string parameters for endpoints with their own grammar, e.g. {"type":"Ticket","id":3873332} ' +
              "for /system/audittrail. Keys already covered by the arguments above (conditions/fields/orderBy/page/pageSize…) are rejected."
          ),
        page_number: pageNumberField,
        page_size: pageSizeField,
        response_format: responseFormatField,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args: {
      path: string;
      fields?: string;
      conditions?: string;
      child_conditions?: string;
      custom_field_conditions?: string;
      order_by?: string;
      params?: Record<string, string | number | boolean>;
      page_number: number;
      page_size: number;
      response_format: "markdown" | "json";
    }) => {
      try {
        // A query string on the path used to be dropped silently — the exact
        // confusion issue #4 documents. Point at `params` instead.
        const inline = inlineQueryOf(args.path);
        if (inline) {
          return text(
            `Error: query string on path ("?${inline}") is not sent — pass those as the params argument, ` +
              `e.g. params={"type":"Ticket","id":123}.`
          );
        }
        const extra = extraQueryParams(args.params);
        if (!extra.ok) return text(`Error: ${extra.error}`);
        const path = normalizeApiPath(args.path);
        const result = await client.rawGet(path, {
          conditions: args.conditions,
          childConditions: args.child_conditions,
          customFieldConditions: args.custom_field_conditions,
          fields: args.fields,
          orderBy: args.order_by,
          page: args.page_number,
          pageSize: args.page_size,
          // After the grammar keys (deterministic order); reserved keys were
          // rejected above, so nothing here can shadow them.
          ...extra.query,
        });
        const count = Array.isArray(result) ? `${result.length} record(s)` : "1 record";
        return text(clip(`GET ${path} — ${count}\n\n${json(result)}`, "Narrow with fields/conditions, or page through with page_number."));
      } catch (error) {
        return failure(error);
      }
    }
  );
}
