/** Time entry tools: log time against tickets, list my time. */

import { z } from "zod";
import type { ToolRegistrar } from "./registrar.js";
import { allOf, q, type CWClient } from "../cw/client.js";
import type { Timesheet, TimeEntry, WorkRole, WorkType } from "../cw/types.js";
import {
  clip,
  failure,
  json,
  pageFooter,
  pageNumberField,
  pageSizeField,
  responseFormatField,
  text,
  UNKNOWN_MEMBER_MESSAGE,
  type ToolResult,
} from "./shared.js";
import {
  CHARGE_TO_TYPES,
  resolveTicketKind,
  ticketKindField,
  type TicketKindArg,
} from "./ticket-kind.js";

const TIME_FIELDS =
  "id,chargeToId,chargeToType,member/identifier,member/name,company/name,timeStart,timeEnd,actualHours,billableOption,notes";

/** ConnectWise rejects fractional seconds — format as YYYY-MM-DDTHH:mm:ssZ. */
const cwTimestamp = (date: Date): string => date.toISOString().replace(/\.\d{3}Z$/, "Z");

export const hoursDeductField = z
  .number()
  .nonnegative()
  .max(24)
  .optional()
  .describe(
    "Break to subtract, in hours (CW's Deduct). Keep time_start/time_end the real span and put the break here — actual hours become span minus deduct"
  );

/**
 * A break only makes sense inside the span it is deducted from. Pure — exported
 * for tests.
 */
export function checkDeduct(
  spanHours: number,
  deduct: number | undefined
): { ok: true } | { ok: false; error: string } {
  if (deduct === undefined) return { ok: true };
  if (deduct >= spanHours) {
    return {
      ok: false,
      error: `hours_deduct (${deduct}h) must be less than the span (${spanHours.toFixed(2)}h) — otherwise nothing is left to bill.`,
    };
  }
  return { ok: true };
}

export function registerTimeTools(reg: ToolRegistrar, client: CWClient): void {
  reg.register(
    {
      name: "cw_create_time_entry",
      title: "Log ConnectWise Time Entry",
      description:
        "Log time against a ticket, service or project — the resource is detected from the id. Time is " +
        "attributed to the member whose API keys this session uses. Provide time_start plus either " +
        "time_end or hours. For a span containing a break, pass the REAL time_end and put the break in " +
        "hours_deduct; passing a shortened `hours` instead makes ConnectWise display an end time that " +
        "never happened. Work role and work type default to the ticket's unless given.",
      inputSchema: {
        ticket_id: z.number().int().positive().describe("Ticket to charge the time to"),
        time_start: z
          .string()
          .describe('Start time, ISO 8601 (e.g. "2026-07-04T14:00:00Z")'),
        time_end: z.string().optional().describe("End time, ISO 8601 (or use hours)"),
        hours: z.number().positive().max(24).optional().describe("Duration in hours (alternative to time_end)"),
        hours_deduct: hoursDeductField,
        notes: z.string().min(1).describe("Work performed"),
        billable: z.boolean().default(true).describe("Billable (default true)"),
        work_role: z
          .string()
          .optional()
          .describe("Work role name — decides the rate (see cw_list_work_roles; ticket default when omitted)"),
        work_type: z
          .string()
          .optional()
          .describe("Work type name (see cw_list_work_types; ticket default when omitted)"),
        ticket_type: ticketKindField,
        add_to_detail: z
          .boolean()
          .default(false)
          .describe("Also show the notes on the ticket as a discussion note (default false)"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args: {
      ticket_id: number;
      time_start: string;
      time_end?: string;
      hours?: number;
      hours_deduct?: number;
      notes: string;
      billable: boolean;
      work_role?: string;
      work_type?: string;
      ticket_type: TicketKindArg;
      add_to_detail: boolean;
    }) => {
      try {
        const start = new Date(args.time_start);
        if (Number.isNaN(start.getTime())) return { ...text("Error: time_start is not a valid ISO timestamp."), isError: true } as ToolResult;
        let end: Date | undefined;
        if (args.time_end) {
          end = new Date(args.time_end);
        } else if (args.hours !== undefined) {
          end = new Date(start.getTime() + args.hours * 3_600_000);
        }
        if (!end || Number.isNaN(end.getTime()) || end <= start) {
          return { ...text("Error: provide time_end after time_start, or a positive hours value."), isError: true } as ToolResult;
        }
        if (args.hours !== undefined && args.hours_deduct !== undefined) {
          return {
            ...text(
              "Error: hours and hours_deduct together are ambiguous — `hours` is already the net duration. " +
                "Pass the real time_end plus hours_deduct instead."
            ),
            isError: true,
          } as ToolResult;
        }
        const spanHours = (end.getTime() - start.getTime()) / 3_600_000;
        const deductCheck = checkDeduct(spanHours, args.hours_deduct);
        if (!deductCheck.ok) return { ...text(`Error: ${deductCheck.error}`), isError: true } as ToolResult;

        const kind = await resolveTicketKind(client, args.ticket_id, args.ticket_type);
        const body = {
          chargeToId: args.ticket_id,
          chargeToType: CHARGE_TO_TYPES[kind],
          timeStart: cwTimestamp(start),
          timeEnd: cwTimestamp(end),
          notes: args.notes,
          billableOption: args.billable ? "Billable" : "DoNotBill",
          addToDetailDescriptionFlag: args.add_to_detail,
          // Omitted, not nulled: a null would override the ticket's default.
          ...(args.hours_deduct !== undefined ? { hoursDeduct: args.hours_deduct } : {}),
          ...(args.work_role ? { workRole: { name: args.work_role } } : {}),
          ...(args.work_type ? { workType: { name: args.work_type } } : {}),
        };
        let entry = await client.post<TimeEntry>("/time/entries", body);

        // Some CW versions ignore hoursDeduct on create. Patch it rather than
        // silently leave the entry showing the full span as billed.
        if (args.hours_deduct !== undefined && (entry.hoursDeduct ?? 0) !== args.hours_deduct) {
          entry = await client.patch<TimeEntry>(`/time/entries/${entry.id}`, [
            { op: "replace", path: "hoursDeduct", value: args.hours_deduct },
          ]);
        }

        const hours = entry.actualHours ?? (spanHours - (args.hours_deduct ?? 0)).toFixed(2);
        const deductNote = args.hours_deduct ? ` (${args.hours_deduct}h deducted)` : "";
        return text(
          `Time entry ${entry.id} logged: ${hours}h${deductNote} on ${CHARGE_TO_TYPES[kind]} #${args.ticket_id} by ${entry.member?.name ?? entry.member?.identifier ?? "(session member)"} (${entry.billableOption ?? (args.billable ? "Billable" : "DoNotBill")})${entry.workRole?.name ? `, role: ${entry.workRole.name}` : ""}.`
        );
      } catch (error) {
        return failure(error);
      }
    }
  );

  reg.register(
    {
      name: "cw_update_time_entry",
      title: "Update ConnectWise Time Entry",
      description:
        "Edit an existing time entry — notes, start/end, break, billable flag, work role or work type. " +
        "Only provided fields change. Duration is set by time_start/time_end (hours are derived, not " +
        "edited directly); use hours_deduct for a break inside that span. " +
        "Governed by your ConnectWise security role (typically your own entries).",
      inputSchema: {
        entry_id: z.number().int().positive().describe("The time entry ID (from cw_list_my_time)"),
        notes: z.string().min(1).optional().describe("New work-performed notes"),
        time_start: z.string().optional().describe("New start time, ISO 8601"),
        time_end: z.string().optional().describe("New end time, ISO 8601 (changes the billed hours)"),
        hours_deduct: hoursDeductField,
        billable: z.boolean().optional().describe("Billable (true) or do-not-bill (false)"),
        work_role: z.string().optional().describe("Work role name — decides the rate (see cw_list_work_roles)"),
        work_type: z.string().optional().describe("Work type name (see cw_list_work_types)"),
        response_format: responseFormatField,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args: {
      entry_id: number;
      notes?: string;
      time_start?: string;
      time_end?: string;
      hours_deduct?: number;
      billable?: boolean;
      work_role?: string;
      work_type?: string;
      response_format: "markdown" | "json";
    }) => {
      try {
        let start: Date | undefined;
        let end: Date | undefined;
        if (args.time_start !== undefined) {
          start = new Date(args.time_start);
          if (Number.isNaN(start.getTime()))
            return { ...text("Error: time_start is not a valid ISO timestamp."), isError: true } as ToolResult;
        }
        if (args.time_end !== undefined) {
          end = new Date(args.time_end);
          if (Number.isNaN(end.getTime()))
            return { ...text("Error: time_end is not a valid ISO timestamp."), isError: true } as ToolResult;
        }
        if (start && end && end <= start)
          return { ...text("Error: time_end must be after time_start."), isError: true } as ToolResult;

        const ops: Array<{ op: string; path: string; value: unknown }> = [];
        if (args.notes !== undefined) ops.push({ op: "replace", path: "notes", value: args.notes });
        if (start) ops.push({ op: "replace", path: "timeStart", value: cwTimestamp(start) });
        if (end) ops.push({ op: "replace", path: "timeEnd", value: cwTimestamp(end) });
        if (args.hours_deduct !== undefined)
          ops.push({ op: "replace", path: "hoursDeduct", value: args.hours_deduct });
        if (args.billable !== undefined)
          ops.push({ op: "replace", path: "billableOption", value: args.billable ? "Billable" : "DoNotBill" });
        // workRole, not workType: these are different fields, and writing the
        // role into the type left the rate untouched while quietly reclassifying
        // the work.
        if (args.work_role !== undefined)
          ops.push({ op: "replace", path: "workRole", value: { name: args.work_role } });
        if (args.work_type !== undefined)
          ops.push({ op: "replace", path: "workType", value: { name: args.work_type } });
        if (ops.length === 0) return text("Nothing to update — provide at least one field to change.");

        const entry = await client.patch<TimeEntry>(`/time/entries/${args.entry_id}`, ops);
        if (args.response_format === "json") return text(json(entry));
        return text(
          `Time entry ${entry.id} updated — ${entry.actualHours ?? "?"}h | ${entry.billableOption ?? "?"} | ${entry.timeStart ?? "?"}${entry.notes ? ` — ${entry.notes.slice(0, 80)}` : ""}.`
        );
      } catch (error) {
        return failure(error);
      }
    }
  );

  reg.register(
    {
      name: "cw_list_my_time",
      title: "My ConnectWise Time Entries",
      description:
        "List time entries for the member this session acts as, newest first, optionally within a date range.",
      inputSchema: {
        date_from: z.string().optional().describe('Only entries starting on/after this date (e.g. "2026-07-01")'),
        date_to: z.string().optional().describe("Only entries starting before this date"),
        page_number: pageNumberField,
        page_size: pageSizeField,
        response_format: responseFormatField,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args: {
      date_from?: string;
      date_to?: string;
      page_number: number;
      page_size: number;
      response_format: "markdown" | "json";
    }) => {
      try {
        const memberId = await client.me();
        if (!memberId) return { ...text(UNKNOWN_MEMBER_MESSAGE), isError: true } as ToolResult;

        const page = await client.getList<TimeEntry>("/time/entries", {
          conditions: allOf(
            `member/identifier=${q(memberId)}`,
            args.date_from && `timeStart >= [${args.date_from}]`,
            args.date_to && `timeStart < [${args.date_to}]`
          ),
          orderBy: "timeStart desc",
          fields: TIME_FIELDS,
          page: args.page_number,
          pageSize: args.page_size,
        });

        if (page.items.length === 0) return text(`No time entries found for ${memberId}.`);
        if (args.response_format === "json") return text(clip(json(page)));

        let total = 0;
        const lines = [`# Time entries for ${memberId}`, ""];
        for (const entry of page.items) {
          total += entry.actualHours ?? 0;
          lines.push(
            `- ${entry.timeStart ?? "?"} — ${entry.actualHours ?? "?"}h — ${entry.chargeToType ?? ""} ${entry.chargeToId ?? ""} (${entry.company?.name ?? "?"}) ${entry.billableOption ?? ""}`,
            `  ${(entry.notes ?? "").split("\n")[0] ?? ""}`
          );
        }
        lines.push("", `**Total on this page:** ${total.toFixed(2)}h`, pageFooter(page.page, page.hasMore));
        return text(clip(lines.join("\n")));
      } catch (error) {
        return failure(error);
      }
    }
  );

  reg.register(
    {
      name: "cw_list_work_roles",
      title: "List ConnectWise Work Roles",
      description: "List work roles (used when logging time). Excludes inactive by default.",
      inputSchema: {
        name_contains: z.string().optional().describe("Filter by work role name (substring)"),
        include_inactive: z.boolean().default(false).describe("Include inactive roles (default false)"),
        response_format: responseFormatField,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args: { name_contains?: string; include_inactive: boolean; response_format: "markdown" | "json" }) => {
      try {
        const page = await client.getList<WorkRole>("/time/workRoles", {
          conditions: allOf(
            !args.include_inactive && "inactiveFlag=false",
            args.name_contains && `name contains ${q(args.name_contains)}`
          ),
          orderBy: "name asc",
          fields: "id,name,hourlyRate,inactiveFlag",
          pageSize: 200,
        });
        if (page.items.length === 0) return text("No work roles found.");
        if (args.response_format === "json") return text(clip(json(page.items)));
        const lines = ["# Work roles", ""];
        for (const w of page.items) lines.push(`- ${w.name}${w.inactiveFlag ? " (inactive)" : ""}`);
        return text(clip(lines.join("\n")));
      } catch (error) {
        return failure(error);
      }
    }
  );

  reg.register(
    {
      name: "cw_list_work_types",
      title: "List ConnectWise Work Types",
      description:
        "List work types (how time is classified — Remote, Onsite, …), for the work_type argument of " +
        "cw_create_time_entry. Excludes inactive by default.",
      inputSchema: {
        name_contains: z.string().optional().describe("Filter by work type name (substring)"),
        include_inactive: z.boolean().default(false).describe("Include inactive types (default false)"),
        response_format: responseFormatField,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args: { name_contains?: string; include_inactive: boolean; response_format: "markdown" | "json" }) => {
      try {
        const page = await client.getList<WorkType>("/time/workTypes", {
          conditions: allOf(
            !args.include_inactive && "inactiveFlag=false",
            args.name_contains && `name contains ${q(args.name_contains)}`
          ),
          orderBy: "name asc",
          fields: "id,name,billTime,inactiveFlag",
          pageSize: 200,
        });
        if (page.items.length === 0) return text("No work types found.");
        if (args.response_format === "json") return text(clip(json(page.items)));
        const lines = ["# Work types", ""];
        for (const w of page.items)
          lines.push(
            `- ${w.name}${w.billTime ? ` — bills as ${w.billTime}` : ""}${w.inactiveFlag ? " (inactive)" : ""}`
          );
        return text(clip(lines.join("\n")));
      } catch (error) {
        return failure(error);
      }
    }
  );

  reg.register(
    {
      name: "cw_list_my_timesheets",
      title: "List My ConnectWise Timesheets",
      description:
        "List timesheets for the member this session acts as, newest first, with their status " +
        "(Open, Submitted, Approved…). Use the id with cw_submit_timesheet.",
      inputSchema: {
        page_number: pageNumberField,
        page_size: pageSizeField,
        response_format: responseFormatField,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args: { page_number: number; page_size: number; response_format: "markdown" | "json" }) => {
      try {
        const memberId = await client.me();
        if (!memberId) return { ...text(UNKNOWN_MEMBER_MESSAGE), isError: true } as ToolResult;
        const page = await client.getList<Timesheet>("/time/sheets", {
          conditions: `member/identifier=${q(memberId)}`,
          orderBy: "dateStart desc",
          fields: "id,year,period,dateStart,dateEnd,status,hours",
          page: args.page_number,
          pageSize: args.page_size,
        });
        if (page.items.length === 0) return text(`No timesheets for ${memberId}.`);
        if (args.response_format === "json") return text(clip(json(page)));
        const lines = [`# Timesheets for ${memberId} (${page.items.length})`, ""];
        for (const s of page.items)
          lines.push(
            `- #${s.id} | ${s.dateStart?.slice(0, 10) ?? "?"} → ${s.dateEnd?.slice(0, 10) ?? "?"} | ${s.hours ?? 0}h | **${s.status ?? "?"}**`
          );
        lines.push("", pageFooter(page.page, page.hasMore));
        return text(clip(lines.join("\n")));
      } catch (error) {
        return failure(error);
      }
    }
  );

  reg.register(
    {
      name: "cw_submit_timesheet",
      title: "Submit ConnectWise Timesheet",
      description:
        "Submit a timesheet for approval. Get the timesheet id from cw_list_my_timesheets; " +
        "only Open timesheets can be submitted.",
      inputSchema: {
        timesheet_id: z.number().int().positive().describe("The timesheet ID (from cw_list_my_timesheets)"),
        response_format: responseFormatField,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args: { timesheet_id: number; response_format: "markdown" | "json" }) => {
      try {
        const sheet = await client.post<Timesheet>(`/time/sheets/${args.timesheet_id}/submit`, {});
        if (args.response_format === "json") return text(json(sheet));
        return text(
          `Timesheet #${args.timesheet_id} submitted${sheet?.status ? ` — status: ${sheet.status}` : ""}.`
        );
      } catch (error) {
        return failure(error);
      }
    }
  );
}
