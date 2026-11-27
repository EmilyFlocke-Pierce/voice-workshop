# Manifest: 2.1 Looking back for patterns

Matrix: `criteria.json` (Quilt session 1925caee, v1). L3 is the target. Plan: `PLAN.md` (column 3 filled). Branch `build-all`, commit 2ab3810.

**Locate status:** batch 04-A (I.A.1 to I.A.4) is closed at 4/4 L3* after run 1 (`locate/04-A-run1.md`). The other rows wait for locating. Locating belongs to CANDY. Agent-side rows rest only on the builder stand-in try-out (`02-experimenting-with-styles/tryouts/tryout-all.mjs`, see SESSION) and need a cold try-out and a recheck with real outside agents.

Paths are under `app/`. "Walkthrough" names a line in `npm run walkthrough`; "test:lookback" a test in `npm run test:lookback`, with fixtures in `test/lookback-corpus.json`.

## Criteria

| Criterion (Quilt number and label, verbatim) | Evidence | How to check it |
|---|---|---|
| I.A.1 Gather experimental pieces | Built. Located at L3* in run 1 of batch 04-A (unanimous, `locate/04-A-run1.md`). POST /lookbacks labels every try in scope P1 to Pn with its notes; GET /audit lists no-notes pieces, identical texts, and parents outside scope; POST /limits keeps the agent's limits note. Agent side, builder stand-in. | Walkthrough: "POST /lookbacks lays the pieces side by side ...", "the audit lists what it found ...". test:lookback: expect no_notes, identical, parent_outside. |
| I.A.2 Gather layered pieces | Built. Located at L3* in run 1 of batch 04-A (unanimous, `locate/04-A-run1.md`). Retry chains stand in for layered pieces until 03: chains in order, parent labels, pull a missing parent in with the next label. | Walkthrough: "a retry shows its parent's label and its chain". test:lookback: expect pull_next_label. |
| I.A.3 Gather reflection notes | Built. Located at L3* in run 1 of batch 04-A (unanimous, `locate/04-A-run1.md`). One id per note; audit flags misplaced and ambiguous notes; the agent places a note with POST /notes/:note_id. 🦋 in FLAGS: carried intent and scope_note sit on two versions. | test:lookback: expect misplaced, not_listed; "every note has one id, ... placements move a note". |
| I.A.4 Assemble review corpus | Built. Located at L3* in run 1 of batch 04-A (unanimous, `locate/04-A-run1.md`). Scope by all, dates, sessions, or kinds; the limits block says what is left out (cap, slice 02 tables, layered pieces). | Walkthrough: lookback lines. test:lookback: timing checks. |
| I.B.1 Compare across pieces | Built. GET /compare?measure= gives one number per piece in order, with style and session. | Walkthrough: "compare shows one measure per piece". |
| I.B.2 Track repeated choices | Built. Pattern view timeline: first appearance, gaps, returns. | test:lookback: "counts: ..." (first appearance t12, return t15). |
| I.C.1 Name recurring choices | Built. Recurring wording exact and near; patterns take several wordings under one move. | test:lookback: expect near. |
| II.A.1 cross-reference intent notes | Built. Pattern view lines up intent notes against where the pattern appears, grouped by style. | Walkthrough: pattern lines. |
| II.A.2 find the friction point where a repeat began | Built. Timeline first appearance with the piece's style and notes beside it. | test:lookback: "counts: ...". |
| II.B.1 identify baseline phrases | Built. Recurring wording, 3 to 6 words, exact and near. | Walkthrough: "recurring and dropped answer with candidates, not verdicts". |
| II.B.2 flag generic transitions | Built. Recurring openings and transitions, notes beside them. | Same. |
| II.B.3 isolate systemic redundancies | Built. Recurring wording across pieces with the notes beside each piece. | Same. |
| II.B.4 detect structural autopilot | Built. Per-piece shapes (list of three and others) in recurring. | test:lookback: expect removed_move. |
| II.C.1 Explain the repeat's function | Built. Claims carry function, evidence, and counterexamples; dropped shows returns. | Walkthrough: "a default claim with no notes weighed or counterexamples gets asked for them". |
| II.C.2 Assess future choice intent | Built. Claims carry future_intent and qualifiers; pause asks what would make the agent less sure. | Same. |
| II.C.3 Distinguish taste from default | Built. Claim kinds taste, default, mixture, unclear; rejections recorded; a default claim is asked for notes weighed and counterexamples. | Same. |
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

Expect test:lookback 16 of 16 and the walkthrough 171 of 171. The full-length timing check ran at about 0.84 s on the box against the 1 s cap; a slower machine may need a second look.

## Files

| Path | What it holds |
|---|---|
| `src/lookback/corpus.ts` | Notes, the corpus, the audit. |
| `src/lookback/recurring.ts`, `near.ts`, `shapes.ts` | Recurring wording, openings, transitions, shapes. |
| `src/lookback/dropped.ts` | Removed wording and moves, returns and echoes. |
| `src/lookback/patterns.ts` | Counts, rates, ranks, timelines, compare. |
| `src/lookback/store.ts` | Results in chunks under 256 KB. |
| `src/lookback/routes.ts` | Every slice 04 route and the session-end nudge. |
| `migrations/0007_lookbacks.sql` | Lookback tables. |
