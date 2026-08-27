/**
 * Ticket tools: search, my tickets, get, create, update, notes.
 *
 * Covers both service and project tickets. ConnectWise keeps them on separate
 * REST resources, so the read tools query both by default and the by-id tools
 * detect which one an id belongs to — see ./ticket-kind.ts.
 */

import { z } from "zod";
import type { ToolRegistrar } from "./registrar.js";
import { allOf, q, type CWClient } from "../cw/client.js";
import type {
  Board,
  BoardStatus,
  BoardType,
  Priority,
  Ticket,
  TicketNote,
  TicketTask,
  TimeEntry,
} from "../cw/types.js";
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
  listAcrossKinds,
  resolveTicketKind,
  ticketKindField,
  ticketPath,
  ticketScopeField,
  type CrossKindResult,
  type TicketKindArg,
  type TicketScope,
} from "./ticket-kind.js";

// Deliberately the same list for both resources: every field here exists on the
// service and the project ticket model, and one unknown field fails the whole
// call. Project specifics (project, phase) come from cw_get_ticket.
const TICKET_LIST_FIELDS =
  "id,summary,recordType,status/name,company/name,board/name,priority/name,owner/identifier,resources,dateEntered,_info/lastUpdated";
const TICKET_DETAIL_FIELDS =
  "id,summary,recordType,board/name,status/name,priority/name,company/name,company/id,contact/name,owner/identifier,resources,closedFlag,dateEntered";
const NOTE_FIELDS =
  "id,text,detailDescriptionFlag,internalAnalysisFlag,resolutionFlag,member/name,contact/name,createdBy,dateCreated";

function ticketLine(t: Ticket): string {
  // recordType tells a project ticket from a service one — worth showing, since
  // it decides which tools and which chargeToType apply.
  const kind = t.recordType && t.recordType !== "ServiceTicket" ? ` _(${t.recordType})_` : "";
  const bits = [
    `#${t.id} ${t.summary ?? "(no summary)"}${kind}`,
    `  ${t.company?.name ?? "?"} | ${t.board?.name ?? "?"} | ${t.status?.name ?? "?"} | priority: ${t.priority?.name ?? "—"}`,
  ];
  const assigned = t.resources || t.owner?.identifier;
  if (assigned) bits.push(`  assigned: ${assigned}`);
  return bits.join("\n");
}

/** Note which resources were skipped, so a partial answer never looks complete. */
function skippedNote(failed: CrossKindResult<unknown>["failed"]): string[] {
  if (failed.length === 0) return [];
  return failed.map(
    ({ kind, error }) =>
      `> ${kind} tickets could not be listed (${error instanceof Error ? error.message : String(error)}) — results below are incomplete.`
  );
}

function ticketList(
  items: Ticket[],
  page: number,
  hasMore: boolean,
  failed: CrossKindResult<unknown>["failed"] = []
): string {
  const lines = [`# Tickets (${items.length} on this page)`, "", ...skippedNote(failed)];
  if (failed.length > 0) lines.push("");
  for (const t of items) lines.push(ticketLine(t), "");
  lines.push(pageFooter(page, hasMore));
  return lines.join("\n");
}

function noteBlock(n: TicketNote): string {
  const kind = n.internalAnalysisFlag ? "internal" : n.resolutionFlag ? "resolution" : "discussion";
  const author = n.member?.name ?? n.contact?.name ?? n.createdBy ?? "?";
  return [`— ${author} (${kind}) ${n.dateCreated ?? ""}`, n.text ?? "", ""].join("\n");
}

export function registerTicketTools(reg: ToolRegistrar, client: CWClient): void {
  reg.register(
    {
      name: "cw_search_tickets",
      title: "Search ConnectWise Tickets",
      description:
        "Search tickets by company, board, status, summary text, or assigned member. Covers SERVICE and " +
        "PROJECT tickets — ConnectWise keeps them apart, and ticket_type picks which. Defaults to open " +
        "tickets only. Returns ticket ids for use with cw_get_ticket / cw_add_ticket_note / cw_create_time_entry.",
      inputSchema: {
        ticket_type: ticketScopeField,
        company_id: z.number().int().positive().optional().describe("Filter by company ID"),
        company_name: z.string().optional().describe("Filter by exact company name"),
        board: z.string().optional().describe('Service board name (e.g. "Help Desk")'),
        status: z.string().optional().describe('Status name (e.g. "New", "In Progress")'),
        summary_contains: z.string().optional().describe("Text the ticket summary contains"),
        assigned_to: z.string().optional().describe("Member identifier assigned to the ticket"),
        open_only: z.boolean().default(true).describe("Only tickets that are not closed (default true)"),
        page_number: pageNumberField,
        page_size: pageSizeField,
        response_format: responseFormatField,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args: {
      ticket_type: TicketScope;
      company_id?: number;
      company_name?: string;
      board?: string;
      status?: string;
      summary_contains?: string;
      assigned_to?: string;
      open_only: boolean;
      page_number: number;
      page_size: number;
      response_format: "markdown" | "json";
    }) => {
      try {
        const conditions = allOf(
          args.open_only && "closedFlag=false",
          args.company_id !== undefined && `company/id=${args.company_id}`,
          args.company_name && `company/name=${q(args.company_name)}`,
          args.board && `board/name=${q(args.board)}`,
          args.status && `status/name=${q(args.status)}`,
          args.summary_contains && `summary contains ${q(args.summary_contains)}`,
          args.assigned_to &&
            `(resources contains ${q(args.assigned_to)} OR owner/identifier=${q(args.assigned_to)})`
        );
        const page = await listAcrossKinds<Ticket>(
          args.ticket_type,
          (kind) =>
            client.getList<Ticket>(ticketPath(kind), {
              conditions,
              orderBy: "id desc",
              fields: TICKET_LIST_FIELDS,
              page: args.page_number,
              pageSize: args.page_size,
            }),
          args.page_size
        );
        if (page.items.length === 0) return text("No tickets found.");
        if (args.response_format === "json") return text(clip(json(page)));
        return text(clip(ticketList(page.items, args.page_number, page.hasMore, page.failed)));
      } catch (error) {
        return failure(error);
      }
    }
  );

  reg.register(
    {
      name: "cw_my_tickets",
      title: "My ConnectWise Tickets",
      description:
        "List open tickets assigned to the member this session acts as (owner or listed in resources). " +
        "Includes project tickets as well as service tickets by default.",
      inputSchema: {
        ticket_type: ticketScopeField,
        page_number: pageNumberField,
        page_size: pageSizeField,
        response_format: responseFormatField,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args: {
      ticket_type: TicketScope;
      page_number: number;
      page_size: number;
      response_format: "markdown" | "json";
    }) => {
      try {
        const memberId = await client.me();
        if (!memberId) return { ...text(UNKNOWN_MEMBER_MESSAGE), isError: true } as ToolResult;
        const conditions = allOf(
          "closedFlag=false",
          `(resources contains ${q(memberId)} OR owner/identifier=${q(memberId)})`
        );
        const page = await listAcrossKinds<Ticket>(
          args.ticket_type,
          (kind) =>
            client.getList<Ticket>(ticketPath(kind), {
              conditions,
              orderBy: "id desc",
              fields: TICKET_LIST_FIELDS,
              page: args.page_number,
              pageSize: args.page_size,
            }),
          args.page_size
        );
        if (page.items.length === 0) return text(`No open tickets assigned to ${memberId}.`);
        if (args.response_format === "json") return text(clip(json(page)));
        return text(
          clip(
            `Acting as **${memberId}**\n\n` +
              ticketList(page.items, args.page_number, page.hasMore, page.failed)
          )
        );
      } catch (error) {
        return failure(error);
      }
    }
  );

  reg.register(
    {
      name: "cw_get_ticket",
      title: "Get ConnectWise Ticket",
      description:
        "Get one ticket with its most recent notes (newest first). Works for service and project " +
        "tickets — the resource is detected from the id.",
      inputSchema: {
        ticket_id: z.number().int().positive().describe("The ticket ID"),
        note_count: z.number().int().positive().max(50).default(10).describe("How many recent notes to include"),
        ticket_type: ticketKindField,
        response_format: responseFormatField,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args: {
      ticket_id: number;
      note_count: number;
      ticket_type: TicketKindArg;
      response_format: "markdown" | "json";
    }) => {
      try {
        const kind = await resolveTicketKind(client, args.ticket_id, args.ticket_type);
        const ticket = await client.getOne<Ticket>(
          ticketPath(kind, args.ticket_id),
          TICKET_DETAIL_FIELDS
        );
        const notes = await client.getList<TicketNote>(ticketPath(kind, args.ticket_id, "notes"), {
          orderBy: "dateCreated desc",
          fields: NOTE_FIELDS,
          pageSize: args.note_count,
        });

        if (args.response_format === "json") {
          return text(clip(json({ ...ticket, notes: notes.items })));
        }

        const lines = [
          `# Ticket #${ticket.id}: ${ticket.summary ?? ""}`,
          "",
          `- **Type**: ${ticket.recordType ?? (kind === "project" ? "ProjectTicket" : "ServiceTicket")}`,
          `- **Company**: ${ticket.company?.name ?? "?"} (ID: ${ticket.company?.id ?? "?"})`,
          `- **Board**: ${ticket.board?.name ?? "?"} | **Status**: ${ticket.status?.name ?? "?"} | **Priority**: ${ticket.priority?.name ?? "—"}`,
          `- **Contact**: ${ticket.contact?.name ?? "—"}`,
          `- **Assigned**: ${ticket.resources || ticket.owner?.identifier || "—"}`,
          `- **Opened**: ${ticket.dateEntered ?? "?"} | **Closed**: ${ticket.closedFlag ? "yes" : "no"}`,
          "",
          `## Recent notes (${notes.items.length})`,
          "",
        ];
        for (const n of notes.items) lines.push(noteBlock(n));
        return text(clip(lines.join("\n"), "Request fewer notes or json format."));
      } catch (error) {
        return failure(error);
      }
    }
  );

  reg.register(
    {
      name: "cw_create_ticket",
      title: "Create ConnectWise Ticket",
      description:
        "Create a new SERVICE ticket on a board for a company. Project tickets cannot be created here — " +
        "they need a project and a phase.",
      inputSchema: {
        company_id: z.number().int().positive().describe("Company ID (find with cw_search_companies)"),
        board: z.string().describe('Service board name (e.g. "Help Desk")'),
        summary: z.string().min(1).max(100).describe("Ticket summary (max 100 chars)"),
        initial_description: z.string().optional().describe("Initial description note"),
        priority: z.string().optional().describe("Priority name (board default when omitted)"),
        status: z
          .string()
          .optional()
          .describe("Status name (board default when omitted; must exist on the board — see cw_get_board)"),
        response_format: responseFormatField,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args: {
      company_id: number;
      board: string;
      summary: string;
      initial_description?: string;
      priority?: string;
      status?: string;
      response_format: "markdown" | "json";
    }) => {
      try {
        const ticket = await client.post<Ticket>("/service/tickets", {
          summary: args.summary,
          company: { id: args.company_id },
          board: { name: args.board },
          ...(args.initial_description ? { initialDescription: args.initial_description } : {}),
          ...(args.priority ? { priority: { name: args.priority } } : {}),
          ...(args.status ? { status: { name: args.status } } : {}),
        });
        if (args.response_format === "json") return text(json(ticket));
        return text(
          `Ticket created: #${ticket.id} "${ticket.summary}" on ${ticket.board?.name ?? args.board} (status: ${ticket.status?.name ?? "?"}).`
        );
      } catch (error) {
        return failure(error);
      }
    }
  );

  reg.register(
    {
      name: "cw_update_ticket",
      title: "Update ConnectWise Ticket",
      description:
        "Update a ticket's status, priority, summary, or owner. Only provided fields change.",
      inputSchema: {
        ticket_id: z.number().int().positive().describe("The ticket ID to update"),
        status: z.string().optional().describe('New status name (must exist on the ticket\'s board)'),
        priority: z.string().optional().describe("New priority name"),
        summary: z.string().max(100).optional().describe("New summary"),
        owner_identifier: z.string().optional().describe("Member identifier to set as owner"),
        ticket_type: ticketKindField,
        response_format: responseFormatField,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args: {
      ticket_id: number;
      status?: string;
      priority?: string;
      summary?: string;
      owner_identifier?: string;
      ticket_type: TicketKindArg;
      response_format: "markdown" | "json";
    }) => {
      try {
        const ops: Array<{ op: string; path: string; value: unknown }> = [];
        if (args.status) ops.push({ op: "replace", path: "status", value: { name: args.status } });
        if (args.priority) ops.push({ op: "replace", path: "priority", value: { name: args.priority } });
        if (args.summary) ops.push({ op: "replace", path: "summary", value: args.summary });
        if (args.owner_identifier)
          ops.push({ op: "replace", path: "owner", value: { identifier: args.owner_identifier } });
        if (ops.length === 0) return text("Nothing to update — provide at least one field.");

        const kind = await resolveTicketKind(client, args.ticket_id, args.ticket_type);
        const ticket = await client.patch<Ticket>(ticketPath(kind, args.ticket_id), ops);
        if (args.response_format === "json") return text(json(ticket));
        return text(
          `Ticket #${ticket.id} updated — status: ${ticket.status?.name ?? "?"}, priority: ${ticket.priority?.name ?? "—"}, owner: ${ticket.owner?.identifier ?? "—"}.`
        );
      } catch (error) {
        return failure(error);
      }
    }
  );

  reg.register(
    {
      name: "cw_add_ticket_note",
      title: "Add ConnectWise Ticket Note",
      description:
        "Add a note to a ticket. Discussion notes are visible to the customer on portals/emails; " +
        "internal notes are not. Notes are attributed to the member whose API keys this session uses.",
      inputSchema: {
        ticket_id: z.number().int().positive().describe("The ticket ID"),
        note: z.string().min(1).describe("Note text (plain text)"),
        internal: z.boolean().default(false).describe("Internal analysis note instead of discussion (default false)"),
        resolution: z.boolean().default(false).describe("Mark as resolution note (default false)"),
        ticket_type: ticketKindField,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args: {
      ticket_id: number;
      note: string;
      internal: boolean;
      resolution: boolean;
      ticket_type: TicketKindArg;
    }) => {
      try {
        const kind = await resolveTicketKind(client, args.ticket_id, args.ticket_type);
        const created = await client.post<TicketNote>(ticketPath(kind, args.ticket_id, "notes"), {
          text: args.note,
          detailDescriptionFlag: !args.internal,
          internalAnalysisFlag: args.internal,
          resolutionFlag: args.resolution,
        });
        return text(
          `Note ${created.id} added to ticket #${args.ticket_id} (${args.internal ? "internal" : "discussion"}${args.resolution ? ", resolution" : ""}).`
        );
      } catch (error) {
        return failure(error);
      }
    }
  );

  reg.register(
    {
      name: "cw_list_boards",
      title: "List ConnectWise Service Boards",
      description:
        "List service boards. Use to discover exact board names for cw_search_tickets / cw_create_ticket, " +
        "and board ids for cw_get_board (statuses and types).",
      inputSchema: {
        name_contains: z.string().optional().describe("Filter by board name (substring)"),
        include_inactive: z.boolean().default(false).describe("Include inactive boards (default false)"),
        page_number: pageNumberField,
        page_size: pageSizeField,
        response_format: responseFormatField,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args: {
      name_contains?: string;
      include_inactive: boolean;
      page_number: number;
      page_size: number;
      response_format: "markdown" | "json";
    }) => {
      try {
        const page = await client.getList<Board>("/service/boards", {
          conditions: allOf(
            !args.include_inactive && "inactiveFlag=false",
            args.name_contains && `name contains ${q(args.name_contains)}`
          ),
          orderBy: "name asc",
          fields: "id,name,inactiveFlag,department/name,location/name",
          page: args.page_number,
          pageSize: args.page_size,
        });
        if (page.items.length === 0) return text("No boards found.");
        if (args.response_format === "json") return text(clip(json(page)));
        const lines = [`# Service boards (${page.items.length})`, ""];
        for (const b of page.items)
          lines.push(`- #${b.id} **${b.name ?? "?"}**${b.inactiveFlag ? " (inactive)" : ""}`);
        lines.push("", pageFooter(page.page, page.hasMore));
        return text(clip(lines.join("\n")));
      } catch (error) {
        return failure(error);
      }
    }
  );

  reg.register(
    {
      name: "cw_get_board",
      title: "Get ConnectWise Board Statuses and Types",
      description:
        "List the statuses and types available on a service board — the exact names cw_update_ticket " +
        "and cw_create_ticket require. Get the board id from cw_list_boards.",
      inputSchema: {
        board_id: z.number().int().positive().describe("The board ID (from cw_list_boards)"),
        response_format: responseFormatField,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args: { board_id: number; response_format: "markdown" | "json" }) => {
      try {
        const [statuses, types] = await Promise.all([
          client.getList<BoardStatus>(`/service/boards/${args.board_id}/statuses`, {
            orderBy: "sortOrder asc",
            fields: "id,name,closedStatus,defaultFlag,inactive",
            pageSize: 200,
          }),
          client.getList<BoardType>(`/service/boards/${args.board_id}/types`, {
            orderBy: "name asc",
            fields: "id,name,defaultFlag,inactiveFlag",
            pageSize: 200,
          }),
        ]);
        if (args.response_format === "json")
          return text(clip(json({ statuses: statuses.items, types: types.items })));
        const lines = [`# Board #${args.board_id}`, "", "## Statuses"];
        for (const s of statuses.items)
          if (!s.inactive)
            lines.push(`- ${s.name}${s.closedStatus ? " (closed)" : ""}${s.defaultFlag ? " (default)" : ""}`);
        lines.push("", "## Types");
        for (const t of types.items)
          if (!t.inactiveFlag) lines.push(`- ${t.name}${t.defaultFlag ? " (default)" : ""}`);
        return text(clip(lines.join("\n")));
      } catch (error) {
        return failure(error);
      }
    }
  );

  reg.register(
    {
      name: "cw_list_priorities",
      title: "List ConnectWise Priorities",
      description: "List ticket priorities (exact names for cw_create_ticket / cw_update_ticket).",
      inputSchema: { response_format: responseFormatField },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args: { response_format: "markdown" | "json" }) => {
      try {
        const page = await client.getList<Priority>("/service/priorities", {
          orderBy: "sortOrder asc",
          fields: "id,name,sortOrder,defaultFlag",
          pageSize: 200,
        });
        if (args.response_format === "json") return text(clip(json(page.items)));
        const lines = ["# Priorities", ""];
        for (const p of page.items) lines.push(`- ${p.name}${p.defaultFlag ? " (default)" : ""}`);
        return text(clip(lines.join("\n")));
      } catch (error) {
        return failure(error);
      }
    }
  );

  reg.register(
    {
      name: "cw_list_ticket_time",
      title: "List Time Entries on a Ticket",
      description:
        "List all time entries logged against a ticket (by any member), newest first. Works for service " +
        "and project tickets.",
      inputSchema: {
        ticket_id: z.number().int().positive().describe("The ticket ID"),
        ticket_type: ticketKindField,
        page_number: pageNumberField,
        page_size: pageSizeField,
        response_format: responseFormatField,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args: {
      ticket_id: number;
      ticket_type: TicketKindArg;
      page_number: number;
      page_size: number;
      response_format: "markdown" | "json";
    }) => {
      try {
        const kind = await resolveTicketKind(client, args.ticket_id, args.ticket_type);
        const page = await client.getList<TimeEntry>("/time/entries", {
          conditions: `chargeToId=${args.ticket_id} AND chargeToType="${CHARGE_TO_TYPES[kind]}"`,
          orderBy: "timeStart desc",
          fields: "id,member/identifier,timeStart,timeEnd,actualHours,billableOption,workType/name,notes",
          page: args.page_number,
          pageSize: args.page_size,
        });
        if (page.items.length === 0) return text(`No time entries on ticket #${args.ticket_id}.`);
        if (args.response_format === "json") return text(clip(json(page)));
        const total = page.items.reduce((s, e) => s + (e.actualHours ?? 0), 0);
        const lines = [`# Time on ticket #${args.ticket_id} (${page.items.length} entries, ${total}h shown)`, ""];
        for (const e of page.items)
          lines.push(
            `- ${e.member?.identifier ?? "?"} | ${e.actualHours ?? 0}h | ${e.billableOption ?? "?"} | ${e.timeStart ?? "?"}${e.notes ? ` — ${e.notes.slice(0, 80)}` : ""}`
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
      name: "cw_list_ticket_tasks",
      title: "List ConnectWise Ticket Tasks",
      description: "List the task/checklist items on a ticket, with their done state.",
      inputSchema: {
        ticket_id: z.number().int().positive().describe("The ticket ID"),
        ticket_type: ticketKindField,
        response_format: responseFormatField,
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args: {
      ticket_id: number;
      ticket_type: TicketKindArg;
      response_format: "markdown" | "json";
    }) => {
      try {
        const kind = await resolveTicketKind(client, args.ticket_id, args.ticket_type);
        const page = await client.getList<TicketTask>(ticketPath(kind, args.ticket_id, "tasks"), {
          fields: "id,notes,closedFlag,priority,resolution",
          pageSize: 200,
        });
        if (page.items.length === 0) return text(`No tasks on ticket #${args.ticket_id}.`);
        if (args.response_format === "json") return text(clip(json(page.items)));
        const done = page.items.filter((t) => t.closedFlag).length;
        const lines = [`# Tasks on ticket #${args.ticket_id} (${done}/${page.items.length} done)`, ""];
        for (const t of page.items)
          lines.push(`- [${t.closedFlag ? "x" : " "}] ${t.notes ?? "(no text)"}${t.resolution ? ` → ${t.resolution}` : ""}`);
        return text(clip(lines.join("\n")));
      } catch (error) {
        return failure(error);
      }
    }
  );
}
