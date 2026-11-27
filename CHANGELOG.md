# Changelog

## Unreleased
- Lifted 02 II.B.2, II.C.1, II.C.2, and II.C.3 after locate batch 02-D (run 1; II.B.1 at L3*). `style_vs_speaker` now requires quotes and is invited on the style-exercise finish pause, the exercise reply, and the arrival text. `slowdowns` and `slips_back` are invited on the first-try pause and the style map; the slips_back invite states the split from the drift note. `what_it_was_like` is invited at the finish. Walkthrough 164 of 164.
- Saved locate batch 02-D run 1 at `02-experimenting-with-styles/locate/02-D-run1.md`. CANDY kept I.B.2 at L3* after a spot-check of ece898c, with no relocation round. Logged two finds in FLAGS.md and closed two quirks in 02's QUIRKS.md.
- Rewrote every 🦋 in FLAGS.md as a take (what the locators found, how I read the row, what the build does, and why). Criteria stay as written. A recut through a builder note happens only if a row is really bad, and only with Emily's co-sign. VERSIONING.md and LOCATE.md match that.
- Lifted 02 I.B.2: drift marks a third that leaves the style's targets in any direction, and names which measures sit back in the usual and which sit elsewhere. Back to the usual is still one case. Band edges are unchanged. Walkthrough 153 of 153.
- Saved locate batch 02-B run 2 at `02-experimenting-with-styles/locate/02-B-run2.md`. Batch 02-B is closed at 3/3 L3*. Domain I of slice 02 is 9/9 at L3*.
- Saved locate batch 02-C run 2 at `02-experimenting-with-styles/locate/02-C-run2.md`. Batch 02-C is closed at 4/4 L3*. Three quirks from that run are in 02's QUIRKS.md; the walkthrough label now matches the check it names.
- Lifted 02 II.A.1, II.A.2, and II.A.4 after locate batch 02-C (run 1, L2*; II.A.3 at L3*). Effects quotes are required. A retry's pause and the style map carry `effects`: the features noted, the ones not yet noted, and one line per feature on what to diagnose, beside the pause's one question. The map says the clause count reads no nesting. The walkthrough posts tone, syntax, and diction notes with exact quotes. Walkthrough 151 of 151.
- Saved locate batch 02-C run 1 at `02-experimenting-with-styles/locate/02-C-run1.md`. Logged two finds in FLAGS.md and one new and two closed quirks in 02's QUIRKS.md. No matrix changed.
- Lifted 02 I.C.1 to I.C.3 after locate batch 02-B (run 1, all at L2*). `unusual` and `hard_passage` take an optional `shift`, and `unusual` requires quotes. The exercise reply (`for_you`), the first-try pause, the style map, and the arrival text invite them. A retry's map reads each earlier hard passage's third beside the style's targets. History adds `far_in_rarely_written_kinds`. Walkthrough 142 of 142.
- Saved locate batch 02-B run 1 at `02-experimenting-with-styles/locate/02-B-run1.md`. Logged the I.C.2 and I.C.3 find in FLAGS.md and closed two quirks in 02's QUIRKS.md. No matrix changed.
- Lifted 02 I.B.1 after locate run 1: the `calibration` note now names one feature, and the pause, the style map, the exercise reply, and the arrival text invite it. A retry's style map lists earlier calibrations. Walkthrough 125 of 125.
- Saved locate run 1 (batch 02-A) at `02-experimenting-with-styles/locate/02-A-run1.md`. LOCATE.md names the folder for later batches.
- Logged the run's finds in FLAGS.md and three quirks in 02's QUIRKS.md. No matrix changed.
- Fixed citations to the try-out scripts so they point at their repo paths.
- Located batch 02-A run 2: I.B.1 moved to L3*, and the batch is closed at 6/6 L3*. Report at `02-experimenting-with-styles/locate/02-A-run2.md`. Logged TOFFEE's calibration quirk (`did` and quotes optional).

## v0.1.0
- First app version, set in app/package.json. Covers slice 01 with the sign-in stub, slice 02, slice 04, and slice 02 Part B.
- Added VERSIONING.md with the branch, release, and matrix versioning rules.
- Added .env* to .gitignore.
- Added LOCATE.md, a starting index for locators, with raw links to each built slice.
- Made the repo public. The license is to be decided.

## Nov 25, 2026
- Built everything in one pass on the local branch `build-all`, in merge order: the sign-in STUB, slice 02 Part A, slice 04, then slice 02 Part B. Not pushed.
- Each slice has PLAN (column 3 filled), SESSION, MANIFEST, and QUIRKS. FLAGS.md at the root lists the real finds and everything to look at together.
- Checks: walkthrough 118 of 118, closed-keys 2 of 2, test:styles 9 of 9, test:lookback 16 of 16, test:terms 6 of 6, plus 01's checks.

## Nov 22, 2026
- Step 0: moved the slice 01 Worker from `01-safe-place-to-practice/app` to `app/` at the repo root. Updated the Verify path in slice 01's MANIFEST; the locate probe import note is in SESSION. Local only.

## Nov 21, 2026
- Pulled the latest criterion framework and criteria from Quilt (JSON plus a packet-style markdown render) into each slice folder, plus uploaded slice reports and the project report at the root. Source routes and versions are in quilt-source.json. For Safe place and Experimenting, the latest run is still proposing, so the last ready packet is saved beside it.
- Created the repo with one folder per slice, named in the style of Pong's belly-tape.
- Added this changelog, the root README, and a README in each slice folder.
- Slices 01 and 02 now hold their last ready versions (01 ready v2, 02 ready v1) as framework and criteria. Unfinished proposing versions moved to not-finished/ in each. Frames in this folder do not change.
- Rewrote each slice README with its intent from the slice report (WHAT, DOES, FOR, WHY) and an Open questions list. Section and Quilt slice id lines kept. No frames changed.
- Removed the framework.md and criteria.md renders at Emily's ask. The JSON frames are the source.
- Built slice 01 (Safe place to practice) from ready run v1 8e67b8cb: app in 01-safe-place-to-practice/app, with PLAN.md (build log in the third column), SESSION.md, and MANIFEST.md. Local only, status ready to locate.
- Slice 01 lifts after locate run 1: full-length retry diff (I.C.2), a split that keeps each line's subject (II.B.2), places for rough-edge reasons and a diagnosis, quirk fixes, and a builder try-out. Local only, status ready to locate, run 2.
