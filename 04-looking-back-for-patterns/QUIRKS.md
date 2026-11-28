# Quirks: 2.1 Looking back for patterns

A to-be-done list. None of these holds a level.

## Open

| Quirk | Found by | Touches | Next move |
|---|---|---|---|
| A recurring span can cross a sentence end ("I counted. The"). | Grok Bot, try-out 2 | II.B.1, III.A.1 | Break word runs at sentence ends before counting spans. |
| Near matches run on 4-word spans only, to keep the lookback inside its time cap. | Grok Bot | I.C.1, III.A.1 | Try 3 and 5 word near spans once real corpora show the time it takes. |
| The code cannot tell when two notes disagree; it shows them side by side. | Grok Bot | III.A.3 | Keep the agent's judgment; add a "these disagree" mark the agent can set. |
| A lookback stops at 400000 characters, about 50 full-length pieces. | Grok Bot (timing) | I.A.4 | Measure on Workers after a deploy and raise it if CPU allows. |
| The full-length timing check ran at 0.84 s against the 1 s cap on the box. | Grok Bot | test:lookback | If it fails on a slower machine, lower lookback_chars, not the cap. |
| The misplaced/ambiguous audit inspects `free_text` only and requires a double-quoted span of 3 words or more. (CANDY, 04-A run 1) | I.A.3 | Leave it. The audit looks for a quoted span the agent set against another version. Short spans and unquoted words would flag ordinary language. A later move can widen it if a locator finds a misplaced note the audit missed. |
| A mark note's assembled `text` adds field prefixes (`why back:`, `less familiar:`). (CANDY, 04-A run 1) | I.A.3 | Leave the prefixes so the assembled line still names which field each part came from when it is shown as one note. The audit uses `what_tried` as `free_text`, without those prefixes. A later move can drop the prefixes if they get in the way of reading. |
| `COMPARE_MEASURES` and `SHAPE_NAMES` overlap only on closing length (`closing_words` / `short_landing`). (CANDY, 04-B run 1) | I.B.1, II.B.4 | Leave both. One is a word count on /compare; the other is a shape flag (a last sentence of 6 words or fewer) on /recurring. They answer different questions. A later move can point from one to the other if a locator wants them side by side. |
| `lookback.test.ts` tests pure modules only; the D1 wrappers in `routes.ts` have no isolated HTTP unit tests. (CANDY, 04-C and 04-D) | II.A.1, II.C.1, II.C.3 | Leave the unit file on pure modules. `claimView`, `CLAIM_KINDS`, `thinClaimAsk`, `checkCited`, and `findingsText` now have unit checks, and the walkthrough hits POST /claims and GET /findings on the worker. A later move can add a D1 route harness if a locator wants a check that does not start wrangler. |

## Closed

| Quirk | Commit |
|---|---|
| `measureOf` / `COMPARE_MEASURES` were not unit-tested in `lookback.test.ts` (CANDY, 04-B run 1). They have a unit check now, on a known piece. | the 04-B lift |
| `breaks_after_first` in `timeline()` was computed and never asserted (CANDY, 04-B run 1). A unit check now names the pieces that break after the first appearance. | the 04-B lift |
| `04/MANIFEST.md` (and SESSION) still said "walkthrough 118 of 118" after the walkthrough had grown (CANDY, 04-A run 1). The count is now 171 of 171, matching the current walkthrough. | the 04-A close |
| Recurring items carried no `id` (CANDY, 04-C run 1). Each candidate now has a stable id (`wording:exact:...`, `transition:...`, `shape:...`, and so on). | the 04-C lift |
| Recurring shape items carried no occurrence quotes (CANDY, 04-C run 1). Shape candidates now quote the sentence that carries the shape, as `shapeSentence` already did for dropped moves. | the 04-C lift |
| POST /claims, `claimView`, `CLAIM_KINDS`, `notes_side_by_side`, and GET /findings had no unit tests (CANDY, 04-D run 1). Those shapes now have unit checks, and the walkthrough posts function, future_intent, each kind, and reads findings. | the 04-D lift |
| `checkCited` for rejections accepted a piece or a note_id, while its error text asked for both (CANDY, 04-D run 1). The error text now matches what it accepts. | the 04-D lift |
| `rejections.scope: "one instance"` never executed (CANDY, 04-D run 1). A walkthrough and a unit check now post a single rejection and assert the scope. | the 04-D lift |

## Ideas

- Layered pieces from slice 03 replace retry chains when 03 exists.
