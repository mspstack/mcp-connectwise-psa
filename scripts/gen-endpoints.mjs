#!/usr/bin/env node
/**
 * Generate src/reference/cw-endpoints.ts (the cw_find_endpoint corpus) from a
 * ConnectWise Manage OpenAPI spec.
 *
 * CW doesn't publish the spec through the API, so the source lives locally
 * (gitignored) and this generator is run by hand when the spec updates:
 *
 *   node scripts/gen-endpoints.mjs [path-to-openapi.json]   (default: .claude/All-endpoints.json)
 *
 * The generated file is committed; the OpenAPI source is not.
 */
import { readFileSync, writeFileSync } from "node:fs";

const SRC = process.argv[2] ?? ".claude/All-endpoints.json";
const OUT = "src/reference/cw-endpoints.ts";
const METHODS = ["get", "post", "patch", "put", "delete"];

// Hand annotations for the high-value endpoints: richer summary + filter/field
// hints + the curated tool that wraps them. Overrides the auto summary so
// lexical search stays strong on the endpoints people actually use.
const ENRICH = {
  "/system/audittrail": { summary: "Audit trail of ONE record — who changed what, when. Requires its own query params via cw_get's params argument: {\"type\":…,\"id\":…}.", keyParams: "params={\"type\":\"Ticket\",\"id\":123} — types (v2025.1): Ticket, Company, Contact, Agreement, Invoice, Time (time entries), Expense, PurchaseOrder, Project, Opportunity, Configuration", notes: "Per-record only (no global/member-wide query). Nonexistent id → 400, not 404." },
  "/service/tickets": { summary: "Service tickets — search, get, create, update.", keyParams: "company/id, board/name, status/name, closedFlag, summary, contact/id", commonFields: "id,summary,status/name,board/name,company/name,priority/name,owner/identifier", coveredBy: "cw_search_tickets, cw_get_ticket, cw_create_ticket, cw_update_ticket" },
  "/service/tickets/{id}/notes": { summary: "Ticket notes (discussion / internal / resolution).", coveredBy: "cw_add_ticket_note, cw_get_ticket" },
  "/service/tickets/{id}/tasks": { summary: "Ticket task / checklist items.", coveredBy: "cw_list_ticket_tasks" },
  "/service/boards": { summary: "Service boards.", coveredBy: "cw_list_boards" },
  "/service/boards/{id}/statuses": { summary: "Statuses available on a board (per-board).", coveredBy: "cw_get_board" },
  "/service/boards/{id}/types": { summary: "Ticket types available on a board (per-board).", coveredBy: "cw_get_board" },
  "/service/priorities": { summary: "Ticket priorities.", coveredBy: "cw_list_priorities" },
  "/company/companies": { summary: "Companies (customers / vendors).", keyParams: "identifier, name, status/name, types/id", commonFields: "id,identifier,name,status/name,phoneNumber,website", coveredBy: "cw_search_companies, cw_get_company" },
  "/company/contacts": { summary: "Contacts.", keyParams: "company/id, firstName, lastName, inactiveFlag", commonFields: "id,firstName,lastName,title,company/name,communicationItems", coveredBy: "cw_search_contacts, cw_get_contact" },
  "/company/companies/{id}/sites": { summary: "A company's sites / addresses.", coveredBy: "cw_list_company_sites" },
  "/company/configurations": { summary: "Configurations (devices / assets): serials, IPs, OS, warranty.", keyParams: "company/id, type/name, status/name, name", commonFields: "id,name,type/name,status/name,company/name,serialNumber,ipAddress,osType", coveredBy: "cw_list_configurations, cw_get_configuration" },
  "/time/entries": { summary: "Time entries. Unbilled billable time = billableOption=\"Billable\" AND invoiceFlag=false.", keyParams: "chargeToId, chargeToType, member/identifier, company/id, billableOption, invoiceFlag", commonFields: "id,member/identifier,company/name,chargeToId,timeStart,actualHours,billableOption,notes", coveredBy: "cw_create_time_entry, cw_update_time_entry, cw_list_my_time, cw_list_ticket_time, cw_list_unbilled_time" },
  "/time/sheets": { summary: "Timesheets (per member, per period).", keyParams: "member/identifier, status", coveredBy: "cw_list_my_timesheets, cw_submit_timesheet" },
  "/time/sheets/{id}/submit": { summary: "Submit a timesheet for approval (Open sheets only).", coveredBy: "cw_submit_timesheet" },
  "/time/workRoles": { summary: "Work roles (used on time entries).", coveredBy: "cw_list_work_roles" },
  "/schedule/entries": { summary: "Schedule / dispatch entries. objectId = scheduled ticket id; type/identifier \"S\" = service ticket.", keyParams: "member/identifier, objectId, dateStart", commonFields: "id,objectId,name,member/identifier,type/identifier,status/name,dateStart,dateEnd,hours,doneFlag", coveredBy: "cw_list_schedule_entries, cw_my_schedule, cw_schedule_ticket, cw_update_schedule_entry, cw_delete_schedule_entry" },
  "/schedule/calendars": { summary: "Working-hours calendars (weekday start/end + holidayList); a member's calendar points here.", coveredBy: "cw_get_member" },
  "/finance/invoices": { summary: "Invoices.", keyParams: "company/id, status/name, date", commonFields: "id,invoiceNumber,status/name,company/name,date,dueDate,total,balance", coveredBy: "cw_list_invoices, cw_get_invoice" },
  "/finance/agreements": { summary: "Agreements (contracts): coverage, billing cycle, limits.", keyParams: "company/id, agreementStatus", commonFields: "id,name,type/name,company/name,agreementStatus,startDate,endDate,billAmount", coveredBy: "cw_list_agreements, cw_get_agreement" },
  "/procurement/purchaseorders": { summary: "Purchase orders.", keyParams: "vendorCompany/id, status/id", commonFields: "id,poNumber,status/name,vendorCompany/name,total,orderDate" },
  "/sales/opportunities": { summary: "Sales opportunities (pipeline).", keyParams: "company/id, stage/id, status/id", commonFields: "id,name,company/name,stage/name,status/name,expectedCloseDate" },
  "/project/projects": { summary: "Projects.", keyParams: "company/id, status/id", commonFields: "id,name,company/name,status/name,estimatedStart,estimatedEnd" },
  "/system/members": { summary: "Members (staff): timezone, calendar, capacity, dispatch flags.", keyParams: "identifier, inactiveFlag", commonFields: "id,identifier,firstName,lastName,timeZone/name,calendar/name,dailyCapacity,scheduleCapacity", coveredBy: "cw_list_members, cw_get_member" },
};

const spec = JSON.parse(readFileSync(SRC, "utf8"));
const skip = /\/(count|info)$/;

function cleanSummary(op) {
  let s = (op.summary || op.description || "").replace(/\s+/g, " ").trim();
  // "Get List of ConnectWise.Apis.v3_0.v2015_3.Service.Ticket.Ticket ..." → "... Ticket ..."
  s = s.replace(/ConnectWise\.Apis\.[A-Za-z0-9_.]*?\.([A-Za-z0-9_]+)/g, "$1");
  return s.slice(0, 180).trim();
}

const entries = [];
for (const [path, item] of Object.entries(spec.paths)) {
  if (skip.test(path)) continue;
  const ops = METHODS.filter((m) => item[m]);
  if (ops.length === 0) continue;
  const first = item[ops[0]];
  const module = first.tags?.[0] || path.split("/")[1] || "misc";
  const rich = ENRICH[path];
  entries.push({
    module,
    path,
    methods: ops.map((m) => m.toUpperCase()).join(", "),
    summary: rich?.summary || cleanSummary(first) || `${module} resource`,
    ...(rich?.coveredBy ? { coveredBy: rich.coveredBy } : {}),
    ...(rich?.keyParams ? { keyParams: rich.keyParams } : {}),
    ...(rich?.commonFields ? { commonFields: rich.commonFields } : {}),
  });
}
entries.sort((a, b) => a.path.localeCompare(b.path));

// Hand-authored query-grammar note, always first.
const grammar = {
  module: "query grammar",
  path: "(query params on any list endpoint)",
  methods: "GET",
  summary:
    "CW list queries: conditions (AND/OR; exact = for ids/names, 'contains' for text; dates as [2026-07-01T00:00:00Z]), " +
    "childConditions, orderBy ('field asc|desc'), fields (comma list — always pass this), page, pageSize (max 1000). " +
    "String values are single-quoted, e.g. status/name=\"New\".",
};

const header = `/**
 * Curated catalog of ConnectWise Manage REST endpoints, for cw_find_endpoint.
 *
 * GENERATED from a ConnectWise Manage OpenAPI spec (title "${spec.info?.title}", version ${spec.info?.version})
 * by scripts/gen-endpoints.mjs — DO NOT EDIT BY HAND. To refresh: obtain the
 * OpenAPI JSON and re-run the generator. \`coveredBy\` links to the curated tool
 * that already wraps an endpoint. /count and /info helper paths are dropped.
 */

export interface EndpointDoc {
  module: string;
  /** Path after \`/apis/3.0\`, e.g. "/procurement/purchaseorders". \`{id}\` marks a path param. */
  path: string;
  methods: string;
  summary: string;
  coveredBy?: string;
  /** Common condition/filter fields (hand-added for key endpoints). */
  keyParams?: string;
  /** Useful fields to request (hand-added for key endpoints). */
  commonFields?: string;
  notes?: string;
}

export const CW_ENDPOINTS: EndpointDoc[] = ${JSON.stringify([grammar, ...entries], null, 2)};
`;

writeFileSync(OUT, header);
console.log(`Wrote ${OUT}: ${entries.length} endpoints (+1 grammar note) from ${SRC}`);
