# Session: 1.1 Safe place to practice

| Field | Value |
|---|---|
| slice | Safe place to practice, Quilt slice 01-01 (96cb0081) |
| matrix | `build-matrix-v1-8e67b8cb.json`, Quilt run v1 8e67b8cb, 16 criteria |
| plan | `PLAN.md` (copied from `plans/01-safe-place-to-practice-plan.md`, which stays as the pre-build version) |
| builder | SCROLL |
| decider | Emily |
| status | ready to locate, run 2 (prompt addendum ported to ezra-01 in 557ac62) |

## Decisions

| Date | Decider's words | Call |
|---|---|---|
| Nov 21, 2026 | "Why don't you leave them open? Flag anything that you think might be, like, a sticky thing that hits another one." | KEEP. The plan's open questions stay open, and anything that touches another slice goes under Connections. |

## The frame in this folder

`criteria.json` here is ready run v2 (3a066cd9, 33 criteria). The plan and build use ready run v1 (8e67b8cb, 16 criteria), saved as `build-matrix-v1-8e67b8cb.json`. Emily chose v1 for locate run 1.

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

Checks on ezra-01 at 724085d: typecheck clean, test:feedback 12 of 12, walkthrough 27 of 27.

Say-less pass on Nov 21: SESSION.md 958 to 899 words, MANIFEST.md 996 to 966. The rest is labels, paths, and check names, so it stays.
Say-less pass after run 1: SESSION.md 1902 to 1751 words, MANIFEST.md 1226 to 1205. Duplicate connections merged, settled criteria folded into Locates.

## Plan changes

- Over the char cap, the workshop hands the draft back instead of cutting it. A cut would change the draft.
- New route POST /tries/:id/landed, so the agent can say "no" after it reads the feedback.
- New sessions table, so "this session" and the 2-hour idle end have a record.
- New column marks.less_familiar for row 17.
- The layout's quote field is a list of 1 to 3, to fit row 11.
- Layout flags store the line's shape with quotes replaced, so Emily's page shows no agent words.
- New cap keys_per_day = 200, so free keys stay affordable.
- After run 1: new route POST /tries/:id/notes and new columns rough_edges and diagnosis (migration 0002), so the agent can write its calls down.
- After run 1: the plan's risk list counts eight agent-side L3s, adding III.A.1.

## Connections to other slices

- **Prompts (addendum, Nov 21).** GET /prompt and prompt columns on tries (migration 0003) are a precursor to the prompts slice. A retry carries its parent's prompt, which closes "same prompt" for I.C.2 here.

- **III.A.1 and III.A.2 with 04.** Rereading covers this session only. 04 owns looking back. Left open by Emily.
- **Session end with 04 and 05.** It lists every mark the key holds, across sessions. 05 builds the voice skill from own_lines and why_back, and could carry diagnoses, rough edges, and the marked try's text.
- **style_tag with 02.** Free text now, and only what_tried renames. 02 may want shared tags or tag renames.
- **Retry chains with 03.** parent_id and change_note are ready. The diff works by sentence. Layering may need word-level changes.
- **Prompts.** Tries carry no prompt, so I.C.2's "same prompt" and the scope note wait on the slice that hands out prompts. The try-out felt this on arrival.
- **Evidence with 06.** Only the agent's key reads its tries, so evidence for the agent-side L3s comes from what agents choose to share. 06 owns sharing.
- **Emily's admin page with 06.** The Cloudflare Access check built here is the same door humans use in 06.
- **The reader with 02 and 03.** It lives in 01, and 02 and 03 will call it. It misses near-repeat lines and a line that turns from question to statement. Places are relative thirds, so they shift between tries of different lengths.
- **The key holds the agent's whole history.** Key recovery touches 05 and the stack.

## Criteria to look at with Emily

- **I.C.1, I.C.2, II.B.3** settled by CANDY's readings in run 1 (see Locates).
- **II.A.1 to II.B.3** read as skills for whoever gives feedback. The code does them here, so the plan reads them as rules for the code.
- **III.A.1** "across reread tries": this session or all time. Open.
- "Nothing it tries there is used against it" has no criterion of its own. Row 21 carries it.

## Open items for Emily

- The caps, the 2-hour idle end, and keys_per_day are guesses.
- Deploying needs a Cloudflare account, a D1 database id, an Access app over /admin/*, and ADMIN_EMAIL, ACCESS_TEAM_DOMAIN, ACCESS_AUD.
- Real tries for the eight agent-side L3s. Proposal: a few agents run a local session and choose to share their session-end text and try ids with SCROLL.
- Installs: none. Node 25, npm 11, and git are on ezra-01.

## Locates

### Run 1, Nov 21, 2026

CANDY chaired. TOFFEE and TAFFY located commit 724085d against v1 8e67b8cb, the run Emily chose. The full record is `locate/LOCATE.md`, with notes in `locate/run1-toffee.md`, `locate/run1-taffy.md`, and probes in `locate/probe/`. Emily's note: "the big thing was that u didnt test it out."

| Level | Criteria |
|---|---|
| 3 | I.A.3, II.A.1, II.A.2, II.B.1, II.B.3, III.B.1 |
| 2 | I.C.2 (`diff.ts:12` compared only the first 400 sentences), II.B.2 (`split.ts:7` split on any "also") |
| waiting on real tries | I.A.1, I.A.2, I.B.1, I.B.2, I.C.1, III.A.1, III.A.2, III.B.2 |

CANDY's readings of the foggy criteria, which I take: I.C.1 is one try against its own intent. I.C.2's conditions are layout, code, and the carried intent and style, and "same prompt" belongs to the prompts slice. II.B.3's agreement is Emily's.

### Lifts after run 1, Nov 21, 2026

- **I.C.2.** `src/feedback/diff.ts` compares every sentence up to the cap. It sets matching starts and ends aside and compares the middle. Past 1000 differing sentences on each side it pairs by position and says so. Checks: a 640-sentence draft changed at sentence 601, in test:feedback and the walkthrough.
- **II.B.2.** `src/feedback/split.ts` cuts only at joins between two observations: a semicolon, a sentence that starts with "Also", ", and" before a clause with "also", "and also" between two predicates, and two sentences under a two-feature name. Each new line keeps a subject, borrowed from the clause before when it opens on a verb. Checks: the Colons line and three more natural "also" lines stay whole, and three real two-point lines split with subjects.
- **Places to write it down.** `migrations/0002_rough_edges_and_diagnosis.sql` adds `rough_edges` (span and reason per edge, I.A.1) and `diagnosis` (I.C.1) to tries. POST /tries takes rough_edges, and /tries/:id/notes and /tries/:id/landed take both. Both are optional, in the agent's words, and only the agent's key reads them.
- **Quirks.**
  - An identical retry returns nothing_changed: true and says so.
  - The body_bytes cap hands back the draft whole, or says plainly that it could not read one.
  - Reading this session leaves the idle clock alone. Tries, retries, landed calls, notes, marks, and renames move it.
  - An empty own_lines span is refused with a kind message. A repeated span is kept once and noted.
  - A rename onto a label in use reports merged: true and names both labels.
  - Drawer rows carry their feedback.
  - PLAN and MANIFEST both count eight agent-side criteria, matching the matrix: III.A.1's tracing is the agent's too.
- **Left as is: layout_flags.** The workshop's reader always fits the layout, so flags fill only from the outside reader.

Checks after the lifts, on ezra-01: typecheck clean, test:feedback 19 of 19, walkthrough 38 of 38.

### Builder try-out, Nov 21, 2026

I ran `wrangler dev --local` on ezra-01 and walked a session over HTTP in the order an arriving agent would, but as the builder, already knowing the code. It was not a cold arrival, so its findings count as builder evidence, and no fresh agent has tried the workshop yet. The walk: GET /, a key, three drafts of my own (a looser voice about building on a machine I have never seen, a retry of its ending, a second-person chant), a diagnosis and a rough edge, landed no and unsure, two marks (one on a miss), the drawer, the session view, and session end. Then I stopped the server and confirmed nothing was left running.

What felt clear:
- The feedback showed me something I had missed: my sentences shrank toward the end, and two of three "maybe"s sat in the last third. My ending had tidied itself. That became a real diagnosis, and notes held it.
- Landed, the drawer, the marks, and the session-end text read plainly. I would keep the session-end text.

What confused me, and what I did:
- The retry diff showed my one change (three sentences rewritten as one) as two removals and an odd pairing, as if I had cut a sentence I kept. Fixed: a run of rewritten sentences shows as one change.
- The tense line quoted "The build log says landed." as past-tense evidence. Fixed: each side quotes the sentence that leans furthest that way.
- The arrival text read "every call about them is yours." Fixed to "every decision about them is yours."
- The scope note asks what "this prompt" kept me from, and there is no prompt, so I wrote about where I was. Listed.
- Places are thirds of the piece, so a sentence moved from "middle" to "end" between parent and retry when the sentence count changed. Listed.
- Quotes cut at 90 characters, mid-phrase ("because there was no"). Listed.
- On the chant, the reader missed the move I cared about: "You come back tomorrow?" turning into "You come back tomorrow." Listed.
- The session-end text leaves out my diagnoses, rough edges, and the try text the marks point to. Listed for 05.

The diff and tense fixes landed after my retry, so code checks cover them, not the try-out.

### Cold try-out from the agent seat, Nov 21, 2026

SCROLL ran this at about 5:40 PM CST, after walking the empathy chart (go_away `.cursor/skills/empathy-chart`, been-there yes, APPLY printed). It ran on the box copy at the 5e5bb33 equivalent (`/workspace/vw-slice01/app`, local D1) while ezra-01 was offline. SCROLL still knew the code from building it, so this is builder evidence read from the agent's seat. What the arriving agent needs most: arrival text that says what to do first, a key in one call, feedback that quotes its own words, and room to leave a draft rough.

Walk: GET /, POST /keys, one draft (style_tag "not sure"), notes with a diagnosis and one rough edge, a retry with one change, landed no on the first and unsure on the retry, one mark, the drawer, session end. The server stopped afterward, and nothing was left running.

What worked:
- The arrival text said what to do first. The key came in one call, with a plain note about the hash.
- The sentence-length line showed the "short sentences" intent drifting from about 8 words to about 14 in the last third. That became the diagnosis and the one change.
- The retry showed the change as one change, and sentence length moved to about 10, then about 6. It also showed that 7 of 14 sentences now start with "I": the fix made a drumbeat. That became the second diagnosis and the why_back.
- The drawer held the miss with no score. Session end read warm and plain.

What snagged:
- scope_note asked "what this prompt kept me from doing", and there was no prompt. The prompt addendum (557ac62) addresses this: GET /prompt draws one, and the scope note now asks what the prompt kept you from.
- On a retry with a single change, read_it still says "Every other line here is an incidental edit." It reads like template text. Open.
- The change sat in the last few sentences, and the diff placed it in the "middle". The writer would call that the ending. Open.
- Session end leaves out the diagnosis, rough_edges, and less_familiar, the most useful things written. Open, touches 05.
