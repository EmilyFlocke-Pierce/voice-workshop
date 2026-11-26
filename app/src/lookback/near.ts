// Near-match wording: lowercase, strip one suffix from each word (s, es, ed, ing, ly),
// and treat two spans of the same length as near when they differ in one word.
import { wordsOf } from "../feedback/text.ts";

export function stem(w: string): string {
  for (const suf of ["ing", "ed", "ly"]) if (w.length > suf.length + 2 && w.endsWith(suf)) return w.slice(0, -suf.length);
  // "es" only after s, x, z, ch, or sh (boxes, wishes), so "lines" and "line" stay one stem.
  if (w.length > 4 && /(s|x|z|ch|sh)es$/.test(w)) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
}

export function isNear(a: string, b: string): boolean {
  const x = wordsOf(a).map(stem);
  const y = wordsOf(b).map(stem);
  if (x.length !== y.length || !x.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) diff++;
  return diff <= 1;
}

// Words with their character spans in the original text, so quotes are taken from the page as written.
export interface Tok {
  w: string;
  start: number;
  end: number;
}
const WORD = /[A-Za-z\u00c0-\u024f]+(?:['\u2019][A-Za-z]+)?/g;
export function tokens(text: string): Tok[] {
  const out: Tok[] = [];
  for (const m of text.matchAll(WORD)) out.push({ w: m[0].toLowerCase().replace(/\u2019/g, "'"), start: m.index!, end: m.index! + m[0].length });
  return out;
}
