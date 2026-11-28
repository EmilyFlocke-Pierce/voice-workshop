# Manifest: 2.1 Looking back for patterns

Matrix: `criteria.json` (Quilt session 1925caee, v1). L3 is the target. Plan: `PLAN.md` (column 3 filled). Branch `build-all`, commit 2ab3810.

**Locate status:** batch 04-A (I.A.1 to I.A.4) is closed at 4/4 L3* after run 1 (`locate/04-A-run1.md`). Batch 04-B (I.B.1, I.B.2, I.C.1) was located in run 1 at 2/3 L3* (`locate/04-B-run1.md`); I.B.2 and I.C.1 carry forward, and I.B.1 is lifted, waiting for relocation. Batch 04-C (II.A.1, II.A.2, II.B.1 to II.B.4) was located in run 1 at 1/6 L3* (`locate/04-C-run1.md`); II.B.1 carries forward at L3*, and II.A.1, II.A.2, II.B.2, II.B.3, and II.B.4 are lifted, waiting for relocation. Batch 04-D (II.C.1 to II.C.3) was located in run 1 at 0/3 L3* (`locate/04-D-run1.md`); all three rows are lifted below, waiting for relocation. Locating belongs to CANDY. Agent-side rows rest only on the builder stand-in try-out (`02-experimenting-with-styles/tryouts/tryout-all.mjs`, see SESSION) and need a cold try-out and a recheck with real outside agents.

Paths are under `app/`. "Walkthrough" names a line in `npm run walkthrough`; "test:lookback" a test in `npm run test:lookback`, with fixtures in `test/lookback-corpus.json`.

## Criteria

| Criterion (Quilt number and label, verbatim) | Evidence | How to check it |
|---|---|---|
| I.A.1 Gather experimental pieces | Built. Located at L3* in run 1 of batch 04-A (unanimous, `locate/04-A-run1.md`). POST /lookbacks labels every try in scope P1 to Pn with its notes; GET /audit lists no-notes pieces, identical texts, and parents outside scope; POST /limits keeps the agent's limits note. Agent side, builder stand-in. | Walkthrough: "POST /lookbacks lays the pieces side by side ...", "the audit lists what it found ...". test:lookback: expect no_notes, identical, parent_outside. |
| I.A.2 Gather layered pieces | Built. Located at L3* in run 1 of batch 04-A (unanimous, `locate/04-A-run1.md`). Retry chains stand in for layered pieces until 03: chains in order, parent labels, pull a missing parent in with the next label. | Walkthrough: "a retry shows its parent's label and its chain". test:lookback: expect pull_next_label. |
| I.A.3 Gather reflection notes | Built. Located at L3* in run 1 of batch 04-A (unanimous, `locate/04-A-run1.md`). One id per note; audit flags misplaced and ambiguous notes; the agent places a note with POST /notes/:note_id. 🦋 in FLAGS: carried intent and scope_note sit on two versions. | test:lookback: expect misplaced, not_listed; "every note has one id, ... placements move a note". |
| I.A.4 Assemble review corpus | Built. Located at L3* in run 1 of batch 04-A (unanimous, `locate/04-A-run1.md`). Scope by all, dates, sessions, or kinds; the limits block says what is left out (cap, slice 02 tables, layered pieces). | Walkthrough: lookback lines. test:lookback: timing checks. |
| I.B.1 Compare across pieces | Built, lifted after run 1 of batch 04-B (recorded L2*: values and style tags, no reflection notes). GET /compare?measure= now gives one number per piece in order, names how the value holds, rises, or falls along the sequence, and carries every reflection-note kind that belongs to the piece (not only intent). | Walkthrough: "compare shows how a feature holds or shifts across the sequence, with reflection notes beside the pieces". test:lookback: compareAlong. |
| I.B.2 Track repeated choices | Built. Located at L3* in run 1 of batch 04-B (unanimous, `locate/04-B-run1.md`). Pattern view timeline: first appearance, gaps, returns, and breaks after the first appearance. | test:lookback: "counts: ..." (first appearance t12, return t15), "timeline names the pieces that break after the first appearance". |
| I.C.1 Name recurring choices | Built. Located at L3* in run 1 of batch 04-B (unanimous, `locate/04-B-run1.md`). Recurring wording exact and near; patterns take several wordings under one move, with word-for-word quote checking and versioned revisions. | Walkthrough: "a named pattern counts against the latest version of each chain by default". test:lookback: expect near. |
| II.A.1 cross-reference intent notes | Built, lifted after run 1 of batch 04-C (recorded L2*: intent notes by style, no executed cross-style case with notes beside passages). The pattern view still lines up intent notes by style, and now also puts every reflection-note kind and the cited passages beside the pieces, grouped by style. `across_styles` names the styles the move appears in, the wording in each, and whether that wording holds or changes with the style. | Walkthrough: "an intended choice is traced across styles, with notes and passages beside the pieces, and what stays consistent is distinguished from what changes with the style". test:lookback: acrossStyles. |
| II.A.2 find the friction point where a repeat began | Built, lifted after run 1 of batch 04-C (recorded L2*: first appearance and returns, no note references, no style shift). `timeline()` now has a `friction_point`: the starting piece, the style shift against the previous piece, and the reflection notes on that piece. Each timeline row also carries its notes. | Walkthrough: "the timeline connects the friction point where a repeat began, the style shift there, and the reflection note there". test:lookback: same. |
| II.B.1 identify baseline phrases | Built. Located at L3* in run 1 of batch 04-C (unanimous, `locate/04-C-run1.md`). Recurring wording, 3 to 6 words exact and 4-word stemmed near, with several wordings grouped under one pattern. | Walkthrough: "recurring and dropped answer with candidates, not verdicts". test:lookback: expect near. |
| II.B.2 flag generic transitions | Built, lifted after run 1 of batch 04-C (recorded L2*: transitions with no notes and no unit or walkthrough assertion). Recurring transition candidates now carry an id and the reflection notes beside the pieces that use them, so an agent can weigh a generic transition against what was chosen, kept, or changed. | Walkthrough: "a recurring generic transition carries the reflection notes beside the pieces that use it". test:lookback: recurring candidates. |
| II.B.3 isolate systemic redundancies | Built, lifted after run 1 of batch 04-C (recorded L2*: recurring wording with no notes; the walkthrough only exercised the asks prompt on an unsupported default claim). Recurring wording now carries notes beside the pieces, and a default claim can cite those notes by `note_id` alongside the passages, with a counterexample, to trace a stock close to a default move. The unsupported-claim asks prompt stays. | Walkthrough: "a systemic redundancy is traced to a default writing move with both the pieces and the reflection notes". test:lookback: claimView; recurring candidates. |
| II.B.4 detect structural autopilot | Built, lifted after run 1 of batch 04-C (recorded L2*: `removed_move` unasserted on evidence and returns_in; no note-weighed structural case). Recurring shapes now have ids, occurrence quotes, and notes beside the pieces. A walkthrough weighs a list of three against keep and drop notes, including where the pattern breaks and that the move does not return. `removed_move` now asserts evidence and `returns_in`. | Walkthrough: "a recurring structural move is weighed against change, keep, and drop notes, including where the pattern breaks". test:lookback: expect removed_move; list of three unit check. |
| II.C.1 Explain the repeat's function | Built, lifted after run 1 of batch 04-D (recorded L1*: function never posted, omitted from findings). A claim now carries `function`, citing pieces and notes, and findings print it. A walkthrough diagnoses a packing list as both a chosen preference and an unexamined habit when it returns after a drop. Exercise notes carry pull effects and calibration fields into the lookback. | Walkthrough: "a recurring choice's function is diagnosed from intent, effects in the pieces, and a drop that later returns". test:lookback: findingsText; exercise extra. |
| II.C.2 Assess future choice intent | Built, lifted after run 1 of batch 04-D (recorded L1*: future_intent and qualifiers never posted, omitted from findings). A walkthrough posts `future_intent` and qualifiers on a case where a change note said the list was dropped and a later piece returns it. Findings print the future intent. | Walkthrough: "future intent is weighed where a reflection conflicts with a later revision and a dropped move returns, with qualifiers". test:lookback: findingsText. |
| II.C.3 Distinguish taste from default | Built, lifted after run 1 of batch 04-D (recorded L2*: only the thin default claim ran). Short definitions separate taste, default, mixture, and unclear. A thin claim of any kind is asked to weigh notes and a counterexample or rejection. A walkthrough posts weighed taste, mixture, and unclear claims with note evidence, rejections (including one instance), and counterexamples, beside the thin-claim nudge. | Walkthrough: "weighed claims for taste, mixture, and unclear cite notes, rejections, and counterexamples, and a thin taste claim is asked to weigh the record". test:lookback: CLAIM_KINDS, claimView, thinClaimAsk. |
| III.A.1 quote recurring wording | Built. Every occurrence quoted from the piece as written; exact and near kept apart. | test:lookback: expect near. |
| III.A.2 cite supporting pieces | Built. Pattern instances checked word for word; a bad quote stores nothing. | Walkthrough: "a pattern quote that is not in the piece is refused, ...". |
| III.A.3 cite reflection notes | Built. Note quotes keep note id, piece, and kind; notes that disagree show side by side, and the agent judges (in FLAGS). | Claim with evidence by note_id (walkthrough uses a piece quote). |
| III.A.4 separate evidence from interpretation | Built. Claims keep evidence, interpretation, counterexamples, and qualifiers apart; findings show them. | Walkthrough: "findings come back as plain text with quotes and claims". |
| III.B.1 tally repeated choices | Built. Inclusion rule per pattern; revise keeps the old rule as a version. | Walkthrough: "revising a pattern keeps the old rule as a version". |
| III.B.2 calculate appearance rate | Built. Rate with the denominator named and its pieces listed; default is the latest of each chain. | test:lookback: "counts: ...". |
| III.B.3 rank recurring patterns | Built. Rank by rate; ties share a rank; close within 0.05 is flagged. | test:lookback: "counts: ... ties share a rank". |
| III.C.1 Track dropped wording | Built. GET /dropped: removed wording per parent and retry, with returns_in and echoes_in. | test:lookback: expect dropped_wording. |
| III.C.2 Track removed moves | Built. Evidence explicit, indirect, or absence; removed moves by shape. | test:lookback: expect removed_move. |
| III.C.3 Track rejected approaches | Built. Claims carry rejections, counted as recorded. | Walkthrough: claim line. |
| III.C.4 Flag drops that return | Built. returns_in and echoes_in on dropped items, with a note that return or echo is the agent's call. | test:lookback: expect dropped_wording (returns checked on the quoted words). |

## Verify

From `app/`:

```
npm install
npm run db:local
npm run typecheck
npm run test:lookback
npm run walkthrough
```

Expect test:lookback 29 of 29 and the walkthrough 184 of 184. The full-length timing check ran at about 0.84 s on the box against the 1 s cap; a slower machine may need a second look.

## Files

| Path | What it holds |
|---|---|
| `src/lookback/corpus.ts` | Notes, the corpus, the audit, `notesOn` / `notesBesidePieces`. |
| `src/lookback/recurring.ts`, `near.ts`, `shapes.ts` | Recurring wording, openings, transitions, shapes, with ids, quotes, and notes beside the pieces. |
| `src/lookback/dropped.ts` | Removed wording and moves, returns and echoes. |
| `src/lookback/patterns.ts` | Counts, rates, ranks, timelines (including the friction point), compare, `acrossStyles`. |
| `src/lookback/claims.ts` | Claim kinds and short definitions, `claimView`, `checkCited`, `thinClaimAsk`, findings text. |
| `src/lookback/store.ts` | Results in chunks under 256 KB. |
| `src/lookback/routes.ts` | Every slice 04 route and the session-end nudge. |
| `migrations/0007_lookbacks.sql` | Lookback tables. |
