# Session: 2.1 Looking back for patterns

| Field | Value |
|---|---|
| slice | Looking back for patterns, Quilt slice 02-01 |
| matrix | `criteria.json`, Quilt session 1925caee, v1, 27 criteria |
| plan | `PLAN.md` (copied from `plans/04-looking-back-for-patterns-plan.md`, which stays as signed) |
| builder | Grok Bot |
| decider | Emily |
| locating manager | CANDY |
| status | built. Batch 04-A closed at 4/4 L3* after run 1. Batch 04-B closed at 3/3 L3* after run 2. Batch 04-C closed at 6/6 L3* after run 2. Batch 04-D closed at 3/3 L3* after run 2. Domain II of slice 04 is at L3* across Threads A, B, and C. The other rows wait for locating. |

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
| Checks | test:lookback 29 of 29; walkthrough 184 of 184 with the lookback and nudge lines. | |

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


## Locate run 1 and lift (batch 04-C), Nov 27, 2026

Report: `locate/04-C-run1.md`. CANDY located II.A.1, II.A.2, and II.B.1 to II.B.4 against `98264b0` at 1/6 L3* (II.B.1 unanimous; the other five at L2*). The lift puts reflection notes of every kind beside recurring candidates and beside the pieces on the pattern view, with ids and occurrence quotes. The timeline connects the friction point, the style shift there, and the note there. `across_styles` surfaces a cross-style view of an intended choice (wording that holds or changes with the style, notes and passages beside the pieces). A walkthrough weighs a generic transition and a stock close against notes, traces a default claim with `note_id` evidence, and weighs a list of three against keep and drop notes, including where it breaks. Four 🦋 takes are in FLAGS.md. Waiting for relocation of the five lifted rows; II.B.1 carries forward at L3*.

## Locate run 1 and lift (batch 04-D), Nov 27, 2026

Report: `locate/04-D-run1.md`. CANDY located II.C.1, II.C.2, and II.C.3 against `98264b0` at 0/3 L3* (II.C.1 and II.C.2 at L1*; II.C.3 at L2*). The lift posts `function` and `future_intent` on claims and prints both in findings. A walkthrough diagnoses a packing list that is dropped and then returns, weighs future intent against that conflict, and posts taste, mixture, and unclear claims with notes, rejections, and counterexamples, beside the thin-claim nudge (now for every kind). Exercise notes carry pull effects and calibration fields into the lookback. Four 🦋 takes are in FLAGS.md. Waiting for relocation of II.C.1 to II.C.3.

## Locate run 2 close (batch 04-B), Nov 27, 2026

Report: `locate/04-B-run2.md`. CANDY relocated I.B.1 against `1725848` at L3* (moved from L2*, both locators agree). Batch 04-B is closed at 3/3 L3*. I.B.2 and I.C.1 carry forward at L3*. Two 🦋 takes are in FLAGS.md (the previous-piece baseline for a shift, and relevance left unowned because every note on the piece is attached). Logged two open quirks, and fixed the stale walkthrough count and the 04 MANIFEST header to 184 of 184 at `1c12e28`. No code changed. Batches 04-C and 04-D remain lifted, waiting for relocation at `1c12e28`.

## Locate run 2 close (batch 04-C), Nov 27, 2026

Report: `locate/04-C-run2.md`. CANDY relocated II.A.1, II.A.2, II.B.2, II.B.3, and II.B.4 against `1c12e28` at L3* (moved from L2*, both locators agree, chair verified). With II.B.1 carried forward at L3*, batch 04-C is closed at 6/6 L3*. Two 🦋 takes are in FLAGS.md (the previous-piece baseline for the friction point, and `across_styles` leaving out styles where the move never appears). Logged six open quirks. The stale walkthrough count and `2ab3810` header that CANDY saw at `1c12e28` were already fixed in `d33f390`, after that locate commit. No code changed. Batch 04-D remains lifted, waiting for relocation at `1c12e28`.

## Locate run 2 close (batch 04-D), Nov 27, 2026

Report: `locate/04-D-run2.md`. CANDY relocated II.C.1, II.C.2, and II.C.3 against `1c12e28` at L3* (II.C.1 and II.C.2 moved from L1*, II.C.3 from L2*; both locators agree, chair verified). Batch 04-D is closed at 3/3 L3*. Domain II of slice 04 is at L3* across Threads A, B, and C. Two 🦋 takes are in FLAGS.md (default overlapping mixture on a preference dropped and then returned, and the stricter evidence ask for a default claim). Logged nine open quirks. The stale walkthrough count and `2ab3810` header that CANDY carried at `1c12e28` were already fixed in `d33f390`. No code changed.
