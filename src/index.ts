#!/usr/bin/env node
/** CLI entry point — runs the MCP server over stdio (default) or HTTP. */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ConfigError, loadConfig, type ServerConfig } from "./config.js";
import { createServer, SERVER_NAME, SERVER_VERSION } from "./server.js";
import { createApp } from "./http/app.js";

const USAGE = `${SERVER_NAME} v${SERVER_VERSION}

Usage: mcp-connectwise-psa [options]

Options:
  --transport stdio|http   Transport (default: stdio; env TRANSPORT)
  --port <n>               HTTP port (default: 3000; env PORT)
  --site <host>            ConnectWise host (env CW_SITE)
  --toolsets <list>        Enabled toolsets (env CW_TOOLSETS; default: all)
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
                           schedule, finance, advanced.
                           Presets: tech, dispatch, invoicing, all.

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

async function runStdio(config: ServerConfig): Promise<void> {
  const server = createServer(config, {
    label: "stdio",
    credentials: {
      publicKey: config.publicKey!,
      privateKey: config.privateKey!,
      memberIdentifier: config.memberIdentifier,
    },
    toolsets: config.toolsets,
  });
  await server.connect(new StdioServerTransport());
  console.error(`${SERVER_NAME} v${SERVER_VERSION} running on stdio (${config.site})`);
}

async function runHttp(config: ServerConfig): Promise<void> {
  logStartupSummary(config);
  const app = createApp(config);
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

  if (config.transport === "http") await runHttp(config);
  else await runStdio(config);
}

main().catch((err) => {
  console.error(`Fatal: ${String(err)}`);
  process.exit(1);
});
