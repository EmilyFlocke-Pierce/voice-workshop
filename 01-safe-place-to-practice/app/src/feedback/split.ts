// One observation per line. A line that holds two observations becomes two lines, each with its own
// subject and its own quotes. "also" inside one clause ("Colons also appear twice") is one observation.
// The joins that mark two observations: a semicolon, a new sentence that starts with "Also",
// ", and" before a clause that carries "also", "and also" between two predicates, and two sentences
// under a feature that names two features. When a split would leave a line without a subject or a quote,
// the line stays whole and goes to the layout flags.
import type { Observation } from "../types.ts";

const FEATURE_JOIN = /\s+(?:and|&|\/)\s+/i;
const VERBS = new Set(
  "is are was were appear appears run runs get gets shorten shortens lengthen lengthens use uses lean leans repeat repeats start starts end ends sit sits show shows move moves come comes occur occurs shift shifts change changes grow grows drop drops stay stays return returns open opens close closes carry carries rise rises fall falls hold holds".split(" "),
);

export interface SplitResult {
  lines: Observation[];
  keptWhole: Observation[];
}

const hideQuoted = (s: string) => s.replace(/"[^"]*"|\u201c[^\u201d]*\u201d/g, (m) => "\u0000".repeat(m.length));

function cap(s: string): string {
  const t = s.trim().replace(/^also,?\s+/i, "").replace(/\s+also\b/i, "").replace(/[.\s]*$/, ".");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// The words before the first verb, as the subject of the clause. Null when no verb is found.
function subjectOf(clause: string): string | null {
  const words = clause.trim().split(/\s+/);
  const at = words.findIndex((w) => VERBS.has(w.toLowerCase().replace(/[^a-z]/g, "")));
  return at > 0 ? words.slice(0, at).join(" ") : null;
}

function startsWithVerb(clause: string): boolean {
  const first = clause.trim().replace(/^also,?\s+/i, "").split(/\s+/)[0] ?? "";
  return VERBS.has(first.toLowerCase().replace(/[^a-z]/g, ""));
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

export function bundled(o: Observation): boolean {
  const features = hideQuoted(o.feature).split(FEATURE_JOIN).length;
  return patternParts(o.pattern, features).length >= 2;
}

export function splitLine(o: Observation): SplitResult {
  const featureParts = o.feature.split(FEATURE_JOIN).map((s) => s.trim()).filter(Boolean);
  const raw = patternParts(o.pattern, featureParts.length);
  if (raw.length < 2) return { lines: [o], keptWhole: [] };
  // Each part keeps a subject. A part that opens on a verb borrows the subject of the part before it.
  const parts: string[] = [];
  for (let i = 0; i < raw.length; i++) {
    if (i > 0 && startsWithVerb(raw[i])) {
      const subject = subjectOf(raw[i - 1]);
      if (!subject) return { lines: [], keptWhole: [o] };
      parts.push(cap(`${subject} ${raw[i].replace(/^also,?\s+/i, "")}`));
    } else parts.push(cap(raw[i]));
  }
  const n = parts.length;
  if (o.quotes.length < n) return { lines: [], keptWhole: [o] };
  const per = Math.floor(o.quotes.length / n);
  const lines: Observation[] = parts.map((pattern, i) => ({
    feature: featureParts.length === n ? cap(featureParts[i]).replace(/\.$/, "") : o.feature,
    where: o.where,
    quotes: o.quotes.slice(i * per, i === n - 1 ? undefined : (i + 1) * per),
    pattern,
  }));
  return { lines, keptWhole: [] };
}
