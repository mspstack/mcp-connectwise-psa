/**
 * Toolsets — capability groups that can be enabled per session.
 *
 * A session exposes only the tools in its selected toolsets, so a dispatcher
 * or a billing user can be narrowed to their slice of the surface. Selection comes
 * from the `x-cw-toolsets` header (HTTP) or the `CW_TOOLSETS` env / `--toolsets`
 * flag (stdio); both accept a comma-separated list mixing capability keys and
 * persona presets. This is a surface/usability filter, not access control —
 * ConnectWise still enforces the member's real security role.
 */

export const TOOLSET_KEYS = [
  "tickets",
  "time",
  "companies",
  "configurations",
  "schedule",
  "finance",
  "advanced",
] as const;

export type ToolsetKey = (typeof TOOLSET_KEYS)[number];

const TECH: ToolsetKey[] = ["tickets", "time", "companies", "configurations"];

/** Persona presets — convenient shortcuts that expand to a set of keys. */
export const PRESETS: Record<string, ToolsetKey[]> = {
  tech: TECH,
  dispatch: ["tickets", "schedule", "companies", "configurations"],
  invoicing: ["finance", "time", "companies"],
  all: [...TOOLSET_KEYS],
};

/**
 * The default selection when nothing is specified — the full surface, including
 * `advanced`. A session narrows it (`x-cw-toolsets` / `CW_TOOLSETS`) rather than
 * having to opt in; ConnectWise still enforces the member's security role.
 */
export const DEFAULT_TOOLSETS: ToolsetKey[] = [...TOOLSET_KEYS];

const KEY_SET = new Set<string>(TOOLSET_KEYS);

function isToolsetKey(value: string): value is ToolsetKey {
  return KEY_SET.has(value);
}

export class UnknownToolsetError extends Error {}

/**
 * Resolve a raw comma-separated list (keys and/or preset names) to a deduped,
 * order-stable list of toolset keys.
 *
 * @param raw       the header / env value, or undefined/empty
 * @param fallback  used when `raw` is undefined/blank/only-separators
 * @param onUnknown "throw" (config/env — fail loudly) or "warn" (request header —
 *                  ignore the bad token, keep the rest, never 500)
 */
export function resolveToolsets(
  raw: string | undefined,
  fallback: ToolsetKey[],
  onUnknown: "throw" | "warn" = "throw"
): ToolsetKey[] {
  const tokens = (raw ?? "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0);

  if (tokens.length === 0) return dedupe(fallback);

  const keys: ToolsetKey[] = [];
  for (const token of tokens) {
    const preset = PRESETS[token];
    if (preset) {
      keys.push(...preset);
    } else if (isToolsetKey(token)) {
      keys.push(token);
    } else if (onUnknown === "throw") {
      throw new UnknownToolsetError(
        `Unknown toolset "${token}" — expected keys (${TOOLSET_KEYS.join(", ")}) ` +
          `or presets (${Object.keys(PRESETS).join(", ")}).`
      );
    } else {
      console.error(`[toolsets] ignoring unknown toolset "${token}" in x-cw-toolsets header.`);
    }
  }

  const resolved = dedupe(keys);
  // An all-unknown "warn" list would otherwise silently expose nothing.
  return resolved.length > 0 ? resolved : dedupe(fallback);
}

/** Dedupe while preserving first-seen order and TOOLSET_KEYS ordering intent. */
function dedupe(keys: ToolsetKey[]): ToolsetKey[] {
  const seen = new Set<ToolsetKey>();
  const out: ToolsetKey[] = [];
  for (const key of keys) {
    if (!seen.has(key)) {
      seen.add(key);
      out.push(key);
    }
  }
  return out;
}
