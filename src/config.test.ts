import { describe, expect, it } from "vitest";
import { ConfigError, loadConfig, normalizeSite } from "./config.js";
import { TOOLSET_KEYS } from "./tools/toolsets.js";

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

  it("defaults toolsets to the all preset (every capability, incl. advanced)", () => {
    const config = loadConfig(["--transport", "http"], baseEnv);
    expect(config.toolsets).toEqual([...TOOLSET_KEYS]);
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
