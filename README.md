# mcp-connectwise-psa

An MCP ([Model Context Protocol](https://modelcontextprotocol.io)) server for [ConnectWise PSA](https://www.connectwise.com/platform/psa) (Manage) — **curated tools across 7 toolsets** covering technicians, dispatchers, and billing, plus an opt-in escape hatch for the rest of the API, so an AI assistant works PSA the way each role does:

- **Tickets** — search / my tickets / full detail with notes, create, update status/priority/owner, add discussion/internal notes, plus board·status·priority discovery and per-ticket time & tasks
- **Time** — log time against tickets, review your own time, work-role lookup, and **list & submit your timesheets**
- **Companies & contacts** — fast lookup, contact detail (phones/emails), company sites
- **Configurations** — devices/assets with serials, IPs, OS, warranty (read-only)
- **Dispatch** *(schedule)* — schedule entries (list/mine/create/reschedule/cancel), and **members with their timezone, working hours, and free-vs-booked availability**
- **Invoicing** *(finance, read-only)* — invoices, agreements, and **unbilled billable time** ready to bill
- **Toolsets & personas** — enable only what a session needs via the `x-cw-toolsets` header (or `CW_TOOLSETS`); presets `tech` / `dispatch` / `invoicing` / `all`. Default is `all` — narrow it per session when a smaller surface is wanted. Each tool also reports its toolset as `_meta.group`, so an aggregator (the MSPStack gateway) can group and switch tools by capability
- **Per-member API keys (BYOK)** — each user supplies their own ConnectWise member keys; ConnectWise enforces that member's security role, and every write is attributed to the *actual person*
- **Transports** — stdio for local use, streamable HTTP for shared deployments; Docker image included

## Quick start (local, stdio)

```bash
npm install && npm run build
CW_SITE=na.myconnectwise.net \
CW_COMPANY_ID=yourcompany \
CW_CLIENT_ID=<integration clientId> \
CW_PUBLIC_KEY=xxxx CW_PRIVATE_KEY=yyyy \
CW_MEMBER_IDENTIFIER=jdoe \
node dist/index.js
```

Claude Desktop / Claude Code config:

```json
{
  "mcpServers": {
    "connectwise": {
      "command": "node",
      "args": ["/path/to/mcp-connectwise-psa/dist/index.js"],
      "env": {
        "CW_SITE": "na.myconnectwise.net",
        "CW_COMPANY_ID": "yourcompany",
        "CW_CLIENT_ID": "<clientId>",
        "CW_PUBLIC_KEY": "xxxx",
        "CW_PRIVATE_KEY": "yyyy",
        "CW_MEMBER_IDENTIFIER": "jdoe"
      }
    }
  }
}
```

A `clientId` is required by the ConnectWise API — register a (free) integration at [developer.connectwise.com](https://developer.connectwise.com). API member keys are created in ConnectWise under **My Account → API Keys** (per member) or **System → Members → API Members** (integration accounts).

## HTTP deployment

```bash
CW_SITE=… CW_COMPANY_ID=… CW_CLIENT_ID=… \
node dist/index.js --transport http --port 3000
```

Or with Docker: `docker build -t mcp-connectwise-psa . && docker run -p 3000:3000 -e CW_SITE -e CW_COMPANY_ID -e CW_CLIENT_ID mcp-connectwise-psa`

| Route | Purpose |
|---|---|
| `POST/GET/DELETE /mcp` | MCP streamable-http endpoint |
| `GET /health` | Liveness probe |

> Sessions are held in memory — run a single instance (or sticky sessions).

## Access control — bring your own keys (BYOK)

Over HTTP there is **no MCP-level role system**. Each session presents its own ConnectWise member API keys, and ConnectWise itself is the access control: the member's security role decides what succeeds, and every note and time entry is attributed to that member.

Send your keys on the initialize request (and on every subsequent request in the session):

```http
x-cw-public-key:  <public key>
x-cw-private-key: <private key>
x-cw-member-id:   <your member identifier>   (optional — enables "my tickets"/"my time")
```

- A request with no keys is rejected with `401`; both key headers are required together.
- Keys are never logged. A session is bound to a SHA-256 hash of the key pair; presenting a different pair on the same session id → `403`.
- Create member API keys in ConnectWise under **My Account → API Keys**. Each tech uses their own.

Local **stdio** is single-user and uses the `CW_PUBLIC_KEY`/`CW_PRIVATE_KEY` from the environment instead of headers.

## Toolsets

Tools are grouped into **toolsets** so a session only sees the capabilities it needs — a dispatcher doesn't need the invoicing tools, and a small tool surface keeps the assistant focused (and its context cheap). Whether a write actually succeeds is still governed by the member's ConnectWise security role.

| Toolset key | Tools |
|---|---|
| `tickets` | `cw_search_tickets`, `cw_my_tickets`, `cw_get_ticket`, `cw_create_ticket`, `cw_update_ticket`, `cw_add_ticket_note`, `cw_list_boards`, `cw_get_board`, `cw_list_priorities`, `cw_list_ticket_time`, `cw_list_ticket_tasks` |
| `time` | `cw_create_time_entry`, `cw_update_time_entry`, `cw_list_my_time`, `cw_list_work_roles`, `cw_list_my_timesheets`, `cw_submit_timesheet` |
| `companies` | `cw_search_companies`, `cw_get_company`, `cw_search_contacts`, `cw_get_contact`, `cw_list_company_sites` |
| `configurations` | `cw_list_configurations`, `cw_get_configuration` |
| `schedule` | `cw_list_schedule_entries`, `cw_my_schedule`, `cw_schedule_ticket`, `cw_update_schedule_entry`, `cw_delete_schedule_entry`, `cw_member_availability`, `cw_list_members`, `cw_get_member` |
| `finance` | `cw_list_invoices`, `cw_get_invoice`, `cw_list_agreements`, `cw_get_agreement`, `cw_list_unbilled_time` |
| `advanced` | `cw_find_endpoint` (search the full CW API — ~1,150 endpoints), `cw_get` (read-only GET on any path) |

**Presets** bundle keys per persona: `tech` = tickets + time + companies + configurations · `dispatch` = tickets + schedule + companies + configurations · `invoicing` = finance + time + companies · `all` = everything (incl. `advanced`).

The **`advanced`** toolset is the escape hatch (in `all`, but in no persona preset): `cw_find_endpoint` searches a bundled catalog of the whole ConnectWise API, and `cw_get` performs a read-only GET on any path — so an assistant can reach the long tail (procurement, sales, projects, system…) the curated tools don't wrap. To drop it, name the keys or a persona preset instead (`x-cw-toolsets: tech`).

Select toolsets with a comma list mixing keys and presets:

- **HTTP** — the `x-cw-toolsets` header, per session: `x-cw-toolsets: dispatch` or `x-cw-toolsets: tech,finance`.
- **stdio** — the `CW_TOOLSETS` env var or `--toolsets` flag: `CW_TOOLSETS=invoicing`.

The **default is the `all` preset** — every capability, including `advanced`; a client that wants a smaller surface names the keys or persona it needs. Unknown keys in `CW_TOOLSETS`/`--toolsets` fail fast; unknown tokens in the `x-cw-toolsets` header are ignored. The only destructive tool is `cw_delete_schedule_entry` (dispatch); finance is read-only.

## Configuration reference

| Variable | Default | Purpose |
|---|---|---|
| `CW_SITE` | — | ConnectWise host (cloud or on-prem; full URLs accepted) |
| `CW_COMPANY_ID` | — | Login company id |
| `CW_CLIENT_ID` | — | Integration clientId |
| `CW_PUBLIC_KEY` / `CW_PRIVATE_KEY` | — | API member keys — required for stdio; unused on HTTP (BYOK) |
| `CW_MEMBER_IDENTIFIER` | — | Member the stdio keys belong to (my-tickets/my-time) |
| `TRANSPORT` / `PORT` | `stdio` / `3000` | Transport selection |
| `CW_TOOLSETS` | `all` | Enabled toolsets (keys/presets); HTTP overrides per session via `x-cw-toolsets` |

## Notes & limits

- Ticket searches default to open tickets; status/board names are exact, text filters are substrings.
- Timestamps must have whole seconds — the server normalizes (ConnectWise rejects fractional seconds).
- Time entries require an **open time report period** in ConnectWise for the entry date; the API's message is passed through when none exists.
- `/system/myAccount` is missing on some on-prem versions — provide the member identifier explicitly (`CW_MEMBER_IDENTIFIER` or `x-cw-member-id`) for "my tickets"/"my time".
- Discussion notes are customer-visible; internal notes are not — the tool makes this explicit.

## Development

```bash
npm install
npm run dev          # stdio via tsx
npm run dev:http     # http via tsx
npm test             # vitest
npm run build        # tsc → dist/
```

## License

[MIT](LICENSE)
