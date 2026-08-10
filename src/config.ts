/**
 * Server configuration, resolved from CLI flags and environment variables.
 *
 * Environment variables:
 *   CW_SITE               ConnectWise host (e.g. na.myconnectwise.net or an
 *                         on-prem host). A full URL is accepted; scheme and
 *                         path are stripped.
 *   CW_COMPANY_ID         ConnectWise login company id (required)
 *   CW_CLIENT_ID          Integration clientId from developer.connectwise.com (required)
 *   CW_PUBLIC_KEY         API member public key — required for stdio; unused on
 *   CW_PRIVATE_KEY        HTTP, where each session brings its own keys (BYOK)
 *   CW_MEMBER_IDENTIFIER  Member the stdio keys belong to (enables
 *                         "my tickets"/"my time")
 *   TRANSPORT             stdio | http (default: stdio)
 *   PORT                  HTTP port (default: 3000)
 *   CW_TOOLSETS           Comma list of toolset keys/presets to expose (default:
 *                         the "all" preset). HTTP sessions may override per
 *                         request via the x-cw-toolsets header.
 *
 * Access model: stdio uses the server-wide keys above (single local user). HTTP
 * sessions each bring their own member API keys (BYOK) via x-cw-public-key /
 * x-cw-private-key headers; ConnectWise enforces that member's security role.
 * There is no MCP-level role gating.
 */

import { DEFAULT_TOOLSETS, resolveToolsets, type ToolsetKey } from "./tools/toolsets.js";

export type Transport = "stdio" | "http";

export interface ServerConfig {
  transport: Transport;
  port: number;
  /** Bare host, e.g. "support.example.com" */
  site: string;
  companyId: string;
  clientId: string;
  /** Server-wide API member keys; used by stdio, absent on HTTP (BYOK). */
  publicKey: string | undefined;
  privateKey: string | undefined;
  /** Member identifier for the stdio keys (for my-tickets/my-time). */
  memberIdentifier: string | undefined;
  /** Toolsets for stdio, and the fallback default for HTTP sessions. */
  toolsets: ToolsetKey[];
}

export class ConfigError extends Error {}

function flagValue(argv: string[], name: string): string | undefined {
  const idx = argv.indexOf(name);
  if (idx === -1) return undefined;
  const value = argv[idx + 1];
  if (value === undefined || value.startsWith("--")) {
    throw new ConfigError(`Missing value for ${name}`);
  }
  return value;
}

/** Accept "host", "https://host", or "https://host/v4_6_release/apis/3.0/". */
export function normalizeSite(raw: string): string {
  const withoutScheme = raw.replace(/^https?:\/\//i, "");
  const host = withoutScheme.split("/")[0]?.trim();
  if (!host) throw new ConfigError(`Invalid CW_SITE "${raw}"`);
  return host;
}

export function loadConfig(
  argv: string[] = process.argv.slice(2),
  env: NodeJS.ProcessEnv = process.env
): ServerConfig {
  // `||` not `??`: desktop hosts (MCPB) pass unset optional config as empty strings
  const transport = ((flagValue(argv, "--transport") ?? env.TRANSPORT) || "stdio") as Transport;
  if (transport !== "stdio" && transport !== "http") {
    throw new ConfigError(`Invalid transport "${transport}" — expected "stdio" or "http"`);
  }

  const portRaw = (flagValue(argv, "--port") ?? env.PORT) || "3000";
  const port = Number(portRaw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new ConfigError(`Invalid port "${portRaw}"`);
  }

  const siteRaw = flagValue(argv, "--site") ?? env.CW_SITE;
  if (!siteRaw) throw new ConfigError("CW_SITE is required (ConnectWise host)");
  const site = normalizeSite(siteRaw);

  const companyId = env.CW_COMPANY_ID;
  if (!companyId) throw new ConfigError("CW_COMPANY_ID is required");
  const clientId = env.CW_CLIENT_ID;
  if (!clientId) {
    throw new ConfigError(
      "CW_CLIENT_ID is required — register an integration at developer.connectwise.com"
    );
  }

  const publicKey = env.CW_PUBLIC_KEY || undefined;
  const privateKey = env.CW_PRIVATE_KEY || undefined;
  if (!!publicKey !== !!privateKey) {
    throw new ConfigError("CW_PUBLIC_KEY and CW_PRIVATE_KEY must be set together");
  }

  if (transport === "stdio" && !publicKey) {
    throw new ConfigError("CW_PUBLIC_KEY / CW_PRIVATE_KEY are required for stdio transport");
  }

  let toolsets: ToolsetKey[];
  try {
    toolsets = resolveToolsets(flagValue(argv, "--toolsets") ?? env.CW_TOOLSETS, DEFAULT_TOOLSETS, "throw");
  } catch (err) {
    throw new ConfigError(err instanceof Error ? err.message : String(err));
  }

  return {
    transport,
    port,
    site,
    companyId,
    clientId,
    publicKey,
    privateKey,
    memberIdentifier: env.CW_MEMBER_IDENTIFIER || undefined,
    toolsets,
  };
}
