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
  const end = marks.find((m) => m.third === "end");
  assert.ok(end && end.measures.includes("sentence_words") && end.measures.includes("clauses"));
  assert.ok(end.back_to_usual.includes("sentence_words") && end.back_to_usual.includes("clauses"));
  assert.ok(!marks.some((m) => m.third === "opening"));
  for (const m of marks) assert.ok(text.includes(m.quote));
  const noUsual = driftMarks(map.thirds, { sentence_words: "long", clauses: "layered", openings: "any", register: "formal", questions: "none" }, null);
  const endNo = noUsual.find((m) => m.third === "end");
  assert.ok(endNo && endNo.back_to_usual.length === 0 && endNo.elsewhere.includes("sentence_words") && endNo.elsewhere.includes("clauses"));
});

test("drift: a third is also marked when 2 set measures leave the target for a band that is not the usual", () => {
  const usual = { sentence_words: "short", clauses: "simple", openings: "varied", register: "plain", questions: "none" };
  const targets = { sentence_words: "long", clauses: "layered", openings: "any", register: "formal", questions: "none" };
  const zero = { sentence_words: 0, clauses: 0, openings: 0, register: 0, questions: 0 };
  const third = (name, bands) => ({ third: name, sentences: { from: 1, to: 3 }, first_sentence: name, values: zero, bands });
  const holds = { sentence_words: "long", clauses: "layered", openings: "varied", register: "formal", questions: "none" };
  const elseB = { sentence_words: "medium", clauses: "moderate", openings: "varied", register: "formal", questions: "none" };
  const marks = driftMarks([third("opening", holds), third("middle", holds), third("end", elseB)], targets, usual);
  assert.equal(marks.length, 1);
  assert.deepEqual(marks[0].measures, ["sentence_words", "clauses"]);
  assert.deepEqual(marks[0].back_to_usual, []);
  assert.deepEqual(marks[0].elsewhere, ["sentence_words", "clauses"]);
  const mixed = { ...elseB, sentence_words: "short" };
  const marks2 = driftMarks([third("end", mixed)], targets, usual);
  assert.deepEqual(marks2[0].back_to_usual, ["sentence_words"]);
  assert.deepEqual(marks2[0].elsewhere, ["clauses"]);
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
  assert.ok(!checkNote("ease", { text: "the long sentences came easily" }).ok, "ease quotes the piece");
  assert.ok(!checkNote("pull", { text: "I want more of this", effects: ["delay"] }).ok, "pull quotes the piece");
  const pull = checkNote("pull", { text: "The delay drew me", effects: ["delay", "ceremony"], quotes: [{ try_id: "t", line: "I ask you all to rise" }] });
  assert.ok(pull.ok && pull.note.try_id === null && pull.note.quotes.length === 1 && (pull.note.extra?.effects as string[]).join() === "delay,ceremony", "pull takes a quoted effects list");
  assert.ok(!checkNote("nonsense", { text: "x" }).ok);
  assert.ok(!checkNote("calibration", { try_id: "t", text: "x" }).ok, "calibration names a feature");
  assert.ok(!checkNote("calibration", { try_id: "t", text: "x", feature: "pacing", did: "ignored" }).ok, "did takes strengthened or changed");
  const cal = checkNote("calibration", { try_id: "t", text: "the build now runs to the end", feature: "pacing", did: "strengthened" });
  assert.ok(cal.ok && cal.note.extra?.feature === "pacing" && cal.note.extra?.did === "strengthened");
  assert.ok(!checkNote("effects", { try_id: "t", feature: "tone", text: "the tone turns" }).ok, "an effects note quotes its moment");
  for (const feature of ["tone", "syntax", "pacing", "diction"]) {
    const fx = checkNote("effects", { try_id: "t", feature, text: "how it makes the effect", quotes: [{ line: "a moment" }] });
    assert.ok(fx.ok && fx.note.extra?.feature === feature && fx.note.quotes.length === 1, `${feature} takes a quoted effects note`);
  }
  assert.ok(!checkNote("effects", { try_id: "t", feature: "sound", text: "x", quotes: [{ line: "a moment" }] }).ok, "four features only");
  assert.ok(!checkNote("unusual", { try_id: "t", text: "longer than mine" }).ok, "unusual quotes the words where the shift shows");
  assert.ok(!checkNote("unusual", { try_id: "t", text: "x", shift: " ", quotes: [{ line: "a line" }] }).ok, "shift is a phrase when given");
  const un = checkNote("unusual", { try_id: "t", text: "x", shift: "hold each sentence open", quotes: [{ line: "a line" }] });
  assert.ok(un.ok && un.note.extra?.shift === "hold each sentence open" && un.note.quotes.length === 1);
  const hp = checkNote("hard_passage", { try_id: "t", text: "x", shift: "keep the long build", quotes: [{ line: "I am done." }] });
  assert.ok(hp.ok && hp.note.extra?.shift === "keep the long build");
  assert.ok(checkNote("hard_passage", { try_id: "t", text: "x", quotes: [{ line: "I am done." }] }).ok, "shift stays optional");
  assert.ok(!checkNote("style_vs_speaker", { try_id: "t", text: "they pull apart" }).ok, "style_vs_speaker quotes the words");
  const svs = checkNote("style_vs_speaker", { try_id: "t", text: "formal phrasing reinforces confidence", quotes: [{ line: "Let the record show" }] });
  assert.ok(svs.ok && svs.note.quotes.length === 1, "style_vs_speaker takes a quoted diagnosis");
  assert.ok(!checkNote("slowdowns", { try_id: "t", text: "the long build slowed me" }).ok, "slowdowns quotes the spots");
  const slow = checkNote("slowdowns", { try_id: "t", text: "the style's stacked clauses made this harder", quotes: [{ line: "clause into a clause" }] });
  assert.ok(slow.ok && slow.note.quotes.length === 1, "slowdowns takes a quoted diagnosis");
  assert.ok(!checkNote("slips_back", { try_id: "t", text: "I landed short" }).ok, "slips_back quotes the return");
  const slip = checkNote("slips_back", { try_id: "t", text: "the close felt like too much, so I snapped back", quotes: [{ line: "I am done." }] });
  assert.ok(slip.ok && slip.note.quotes.length === 1, "slips_back takes a quoted diagnosis");
  assert.ok(!checkNote("what_it_was_like", { try_id: "t", text: "attention held to the end" }).ok, "what_it_was_like quotes moments from the piece");
  const like = checkNote("what_it_was_like", { try_id: "t", text: "the long build opened a possibility I don't have in a short landing", quotes: [{ line: "I ask you all to rise" }] });
  assert.ok(like.ok && like.note.quotes.length === 1, "what_it_was_like takes a quoted assessment");
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
