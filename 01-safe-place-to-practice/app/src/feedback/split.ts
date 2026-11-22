// One observation per line. A line that holds two observations becomes two lines, each with its own
// subject and its own quotes. "also" inside one clause ("Colons also appear twice") is one observation.
// The joins that can mark two observations: a semicolon, a new sentence that starts with "Also",
// ", and" before a clause that carries "also", "and also", and two sentences under a feature that
// names two features.
//
// A join splits only when every part after it reads as a full observation:
// - its own subject and verb ("the pronoun moves to you"), kept as written, or
// - a verb phrase ("lengthen in the middle") that borrows the first part's subject, when that subject
//   comes out cleanly and agrees with the new verb.
// A part with no verb ("at the close", "less often") continues the observation before it, so the line
// stays one line, as written. A true two-point line whose second subject cannot be carried cleanly
// stays whole and goes to the layout flags with the reason. Every line out is either the reader's own
// words or a clean subject plus the reader's own verb phrase.
import type { Observation } from "../types.ts";

const FEATURE_JOIN = /\s+(?:and|&|\/)\s+/i;

// Verbs the reader uses to describe a draft, in base form. Forms are generated below.
const BASE_VERBS =
  "appear run get shorten lengthen use lean repeat start end sit show move come occur shift change grow drop stay return open close carry rise fall hold gather collect cluster settle thin thicken tighten loosen slow quicken drift fade build swell shrink break turn lead follow land sound read feel stand lie rest stop begin finish climb sink switch slip vary echo mirror outnumber crowd fill spread recur reappear double trail circle pile bunch narrow widen soften harden lift sag stretch press pull push reach arrive vanish disappear dominate outweigh outlast linger seem become remain keep".split(" ");
const IRREGULAR = "is are was were be been has have had does do did ran got sat came grew rose fell held built broke led began stood lay felt became kept shrank sank".split(" ");
const DOUBLE = new Set(["drop", "thin", "slip", "stop", "trail", "sag", "swell"].filter((v) => /[^aeiou][aeiou][bdgklmnprt]$/.test(v)));

function formsOf(base: string): string[] {
  const out = [base];
  if (/(s|sh|ch|x|z|o)$/.test(base)) out.push(base + "es");
  else if (/[^aeiou]y$/.test(base)) out.push(base.slice(0, -1) + "ies");
  else out.push(base + "s");
  if (base.endsWith("e")) out.push(base + "d");
  else if (/[^aeiou]y$/.test(base)) out.push(base.slice(0, -1) + "ied");
  else if (DOUBLE.has(base)) out.push(base + base.slice(-1) + "ed");
  else out.push(base + "ed");
  return out;
}
const VERBS = new Set([...BASE_VERBS.flatMap(formsOf), ...IRREGULAR]);

// Words that make the next word a noun ("the end", "at the close", "two starts").
const DETERMINERS = new Set("the a an this that these those its their his her my our your each every no some any many few several one two three four five six seven eight nine ten".split(" "));
const PREPOSITIONS = new Set("at in on to toward towards into onto from of near by across after before through over under with within around between for as than about along past beyond inside outside".split(" "));
// Words that never sit inside a clean subject phrase.
const NOT_IN_SUBJECT = new Set([...PREPOSITIONS, "and", "or", "but", "also", "not", "very", "more", "less", "most", "twice", "often", "again", "too", "then", "so"]);
// Subjects that point back at something, so a line that starts with one loses what it describes.
const POINTERS = new Set("they them it this these those he she that which".split(" "));
// Noun and verb homographs. At the start of a part, one of these followed by "to" or "of" reads as a place.
const HOMOGRAPHS = new Set("end ends start starts close closes open opens turn turns rise rises fall falls drop drops return returns".split(" "));

export interface SplitResult {
  lines: Observation[];
  keptWhole: Observation[];
  why?: string;
}

const hideQuoted = (s: string) => s.replace(/"[^"]*"|\u201c[^\u201d]*\u201d/g, (m) => "\u0000".repeat(m.length));

function cap(s: string): string {
  const t = s.trim().replace(/^also,?\s+/i, "").replace(/\s+also\b/i, "").replace(/[.\s]*$/, ".");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

const bare = (w: string) => w.toLowerCase().replace(/[^a-z]/g, "");

// The words of a clause, read from a copy with quoted text hidden, so a quote never reads as a verb.
// Each word keeps its start, so the clause's own text comes back out with its quotes intact.
interface Clause {
  text: string;
  words: string[];
  starts: number[];
}
function clauseOf(part: string): Clause {
  const text = part.trim().replace(/^also,?\s+/i, "").replace(/\s+also\b/i, "").replace(/[.\s]*$/, "");
  const words: string[] = [];
  const starts: number[] = [];
  for (const m of hideQuoted(text).matchAll(/\S+/g)) {
    words.push(m[0]);
    starts.push(m.index!);
  }
  return { text, words, starts };
}

// The main verb: the first known verb that no determiner or preposition makes into a noun.
function verbAt(words: string[]): number {
  for (let i = 0; i < words.length; i++) {
    const w = bare(words[i]);
    if (!VERBS.has(w) || words[i].includes("\u0000")) continue;
    const before = i > 0 ? bare(words[i - 1]) : "";
    if (DETERMINERS.has(before) || PREPOSITIONS.has(before)) continue;
    if (i === 0 && HOMOGRAPHS.has(w) && ["to", "of"].includes(bare(words[1] ?? ""))) return -1;
    return i;
  }
  return -1;
}

// A clean subject: the words before the main verb, with no preposition or adverb inside.
function cleanSubject(c: Clause, at: number): string | null {
  if (at <= 0) return null;
  const subject = c.words.slice(0, at);
  if (subject.some((w, i) => NOT_IN_SUBJECT.has(bare(w)) || (i > 0 && DETERMINERS.has(bare(w))))) return null;
  return c.text.slice(0, c.starts[at]).trim();
}

// Singular, plural, or either, read from the verb form.
function numberOf(verb: string): "one" | "many" | "either" {
  const v = bare(verb);
  if (["is", "was", "has", "does"].includes(v)) return "one";
  if (["are", "were", "have", "do", "be"].includes(v)) return "many";
  if (/ed$/.test(v) || IRREGULAR.includes(v)) return "either";
  return /[^s]s$/.test(v) ? "one" : "many";
}

type Part =
  | { kind: "own"; text: string }
  | { kind: "borrow"; verb: string; rest: string }
  | { kind: "continues" }
  | { kind: "pointer" };

function readPart(text: string): Part {
  const c = clauseOf(text);
  const at = verbAt(c.words);
  if (at < 0) return { kind: "continues" };
  if (at === 0) return { kind: "borrow", verb: c.words[0], rest: c.text };
  const subject = cleanSubject(c, at);
  if (!subject) return { kind: "continues" };
  if (POINTERS.has(bare(c.words[0]))) return { kind: "pointer" };
  return { kind: "own", text };
}

// Cuts the pattern at the joins listed above. Positions come from a copy with quoted text hidden,
// so words inside quotes never count as joins.
export function patternParts(pattern: string, featureCount: number): string[] {
  const hidden = hideQuoted(pattern);
  const cuts: [number, number][] = [];
  const add = (re: RegExp) => {
    for (const m of hidden.matchAll(re)) cuts.push([m.index!, m.index! + m[0].length]);
  };
  add(/;\s*/g);
  add(/\.\s+(?=also\b)/gi);
  add(/,\s+and\s+(?=[^,.;]*\balso\b)/gi);
  add(/\s+and also\s+/gi);
  if (featureCount >= 2) add(/\.\s+(?=[A-Z])/g);
  cuts.sort((a, b) => a[0] - b[0]);
  const parts: string[] = [];
  let last = 0;
  for (const [s, e] of cuts) {
    if (s < last) continue;
    parts.push(pattern.slice(last, s));
    last = e;
  }
  parts.push(pattern.slice(last));
  return parts.map((p) => p.trim()).filter((p) => p.replace(/[.\s]/g, "").length > 0);
}

export function splitLine(o: Observation): SplitResult {
  const featureParts = o.feature.split(FEATURE_JOIN).map((s) => s.trim()).filter(Boolean);
  const raw = patternParts(o.pattern, featureParts.length);
  const whole: SplitResult = { lines: [o], keptWhole: [] };
  if (raw.length < 2) return whole;
  const read = raw.slice(1).map(readPart);
  // A part with no verb continues the observation before it: one observation, kept as written.
  if (read.some((p) => p.kind === "continues")) return whole;
  const flag = (why: string): SplitResult => ({ lines: [], keptWhole: [o], why });
  if (read.some((p) => p.kind === "pointer"))
    return flag("the line holds two points, and the second starts with a pronoun, so a line of its own would lose what it describes");
  const parts: string[] = [cap(raw[0])];
  for (let i = 0; i < read.length; i++) {
    const p = read[i];
    if (p.kind === "own") {
      parts.push(cap(p.text));
      continue;
    }
    if (p.kind !== "borrow") return whole;
    const before = clauseOf(raw[i]);
    const at = verbAt(before.words);
    const subject = cleanSubject(before, at);
    if (!subject) return flag("the line holds two points, and the second needs a subject the workshop could not carry over cleanly");
    const a = numberOf(before.words[at]);
    const b = numberOf(p.verb);
    if (a !== "either" && b !== "either" && a !== b)
      return flag("the line holds two points, and the second point's verb does not agree with the first point's subject, so it stays as written");
    parts.push(cap(`${subject} ${p.rest}`));
  }
  const n = parts.length;
  if (o.quotes.length < n) return flag("the line holds two points, and splitting it would leave one point without a quote");
  const per = Math.floor(o.quotes.length / n);
  const lines: Observation[] = parts.map((pattern, i) => ({
    feature: featureParts.length === n ? cap(featureParts[i]).replace(/\.$/, "") : o.feature,
    where: o.where,
    quotes: o.quotes.slice(i * per, i === n - 1 ? undefined : (i + 1) * per),
    pattern,
  }));
  return { lines, keptWhole: [] };
}

// True when the line holds two observations, whether it splits or stays whole for the flags.
export function bundled(o: Observation): boolean {
  const r = splitLine(o);
  return r.lines.length >= 2 || r.keptWhole.length > 0;
}
