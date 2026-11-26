// Recurring candidates from the agent's own pieces: repeated wording (exact and near), openings and transitions, and shapes.
// Candidates describe what repeats. They come only from these pieces, never from a fixed list.
import { sentencesOf } from "../feedback/text.ts";
import { stem, tokens } from "./near.ts";
import { SHAPE_NAMES } from "./shapes.ts";
import type { Corpus, Ref } from "./corpus.ts";

const MAX_ITEMS = 300;
const MAX_OCC = 50;

export function recurring(c: Corpus) {
  const items: Record<string, unknown>[] = [];
  const toks = c.pieces.map((p) => ({ p, t: tokens(c.byTry.get(p.try_id)!.text) }));

  // Exact wording, 3 to 6 words, in 2 or more pieces. A shorter span inside a longer one with the same pieces is left out.
  // Two passes: first find the spans in 2 or more pieces, then collect their occurrences (up to MAX_OCC each).
  const seen = new Map<string, number>(); // span -> first piece index, or -1 once a second piece has it
  toks.forEach(({ t }, pi) => {
    for (let n = 3; n <= 6; n++)
      for (let i = 0; i + n <= t.length; i++) {
        let k = t[i].w;
        for (let q = 1; q < n; q++) k += " " + t[i + q].w;
        const f = seen.get(k);
        if (f === undefined) seen.set(k, pi);
        else if (f !== -1 && f !== pi) seen.set(k, -1);
      }
  });
  const exact = new Map<string, Ref[]>();
  toks.forEach(({ p, t }) => {
    for (let n = 3; n <= 6; n++)
      for (let i = 0; i + n <= t.length; i++) {
        let k = t[i].w;
        for (let q = 1; q < n; q++) k += " " + t[i + q].w;
        if (seen.get(k) !== -1) continue;
        const list = exact.get(k) ?? [];
        if (list.length < MAX_OCC) list.push({ label: p.label, try_id: p.try_id, start: t[i].start, end: t[i + n - 1].end });
        exact.set(k, list);
      }
  });
  seen.clear();
  const multi = [...exact];
  const pieceSet = (refs: Ref[]) => [...new Set(refs.map((r) => r.label))].join(",");
  // A span is covered when a span one word longer, starting or ending with it, sits in the same pieces.
  const covered = new Set<string>();
  for (const [k, refs] of multi) {
    const ws = k.split(" ");
    if (ws.length < 4) continue;
    const set = pieceSet(refs);
    covered.add(`${ws.slice(1).join(" ")}|${set}`);
    covered.add(`${ws.slice(0, -1).join(" ")}|${set}`);
  }
  const keep = multi.filter(([k, refs]) => !covered.has(`${k}|${pieceSet(refs)}`));
  keep.sort((a, b) => new Set(b[1].map((r) => r.label)).size - new Set(a[1].map((r) => r.label)).size || b[0].split(" ").length - a[0].split(" ").length);
  for (const [k, refs] of keep.slice(0, MAX_ITEMS)) items.push({ type: "wording", match: "exact", words: k, pieces: [...new Set(refs.map((r) => r.label))], occurrences: refs });

  // Near wording, 4 words: same length, one word apart after the suffix rule, and not an exact repeat.
  // Near runs on 4-word spans only, to stay inside lookback_cpu_ms; a longer near repeat shows as its 4-word parts.
  // First pass marks wildcard keys whose spans differ in wording and sit in 2 or more pieces.
  const stemId = new Map<string, number>();
  const stems = toks.map(({ t }) => t.map((x) => {
    const st = stem(x.w);
    let id = stemId.get(st);
    if (id === undefined) stemId.set(st, (id = stemId.size));
    return id;
  }));
  const wild = new Map<string, { raw: string; piece: number; differs: boolean; pieces: boolean }>();
  const eachWild = (fn: (key: string, raw: string, pi: number, i: number, n: number) => void) =>
    toks.forEach(({ t }, pi) => {
      const st = stems[pi];
      const n = 4;
      for (let i = 0; i + n <= t.length; i++) {
        const raw = `${t[i].w} ${t[i + 1].w} ${t[i + 2].w} ${t[i + 3].w}`;
        const a = st[i], b = st[i + 1], c = st[i + 2], d = st[i + 3];
        fn(`*,${b},${c},${d}`, raw, pi, i, n);
        fn(`${a},*,${c},${d}`, raw, pi, i, n);
        fn(`${a},${b},*,${d}`, raw, pi, i, n);
        fn(`${a},${b},${c},*`, raw, pi, i, n);
      }
    });
  eachWild((key, raw, pi) => {
    const w = wild.get(key);
    if (!w) wild.set(key, { raw, piece: pi, differs: false, pieces: false });
    else {
      if (w.raw !== raw) w.differs = true;
      if (w.piece !== pi) w.pieces = true;
    }
  });
  const nearGroups = new Map<string, { raw: string; ref: Ref }[]>();
  eachWild((key, raw, pi, i, n) => {
    const w = wild.get(key)!;
    if (!w.differs || !w.pieces) return;
    const list = nearGroups.get(key) ?? [];
    if (list.length < MAX_OCC) list.push({ raw, ref: { label: toks[pi].p.label, try_id: toks[pi].p.try_id, start: toks[pi].t[i].start, end: toks[pi].t[i + n - 1].end } });
    nearGroups.set(key, list);
  });
  wild.clear();
  const seenNear = new Set<string>();
  for (const group of nearGroups.values()) {
    const raws = new Set(group.map((g) => g.raw));
    if (raws.size < 2 || new Set(group.map((g) => g.ref.label)).size < 2) continue;
    const key = [...raws].sort().join("|");
    if (seenNear.has(key)) continue;
    seenNear.add(key);
    if (items.length >= MAX_ITEMS * 2) break;
    items.push({ type: "wording", match: "near", words: [...raws], pieces: [...new Set(group.map((g) => g.ref.label))], occurrences: group.map((g) => ({ ...g.ref, words: g.raw })) });
  }

  // Openings: the first two words of each piece. Transitions: the first word of later sentences, in 2 or more pieces.
  const openings = new Map<string, Ref[]>();
  const transitions = new Map<string, Ref[]>();
  for (const { p } of toks) {
    const text = c.byTry.get(p.try_id)!.text;
    const ss = sentencesOf(text);
    let from = 0;
    ss.forEach((s, i) => {
      const at = text.indexOf(s.text, from);
      from = at + s.text.length;
      const st = tokens(s.text);
      if (!st.length) return;
      if (i === 0 && st.length >= 2) {
        const k = `${st[0].w} ${st[1].w}`;
        openings.set(k, [...(openings.get(k) ?? []), { label: p.label, try_id: p.try_id, start: at + st[0].start, end: at + st[1].end }]);
      } else if (i > 0) {
        const k = st[0].w;
        transitions.set(k, [...(transitions.get(k) ?? []), { label: p.label, try_id: p.try_id, start: at + st[0].start, end: at + st[0].end }]);
      }
    });
  }
  for (const [k, refs] of openings) if (new Set(refs.map((r) => r.label)).size >= 2) items.push({ type: "opening", words: k, pieces: [...new Set(refs.map((r) => r.label))], occurrences: refs });
  const trans = [...transitions].filter(([, refs]) => new Set(refs.map((r) => r.label)).size >= 2).sort((a, b) => new Set(b[1].map((r) => r.label)).size - new Set(a[1].map((r) => r.label)).size);
  for (const [k, refs] of trans.slice(0, 50)) items.push({ type: "transition", words: k, pieces: [...new Set(refs.map((r) => r.label))], count: refs.length, occurrences: refs.slice(0, 40) });

  // Shapes across pieces.
  for (const s of SHAPE_NAMES) {
    const with_ = c.pieces.filter((p) => p.shapes[s]).map((p) => p.label);
    if (with_.length >= 2) items.push({ type: "shape", shape: s, pieces: with_, of: c.pieces.length });
  }
  return items;
}
