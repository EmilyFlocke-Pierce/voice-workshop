// Checks for slice 02's catalog, measures, drift rule, note kinds, and speed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { CATALOG, KINDS, MEASURES, UNMAPPED_FORMS, BANDS } from "../src/styles/catalog.ts";
import { bandOf, thirdsOf, usualOf, driftMarks, valuesOf, distanceFromUsual } from "../src/styles/measures.ts";
import { sentencesOf } from "../src/feedback/text.ts";
import { checkNote, NOTE_KINDS } from "../src/styles/notes.ts";
import { JUDGING } from "../src/feedback/words.ts";
import { CAPS } from "../src/caps.ts";

test("the catalog: 40 styles, every form has a kind, every kind has a style, ids are unique", () => {
  assert.equal(CATALOG.length, 40);
  assert.deepEqual(UNMAPPED_FORMS, []);
  for (const k of KINDS) assert.ok(CATALOG.some((s) => s.kind === k), k);
  assert.equal(new Set(CATALOG.map((s) => s.id)).size, 40);
  assert.equal(CATALOG.filter((s) => s.movement).length, 20);
  assert.equal(new Set(CATALOG.filter((s) => s.movement).map((s) => s.movement)).size, 20);
  assert.equal(CATALOG.filter((s) => s.author).length, 10);
  assert.equal(CATALOG.filter((s) => !s.author && !s.movement).length, 10);
});

test("each style has 3 to 5 features, and every set target has a feature line naming its band", () => {
  for (const s of CATALOG) {
    assert.ok(s.features.length >= 3 && s.features.length <= 5, s.id);
    for (const m of MEASURES) {
      const t = s.targets[m];
      if (t === "any") continue;
      assert.ok(BANDS[m].includes(t), `${s.id} ${m}`);
      assert.ok(s.features.some((f) => f.endsWith(`[${m}: ${t}]`)), `${s.id} has no line for ${m}: ${t}`);
    }
  }
});

test("features describe and never rank: no judging words", () => {
  for (const s of CATALOG) for (const f of s.features) for (const w of JUDGING) assert.ok(!new RegExp(`\\b${w}\\b`, "i").test(f), `${s.id}: "${w}" in ${f}`);
});

test("band edges: the middle band includes both edges", () => {
  assert.equal(bandOf("sentence_words", 11.99), "short");
  assert.equal(bandOf("sentence_words", 12), "medium");
  assert.equal(bandOf("sentence_words", 22), "medium");
  assert.equal(bandOf("sentence_words", 22.01), "long");
  assert.equal(bandOf("register", -1), "plain");
  assert.equal(bandOf("register", -1.01), "casual");
  assert.equal(bandOf("questions", 0.25), "some");
  assert.equal(bandOf("openings", 0.41), "repeated");
});

test("the five measures count what the plan says", () => {
  const v = valuesOf(sentencesOf("I went out, and I came back. I sat. Did it rain? Therefore it rained, however briefly."));
  assert.equal(v.sentence_words, 4.25); // 17 words over 4 sentences
  assert.equal(v.clauses, 1.75); // 3 + 1 + 1 + 2 over 4
  assert.equal(v.openings, 0.5); // "I" opens two of four
  assert.equal(v.questions, 0.25);
  assert.equal(v.register, 11.76); // 2 formal words over 17, per 100
  const c = valuesOf(sentencesOf("Yeah I don't know. It's fine."));
  assert.equal(c.register, -33.33); // yeah and don't are casual, it's counts neither way
});

test("drift: a third is marked when 2 set measures leave the target and match the usual", () => {
  const usual = usualOf(["I ran. I hid. I came back. It was late. Yeah, okay."])!;
  assert.equal(usual.bands.sentence_words, "short");
  const long = "The hall was hung with every banner the guild had ever sewn, and the candles, which burned in their hundreds, threw a gold that settled on the guests like a second, softer cloth. ";
  const text = long.repeat(4) + "I ran. I hid. I came back. It was late. I left. I slept.";
  const map = thirdsOf(text);
  const marks = driftMarks(map.thirds, { sentence_words: "long", clauses: "layered", openings: "any", register: "formal", questions: "none" }, usual.bands);
  assert.ok(marks.some((m) => m.third === "end" && m.measures.includes("sentence_words") && m.measures.includes("clauses")));
  assert.ok(!marks.some((m) => m.third === "opening"));
  for (const m of marks) assert.ok(text.includes(m.quote));
  assert.deepEqual(driftMarks(map.thirds, { sentence_words: "long", clauses: "layered", openings: "any", register: "formal", questions: "none" }, null), []);
});

test("far from usual counts set targets that differ from the usual's band", () => {
  const u = { sentence_words: "short", clauses: "simple", openings: "varied", register: "plain", questions: "none" };
  assert.equal(distanceFromUsual({ sentence_words: "long", clauses: "layered", openings: "any", register: "formal", questions: "none" }, u), 3);
});

test("note kinds: the validator follows the table", () => {
  assert.equal(Object.keys(NOTE_KINDS).length, 14, "13 from Part A, plus register_hold from Part B");
  assert.ok(!checkNote("drift", { text: "x" }).ok, "drift needs a try_id");
  assert.ok(checkNote("drift", { try_id: "t", text: "the end slid back", quotes: [{ line: "I ran." }] }).ok);
  assert.ok(!checkNote("stuck_move", { try_id: "t", text: "x", move: "give up" }).ok);
  assert.ok(checkNote("stuck_move", { try_id: "t", text: "x", move: "shorten" }).ok);
  assert.ok(!checkNote("hard_passage", { try_id: "t", text: "x" }).ok, "hard_passage needs a span");
  assert.ok(!checkNote("reader_impressions", { try_id: "t", readers: [{ reader: "a", impression: "b" }] }).ok, "two readers or more");
  assert.ok(checkNote("reader_impressions", { try_id: "t", readers: [{ reader: "a", impression: "b" }, { reader: "c", impression: "d" }] }).ok);
  assert.ok(!checkNote("effects", { try_id: "t", text: "x", feature: "color" }).ok);
  const ease = checkNote("ease", { text: "x", quotes: [{ try_id: "t", line: "y" }] });
  assert.ok(ease.ok && ease.note.try_id === null);
  assert.ok(!checkNote("nonsense", { text: "x" }).ok);
  assert.ok(!checkNote("calibration", { try_id: "t", text: "x" }).ok, "calibration names a feature");
  assert.ok(!checkNote("calibration", { try_id: "t", text: "x", feature: "pacing", did: "ignored" }).ok, "did takes strengthened or changed");
  const cal = checkNote("calibration", { try_id: "t", text: "the build now runs to the end", feature: "pacing", did: "strengthened" });
  assert.ok(cal.ok && cal.note.extra?.feature === "pacing" && cal.note.extra?.did === "strengthened");
  const hold = checkNote("register_hold", { text: "the counted cars stayed mine" });
  assert.ok(hold.ok && hold.note.try_id === null, "register_hold sits on the exercise, with try_id null");
});

test("the style map on an 8000-character draft runs under feedback_cpu_ms", () => {
  const unit = "The tide came in slowly, and the gulls, which had waited all morning, rose at once. Did anyone see it? ";
  const text = unit.repeat(Math.ceil(8000 / unit.length)).slice(0, 8000);
  const usual = usualOf([text.slice(0, 3000), text.slice(3000, 6000), text.slice(6000)]);
  thirdsOf(text); // warm up
  const start = performance.now();
  const map = thirdsOf(text);
  driftMarks(map.thirds, CATALOG[0].targets, usual!.bands);
  const ms = performance.now() - start;
  assert.ok(ms < CAPS.feedback_cpu_ms, `${ms} ms`);
});
