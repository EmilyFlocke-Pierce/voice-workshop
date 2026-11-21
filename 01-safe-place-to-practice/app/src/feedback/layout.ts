// The layout, version 1: feature, where, "quote" (1 to 3, each with its place), and what recurs or changes.
// A line that fits no field goes to unplaced and to the layout flags, and the layout stays as it is
// until Emily agrees to a change. A change bumps LAYOUT_VERSION.
import type { Observation } from "../types.ts";

export const LAYOUT_VERSION = 1;
export const LAYOUT_FIELDS = ["feature", "where", "quotes", "pattern"] as const;

export function layoutMismatch(o: unknown, draft: string): string | null {
  if (!o || typeof o !== "object") return "the line is not an object with the four fields";
  const rec = o as Record<string, unknown>;
  const extra = Object.keys(rec).filter((k) => !(LAYOUT_FIELDS as readonly string[]).includes(k));
  if (extra.length) return `the line carries fields the layout has no place for: ${extra.join(", ")}`;
  for (const f of ["feature", "where", "pattern"]) {
    if (typeof rec[f] !== "string" || !(rec[f] as string).trim()) return `the line has no ${f}`;
  }
  const quotes = rec.quotes;
  if (!Array.isArray(quotes) || quotes.length < 1 || quotes.length > 3) return "the line needs 1 to 3 quotes";
  for (const q of quotes) {
    if (!q || typeof q.quote !== "string" || typeof q.place !== "string") return "a quote has no text or no place";
    if (!draft.includes(q.quote)) return "a quote does not appear in the draft as written";
  }
  return null;
}

// The shape of a line for the layout flags, with every quote and every quoted word replaced.
export function redacted(o: unknown): string {
  const hide = (s: unknown) => (typeof s === "string" ? s.replace(/"[^"]*"|\u201c[^\u201d]*\u201d/g, '"[agent words]"') : s);
  if (!o || typeof o !== "object") return JSON.stringify({ shape: typeof o });
  const rec = o as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rec)) {
    if (k === "quotes" && Array.isArray(v)) out[k] = v.map((q) => ({ quote: "[agent words]", place: q?.place ?? null }));
    else out[k] = typeof v === "string" ? hide(v) : typeof v;
  }
  return JSON.stringify(out);
}

export function asText(lines: Observation[]): string {
  return lines
    .map((o, i) => `${i + 1}. feature: ${o.feature}\n   where: ${o.where}\n${o.quotes.map((q) => `   quote: "${q.quote}" (${q.place})`).join("\n")}\n   pattern: ${o.pattern}`)
    .join("\n");
}
