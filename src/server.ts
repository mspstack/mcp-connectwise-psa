/**
 * Builds an McpServer for one session. A session is defined by the ConnectWise
 * credentials it uses (server-wide keys on stdio, or client-supplied via BYOK)
 * and the toolsets it selected. Only the selected toolsets are registered; the
 * member's ConnectWise security role is the access control.
 *
 * Exception: the `sql` toolset reads the ConnectWise database through a
 * server-wide read-only login — no member attribution, no CW security-role
 * filtering — so it is registered only where the server has a database
 * configured.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createRequire } from "node:module";
import { ToolRegistrar } from "./tools/registrar.js";
import { CWClient, type CWCredentials } from "./cw/client.js";
import type { ServerConfig } from "./config.js";
import type { ToolsetKey } from "./tools/toolsets.js";
import { registerTicketTools } from "./tools/tickets.js";
import { registerTimeTools } from "./tools/time.js";
import { registerCompanyTools } from "./tools/companies.js";
import { registerConfigurationTools } from "./tools/configurations.js";
import { registerScheduleTools } from "./tools/schedule.js";
import { registerFinanceTools } from "./tools/finance.js";
import { registerAdvancedTools } from "./tools/advanced.js";
import { registerSqlTools } from "./tools/sql.js";
import type { SqlContext } from "./tools/sql.js";
import { withoutDbToolsets } from "./tools/toolsets.js";

const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { name: string; version: string };

export const SERVER_NAME = pkg.name;
export const SERVER_VERSION = pkg.version;

/**
 * Maps each toolset key to the function that registers its tools. Exhaustive: a
 * new key is a compile error until it is mapped. Most registrars ignore the
 * third argument — only `sql` is backed by the database instead of the CW API.
 */
export type ToolsetRegistrar = (reg: ToolRegistrar, client: CWClient, sql?: SqlContext) => void;

const TOOLSETS: Record<ToolsetKey, ToolsetRegistrar> = {
  tickets: registerTicketTools,
  time: registerTimeTools,
  companies: registerCompanyTools,
  configurations: registerConfigurationTools,
  schedule: registerScheduleTools,
  finance: registerFinanceTools,
  advanced: registerAdvancedTools,
  sql: registerSqlTools,
};

export interface SessionIdentity {
  label: string;
  credentials: CWCredentials;
  /** Capability groups this session exposes. */
  toolsets: ToolsetKey[];
}

const INSTRUCTIONS = `# ConnectWise PSA MCP server

## Finding things
- Typical flow: cw_search_companies → cw_search_tickets / cw_list_configurations → cw_get_ticket.
- cw_my_tickets and cw_list_my_time act as the member whose API keys this session uses.
- Ticket searches default to OPEN tickets; pass open_only:false for closed ones.
- Status/board/priority filters use exact names; summary and name filters match substrings.

## Working tickets
- cw_add_ticket_note: discussion notes are CUSTOMER-VISIBLE; set internal:true for internal analysis.
- cw_update_ticket status names must exist on the ticket's board.
- cw_create_time_entry needs time_start plus time_end or hours; notes describe the work done.
- Writes are attributed to the API keys' member — that's the point: use your own keys.

## Notes
- Lists are paginated; ask for more pages rather than huge page sizes.
- A write may still fail if your ConnectWise security role forbids it.
- Only the tools for this session's enabled toolsets are listed; other capabilities may exist on the server.

## Database (cw_db_* tools, when the sql toolset is enabled)
- These read the ConnectWise database directly, read-only, through a shared server login — results are NOT limited to what your ConnectWise security role can see. Treat what you read as confidential and report only what was asked for.
- Find tables with cw_db_find_table and check cw_db_find_query for a saved query before writing SQL; always use TOP and a WHERE clause. Results are capped by rows and by characters.
- Prefer the REST tools when one answers the question — they are role-checked and business-rule filtered.`;

/**
 * @param sql Process-wide gateway to the ConnectWise database, when one is
 *            configured. Shared by every session on purpose — it is one
 *            server-wide read-only login, not a per-member credential — so the
 *            pool is created by the caller, never here.
 */
export function createServer(
  config: ServerConfig,
  session: SessionIdentity,
  sql?: SqlContext
): McpServer {
  const client = new CWClient({
    site: config.site,
    companyId: config.companyId,
    clientId: config.clientId,
    credentials: session.credentials,
  });

  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { instructions: INSTRUCTIONS }
  );

  const reg = new ToolRegistrar(server, session.label);
  // A database-backed toolset cannot be registered without a gateway. The config
  // layer already rejects that combination; this is the last guard.
  const keys = sql ? session.toolsets : withoutDbToolsets(session.toolsets);
  for (const key of keys) {
    // Each tool carries its toolset as _meta.group, so an aggregator can group
    // and switch tools by capability. The tools themselves are unchanged.
    TOOLSETS[key](reg.forToolset(key), client, sql);
  }

  return server;
}
