import { describe, expect, it } from "vitest";
import {
  ConfigError,
  loadConfig,
  loadDbConfig,
  normalizeSite,
  parseBoolEnv,
  parseDbHost,
  parseIntEnv,
} from "./config.js";
import { PRESETS } from "./tools/toolsets.js";

const baseEnv = {
  CW_SITE: "support.example.com",
  CW_COMPANY_ID: "acme",
  CW_CLIENT_ID: "client-guid",
} as NodeJS.ProcessEnv;

describe("normalizeSite", () => {
  it("accepts bare hosts, URLs, and full API URLs", () => {
    expect(normalizeSite("support.example.com")).toBe("support.example.com");
    expect(normalizeSite("https://support.example.com")).toBe("support.example.com");
    expect(normalizeSite("https://support.example.com/v4_6_release/apis/3.0/")).toBe(
      "support.example.com"
    );
  });
});

describe("loadConfig", () => {
  it("builds an http config without server keys (BYOK)", () => {
    const config = loadConfig(["--transport", "http"], baseEnv);
    expect(config).toMatchObject({
      transport: "http",
      site: "support.example.com",
      companyId: "acme",
      publicKey: undefined,
    });
  });

  it("requires keys for stdio", () => {
    expect(() => loadConfig([], baseEnv)).toThrow(ConfigError);
    const config = loadConfig([], {
      ...baseEnv,
      CW_PUBLIC_KEY: "pub",
      CW_PRIVATE_KEY: "priv",
    } as NodeJS.ProcessEnv);
    expect(config.publicKey).toBe("pub");
  });

  it("rejects a lone public or private key", () => {
    expect(() =>
      loadConfig(["--transport", "http"], { ...baseEnv, CW_PUBLIC_KEY: "pub" } as NodeJS.ProcessEnv)
    ).toThrow(ConfigError);
  });

  it("rejects missing site/company/clientId", () => {
    expect(() => loadConfig(["--transport", "http"], { CW_COMPANY_ID: "a", CW_CLIENT_ID: "b" } as NodeJS.ProcessEnv)).toThrow(ConfigError);
    expect(() => loadConfig(["--transport", "http"], { CW_SITE: "x", CW_CLIENT_ID: "b" } as NodeJS.ProcessEnv)).toThrow(ConfigError);
    expect(() => loadConfig(["--transport", "http"], { CW_SITE: "x", CW_COMPANY_ID: "a" } as NodeJS.ProcessEnv)).toThrow(ConfigError);
  });

  it("defaults toolsets to the all preset (everything except the opt-in sql)", () => {
    const config = loadConfig(["--transport", "http"], baseEnv);
    expect(config.toolsets).toEqual(PRESETS.all);
    expect(config.toolsets).not.toContain("sql");
  });

  it("parses CW_TOOLSETS (keys and presets)", () => {
    const config = loadConfig(["--transport", "http"], { ...baseEnv, CW_TOOLSETS: "dispatch,finance" } as NodeJS.ProcessEnv);
    expect(config.toolsets).toEqual(["tickets", "schedule", "companies", "configurations", "finance"]);
  });

  it("--toolsets flag overrides and unknown keys throw ConfigError", () => {
    expect(loadConfig(["--transport", "http", "--toolsets", "finance"], baseEnv).toolsets).toEqual(["finance"]);
    expect(() =>
      loadConfig(["--transport", "http"], { ...baseEnv, CW_TOOLSETS: "tickets,bogus" } as NodeJS.ProcessEnv)
    ).toThrow(ConfigError);
  });
});

const dbEnv = {
  CW_DB_HOST: "sqlhost",
  CW_DB_NAME: "cwwebapp_acme",
  CW_DB_USER: "cw_mcp_ro",
  CW_DB_PASSWORD: "s3kr3t",
} as NodeJS.ProcessEnv;

describe("parseDbHost", () => {
  it("splits a named instance and rejects empty parts", () => {
    expect(parseDbHost("sqlhost")).toEqual({ host: "sqlhost", instanceName: undefined });
    expect(parseDbHost("sqlhost\\CWPROD")).toEqual({ host: "sqlhost", instanceName: "CWPROD" });
    expect(() => parseDbHost("sqlhost\\")).toThrow(ConfigError);
    expect(() => parseDbHost("\\CWPROD")).toThrow(ConfigError);
  });
});

describe("parseBoolEnv / parseIntEnv", () => {
  it("accepts the usual spellings and falls back when blank", () => {
    for (const raw of ["true", "TRUE", "1", "yes", "on"]) {
      expect(parseBoolEnv(raw, "CW_DB_ENCRYPT", false)).toBe(true);
    }
    for (const raw of ["false", "0", "no", "off"]) {
      expect(parseBoolEnv(raw, "CW_DB_ENCRYPT", true)).toBe(false);
    }
    expect(parseBoolEnv("", "CW_DB_ENCRYPT", true)).toBe(true);
    expect(parseBoolEnv(undefined, "CW_DB_ENCRYPT", false)).toBe(false);
    expect(() => parseBoolEnv("maybe", "CW_DB_ENCRYPT", true)).toThrow(/CW_DB_ENCRYPT/);
  });

  it("bounds integers", () => {
    expect(parseIntEnv(undefined, "CW_DB_PORT", 1433, 1, 65535)).toBe(1433);
    expect(parseIntEnv("1434", "CW_DB_PORT", 1433, 1, 65535)).toBe(1434);
    expect(() => parseIntEnv("0", "CW_DB_PORT", 1433, 1, 65535)).toThrow(ConfigError);
    expect(() => parseIntEnv("70000", "CW_DB_PORT", 1433, 1, 65535)).toThrow(ConfigError);
    expect(() => parseIntEnv("abc", "CW_DB_PORT", 1433, 1, 65535)).toThrow(ConfigError);
  });
});

describe("loadDbConfig", () => {
  it("returns undefined when the group is absent, including MCPB empty strings", () => {
    expect(loadDbConfig({} as NodeJS.ProcessEnv)).toBeUndefined();
    expect(
      loadDbConfig({
        CW_DB_HOST: "",
        CW_DB_NAME: "",
        CW_DB_USER: "",
        CW_DB_PASSWORD: "",
      } as NodeJS.ProcessEnv)
    ).toBeUndefined();
  });

  it("applies every default", () => {
    expect(loadDbConfig(dbEnv)).toEqual({
      host: "sqlhost",
      instanceName: undefined,
      port: 1433,
      database: "cwwebapp_acme",
      user: "cw_mcp_ro",
      password: "s3kr3t",
      encrypt: true,
      trustServerCertificate: true,
      readUncommitted: true,
      queryTimeoutMs: 30_000,
      maxRows: 200,
      queryLibraryPath: undefined,
    });
  });

  it("requires the four core variables together", () => {
    for (const key of ["CW_DB_HOST", "CW_DB_NAME", "CW_DB_USER", "CW_DB_PASSWORD"] as const) {
      const partial = { ...dbEnv };
      delete partial[key];
      expect(() => loadDbConfig(partial)).toThrow(/must be set together/);
    }
  });

  it("rejects a port alongside a named instance", () => {
    expect(() =>
      loadDbConfig({ ...dbEnv, CW_DB_HOST: "sqlhost\\CWPROD", CW_DB_PORT: "1433" })
    ).toThrow(/named instance/);
    expect(loadDbConfig({ ...dbEnv, CW_DB_HOST: "sqlhost\\CWPROD" })).toMatchObject({
      instanceName: "CWPROD",
      port: undefined,
    });
  });

  it("bounds the tunables", () => {
    expect(() => loadDbConfig({ ...dbEnv, CW_DB_MAX_ROWS: "0" })).toThrow(ConfigError);
    expect(() => loadDbConfig({ ...dbEnv, CW_DB_QUERY_TIMEOUT_MS: "500" })).toThrow(ConfigError);
    expect(loadDbConfig({ ...dbEnv, CW_DB_MAX_ROWS: "50" })).toMatchObject({ maxRows: 50 });
  });
});

describe("loadConfig + the sql toolset", () => {
  it("leaves db undefined when CW_DB_* is unset", () => {
    expect(loadConfig(["--transport", "http"], baseEnv).db).toBeUndefined();
  });

  it("rejects the sql toolset without a database", () => {
    expect(() =>
      loadConfig(["--transport", "http"], { ...baseEnv, CW_TOOLSETS: "all,sql" })
    ).toThrow(/CW_DB_HOST/);
    expect(() =>
      loadConfig(["--transport", "http", "--toolsets", "sql"], baseEnv)
    ).toThrow(ConfigError);
  });

  it("allows the sql toolset once the database is configured", () => {
    const config = loadConfig(["--transport", "http"], {
      ...baseEnv,
      ...dbEnv,
      CW_TOOLSETS: "all,sql",
    });
    expect(config.toolsets).toContain("sql");
    expect(config.db).toMatchObject({ database: "cwwebapp_acme" });
  });

  it("keeps a configured database dormant until a session asks for sql", () => {
    const config = loadConfig(["--transport", "http"], { ...baseEnv, ...dbEnv });
    expect(config.db).toBeDefined();
    expect(config.toolsets).not.toContain("sql");
  });
});
