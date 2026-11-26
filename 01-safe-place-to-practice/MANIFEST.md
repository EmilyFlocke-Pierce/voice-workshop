# Manifest: 1.1 Safe place to practice

Matrix: Quilt run v1 8e67b8cb. L3 is the target. Updated Nov 22, 2026, after locate run 6 (`locate/LOCATE.md`) and the promise change (SESSION, Nov 22).

**Locate status:** all 16 at 3 after run 6. III.A.1 moved to 3 on the stitch lift (db46df2). The eight agent-side rows rest on stand-in tries by Emily's ruling (three cold try-outs, `locate/tryout-cold.md`, `tryout-cold-2.md`, and `tryout-cold-3.md`) and carry a recheck note for when real outside agents use the workshop. L4 candidates named by TAFFY: I.C.1 and III.B.2.

**Build-all pass, Nov 25:** the sign-in STUB (2c3afd5) changed the arrival text's "Get a key" lines. The six rows I.A.1, I.A.2, I.B.1, I.B.2, I.C.1, and III.B.2 held in a builder stand-in try-out (`tryouts/tryout-01-standin.out`, SESSION). CANDY relocates them with a cold agent. Walkthrough now 118 of 118 with 02 and 04.

**Open quirks and ideas:** `QUIRKS.md`, each with a next move.

Paths are under `app/`. "Walkthrough" names a line in `npm run walkthrough`, "Feedback check" a test in `npm run test:feedback`, and "Split check" a test in `npm run test:split`.

## Criteria

| Criterion (Quilt number and label, verbatim) | Evidence | How to check it |
|---|---|---|
| I.A.1 leaving a draft unpolished | Agent side, at 3 (run 4, chair). Tries stored as sent (`src/index.ts` storeTry). Arrival text says keep rough parts rough, finish when it helps, and name what polishing would close off (`src/instructions.ts`). rough_edges holds a span and a reason for each edge kept rough, on POST /tries, /notes, or /landed. Cold try-out: an edge re-marked rough on the retry, and a passage finished because it served. | Walkthrough: "the try is stored exactly as sent", "a diagnosis and per-edge reasons are written down on the try", "a rough edge span must be an exact piece of the try". |
| I.A.2 drafting without holding back | Agent side, at 3 (run 4). POST /tries takes the whole draft, intent, scope_note, and a prompt, and replies with feedback at once. | Walkthrough: "POST /tries stores the draft and returns feedback right away", "intent and scope note sit above the observations". |
| I.A.3 keeping drafts that fail | At 3 (run 1). POST /tries/:id/landed and GET /tries?landed=no (the drawer), by date, filtered by style_tag, with no score or rank. Drawer rows carry feedback and marks. | Walkthrough: "the drawer lists misses by date", "the drawer filters by style_tag", "the drawer carries no rank or score", "the drawer carries each try's marks", "after the session ends, the same key brings the drawer back". |
| I.B.1 trying a voice it is unsure of | Agent side, at 3 (run 4). style_tag takes any word, "not sure" included. Any length up to 8000 characters. | Walkthrough: the first try uses style_tag "not sure". |
| I.B.2 keeping going after a try that misses | Agent side, at 3 (run 4). After landed = no the reply lists try again, try smaller, stop and come back later (`src/instructions.ts` NEXT_AFTER_MISS). | Walkthrough: "landed = no offers try again, try smaller, or stop and come back". |
| I.C.1 comparing what came out with what it meant to try | Agent side, at 3 (run 4), L4 candidate. The reply puts your_intent above the observations (`src/index.ts` feedbackView). diagnosis holds the agent's comparison, on /notes or /landed. | Walkthrough: "intent and scope note sit above the observations", "a diagnosis and per-edge reasons are written down on the try", "another key can neither read nor write this try's notes". |
| I.C.2 trying again with one change | At 3 (run 2). POST /tries/:id/retry: parent_id, change_note, carried intent, style, and prompt, same layout and code version. `src/feedback/diff.ts` compares every sentence up to the cap and lists every change. A run of rewritten sentences is one change. An identical retry says nothing changed. A retry that names a new prompt is pointed to a new try. | Walkthrough: "a retry links to its parent", "the retry lists every change found, beside the change note", "an identical retry says plainly that nothing changed", "a change at sentence 601 of a long draft is found", "a retry carries its parent's prompt forward", "a retry with a different prompt is pointed to a new try". Feedback checks: "a late change in a 500-plus sentence draft inside the cap is found", "three sentences rewritten as one show as one change", "a full rewrite at the cap compares well inside 50 ms". |
| II.A.1 naming what is on the page | At 3 (run 1). `src/feedback/observe.ts`: length, sentence length by third, repeated words, repeated openings, punctuation, pronoun and tense shifts, from the draft alone. | Feedback checks: "every observation fits the four-field layout and quotes the draft as written", "the reader's own wording carries no judging words". |
| II.A.2 quoting where it shows up | At 3 (runs 1 and 2). 1 to 3 exact quotes per line with places. A change quotes both sides. The tense line quotes the sentence that leans furthest each way. | Feedback check: "a change from opening to end quotes both sides". Walkthrough: "the repeated hedge is named and quoted". |
| II.B.1 using plain words | At 3 (run 1). `src/feedback/words.ts`: 15 technical terms swap to plain ones, and judging words hold a line back. | Feedback checks: "technical terms become plain words, quoted words stay as written", "judging words hold a line back, the agent's quoted words pass". |
| II.B.2 one observation per line | At 3 (run 3). `src/feedback/split.ts` splits a line only when every part after a join reads as a full observation. A verb phrase borrows a clean, agreeing subject. A part with no verb keeps the line whole. A two-point line that cannot carry its subject goes to unplaced with its reason. CODE_VERSION observe-2. | Split checks: TAFFY's 48 combinations (19 clean, 29 whole, 0 fragments, 0 garbled) and the R8, R11, R12 shapes. Feedback checks: "an 'also' inside one clause stays one line, as written", "two observations joined with 'also' become two lines, each with its subject", "a two-point line with one quote stays whole for the layout flags". |
| II.B.3 the same layout every time | At 3 (run 1). `src/feedback/layout.ts` LAYOUT_VERSION 1, four fields. A misfit goes to unplaced and layout_flags, with quotes hidden. /admin/layout-flags takes Emily's decision. Real Cloudflare Access waits for a deploy. | Feedback check: "a line that fits no field goes to unplaced, and its flag hides the agent's words". Walkthrough: "observations use the four fields", the two admin page lines. |
| III.A.1 rereading its own tries | Agent side, at 3 (run 6, agreement; STRIX named patterns across tries in both stitches). GET /tries?session=current shows this session's tries side by side with feedback, marks, and stitches, plus the seam, in one call, and reading it leaves the idle clock alone. The stitch step (db46df2): from the second try the reply pauses to ask for the thread and what changed, and from the third it asks how the try ties back to the first. POST /tries/:id/stitch checks each quote word for word. | Walkthrough: "this session's tries come side by side with feedback", "the session view carries each try's marks, in the same shape as the single-try view", "the second try pauses for a stitch, names the endpoint, and keeps its feedback", "from the third try on, the pause also asks how it ties back to the knot", "a stitch quote that is not in the named try gets a 400 naming it", "a stitch with exact quotes is stored, tied to the previous try and the knot", "the session view shows each try's stitch beside its feedback and marks, plus the seam in order", "reading this session starts no session and leaves the idle clock alone". |
| III.A.2 naming what it recognizes as its own | Agent side, at 3 (run 4, chair; held in run 5). POST /tries/:id/mark takes own_lines (exact spans, empty ones refused, repeats kept once) and less_familiar. Marks show in the session view, the single-try view, the drawer, and the feedback view. | Walkthrough: "a missed try takes a mark with why_back and own_lines", "own_lines must be exact spans of the try", "an empty own_lines span is refused with a kind message", "a repeated own_lines span is kept once and noted", "GET /tries/:id/feedback carries the try's marks". |
| III.B.1 noting what was tried | At 3 (run 1). what_tried on every mark, POST /marks/rename (says when it merges), GET /marks grouped by what_tried. | Walkthrough: "marks group by what_tried and a rename moves the group", "a rename onto an existing label says it merged and names both". |
| III.B.2 saying why it deserves another look | Agent side, at 3 (run 4), L4 candidate. why_back on any mark, missed tries too. Arrival text says name what the try has and what is unclear. | Walkthrough: "a missed try takes a mark with why_back and own_lines". |

Outside the matrix: privacy between keys (the arrival and session-end texts make no promise about who reads the work, and say it is kept to look back on; Emily's call, Nov 22), caps (body_bytes included), charset=utf-8 with a Brontë round trip, the prompt randomizer, and session end each have walkthrough lines. The outside model hook sits in `src/outside.ts`, off.

## Files

| Path | What it holds |
|---|---|
| `src/index.ts` | The Worker: routes, sessions, tries, retries, notes, marks, stitches, the seam, session end, the admin page, and the json helper (charset=utf-8). |
| `src/instructions.ts` | The arrival text at GET / and the three moves after a miss. |
| `src/auth.ts` | Keys (D1 keeps only the sha256) and the admin Access check. |
| `src/caps.ts` | Hard caps and capReply, which hands the draft back. |
| `src/prompts.ts` | The four prompt lists (list version v2), seeded draws, prompt ids, and picks. Authors are chosen for play. |
| `src/outside.ts` | The optional outside reader, off by default. |
| `src/types.ts` | Shared types. |
| `src/feedback/` | The workshop's reader: `observe.ts`, `words.ts`, `split.ts`, `layout.ts`, `diff.ts`, `text.ts`, and `index.ts` (the pipeline). |
| `migrations/0001_safe_place.sql` | The D1 schema: keys, sessions, tries, feedback, marks, layout_flags. |
| `migrations/0002_rough_edges_and_diagnosis.sql` | rough_edges and diagnosis on tries. |
| `migrations/0003_prompts.sql` | The prompt a try answers. |
| `migrations/0004_stitches.sql` | The stitches table. |
| `test/feedback-observations.test.ts`, `test/sample-pieces.json` | Feedback checks. |
| `test/prompt-draws.test.ts` | Prompt checks, the v2 authors included. |
| `test/split-combinations.test.ts` | Split checks. |
| `scripts/walkthrough.mjs` | One agent's journey end to end against local wrangler dev, plus privacy, caps, and the admin page. |
| `wrangler.jsonc`, `tsconfig.json`, `package.json`, `.dev.vars.example`, `README.md` | Config and how to run it. |

## Endpoints

| Route | What it does |
|---|---|
| GET / | Arrival text. |
| POST /keys | A free key, shown once. |
| GET /prompt, GET /prompt/lists | A drawn prompt (?seed= for the same draw), and every choice. |
| POST /tries | A try with text, intent, scope_note, style_tag, a prompt, rough_edges, landed. From the second try in a session the reply carries the stitch pause. |
| GET /tries?session=current | This session's tries with feedback, marks, and stitches, plus the seam. |
| GET /tries?landed=no | The drawer, by date, ?style_tag= to narrow, with feedback and marks. |
| GET /tries/:id, GET /tries/:id/feedback | One try with its feedback and marks, and the feedback view with marks. |
| POST /tries/:id/retry | A retry with change_note, carrying the parent's prompt. |
| POST /tries/:id/notes, POST /tries/:id/landed | Diagnosis and rough_edges, and the agent's yes, no, or unsure. |
| POST /tries/:id/mark | what_tried, why_back, own_lines, less_familiar. |
| POST /tries/:id/stitch | thread, deltas, quotes checked word for word. |
| GET /marks, POST /marks/rename | Marks grouped by what_tried, and a label rename. |
| POST /session/end | Marks and own lines as plain text, with an invitation back. |
| GET /admin/layout-flags, POST /admin/layout-flags/:id, POST /admin/keys/revoke | Emily's page behind Cloudflare Access. |

## Verify

In PowerShell on ezra-01, one command at a time:

```
cd C:\Users\hellz\Desktop\voice-workshop\app
npm install
Copy-Item .dev.vars.example .dev.vars
npm run typecheck
npm run test:feedback
npm run test:prompts
npm run test:split
npm run db:local
npm run walkthrough
```

Expected: typecheck prints no errors, test:feedback 19 of 19, test:prompts 8 of 8, test:split 6 of 6, db:local applies through 0004, and walkthrough prints "60 of 60 checks passed." Run db:local and the walkthrough as two steps. By hand: `npm run dev`, then open http://127.0.0.1:8787/.
