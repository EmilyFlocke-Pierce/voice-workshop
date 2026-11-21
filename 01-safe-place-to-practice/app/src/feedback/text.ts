// Splits a draft into sentences with their place in the piece. The draft itself is never changed.
export interface Sentence {
  text: string;
  index: number;
  line: number;
  third: "opening" | "middle" | "end";
  words: string[];
}

export function wordsOf(s: string): string[] {
  return (s.toLowerCase().match(/[a-z\u00c0-\u024f]+(?:['\u2019][a-z]+)?/g) ?? []).map((w) => w.replace(/\u2019/g, "'"));
}

export function sentencesOf(text: string): Sentence[] {
  const out: { text: string; line: number }[] = [];
  const lines = text.split(/\r?\n/);
  lines.forEach((lineText, i) => {
    const parts = lineText.match(/[^.!?\u2026]+(?:[.!?\u2026]+["'\u201d\u2019)\]]*|$)/g) ?? [];
    for (const raw of parts) {
      const t = raw.trim();
      if (wordsOf(t).length > 0) out.push({ text: t, line: i + 1 });
    }
  });
  const n = out.length;
  return out.map((s, index) => ({
    ...s,
    index,
    third: n < 3 ? "opening" : index < n / 3 ? "opening" : index < (2 * n) / 3 ? "middle" : "end",
    words: wordsOf(s.text),
  }));
}

export function placeOf(s: Sentence): string {
  return `${s.third}, line ${s.line}`;
}

// A quote is a span of the draft itself: the sentence, or a window of it around a word.
export function quoteAround(s: Sentence, word?: string, max = 90): string {
  if (s.text.length <= max || !word) return s.text.length <= max ? s.text : s.text.slice(0, max).replace(/\s+\S*$/, "");
  const at = s.text.toLowerCase().search(new RegExp(`\\b${escapeRe(word)}\\b`));
  if (at < 0) return s.text.slice(0, max).replace(/\s+\S*$/, "");
  const start = Math.max(0, at - Math.floor(max / 2));
  let span = s.text.slice(start, start + max);
  if (start > 0) span = span.replace(/^\S*\s+/, "");
  if (start + max < s.text.length) span = span.replace(/\s+\S*$/, "");
  return span;
}

export function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
