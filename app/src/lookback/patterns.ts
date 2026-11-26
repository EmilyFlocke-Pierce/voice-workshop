// Counting a named pattern the same way every time. The agent sets the rule and the denominator; the code counts.
import { sentencesOf, wordsOf } from "../feedback/text.ts";
import { latestVersions, type Corpus } from "./corpus.ts";

export interface Instance { piece: string; quote: string }
export type Denominator = "default" | "every" | string[];

export function denominatorLabels(c: Corpus, d: Denominator): string[] {
  if (d === "every") return c.pieces.map((p) => p.label);
  if (d === "default") return latestVersions(c);
  return c.pieces.map((p) => p.label).filter((l) => d.includes(l));
}

// Each instance names a piece label and quotes it word for word.
export function checkInstances(c: Corpus, instances: Instance[]): { piece: string; quote: string; why: string }[] {
  const bad = [];
  for (const i of instances) {
    const p = c.pieces.find((x) => x.label === i.piece);
    if (!p) bad.push({ ...i, why: "no piece with that label in this lookback" });
    else if (!c.byTry.get(p.try_id)!.text.includes(i.quote)) bad.push({ ...i, why: "these words are not in that piece as written" });
  }
  return bad;
}

export function countPattern(c: Corpus, instances: Instance[], d: Denominator) {
  const per: Record<string, number> = {};
  for (const i of instances) per[i.piece] = (per[i.piece] ?? 0) + 1;
  const denom = denominatorLabels(c, d);
  const appearsIn = denom.filter((l) => per[l]);
  return {
    per_piece: per,
    corpus_total: instances.length,
    pieces_with_it: Object.keys(per).length,
    denominator: { rule: Array.isArray(d) ? "a subset you named" : d === "every" ? "every try in the corpus" : "the latest version of each retry chain", pieces: denom, size: denom.length },
    appearance_rate: denom.length ? Math.round((appearsIn.length / denom.length) * 1000) / 1000 : 0,
    appears_in_denominator: appearsIn,
    reading: `${appearsIn.length} of ${denom.length} pieces in the denominator show it at least once; ${instances.length} instances in all. A piece with several instances counts once in the rate.`,
  };
}

// Rank patterns by appearance rate, ties sharing a rank, and flag close rates.
export function rankPatterns(rows: { id: string; name: string; rate: number; size: number }[]) {
  const sorted = [...rows].sort((a, b) => b.rate - a.rate);
  let rank = 0;
  let prev: number | null = null;
  return sorted.map((r, i) => {
    if (r.rate !== prev) rank = i + 1;
    prev = r.rate;
    const close = sorted.filter((o) => o.id !== r.id && Math.abs(o.rate - r.rate) <= 0.05).map((o) => o.name);
    return { ...r, rank, tied: sorted.filter((o) => o.rate === r.rate).length > 1, close_to: close };
  });
}

// The pattern across pieces in order: first appearance, gaps, returns, and the pieces where it breaks.
export function timeline(c: Corpus, per: Record<string, number>, denom: string[]) {
  const rows = c.pieces.map((p) => ({ label: p.label, style: p.style.value, has_it: !!per[p.label], in_denominator: denom.includes(p.label) }));
  const first = rows.find((r) => r.has_it)?.label ?? null;
  const gaps: string[][] = [];
  const returns: string[] = [];
  let seen = false;
  let gap: string[] = [];
  for (const r of rows) {
    if (r.has_it) {
      if (seen && gap.length) {
        gaps.push(gap);
        returns.push(r.label);
      }
      seen = true;
      gap = [];
    } else if (seen) gap.push(r.label);
  }
  const breaks = seen ? rows.filter((r) => r.in_denominator && !r.has_it && first && c.pieces.findIndex((p) => p.label === r.label) > c.pieces.findIndex((p) => p.label === first)).map((r) => r.label) : [];
  return { pieces: rows, first_appearance: first, gaps, returns, breaks_after_first: breaks };
}

// One number for every piece in order. A zero shows as 0.
export const COMPARE_MEASURES = ["sentence_words", "sentence_count", "closing_words", "opening_repeat", "question_share"] as const;
export type CompareMeasure = (typeof COMPARE_MEASURES)[number];

export function measureOf(text: string, m: CompareMeasure): number {
  const ss = sentencesOf(text);
  const n = ss.length;
  const r = (x: number) => Math.round(x * 100) / 100;
  if (!n) return 0;
  if (m === "sentence_count") return n;
  if (m === "sentence_words") return r(wordsOf(text).length / n);
  if (m === "closing_words") return ss[n - 1].words.length;
  if (m === "question_share") return r(ss.filter((s) => /\?["'\u201d\u2019)\]]*$/.test(s.text)).length / n);
  const firsts = ss.map((s) => s.words[0]);
  return r(firsts.filter((f, i) => firsts.some((g, j) => j !== i && g === f)).length / n);
}
