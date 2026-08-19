import { describe, expect, it, vi } from "vitest";
import type { DbConfig } from "../config.js";
import {
  buildPoolConfig,
  cellToString,
  clampRowCap,
  clampTimeoutMs,
  describeSqlError,
  isCallerSqlMistake,
  normalizeColumns,
  redactSqlMessage,
  SqlClient,
  SqlError,
  sqlTarget,
  type SqlPoolLike,
  type SqlRequestLike,
} from "./client.js";

const db: DbConfig = {
  host: "sqlhost",
  instanceName: undefined,
  port: 1433,
  database: "cwwebapp_acme",
  user: "cw_mcp_ro",
  password: "p@ssw0rd-s3kr3t",
  encrypt: true,
  trustServerCertificate: true,
  readUncommitted: true,
  queryTimeoutMs: 30_000,
  maxRows: 200,
  queryLibraryPath: undefined,
};

describe("buildPoolConfig", () => {
  it("pins the read-only posture", () => {
    const config = buildPoolConfig(db);
    expect(config.options?.readOnlyIntent).toBe(true);
    expect(config.options?.connectionIsolationLevel).toBe(1); // READ UNCOMMITTED
    expect(config.arrayRowMode).toBe(true);
    expect(config.connectionTimeout).toBe(15_000);
    expect(config.requestTimeout).toBe(120_000);
    expect(config.pool?.max).toBe(2);
    expect(config.pool?.min).toBe(0);
  });

  it("switches to READ COMMITTED when asked", () => {
    expect(buildPoolConfig({ ...db, readUncommitted: false }).options?.connectionIsolationLevel).toBe(2);
  });

  it("passes encrypt and trustServerCertificate through", () => {
    const config = buildPoolConfig({ ...db, encrypt: false, trustServerCertificate: false });
    expect(config.options?.encrypt).toBe(false);
    expect(config.options?.trustServerCertificate).toBe(false);
  });

  it("treats port and named instance as mutually exclusive", () => {
    const withPort = buildPoolConfig(db).options as Record<string, unknown>;
    expect(withPort.port).toBe(1433);
    expect(withPort.instanceName).toBeUndefined();

    const withInstance = buildPoolConfig({
      ...db,
      instanceName: "CWPROD",
      port: undefined,
    }).options as Record<string, unknown>;
    expect(withInstance.instanceName).toBe("CWPROD");
    expect(withInstance.port).toBeUndefined();
  });
});

describe("sqlTarget", () => {
  it("labels the connection without leaking the password", () => {
    expect(sqlTarget(db)).toBe("cwwebapp_acme@sqlhost:1433 as cw_mcp_ro");
    expect(sqlTarget(db)).not.toContain(db.password);
    expect(sqlTarget({ ...db, instanceName: "CWPROD", port: undefined })).toContain("sqlhost\\CWPROD");
  });
});

describe("clampRowCap / clampTimeoutMs", () => {
  it("falls back and clamps", () => {
    expect(clampRowCap(undefined, 200)).toBe(200);
    expect(clampRowCap(50, 200)).toBe(50);
    expect(clampRowCap(99_999, 200)).toBe(1_000);
    expect(clampRowCap(0, 200)).toBe(200);
    expect(clampTimeoutMs(undefined, 30_000)).toBe(30_000);
    expect(clampTimeoutMs(5_000, 30_000)).toBe(5_000);
    expect(clampTimeoutMs(999_000, 30_000)).toBe(120_000);
    expect(clampTimeoutMs(-1, 30_000)).toBe(30_000);
  });
});

describe("cellToString", () => {
  it("renders the shapes a ConnectWise row actually contains", () => {
    expect(cellToString(null)).toBe("NULL");
    expect(cellToString(undefined)).toBe("NULL");
    expect(cellToString(new Date("2026-07-01T13:04:00.123Z"))).toBe("2026-07-01T13:04:00Z");
    expect(cellToString(Buffer.from([0xde, 0xad]))).toBe("0xdead");
    expect(cellToString(true)).toBe("true");
    expect(cellToString(0)).toBe("0");
  });

  it("keeps a cell from breaking the markdown table", () => {
    expect(cellToString("a|b")).toBe("a\\|b");
    expect(cellToString("line1\r\nline2")).toBe("line1↵ line2");
  });

  it("clamps long values", () => {
    const clamped = cellToString("x".repeat(900), 300);
    expect(clamped).toHaveLength(301);
    expect(clamped.endsWith("…")).toBe(true);
  });
});

describe("normalizeColumns", () => {
  it("accepts array and keyed metadata, and fills gaps", () => {
    expect(normalizeColumns([{ name: "Summary", type: { name: "nvarchar" } }])).toEqual([
      { name: "Summary", type: "nvarchar" },
    ]);
    expect(normalizeColumns({ Id: { name: "Id", type: { name: "int" } } })).toEqual([
      { name: "Id", type: "int" },
    ]);
    expect(normalizeColumns([{}])).toEqual([{ name: "column1", type: "unknown" }]);
  });
});

describe("redactSqlMessage", () => {
  const secrets = { host: "sqlhost", database: "cwwebapp_acme", user: "cw_mcp_ro" };

  it("masks host, database and login case-insensitively", () => {
    const masked = redactSqlMessage(
      "Login failed for user 'CW_MCP_RO' on SQLHOST opening cwwebapp_acme",
      secrets
    );
    expect(masked).not.toMatch(/sqlhost/i);
    expect(masked).not.toMatch(/cw_mcp_ro/i);
    expect(masked).not.toMatch(/cwwebapp_acme/i);
    expect(masked).toContain("<db-host>");
  });

  it("survives regex metacharacters in a named-instance host", () => {
    const masked = redactSqlMessage("cannot reach SQLPROD01\\CWPROD", {
      ...secrets,
      host: "SQLPROD01\\CWPROD",
    });
    expect(masked).toBe("cannot reach <db-host>");
  });

  it("leaves an unrelated message alone and ignores empty secrets", () => {
    expect(redactSqlMessage("Invalid column name 'Foo'", secrets)).toBe("Invalid column name 'Foo'");
    expect(redactSqlMessage("anything", { host: "", database: "", user: "" })).toBe("anything");
  });
});

describe("describeSqlError", () => {
  it("maps connection failures to fixed prose", () => {
    expect(describeSqlError(new SqlError("x", "ELOGIN"))).toMatch(/rejected the login/);
    expect(describeSqlError(new SqlError("x", "EINSTLOOKUP"))).toMatch(/SQL Browser/);
    expect(describeSqlError(new SqlError("x", "ESOCKET"))).toMatch(/could not be reached/);
    expect(describeSqlError(new SqlError("x", "ETIMEOUT"))).toMatch(/TOP/);
  });

  it("maps statement failures to something the model can act on", () => {
    expect(describeSqlError(new SqlError("x", "EREQUEST", 208))).toMatch(/cw_db_find_table/);
    expect(describeSqlError(new SqlError("x", "EREQUEST", 207))).toMatch(/no such column/);
    expect(describeSqlError(new SqlError("x", "EREQUEST", 102))).toMatch(/syntax error/);
    expect(describeSqlError(new SqlError("x", "EREQUEST", 229))).toMatch(/permission denied/);
    expect(describeSqlError(new SqlError("x", "EREQUEST", 4060))).toMatch(/not available/);
    expect(describeSqlError(new SqlError("x", "EREQUEST", 1205))).toMatch(/deadlock/);
    expect(describeSqlError(new SqlError("x", "EREQUEST", 99_999))).toMatch(/error 99999/);
  });

  it("falls through for a plain error", () => {
    expect(describeSqlError(new Error("boom"))).toBe("Error: boom");
  });

  it.each(["ELOGIN", "ESOCKET", "EINSTLOOKUP", "ECONNCLOSED", "ENOTOPEN", "ETIMEOUT"])(
    "never echoes connection details for %s",
    (code) => {
      const leaky = new SqlError(
        "raw",
        code,
        undefined,
        "Login failed for user 'cw_mcp_ro' with password p@ssw0rd-s3kr3t on sqlhost"
      );
      const described = describeSqlError(leaky);
      expect(described).not.toContain("p@ssw0rd-s3kr3t");
      expect(described).not.toContain("cw_mcp_ro");
      expect(described).not.toContain("sqlhost");
    }
  );
});

describe("isCallerSqlMistake", () => {
  it("routes statement errors to the model and system errors to isError", () => {
    expect(isCallerSqlMistake(new SqlError("x", "EREQUEST", 208))).toBe(true);
    expect(isCallerSqlMistake(new SqlError("x", "ETIMEOUT"))).toBe(true);
    expect(isCallerSqlMistake(new SqlError("x", "ELOGIN"))).toBe(false);
    expect(isCallerSqlMistake(new SqlError("x", "ESOCKET"))).toBe(false);
    expect(isCallerSqlMistake(new SqlError("x", "EREQUEST"))).toBe(false);
    expect(isCallerSqlMistake(new Error("boom"))).toBe(false);
  });
});

/** Minimal stand-in for an mssql streaming Request. */
class FakeRequest implements SqlRequestLike {
  stream = false;
  arrayRowMode = false;
  cancelled = 0;
  private handlers = new Map<string, Array<(payload: unknown) => void>>();

  constructor(private readonly script: { columns: unknown; recordsets: unknown[][][] }) {}

  on(event: string, handler: (payload: unknown) => void): this {
    const list = this.handlers.get(event) ?? [];
    list.push(handler);
    this.handlers.set(event, list);
    return this;
  }

  private emit(event: string, payload?: unknown): void {
    for (const handler of this.handlers.get(event) ?? []) handler(payload);
  }

  cancel(): void {
    this.cancelled += 1;
  }

  async query(): Promise<unknown> {
    await Promise.resolve();
    for (const rows of this.script.recordsets) {
      this.emit("recordset", this.script.columns);
      for (const row of rows) {
        if (this.cancelled) break;
        this.emit("row", row);
      }
      if (this.cancelled) break;
    }
    if (this.cancelled) {
      throw Object.assign(new Error("Canceled."), { code: "ECANCEL" });
    }
    this.emit("done");
    return {};
  }
}

function fakePool(script: { columns: unknown; recordsets: unknown[][][] }) {
  const requests: FakeRequest[] = [];
  const pool: SqlPoolLike & { closed: number; requests: FakeRequest[] } = {
    closed: 0,
    requests,
    request() {
      const request = new FakeRequest(script);
      requests.push(request);
      return request;
    },
    close() {
      pool.closed += 1;
      return Promise.resolve();
    },
  };
  return pool;
}

const COLUMNS = [
  { name: "Id", type: { name: "int" } },
  { name: "Summary", type: { name: "nvarchar" } },
];

describe("SqlClient", () => {
  it("connects once and reuses the pool", async () => {
    const pool = fakePool({ columns: COLUMNS, recordsets: [[[1, "a"]]] });
    const connect = vi.fn().mockResolvedValue(pool);
    const client = new SqlClient({ config: db, connect });
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});

    const first = await client.query("SELECT 1");
    await client.query("SELECT 2");

    expect(connect).toHaveBeenCalledOnce();
    expect(first.columns).toEqual([
      { name: "Id", type: "int" },
      { name: "Summary", type: "nvarchar" },
    ]);
    expect(first.rows).toEqual([[1, "a"]]);
    expect(first.truncatedBy).toBe("none");
    errors.mockRestore();
  });

  it("retries the connection after a failure instead of staying poisoned", async () => {
    const pool = fakePool({ columns: COLUMNS, recordsets: [[[1, "a"]]] });
    const connect = vi
      .fn()
      .mockRejectedValueOnce(Object.assign(new Error("Login failed"), { code: "ELOGIN" }))
      .mockResolvedValue(pool);
    const client = new SqlClient({ config: db, connect });
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(client.query("SELECT 1")).rejects.toBeInstanceOf(SqlError);
    await expect(client.query("SELECT 1")).resolves.toMatchObject({ truncatedBy: "none" });
    expect(connect).toHaveBeenCalledTimes(2);
    errors.mockRestore();
  });

  it("stops at the row cap and cancels server-side", async () => {
    const rows = Array.from({ length: 10 }, (_, i) => [i, `row ${i}`]);
    const pool = fakePool({ columns: COLUMNS, recordsets: [rows] });
    const client = new SqlClient({ config: db, connect: vi.fn().mockResolvedValue(pool) });
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await client.query("SELECT * FROM SR_Service", { maxRows: 3 });

    expect(result.rows).toHaveLength(3);
    expect(result.truncatedBy).toBe("row_cap");
    expect(pool.requests[0]?.cancelled).toBe(1);
    errors.mockRestore();
  });

  it("stops at the character budget", async () => {
    const rows = Array.from({ length: 50 }, (_, i) => [i, "x".repeat(200)]);
    const pool = fakePool({ columns: COLUMNS, recordsets: [rows] });
    const client = new SqlClient({ config: db, connect: vi.fn().mockResolvedValue(pool) });
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await client.query("SELECT * FROM SR_Service", {
      maxRows: 1_000,
      charBudget: 500,
    });

    expect(result.truncatedBy).toBe("char_budget");
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.rows.length).toBeLessThan(50);
    errors.mockRestore();
  });

  it("keeps only the first result set", async () => {
    const pool = fakePool({ columns: COLUMNS, recordsets: [[[1, "a"]], [[2, "b"]]] });
    const client = new SqlClient({ config: db, connect: vi.fn().mockResolvedValue(pool) });
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await client.query("SELECT 1; SELECT 2");

    expect(result.rows).toEqual([[1, "a"]]);
    expect(result.truncatedBy).toBe("extra_recordsets");
    errors.mockRestore();
  });

  it("normalizes a statement error and never leaks the connection", async () => {
    const pool = {
      request: () => ({
        stream: false,
        arrayRowMode: false,
        on() {
          return this;
        },
        cancel() {},
        query: () =>
          Promise.reject(
            Object.assign(new Error("Invalid object name 'Tickets' on sqlhost/cwwebapp_acme"), {
              code: "EREQUEST",
              number: 208,
            })
          ),
      }),
      close: () => Promise.resolve(),
    } as unknown as SqlPoolLike;
    const client = new SqlClient({ config: db, connect: vi.fn().mockResolvedValue(pool) });

    const error = await client.query("SELECT * FROM Tickets").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(SqlError);
    expect((error as SqlError).number).toBe(208);
    expect((error as SqlError).detail).not.toContain("sqlhost");
    expect((error as SqlError).detail).not.toContain("cwwebapp_acme");
  });

  it("closes idempotently", async () => {
    const pool = fakePool({ columns: COLUMNS, recordsets: [[[1, "a"]]] });
    const client = new SqlClient({ config: db, connect: vi.fn().mockResolvedValue(pool) });
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});

    await client.query("SELECT 1");
    await client.close();
    await client.close();

    expect(pool.closed).toBe(1);
    errors.mockRestore();
  });
});
