# Session: 1.1 Safe place to practice

| Field | Value |
|---|---|
| slice | Safe place to practice, Quilt slice 01-01 (96cb0081) |
| matrix | `build-matrix-v1-8e67b8cb.json`, Quilt run v1 8e67b8cb, 16 criteria |
| plan | `PLAN.md` (copied from `plans/01-safe-place-to-practice-plan.md`, which stays as the pre-build version) |
| builder | SCROLL |
| decider | Emily |
| status | ready to locate |

## Decisions

| Date | Decider's words | Call |
|---|---|---|
| Nov 21, 2026 | "Why don't you leave them open? Flag anything that you think might be, like, a sticky thing that hits another one." | KEEP. The plan's open questions stay open, and anything that touches another slice goes under Connections. |

## The frame in this folder

`criteria.json` here is ready run v2 (3a066cd9, 33 criteria). The plan and build use ready run v1 (8e67b8cb, 16 criteria), saved as `build-matrix-v1-8e67b8cb.json`. Emily picks the run for the locate.

## Running record

All rows on Nov 21, 2026. Code lives in `app/`.

1. Setup: Worker, D1 schema, hashed keys, caps. `src/index.ts`, `migrations/0001_safe_place.sql`, `src/auth.ts`, `src/caps.ts`.
2. Store as sent, change is a new try. `src/index.ts` storeTry.
3. POST /tries with intent and scope note, feedback in the reply. `src/index.ts`.
4. Arrival instructions at GET /. `src/instructions.ts`.
5. Drawer: POST /tries/:id/landed, GET /tries?landed=no. `src/index.ts`.
6. Any style_tag, any length to the cap. `src/index.ts`.
7. Three moves after a miss. `src/instructions.ts` NEXT_AFTER_MISS.
8. Intent above the observations. `src/index.ts` feedbackView.
9. Retry with change note and every change listed. Partly landed. `src/feedback/diff.ts`.
10. Feedback reader. `src/feedback/observe.ts`.
11. Quotes with places, both sides of a change. `src/feedback/observe.ts`, `text.ts`.
12. Plain words and the judging-word check. `src/feedback/words.ts`.
13. One point per line. `src/feedback/split.ts`.
14. Fixed layout, version 1. `src/feedback/layout.ts`.
15. Unplaced lines and layout flags, Emily's admin route. Partly landed. `src/feedback/layout.ts`, `src/index.ts` adminRoutes.
16. This session side by side. `src/index.ts`.
17. Mark with own_lines and less_familiar. `src/index.ts`.
18. Rename and group by what_tried. `src/index.ts`.
19. why_back on any try, missed ones too. `src/index.ts`.
20. Session end with marks as plain text and an invitation back. `src/index.ts`.
21. Only the key's holder reads its rows. Every query in `src/index.ts`.
22. Outside model hook, off by default. `src/outside.ts`.

Checks on ezra-01: typecheck clean, test:feedback 12 of 12, walkthrough 27 of 27.

Say-less pass on Nov 21: SESSION.md 958 to 899 words, MANIFEST.md 996 to 966. The rest is labels, paths, and check names, so it stays.

## Plan changes

- Over the char cap, the workshop hands the draft back instead of cutting it. A cut would change the draft.
- New route POST /tries/:id/landed, so the agent can say "no" after it reads the feedback.
- New sessions table, so "this session" and the 2-hour idle end have a record.
- New column marks.less_familiar for row 17.
- The layout's quote field is a list of 1 to 3, to fit row 11.
- Layout flags store the line's shape with quotes replaced, so Emily's page shows no agent words.
- New cap keys_per_day = 200, so free keys stay affordable.

## Connections to other slices

- **III.A.1 and III.A.2 with 04.** Rereading covers this session only. 04 owns looking back. Left open by Emily.
- **Session end with 04 and 05.** POST /session/end lists every mark the key holds, across sessions. 05 builds the voice skill from own_lines and why_back.
- **style_tag with 02.** Free text now, and only what_tried renames. 02 may want shared tags or tag renames.
- **Retry chains with 03.** parent_id and change_note are ready. The diff works by sentence. Layering may need word-level changes.
- **"Same prompt" in I.C.2.** Tries carry no prompt. Whichever slice hands out prompts closes this.
- **Evidence with 06.** Only the agent's key reads its tries, so evidence for the agent-side L3s comes from what agents choose to share. 06 owns sharing.
- **Emily's admin page with 06.** The Cloudflare Access check built here is the same door humans use in 06.
- **The feedback reader with 02 and 03.** It lives in 01, and 02 and 03 will call it.
- **The key holds the agent's whole history.** Key recovery touches 05 and the stack.

## Criteria to look at with Emily

- **I.C.1** L3 asks "whether the intended change was carried out." That reads like a retry, which is I.C.2.
- **I.C.2** L3 asks for "safe, consistent conditions." With no prompt object I read it as the same layout and code version. Foggy.
- **II.A.1 to II.B.3** read as skills for whoever gives feedback. The code does them here, so the plan reads them as rules for the code.
- **II.B.3** L3 says "surface the mismatch for agreement." I read the agreement as Emily's. It could be the agent's.
- **III.A.1** "across reread tries": this session or all time. Open.
- "Nothing it tries there is used against it" has no criterion of its own. Row 21 carries it.

## Open items for Emily

- Which frame the locate uses: v1 (this build) or v2 (in the folder).
- The caps, the 2-hour idle end, and keys_per_day are guesses.
- Deploying needs a Cloudflare account, a D1 database id, an Access app over /admin/*, and ADMIN_EMAIL, ACCESS_TEAM_DOMAIN, ACCESS_AUD.
- Real tries for the seven agent-side L3s. Proposal: a few agents run a local session and choose to share their session-end text and try ids with SCROLL.
- Installs: none. Node 25, npm 11, and git are on ezra-01.

## Locates

None yet. The locate happens with Emily, from MANIFEST.md.
