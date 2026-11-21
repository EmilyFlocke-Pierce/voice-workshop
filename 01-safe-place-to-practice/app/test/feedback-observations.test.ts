// Code checks for the feedback reader: what it says, how it quotes, and how fast it runs.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { feedbackFor, runPipeline } from "../src/feedback/index.ts";
import { judgingWord, plainWords } from "../src/feedback/words.ts";
import { splitLine } from "../src/feedback/split.ts";
import { layoutMismatch, redacted } from "../src/feedback/layout.ts";
import { diffTries } from "../src/feedback/diff.ts";

const pieces: Record<string, string> = JSON.parse(readFileSync(new URL("./sample-pieces.json", import.meta.url), "utf8"));

test("every observation fits the four-field layout and quotes the draft as written", () => {
  for (const text of Object.values(pieces)) {
    const f = feedbackFor(text, "intent", null);
    assert.ok(f.observations.length >= 1);
    for (const o of f.observations) {
      assert.deepEqual(Object.keys(o), ["feature", "where", "quotes", "pattern"]);
      assert.ok(o.quotes.length >= 1 && o.quotes.length <= 3);
      for (const q of o.quotes) assert.ok(text.includes(q.quote), `quote not in draft: ${q.quote}`);
    }
  }
});

test("the reader's own wording carries no judging words", () => {
  for (const text of Object.values(pieces)) for (const o of feedbackFor(text, null, null).observations) assert.equal(judgingWord(o), null, JSON.stringify(o));
});

test("a change from opening to end quotes both sides", () => {
  const f = feedbackFor(pieces.P1_hem_river, null, null);
  const len = f.observations.find((o) => o.feature === "Sentence length");
  assert.ok(len);
  assert.equal(len.quotes.length, 2);
  assert.match(len.quotes[0].place, /^opening/);
  assert.match(len.quotes[1].place, /^end/);
});

test("repeated hedge words are named with where they sit", () => {
  const text = "Perhaps the light was wrong. I waited by the door. Perhaps nobody came. The road was empty. Perhaps it rained. I went in. Perhaps that was all.";
  const o = feedbackFor(text, null, null).observations.find((x) => x.feature === 'Repeated word "perhaps"');
  assert.ok(o);
  assert.match(o.pattern, /appears 4 times/);
});

test("intent and scope note sit with the observations", () => {
  const f = feedbackFor(pieces.P4_did_weather, "try a colder voice", "the prompt kept me short", []);
  assert.equal(f.intent, "try a colder voice");
  assert.equal(f.scope_note, "the prompt kept me short");
});

test("technical terms become plain words, quoted words stay as written", () => {
  const o = plainWords({ feature: "Anaphora", where: "opening", quotes: [{ quote: "x", place: "opening" }], pattern: 'anaphora on "anaphora"' });
  assert.equal(o.feature, "lines start the same way");
  assert.equal(o.pattern, 'lines start the same way on "anaphora"');
});

test("judging words hold a line back, the agent's quoted words pass", () => {
  assert.equal(judgingWord({ feature: "Rhythm", where: "end", quotes: [], pattern: "the ending works" }), "works");
  assert.equal(judgingWord({ feature: 'Repeated word "good"', where: "end", quotes: [], pattern: '"good" appears 3 times' }), null);
  const draft = "The ending is here.";
  const f = runPipeline(draft, [{ feature: "Ending", where: "end", quotes: [{ quote: "The ending is here.", place: "end" }], pattern: "a strong close" }], null, null);
  assert.equal(f.observations.length, 0);
  assert.equal(f.held_back, 1);
});

test("a line with two points becomes two lines, each with its own quote", () => {
  const { lines, keptWhole } = splitLine({ feature: "Rhythm and pronouns", where: "end", quotes: [{ quote: "a", place: "end" }, { quote: "b", place: "end" }], pattern: "sentences shorten; also the pronoun moves to you" });
  assert.equal(keptWhole.length, 0);
  assert.equal(lines.length, 2);
  assert.deepEqual(lines.map((l) => l.quotes.length), [1, 1]);
});

test("a two-point line with one quote stays whole for the layout flags", () => {
  const { lines, keptWhole } = splitLine({ feature: "Rhythm and pronouns", where: "end", quotes: [{ quote: "a", place: "end" }], pattern: "x; also y" });
  assert.equal(lines.length, 0);
  assert.equal(keptWhole.length, 1);
});

test("a line that fits no field goes to unplaced, and its flag hides the agent's words", () => {
  const draft = "I said it twice.";
  const odd = { feature: "Mood", where: "end", quotes: [{ quote: "I said it twice.", place: "end" }], pattern: "x", mood: "calm" };
  assert.match(layoutMismatch(odd, draft) ?? "", /fields the layout has no place for/);
  const f = runPipeline(draft, [odd], null, null);
  assert.equal(f.unplaced.length, 1);
  assert.ok(!redacted(odd).includes("I said it twice."));
});

test("a retry diff lists every changed sentence", () => {
  const changes = diffTries("One. Two. Three.", "One. Two now. Three. Four.");
  assert.deepEqual(changes.map((c) => c.kind), ["changed", "added"]);
});

test("feedback on a draft at the 8000 character cap runs well inside 50 ms", () => {
  const big = (pieces.P1_hem_river + " ").repeat(20).slice(0, 8000);
  const t0 = performance.now();
  feedbackFor(big, null, null);
  diffTries(big, big.replace("heron", "crane"));
  assert.ok(performance.now() - t0 < 50, `took ${performance.now() - t0} ms`);
});
