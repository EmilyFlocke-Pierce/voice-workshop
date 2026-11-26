// The corpus: every try in scope, labeled P1 to Pn in created order, with its notes by note id and its retry chain.
// Pure functions over plain rows, so test:lookback runs them without D1.
import { shapesOf, type Shapes } from "./shapes.ts";

export interface TryIn {
  id: string;
  parent_id: string | null;
  session_id: string;
  text: string;
  intent: string | null;
  scope_note: string | null;
  change_note: string | null;
  diagnosis: string | null;
  rough_edges: string | null;
  landed: string | null;
  style_tag: string | null;
  prompt_form: string | null;
  prompt_style: string | null;
  prompt_author: string | null;
  exercise_id: string | null;
  created_at: string;
}
export interface MarkIn { id: string; try_id: string; what_tried: string; why_back: string | null; own_lines: string | null; less_familiar: string | null }
export interface StitchIn { id: string; try_id: string; thread: string; deltas: string | null; quotes: string }
export interface XNoteIn { id: string; exercise_id: string; try_id: string | null; kind: string; text: string; quotes: string }
export interface ExIn { id: string; style_id: string }
export interface PlacementIn { note_id: string; belongs_to: string }

export interface Rows {
  tries: TryIn[]; // every try under the key, in created order
  marks: MarkIn[];
  stitches: StitchIn[];
  xnotes: XNoteIn[] | null; // null when slice 02's tables are not there
  exercises: ExIn[] | null;
  placements: PlacementIn[];
}

export interface Note {
  id: string;
  kind: string;
  try_id: string;
  text: string;
  free_text: string | null; // the text the misplaced check reads, or null when the kind is left out of it
  carried_from_parent: boolean;
  about: "try" | "exercise";
}

export interface Piece {
  label: string;
  try_id: string;
  parent_id: string | null;
  parent_label: string | null;
  parent_outside: boolean;
  chain_root_try_id: string;
  pulled: boolean;
  note_ids: string[];
  landed: string | null;
  style: { value: string | null; source: string | null };
  session_id: string;
  created_at: string;
  shapes: Shapes;
}

export interface Corpus {
  pieces: Piece[];
  notes: Map<string, Note>;
  byTry: Map<string, TryIn>;
  capped: boolean;
  in_scope: number;
}

export const TRY_NOTE_FIELDS = ["intent", "scope_note", "change_note", "diagnosis", "rough_edges"] as const;

export function chainRoot(byTry: Map<string, TryIn>, id: string): string {
  let cur = byTry.get(id);
  const seen = new Set<string>();
  while (cur?.parent_id && byTry.has(cur.parent_id) && !seen.has(cur.id)) {
    seen.add(cur.id);
    cur = byTry.get(cur.parent_id);
  }
  return cur?.id ?? id;
}

function styleOf(t: TryIn, exStyle: Map<string, string> | null) {
  if (exStyle && t.exercise_id && exStyle.has(t.exercise_id)) return { value: exStyle.get(t.exercise_id)!, source: "exercise style_id" };
  if (t.prompt_style) return { value: t.prompt_style, source: "prompt_style" };
  if (t.prompt_author) return { value: t.prompt_author, source: "prompt_author" };
  if (t.style_tag) return { value: t.style_tag, source: "style_tag" };
  return { value: null, source: null };
}

// Every note in the key's record, by note id, attached to the try it was written about.
export function notesOf(rows: Rows): Map<string, Note> {
  const byTry = new Map(rows.tries.map((t) => [t.id, t]));
  const notes = new Map<string, Note>();
  for (const t of rows.tries) {
    const parent = t.parent_id ? byTry.get(t.parent_id) : undefined;
    for (const f of TRY_NOTE_FIELDS) {
      const v = t[f];
      if (!v || (f === "rough_edges" && v === "[]")) continue;
      const carried = !!parent && (f === "intent" || f === "scope_note") && parent[f] === v;
      notes.set(`try:${t.id}:${f}`, { id: `try:${t.id}:${f}`, kind: f, try_id: t.id, text: v, free_text: f === "rough_edges" ? null : v, carried_from_parent: carried, about: "try" });
    }
  }
  for (const m of rows.marks) {
    const text = [m.what_tried, m.why_back && `why back: ${m.why_back}`, m.less_familiar && `less familiar: ${m.less_familiar}`].filter(Boolean).join("; ");
    notes.set(`mark:${m.id}`, { id: `mark:${m.id}`, kind: "mark", try_id: m.try_id, text, free_text: m.what_tried, carried_from_parent: false, about: "try" });
  }
  for (const s of rows.stitches) {
    notes.set(`stitch:${s.id}`, { id: `stitch:${s.id}`, kind: "stitch", try_id: s.try_id, text: [s.thread, s.deltas].filter(Boolean).join("; "), free_text: null, carried_from_parent: false, about: "try" });
  }
  if (rows.xnotes) {
    const lastTryOfEx = new Map<string, string>();
    for (const t of rows.tries) if (t.exercise_id) lastTryOfEx.set(t.exercise_id, t.id);
    for (const x of rows.xnotes) {
      const tryId = x.try_id ?? lastTryOfEx.get(x.exercise_id);
      if (!tryId) continue;
      notes.set(`xnote:${x.id}`, { id: `xnote:${x.id}`, kind: `exercise ${x.kind}`, try_id: tryId, text: x.text, free_text: x.try_id ? x.text : null, carried_from_parent: false, about: x.try_id ? "try" : "exercise" });
    }
  }
  return notes;
}

// inScope: try ids in created order. pulled: try ids the agent pulled in, in pull order, labeled after the rest.
// Past maxPieces or maxChars, it takes the newest tries in scope that fit, and says so.
export function buildCorpus(rows: Rows, inScope: string[], pulled: string[] = [], maxPieces = 200, maxChars = Number.MAX_SAFE_INTEGER): Corpus {
  const byTry = new Map(rows.tries.map((t) => [t.id, t]));
  let chars = 0;
  let from = inScope.length;
  while (from > 0 && inScope.length - from < maxPieces && chars + (byTry.get(inScope[from - 1])?.text.length ?? 0) <= maxChars) {
    chars += byTry.get(inScope[from - 1])?.text.length ?? 0;
    from--;
  }
  const capped = from > 0;
  const scoped = inScope.slice(from);
  const ids = [...scoped, ...pulled.filter((p) => !scoped.includes(p))];
  const labelOf = new Map(ids.map((id, i) => [id, `P${i + 1}`]));
  const allNotes = notesOf(rows);
  const placed = new Map(rows.placements.map((p) => [p.note_id, p.belongs_to]));
  const exStyle = rows.exercises ? new Map(rows.exercises.map((e) => [e.id, e.style_id])) : null;
  const notes = new Map<string, Note>();
  const pieces: Piece[] = ids.map((id) => {
    const t = byTry.get(id)!;
    return {
      label: labelOf.get(id)!, try_id: id, parent_id: t.parent_id, parent_label: t.parent_id ? (labelOf.get(t.parent_id) ?? null) : null,
      parent_outside: !!t.parent_id && !labelOf.has(t.parent_id), chain_root_try_id: chainRoot(byTry, id), pulled: pulled.includes(id) && !scoped.includes(id),
      note_ids: [], landed: t.landed, style: styleOf(t, exStyle), session_id: t.session_id, created_at: t.created_at, shapes: shapesOf(t.text),
    };
  });
  const pieceByLabel = new Map(pieces.map((p) => [p.label, p]));
  for (const n of allNotes.values()) {
    const placedTo = placed.get(n.id);
    const target = placedTo ? pieceByLabel.get(placedTo) : pieces.find((p) => p.try_id === n.try_id);
    if (!target) continue;
    target.note_ids.push(n.id);
    notes.set(n.id, n);
  }
  return { pieces, notes, byTry, capped, in_scope: inScope.length };
}

// The default denominator: the latest version of each retry chain in the corpus.
export function latestVersions(c: Corpus): string[] {
  const latest = new Map<string, Piece>();
  for (const p of c.pieces) {
    const cur = latest.get(p.chain_root_try_id);
    if (!cur || p.created_at >= cur.created_at) latest.set(p.chain_root_try_id, p);
  }
  return c.pieces.filter((p) => latest.get(p.chain_root_try_id) === p).map((p) => p.label);
}

export interface Ref { label: string; try_id: string; start: number; end: number }

// Audit: pieces with no notes, identical texts, parents outside the scope, and notes that may belong to another version.
export function audit(c: Corpus) {
  const items: Record<string, unknown>[] = [];
  for (const p of c.pieces) if (!p.note_ids.length) items.push({ type: "no_notes", label: p.label, try_id: p.try_id, landed: p.landed, note: p.landed ? "Only a landed value, which is shown but does not count as a note." : null });
  const byText = new Map<string, Piece[]>();
  for (const p of c.pieces) {
    const k = c.byTry.get(p.try_id)!.text;
    byText.set(k, [...(byText.get(k) ?? []), p]);
  }
  for (const group of byText.values()) if (group.length > 1) items.push({ type: "identical", labels: group.map((p) => p.label) });
  for (const p of c.pieces) if (p.parent_outside) items.push({ type: "parent_outside", label: p.label, parent_try_id: p.parent_id, pull_with: `POST /lookbacks/:id/pull {"try_id": "${p.parent_id}"}` });
  // Misplaced or ambiguous notes: a quoted span of 3 words or more, checked against the note's expected texts and the chain's other versions.
  const chainOf = new Map<string, string[]>();
  for (const t of c.byTry.values()) {
    const r = chainRoot(c.byTry, t.id);
    chainOf.set(r, [...(chainOf.get(r) ?? []), t.id]);
  }
  for (const n of c.notes.values()) {
    if (!n.free_text) continue;
    const t = c.byTry.get(n.try_id);
    if (!t) continue;
    const expected = [t.id];
    if (t.parent_id && (n.kind === "change_note" || n.kind === "diagnosis" || n.carried_from_parent)) expected.push(t.parent_id);
    const others = (chainOf.get(chainRoot(c.byTry, t.id)) ?? []).filter((id) => !expected.includes(id));
    for (const m of n.free_text.matchAll(/"([^"]+)"|\u201c([^\u201d]+)\u201d/g)) {
      const span = (m[1] ?? m[2]).trim();
      if (span.split(/\s+/).length < 3) continue;
      const inExpected = expected.some((id) => c.byTry.get(id)?.text.includes(span));
      const inOther = others.filter((id) => c.byTry.get(id)?.text.includes(span));
      if (!inOther.length) continue;
      const labels = inOther.map((id) => c.pieces.find((p) => p.try_id === id)?.label ?? `outside this scope (${id})`);
      items.push({ type: inExpected ? "ambiguous" : "misplaced", note_id: n.id, note_on: c.pieces.find((p) => p.note_ids.includes(n.id))?.label ?? null, span, also_in: labels, place_with: `POST /lookbacks/:id/notes/${n.id} {"belongs_to": "P#"}` });
    }
  }
  return items;
}
