// The workshop's own reader. It reads the draft alone and describes what is on the page:
// sentence length by position, repeated words, repeated openings, punctuation, pronoun and tense shifts.
// Each observation names one feature and how it recurs, contrasts, or changes.
import type { Observation } from "../types.ts";
import { type Sentence, sentencesOf, placeOf, quoteAround } from "./text.ts";

const STOP = new Set(
  "the a an and or but of to in on at by for with from as is are was were be been being it its this that these those he she they them his her their there here then than so not no do does did done have has had i me my we us our you your if into out up down over just very can could would will shall may might must one all any some what which who whom when where why how also too about".split(
    " ",
  ),
);

const PRONOUNS: Record<string, string[]> = {
  '"I"': ["i", "me", "my", "mine", "myself", "i'm", "i've", "i'll", "i'd"],
  '"we"': ["we", "us", "our", "ours", "ourselves", "we're", "we've"],
  '"you"': ["you", "your", "yours", "yourself", "you're", "you've"],
  '"he" or "she"': ["he", "she", "him", "her", "his", "hers", "himself", "herself"],
  '"they"': ["they", "them", "their", "theirs", "themselves"],
};

const PAST = new Set(["was", "were", "had", "did", "went", "came", "said", "saw", "knew", "thought", "felt", "took", "made", "got", "stood", "sat", "told", "kept"]);
const PRESENT = new Set(["is", "am", "are", "has", "does", "goes", "comes", "says", "sees", "knows", "thinks", "feels", "takes", "makes", "gets", "stands", "sits", "tells", "keeps"]);

function thirds(ss: Sentence[]) {
  return { opening: ss.filter((s) => s.third === "opening"), middle: ss.filter((s) => s.third === "middle"), end: ss.filter((s) => s.third === "end") };
}

function avg(ns: number[]): number {
  return ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : 0;
}

const THIRD_NAME = { opening: "opening third", middle: "middle third", end: "last third" } as const;

// count(s) gives how many times the feature occurs in one sentence.
function placesSummary(hits: Sentence[], count: (s: Sentence) => number = () => 1): string {
  const order = ["opening", "middle", "end"] as const;
  const counts = order.map((t) => [t, hits.filter((h) => h.third === t).reduce((a, h) => a + count(h), 0)] as const).filter(([, c]) => c > 0);
  return counts.map(([t, c]) => `${c} in the ${THIRD_NAME[t]}`).join(", ");
}

function whereOf(hits: Sentence[]): string {
  const ts = [...new Set(hits.map((h) => h.third))];
  return ts.length === 3 ? "across the piece" : ts.map((t) => THIRD_NAME[t]).join(", ");
}

function spread<T extends Sentence>(hits: T[], k = 3): T[] {
  if (hits.length <= k) return hits;
  const picks = [hits[0], hits[Math.floor(hits.length / 2)], hits[hits.length - 1]];
  return picks.slice(0, k);
}

export function observe(text: string): Observation[] {
  const ss = sentencesOf(text);
  if (ss.length === 0) return [];
  const obs: Observation[] = [];
  const t = thirds(ss);
  const totalWords = ss.reduce((a, s) => a + s.words.length, 0);

  obs.push({
    feature: "Length",
    where: "whole piece",
    quotes: [{ quote: quoteAround(ss[0]), place: placeOf(ss[0]) }],
    pattern: `${totalWords} words in ${ss.length} sentence${ss.length === 1 ? "" : "s"}, on ${new Set(ss.map((s) => s.line)).size} line${new Set(ss.map((s) => s.line)).size === 1 ? "" : "s"}.`,
  });

  // Sentence length, opening third against last third.
  if (ss.length >= 6) {
    const a = avg(t.opening.map((s) => s.words.length));
    const b = avg(t.end.map((s) => s.words.length));
    if (Math.abs(a - b) >= Math.max(3, 0.3 * Math.max(a, b))) {
      const pickA = [...t.opening].sort((x, y) => (a > b ? y.words.length - x.words.length : x.words.length - y.words.length))[0];
      const pickB = [...t.end].sort((x, y) => (a > b ? x.words.length - y.words.length : y.words.length - x.words.length))[0];
      obs.push({
        feature: "Sentence length",
        where: "opening to end",
        quotes: [
          { quote: quoteAround(pickA), place: placeOf(pickA) },
          { quote: quoteAround(pickB), place: placeOf(pickB) },
        ],
        pattern: `Sentences run about ${Math.round(a)} words in the opening third, about ${Math.round(b)} words in the last third.`,
      });
    }
  }

  // Repeated words: up to three words used three or more times, stop words left out.
  const counts = new Map<string, number>();
  for (const s of ss) for (const w of s.words) if (!STOP.has(w) && w.length > 2) counts.set(w, (counts.get(w) ?? 0) + 1);
  const repeated = [...counts.entries()].filter(([, c]) => c >= 3).sort((x, y) => y[1] - x[1]).slice(0, 3);
  for (const [w, c] of repeated) {
    const hits = ss.filter((s) => s.words.includes(w));
    obs.push({
      feature: `Repeated word "${w}"`,
      where: whereOf(hits),
      quotes: spread(hits).map((s) => ({ quote: quoteAround(s, w), place: placeOf(s) })),
      pattern: `"${w}" appears ${c} times: ${placesSummary(hits, (s) => s.words.filter((x) => x === w).length)}.`,
    });
  }

  // Lines that start the same way.
  const openers = new Map<string, Sentence[]>();
  for (const s of ss) {
    const first = s.words[0];
    if (first) openers.set(first, [...(openers.get(first) ?? []), s]);
  }
  const sameStart = [...openers.entries()].filter(([, hs]) => hs.length >= 3 && hs.length >= ss.length / 4).sort((x, y) => y[1].length - x[1].length).slice(0, 2);
  for (const [w, hs] of sameStart) {
    obs.push({
      feature: "Sentences start the same way",
      where: whereOf(hs),
      quotes: spread(hs).map((s) => ({ quote: quoteAround(s, w), place: placeOf(s) })),
      pattern: `${hs.length} of ${ss.length} sentences start with "${hs[0].text.match(/[A-Za-z\u00c0-\u024f']+/)?.[0] ?? w}": ${placesSummary(hs)}.`,
    });
  }

  // Punctuation marks that recur, or gather in one part of the piece.
  const marks: [string, RegExp][] = [
    ["Question marks", /\?/g],
    ["Exclamation marks", /!/g],
    ["Semicolons", /;/g],
    ["Colons", /:/g],
    ["Long dashes", /\u2014|--/g],
    ["Trailing dots", /\.\.\.|\u2026/g],
    ["Brackets", /\(/g],
  ];
  for (const [name, re] of marks) {
    const hits = ss.filter((s) => (s.text.match(re) ?? []).length > 0);
    const total = ss.reduce((a, s) => a + (s.text.match(re) ?? []).length, 0);
    const oneThird = new Set(hits.map((h) => h.third)).size === 1 && ss.length >= 6;
    if (total >= 3 || (total >= 2 && oneThird)) {
      obs.push({
        feature: name,
        where: whereOf(hits),
        quotes: spread(hits).map((s) => ({ quote: quoteAround(s), place: placeOf(s) })),
        pattern: `${total} in the piece: ${placesSummary(hits, (s) => (s.text.match(re) ?? []).length)}.`,
      });
    }
  }

  // Pronoun shift between the opening third and the last third.
  if (ss.length >= 6) {
    const lead = (part: Sentence[]) => {
      let best: [string, number] = ["", 0];
      for (const [name, forms] of Object.entries(PRONOUNS)) {
        const c = part.reduce((a, s) => a + s.words.filter((w) => forms.includes(w)).length, 0);
        if (c > best[1]) best = [name, c];
      }
      return best;
    };
    const [pa, ca] = lead(t.opening);
    const [pb, cb] = lead(t.end);
    if (pa && pb && pa !== pb && ca >= 2 && cb >= 2) {
      const sa = t.opening.find((s) => s.words.some((w) => PRONOUNS[pa].includes(w)))!;
      const sb = t.end.find((s) => s.words.some((w) => PRONOUNS[pb].includes(w)))!;
      obs.push({
        feature: "Pronouns",
        where: "opening to end",
        quotes: [
          { quote: quoteAround(sa), place: placeOf(sa) },
          { quote: quoteAround(sb), place: placeOf(sb) },
        ],
        pattern: `The opening third uses ${pa} most (${ca} times), the last third uses ${pb} most (${cb} times).`,
      });
    }
  }

  // Tense shift between the opening third and the last third.
  if (ss.length >= 6) {
    const lean = (part: Sentence[]) => {
      const past = part.reduce((a, s) => a + s.words.filter((w) => PAST.has(w) || (w.length > 4 && w.endsWith("ed"))).length, 0);
      const pres = part.reduce((a, s) => a + s.words.filter((w) => PRESENT.has(w)).length, 0);
      return past >= pres * 2 && past >= 2 ? "past" : pres >= past * 2 && pres >= 2 ? "present" : "";
    };
    const la = lean(t.opening);
    const lb = lean(t.end);
    if (la && lb && la !== lb) {
      // The quote for each side is the sentence that leans furthest that way, so the quote shows the tense it stands for.
      const lean1 = (tense: string) => (s: Sentence) => {
        const past = s.words.filter((w) => PAST.has(w) || (w.length > 4 && w.endsWith("ed"))).length;
        const pres = s.words.filter((w) => PRESENT.has(w)).length;
        return tense === "past" ? past - pres : pres - past;
      };
      const best = (part: Sentence[], tense: string) => [...part].sort((x, y) => lean1(tense)(y) - lean1(tense)(x))[0];
      const sa = best(t.opening, la);
      const sb = best(t.end, lb);
      obs.push({
        feature: "Tense",
        where: "opening to end",
        quotes: [
          { quote: quoteAround(sa), place: placeOf(sa) },
          { quote: quoteAround(sb), place: placeOf(sb) },
        ],
        pattern: `The opening third leans ${la} tense, the last third leans ${lb} tense.`,
      });
    }
  }

  return obs;
}
