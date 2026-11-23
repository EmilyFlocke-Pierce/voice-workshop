# Changelog

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
