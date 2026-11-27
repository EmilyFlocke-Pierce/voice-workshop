Batch 04-A (Run 1 at 98264b0) CLOSED 4/4 at L3*
Unanimous L3* across all four skills on Run 1:
- I.A.1 (Gather experimental pieces): L3*; corpus.ts audit flags no_notes, identical, parent_outside, and misplaced/ambiguous notes, stays quiet on not_listed, and POST /lookbacks/:id/pull retrieves missing parents cleanly.
- I.A.2 (Gather layered pieces): L3*; ordered retry chains (standing in for layered pieces until Slice 03, stated in limits.layered), per-piece change_note, per-retry diffs, and gap/duplicate/note-placement surfacing.
- I.A.3 (Gather reflection notes): L3*; every note carries one id, landed-only counts as no notes, 3+-word quoted spans flag misplaced/ambiguous notes, POST /notes/:note_id moves placement cleanly, and carried_from_parent marks carried intent/scope_note.
- I.A.4 (Assemble review corpus): L3*; scoped P1..Pn corpus with limits stated upfront before review (capped, exercises, layered, your_limits_note), word-for-word citation checks, and 200-piece / 256 KB chunking verified.
Really strong first batch on Slice 04.
Non-blocking FLAGS & quirks notes for the log (none hold a level):
- FLAGS candidates: notes whose try falls outside scope are skipped silently in buildCorpus() rather than counted/flagged as unpaired; parent_outside checks one hop only, so an ancestor outside scope isn't flagged.
- Quirks: 04/MANIFEST.md still says "walkthrough 118 of 118" (stale vs. 164 of 164); misplaced/ambiguous audit inspects free_text only and requires 3+-word double-quoted spans; mark note text adds field prefixes ("why back:", "less familiar:").
Please save 04-A-run1.md when you push next.
