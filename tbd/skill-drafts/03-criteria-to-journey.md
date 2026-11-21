---
name: criteria-to-journey
description: Use after a project's slices are ready and their criteria are locked, to turn those criteria into one working user-journey JSON that walks through what actually happens, before any stack or build plan.
---

# Criteria to journey (draft)

## WHAT
A single `user-journey.json` at the root of the project folder.

## WHY
Criteria say what each skill must be, one slice at a time. A journey puts the slices in order so builder and decider can see the whole experience and catch gaps or contradictions before choosing a stack. It is a working design. It is not a criteria revision, a stack, or a build plan.

## Steps
1. Read every ready slice's `framework` and `criteria`. Use Level 3 as the working bar for what must happen.
2. Walk the experience in order with the decider. Typical sections:
   - `entry` — how each party arrives (paths, and where they converge)
   - `arrival` / `before_*` — what must pass before the main loop
   - `tutorial` or onboarding (if any)
   - `play` / main loop — each action and its consequence
   - `disconnect` — drop and rejoin
   - `endings` — every way it finishes
   - a view for each other party (for example `human_view`)
3. Keep a `settled` object: short, plain rules the decider has agreed to.
4. Keep an `open` list. If the criteria or the decider haven't said, it's open. Never invent auth, endpoints, numbers, schemas, legal text, or scripts to fill a gap.
5. Add `source_status.alignment_needed` wherever the journey deliberately differs from locked criteria. Don't silently rewrite the criteria. Record the difference and let the decider choose whether to rerun the slice.
6. Add `method` and `note` fields that say what this file is and what comes next (the stack table).
7. Add `status` and `updated` (a date and time with a zone label). Have the decider read it. Save when they say it sounds right.

## Don'ts
- Don't name languages, hosts, or files here. That belongs in the stack table.
- Don't turn draft creative copy into settled copy. Mark it as a draft.
- Keep it to one file. Don't make a journey per slice.

*Example: belly-tape's `user-journey.json` has `settled`, `open`, `entry` (agent-first or human-first), `arrival`, `tutorial`, `play`, `disconnect`, `endings`, `human_view`, and `source_status.alignment_needed`. That last field records the places where the journey changed the original win and loss rules.*
