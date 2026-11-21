// Code checks for the prompt randomizer: list sizes, dead authors, short forms, seeds, and ids.
import { test } from "node:test";
import assert from "node:assert/strict";
import { AUTHORS, FORMS, STYLES, SUBJECTS, drawPrompt, fromPromptId, fromPicks } from "../src/prompts.ts";

test("the four lists hold about the sizes Emily asked for", () => {
  assert.ok(FORMS.length >= 20 && FORMS.length <= 25, `forms ${FORMS.length}`);
  assert.ok(STYLES.length >= 20, `styles ${STYLES.length}`);
  assert.ok(AUTHORS.length >= 25, `authors ${AUTHORS.length}`);
  assert.ok(SUBJECTS.length >= 25, `subjects ${SUBJECTS.length}`);
});

test("every author carries a death year from long ago", () => {
  for (const a of AUTHORS) assert.ok(Number.isInteger(a.death_year) && a.death_year <= 1970, `${a.name} ${a.death_year}`);
  assert.equal(new Set(AUTHORS.map((a) => a.name)).size, AUTHORS.length);
});

test("forms stay short", () => {
  for (const f of FORMS) assert.doesNotMatch(f, /novel|novella|saga|trilogy|epic|memoir|screenplay/i, f);
});

test("the same seed draws the same prompt, and the id reads back to it", () => {
  const a = drawPrompt("heron-7");
  assert.deepEqual(drawPrompt("heron-7"), a);
  assert.deepEqual(fromPromptId(a.prompt_id), a);
  assert.match(a.prompt, /^Write an? .+, .+, like .+, about .+\.$/);
});

test("a different list version or a bad seed reads as no prompt", () => {
  assert.equal(fromPromptId("v0-heron-7"), null);
  assert.equal(fromPromptId("v1-has spaces"), null);
});

test("four named picks build the same sentence as a draw", () => {
  const a = drawPrompt("seed-42");
  const b = fromPicks({ form: a.form, style: a.style, author: a.author.name, subject: a.subject });
  assert.equal(b?.prompt, a.prompt);
  assert.equal(fromPicks({ form: "a novel", style: a.style, author: a.author.name, subject: a.subject }), null);
});

test("draws spread across every list", () => {
  const seen = { form: new Set(), style: new Set(), author: new Set(), subject: new Set() };
  for (let i = 0; i < 2000; i++) {
    const p = drawPrompt(`s${i}`);
    seen.form.add(p.form); seen.style.add(p.style); seen.author.add(p.author.name); seen.subject.add(p.subject);
  }
  assert.equal(seen.form.size, FORMS.length);
  assert.equal(seen.style.size, STYLES.length);
  assert.equal(seen.author.size, AUTHORS.length);
  assert.equal(seen.subject.size, SUBJECTS.length);
});
