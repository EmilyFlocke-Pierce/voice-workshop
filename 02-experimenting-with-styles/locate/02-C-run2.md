Batch 02-C (Run 2 relocate at 76b0c66) CLOSED 4/4 at L3*
All three lifted skills moved unanimously to L3* (II.A.3 carries forward from Run 1 at L3*):
- II.A.1 (detect tone changes): L3*; quotes required on effects notes; purposeful turn and unsupported wobble both executed and anchored to exact quotes in walkthrough.mjs.
- II.A.2 (track syntax shifts): L3*; carrying and breaking sentence patterns both quoted and diagnosed, and what_it_counts now states the clause count reads commas/joining words with no reading of nesting.
- II.A.3 (measure pacing): L3*; carried forward from Run 1.
- II.A.4 (note diction shifts): L3*; multi-quote effects note sets recurring sustaining words against weakening plain diction.
Great lift on requiring quotes, surfacing per-feature diagnostic prompts in effectsSoFar(), and making the clause proxy explicit.
No new FLAGS.md matrix gaps. Three small non-blocking quirks:
1. effectsSoFar attaches only on the retry pause (first-try agents reach the four asks via GET /tries/:id/style-map or arrival text).
2. effectsSoFar.noted counts across the whole exercise rather than per try, so not_yet can read empty on a retry with no note of its own.
3. In app/scripts/walkthrough.mjs, the check labeled "the retry's map lists the features with an effects note and the one not yet noted" asserts not_yet.length === 0.
