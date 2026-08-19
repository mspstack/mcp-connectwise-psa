/**
 * Read-only client for the on-prem ConnectWise Manage database (cwwebapp_*).
 *
 * Mirrors src/cw/client.ts: an options-object constructor, one private method
 * doing transport plus error normalization, a typed error, and pure helpers
 * exported for tests. Two things differ, both on purpose:
 *
 *  - The connection pool is process-wide and lazy. It is created on the first
 *    query, memoized, and cleared when it fails, so a database that was briefly
 *    down does not stay "down" for the life of the process. Constructing a
 *    SqlClient opens no socket, so bad credentials cannot break startup.
 *  - Results are bounded while streaming, never by slicing afterwards: a bare
 *    SELECT * on a large ConnectWise table would otherwise be materialized in
 *    full before any limit applied.
 *
 * There is no statement inspection here. The database login is the security
 * boundary: it is a dedicated db_datareader with EXECUTE denied, so SQL Server
 * rejects anything but SELECT.
 */

import type { config as MssqlConfig } from "mssql";
import type { DbConfig } from "../config.js";

/** Connect deadline. Separate from the per-query deadline below. */
export const SQL_CONNECT_TIMEOUT_MS = 15_000;
/** Ceiling for a single query; the caller's timeout narrows it. */
export const SQL_MAX_QUERY_TIMEOUT_MS = 120_000;
export const SQL_DEFAULT_QUERY_TIMEOUT_MS = 30_000;
export const SQL_DEFAULT_MAX_ROWS = 200;
export const SQL_MAX_MAX_ROWS = 1_000;
/** Longest single cell rendered; ntext bodies are clamped to this. */
export const SQL_CELL_CHAR_LIMIT = 300;
/** Result budget, under RESPONSE_CHAR_LIMIT so a header and footer still fit. */
export const SQL_RESULT_CHAR_BUDGET = 20_000;

/** tedious ISOLATION_LEVEL, inlined so this module never imports the driver eagerly. */
const ISOLATION_READ_UNCOMMITTED = 1;
const ISOLATION_READ_COMMITTED = 2;

const POOL_MAX = 2;
const POOL_ACQUIRE_TIMEOUT_MS = 10_000;
const POOL_IDLE_TIMEOUT_MS = 60_000;

export interface SqlColumn {
  name: string;
  type: string;
}

export type SqlTruncation = "none" | "row_cap" | "char_budget" | "extra_recordsets";

export interface SqlResult {
  columns: SqlColumn[];
  /** arrayRowMode: positionally aligned to `columns`. */
  rows: unknown[][];
  truncatedBy: SqlTruncation;
  elapsedMs: number;
}

export interface SqlQueryOptions {
  maxRows?: number;
  timeoutMs?: number;
  charBudget?: number;
  /** Session label, for the stderr audit line. */
  session?: string;
}

export class SqlError extends Error {
  constructor(
    message: string,
    /** Driver code: ELOGIN | ESOCKET | EINSTLOOKUP | EREQUEST | ETIMEOUT | … */
    public readonly code?: string,
    /** SQL Server error number, for EREQUEST (208, 229, 4060, …). */
    public readonly number?: number,
    /** Server message, already redacted. */
    public readonly detail?: string
  ) {
    super(message);
    this.name = "SqlError";
  }
}

/** Host/database/user, for stripping them out of driver messages. */
export interface SqlSecrets {
  host: string;
  database: string;
  user: string;
}

const REGEXP_METACHARACTERS = /[.*+?^${}()|[\]\\]/g;

/**
 * Replace host, database and login with placeholders. Driver messages embed
 * all three, and a tool result is model-visible. Pure — exported for tests.
 */
export function redactSqlMessage(message: string, secrets: SqlSecrets): string {
  const masks: Array<[string, string]> = [
    [secrets.host, "<db-host>"],
    [secrets.database, "<database>"],
    [secrets.user, "<db-user>"],
  ];
  return masks.reduce((acc, [needle, mask]) => {
    if (!needle) return acc;
    return acc.replace(new RegExp(needle.replace(REGEXP_METACHARACTERS, "\\$&"), "gi"), mask);
  }, message);
}

/** "cwwebapp_acme@sqlhost:1433 as cw_mcp_ro" — never includes the password. */
export function sqlTarget(db: DbConfig): string {
  const where = db.instanceName ? `${db.host}\\${db.instanceName}` : `${db.host}:${db.port ?? 1433}`;
  return `${db.database}@${where} as ${db.user}`;
}

/** DbConfig → the mssql pool config. Pure — exported for tests. */
export function buildPoolConfig(db: DbConfig): MssqlConfig {
  return {
    server: db.host,
    database: db.database,
    user: db.user,
    password: db.password,
    connectionTimeout: SQL_CONNECT_TIMEOUT_MS,
    requestTimeout: SQL_MAX_QUERY_TIMEOUT_MS,
    arrayRowMode: true,
    pool: {
      min: 0,
      max: POOL_MAX,
      idleTimeoutMillis: POOL_IDLE_TIMEOUT_MS,
      acquireTimeoutMillis: POOL_ACQUIRE_TIMEOUT_MS,
    },
    options: {
      // Port and instance are mutually exclusive in tedious.
      ...(db.instanceName ? { instanceName: db.instanceName } : { port: db.port ?? 1433 }),
      encrypt: db.encrypt,
      trustServerCertificate: db.trustServerCertificate,
      useUTC: true,
      appName: "mcp-connectwise-psa",
      // A routing hint for an availability-group listener, not a permission.
      readOnlyIntent: true,
      // Set on the connection rather than prepended to the batch, which would
      // shift the line number in every SQL Server error message.
      connectionIsolationLevel: db.readUncommitted
        ? ISOLATION_READ_UNCOMMITTED
        : ISOLATION_READ_COMMITTED,
    },
  };
}

export function clampRowCap(requested: number | undefined, configured: number): number {
  const value = requested ?? configured ?? SQL_DEFAULT_MAX_ROWS;
  if (!Number.isFinite(value) || value < 1) return configured || SQL_DEFAULT_MAX_ROWS;
  return Math.min(Math.floor(value), SQL_MAX_MAX_ROWS);
}

export function clampTimeoutMs(requested: number | undefined, configured: number): number {
  const value = requested ?? configured ?? SQL_DEFAULT_QUERY_TIMEOUT_MS;
  if (!Number.isFinite(value) || value < 1) return configured || SQL_DEFAULT_QUERY_TIMEOUT_MS;
  return Math.min(Math.floor(value), SQL_MAX_QUERY_TIMEOUT_MS);
}

/**
 * Render one cell for a markdown table: no pipes, no newlines, no millisecond
 * noise on dates, and never longer than `limit`.
 */
export function cellToString(value: unknown, limit = SQL_CELL_CHAR_LIMIT): string {
  if (value === null || value === undefined) return "NULL";

  let text: string;
  if (value instanceof Date) {
    text = `${value.toISOString().slice(0, 19)}Z`;
  } else if (typeof value === "object" && value !== null && "byteLength" in value) {
    const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value as ArrayBuffer);
    text = `0x${bytes.subarray(0, 32).toString("hex")}${bytes.length > 32 ? "…" : ""}`;
  } else if (typeof value === "object") {
    text = JSON.stringify(value);
  } else {
    text = String(value);
  }

  text = text.replace(/\r?\n/g, "↵ ").replace(/\|/g, "\\|");
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
}

/** Cost of a row against the character budget. */
export function estimateRowChars(cells: unknown[]): number {
  let total = 0;
  for (const cell of cells) total += cellToString(cell).length + 3;
  return total;
}

/** Column metadata arrives as an array (arrayRowMode) or a name-keyed map. */
export function normalizeColumns(meta: unknown): SqlColumn[] {
  const entries = Array.isArray(meta) ? meta : Object.values((meta ?? {}) as object);
  return entries.map((column, index) => {
    const record = (column ?? {}) as { name?: unknown; type?: { name?: unknown } };
    return {
      name: typeof record.name === "string" && record.name ? record.name : `column${index + 1}`,
      type: typeof record.type?.name === "string" ? record.type.name : "unknown",
    };
  });
}

/**
 * Human-readable error for a tool result. Connection-class failures get fixed
 * prose — their driver messages embed the host and login — while statement
 * errors echo the (already redacted) server text, since that is what lets the
 * model fix its own SQL.
 */
export function describeSqlError(error: unknown): string {
  if (!(error instanceof SqlError)) {
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }

  const detail = error.detail ? ` ${error.detail}` : "";
  switch (error.code) {
    case "ELOGIN":
      return (
        "Error: SQL Server rejected the login — the read-only database credentials are wrong, " +
        "expired, or the login is disabled. This is a server configuration problem."
      );
    case "EINSTLOOKUP":
      return (
        "Error: the named SQL Server instance could not be resolved — the SQL Browser service " +
        "must be running and UDP 1434 reachable."
      );
    case "ESOCKET":
    case "ECONNCLOSED":
    case "ENOTOPEN":
      return (
        "Error: the ConnectWise database could not be reached — unresolvable, refusing " +
        "connections, or blocked by a firewall. Not a problem with your query."
      );
    case "ETIMEOUT":
      return (
        "Error: the query exceeded its time limit and was cancelled. Add TOP n, bound it with a " +
        "date range, or select fewer columns — then retry."
      );
    case "ECANCEL":
      return "Error: the query was cancelled.";
    case "EREQUEST":
      switch (error.number) {
        case 208:
          return (
            `Error: no such table or view.${detail} Find the real name with cw_db_find_table — ` +
            "ConnectWise table names are unguessable (tickets are SR_Service, not Tickets)."
          );
        case 207:
          return (
            `Error: no such column.${detail} Get the exact list with SELECT COLUMN_NAME, DATA_TYPE ` +
            "FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='…'."
          );
        case 102:
        case 105:
        case 156:
        case 4145:
          return `Error: T-SQL syntax error.${detail} Fix the statement and retry.`;
        case 229:
        case 230:
        case 262:
        case 297:
        case 300:
          return (
            `Error: permission denied.${detail} This connection is a read-only reporting login — ` +
            "it can SELECT and nothing else, and columns holding credentials are denied outright " +
            "(so SELECT * on those tables fails; name the columns you need)."
          );
        case 3906:
        case 3908:
          return "Error: the database is read-only for this login — only SELECT is possible here.";
        case 4060:
        case 911:
        case 916:
          return (
            "Error: the configured ConnectWise database is not available to this login. " +
            "This is a server configuration problem."
          );
        case 245:
        case 8114:
          return `Error: type conversion failed.${detail} Cast explicitly, e.g. TRY_CONVERT(int, col).`;
        case 8134:
          return "Error: divide by zero — guard the denominator with NULLIF(x, 0).";
        case 1205:
          return "Error: the query was chosen as a deadlock victim. Retry it, or narrow it.";
        default:
          return `Error: SQL Server rejected the statement${
            error.number ? ` (error ${error.number})` : ""
          }.${detail}`;
      }
    default:
      return `Error: the database query failed.${detail}`;
  }
}

/**
 * True when the model can fix this itself — those come back as plain text so it
 * self-corrects, rather than as an isError result.
 */
export function isCallerSqlMistake(error: unknown): boolean {
  if (!(error instanceof SqlError)) return false;
  if (error.code === "ETIMEOUT") return true;
  if (error.code !== "EREQUEST") return false;
  return error.number !== undefined && error.number >= 100;
}

/** The slice of mssql's Request this client uses — the seam tests inject at. */
export interface SqlRequestLike {
  stream: boolean;
  arrayRowMode: boolean;
  on(event: string, handler: (payload: unknown) => void): unknown;
  query(statement: string): Promise<unknown>;
  cancel(): void;
}

export interface SqlPoolLike {
  request(): SqlRequestLike;
  close(): Promise<unknown> | void;
}

export interface SqlClientOptions {
  config: DbConfig;
  /** Pool factory; injected in tests, real mssql ConnectionPool otherwise. */
  connect?: (config: MssqlConfig) => Promise<SqlPoolLike>;
}

async function connectWithMssql(config: MssqlConfig): Promise<SqlPoolLike> {
  // mssql is CJS: under NodeNext the exports land on `.default`.
  const imported = (await import("mssql")) as unknown as {
    default?: { ConnectionPool?: unknown };
    ConnectionPool?: unknown;
  };
  const driver = (imported.default?.ConnectionPool ? imported.default : imported) as {
    ConnectionPool: new (config: MssqlConfig) => { connect(): Promise<SqlPoolLike> };
  };
  const pool = new driver.ConnectionPool(config);
  return pool.connect();
}

export class SqlClient {
  readonly label: string;
  readonly maxRows: number;
  readonly queryTimeoutMs: number;

  private readonly poolConfig: MssqlConfig;
  private readonly secrets: SqlSecrets;
  private readonly connect: (config: MssqlConfig) => Promise<SqlPoolLike>;
  private pool: Promise<SqlPoolLike> | undefined;

  constructor(options: SqlClientOptions) {
    this.poolConfig = buildPoolConfig(options.config);
    this.secrets = {
      host: options.config.host,
      database: options.config.database,
      user: options.config.user,
    };
    this.connect = options.connect ?? connectWithMssql;
    this.label = sqlTarget(options.config);
    this.maxRows = options.config.maxRows;
    this.queryTimeoutMs = options.config.queryTimeoutMs;
  }

  /** Run one statement batch, bounded by rows, characters and time. */
  async query(statement: string, options: SqlQueryOptions = {}): Promise<SqlResult> {
    const maxRows = clampRowCap(options.maxRows, this.maxRows);
    const timeoutMs = clampTimeoutMs(options.timeoutMs, this.queryTimeoutMs);
    const charBudget = options.charBudget ?? SQL_RESULT_CHAR_BUDGET;
    const started = Date.now();

    const result = await this.run(statement, { maxRows, timeoutMs, charBudget });
    const elapsedMs = Date.now() - started;

    // Statement, timing and shape only — never rows (PII), never credentials.
    console.error(
      `[db] ${options.session ?? "session"} ${elapsedMs}ms ${result.rows.length} rows` +
        `${result.truncatedBy === "none" ? "" : ` (${result.truncatedBy})`} :: ` +
        statement.replace(/\s+/g, " ").slice(0, 500)
    );

    return { ...result, elapsedMs };
  }

  /** SELECT 1, for diagnostics. */
  async ping(): Promise<void> {
    await this.query("SELECT 1 AS ok", { maxRows: 1, session: "ping" });
  }

  async close(): Promise<void> {
    const pool = this.pool;
    this.pool = undefined;
    if (!pool) return;
    try {
      await (await pool).close();
    } catch {
      // Closing a pool that never connected, or already died, is not an error.
    }
  }

  private getPool(): Promise<SqlPoolLike> {
    if (!this.pool) {
      this.pool = this.connect(this.poolConfig).catch((error: unknown) => {
        // Clear the rejected promise, or a momentary outage would be permanent.
        this.pool = undefined;
        throw this.normalize(error);
      });
    }
    return this.pool;
  }

  private async run(
    statement: string,
    limits: { maxRows: number; timeoutMs: number; charBudget: number }
  ): Promise<Omit<SqlResult, "elapsedMs">> {
    const pool = await this.getPool();
    const request = pool.request();
    request.stream = true;
    request.arrayRowMode = true;

    let columns: SqlColumn[] = [];
    let recordsets = 0;
    const rows: unknown[][] = [];
    let chars = 0;
    // Held in an object so the callbacks below and the catch agree on the type.
    const state: { stop: SqlTruncation | "timeout" } = { stop: "none" };

    const cancel = (reason: SqlTruncation | "timeout") => {
      if (state.stop !== "none") return;
      state.stop = reason;
      request.cancel();
    };

    const timer = setTimeout(() => cancel("timeout"), limits.timeoutMs);

    try {
      await new Promise<void>((resolve, reject) => {
        request.on("recordset", (meta) => {
          recordsets += 1;
          // Only the first result set is returned — one SELECT per call.
          if (recordsets > 1) return cancel("extra_recordsets");
          columns = normalizeColumns(meta);
        });

        request.on("row", (row) => {
          if (state.stop !== "none" || recordsets > 1) return;
          const cells = (Array.isArray(row) ? row : Object.values(row as object)) as unknown[];
          if (rows.length >= limits.maxRows) return cancel("row_cap");
          const cost = estimateRowChars(cells);
          if (chars + cost > limits.charBudget && rows.length > 0) return cancel("char_budget");
          chars += cost;
          rows.push(cells);
        });

        request.on("error", (error) => reject(error));
        request.on("done", () => resolve());

        // In stream mode the promise settles alongside the events; a cancel we
        // asked for surfaces here as ECANCEL and is normal termination.
        request.query(statement).then(
          () => resolve(),
          (error: unknown) => reject(error)
        );
      });
    } catch (error) {
      if (state.stop === "timeout") {
        throw new SqlError("Query timed out", "ETIMEOUT");
      }
      // A cancel we asked for lands here as ECANCEL — normal termination.
      if (state.stop === "none" || codeOf(error) !== "ECANCEL") {
        throw this.normalize(error);
      }
    } finally {
      clearTimeout(timer);
    }

    if (state.stop === "timeout") throw new SqlError("Query timed out", "ETIMEOUT");
    return { columns, rows, truncatedBy: state.stop };
  }

  private normalize(error: unknown): SqlError {
    if (error instanceof SqlError) return error;
    const raw = error as { message?: unknown; code?: unknown; number?: unknown };
    const message = typeof raw?.message === "string" ? raw.message : String(error);
    return new SqlError(
      "Database query failed",
      typeof raw?.code === "string" ? raw.code : undefined,
      typeof raw?.number === "number" ? raw.number : undefined,
      redactSqlMessage(message, this.secrets)
    );
  }
}

function codeOf(error: unknown): string | undefined {
  const code = (error as { code?: unknown })?.code;
  return typeof code === "string" ? code : undefined;
}
