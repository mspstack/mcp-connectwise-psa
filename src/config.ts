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
 * ConnectWise database (on-prem only; enables the "sql" toolset). The
 * four core variables are required together, or all left unset:
 *   CW_DB_HOST            SQL Server host, or "host\INSTANCE" for a named instance
 *   CW_DB_NAME            Database, e.g. cwwebapp_acme
 *   CW_DB_USER            Dedicated read-only login (db_datareader)
 *   CW_DB_PASSWORD        Its password
 *   CW_DB_PORT            TCP port (default 1433; not valid with a named instance)
 *   CW_DB_ENCRYPT         TLS (default true)
 *   CW_DB_TRUST_SERVER_CERT  Accept a self-signed cert (default true)
 *   CW_DB_READ_UNCOMMITTED   READ UNCOMMITTED isolation (default true) so
 *                         reporting queries never block production writers
 *   CW_DB_QUERY_TIMEOUT_MS   Per-query deadline (default 30000)
 *   CW_DB_MAX_ROWS        Rows returned before the query is cancelled (default 200)
 *   CW_DB_QUERY_LIBRARY   Path to the writable saved-query file; unset means the
 *                         committed core only, and no save tool
 * These are environment-only on purpose: a --db-password flag would be visible
 * in `ps`.
 *
 * Access model: stdio uses the server-wide keys above (single local user). HTTP
 * sessions each bring their own member API keys (BYOK) via x-cw-public-key /
 * x-cw-private-key headers; ConnectWise enforces that member's security role.
 * There is no MCP-level role gating.
 *
 * The `sql` toolset is the exception: it reads the ConnectWise database directly
 * through a server-wide read-only login, not the session member's API keys — so
 * its results are not attributed to a member and are not filtered by that
 * member's ConnectWise security role. Configuring CW_DB_* is what enables it;
 * once configured it is part of `all` and of the default selection, so decide
 * deliberately whether every session on this server should have it.
 */

import {
  DEFAULT_TOOLSETS,
  DB_TOOLSETS,
  resolveToolsets,
  withoutDbToolsets,
  type ToolsetKey,
} from "./tools/toolsets.js";

export type Transport = "stdio" | "http";

/** ConnectWise Manage database — set only when the sql toolset is configured. */
export interface DbConfig {
  /** SQL Server host, instance suffix stripped. */
  host: string;
  /** Named instance from "host\\INSTANCE"; mutually exclusive with port. */
  instanceName: string | undefined;
  /** TCP port; undefined when reaching a named instance via SQL Browser. */
  port: number | undefined;
  database: string;
  user: string;
  password: string;
  encrypt: boolean;
  trustServerCertificate: boolean;
  /** READ UNCOMMITTED, so a reporting scan takes no shared locks. */
  readUncommitted: boolean;
  queryTimeoutMs: number;
  maxRows: number;
  /** Writable saved-query overlay; undefined means the committed core only. */
  queryLibraryPath: string | undefined;
}

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
  /** ConnectWise database, when CW_DB_* is configured. */
  db: DbConfig | undefined;
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

/** Split "host\\INSTANCE" into its parts. */
export function parseDbHost(raw: string): { host: string; instanceName: string | undefined } {
  const [hostPart, ...rest] = raw.trim().split("\\");
  const host = hostPart?.trim();
  if (!host) throw new ConfigError(`Invalid CW_DB_HOST "${raw}"`);
  if (rest.length === 0) return { host, instanceName: undefined };
  const instanceName = rest.join("\\").trim();
  if (!instanceName) {
    throw new ConfigError(`Invalid CW_DB_HOST "${raw}" — the instance name is empty`);
  }
  return { host, instanceName };
}

const TRUE_VALUES = new Set(["true", "1", "yes", "on"]);
const FALSE_VALUES = new Set(["false", "0", "no", "off"]);

/** Parse a boolean env var; blank/unset falls back. */
export function parseBoolEnv(raw: string | undefined, name: string, fallback: boolean): boolean {
  const value = (raw || "").trim().toLowerCase();
  if (!value) return fallback;
  if (TRUE_VALUES.has(value)) return true;
  if (FALSE_VALUES.has(value)) return false;
  throw new ConfigError(`Invalid ${name} "${raw}" — expected true or false`);
}

/** Parse a bounded integer env var; blank/unset falls back. */
export function parseIntEnv(
  raw: string | undefined,
  name: string,
  fallback: number,
  min: number,
  max: number
): number {
  const value = (raw || "").trim();
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new ConfigError(
      `Invalid ${name} "${raw}" — expected an integer between ${min} and ${max}`
    );
  }
  return parsed;
}

/**
 * Resolve the CW_DB_* group. Returns undefined when the group is entirely
 * absent (the sql toolset is then unavailable); throws when it is half-set, so
 * a typo'd variable never silently disables the toolset.
 */
export function loadDbConfig(env: NodeJS.ProcessEnv): DbConfig | undefined {
  // `||` not `??`: desktop hosts (MCPB) pass unset optional config as empty strings
  const hostRaw = env.CW_DB_HOST || undefined;
  const database = env.CW_DB_NAME || undefined;
  const user = env.CW_DB_USER || undefined;
  const password = env.CW_DB_PASSWORD || undefined;

  const core = [hostRaw, database, user, password];
  if (core.every((value) => value === undefined)) return undefined;
  if (core.some((value) => value === undefined)) {
    throw new ConfigError(
      "CW_DB_HOST, CW_DB_NAME, CW_DB_USER and CW_DB_PASSWORD must be set together — " +
        "or all left unset to disable the sql toolset"
    );
  }

  const { host, instanceName } = parseDbHost(hostRaw as string);
  const portRaw = env.CW_DB_PORT || undefined;
  if (portRaw && instanceName) {
    throw new ConfigError(
      "CW_DB_PORT cannot be combined with a named instance in CW_DB_HOST — pick one"
    );
  }
  const port = instanceName ? undefined : parseIntEnv(portRaw, "CW_DB_PORT", 1433, 1, 65535);

  return {
    host,
    instanceName,
    port,
    database: database as string,
    user: user as string,
    password: password as string,
    encrypt: parseBoolEnv(env.CW_DB_ENCRYPT, "CW_DB_ENCRYPT", true),
    trustServerCertificate: parseBoolEnv(
      env.CW_DB_TRUST_SERVER_CERT,
      "CW_DB_TRUST_SERVER_CERT",
      true
    ),
    readUncommitted: parseBoolEnv(env.CW_DB_READ_UNCOMMITTED, "CW_DB_READ_UNCOMMITTED", true),
    queryTimeoutMs: parseIntEnv(
      env.CW_DB_QUERY_TIMEOUT_MS,
      "CW_DB_QUERY_TIMEOUT_MS",
      30_000,
      1_000,
      120_000
    ),
    maxRows: parseIntEnv(env.CW_DB_MAX_ROWS, "CW_DB_MAX_ROWS", 200, 1, 1_000),
    queryLibraryPath: env.CW_DB_QUERY_LIBRARY || undefined,
  };
}

/** True when a raw toolset list names a database-backed key outright. */
function namesDbToolset(raw: string | undefined): boolean {
  const tokens = (raw ?? "")
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
  return tokens.some((token) => (DB_TOOLSETS as readonly string[]).includes(token));
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

  const toolsetsRaw = flagValue(argv, "--toolsets") ?? env.CW_TOOLSETS;
  let toolsets: ToolsetKey[];
  try {
    toolsets = resolveToolsets(toolsetsRaw, DEFAULT_TOOLSETS, "throw");
  } catch (err) {
    throw new ConfigError(err instanceof Error ? err.message : String(err));
  }

  const db = loadDbConfig(env);
  if (!db) {
    // The database toolsets are part of `all` and of the default, so a server
    // with no database must not fail to start over a selection it never asked
    // for — prune them. Only naming one outright is a configuration error.
    if (namesDbToolset(toolsetsRaw)) {
      throw new ConfigError(
        'Toolset "sql" is selected but no ConnectWise database is configured — set CW_DB_HOST, ' +
          'CW_DB_NAME, CW_DB_USER and CW_DB_PASSWORD, or drop "sql" from CW_TOOLSETS.'
      );
    }
    toolsets = withoutDbToolsets(toolsets);
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
    db,
  };
}
