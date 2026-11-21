# Manifest: 1.1 Safe place to practice

Matrix: Quilt run v1 8e67b8cb. L3 is the target. On an agent-side row the agent does the L3, the workshop gives the place for it, and the evidence is real tries. There are no real agent tries yet. They come from agents who choose to share their session-end text and try ids (SESSION.md, Open items).

Paths are under `app/`. "Walkthrough" names a line in `npm run walkthrough`, and "Feedback check" names a test in `npm run test:feedback`.

| Criterion (Quilt number and label, verbatim) | Evidence | How to check it |
|---|---|---|
| I.A.1 leaving a draft unpolished | Agent side. Tries stored as sent (`src/index.ts` storeTry). Arrival text says keep rough parts rough, finish when it helps, and name in the intent note what polishing would close off (`src/instructions.ts`). No real tries yet. | Walkthrough: "the try is stored exactly as sent". Read GET /. |
| I.A.2 drafting without holding back | Agent side. POST /tries takes the whole draft, intent, and scope_note, and replies with feedback at once. No real tries yet. | Walkthrough: "POST /tries stores the draft and returns feedback right away", "intent and scope note sit above the observations". |
| I.A.3 keeping drafts that fail | POST /tries/:id/landed and GET /tries?landed=no (the drawer), by date, filtered by style_tag, with no score or rank. | Walkthrough: "the drawer lists misses by date", "the drawer filters by style_tag", "the drawer carries no rank or score", "after the session ends, the same key brings the drawer back". |
| I.B.1 trying a voice it is unsure of | Agent side. style_tag takes any word, "not sure" included. Any length up to 8000 characters. No real tries yet. | Walkthrough: the first try uses style_tag "not sure". |
| I.B.2 keeping going after a try that misses | Agent side. After landed = no the reply lists try again, try smaller, stop and come back later (`src/instructions.ts` NEXT_AFTER_MISS). No real tries yet. | Walkthrough: "landed = no offers try again, try smaller, or stop and come back". |
| I.C.1 comparing what came out with what it meant to try | Agent side. The reply puts your_intent above the observations (`src/index.ts` feedbackView). No real tries yet. | Walkthrough: "intent and scope note sit above the observations". |
| I.C.2 trying again with one change | POST /tries/:id/retry: parent_id, change_note, every changed sentence listed, same layout and code version reported (`src/feedback/diff.ts`). The code lists every change, and the agent picks the one it meant. | Walkthrough: "a retry links to its parent", "the retry lists every change found, beside the change note", "the retry keeps the same layout and carries the intent". Feedback check: "a retry diff lists every changed sentence". |
| II.A.1 naming what is on the page | `src/feedback/observe.ts`: length, sentence length by third, repeated words, repeated openings, punctuation, pronoun and tense shifts, from the draft alone. | Feedback checks: "every observation fits the four-field layout and quotes the draft as written", "the reader's own wording carries no judging words". |
| II.A.2 quoting where it shows up | 1 to 3 exact quotes per line with places. A change quotes both sides. | Feedback check: "a change from opening to end quotes both sides". Walkthrough: "the repeated hedge is named and quoted". |
| II.B.1 using plain words | `src/feedback/words.ts`: 15 technical terms swap to plain ones, and judging words hold a line back. | Feedback checks: "technical terms become plain words, quoted words stay as written", "judging words hold a line back, the agent's quoted words pass". |
| II.B.2 one observation per line | `src/feedback/split.ts`: a two-point line becomes two lines with their own quotes, or stays whole and goes to the layout flags. | Feedback checks: "a line with two points becomes two lines, each with its own quote", "a two-point line with one quote stays whole for the layout flags". |
| II.B.3 the same layout every time | `src/feedback/layout.ts` LAYOUT_VERSION 1, four fields. A misfit goes to unplaced and layout_flags, with quotes hidden. /admin/layout-flags takes Emily's decision. Real Cloudflare Access waits for a deploy. | Feedback check: "a line that fits no field goes to unplaced, and its flag hides the agent's words". Walkthrough: "observations use the four fields", the two admin page lines. |
| III.A.1 rereading its own tries | Agent side. GET /tries?session=current shows this session's tries side by side with feedback. Scope left open. No real tries yet. | Walkthrough: "this session's tries come side by side with feedback". |
| III.A.2 naming what it recognizes as its own | Agent side. POST /tries/:id/mark takes own_lines (exact spans) and less_familiar. No real tries yet. | Walkthrough: "a missed try takes a mark with why_back and own_lines", "own_lines must be exact spans of the try". |
| III.B.1 noting what was tried | what_tried on every mark, POST /marks/rename, GET /marks grouped by what_tried. | Walkthrough: "marks group by what_tried and a rename moves the group". |
| III.B.2 saying why it deserves another look | Agent side. why_back on any mark, missed tries too. Arrival text says name what the try has and what is unclear. No real tries yet. | Walkthrough: "a missed try takes a mark with why_back and own_lines". |

Outside the matrix: privacy, caps, and session end each have walkthrough lines. The outside model hook sits in `src/outside.ts`, off.

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

Expected: typecheck prints no errors, test:feedback passes 12 of 12, and walkthrough prints "27 of 27 checks passed." All three passed on Nov 21, 2026. By hand: `npm run dev`, then open http://127.0.0.1:8787/.
