/**
 * Builds an McpServer for one session. A session is defined by the ConnectWise
 * credentials it uses (server-wide keys on stdio, or client-supplied via BYOK)
 * and the toolsets it selected. Only the selected toolsets are registered; the
 * member's ConnectWise security role is the access control.
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

const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { name: string; version: string };

export const SERVER_NAME = pkg.name;
export const SERVER_VERSION = pkg.version;

/** Maps each toolset key to the function that registers its tools. */
const TOOLSETS: Record<ToolsetKey, (reg: ToolRegistrar, client: CWClient) => void> = {
  tickets: registerTicketTools,
  time: registerTimeTools,
  companies: registerCompanyTools,
  configurations: registerConfigurationTools,
  schedule: registerScheduleTools,
  finance: registerFinanceTools,
  advanced: registerAdvancedTools,
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
- Only the tools for this session's enabled toolsets are listed; other capabilities may exist on the server.`;

export function createServer(config: ServerConfig, session: SessionIdentity): McpServer {
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

  const reg = new ToolRegistrar(server);
  for (const key of session.toolsets) {
    // Each tool carries its toolset as _meta.group, so an aggregator can group
    // and switch tools by capability. The tools themselves are unchanged.
    TOOLSETS[key](reg.forToolset(key), client);
  }

  return server;
}
