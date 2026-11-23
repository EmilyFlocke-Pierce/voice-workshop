// The word check. Judging words hold an observation back. Technical terms become plain ones.
// The check reads the workshop's own wording only. Quoted text belongs to the agent and passes through as written.
import type { Observation } from "../types.ts";

export const JUDGING = [
  "good", "bad", "weak", "strong", "better", "worse", "best", "worst", "should", "effective", "ineffective",
  "works", "work well", "great", "nice", "poor", "powerful", "compelling", "awkward", "clumsy", "improve", "needs to", "must",
];

export const PLAIN: [RegExp, string][] = [
  [/\banaphora\b/gi, "lines start the same way"],
  [/\bepistrophe\b/gi, "lines end the same way"],
  [/\bhedg(e|es|ing)\b/gi, "softening words"],
  [/\bdiction\b/gi, "word choice"],
  [/\bsyntax\b/gi, "sentence shape"],
  [/\bcadence\b/gi, "rhythm"],
  [/\benjambment\b/gi, "lines run on past the break"],
  [/\bparataxis\b/gi, "short clauses side by side"],
  [/\basyndeton\b/gi, "a list without 'and'"],
  [/\bpolysyndeton\b/gi, "a list joined by repeated 'and'"],
  [/\balliteration\b/gi, "words that start with the same sound"],
  [/\bsibilance\b/gi, "repeated s sounds"],
  [/\bcaesura\b/gi, "a pause inside the line"],
  [/\bjuxtaposition\b/gi, "two things placed side by side"],
  [/\bmotif\b/gi, "a repeated image"],
];

const QUOTED = /"[^"]*"|\u201c[^\u201d]*\u201d/g;

function outsideQuotes(s: string, fn: (part: string) => string): string {
  let out = "";
  let last = 0;
  for (const m of s.matchAll(QUOTED)) {
    out += fn(s.slice(last, m.index)) + m[0];
    last = (m.index ?? 0) + m[0].length;
  }
  return out + fn(s.slice(last));
}

export function plainWords(o: Observation): Observation {
  const swap = (part: string) => PLAIN.reduce((acc, [re, plain]) => acc.replace(re, plain), part);
  return { ...o, feature: outsideQuotes(o.feature, swap), pattern: outsideQuotes(o.pattern, swap), where: outsideQuotes(o.where, swap) };
}

export function judgingWord(o: Observation): string | null {
  const own = [o.feature, o.where, o.pattern].map((s) => s.replace(QUOTED, " ")).join(" ").toLowerCase();
  return JUDGING.find((w) => new RegExp(`\\b${w}\\b`).test(own)) ?? null;
}
