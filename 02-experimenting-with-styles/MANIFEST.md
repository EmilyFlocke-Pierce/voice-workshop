# Manifest: 1.2 Experimenting with styles

Matrix: `criteria.json` (Quilt session 1925caee, v1). L3 is the target. Plan: `PLAN.md` (column 3 filled). Branch `build-all`: Part A in 5f7dbf3, Part B in 6512a2f.

**Locate status:** batch 02-B (I.C.1 to I.C.3) was located in run 1 at L2* (`locate/02-B-run1.md`) and is lifted below, waiting for relocation. Batch 02-A is closed at 6/6 L3* after run 2 (`locate/02-A-run2.md`, relocating I.B.1 from the lift in `5cfe02a`). I.A.1, I.A.2, I.A.3, I.B.2, and I.B.3 carried forward from run 1 (`locate/02-A-run1.md`). The other 15 rows are not located yet. Locating belongs to CANDY. Every agent-side row rests only on builder stand-in try-outs (`tryouts/tryout02.mjs` and `tryouts/tryout-all.mjs` in this folder, see SESSION), and needs a cold try-out and a recheck when real outside agents use the workshop.

Part B sits beyond the matrix, so it has no rows here. Its walkthrough lines are listed under Verify.

Paths are under `app/`. "Walkthrough" names a line in `npm run walkthrough`; "test:styles" a test in `npm run test:styles`.

## Criteria

| Criterion (Quilt number and label, verbatim) | Evidence | How to check it |
|---|---|---|
| I.A.1 looking over the styles on offer | Built. GET /styles: 40 styles by 8 kinds with counts per kind, each with features and targets (`src/styles/catalog.ts`, draft-1). Agent side: the assessment is the agent's; reach notes and why_this_one hold it. | Walkthrough: "GET /styles groups 40 styles by 8 kinds with counts". test:styles: "the catalog: 40 styles, ...". |
| I.A.2 picking one it has not tried yet | Built. GET /styles/history: tried and untried, pieces per kind, rarely written kinds, 5 styles far from the usual. why_this_one names the gap, with an invite when it is missing. Agent side, builder stand-in only. | Walkthrough: "GET /styles/history shows untried styles, ...", "the exercise reply says any style is open and why is the agent's own". |
| I.A.3 naming what it expects the style to do | Built. POST /exercises takes expectations {items: [{feature, effect}], combined}; invite when missing. | Walkthrough: "POST /exercises takes a style, why, and expectations, and draws a subject". |
| I.B.1 using the style features on purpose | Built, lifted after run 1, relocated at 3* in run 2 (stand-in). The earlier gap was that `calibration` was never asked for. The style map by third beside the targets (`src/styles/routes.ts`). A `calibration` note names one feature and says how it shapes the effect (`src/styles/notes.ts`). The pause (`calibrate`), the style map (`calibrate`, and `your_earlier_calibrations` on a retry), the exercise reply (`while_drafting`), and the arrival text all invite it. Agent side, builder stand-in only. | Walkthrough: "the style map shows each third beside the usual and the style's targets", "the pause and the map both surface the calibration note, in plain words, without a second pause question", "a calibration note records one feature strengthened and how it shapes the intended effect", "the retry's map shows the earlier calibration beside the new thirds", "a calibration note on the retry follows through, and the exercise holds both". test:styles: "note kinds: the validator follows the table". |
| I.B.2 holding the style from start to finish | Built. Drift marks (2 or more measures in a third back in the usual's band); drift pause after a first try; drift note with exact quotes. | Walkthrough: "the map marks the last third drifting back to the usual, ...", "a drift note names the passage and the revision, ...". test:styles: "drift: ...". |
| I.B.3 finishing the piece when the style feels foreign | Built. Four stuck moves in the arrival text and in every exercise pause; stuck_move note. | Walkthrough: "effects and stuck_move notes are kept". |
| I.C.1 trying kinds of writing it rarely makes | Built, lifted after run 1 of batch 02-B (recorded L2*: no executed case). Far-from-usual styles and rarely written kinds in history, plus `far_in_rarely_written_kinds` (`src/styles/routes.ts`). The exercise reply carries `for_you`: the kind read as familiar or rarely written, and how far the style sits from the usual. A piece in a rarely written kind ends with its thirds at the style's targets. 🦋 in FLAGS: kinds count only drawn or exercise tries, so "usual range" reads two ways (amendment waits for Emily). | Walkthrough: "a kind at 2 pieces reads as familiar, ...", "the far styles inside the rarely written kinds are listed on their own", "a familiar kind with a near style reads as familiar and close to the usual", "a rarely written kind with a far style reads as rarely written and far, ...", "the far piece's thirds all hold the style's targets, ...", "the far piece finishes, ...". test:styles: "far from usual counts ...". |
| I.C.2 naming what is unusual about the style for it | Built, lifted after run 1 of batch 02-B (recorded L2*: `unusual` was never asked for). An `unusual` note quotes the words in the piece and takes an optional `shift`, the change in approach the style asks (`src/styles/notes.ts`). The exercise reply (`for_you`), the first-try pause when the style is far (`unusual`), the style map (`unusual`, `departs_from_your_usual`), and the arrival text invite it. A near style gets the same note with a lighter invite. | Walkthrough: "far from the usual, the pause carries the unusual invite beside its one question, ...", "near the usual, the pause leaves the unusual invite out, ...", "an unusual note quotes the words in the piece, and says so when it does not", "a shift is a short phrase in the agent's words", "an unusual note diagnoses the shift the style demands and anchors it in the piece". test:styles: "note kinds: ...". |
| I.C.3 staying with the parts that feel wrong to write | Built, lifted after run 1 of batch 02-B (recorded L2*: `hard_passage` was never asked for). A `hard_passage` note quotes its exact span and takes an optional `shift`. The pause's stuck block, the style map, and the arrival text invite it. On a retry, the map reads each earlier hard passage's third beside the style's targets (`your_earlier_hard_passages`: holds, away, at your usual). Agent side, builder stand-in only. | Walkthrough: "the first try's pause, the style map, and the exercise reply all surface hard_passage and unusual ...", "a hard_passage note quotes its exact span, and says so when it does not", "a hard_passage note names the exact span and the shift to make", "the retry's map reads the hard passage's third beside the style's targets: it holds, and drift is not marked", "the retry's pause invites a hard_passage note and points to the map". test:styles: "note kinds: ...". |
| II.A.1 detect tone changes | Built. effects note with feature tone, exact quotes; effects pause on a retry. | Walkthrough: "a retry stays in the exercise and asks the effects question". |
| II.A.2 track syntax shifts | Built. effects note with feature syntax; clauses measure by third. | Walkthrough: "effects and stuck_move notes are kept". test:styles: "the five measures count what the plan says". |
| II.A.3 measure pacing variations | Built. effects note with feature pacing; sentence_words by third. | Same as II.A.2. |
| II.A.4 note diction shifts | Built. effects note with feature diction; register measure (word lists v1). | Same as II.A.2. |
| II.B.1 Inferring reader impressions | Built. reader_impressions takes two readers or more; finish asks about two readers. | Walkthrough: "reader impressions take two readers or more", "finish takes ease and pull ... asks about two readers". |
| II.B.2 Separating style from speaker | Built. style_vs_speaker note kind. Part B reuses it on register tries. | test:styles: "note kinds: ...". |
| II.C.1 Noticing where the writing slows down | Built. slowdowns note kind, quotes required. | test:styles: "note kinds: ...". |
| II.C.2 Noticing where it slips back to its usual | Built. slips_back note kind, quotes required; drift marks show the moments. Part B reads it the other way: keeping the usual is the aim. | Walkthrough: "the map marks the last third drifting back ...". |
| II.C.3 Describing what writing the piece was like | Built. what_it_was_like note kind, quotes required. | test:styles: "note kinds: ...". |
| III.A.1 recognizing low-friction styles | Built. GET /reach: ease by style and by kind, with counts, in order. Part B: registers group in date order. | Walkthrough: "GET /reach shows ease and pull by style and by kind, ...", "GET /reach shows register exercises in their own group, in date order". |
| III.A.2 saying why a style felt natural | Built. ease at finish with quotes. Part B: register_hold at finish. | Walkthrough: "finish takes ease and pull in one call, ...", "finish keeps register_hold and closes the exercise". |
| III.B.1 Identifying high-friction styles | Built. Ease notes across exercises in GET /reach; reach notes take the agent's reading, with REACH_Q asking which repeat. | Walkthrough: "POST /reach/notes keeps the agent's reading across exercises". |
| III.B.2 Naming the source of stylistic resistance | Built. ease asks which part came from the style and which from habits; register_hold asks what the format asked it to give up. | Walkthrough: finish lines. |
| III.C.1 Recognizing stylistic pull | Built. pull at finish; GET /reach by style over time. | Walkthrough: "GET /reach shows ease and pull by style and by kind, ...". |
| III.C.2 Connecting attraction to style effects | Built. pull takes effects; GET /reach lists effects named in pull by style side by side. | Walkthrough: same line, effects "delay,ceremony". |

## Verify

From `app/` (PowerShell on ezra-01, or bash):

```
npm install
npm run db:local
npm run typecheck
npm run test:styles
npm run walkthrough
```

Expect test:styles 9 of 9 and the walkthrough 142 of 142. Part B lines start at "GET /styles offers register exercises".

## Files

| Path | What it holds |
|---|---|
| `src/styles/catalog.ts` | The 40 styles, kinds, measures, bands. |
| `src/styles/measures.ts` | Band edges, values, thirds, the usual, drift marks. |
| `src/styles/registers.ts` | Register word lists, and Part B's REGISTERS. |
| `src/styles/notes.ts` | Note kinds and their checks. |
| `src/styles/routes.ts` | Every slice 02 route. |
| `src/styles/register-exercises.ts` | Part B: voice refs and the map beside the agent's own voice. |
| `migrations/0006_exercises.sql`, `0008_registers.sql` | Tables for Part A and Part B. |
| `test/style-map.test.ts` | test:styles. |
