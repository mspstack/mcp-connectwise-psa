/**
 * HTTP transport: Express app exposing
 *
 *   POST/GET/DELETE /mcp    MCP streamable-http endpoint (BYOK auth)
 *   GET  /health            liveness probe
 *
 * Authentication model — bring-your-own-keys only:
 *  - Every session presents its own ConnectWise member API keys via the
 *    x-cw-public-key + x-cw-private-key headers. Those keys are both the
 *    credential and the permission model: ConnectWise enforces that member's
 *    security role, and writes (notes, time entries) are attributed to that
 *    member. Optional x-cw-member-id names the member for "my tickets"/"my time".
 *  - The full tool surface is exposed; there is no MCP-level role gating.
 *  - A session id never carries privilege: every request re-authenticates and
 *    must present the same key pair (SHA-256 hash) the session was created with.
 *  - Exception: the `sql` toolset reads the ConnectWise database through a
 *    server-wide read-only login rather than the session's keys, so its results
 *    are not attributed to a member and not filtered by that member's security
 *    role. It exists only when the server has a database configured; where it
 *    does, every session that does not narrow its toolsets gets it.
 */

import { createHash, randomUUID } from "node:crypto";
import express, { type Request, type Response } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import type { ServerConfig } from "../config.js";
import type { CWCredentials } from "../cw/client.js";
import { createServer, SERVER_NAME, SERVER_VERSION } from "../server.js";
import { resolveToolsets, withoutDbToolsets, type ToolsetKey } from "../tools/toolsets.js";
import type { SqlContext } from "../tools/sql.js";

interface SessionRecord {
  transport: StreamableHTTPServerTransport;
  label: string;
  /** SHA-256 of the client-supplied key pair. */
  keyHash: string;
}

type AuthOutcome =
  | { ok: true; label: string; credentials: CWCredentials; keyHash: string }
  | { ok: false; status: number; code: number; message: string };

const sha256 = (value: string): string => createHash("sha256").update(value).digest("hex");

function rpcError(res: Response, status: number, code: number, message: string): void {
  res.status(status).json({ jsonrpc: "2.0", error: { code, message }, id: null });
}

const unauthorized = (message: string): AuthOutcome => ({
  ok: false,
  status: 401,
  code: -32001,
  message,
});

function headerValue(req: Request, name: string): string | undefined {
  const value = req.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

/** Resolve the principal for a request. Exported for tests. */
export function resolveAuth(req: Request): AuthOutcome {
  const clientPublic = headerValue(req, "x-cw-public-key");
  const clientPrivate = headerValue(req, "x-cw-private-key");
  const clientMember = headerValue(req, "x-cw-member-id");

  if (!clientPublic && !clientPrivate) {
    return unauthorized(
      "Supply your ConnectWise member API keys via the x-cw-public-key and x-cw-private-key headers."
    );
  }
  if (!clientPublic || !clientPrivate) {
    return unauthorized("Both x-cw-public-key and x-cw-private-key headers are required.");
  }

  const keyHash = sha256(`${clientPublic}:${clientPrivate}`);
  return {
    ok: true,
    label: `byok:${keyHash.slice(0, 8)}`,
    credentials: {
      publicKey: clientPublic,
      privateKey: clientPrivate,
      memberIdentifier: clientMember,
    },
    keyHash,
  };
}

function principalMatches(session: SessionRecord, auth: Extract<AuthOutcome, { ok: true }>): boolean {
  return session.keyHash === auth.keyHash;
}

/**
 * Toolsets for a new session: the x-cw-toolsets header narrows/widens within the
 * valid keys, falling back to the server default. Unknown tokens are ignored
 * (warn) rather than failing the request. Exported for tests.
 */
export function sessionToolsets(req: Request, config: ServerConfig): ToolsetKey[] {
  const resolved = resolveToolsets(headerValue(req, "x-cw-toolsets"), config.toolsets, "warn");
  if (config.db) return resolved;

  // No database on this server: drop the database-backed keys rather than
  // registering tools that could only fail.
  const pruned = withoutDbToolsets(resolved);
  if (pruned.length !== resolved.length) {
    console.error(
      '[toolsets] ignoring "sql" — no ConnectWise database is configured on this server.'
    );
  }
  // Same rule resolveToolsets applies to an all-unknown list: never hand back an
  // empty surface. config.toolsets cannot contain sql here (loadConfig rejects it).
  return pruned.length > 0 ? pruned : config.toolsets;
}

export function createApp(config: ServerConfig, sql?: SqlContext): express.Express {
  const app = express();
  app.use(express.json({ limit: "2mb" }));

  const sessions = new Map<string, SessionRecord>();

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", name: SERVER_NAME, version: SERVER_VERSION });
  });

  app.post("/mcp", (req: Request, res: Response) => {
    void (async () => {
      const auth = resolveAuth(req);
      if (!auth.ok) return rpcError(res, auth.status, auth.code, auth.message);

      const sessionId = headerValue(req, "mcp-session-id");
      if (sessionId) {
        const session = sessions.get(sessionId);
        if (!session) return rpcError(res, 404, -32000, "Session not found");
        if (!principalMatches(session, auth)) {
          return rpcError(res, 403, -32003, "Forbidden: credentials do not match this session");
        }
        await session.transport.handleRequest(req, res, req.body);
        return;
      }

      if (!isInitializeRequest(req.body)) {
        return rpcError(res, 400, -32600, "Bad request: expected an initialize request");
      }

      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (newSessionId) => {
          sessions.set(newSessionId, {
            transport,
            label: auth.label,
            keyHash: auth.keyHash,
          });
          console.error(`[auth] session ${newSessionId} created for ${auth.label}`);
        },
      });
      transport.onclose = () => {
        if (transport.sessionId) sessions.delete(transport.sessionId);
      };

      const server = createServer(
        config,
        {
          label: auth.label,
          credentials: auth.credentials,
          toolsets: sessionToolsets(req, config),
        },
        sql
      );
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    })().catch((err) => {
      console.error(`[http] POST /mcp failed: ${String(err)}`);
      if (!res.headersSent) rpcError(res, 500, -32603, "Internal server error");
    });
  });

  const handleSessionRequest = (req: Request, res: Response): void => {
    void (async () => {
      const auth = resolveAuth(req);
      if (!auth.ok) return rpcError(res, auth.status, auth.code, auth.message);

      const sessionId = headerValue(req, "mcp-session-id");
      const session = sessionId ? sessions.get(sessionId) : undefined;
      if (!session) return rpcError(res, 404, -32000, "Session not found");
      if (!principalMatches(session, auth)) {
        return rpcError(res, 403, -32003, "Forbidden: credentials do not match this session");
      }
      await session.transport.handleRequest(req, res);
    })().catch((err) => {
      console.error(`[http] ${req.method} /mcp failed: ${String(err)}`);
      if (!res.headersSent) rpcError(res, 500, -32603, "Internal server error");
    });
  };

  app.get("/mcp", handleSessionRequest);
  app.delete("/mcp", handleSessionRequest);

  return app;
}
