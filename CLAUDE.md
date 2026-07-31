# mcp-connectwise-psa

MCP server for ConnectWise PSA (Manage). TypeScript, ESM, Node ≥20. Transports: stdio (local) and streamable HTTP (shared deployments). Sibling project to mcp-itglue — same auth architecture.

## Commands

- `npm run build` — tsc → `dist/` (tests excluded from build)
- `npm test` — vitest, test files beside sources (`src/**/*.test.ts`)
- `npm run dev` / `npm run dev:http` — run from source via tsx

## Architecture

- `src/config.ts` — env/flag parsing; `CW_SITE` accepts full URLs (normalized to host)
- `src/cw/client.ts` — fetch-based CW Manage REST client (API 3.0). Basic auth `companyId+publicKey:privateKey` + mandatory `clientId` header. List queries use CW's grammar: `conditions` (exact for names/ids, `contains` for text, date literals in `[brackets]`), `orderBy`, `page`/`pageSize`, and `fields` (always pass fields — CW records are huge). `q()` quotes condition values; `allOf()` joins fragments
- `src/tools/registrar.ts` — `ToolRegistrar` registers the full tool surface; no MCP-level role gating (ConnectWise enforces the member's security role — unlike mcp-itglue's single account key, PSA is per-member BYOK)
- `src/http/app.ts` — pure BYOK: every `/mcp` session presents its own `x-cw-public-key`/`x-cw-private-key` (+ optional `x-cw-member-id`) headers; no keys → 401; sessions bound to the SHA-256 of the key pair; a different pair on the same session id → 403. stdio uses the server-wide `CW_PUBLIC_KEY`/`CW_PRIVATE_KEY`
- `src/server.ts` — one McpServer per session; the session's CW credentials build its `CWClient`. Holds the `TOOLSETS` registry (key → `register*Tools`); `createServer` registers only `session.toolsets`
- `src/tools/toolsets.ts` — capability keys (`tickets`/`time`/`companies`/`configurations`/`schedule`/`finance`/`advanced`), persona presets (`tech`/`dispatch`/`invoicing`/`all`), and `resolveToolsets()`. Selection: `CW_TOOLSETS`/`--toolsets` (stdio, unknown key → `ConfigError`) or the `x-cw-toolsets` header (HTTP, unknown token ignored). Default = `tech` preset (backward compatible with pre-toolset behavior). `advanced` is in `all` only — never in a persona preset
- `src/tools/` — tickets, time, companies, configurations (tech); schedule (dispatch); finance (invoicing, read-only); advanced (opt-in escape hatch); helpers in `tools/shared.ts`
- `src/tools/advanced.ts` — `cw_get` (read-only GET on any path via `CWClient.rawGet`; strips host/`/apis/3.0`/inline query, then passes `conditions`/`fields`/`orderBy`/page) and `cw_find_endpoint` (lexical search over `src/reference/cw-endpoints.ts`). Write passthrough is a deliberate later add
- `src/reference/cw-endpoints.ts` — **generated** endpoint catalog (~1145 paths). CW publishes no fetchable OpenAPI (swagger UI is behind the Manage web login), so a spec is obtained manually and `scripts/gen-endpoints.mjs` derives this file from it (source kept local under `.claude/`, gitignored; the generated `.ts` is committed). Hand annotations (better summaries + `keyParams`/`commonFields`/`coveredBy`) live in the generator's `ENRICH` map; `/count` and `/info` helper paths are dropped

## ConnectWise API gotchas (verified against a live instance)

- Timestamps must have whole seconds — strip milliseconds (`cwTimestamp` in tools/time.ts) or CW returns "Unsupported format applied to timeStart"
- Time entries fail with a "report periods" error when no open time period exists for the date — instance configuration, not a bug; the message is passed through
- `cw_update_time_entry` (PATCH `/time/entries/{id}`): CW **ignores a direct `actualHours` replace** when `timeStart`/`timeEnd` exist (hours are derived) — so duration is edited via `timeStart`/`timeEnd` (which recompute hours), and the tool intentionally has no `hours` field. Live-verified: editing `timeEnd` moved 0.22h→0.5h; `notes`/`billableOption`/`workType` patch fine
- `/system/myAccount` 404s on some on-prem versions — member identity falls back to explicit `CW_MEMBER_IDENTIFIER`/`x-cw-member-id`; "my …" tools return `UNKNOWN_MEMBER_MESSAGE` when unknown
- PATCH uses ops like `{op:"replace", path:"status", value:{name:"…"}}` — name-based value objects work
- Ticket assignment lives in both `owner/identifier` and the `resources` string — search both
- `/system/audittrail` takes `type`+`id` as its own query params (cw_get's `params` argument, issue #4). `type` values live-verified on v2025.1: `Ticket, Company, Contact, Agreement, Invoice, Time, Expense, PurchaseOrder, Project, Opportunity, Configuration` — time entries are **`Time`, not `TimeEntry`**; `Member` and `SalesOrder` are rejected. A nonexistent `id` also returns 400 (not 404), so a rejected call doesn't necessarily mean the type is wrong
- Schedule (`schedule.ts`) and Finance (`finance.ts`) tools are **live-verified** against the NDR training instance: schedule entries have no `where` field and carry `type/identifier` (not `type/name`); lists order by `dateStart desc` so dated rows lead. `cw_schedule_ticket` POST (`objectId` + `member/identifier` + `type/identifier:"S"` + `dateStart/dateEnd`) works and round-trips. Finance invoice/agreement fields needed no changes
- Member dispatch data (`cw_list_members`/`cw_get_member`): a real member carries `timeZone`, `calendar` (→ `/schedule/calendars/{id}` for weekly hours + `holidayList`), `workRole`, `dailyCapacity`/`scheduleCapacity`, `restrictScheduleFlag`, `hideMemberInDispatchPortalFlag`. **Inactive stub members omit `timeZone`/`calendar`** (they're null → dropped from the response), so don't conclude the fields are missing from a stub record — check a real active member. `cw_get_member` resolves working hours by following the member's `calendar` id
- More live-verified endpoints (all v0.3.0): board statuses/types are **per-board** (`/service/boards/{id}/statuses` and `/types`); unbilled time = `billableOption="Billable" AND invoiceFlag=false` (`invoiceFlag=true` ⇒ already on an invoice); ticket time = `/time/entries` with `chargeToId={ticket} AND chargeToType="ServiceTicket"`; timesheet submit is `POST /time/sheets/{id}/submit` (empty/non-Open sheets are rejected by CW with a business message, passed through). Some **system members (e.g. `zadmin`, id 150) are not in `/system/members`** and their id 404s — availability/get-member need a standard member identifier. `CWClient` now has `del()` (DELETE) for `cw_delete_schedule_entry`

## Conventions

- Tool responses via `tools/shared.ts` (`text`/`failure`/`json`/`clip`); errors returned as `isError` text through `describeError`, never thrown to the SDK
- All logging via `console.error` (stdout belongs to the stdio transport)
- Never log tokens or API keys — labels and key-hash prefixes only
- `docs/` is gitignored — private working notes live there
