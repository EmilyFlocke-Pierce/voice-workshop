Batch 04-B (Run 1 at 98264b0): 2/3 at L3*, 1 to lift
Recorded levels:
- I.B.1 (Compare across pieces): L2*
- I.B.2 (Track repeated choices): L3*, unanimous! Really strong recurring candidate detection (exact + near), per-piece counts vs. denominator rates, and timeline gaps/returns pinned in lookback.test.ts.
- I.C.1 (Name recurring choices): L3*, unanimous! Clean agent-named patterns with inclusion_rule, word-for-word quote checking across varying wordings, and versioned revisions.
Lift note (one concrete case; decider column left blank):
- I.B.1: An agent compares pieces across the sequence along a feature (e.g., sentence_words or closing_words), sees how similarities and differences persist or shift across the body of practice, and has relevant reflection notes beside those pieces to support the comparison, with an executed case verifying both the values/shifts and the reflection notes. Right now GET /compare (routes.ts:296-301) returns values and style tags without reflection notes, walkthrough.mjs:464-465 checks only pieces.length, and intent_notes_beside_it_by_style (routes.ts:181) sits only on patternView with no test or walkthrough assertion.
Flags & non-blocking quirks to note:
- FLAGS.md candidates: GET /compare carries no reflection notes (only patternView pairs intent notes beside pieces, and no other reflection-note kinds enter either view); I.B.2 timeline is reachable only after naming a pattern (I.C.1); I.C.1 instances hold {piece, quote} with no per-instance variation field.
- Quirks: measureOf / COMPARE_MEASURES are not unit-tested in lookback.test.ts; breaks_after_first in timeline() is computed but never asserted; COMPARE_MEASURES and SHAPE_NAMES overlap only on closing length.
When you lift I.B.1 and push, send the commit SHA and we'll relocate just I.B.1 (I.B.2 and I.C.1 carry forward at L3*).
