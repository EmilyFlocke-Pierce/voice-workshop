// What a retry left out of its parent: wording and moves, whether each came back later, and what kind of evidence shows it.
// explicit: the retry's change_note or diagnosis names the removed words. indirect: only the diff shows it. absence: it is just missing.
// returns_in: a later piece holds the same words. echoes_in: a later piece holds 3 words in a row of them, and not all of them.
import { sentencesOf } from "../feedback/text.ts";
import { tokens } from "./near.ts";
import { SHAPE_NAMES, shapeSentence, type ShapeName } from "./shapes.ts";
import type { Corpus, Piece } from "./corpus.ts";

interface DiffChange { kind: "changed" | "added" | "removed"; before: string | null; after: string | null }

// Word runs in a that are not in b, by a word-level LCS. Each run keeps its words as written in a.
export function removedRuns(a: string, b: string): string[] {
  const x = tokens(a);
  const y = tokens(b);
  const n = x.length;
  const m = y.length;
  if (n * m > 400000) return [a];
  const w = m + 1;
  const l = new Uint16Array((n + 1) * w);
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) l[i * w + j] = x[i].w === y[j].w ? l[(i + 1) * w + j + 1] + 1 : Math.max(l[(i + 1) * w + j], l[i * w + j + 1]);
  const runs: string[] = [];
  let i = 0;
  let j = 0;
  let start = -1;
  const close = (end: number) => {
    if (start >= 0) runs.push(a.slice(x[start].start, x[end].end));
    start = -1;
  };
  while (i < n) {
    if (j < m && x[i].w === y[j].w) {
      close(i - 1);
      i++;
      j++;
    } else if (j < m && l[i * w + j + 1] > l[(i + 1) * w + j]) j++;
    else {
      if (start < 0) start = i;
      i++;
    }
  }
  close(n - 1);
  return runs;
}

const lower = (s: string | null) => (s ?? "").toLowerCase();

function namedIn(words: string, notes: string): boolean {
  const ws = words.toLowerCase().split(/\s+/).filter(Boolean);
  if (!ws.length) return false;
  if (ws.length <= 3) return notes.includes(ws.join(" "));
  for (let i = 0; i + 3 <= ws.length; i++) if (notes.includes(ws.slice(i, i + 3).join(" "))) return true;
  return false;
}

const SHAPE_WORDS: Record<ShapeName, string[]> = {
  opens_with_question: ["opening question", "open with a question", "opens with a question"],
  ends_with_question: ["ending question", "end with a question", "ends with a question", "closing question"],
  short_landing: ["short landing", "short ending", "short last line", "short close"],
  one_line_paragraph_end: ["one-line ending", "one line ending", "last line alone", "one-line paragraph"],
  list_of_three: ["list of three", "three-part list", "triple", "rule of three"],
};

export function dropped(c: Corpus, diffs: Map<string, { changes: DiffChange[] } | null>) {
  const items: Record<string, unknown>[] = [];
  const byTryPiece = new Map(c.pieces.map((p) => [p.try_id, p]));
  const later = (p: Piece) => c.pieces.filter((q) => q.created_at > p.created_at && q.try_id !== p.try_id);
  for (const r of c.pieces) {
    if (!r.parent_id) continue;
    const parent = byTryPiece.get(r.parent_id);
    if (!parent) continue;
    const t = c.byTry.get(r.try_id)!;
    const notes = `${lower(t.change_note)} ${lower(t.diagnosis)}`;
    const diff = diffs.get(r.try_id);
    const removed: string[] = [];
    for (const ch of diff?.changes ?? []) {
      if (ch.kind === "changed" && ch.before && ch.after) removed.push(...removedRuns(ch.before, ch.after));
      if (ch.kind === "removed" && ch.before) removed.push(ch.before);
    }
    // Words the retry's notes quote, in double quotes, that sit inside a removed run: the agent named these, so they get their own line.
    const quoted = [...`${t.change_note ?? ""} ${t.diagnosis ?? ""}`.matchAll(/"([^"]+)"|\u201c([^\u201d]+)\u201d/g)].map((m) => (m[1] ?? m[2]).trim()).filter(Boolean);
    const laterTexts = later(r).map((q) => ({ label: q.label, text: c.byTry.get(q.try_id)!.text.toLowerCase() }));
    const returnsOf = (words: string) => laterTexts.filter((q) => q.text.includes(words.toLowerCase())).map((q) => q.label);
    const echoesOf = (words: string) => {
      const ws = words.toLowerCase().split(/\s+/).filter(Boolean);
      if (ws.length <= 3) return [];
      const windows = ws.slice(0, -2).map((_, i) => ws.slice(i, i + 3).join(" "));
      return laterTexts.filter((q) => !q.text.includes(words.toLowerCase()) && windows.some((w) => q.text.includes(w))).map((q) => q.label);
    };
    for (const words of removed) {
      if (!words.trim()) continue;
      for (const named of quoted.filter((qq) => words.toLowerCase().includes(qq.toLowerCase()) && qq.toLowerCase() !== words.toLowerCase()))
        items.push({ type: "wording", parent: parent.label, retry: r.label, words: named, named_by_you: true, inside_removed: words, evidence: "explicit", returns_in: returnsOf(named), echoes_in: echoesOf(named) });
      items.push({ type: "wording", parent: parent.label, retry: r.label, words, evidence: namedIn(words, notes) ? "explicit" : "indirect", returns_in: returnsOf(words), echoes_in: echoesOf(words) });
    }
    const pText = c.byTry.get(parent.try_id)!.text;
    for (const s of SHAPE_NAMES) {
      const lostShort = s === "short_landing" && parent.shapes.closing_words <= 6 && r.shapes.closing_words > 6;
      if (!(parent.shapes[s] && !r.shapes[s]) && !lostShort) continue;
      const sentence = shapeSentence(pText, s) ?? "";
      const diffTouched = (diff?.changes ?? []).some((ch) => ch.before && sentence && (ch.before.includes(sentence) || sentence.includes(ch.before)));
      const explicit = SHAPE_WORDS[s].some((w) => notes.includes(w)) || namedIn(sentence, notes);
      const returns = later(r).filter((q) => q.shapes[s]).map((q) => q.label);
      items.push({ type: "move", move: s, parent: parent.label, retry: r.label, parent_sentence: sentence, evidence: explicit ? "explicit" : diffTouched ? "indirect" : "absence", returns_in: returns });
    }
  }
  return items;
}

export { sentencesOf };
