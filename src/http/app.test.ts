import { describe, expect, it, vi } from "vitest";
import type { Request } from "express";
import type { ServerConfig } from "../config.js";
import { resolveAuth, sessionToolsets } from "./app.js";

function makeRequest(headers: Record<string, string>): Request {
  const lowered: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) lowered[key.toLowerCase()] = value;
  return { headers: lowered } as unknown as Request;
}

const configWithToolsets = (
  toolsets: ServerConfig["toolsets"],
  db?: ServerConfig["db"]
): ServerConfig => ({ toolsets, db }) as ServerConfig;

describe("resolveAuth (BYOK)", () => {
  it("binds the member keys and derives a stable label + hash", () => {
    const auth = resolveAuth(
      makeRequest({
        "x-cw-public-key": "pub1",
        "x-cw-private-key": "priv1",
        "x-cw-member-id": "jdoe",
      })
    );
    expect(auth).toMatchObject({
      ok: true,
      credentials: { publicKey: "pub1", privateKey: "priv1", memberIdentifier: "jdoe" },
    });
    if (auth.ok) {
      expect(auth.keyHash).toHaveLength(64);
      expect(auth.label).toBe(`byok:${auth.keyHash.slice(0, 8)}`);
    }
  });

  it("member id is optional", () => {
    const auth = resolveAuth(makeRequest({ "x-cw-public-key": "pub1", "x-cw-private-key": "priv1" }));
    expect(auth).toMatchObject({ ok: true, credentials: { memberIdentifier: undefined } });
  });

  it("rejects a request with no keys", () => {
    const auth = resolveAuth(makeRequest({}));
    expect(auth).toMatchObject({ ok: false, status: 401 });
    if (!auth.ok) expect(auth.message).toContain("x-cw-public-key");
  });

  it("requires both key headers", () => {
    const noPriv = resolveAuth(makeRequest({ "x-cw-public-key": "pub1" }));
    expect(noPriv).toMatchObject({ ok: false, status: 401 });
    if (!noPriv.ok) expect(noPriv.message).toContain("x-cw-private-key");

    const noPub = resolveAuth(makeRequest({ "x-cw-private-key": "priv1" }));
    expect(noPub).toMatchObject({ ok: false, status: 401 });
  });

  it("key hash is stable per pair and distinct across pairs", () => {
    const a1 = resolveAuth(makeRequest({ "x-cw-public-key": "p", "x-cw-private-key": "s" }));
    const a2 = resolveAuth(makeRequest({ "x-cw-public-key": "p", "x-cw-private-key": "s" }));
    const b = resolveAuth(makeRequest({ "x-cw-public-key": "p", "x-cw-private-key": "other" }));
    if (a1.ok && a2.ok && b.ok) {
      expect(a1.keyHash).toBe(a2.keyHash);
      expect(a1.keyHash).not.toBe(b.keyHash);
    } else {
      throw new Error("expected all to authenticate");
    }
  });
});

describe("sessionToolsets", () => {
  const config = configWithToolsets(["tickets", "time", "companies", "configurations"]);

  it("falls back to the config default when no header is present", () => {
    expect(sessionToolsets(makeRequest({}), config)).toEqual(config.toolsets);
  });

  it("uses the x-cw-toolsets header when present", () => {
    expect(sessionToolsets(makeRequest({ "x-cw-toolsets": "invoicing" }), config)).toEqual([
      "finance",
      "time",
      "companies",
    ]);
  });

  it("ignores unknown header tokens without throwing", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(sessionToolsets(makeRequest({ "x-cw-toolsets": "finance,bogus" }), config)).toEqual([
      "finance",
    ]);
    spy.mockRestore();
  });
});

describe("sessionToolsets and the database-backed sql toolset", () => {
  const withoutDb = configWithToolsets(["tickets", "time"]);
  const withDb = configWithToolsets(["tickets", "time"], {
    database: "cwwebapp_acme",
  } as ServerConfig["db"]);

  it("drops sql, with a warning, when no database is configured", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(sessionToolsets(makeRequest({ "x-cw-toolsets": "tickets,sql" }), withoutDb)).toEqual([
      "tickets",
    ]);
    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
  });

  it("keeps sql when the server has a database", () => {
    expect(sessionToolsets(makeRequest({ "x-cw-toolsets": "tickets,sql" }), withDb)).toEqual([
      "tickets",
      "sql",
    ]);
  });

  it("falls back rather than leaving a session with no tools at all", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(sessionToolsets(makeRequest({ "x-cw-toolsets": "sql" }), withoutDb)).toEqual(
      withoutDb.toolsets
    );
    spy.mockRestore();
  });

  it("never adds sql implicitly", () => {
    expect(sessionToolsets(makeRequest({}), withDb)).toEqual(withDb.toolsets);
  });
});
