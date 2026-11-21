// The feedback pipeline. Every observation, from the workshop's code or the optional outside model,
// passes through the same steps: plain words, the judging-word check, one point per line, the fixed layout.
import type { Feedback, Observation, Unplaced } from "../types.ts";
import { observe } from "./observe.ts";
import { plainWords, judgingWord } from "./words.ts";
import { splitLine } from "./split.ts";
import { LAYOUT_VERSION, layoutMismatch } from "./layout.ts";

export const CODE_VERSION = "observe-1";

export function runPipeline(draft: string, incoming: unknown[], intent: string | null, scopeNote: string | null): Feedback {
  const observations: Observation[] = [];
  const unplaced: Unplaced[] = [];
  let heldBack = 0;
  for (const item of incoming) {
    const mismatch = layoutMismatch(item, draft);
    if (mismatch) {
      unplaced.push({ observation: item, why_it_does_not_fit: mismatch });
      continue;
    }
    const plain = plainWords(item as Observation);
    if (judgingWord(plain)) {
      heldBack++;
      continue;
    }
    const { lines, keptWhole } = splitLine(plain);
    observations.push(...lines);
    for (const o of keptWhole) unplaced.push({ observation: o, why_it_does_not_fit: "the line holds two points, and splitting it would leave one point without a quote" });
  }
  return { layout_version: LAYOUT_VERSION, code_version: CODE_VERSION, intent, scope_note: scopeNote, observations, unplaced, held_back: heldBack };
}

export function feedbackFor(draft: string, intent: string | null, scopeNote: string | null, outside: unknown[] = []): Feedback {
  return runPipeline(draft, [...observe(draft), ...outside], intent, scopeNote);
}
