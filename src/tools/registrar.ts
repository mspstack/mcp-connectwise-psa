/**
 * Tool registration.
 *
 * Every tool is registered on the session's McpServer. There is no MCP-level
 * role gating: each session authenticates with a ConnectWise API member key
 * (its own, via BYOK, or the server-wide keys on stdio), and ConnectWise
 * enforces that member's security role server-side. The MCP server exposes the
 * full tool surface and lets the CW API be the access control.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ZodRawShape } from "zod";

export interface ToolAnnotations {
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
}

export interface ToolSpec {
  name: string;
  title: string;
  description: string;
  inputSchema: ZodRawShape;
  annotations: ToolAnnotations;
}

type ToolResult = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

/** Registers tools on an McpServer. */
export class ToolRegistrar {
  /**
   * The toolset whose tools are being registered right now. It rides along as
   * `_meta.group` on every tool so aggregators (the MSPStack gateway) can group
   * and bulk-switch by capability — without parsing tool names or spending
   * description tokens on a category prefix.
   */
  private group: string | undefined;

  constructor(private readonly server: McpServer) {}

  /** Tag every tool registered after this call with its toolset. */
  forToolset(group: string): this {
    this.group = group;
    return this;
  }

  register<Args extends Record<string, unknown>>(
    spec: ToolSpec,
    handler: (args: Args) => Promise<ToolResult>
  ): void {
    this.server.registerTool(
      spec.name,
      {
        title: spec.title,
        description: spec.description,
        inputSchema: spec.inputSchema,
        annotations: spec.annotations,
        ...(this.group ? { _meta: { group: this.group } } : {}),
      },
      handler as never
    );
  }
}
