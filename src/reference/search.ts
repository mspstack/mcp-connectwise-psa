/**
 * Lexical search over the bundled reference catalogs (API endpoints, database
 * tables, saved queries).
 *
 * Deliberately simple: tokenize, score each document in three weighted buckets,
 * sort. No index, no stemming — the catalogs are small enough to scan, and a
 * model's query is usually a couple of nouns. Shared so the endpoint and
 * database catalogs rank the same way.
 */

export const STOP: ReadonlySet<string> = new Set([
  "the",
  "a",
  "an",
  "of",
  "for",
  "to",
  "and",
  "or",
  "in",
  "on",
  "by",
  "with",
  "how",
  "do",
  "i",
  "get",
  "list",
  "all",
  "cw",
]);

export function tokenize(value: string, extraStop?: ReadonlySet<string>): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1 && !STOP.has(token) && !extraStop?.has(token));
}

/** The three weighted buckets a document is matched against. */
export interface ScoreFields {
  strong: string;
  medium: string;
  weak: string;
}

export interface RankOptions<T> {
  topK?: number;
  /** Extra stopwords for this corpus (e.g. "table"/"column" for a SQL catalog). */
  extraStop?: ReadonlySet<string>;
  /** Additional score, e.g. for an exact name match. */
  bonus?: (item: T, tokens: string[]) => number;
  /** Applied at equal score, e.g. shorter name first. */
  tieBreak?: (a: T, b: T) => number;
}

/** Rank a catalog for a query. Pure. */
export function lexicalRank<T>(
  items: readonly T[],
  query: string,
  fields: (item: T) => ScoreFields,
  options: RankOptions<T> = {}
): T[] {
  const tokens = tokenize(query, options.extraStop);
  if (tokens.length === 0) return [];

  return items
    .map((item) => ({ item, score: scoreItem(item, tokens, fields, options.bonus) }))
    .filter((scored) => scored.score > 0)
    .sort((a, b) => b.score - a.score || (options.tieBreak?.(a.item, b.item) ?? 0))
    .slice(0, options.topK ?? 5)
    .map((scored) => scored.item);
}

function scoreItem<T>(
  item: T,
  tokens: string[],
  fields: (item: T) => ScoreFields,
  bonus?: (item: T, tokens: string[]) => number
): number {
  const { strong, medium, weak } = fields(item);
  const strongText = strong.toLowerCase();
  const mediumText = medium.toLowerCase();
  const weakText = weak.toLowerCase();

  let score = 0;
  for (const token of tokens) {
    // First match wins, so a token counts once at its strongest bucket.
    if (strongText.includes(token)) score += 3;
    else if (mediumText.includes(token)) score += 2;
    else if (weakText.includes(token)) score += 1;
  }
  return score > 0 ? score + (bonus?.(item, tokens) ?? 0) : 0;
}
