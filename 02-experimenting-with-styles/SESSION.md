# Session: 1.2 Experimenting with styles

| Field | Value |
|---|---|
| slice | Experimenting with styles, Quilt slice 01-02 |
| matrix | `criteria.json`, Quilt session 1925caee, v1, 24 criteria |
| plan | `PLAN.md` (copied from `plans/02-experimenting-with-styles-plan.md`, which stays as signed) |
| builder | Grok Bot |
| decider | Emily |
| locating manager | CANDY |
| status | built, ready to locate. Part A and Part B on local branch `build-all`. Not pushed. |

## Decisions

| Date | Decider's words | Call |
|---|---|---|
| Nov 25, 2026 | "build it all at once ... line it up to intent, locating as you go" (pt223u) | CHANGE. Every slice goes on one local branch, `build-all`, in merge order, in place of `slice-02`. |
| Nov 25, 2026 | "Anything like that you can stub out ... flag it for us to look at together when I come back." (pt224u) | KEEP. Every judgment call below is in `FLAGS.md` under "Look at together". |

## Running record

All rows Nov 25, 2026. Code lives in `app/`.

| Row | What landed | Where |
|---|---|---|
| Module and migration | `src/styles/`, `0006_exercises.sql`. Plan change: `exercise_notes.extra` JSON column. | 5f7dbf3 |
| Shared helpers | json, readBody, now, str to `src/http.ts`; sessions to `src/sessions.ts`. 01's behavior unchanged (walkthrough). | 5f7dbf3 |
| Caps | exercises 20 a day, notes 200 a day, pins 20; checkRowCap on every write. | `src/caps.ts`, `src/rows.ts` |
| Catalog | 40 styles at draft-1. A flavor line cut Ukiyo-e's questions band; test:styles caught it, fixed by adding flavor only when there is room. | `src/styles/catalog.ts` |
| Shelf and history | GET /styles (now needs a key), GET /styles/history. | `src/styles/routes.ts` |
| Exercises, tries, map, notes, finish, usual, reach | As in the plan. The exercise pause replaces the stitch pause. | `src/styles/routes.ts`, `src/index.ts` |
| Checks | test:styles 9 of 9; walkthrough 93 of 93 at Part A. | `test/style-map.test.ts`, `scripts/walkthrough.mjs` |
| Part B | `0008_registers.sql`, REGISTERS v1, voice refs, the map beside the agent's voice, register_hold, registers in reach. Walkthrough 118 of 118. | 6512a2f, `src/styles/register-exercises.ts` |

Plan changes, each listed in FLAGS for Emily:
- `exercise_notes.extra` column.
- GET /styles needs a key.
- why_this_one and expectations stay optional, with an invite when missing.
- Notes still go in after finish.
- Register exercises store `register:<register>` in style_id.
- A register try's pause reuses the style_vs_speaker note kind.

## Builder try-outs (stand-ins)

These are builder evidence only. Each agent-side row needs a cold try-out by CANDY's locators, and a recheck when real outside agents use the workshop.

**Try-out 1 (`/workspace/vw-build/tryout02.mjs` on the box), Nov 25.** Three short plain tries, then history. The top far style was a Poe voicemail (5 measures apart). One exercise with a long formal opening that falls back to short lines.
- Worked: the map showed the middle and end thirds back in the usual's band, quoting the first sentence there.
- Snag: drift marks on a third with one or two sentences mark often. Listed in QUIRKS.

**Try-out 2 (`/workspace/vw-build/tryout/tryout-all.mjs`, output beside it), Nov 25, about 8:47 PM CST.** A human signed in (local-dev), agreed, and issued a key. The agent read GET /, then drew a prompt and wrote a try with a mark. It made a retry, two more tries, a style exercise, a lookback, and a register exercise, then ended the session.
- Worked:
  - The drift list read plainly.
  - The finish asked for two readers.
  - The register map showed the own line "I counted the seconds until someone would" carried over whole, and the register measure shifted to casual.
- Snags:
  - I sent `parent_id` on POST /tries in place of POST /tries/:id/retry. The workshop ignored it without a word, so the retry stood alone. Listed in 01's QUIRKS.
  - The drift reading lists all five measures in one long sentence when the style is far on all five.
