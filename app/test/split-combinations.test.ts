// II.B.2 after locate run 2. TAFFY's 48 ordinary combinations (locate/probe/taffy-r2-probe-rate.test.ts),
// plus the shapes from her R8, R11, and R12 probes. Every line out is clean or the line stays whole:
// zero garbled lines, zero fragments, and true two-point lines split into two readable lines.
import { test } from "node:test";
import assert from "node:assert/strict";
import { splitLine } from "../src/feedback/split.ts";

const two = [{ quote: "a", place: "opening" }, { quote: "b", place: "end" }];
const line = (pattern: string, feature = "Punctuation") => ({ feature, where: "across the piece", quotes: two, pattern });

// Each first half with its subject and whether its verb takes one or many.
const FIRST_HALVES: [string, string, "one" | "many"][] = [
  ["Punctuation gathers at the end", "Punctuation", "one"],
  ["Punctuation gathers at the start", "Punctuation", "one"],
  ["Punctuation gathers in the middle", "Punctuation", "one"],
  ["Dashes sit at the close", "Dashes", "many"],
  ["Dashes collect at the end", "Dashes", "many"],
  ["Question marks cluster at the close", "Question marks", "many"],
  ["Repetition sits at the end", "Repetition", "one"],
  ["The rhythm holds to the end", "The rhythm", "one"],
  ["Sentences shorten toward the close", "Sentences", "many"],
  ["Sentences shorten toward the end", "Sentences", "many"],
  ["The pronoun settles in the opening", "The pronoun", "one"],
  ["The tense holds in the opening", "The tense", "one"],
];
// Each second half with the number its verb takes. "they" points back, so that line stays whole.
const SECOND_HALVES: [string, "one" | "many" | "pointer"][] = [
  ["also appears twice in the opening", "one"],
  ["also appears at the start", "one"],
  ["also open short", "many"],
  ["also they lengthen after", "pointer"],
];

type Outcome = "clean" | "whole" | "fragment" | "garbled";

// A line out is a fragment when it has no subject before its verb phrase, and garbled when its
// subject is not one the reader wrote.
function judge(pattern: string, out: ReturnType<typeof splitLine>, subject: string, rest: string): Outcome {
  if (out.keptWhole.length || (out.lines.length === 1 && out.lines[0].pattern === pattern)) return "whole";
  if (out.lines.length !== 2) return "garbled";
  const [a, b] = out.lines.map((l) => l.pattern);
  const firstHalf = pattern.slice(0, pattern.indexOf(" and also"));
  if (a !== `${firstHalf}.`) return "garbled";
  const restText = rest.replace(/^also\s+/, "");
  if (!b.endsWith(`${restText}.`)) return "garbled";
  const lead = b.slice(0, b.length - restText.length - 1).trim();
  if (lead === "") return "fragment";
  return lead === subject ? "clean" : "garbled";
}

test("TAFFY's 48 combinations: zero garbled, zero fragments, and every agreeing pair splits clean", () => {
  const count: Record<Outcome, number> = { clean: 0, whole: 0, fragment: 0, garbled: 0 };
  for (const [first, subject, firstNumber] of FIRST_HALVES) {
    for (const [second, secondNumber] of SECOND_HALVES) {
      const pattern = `${first} and ${second}.`;
      const out = splitLine(line(pattern));
      const outcome = judge(pattern, out, subject, second);
      count[outcome]++;
      const expected: Outcome = secondNumber === firstNumber ? "clean" : "whole";
      assert.equal(outcome, expected, `${pattern} -> ${JSON.stringify(out.lines.map((l) => l.pattern))}`);
      if (expected === "clean") {
        assert.deepEqual(out.lines.map((l) => l.pattern), [`${first}.`, `${subject} ${second.replace(/^also\s+/, "")}.`]);
        assert.deepEqual(out.lines.map((l) => l.quotes.length), [1, 1]);
      } else {
        assert.equal(out.keptWhole.length, 1, `${pattern} stays whole for the flags`);
        assert.ok(out.why && out.why.length > 0);
      }
    }
  }
  assert.equal(count.garbled, 0);
  assert.equal(count.fragment, 0);
  assert.deepEqual(count, { clean: 19, whole: 29, fragment: 0, garbled: 0 });
  console.log(`48 combinations: clean ${count.clean}, whole ${count.whole}, fragment ${count.fragment}, garbled ${count.garbled}`);
});

test("CANDY's two named cases come out clean or whole", () => {
  assert.deepEqual(splitLine(line("Punctuation gathers at the end and also appears twice in the opening.")).lines.map((l) => l.pattern), [
    "Punctuation gathers at the end.",
    "Punctuation appears twice in the opening.",
  ]);
  const cont = "Repetition sits in the opening and also at the close.";
  assert.deepEqual(splitLine(line(cont)).lines.map((l) => l.pattern), [cont]);
});

test("a continuation after 'and also' or a semicolon keeps the line as one observation (R8, R11-A)", () => {
  for (const p of [
    "Punctuation gathers at the end and also in the middle.",
    "Punctuation gathers at the end and also at the close.",
    "Punctuation gathers at the end and also in the opening.",
    "Punctuation gathers at the end and also toward the end.",
    "Punctuation gathers at the end and also across the piece.",
    "Punctuation gathers at the end and also near the close.",
    "Dashes appear at the end and also less often.",
    "Dashes appear at the end and also more often.",
    "Dashes appear at the end and also twice as often.",
    "Dashes appear at the end and also at the close.",
    "The rhythm holds in the opening and also in the last third.",
    "Sentence length drops in the middle and also at the end.",
    "Question marks cluster at the start and also near the close.",
    "Two dashes sit in the middle; also at the close.",
    "Six marks sit at the end; also in the middle.",
  ]) {
    const out = splitLine(line(p));
    assert.equal(out.keptWhole.length, 0, p);
    assert.deepEqual(out.lines.map((l) => l.pattern), [p]);
  }
});

test("two full observations split into two readable lines (R8-C, R11-B, R11-C)", () => {
  const cases: [string, string[]][] = [
    ["Punctuation gathers at the end and also thins in the middle.", ["Punctuation gathers at the end.", "Punctuation thins in the middle."]],
    ["The rhythm tightens in the last third and also loosens at the close.", ["The rhythm tightens in the last third.", "The rhythm loosens at the close."]],
    ["Sentences shorten toward the end and also lengthen in the middle.", ["Sentences shorten toward the end.", "Sentences lengthen in the middle."]],
    ["The pronoun moves to you and also the tense shifts to present.", ["The pronoun moves to you.", "The tense shifts to present."]],
    ["The opening runs long and also the close runs short.", ["The opening runs long.", "The close runs short."]],
    ["Dashes thin at the close; also semicolons gather in the middle.", ["Dashes thin at the close.", "Semicolons gather in the middle."]],
    ["Dashes appear at the end and also the colons gather there.", ["Dashes appear at the end.", "The colons gather there."]],
    ["Dashes sit at the close and also appear in the opening.", ["Dashes sit at the close.", "Dashes appear in the opening."]],
    ["Repetition sits at the end and also appears at the start.", ["Repetition sits at the end.", "Repetition appears at the start."]],
    ["The rhythm holds to the end and also opens short.", ["The rhythm holds to the end.", "The rhythm opens short."]],
    ["Question marks cluster at the close and also appear at the start.", ["Question marks cluster at the close.", "Question marks appear at the start."]],
    ["Punctuation gathers quickly and also appears twice in the opening.", ["Punctuation gathers quickly.", "Punctuation appears twice in the opening."]],
    ["Sentences shorten and also appear twice.", ["Sentences shorten.", "Sentences appear twice."]],
  ];
  for (const [p, want] of cases) assert.deepEqual(splitLine(line(p, "Rhythm")).lines.map((l) => l.pattern), want, p);
});

test("a second subject that cannot be carried cleanly keeps the line whole for the flags", () => {
  for (const p of [
    "Punctuation gathers at the end and also they lengthen after.",
    "In the opening dashes gather and also appear twice.",
    "Dashes collect at the end and also appears twice.",
  ]) {
    const out = splitLine(line(p));
    assert.equal(out.lines.length, 0, p);
    assert.deepEqual(out.keptWhole.map((o) => o.pattern), [p]);
    assert.match(out.why ?? "", /two points/);
  }
});

test("quoted words never count as a verb or a subject, and a split keeps them intact", () => {
  const p = 'Lines open with "I" and also end with "close" twice.';
  assert.deepEqual(splitLine(line(p, "Openings")).lines.map((l) => l.pattern), ["Lines open with \"I\".", 'Lines end with "close" twice.']);
});
