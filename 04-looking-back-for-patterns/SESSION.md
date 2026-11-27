# Session: 2.1 Looking back for patterns

| Field | Value |
|---|---|
| slice | Looking back for patterns, Quilt slice 02-01 |
| matrix | `criteria.json`, Quilt session 1925caee, v1, 27 criteria |
| plan | `PLAN.md` (copied from `plans/04-looking-back-for-patterns-plan.md`, which stays as signed) |
| builder | Grok Bot |
| decider | Emily |
| locating manager | CANDY |
| status | built. Batch 04-A closed at 4/4 L3* after run 1. Batch 04-B located at 2/3 L3* (I.B.2, I.C.1) and I.B.1 lifted, waiting for relocation. The other rows wait for locating. |

## Decisions

| Date | Decider's words | Call |
|---|---|---|
| Nov 25, 2026 | "build it all at once ... line it up to intent, locating as you go" (pt223u) | CHANGE. One local branch, `build-all`, in place of `slice-04`. |
| Nov 25, 2026 | "Anything like that you can stub out ... flag it for us to look at together" (pt224u) | KEEP. Judgment calls are in `FLAGS.md`. |

## Running record

All rows Nov 25, 2026. Code lives in `app/`.

| Row | What landed | Where |
|---|---|---|
| Module and migration | `src/lookback/`, `0007_lookbacks.sql`. Plan changes: `lookback_pieces.seq`, `pattern_revisions.instances`, a `lookback_writes` table for the daily write cap. | 2ab3810 |
| Corpus and audit | Labels, note ids, chains, audit, placements, pull. | `corpus.ts`, `routes.ts` |
| Recurring | Exact 3 to 6 words in two passes; near on 4-word spans with integer stem ids. | `recurring.ts`, `near.ts` |
| Dropped | Word-level removed runs; a quoted span inside a removed run gets its own line; returns and echoes. | `dropped.ts` |
| Patterns, counts, claims, findings | As in the plan. | `patterns.ts`, `routes.ts` |
| Nudge | At session end with 6 tries across 2 sessions and no lookback since the last end. | `routes.ts`, `src/index.ts` |
| Timing | First run 1069 ms on 200 pieces against the 1000 ms cap; recurring was the slow part. Two-pass maps and 4-word near brought 200 short pieces to about 0.27 s. Then 200 pieces at 8000 characters took about 2 s, so I added `lookback_chars: 400000`: about 50 full pieces in about 0.8 s. | `src/caps.ts`, `test/lookback.test.ts` |
| Checks | test:lookback 19 of 19; walkthrough 174 of 174 with the lookback and nudge lines. | |

Two test fixes, both on my own expectations: the first appearance of the fixture move is t12, not t15. The dropped check now reads returns on the words the change note quotes.

## Builder try-out (stand-in)

**Try-out 2 (`02-experimenting-with-styles/tryouts/tryout-all.mjs`), Nov 25, about 8:47 PM CST.** One lookback over four pieces.
- Worked: labels, note counts, and "the tea went cold" recurring across three pieces with each quote as written.
- Snags:
  - A recurring span crossed a sentence end: "I counted. The" matched "I counted the". Listed in QUIRKS.
  - The retry was sent wrong (see 02's SESSION), so no chain showed in this try-out. The walkthrough covers chains.

Each agent-side row needs a cold try-out by CANDY's locators.

## Locate run 1 (batch 04-A), Nov 27, 2026

Report: `locate/04-A-run1.md`. CANDY located I.A.1 to I.A.4 against `98264b0` and closed the batch at 4/4 L3* on run 1, unanimous. Two 🦋 takes (notes whose try sits outside the corpus; `parent_outside` checks one hop) are in FLAGS.md. Three quirks are in QUIRKS.md, including the stale walkthrough count, now updated to 171 of 171. The other rows of slice 04 wait for locating.

## Locate run 1 and lift (batch 04-B), Nov 27, 2026

Report: `locate/04-B-run1.md`. CANDY located I.B.1, I.B.2, and I.C.1 against `98264b0` at 2/3 L3* (I.B.2 and I.C.1 unanimous; I.B.1 at L2*). The lift adds reflection notes of every kind that belongs to a piece beside it on GET /compare, and names how the measure holds, rises, or falls along the sequence. A walkthrough finishes a four-piece sequence that holds, then rises, then holds, with intent, scope_note, diagnosis, and a mark beside the pieces. `measureOf` and `breaks_after_first` now have unit checks. Three 🦋 takes are in FLAGS.md. Waiting for relocation of I.B.1; I.B.2 and I.C.1 carry forward.

