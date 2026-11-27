# Changelog

## Unreleased
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
