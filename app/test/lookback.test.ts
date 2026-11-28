// Checks for slice 04's pure functions against a seeded corpus. Each expect entry in lookback-corpus.json is one check.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { audit, buildCorpus, notesOf, type Rows, type TryIn } from "../src/lookback/corpus.ts";
import { recurring } from "../src/lookback/recurring.ts";
import { dropped, removedRuns } from "../src/lookback/dropped.ts";
import { acrossStyles, COMPARE_MEASURES, compareAlong, countPattern, measureOf, rankPatterns, timeline } from "../src/lookback/patterns.ts";
import { CLAIM_KINDS, CLAIM_KIND_MEANS, checkCited, claimFindingLines, claimView, findingsText, thinClaimAsk } from "../src/lookback/claims.ts";
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
      const hit = d.find((x) => x.type === "move" && x.move === e.move && x.retry === label(full, e.retry as string));
      assert.ok(hit, JSON.stringify(d.filter((x) => x.type === "move")));
      assert.equal(hit.evidence, "indirect");
      assert.deepEqual(hit.returns_in, []);
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

test("measureOf gives a number for every COMPARE_MEASURES on a known piece", () => {
  const text = "Hello there, friend. How are you today? I am fine.";
  assert.equal(measureOf(text, "sentence_count"), 3);
  assert.equal(measureOf(text, "sentence_words"), 3.33);
  assert.ok(COMPARE_MEASURES.every((m) => typeof measureOf(text, m) === "number"));
  assert.equal(measureOf(text, "question_share"), Math.round((1 / 3) * 100) / 100);
  assert.equal(measureOf(text, "closing_words"), 3);
  assert.equal(measureOf(text, "opening_repeat"), 0);
  assert.equal(measureOf("", "sentence_count"), 0);
  const repeated = "The kettle sang. The window fogged. I left.";
  assert.ok(measureOf(repeated, "opening_repeat") > 0);
});

test("compareAlong lines up reflection notes of every kind and names how the measure holds or shifts", () => {
  const shortA = "The kettle sang. I poured a cup. The window fogged.";
  const shortB = "The lantern burned. I took a seat. The hallway quieted.";
  const longC = "Friends gathered here beneath these lanterns I rise to speak of two people whose patience has carried them through every season to this table.";
  const longD = "Beloved friends who have crossed weather and water I rise again to speak of a marriage built in the quiet returns of many days.";
  const rows: Rows = {
    tries: [
      tryRow("a", shortA, { intent: "keep the lines short and land at once" }),
      tryRow("b", shortB, { scope_note: "same short landing as the first sitting" }),
      tryRow("c", longC, { diagnosis: "the sentence now holds the whole toast in one build" }),
      tryRow("d", longD, { intent: "stay with the long build" }),
    ],
    marks: [{ id: "m1", try_id: "c", what_tried: "long ceremonial build", why_back: "to see the sentence_words rise", own_lines: null, less_familiar: null }],
    stitches: [],
    xnotes: null,
    exercises: null,
    placements: [],
  };
  const c = buildCorpus(rows, ["a", "b", "c", "d"]);
  const along = compareAlong(c, "sentence_words");
  assert.equal(along.pieces.length, 4);
  assert.equal(along.pieces[0].shift, "first");
  assert.equal(along.pieces[1].shift, "holds");
  assert.equal(along.pieces[1].value, along.pieces[0].value);
  assert.equal(along.pieces[2].shift, "rises");
  assert.ok(along.pieces[2].value > along.pieces[1].value);
  assert.equal(along.pieces[3].shift, "holds");
  assert.equal(along.pieces[3].value, along.pieces[2].value);
  assert.ok(along.pieces[0].notes.some((n) => n.kind === "intent" && /keep the lines short/.test(n.text)));
  assert.ok(along.pieces[1].notes.some((n) => n.kind === "scope_note" && /same short landing/.test(n.text)));
  assert.ok(along.pieces[2].notes.some((n) => n.kind === "diagnosis" && /one build/.test(n.text)));
  assert.ok(along.pieces[2].notes.some((n) => n.kind === "mark" && /long ceremonial build/.test(n.text)));
  assert.ok(along.pieces[3].notes.some((n) => n.kind === "intent" && /stay with the long build/.test(n.text)));
  assert.ok(/P1 starts at/.test(along.along_the_sequence) && /P2 holds at/.test(along.along_the_sequence) && /P3 rises to/.test(along.along_the_sequence) && /P4 holds at/.test(along.along_the_sequence));
});

test("timeline names the pieces that break after the first appearance", () => {
  const text = "The kettle sang. I poured a cup. The window fogged.";
  const rows: Rows = {
    tries: ["a", "b", "c", "d", "e"].map((id) => tryRow(id, text, {})),
    marks: [],
    stitches: [],
    xnotes: null,
    exercises: null,
    placements: [],
  };
  const c = buildCorpus(rows, ["a", "b", "c", "d", "e"]);
  const per: Record<string, number> = { P2: 1, P4: 1 };
  const denom = c.pieces.map((p) => p.label);
  const tl = timeline(c, per, denom);
  assert.equal(tl.first_appearance, "P2");
  assert.deepEqual(tl.gaps, [["P3"]]);
  assert.deepEqual(tl.returns, ["P4"]);
  assert.deepEqual(tl.breaks_after_first, ["P3", "P5"]);
  assert.ok(!tl.breaks_after_first.includes("P1"), "a piece before the first appearance is not a break after first");
});

function tryRow(id: string, text: string, notes: { intent?: string | null; scope_note?: string | null; change_note?: string | null; diagnosis?: string | null; style_tag?: string | null; parent_id?: string | null; at?: string } = {}): TryIn {
  const seq = "abcdefghij".indexOf(id);
  return { id, parent_id: notes.parent_id ?? null, session_id: "s1", text, intent: notes.intent ?? null, scope_note: notes.scope_note ?? null, change_note: notes.change_note ?? null, diagnosis: notes.diagnosis ?? null, rough_edges: null, landed: null, style_tag: notes.style_tag ?? "plain", prompt_form: null, prompt_style: null, prompt_author: null, exercise_id: null, created_at: notes.at ?? `2026-11-01T00:00:0${seq >= 0 ? seq : 0}Z` };
}


function emptyRows(tries: TryIn[], marks: Rows["marks"] = []): Rows {
  return { tries, marks, stitches: [], xnotes: null, exercises: null, placements: [] };
}

function habitCorpus() {
  const p1 = "The kettle sang. Then I poured a cup. Bread cooled on the board.";
  const p2 = "Friends gathered here. Then bread, cheese, and apples sat on the table, and the room went still.";
  const p3 = "Beloved friends crossed the water. Then bread, cheese, and apples waited, and the room went still.";
  const p4 = "Beloved friends crossed the water. Then the food waited, and the room went still.";
  const p5 = "The lantern burned. Then I took a seat, and the room went still.";
  const rows = emptyRows([
    tryRow("a", p1, { intent: "open on a concrete object and land short", style_tag: "plain", at: "2026-11-01T00:00:01Z" }),
    tryRow("b", p2, { intent: "open on a concrete gathering, now in a long ceremonial build", diagnosis: "the ceremonial style pulled me from short landings; I reached for a stock close and a list of three", style_tag: "baroque", at: "2026-11-01T00:00:02Z" }),
    tryRow("c", p3, { style_tag: "baroque", at: "2026-11-01T00:00:03Z" }),
    tryRow("d", p4, { parent_id: "c", change_note: 'I dropped the list of three and kept "and the room went still".', style_tag: "baroque", at: "2026-11-01T00:00:04Z" }),
    tryRow("e", p5, { intent: "back to a short landing, still opening on a concrete object", style_tag: "plain", at: "2026-11-01T00:00:05Z" }),
  ], [{ id: "m1", try_id: "c", what_tried: "kept the ceremonial close and the list of three", why_back: "the still room still works", own_lines: null, less_familiar: null }]);
  return buildCorpus(rows, ["a", "b", "c", "d", "e"]);
}

test("recurring candidates carry an id, occurrence quotes, and the reflection notes beside the pieces", () => {
  const c = habitCorpus();
  const items = recurring(c);
  assert.ok(items.every((x) => typeof x.id === "string" && (x.id as string).length > 0));
  const trans = items.find((x) => x.type === "transition" && x.words === "then");
  assert.ok(trans, JSON.stringify(items.filter((x) => x.type === "transition")));
  const transNotes = trans.notes_beside_pieces as { label: string; notes: { kind: string; text: string }[] }[];
  assert.ok(transNotes.some((r) => r.label === "P1" && r.notes.some((n) => n.kind === "intent" && /land short/.test(n.text))));
  assert.ok(transNotes.some((r) => r.label === "P2" && r.notes.some((n) => n.kind === "diagnosis" && /ceremonial style/.test(n.text))));
  assert.ok(transNotes.some((r) => r.label === "P4" && r.notes.some((n) => n.kind === "change_note" && /dropped the list of three/.test(n.text))));
  const wording = items.find((x) => x.type === "wording" && String(x.words).includes("and the room went still"));
  assert.ok(wording && wording.id === "wording:exact:and the room went still");
  const wordingNotes = wording.notes_beside_pieces as { label: string; notes: { kind: string; id: string }[] }[];
  assert.ok(wordingNotes.some((r) => r.label === "P2" && r.notes.some((n) => n.kind === "diagnosis" && n.id)));
  const shape = items.find((x) => x.type === "shape" && x.shape === "list_of_three");
  assert.ok(shape && shape.id === "shape:list_of_three");
  const occ = shape.occurrences as { label: string; quote: string | null }[];
  assert.ok(occ.some((o) => o.label === "P2" && /bread, cheese, and apples/.test(o.quote ?? "")));
  const shapeNotes = shape.notes_beside_pieces as { label: string; notes: { kind: string; text: string }[] }[];
  assert.ok(shapeNotes.some((r) => r.label === "P3" && r.notes.some((n) => n.kind === "mark" && /kept the ceremonial close/.test(n.text))));
});

test("timeline connects the friction point, the style shift there, and the note there", () => {
  const c = habitCorpus();
  const inst = [
    { piece: "P2", quote: "and the room went still" },
    { piece: "P3", quote: "and the room went still" },
    { piece: "P4", quote: "and the room went still" },
    { piece: "P5", quote: "and the room went still" },
  ];
  const counts = countPattern(c, inst, "every");
  const tl = timeline(c, counts.per_piece, counts.denominator.pieces);
  assert.equal(tl.first_appearance, "P2");
  assert.ok(tl.friction_point && tl.friction_point.label === "P2" && tl.friction_point.style === "baroque");
  const shift = tl.friction_point.style_shift;
  assert.ok(shift && shift.previous_label === "P1" && shift.previous_style === "plain" && shift.style === "baroque");
  assert.ok(/after P1 in plain/.test(shift.reads));
  assert.ok(tl.friction_point.notes.some((n) => n.kind === "diagnosis" && /ceremonial style pulled me from short landings/.test(n.text)));
  assert.ok(tl.pieces.some((r) => r.label === "P2" && r.notes.some((n) => n.kind === "diagnosis" && n.id)));
});

test("acrossStyles lines up notes and passages by style and says whether the wording changes with the style", () => {
  const c = habitCorpus();
  const inst = [
    { piece: "P1", quote: "The kettle sang" },
    { piece: "P2", quote: "Friends gathered here" },
    { piece: "P5", quote: "The lantern burned" },
  ];
  const counts = countPattern(c, inst, "every");
  const beside = acrossStyles(c, inst, counts.per_piece);
  const { styles, wordings_by_style, reads } = beside.across_styles;
  assert.ok(styles.includes("plain") && styles.includes("baroque"));
  assert.ok(/wording changes with the style/.test(reads));
  assert.ok(wordings_by_style.plain.includes("The kettle sang") && wordings_by_style.plain.includes("The lantern burned"));
  assert.ok(wordings_by_style.baroque.includes("Friends gathered here"));
  const plain = beside.notes_beside_it_by_style.plain;
  const baroque = beside.notes_beside_it_by_style.baroque;
  assert.ok(plain.some((r) => r.label === "P1" && r.has_it && r.passages.includes("The kettle sang") && r.notes.some((n) => n.kind === "intent" && /open on a concrete object/.test(n.text))));
  assert.ok(baroque.some((r) => r.label === "P2" && r.has_it && r.passages.includes("Friends gathered here") && r.notes.some((n) => n.kind === "intent" && /open on a concrete gathering/.test(n.text))));
  const sameInst = [{ piece: "P2", quote: "and the room went still" }, { piece: "P5", quote: "and the room went still" }];
  const same = acrossStyles(c, sameInst, countPattern(c, sameInst, "every").per_piece);
  assert.ok(/with the same wording/.test(same.across_styles.reads));
});

test("a list of three that a retry drops is weighed against the change note, including where it breaks and that it does not return", () => {
  const c = habitCorpus();
  const inst = [{ piece: "P2", quote: "bread, cheese, and apples" }, { piece: "P3", quote: "bread, cheese, and apples" }];
  const counted = countPattern(c, inst, "default");
  const tl = timeline(c, counted.per_piece, counted.denominator.pieces);
  assert.equal(tl.first_appearance, "P2");
  assert.ok(tl.breaks_after_first.includes("P4") && tl.breaks_after_first.includes("P5"));
  const d = dropped(c, diffsOf(c));
  const hit = d.find((x) => x.type === "move" && x.move === "list_of_three" && x.retry === "P4");
  assert.ok(hit, JSON.stringify(d.filter((x) => x.type === "move")));
  assert.equal(hit.evidence, "explicit");
  assert.deepEqual(hit.returns_in, []);
});

test("claimView keeps note evidence beside the claim, including a single weighed note", () => {
  const view = claimView({
    id: "cl1",
    pattern_id: "pat1",
    kind: "default",
    function: "",
    future_intent: "",
    evidence: JSON.stringify([
      { piece: "P2", quote: "and the room went still" },
      { note_id: "try:b:diagnosis", note_kind: "diagnosis", piece: "P2", quote: "I reached for a stock close and a list of three" },
    ]),
    interpretation: "a default ceremonial close",
    counterexamples: JSON.stringify([{ piece: "P1", quote: "Bread cooled on the board." }]),
    rejections: "[]",
    qualifiers: "",
    created_at: "2026-11-01T00:00:06Z",
  });
  assert.equal(view.kind, "default");
  assert.equal(view.kind_means, CLAIM_KIND_MEANS.default);
  assert.ok((view.evidence as Record<string, unknown>[]).some((e) => e.note_id === "try:b:diagnosis" && e.note_kind === "diagnosis"));
  assert.equal(view.notes_side_by_side, null);
  assert.ok((view.counterexamples as Record<string, unknown>[]).some((e) => e.piece === "P1"));
});

test("CLAIM_KINDS names four kinds, and mixture is distinct from unclear", () => {
  assert.deepEqual([...CLAIM_KINDS], ["taste", "default", "mixture", "unclear"]);
  assert.ok(/both a deliberate preference and a habit/.test(CLAIM_KIND_MEANS.mixture));
  assert.ok(/not enough to tell/.test(CLAIM_KIND_MEANS.unclear));
  assert.notEqual(CLAIM_KIND_MEANS.mixture, CLAIM_KIND_MEANS.unclear);
});

test("claimView sets notes_side_by_side when two notes are weighed, and names one-instance rejection scope", () => {
  const view = claimView({
    id: "cl2",
    pattern_id: "pat1",
    kind: "mixture",
    function: "it packs a scene as a ceremonial three",
    future_intent: "I said I would drop it, but it returned",
    evidence: JSON.stringify([
      { note_id: "try:a:intent", note_kind: "intent", piece: "P1", quote: "keep the list" },
      { note_id: "try:c:change_note", note_kind: "change_note", piece: "P3", quote: "I dropped the list of three" },
    ]),
    interpretation: "both a preference and a habit",
    counterexamples: JSON.stringify([{ piece: "P3", quote: "We packed food" }]),
    rejections: JSON.stringify([{ piece: "P3", quote: "We packed food" }]),
    qualifiers: "the return weakens the drop",
    created_at: "2026-11-01T00:00:07Z",
  });
  assert.equal(view.kind, "mixture");
  assert.equal((view.notes_side_by_side as unknown[]).length, 2);
  assert.equal((view.rejections as { scope?: string }).scope, "one instance");
  assert.equal((view.rejections as { recorded: string }).recorded, "1 recorded");
  assert.equal(view.function, "it packs a scene as a ceremonial three");
  assert.equal(view.future_intent, "I said I would drop it, but it returned");
});

test("thinClaimAsk fires for every kind when notes or a counterweight are missing, and stays silent when the record is weighed", () => {
  const note = [{ note_id: "n1", quote: "x" }];
  const piece = [{ piece: "P1", quote: "x" }];
  const ce = [{ piece: "P2", quote: "y" }];
  const rj = [{ piece: "P3", quote: "z" }];
  assert.match(thinClaimAsk("default", piece, [], []) ?? "", /counterexamples/);
  assert.match(thinClaimAsk("taste", piece, [], []) ?? "", /taste/);
  assert.match(thinClaimAsk("mixture", note, [], []) ?? "", /mixture/);
  assert.match(thinClaimAsk("unclear", [], ce, rj) ?? "", /unclear/);
  assert.equal(thinClaimAsk("default", note, ce, []), null);
  assert.equal(thinClaimAsk("taste", note, [], rj), null);
  assert.equal(thinClaimAsk("mixture", note, ce, []), null);
});

test("findings text includes function and future intent, and checkCited rejections take a piece or a note_id", () => {
  const text = findingsText(4, [{
    name: "list of three",
    inclusion_rule: "a list of three items",
    reading: "in 3 of 4 pieces",
    piece_labels: "P1, P2, P4",
    instances: [{ piece: "P1", quote: "bread, cheese, and apples" }],
    claims: [{ kind: "mixture", function: "a ceremonial packing list", future_intent: "I meant to drop it", interpretation: "both preference and habit", qualifiers: "the return weakens the drop" }],
  }], "only four short pieces");
  assert.match(text, /function: a ceremonial packing list/);
  assert.match(text, /future intent: I meant to drop it/);
  assert.match(text, /how sure: the return weakens the drop/);
  assert.match(text, /claim: mixture, both preference and habit/);
  assert.deepEqual(claimFindingLines({ kind: "taste", interpretation: "mine" }), ["  claim: taste, mine"]);

  const c = habitCorpus();
  const okNote = checkCited(c, [{ note_id: "try:b:diagnosis", quote: "I reached for a stock close" }], "rejection");
  assert.equal(okNote.ok, true);
  const okPiece = checkCited(c, [{ piece: "P1", quote: "Bread cooled on the board." }], "rejection");
  assert.equal(okPiece.ok, true);
  const bad = checkCited(c, [{ quote: "Bread cooled on the board." }], "rejection");
  assert.equal(bad.ok, false);
  if (!bad.ok) assert.match(String((bad.bad[0] as { why: string }).why), /piece" \(or "note_id"\)/);
});

test("exercise notes carry pull effects and calibration fields into the lookback", () => {
  const rows = emptyRows([
    tryRow("a", "The kettle sang. Then I poured a cup.", { intent: "land short", at: "2026-11-01T00:00:01Z" }),
  ]);
  rows.tries[0].exercise_id = "ex1";
  rows.exercises = [{ id: "ex1", style_id: "hemingway-plain" }];
  rows.xnotes = [
    { id: "xn1", exercise_id: "ex1", try_id: "a", kind: "calibration", text: "I strengthened the short landing", quotes: "[]", extra: { feature: "pacing", did: "strengthened" } },
    { id: "xn2", exercise_id: "ex1", try_id: null, kind: "pull", text: "the short lines keep drawing me", quotes: "[]", extra: JSON.stringify({ effects: ["plainness", "a clean stop"] }) },
  ];
  const c = buildCorpus(rows, ["a"]);
  const notes = [...notesOf(rows).values()];
  const cal = notes.find((n) => n.kind === "exercise calibration");
  const pull = notes.find((n) => n.kind === "exercise pull");
  assert.ok(cal && cal.extra && cal.extra.feature === "pacing" && cal.extra.did === "strengthened");
  assert.ok(pull && pull.extra && Array.isArray(pull.extra.effects) && (pull.extra.effects as string[]).includes("plainness"));
  const onPiece = c.pieces[0].note_ids.map((id) => c.notes.get(id)!);
  assert.ok(onPiece.some((n) => n.extra && n.extra.feature === "pacing"));
  assert.ok(onPiece.some((n) => n.extra && Array.isArray(n.extra.effects)));
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
