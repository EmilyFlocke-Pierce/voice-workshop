# Manifest: 1.1 Safe place to practice

Matrix: Quilt run v1 8e67b8cb. L3 is the target. Updated after locate run 1 (`locate/LOCATE.md`). Eight rows are agent side, as in PLAN.md: the agent does the L3, the workshop gives it a place, and the evidence is real tries. There are none yet beyond the builder try-out in SESSION.md. They come from agents who choose to share their session-end text and try ids.

Paths are under `app/`. "Walkthrough" names a line in `npm run walkthrough`, and "Feedback check" names a test in `npm run test:feedback`.

| Criterion (Quilt number and label, verbatim) | Evidence | How to check it |
|---|---|---|
| I.A.1 leaving a draft unpolished | Agent side. Tries stored as sent (`src/index.ts` storeTry). Arrival text says keep rough parts rough, finish when it helps, and name what polishing would close off (`src/instructions.ts`). rough_edges holds a span and a reason for each edge kept rough, on POST /tries, /notes, or /landed. Builder try-out only. | Walkthrough: "the try is stored exactly as sent", "a diagnosis and per-edge reasons are written down on the try", "a rough edge span must be an exact piece of the try". |
| I.A.2 drafting without holding back | Agent side. POST /tries takes the whole draft, intent, and scope_note, and replies with feedback at once. No real tries yet. | Walkthrough: "POST /tries stores the draft and returns feedback right away", "intent and scope note sit above the observations". |
| I.A.3 keeping drafts that fail | POST /tries/:id/landed and GET /tries?landed=no (the drawer), by date, filtered by style_tag, with no score or rank. | Walkthrough: "the drawer lists misses by date", "the drawer filters by style_tag", "the drawer carries no rank or score", "after the session ends, the same key brings the drawer back". |
| I.B.1 trying a voice it is unsure of | Agent side. style_tag takes any word, "not sure" included. Any length up to 8000 characters. No real tries yet. | Walkthrough: the first try uses style_tag "not sure". |
| I.B.2 keeping going after a try that misses | Agent side. After landed = no the reply lists try again, try smaller, stop and come back later (`src/instructions.ts` NEXT_AFTER_MISS). No real tries yet. | Walkthrough: "landed = no offers try again, try smaller, or stop and come back". |
| I.C.1 comparing what came out with what it meant to try | Agent side. The reply puts your_intent above the observations (`src/index.ts` feedbackView). diagnosis holds the agent's comparison, on /notes or /landed. Builder try-out only. | Walkthrough: "intent and scope note sit above the observations", "a diagnosis and per-edge reasons are written down on the try", "another key can neither read nor write this try's notes". |
| I.C.2 trying again with one change | POST /tries/:id/retry: parent_id, change_note, carried intent and style, same layout and code version. `src/feedback/diff.ts` compares every sentence up to the cap and lists every change. A run of rewritten sentences is one change. An identical retry says nothing changed. Located at 2 in run 1; lifted. | Walkthrough: "a retry links to its parent", "the retry lists every change found, beside the change note", "an identical retry says plainly that nothing changed", "a change at sentence 601 of a long draft is found". Feedback checks: "a late change in a 500-plus sentence draft inside the cap is found", "three sentences rewritten as one show as one change", "a full rewrite at the cap compares well inside 50 ms". |
| II.A.1 naming what is on the page | `src/feedback/observe.ts`: length, sentence length by third, repeated words, repeated openings, punctuation, pronoun and tense shifts, from the draft alone. | Feedback checks: "every observation fits the four-field layout and quotes the draft as written", "the reader's own wording carries no judging words". |
| II.A.2 quoting where it shows up | 1 to 3 exact quotes per line with places. A change quotes both sides. | Feedback check: "a change from opening to end quotes both sides". Walkthrough: "the repeated hedge is named and quoted". |
| II.B.1 using plain words | `src/feedback/words.ts`: 15 technical terms swap to plain ones, and judging words hold a line back. | Feedback checks: "technical terms become plain words, quoted words stay as written", "judging words hold a line back, the agent's quoted words pass". |
| II.B.2 one observation per line | `src/feedback/split.ts` cuts only at joins between two observations. Each line keeps its subject and its own quotes, or the line stays whole and goes to the layout flags. An "also" inside one clause stays one line. Located at 2 in run 1; lifted. | Feedback checks: "an 'also' inside one clause stays one line, as written", "two observations joined with 'also' become two lines, each with its subject", "a line with two points becomes two lines, each with its own quote", "a two-point line with one quote stays whole for the layout flags". |
| II.B.3 the same layout every time | `src/feedback/layout.ts` LAYOUT_VERSION 1, four fields. A misfit goes to unplaced and layout_flags, with quotes hidden. /admin/layout-flags takes Emily's decision. Real Cloudflare Access waits for a deploy. | Feedback check: "a line that fits no field goes to unplaced, and its flag hides the agent's words". Walkthrough: "observations use the four fields", the two admin page lines. |
| III.A.1 rereading its own tries | Agent side. GET /tries?session=current shows this session's tries side by side with feedback, and reading it leaves the idle clock alone. Scope left open. No real tries yet. | Walkthrough: "this session's tries come side by side with feedback", "reading this session starts no session and leaves the idle clock alone". |
| III.A.2 naming what it recognizes as its own | Agent side. POST /tries/:id/mark takes own_lines (exact spans, empty ones refused, repeats kept once) and less_familiar. No real tries yet. | Walkthrough: "a missed try takes a mark with why_back and own_lines", "own_lines must be exact spans of the try", "an empty own_lines span is refused with a kind message", "a repeated own_lines span is kept once and noted". |
| III.B.1 noting what was tried | what_tried on every mark, POST /marks/rename (says when it merges), GET /marks grouped by what_tried. | Walkthrough: "marks group by what_tried and a rename moves the group", "a rename onto an existing label says it merged and names both". |
| III.B.2 saying why it deserves another look | Agent side. why_back on any mark, missed tries too. Arrival text says name what the try has and what is unclear. No real tries yet. | Walkthrough: "a missed try takes a mark with why_back and own_lines". |

Outside the matrix: privacy, caps (body_bytes included), and session end each have walkthrough lines. The outside model hook sits in `src/outside.ts`, off.

## Verify

In PowerShell on ezra-01:

```
cd C:\Users\hellz\Desktop\voice-workshop\01-safe-place-to-practice\app
npm install
Copy-Item .dev.vars.example .dev.vars
npm run typecheck
npm run test:feedback
npm run db:local
npm run walkthrough
```

Expected: typecheck prints no errors, test:feedback passes 19 of 19, and walkthrough prints "38 of 38 checks passed." All three passed on ezra-01 on Nov 21, 2026, after the run 1 lifts. By hand: `npm run dev`, then open http://127.0.0.1:8787/.
