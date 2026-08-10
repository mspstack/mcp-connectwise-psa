#!/usr/bin/env node
/**
 * Print the version of this server that registry.modelcontextprotocol.io
 * currently lists as latest — empty when it isn't published at all.
 *
 * Used by .github/workflows/mcp-registry-publish.yml to skip a redundant
 * publish and to verify one landed. The search endpoint matches loosely (other
 * namespaces publish a server with the same short name), so the result is
 * filtered on the exact `server.json` name. Its index is eventually consistent
 * — a freshly published version can take a few seconds to show up, hence the
 * caller polls.
 */

import { readFileSync } from "node:fs";

const name = JSON.parse(readFileSync("server.json", "utf8")).name;
const url =
  "https://registry.modelcontextprotocol.io/v0/servers" +
  `?search=${encodeURIComponent(name)}&version=latest`;

const response = await fetch(url);
if (!response.ok) {
  console.error(`registry query failed: ${response.status} ${response.statusText}`);
  process.exit(1);
}

const { servers = [] } = await response.json();
const match = servers.map((s) => s.server ?? s).find((s) => s.name === name);
console.log(match?.version ?? "");
