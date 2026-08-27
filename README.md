# mcp-connectwise-psa

An MCP ([Model Context Protocol](https://modelcontextprotocol.io)) server for [ConnectWise PSA](https://www.connectwise.com/platform/psa) (Manage) — **curated tools across 8 toolsets** covering technicians, dispatchers, and billing, plus an escape hatch for the rest of the API and a read-only SQL toolset for on-prem deployments, so an AI assistant works PSA the way each role does:

- **Tickets** — search / my tickets / full detail with notes, create, update status/priority/owner, add discussion/internal notes, plus board·status·priority discovery and per-ticket time & tasks. Covers **service *and* project tickets** — ConnectWise keeps them on separate resources, so the read tools query both and the by-id tools detect which one an id belongs to
- **Time** — log time against tickets (with work role, work type and CW's **Deduct** for breaks), review your own time, work-role and work-type lookup, and **list & submit your timesheets**
- **Companies & contacts** — fast lookup, contact detail (phones/emails), company sites
- **Configurations** — devices/assets with serials, IPs, OS, warranty (read-only)
- **Dispatch** *(schedule)* — schedule entries (list/mine/create/reschedule/cancel), and **members with their timezone, working hours, and free-vs-booked availability**
- **Invoicing** *(finance, read-only)* — invoices, agreements, and **unbilled billable time** ready to bill
- **SQL** *(on-prem only)* — read-only T-SQL straight against the `cwwebapp_*` Manage database for the cross-table reporting REST cannot express, with a searchable schema catalog and a **library of saved queries** the assistant can grow. Enabled by configuring `CW_DB_*`; where it is, every session that does not narrow its toolsets has it
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
| `time` | `cw_create_time_entry`, `cw_update_time_entry`, `cw_list_my_time`, `cw_list_work_roles`, `cw_list_work_types`, `cw_list_my_timesheets`, `cw_submit_timesheet` |
| `companies` | `cw_search_companies`, `cw_get_company`, `cw_search_contacts`, `cw_get_contact`, `cw_list_company_sites` |
| `configurations` | `cw_list_configurations`, `cw_get_configuration` |
| `schedule` | `cw_list_schedule_entries`, `cw_my_schedule`, `cw_schedule_ticket`, `cw_update_schedule_entry`, `cw_delete_schedule_entry`, `cw_member_availability`, `cw_list_members`, `cw_get_member` |
| `finance` | `cw_list_invoices`, `cw_get_invoice`, `cw_list_agreements`, `cw_get_agreement`, `cw_list_unbilled_time` |
| `advanced` | `cw_find_endpoint` (search the full CW API — ~1,150 endpoints), `cw_get` (read-only GET on any path) |
| `sql` *(on-prem, needs `CW_DB_*`)* | `cw_db_query` (read-only T-SQL), `cw_db_find_table` (schema catalog), `cw_db_find_query` / `cw_db_save_query` (saved-query library) |

**Presets** bundle keys per persona: `tech` = tickets + time + companies + configurations · `dispatch` = tickets + schedule + companies + configurations · `invoicing` = finance + time + companies · `all` = every key. The persona presets deliberately exclude `sql` — a technician surface is not a database surface.

The **`advanced`** toolset is the escape hatch (in `all`, but in no persona preset): `cw_find_endpoint` searches a bundled catalog of the whole ConnectWise API, and `cw_get` performs a read-only GET on any path — so an assistant can reach the long tail (procurement, sales, projects, system…) the curated tools don't wrap. To drop it, name the keys or a persona preset instead (`x-cw-toolsets: tech`).

Select toolsets with a comma list mixing keys and presets:

- **HTTP** — the `x-cw-toolsets` header, per session: `x-cw-toolsets: dispatch` or `x-cw-toolsets: tech,finance`.
- **stdio** — the `CW_TOOLSETS` env var or `--toolsets` flag: `CW_TOOLSETS=invoicing`.

The **default is the `all` preset** — every capability the server is configured for; a client that wants a smaller surface names the keys or persona it needs. Unknown keys in `CW_TOOLSETS`/`--toolsets` fail fast; unknown tokens in the `x-cw-toolsets` header are ignored. The only destructive tool is `cw_delete_schedule_entry` (dispatch); finance is read-only. `cw_db_save_query` writes, but to the query-library file — database access itself is SELECT-only by grant.

### Exception: the `sql` toolset

Every other toolset runs on the caller's own ConnectWise keys, so ConnectWise filters what comes back. `sql` does not: it reads the database through a **server-wide read-only login**, so its results are not attributed to a member and are not filtered by that member's security role, board restrictions or record permissions.

Configuring `CW_DB_*` is therefore the decision that matters. Once a server has a database, `sql` is an ordinary key: it is in `all`, it is in the default selection, and **every session that does not narrow its toolsets can read the whole PSA database**. A server without `CW_DB_*` prunes it silently, so nothing breaks for deployments that never wanted it.

If you need database access for some callers but not others, do it per session (`x-cw-toolsets: tech`) or in front of the server — an aggregating gateway can tier the `cw_db_*` tools separately. What bounds the damage on the server side is the login: see the runbook below, and keep it to `db_datareader` with credential columns denied.

## SQL toolset (on-prem database)

Cloud-hosted ConnectWise gives you no database access, so this toolset is for **on-prem deployments only**. Point it at the Manage database with a login created for exactly this purpose:

```bash
CW_DB_HOST=sqlhost CW_DB_NAME=cwwebapp_acme \
CW_DB_USER=cw_mcp_ro CW_DB_PASSWORD=… \
CW_DB_QUERY_LIBRARY=/data/cw-queries.json \
node dist/index.js
```

That is all it takes: with a database configured the `sql` toolset is part of the default selection. Naming `sql` without `CW_DB_*` fails at startup (a selection that only *includes* it, like `all`, is pruned instead). Nothing connects to the database until a session actually uses a tool.

**Start from the reporting views.** ConnectWise ships denormalized `v_rpt_*` views that already join board, status, company and contact onto a record — `v_rpt_service`, `v_rpt_time`, `v_rpt_company`, `v_rpt_invoices`, `v_rpt_agreementlist`. `cw_db_find_table` knows them and the base tables behind them; it carries key columns only, because the exact column list is one `INFORMATION_SCHEMA` query away and is always right for *your* version.

**The saved-query library** is the committed core plus a writable overlay at `CW_DB_QUERY_LIBRARY` (JSON, `{ version, queries[] }`). Overlay entries win by slug, `cw_db_save_query` appends to it, and `scripts/import-queries.mjs` fills it from an existing BrightGauge export:

```bash
node scripts/import-queries.mjs /path/to/brightgauge-export
```

Imported queries stay outside this repository — they are your reporting and can carry company names and rates. On a container, point `CW_DB_QUERY_LIBRARY` at mounted storage or saved queries die with the container.

### The login is the security boundary

There is no statement validation: the server sends the model's SQL to SQL Server as written, so what the login is allowed to do is exactly what can happen. Two scripts set it up and prove it.

**Create it** — edit the four variables at the top, run as sysadmin. `@WhatIf` defaults to `1`, so the first run only prints the plan:

```bash
sqlcmd -S SQLHOST\CWPROD -d master -i scripts/create-readonly-login.sql
```

It creates the login in no server role, adds it to `db_datareader` in one database, `DENY`s everything else (EXECUTE, all writes, DDL, BACKUP), and `DENY`s SELECT on every credential-looking column it *discovers* — the names move between Manage versions and every MSP adds its own, so they are found rather than hard-coded. Re-running is safe and is how you re-apply the DENYs after an upgrade adds tables. It reports the instance-wide settings that must be off but never changes them: disabling `xp_cmdshell` can break other applications, so that stays a decision.

**Verify it** — as the new login, not as an admin:

```bash
sqlcmd -S SQLHOST\CWPROD -d cwwebapp_acme -U cw_mcp_ro -P '<password>' -i scripts/verify-readonly-login.sql
```

Every check prints PASS or FAIL: SELECT works, `UPDATE`/`CREATE TABLE` are refused (inside a transaction that always rolls back, in case a DENY is missing), `xp_cmdshell`/`sp_OACreate`/`OPENROWSET(BULK …)` are unreachable, a credential column is unreadable, and the login is in no elevated role. One FAIL means do not enable the toolset yet.

Two consequences worth knowing up front:

- **`SELECT *` fails** on any table with a denied column, rather than returning the other columns. That is the point; the tool's error tells the model to name its columns.
- **EXECUTE is the permission that matters.** With it, "read-only SQL" becomes remote code execution as the SQL Server service account — `xp_cmdshell`, `sp_OACreate`, `sp_send_dbmail`, `xp_dirtree` for NTLM capture. `OPENROWSET`/`BULK INSERT` read files with no EXECUTE at all, which is why Ad Hoc Distributed Queries must also be off.

**Operationally**: prefer a readable AG secondary or a restored reporting copy over the production primary, firewall the SQL port to the MCP host, and keep a SQL Audit or Extended Events session on this login.

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
| `CW_DB_HOST` | — | ConnectWise SQL Server host, or `host\INSTANCE` — enables the `sql` toolset |
| `CW_DB_NAME` / `CW_DB_USER` / `CW_DB_PASSWORD` | — | Database and its dedicated read-only login (all four required together) |
| `CW_DB_PORT` | `1433` | TCP port; invalid together with a named instance |
| `CW_DB_ENCRYPT` / `CW_DB_TRUST_SERVER_CERT` | `true` / `true` | TLS, and accepting the usual self-signed on-prem certificate |
| `CW_DB_READ_UNCOMMITTED` | `true` | Read at READ UNCOMMITTED so reporting never blocks production writers |
| `CW_DB_QUERY_TIMEOUT_MS` / `CW_DB_MAX_ROWS` | `30000` / `200` | Per-query deadline and row cap |
| `CW_DB_QUERY_LIBRARY` | — | Path to the writable saved-query file; unset ⇒ built-in queries only, no save tool |

## Notes & limits

- Ticket searches default to open tickets; status/board names are exact, text filters are substrings.
- Service and project tickets live on different ConnectWise resources. Read tools take `ticket_type` (`both` by default) and merge; by-id tools default to `auto` and detect the resource, which costs one extra lookup — pass `service`/`project` to skip it. `cw_create_ticket` makes service tickets only: a project ticket needs a project and a phase.
- A break inside a logged span goes in `hours_deduct`, with `time_end` left at the real end time. Passing a shortened `hours` instead makes ConnectWise render an end time that never happened.
- Timestamps must have whole seconds — the server normalizes (ConnectWise rejects fractional seconds).
- Time entries require an **open time report period** in ConnectWise for the entry date; the API's message is passed through when none exists.
- `/system/myAccount` is missing on some on-prem versions — provide the member identifier explicitly (`CW_MEMBER_IDENTIFIER` or `x-cw-member-id`) for "my tickets"/"my time".
- Discussion notes are customer-visible; internal notes are not — the tool makes this explicit.
- `cw_db_query` stops at `max_rows` (default 200) or a ~20,000-character budget and cancels the query server-side; the response says which limit it hit. The per-query deadline is 30 s by default, 120 s at most.
- The database connection reads at **READ UNCOMMITTED** so a reporting scan cannot block a technician saving a ticket. The cost is dirty reads: counts are approximate under concurrent writes. Set `CW_DB_READ_UNCOMMITTED=false` if a report must be exact.
- `SELECT *` fails on any table with a DENY'd column — name the columns you need.
- Cloud-hosted ConnectWise instances have no database access; the `sql` toolset is on-prem only.

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
