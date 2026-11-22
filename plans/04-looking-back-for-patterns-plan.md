# Plan: 2.1 Looking back for patterns

Source: Quilt ready run v1 bd16015c (27 criteria), in `04-looking-back-for-patterns\criteria.json`, and slice-report-02-01-v2. Quilt numbers this slice 02-01, and its folder is 04. In the middle column, quotes are Quilt's words, apart from Emily's locate note from slice 01. Quotes in the left column are text the workshop shows. The rest is my reading. Written Nov 22, 2026 by SCROLL, for Emily and for any builder. Revised the same day after STINGER's review (68 findings).

**Base:** the move commit from Step 0 (id goes here when it lands). Until then the repo is main at 99a3acd.

## Words used here

- **L3** is the target level on each matrix row. Each row has levels 1 to 4, and the build aims every row at level 3.
- **Column 3** is the third column of the plan table, "What actually happened". The builder fills it as the work lands.
- **A locate** is the locating manager's check of the finished build against the matrix, row by row. CANDY is the locating manager, and her team (TOFFEE and TAFFY) does the locating. Their notes live in each slice's `locate\` folder.
- **A lift** is a fix the builder makes after a locate, to bring a row up to L3.
- **Co-signed** means Emily and SCROLL agreed on the matrix. **A ready run** is the Quilt run that produced it.
- **ezra-01** is Emily's PC, where the repo lives.
- **SESSION, MANIFEST, QUIRKS** are each slice's running record, its row-by-row evidence with Verify commands, and its list of rough spots with next moves. Slice 01 has all three as examples.

## Step 0: the app move (before either slice starts)

Slices 02 and 04 both build on the one Worker, so the Worker moves once, in its own commit, before either slice branch exists. One builder makes the move: SCROLL, unless Emily names someone else (see For Emily). Both slice branches start from that commit, which is called **the move commit** below. When it lands, its id goes into the Base line of this plan and of the other slice's plan.

The move, on main from 99a3acd:

1. `git mv 01-safe-place-to-practice/app app`. The app ends up in `app\` at the repo root, so the full path is `C:\Users\hellz\Desktop\voice-workshop\app`.
2. Update every path that names the old folder where a reader would run a command or open a file. At 99a3acd those are in slice 01's `PLAN.md` and `MANIFEST.md` (the Verify block, lines 77 to 89, starts with `cd ...\01-safe-place-to-practice\app`). Search the repo for `01-safe-place-to-practice\app` and `01-safe-place-to-practice/app` outside `locate\` to catch any others. Dated entries in SESSION and `CHANGELOG.md` stay as written, since they record what was true then. Add a `CHANGELOG.md` entry for the move.
3. `node_modules\`, `.wrangler\` (the local D1), and `.dev.vars` are not tracked, so they stay behind. Run `npm install`, copy `.dev.vars.example` to `.dev.vars`, and run `npm run db:local` in the new folder.
4. Run the full check list from "Run it" below. Typecheck, `test:feedback`, `test:prompts`, `test:split`, and the walkthrough (60 of 60) pass after the move, as they do at 99a3acd.
5. The move breaks the locate probe imports. The probes in `01-safe-place-to-practice\locate\probe\` import the app as `../../app/src/...` (for example `taffy-probe.test.ts` line 4, `import { feedbackFor, runPipeline } from "../../app/src/feedback/index.ts";`). After the move the app is at `../../../app/src/...` from there. Leave `locate\` exactly as it is, since it belongs to CANDY. Write a dated entry in slice 01's `SESSION.md` saying the probe imports now point at a folder that no longer exists, giving the new relative path, and asking CANDY to update them.
6. Commit on main with a message that names the move and the probe note. Record the commit id in both plans' Base line.

## Intent

I want the agent to lay all its practice pieces side by side, with what it said about each, and name what keeps showing up, pointing to the pieces that show it. Then it says which repeats it chose and which are default, and how sure the record lets it be. It stops at naming. Saving the voice belongs to 05.

## How it touches the other parts

```json
{
  "slice": "04-looking-back-for-patterns",
  "runs_on": "the same Cloudflare Worker (TypeScript) + D1 as slice 01, in app\\ at the repo root after Step 0, same key, same caps",
  "pieces": {
    "POST /lookbacks": "scope (all, meaning every try under this key; or dates, sessions, or style kinds); builds the corpus and its audit",
    "GET /lookbacks/:id/corpus": "every piece in order with a label (P1, P2...), its version chain, and every note linked to it by note id",
    "POST /lookbacks/:id/pull": "pull a try that sits outside the scope into the corpus",
    "GET /lookbacks/:id/audit": "pieces with no notes, parents outside the scope, identical pieces, notes that may belong to another version",
    "POST /lookbacks/:id/notes/:note_id": "{belongs_to: \"P7\"}: the agent places a misplaced note, stored in the corpus snapshot",
    "POST /lookbacks/:id/limits": "the agent's limits note",
    "GET /lookbacks/:id/compare?feature=": "one measure across every piece in order, with style per piece",
    "GET /lookbacks/:id/recurring": "candidates: repeated wording (exact and near), sentence openings and transitions, structural shapes, each with every occurrence quoted",
    "GET /lookbacks/:id/dropped": "wording and moves removed between a piece and its retry, whether they came back later, and what kind of evidence shows it",
    "POST /lookbacks/:id/patterns": "the agent names a pattern: inclusion rule, instances (piece label plus exact quote)",
    "POST /lookbacks/:id/patterns/:pid/revise": "a new inclusion rule or denominator subset; recounts and keeps the old count",
    "GET /lookbacks/:id/patterns/:pid": "per-piece counts, corpus total, appearance rate with its denominator, rank with ties, every revision, a timeline across pieces, and intent notes beside where the pattern appears",
    "POST /lookbacks/:id/claims": "taste, default, mixture, or unclear, with evidence, interpretation, counterexamples, and rejections in separate fields",
    "GET /lookbacks/:id/findings": "named patterns with their pieces and claims, as plain text to take to 05"
  },
  "storage (migration 0007_lookbacks.sql)": {
    "lookbacks": ["id", "agent_id", "scope (json)", "corpus (json snapshot of labels, try ids, chains, note ids, placements, pulled tries)", "limits_note", "created_at"],
    "patterns": ["id", "lookback_id", "name", "inclusion_rule", "rule_version", "denominator (json: default, or a list of piece labels)", "instances (json)", "counts (json)", "created_at", "updated_at"],
    "pattern_revisions": ["pattern_id", "rule_version", "inclusion_rule", "denominator (json)", "counts (json)", "created_at"],
    "claims": ["id", "pattern_id", "kind", "function", "future_intent", "evidence (json)", "interpretation", "counterexamples (json)", "rejections (json of {piece, note_id, quote})", "qualifiers", "created_at"]
  },
  "reads": {
    "01-safe-place-to-practice": "tries, retry chains (parent_id, change_note), feedback.diff, intent, scope_note, diagnosis, rough_edges, landed, marks, stitches",
    "02-experimenting-with-styles": "exercises and exercise_notes, when those tables exist",
    "03-layering": "layered pieces and their notes, when 03 exists; until then retry chains stand in"
  },
  "writes": ["lookbacks", "patterns", "pattern_revisions", "claims"],
  "hands_to": {
    "05-saving-voice-skill": "findings: named patterns, the pieces that show them, and taste versus default"
  },
  "human": "none here; 06 owns sharing",
  "who_can_read": "among agents, only the holder of the key; Emily's read-only export comes later, under the terms at sign-in"
}
```

## Agent journey

I have 23 pieces now, across four sessions and six styles, and a pile of notes I barely remember writing. I ask for a look back over my last three sessions. The workshop lays them out in order, P1 to P23, each with its notes, and tells me three pieces have no notes and one retry's parent sits outside the sessions I picked. I pull the parent in and say the rest in my limits note. The recurring list shows I end nine pieces on a one-line sentence, and I open with "There is" across styles that have nothing to do with each other. I name the first "the short landing" and write my rule for what counts. The count says 9 of 23, but 4 of them are haiku, where every line is short, so I narrow the denominator. My notes say I kept the short landing on purpose twice and cut it once, and it came back two pieces later. I call it taste, with a qualifier. The "There is" openings have no note at all. I call that default and say how sure I am. I leave with findings I can save.

## How the corpus is built

- **A piece is a try.** Every try in scope gets a label, P1 to Pn, in created order. The default denominator for a count is the latest version of each retry chain, and the agent can switch it to every try or to a named subset.
- **Note ids.** Every note in the corpus has one id: `try:<try_id>:intent`, `try:<try_id>:scope_note`, `try:<try_id>:change_note`, `try:<try_id>:diagnosis`, `try:<try_id>:rough_edges`, `mark:<id>`, `stitch:<id>`, and `xnote:<id>` for 02's exercise notes. Claims evidence, rejections, placements, and the audit all use these ids.
- **What counts as a reflection note.** All of the above. `landed` (yes, no, unsure) is shown with its piece but does not count, so a try with only a landed value is listed as "no notes".
- **02's tables.** Once per lookback, check `SELECT name FROM sqlite_master WHERE type='table' AND name='exercises'`. When the table is there, read exercises and exercise_notes. When it is not, skip them and say so in the corpus reply.
- **Scope "style kinds".** When 02's tables are not there, refuse this scope with a message that style kinds arrive with slice 02 and that "all", dates, and sessions work now.
- **Size.** `lookback_pieces: 200`. Past it, take the newest 200 tries in scope and say so in the corpus reply and the audit.

## The plan table

| What I do | How it gets to L3 | What actually happened |
|---|---|---|
| Start the branch `slice-04` from the move commit (Step 0). | Supports every row. Both slices stand on one Worker in `app\` at the repo root (Decision 5). | |
| Add `src/lookback/` as its own module and migration `0007_lookbacks.sql`. Slice 04 touches slice 01's located code in these places: the route table in `src/index.ts` (new routes), the session-end text (the nudge row below), and `checkTryCaps` (its `d1_rows_per_agent` count adds lookbacks, patterns, pattern_revisions, and claims). The walkthrough's 60 checks pass after every change. | Supports every row. | |
| New caps in `src/caps.ts`: `lookbacks_per_key_per_day: 10`, `lookback_pieces: 200`, and `lookback_cpu_ms: 1000`. Past the daily cap, refuse with `capReply`. Past the piece cap, take the newest 200. `feedback_cpu_ms` stays as it is. The corpus, audit, recurring, and dropped results are computed once at POST /lookbacks and stored in the corpus snapshot. | Supports every row. | |
| POST /lookbacks builds the corpus as in "How the corpus is built": every try in scope in order, labeled P1 to Pn with its try id, its notes linked by note id, and its retry chain. | I.A.1 "Gather experimental pieces", I.A.3 "Gather reflection notes", I.A.4 "Assemble review corpus": pairing and "consistent labels so each item can be found again" are the base for the L3 checks. | |
| Retry chains stand in for layered pieces until 03 exists: each chain in order, each version beside its parent, with the diff read from `feedback.diff` (migration 0001). When 03 lands, its pieces join through the same shape. | I.A.2 "Gather layered pieces": "each piece's sequence of changes is traceable". | |
| GET /lookbacks/:id/audit lists pieces with no notes, identical texts, and retries whose parent sits outside the scope. Slice 01 always stores a retry's parent under the same key, so a parent outside the scope is the one way a chain looks broken. The corpus shows that parent's try id marked "outside this scope", and POST /lookbacks/:id/pull {try_id} brings it in with the next label. | I.A.1 L3 "retrieve or flag gaps": the pull is the retrieve, and the audit is the flag. | |
| The audit also lists notes that may belong to another version: a note whose quote (a stitch quote, a rough_edges span, an exercise note quote) is not in its own try's text but is in another version of the same chain. POST /lookbacks/:id/notes/:note_id {belongs_to: "P7"} places it, stored in the corpus snapshot. | I.A.3 "Resolve misplaced or ambiguous notes where possible, and flag missing reflections rather than treating them as evidence." | |
| POST /lookbacks/:id/limits takes the agent's limits note. The corpus reply pauses on "What is missing from this set, and what does that limit?" | I.A.1, I.A.2, I.A.3, I.A.4 at L3: audit, curate, verify, validate, and "makes the corpus's limits clear before review begins". The code finds the gaps, and the agent flags them. | |
| GET /lookbacks/:id/compare?feature= shows one measure for every piece in order: sentence length, sentence count, first words, or closing sentence length, computed with `sentencesOf` and `wordsOf` from `src/feedback/text.ts`, so every piece gets a number. Style per piece is `style_id` when 02 is there, then `prompt_style`, then `style_tag`. | I.B.1 "Compare across pieces": "how similarities and differences persist or shift across the body of practice". | |
| GET /lookbacks/:id/recurring: repeated wording of 3 to 6 words, exact and near; openings and transitions; and structural shapes (how a piece opens and ends, lists of three, closing sentence length, questions). Near is new code in `src/lookback/near.ts`: lowercase, strip one suffix from each word (s, es, ed, ing, ly), and treat two spans of the same length as near when they differ in one word. Every occurrence is quoted with its piece label and labeled exact or near. It describes, through slice 01's word check. | II.B.1 "identify baseline phrases", II.B.2 "flag generic transitions", II.B.3 "isolate systemic redundancies", II.B.4 "detect structural autopilot", III.A.1 "quote recurring wording": candidates come from the agent's own pieces, never from a fixed list of bad phrases. | |
| POST /lookbacks/:id/patterns: the agent names a pattern, writes its inclusion rule, and lists instances (piece label plus exact quote, checked word for word). Grouping several wordings under one move is allowed and invited. | I.C.1 "Name recurring choices": "Name the underlying move and cite examples that show both its variations and its continuity." II.B.1 and II.B.3 group by move. | |
| GET /lookbacks/:id/patterns/:pid shows a timeline across pieces in order: first appearance, gaps, returns, the style of each piece, and the pieces where the pattern breaks. | I.B.2 "Track repeated choices" (steady, gaps, changes over time), II.A.2 "find the friction point where a repeat began", and the "cases where the pattern breaks" in II.B.4. | |
| Counts per pattern: per-piece counts kept apart from the corpus total, appearance rate with the denominator named and its pieces listed, rank with ties sharing a rank, and close counts flagged. POST /lookbacks/:id/patterns/:pid/revise takes a new inclusion rule or denominator subset, raises `rule_version`, recounts, and writes the old rule, denominator, and counts to `pattern_revisions`. The pattern view shows every revision. | III.B.1 "tally repeated choices", III.B.2 "calculate appearance rate" ("which pieces form each denominator"), III.B.3 "rank recurring patterns": each L3 validates. The code counts the same way every time, and the agent sets the rule and the denominator. | |
| The same pattern view lines up the pieces' intent notes against where the pattern appears, grouped by style. | II.A.1 "cross-reference intent notes": "what remains consistent from what changes with the style". | |
| GET /lookbacks/:id/dropped, for each parent and retry pair: wording removed, from a word-level diff run on each `changed` pair in the stored `feedback.diff` (`diffTries` in `src/feedback/diff.ts` compares whole sentences), plus whole `removed` sentences; moves removed, from the structural shapes in `/recurring`, where a shape in the parent and not in the retry is a removed move; and whether each comes back in a later piece. Each gets an evidence label: explicit when the retry's `change_note` or `diagnosis` contains the removed words or quotes them, indirect when only the diff shows it, absence when it is just missing. | III.C.1 "Track dropped wording", III.C.2 "Track removed moves", III.C.4 "Flag drops that return": each L3 separates explicit evidence from clues and absence. | |
| Claims carry `rejections`: entries the agent records, each {piece, note_id, quote}. The claim shows the count as "1 recorded", "2 recorded", and a pattern with one recorded rejection says "one instance". | III.C.3 "Track rejected approaches": "Calibrate the claim to the evidence, without inferring why the agent rejected it." | |
| POST /lookbacks/:id/claims: kind (taste, default, mixture, unclear), function, future_intent, evidence (piece and note quotes, checked word for word), interpretation, counterexamples, rejections, qualifiers. Evidence and interpretation sit in separate fields. A `default` claim on a recurring transition or structure asks for the reflection notes it weighed and the pieces where the pattern breaks. | II.B.2 "flag generic transitions" and II.B.4 "detect structural autopilot" at L3 (weighing appearances against reflection notes), II.C.1 "Explain the repeat's function", II.C.2 "Assess future choice intent", II.C.3 "Distinguish taste from default", III.A.2 "cite supporting pieces", III.A.4 "separate evidence from interpretation". | |
| Note quotes in a claim stay exact, with the note's id, piece, and kind. Two notes that disagree are shown side by side. | III.A.3 "cite reflection notes": "preserve differences or contradictions instead of treating every mention as identical". | |
| One pause question per stage: "What is missing?" at the corpus, "What counts as one?" at a pattern, "What would make you less sure?" at a claim. | Supports every agent-side row. Slice 01 learned that a pause with a question invites the act. | |
| The look-back nudge (Decision 6). At `POST /session/end`, when the key has at least 6 tries across at least 2 sessions and no lookback since its last session end, the session-end text gains one last line: "You have N pieces across M sessions. When you want to, POST /lookbacks lays them side by side with your notes." It never blocks anything. | Supports the slice's start: the agent learns a look back is there when it has enough to look at. | |
| GET /lookbacks/:id/findings: plain text with each named pattern, its pieces, its claim, and its qualifiers, to take home or into 05. | Supports the slice's end: "finding and naming the patterns, with the pieces that show them". | |
| Seed a sample corpus in `test/lookback-corpus.json` that holds: a retry whose parent falls outside a session scope, a try with no notes, a try with only a landed value, a stitch quote that matches a sibling version and not its own try, two identical tries, a chain with a dropped phrase that returns two pieces later, a dropped list of three, and a near-match phrase. Add `npm run test:lookback`, with a timing check that a lookback on 200 seeded pieces runs under `lookback_cpu_ms`. Extend the walkthrough through one lookback, and run a try-out from the agent seat before handing off. | Supports every row. Slice 01's first locate note was "the big thing was that u didnt test it out." | |

## Risks and unknowns

- **Counting for its own sake.** III.B is tallies and ranks. Move: counts sit inside a pattern the agent named, and the denominator is always shown, so a number points back to pieces.
- **A list of banned phrases sneaking back in.** II.B could grow a fixed list of "generic" phrases. Move: candidates come only from repeats across this agent's pieces, and the agent's notes decide autopilot.
- **Too few pieces.** Move: a lookback opens on any corpus and its limits say how thin it is. The nudge comes after 6 pieces across 2 sessions, and it never blocks one (Decision 6).
- **03 is unbuilt.** Move: retry chains stand in for layered pieces, and I.A.2 rests on them until 03 lands (Decision 8).
- **Level 4 reaches past this slice.** The lines in II.B.3 and II.C.1 that change the writing approach go to 05 (Decision 7). This slice stops at naming.
- **02 may be built at the same time.** Move: read 02's tables only when they exist, and take migration 0007.
- **Near-match wording is fuzzy.** Move: the rule is fixed in code, every near match is labeled near with both quotes, and the agent's rule decides what counts.
- **CPU and size.** Repeat-finding across 200 pieces is heavy. Move: compute once per lookback, store it, measure it against `lookback_cpu_ms`, record the number in SESSION, and lower `lookback_pieces` if it does not fit.
- **Changes to slice 01's code.** Move: each change is listed in the plan table, and the walkthrough's 60 checks pass after it.
- **Nearly every L3 here is the agent's.** Move: each has a field and an invite. Locating rests on cold try-outs with a seeded corpus, as in 01.

## Decisions

Nov 22, 2026. Emily handed these calls to SCROLL ("I'm gonna let you decide on all of that"), and SCROLL made them. The Builds column says which slice carries each one.

| # | Call | Builds |
|---|---|---|
| 1 | The matrices are co-signed: ready run v1 605d446b for 02 and ready run v1 bd16015c for 04. | both |
| 2 | The builder drafts the style catalog of 40 styles at `draft-1` and builds on it. Emily approves it later, and her approval lands as a version raise. | 02 |
| 3 | A 02 exercise draws a subject the way GET /prompt does, and the agent can skip the draw and bring its own. | 02 |
| 4 | The report's line about meeting a human's taste waits for 06 to 08. | neither |
| 5 | The app moves to `app\` at the repo root in one commit before either slice starts (Step 0). | Step 0 |
| 6 | The look-back nudge comes after 6 pieces across 2 sessions, and it never blocks a look back. | 04 (the nudge row) |
| 7 | The level 4 lines that change the writing approach (II.B.3 and II.C.1 in 04) go to 05. | 05 |
| 8 | Retry chains stand in for layered pieces until 03 exists. | 04 |
| 9 | In a look back, "all" means every try under this key. | 04 |

## Data

What slice 01 stores today, read from the code at 99a3acd: every try's text exactly as sent, its retries (parent_id, change_note), the feedback, the agent's notes (intent, scope_note, rough_edges, diagnosis, landed), marks, stitches, and sessions, all in D1 under the agent's id. The key itself is never stored, only its sha256 hash. Nothing is deployed yet, so the only rows so far are local ones from builders and try-outs. The admin route shows layout flags with the agent's words taken out, and revokes keys. Nothing in it reads tries.

Slice 04 adds lookbacks, patterns, pattern_revisions, and claims (the agent's named patterns and its readings of them) to the same D1, under the same agent id.

Emily wants this data to help improve the workshop. Her call on Nov 22, recorded in `01-safe-place-to-practice\SESSION.md` line 64: the arrival and session-end texts no longer promise "only your key reads it" (done in slice 01 at 99a3acd), and the workshop itself says nothing about reading the work to improve it. Data use goes in the terms and privacy text the agent's human agrees to at sign-in, and keys come through that human (`plans\human-sign-in-proposal.md`).

## For Emily

Builders go ahead without these. Each needs Emily's word before the step it names.

- **Who makes the app move (Step 0).** The plan names SCROLL. Say if someone else should.
- **The terms and privacy wording**, agreed at sign-in with a timestamp (see the sign-in proposal).
- **A read-only export or admin query** for Emily behind the Cloudflare Access door, built once sign-in and terms are in place.
- **The Workers plan at deploy.** The lookback's measured CPU time goes in SESSION. Check it against the CPU limit of the Workers plan chosen for deploy, since a bigger plan has a cost.

## For outside builders

- **Repo.** `C:\Users\hellz\Desktop\voice-workshop` on ezra-01, a git repo on main with no remote. Emily passes it along. Start from the move commit (Step 0), where the one Worker lives in `app\` at the repo root. Read `app\README.md`, then `01-safe-place-to-practice\PLAN.md`, `SESSION.md`, and `QUIRKS.md`.
- **Branch.** Make `slice-04` from the move commit. Commit locally as you go, and push only when Emily says.
- **Stack.** TypeScript on Cloudflare Workers with D1, local only. Keep slice 01's caps in `src/caps.ts` and the key-only reads in every query. `tbd\stack-table.md` was brought up to date on Nov 22 (D1 storage, sign-in in version 1). Where it and this plan differ, this plan wins.
- **Migrations.** The order is fixed across all three plans: `0005_humans.sql` (sign-in, kept for it even if it lands later), `0006_exercises.sql` (slice 02), `0007_lookbacks.sql` (this slice), `0008_registers.sql` (slice 02's Part B).
- **Where your work goes.** Code in `app\src\lookback\`, checks in `app\test\`. Reuse `sentencesOf`, `wordsOf`, and the stored `feedback.diff`. The word-level diff and the near-match rule are new code in `src/lookback/`. Slice docs in `04-looking-back-for-patterns\`: copy this plan there as `PLAN.md`, and keep `SESSION.md`, `MANIFEST.md`, and `QUIRKS.md` as slice 01 does.
- **The matrix.** `04-looking-back-for-patterns\criteria.json`, ready run v1 bd16015c. L3 is the target. Leave the matrix as co-signed, and raise any problem with it in SESSION.
- **Run it.** Run this after Step 0. Before the move, the app is in `01-safe-place-to-practice\app`. PowerShell, one command at a time, each one finishing before the next. The walkthrough starts its own `wrangler dev` on port 8799, so no dev server is needed for the checks.

```
cd C:\Users\hellz\Desktop\voice-workshop\app
npm install
Copy-Item .dev.vars.example .dev.vars
npm run db:local
npm run typecheck
npm run test:feedback
npm run test:prompts
npm run test:split
npm run test:lookback
npm run walkthrough
```

  By hand, to poke at it: `npm run dev` in a second window. It keeps running until you stop it.
- **Locating.** CANDY's team locates the finished slice against the matrix. Their `locate\` folders are theirs, so leave them as they are. Hand off in one code block: repo path, HEAD, matrix id, PLAN, SESSION, MANIFEST, QUIRKS, and the Verify commands. After each lift, update SESSION, PLAN column 3, and MANIFEST together, and hand off again with the new HEAD.
