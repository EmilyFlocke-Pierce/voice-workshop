// Checks for slice 04's pure functions against a seeded corpus. Each expect entry in lookback-corpus.json is one check.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { audit, buildCorpus, type Rows } from "../src/lookback/corpus.ts";
import { recurring } from "../src/lookback/recurring.ts";
import { dropped, removedRuns } from "../src/lookback/dropped.ts";
import { countPattern, rankPatterns, timeline } from "../src/lookback/patterns.ts";
import { putChunked, CHUNK_BYTES } from "../src/lookback/store.ts";
import { isNear } from "../src/lookback/near.ts";
import { diffTries } from "../src/feedback/diff.ts";
import { CAPS } from "../src/caps.ts";

const seed = JSON.parse(readFileSync(new URL("./lookback-corpus.json", import.meta.url), "utf8")) as { rows: Rows; expect: Record<string, unknown>[] };
const rows = seed.rows;
const allIds = rows.tries.map((t) => t.id);
const scopeIds = (scope: Record<string, unknown> | undefined) => (scope?.sessions ? rows.tries.filter((t) => (scope.sessions as string[]).includes(t.session_id)).map((t) => t.id) : allIds);
const diffsOf = (c: ReturnType<typeof buildCorpus>) => new Map(c.pieces.filter((p) => p.parent_id && c.byTry.has(p.parent_id)).map((p) => [p.try_id, diffTries(c.byTry.get(p.parent_id!)!.text, c.byTry.get(p.try_id)!.text)]));

const full = buildCorpus(rows, allIds);
const fullAudit = audit(full);
const label = (c: ReturnType<typeof buildCorpus>, id: string) => c.pieces.find((p) => p.try_id === id)!.label;

for (const e of seed.expect) {
  test(`expect: ${e.type} ${JSON.stringify(e).slice(0, 90)}`, () => {
    if (e.type === "parent_outside") {
      const c = buildCorpus(rows, scopeIds(e.scope as Record<string, unknown>));
      const a = audit(c);
      assert.ok(a.some((x) => x.type === "parent_outside" && x.label === label(c, e.try as string)));
    } else if (e.type === "pull_next_label") {
      const ids = scopeIds(e.scope as Record<string, unknown>);
      const c = buildCorpus(rows, ids, [e.pull as string]);
      const p = c.pieces.find((x) => x.try_id === e.pull)!;
      assert.equal(p.label, `P${ids.length + 1}`);
      assert.ok(p.pulled);
      assert.ok(!audit(c).some((x) => x.type === "parent_outside"), "after the pull, no parent sits outside");
    } else if (e.type === "no_notes") {
      assert.ok(fullAudit.some((x) => x.type === "no_notes" && x.label === label(full, e.try as string)));
    } else if (e.type === "misplaced") {
      assert.ok(fullAudit.some((x) => x.type === "misplaced" && x.note_id === e.note_id && x.span === e.span));
    } else if (e.type === "not_listed") {
      assert.ok(!fullAudit.some((x) => x.note_id === e.note_id));
    } else if (e.type === "identical") {
      const labels = (e.tries as string[]).map((t) => label(full, t));
      assert.ok(fullAudit.some((x) => x.type === "identical" && JSON.stringify(x.labels) === JSON.stringify(labels)));
    } else if (e.type === "dropped_wording") {
      const d = dropped(full, diffsOf(full));
      const hit = d.find((x) => x.type === "wording" && x.retry === label(full, e.retry as string) && String(x.words).toLowerCase().includes(String(e.words)));
      assert.ok(hit, JSON.stringify(d.filter((x) => x.retry === label(full, e.retry as string))));
      assert.equal(hit.evidence, e.evidence);
      assert.ok((hit.returns_in as string[]).includes(label(full, e.returns_in as string)));
    } else if (e.type === "removed_move") {
      const d = dropped(full, diffsOf(full));
      assert.ok(d.some((x) => x.type === "move" && x.move === e.move && x.retry === label(full, e.retry as string)));
    } else if (e.type === "near") {
      const r = recurring(full);
      const words = e.words as string[];
      assert.ok(isNear(words[0], words[1]));
      assert.ok(r.some((x) => x.type === "wording" && x.match === "near" && words.every((w) => (x.words as string[]).includes(w))));
    } else assert.fail(`unknown expect type ${e.type}`);
  });
}

test("every note has one id, a try with only landed counts as no notes, and placements move a note", () => {
  const ids = [...full.notes.keys()];
  assert.ok(ids.includes("try:t3:intent") && ids.includes("mark:m1") && ids.includes("stitch:st1"));
  const placed = buildCorpus({ ...rows, placements: [{ note_id: "try:t8:intent", belongs_to: label(full, "t9") }] }, allIds);
  assert.ok(placed.pieces.find((p) => p.try_id === "t9")!.note_ids.includes("try:t8:intent"));
  assert.ok(!placed.pieces.find((p) => p.try_id === "t8")!.note_ids.includes("try:t8:intent"));
});

test("removedRuns keeps the words as written", () => {
  assert.deepEqual(removedRuns("Past the mill there was a small bright window.", "Past the mill the road bent."), ["there was a small bright window"]);
});

test("counts: per piece apart from the total, the default denominator is the latest of each chain, ties share a rank", () => {
  const inst = [{ piece: label(full, "t12"), quote: "a small bright window" }, { piece: label(full, "t15"), quote: "a small bright window" }, { piece: label(full, "t15"), quote: "waited" }];
  const c = countPattern(full, inst, "default");
  assert.equal(c.corpus_total, 3);
  assert.equal(c.per_piece[label(full, "t15")], 2);
  assert.ok(!c.denominator.pieces.includes(label(full, "t12")), "t12 has a later version, t13");
  assert.ok(c.denominator.pieces.includes(label(full, "t13")));
  const every = countPattern(full, inst, "every");
  assert.equal(every.denominator.size, full.pieces.length);
  const ranks = rankPatterns([{ id: "a", name: "a", rate: 0.5, size: 4 }, { id: "b", name: "b", rate: 0.5, size: 4 }, { id: "c", name: "c", rate: 0.47, size: 4 }]);
  assert.deepEqual(ranks.map((r) => r.rank), [1, 1, 3]);
  assert.ok(ranks[2].close_to.includes("a"));
  const tl = timeline(full, c.per_piece, c.denominator.pieces);
  assert.equal(tl.first_appearance, label(full, "t12"));
  assert.ok(tl.returns.includes(label(full, "t15")));
});

function generated(n: number): Rows {
  const words = "river lantern window kettle harbor gate bread morning storm square road mill dog night light boats tide door hall cold".split(" ");
  const tries = [];
  for (let i = 0; i < n; i++) {
    const s = [];
    for (let j = 0; j < 30; j++) s.push(`The ${words[(i * 7 + j * 3) % words.length]} and the ${words[(i + j * 5) % words.length]} came back${j % 4 === 0 ? "?" : "."}`);
    tries.push({ id: `g${i}`, parent_id: i % 5 === 4 ? `g${i - 1}` : null, session_id: `s${i % 7}`, text: s.join(" ").slice(0, 8000), intent: i % 3 ? `try "${words[i % words.length]} and the" more` : null, scope_note: null, change_note: i % 5 === 4 ? "one change" : null, diagnosis: null, rough_edges: null, landed: null, style_tag: null, prompt_form: null, prompt_style: null, prompt_author: null, exercise_id: null, created_at: new Date(Date.UTC(2026, 10, 1, 0, i)).toISOString() });
  }
  return { tries, marks: [], stitches: [], xnotes: null, exercises: null, placements: [] };
}

test("200 generated pieces: the lookback runs under lookback_cpu_ms and no result row passes 256 KB", () => {
  const g = generated(CAPS.lookback_pieces);
  const start = performance.now();
  const c = buildCorpus(g, g.tries.map((t) => t.id));
  const sections = [audit(c), recurring(c), dropped(c, diffsOf(c))];
  const ms = performance.now() - start;
  console.log(`lookback on 200 pieces: ${Math.round(ms)} ms`);
  assert.ok(ms < CAPS.lookback_cpu_ms, `${ms} ms`);
  for (const s of sections) for (const row of putChunked(s)) assert.ok(new TextEncoder().encode(row).length <= CHUNK_BYTES);
});

test("full-length pieces: the character cap keeps the lookback under lookback_cpu_ms", () => {
  let seed = 1;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const vocab: string[] = [];
  for (let i = 0; i < 3000; i++) vocab.push(Array.from({ length: 3 + Math.floor(rnd() * 6) }, () => String.fromCharCode(97 + Math.floor(rnd() * 26))).join(""));
  const common = "the a and of to in it was i on that with as at for his her".split(" ");
  const pick = () => (rnd() < 0.4 ? common[Math.floor(rnd() * common.length)] : vocab[Math.floor(rnd() ** 2 * vocab.length)]);
  const g = generated(CAPS.lookback_pieces);
  for (const t of g.tries) {
    let text = "";
    while (text.length < 7800) text += Array.from({ length: 6 + Math.floor(rnd() * 18) }, pick).join(" ") + ". ";
    t.text = text.slice(0, 8000);
  }
  const start = performance.now();
  const c = buildCorpus(g, g.tries.map((t) => t.id), [], CAPS.lookback_pieces, CAPS.lookback_chars);
  audit(c);
  recurring(c);
  dropped(c, diffsOf(c));
  const ms = performance.now() - start;
  console.log(`lookback on ${c.pieces.length} full-length pieces: ${Math.round(ms)} ms`);
  assert.ok(c.capped && c.pieces.length < CAPS.lookback_pieces);
  assert.ok(c.pieces.every((p, i, all) => i === 0 || p.created_at > all[i - 1].created_at), "newest pieces, in order");
  assert.ok(ms < CAPS.lookback_cpu_ms, `${ms} ms`);
});
