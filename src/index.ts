#!/usr/bin/env node
/** CLI entry point — runs the MCP server over stdio (default) or HTTP. */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ConfigError, loadConfig, type ServerConfig } from "./config.js";
import { createServer, SERVER_NAME, SERVER_VERSION } from "./server.js";
import { createApp } from "./http/app.js";
import { SqlClient } from "./sql/client.js";
import { QueryLibrary } from "./sql/library.js";
import type { SqlContext } from "./tools/sql.js";

const USAGE = `${SERVER_NAME} v${SERVER_VERSION}

Usage: mcp-connectwise-psa [options]

Options:
  --transport stdio|http   Transport (default: stdio; env TRANSPORT)
  --port <n>               HTTP port (default: 3000; env PORT)
  --site <host>            ConnectWise host (env CW_SITE)
  --toolsets <list>        Enabled toolsets (env CW_TOOLSETS; default: all — every key except sql)
  --help                   Show this help

Environment:
  CW_SITE                  ConnectWise host (e.g. na.myconnectwise.net)
  CW_COMPANY_ID            Login company id
  CW_CLIENT_ID             Integration clientId (developer.connectwise.com)
  CW_PUBLIC_KEY            API member public key (required for stdio)
  CW_PRIVATE_KEY           API member private key (required for stdio)
  CW_MEMBER_IDENTIFIER     Member the stdio keys belong to (my-tickets/my-time)
  CW_TOOLSETS              Comma list of toolset keys/presets (default: all).
                           Keys: tickets, time, companies, configurations,
                           schedule, finance, advanced, and sql (opt-in —
                           requires CW_DB_*, and excluded from "all").
                           Presets: tech, dispatch, invoicing, all.

ConnectWise database (on-prem only; enables the opt-in sql toolset). The first
four are required together, or all left unset:
  CW_DB_HOST               SQL Server host, or host\\INSTANCE
  CW_DB_NAME               Database, e.g. cwwebapp_acme
  CW_DB_USER               Dedicated read-only login (db_datareader)
  CW_DB_PASSWORD           Its password
  CW_DB_PORT               TCP port (default 1433; not valid with an instance)
  CW_DB_ENCRYPT            TLS (default true)
  CW_DB_TRUST_SERVER_CERT  Accept a self-signed certificate (default true)
  CW_DB_READ_UNCOMMITTED   READ UNCOMMITTED isolation (default true)
  CW_DB_QUERY_TIMEOUT_MS   Per-query deadline (default 30000)
  CW_DB_MAX_ROWS           Rows before the query is cancelled (default 200)
  CW_DB_QUERY_LIBRARY      Writable saved-query file; unset = built-ins only

HTTP sessions authenticate per-request with their own member keys via the
x-cw-public-key / x-cw-private-key headers (BYOK); the CW_* keys above are used
only by stdio. HTTP clients pick toolsets per session with the x-cw-toolsets header.
`;

function logStartupSummary(config: ServerConfig): void {
  console.error(
    "[auth] HTTP: each session must present its own ConnectWise keys via " +
      "x-cw-public-key / x-cw-private-key (BYOK); ConnectWise enforces the member's security role."
  );
  if (config.publicKey) {
    console.error(
      "[cw] CW_PUBLIC_KEY/CW_PRIVATE_KEY are set but unused on HTTP — sessions use their own keys."
    );
  }
}

async function runStdio(config: ServerConfig, sql?: SqlContext): Promise<void> {
  const server = createServer(
    config,
    {
      label: "stdio",
      credentials: {
        publicKey: config.publicKey!,
        privateKey: config.privateKey!,
        memberIdentifier: config.memberIdentifier,
      },
      toolsets: config.toolsets,
    },
    sql
  );
  await server.connect(new StdioServerTransport());
  console.error(`${SERVER_NAME} v${SERVER_VERSION} running on stdio (${config.site})`);
}

async function runHttp(config: ServerConfig, sql?: SqlContext): Promise<void> {
  logStartupSummary(config);
  const app = createApp(config, sql);
  await new Promise<void>((resolve) => {
    app.listen(config.port, "0.0.0.0", () => resolve());
  });
  console.error(`${SERVER_NAME} v${SERVER_VERSION} listening on :${config.port} (${config.site})`);
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(USAGE);
    return;
  }

  let config: ServerConfig;
  try {
    config = loadConfig(argv);
  } catch (err) {
    if (err instanceof ConfigError) {
      console.error(`Configuration error: ${err.message}\n`);
      console.error(USAGE);
      process.exit(1);
    }
    throw err;
  }

  // One pool for the process, shared by every session: the database credential
  // is server-wide, not per-member. Constructing it opens no socket, so bad
  // credentials surface on the first query rather than at startup.
  const sql: SqlContext | undefined = config.db
    ? {
        client: new SqlClient({ config: config.db }),
        library: new QueryLibrary({ path: config.db.queryLibraryPath }),
      }
    : undefined;
  if (sql) {
    console.error(
      `[db] sql toolset available (${sql.client.label}) — sessions must request it explicitly ` +
        "(CW_TOOLSETS=…,sql or x-cw-toolsets: …,sql). It uses a server-wide read-only login, " +
        "not the session member's keys."
    );
    const shutdown = (signal: string): void => {
      console.error(`[db] ${signal} — closing the database pool`);
      void sql.client.close().finally(() => process.exit(0));
    };
    process.once("SIGTERM", () => shutdown("SIGTERM"));
    process.once("SIGINT", () => shutdown("SIGINT"));
  }

  if (config.transport === "http") await runHttp(config, sql);
  else await runStdio(config, sql);
}

main().catch((err) => {
  console.error(`Fatal: ${String(err)}`);
  process.exit(1);
});
