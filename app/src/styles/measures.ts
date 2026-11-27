// The five measures, by third and for the whole piece, each put in a band with fixed edges.
// The middle band includes both of its edges.
import { sentencesOf, wordsOf, type Sentence } from "../feedback/text.ts";
import { BANDS, MEASURES, type Measure, type Targets } from "./catalog.ts";
import { registerOf } from "./registers.ts";

export type Values = Record<Measure, number>;
export type Bands = Record<Measure, string>;

const EDGES: Record<Measure, [number, number]> = {
  sentence_words: [12, 22],
  clauses: [1.8, 3],
  openings: [0.2, 0.4],
  register: [-1, 1],
  questions: [0.05, 0.25],
};

export function bandOf(m: Measure, v: number): string {
  const [lo, hi] = EDGES[m];
  return v < lo ? BANDS[m][0] : v > hi ? BANDS[m][2] : BANDS[m][1];
}

export const bandsOf = (v: Values): Bands => Object.fromEntries(MEASURES.map((m) => [m, bandOf(m, v[m])])) as Bands;

const JOINS = new Set(["and", "but", "or", "nor", "yet", "so"]);
const round = (n: number) => Math.round(n * 100) / 100;

export function valuesOf(ss: Sentence[]): Values {
  const n = ss.length;
  if (n === 0) return { sentence_words: 0, clauses: 0, openings: 0, register: 0, questions: 0 };
  const words = ss.flatMap((s) => s.words);
  const meanWords = words.length / n;
  const clauses = ss.map((s) => 1 + (s.text.match(/[,;:]/g)?.length ?? 0) + s.words.filter((w) => JOINS.has(w)).length).reduce((a, b) => a + b, 0) / n;
  const firsts = ss.map((s) => s.words[0]);
  const openings = firsts.filter((f, i) => firsts.some((g, j) => j !== i && g === f)).length / n;
  let formal = 0;
  let casual = 0;
  for (const w of words) {
    const r = registerOf(w);
    if (r === "formal") formal++;
    else if (r === "casual") casual++;
  }
  const register = words.length ? ((formal - casual) * 100) / words.length : 0;
  const questions = ss.filter((s) => /\?["'\u201d\u2019)\]]*$/.test(s.text)).length / n;
  return { sentence_words: round(meanWords), clauses: round(clauses), openings: round(openings), register: round(register), questions: round(questions) };
}

export interface ThirdMap {
  third: "opening" | "middle" | "end";
  sentences: { from: number; to: number } | null;
  first_sentence: string | null;
  values: Values;
  bands: Bands;
}

export function thirdsOf(text: string): { whole: { values: Values; bands: Bands; sentence_count: number }; thirds: ThirdMap[] } {
  const ss = sentencesOf(text);
  const whole = valuesOf(ss);
  const thirds = (["opening", "middle", "end"] as const).map((third) => {
    const part = ss.filter((s) => s.third === third);
    const values = valuesOf(part);
    return { third, sentences: part.length ? { from: part[0].index + 1, to: part[part.length - 1].index + 1 } : null, first_sentence: part[0]?.text ?? null, values, bands: bandsOf(values) };
  });
  return { whole: { values: whole, bands: bandsOf(whole), sentence_count: ss.length }, thirds };
}

export function wholeValues(text: string): Values {
  return valuesOf(sentencesOf(text));
}

// The usual: the mean of each measure across the given pieces, then banded.
export function usualOf(texts: string[]): { values: Values; bands: Bands; rests_on: number } | null {
  if (!texts.length) return null;
  const all = texts.map(wholeValues);
  const values = Object.fromEntries(MEASURES.map((m) => [m, round(all.reduce((a, v) => a + v[m], 0) / all.length)])) as Values;
  return { values, bands: bandsOf(values), rests_on: texts.length };
}

export interface DriftMark {
  third: string;
  measures: Measure[];
  back_to_usual: Measure[];
  elsewhere: Measure[];
  quote: string;
}

// A third drifts when, on at least 2 measures the style sets, its band differs from the target.
// The mark names which of those sit in the usual's band and which sit elsewhere. Back to the usual is one case.
export function driftMarks(thirds: ThirdMap[], targets: Targets, usual: Bands | null): DriftMark[] {
  const out: DriftMark[] = [];
  for (const t of thirds) {
    if (!t.sentences) continue;
    const away = MEASURES.filter((m) => targets[m] !== "any" && t.bands[m] !== targets[m]);
    if (away.length < 2) continue;
    const back_to_usual = usual ? away.filter((m) => t.bands[m] === usual[m]) : [];
    const elsewhere = usual ? away.filter((m) => t.bands[m] !== usual[m]) : away;
    out.push({ third: t.third, measures: away, back_to_usual, elsewhere, quote: t.first_sentence ?? "" });
  }
  return out;
}

// Measures where a style's set target differs from the usual's band. Used to find styles far from the usual.
export function distanceFromUsual(targets: Targets, usual: Bands): number {
  return MEASURES.filter((m) => targets[m] !== "any" && targets[m] !== usual[m]).length;
}

export { wordsOf };
