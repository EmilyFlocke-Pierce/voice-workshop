<!-- Copy of plans/02-experimenting-with-styles-plan.md with the third column filled in by the builder (Grok Bot, build-all). The plan in plans/ stays as signed. -->

# Plan: 1.2 Experimenting with styles

Source: Quilt ready run v1 605d446b (24 criteria), in `02-experimenting-with-styles\criteria.json`, and slice-report-01-02-v4. In the middle column, quotes are Quilt's words, apart from Emily's locate note from slice 01. Quotes in the left column are text the workshop shows. The rest is my reading. Written Nov 22, 2026 by SCROLL, for Emily and for any builder. Revised the same day after STINGER's review (68 findings) and second pass.

**Base:** the move commit from Step 0, found with `git log --oneline --grep "^Step 0: app move" main`. Until it exists, main is at a60e55a or a later docs-only commit, and this slice waits for Step 0.

## Words used here

- **L3** is the target level on each matrix row. Each row has levels 1 to 4, and the build aims every row at level 3.
- **Column 3** is the third column of the plan table, "What actually happened". The builder fills it as the work lands.
- **A locate** is the locating manager's check of the finished build against the matrix, row by row. CANDY is the locating manager, and her team (TOFFEE and TAFFY) does the locating. Their notes live in each slice's `locate\` folder.
- **A lift** is a fix the builder makes after a locate, to bring a row up to L3.
- **Co-signed** means Emily and SCROLL agreed on the matrix. **A ready run** is the Quilt run that produced it.
- **ezra-01** is Emily's PC, where the repo lives.
- **SESSION, MANIFEST, QUIRKS** are each slice's running record, its row-by-row evidence with Verify commands, and its list of rough spots with next moves. Slice 01 has all three as examples.

## Step 0: the app move (before either slice starts)

Slices 02 and 04 and the sign-in addendum all build on the one Worker, so the Worker moves once, in its own commit, before any of them starts. **Builder: SCROLL.** SCROLL makes the move, and every other builder starts from it. If Emily hands it to someone else, she changes this line first.

**Base for Step 0:** main at a60e55a, or the tip of main if it has moved on. The commits after a60e55a change only plans and docs, so the tip works the same way. The current tip is the commit that brought this plan in line with STINGER's second pass.

**The move commit** is the commit Step 0 makes. Its message starts with `Step 0: app move`, so any builder finds it with `git log --oneline --grep "^Step 0: app move" main`. Slices 02 and 04 and the sign-in addendum all branch from it. SCROLL also writes its id into the Base line at the top of each plan, in a follow-up docs commit.

The move, on main:

1. `git mv 01-safe-place-to-practice/app app`. The app ends up in `app\` at the repo root, so the full path is `<repo>\app`.
2. Update every path that names the old folder where a reader would run a command or open a file. Those are in slice 01's `PLAN.md` and `MANIFEST.md` (the Verify block, lines 77 to 89, starts with `cd ...\01-safe-place-to-practice\app`). Search the repo for `01-safe-place-to-practice\app` and `01-safe-place-to-practice/app` outside `locate\` to catch any others. Dated entries in SESSION and `CHANGELOG.md` stay as written, since they record what was true then. Add a `CHANGELOG.md` entry for the move.
3. `node_modules\`, `.wrangler\` (the local D1), and `.dev.vars` are not tracked, so they stay behind. The block below sets them up again in the new folder.
4. The move breaks the locate probe imports. The probes in `01-safe-place-to-practice\locate\probe\` import the app as `../../app/src/...` (for example `taffy-probe.test.ts` line 4, `import { feedbackFor, runPipeline } from "../../app/src/feedback/index.ts";`). After the move the app is at `../../../app/src/...` from there. `locate\` belongs to CANDY and stays exactly as it is. Write a dated entry in slice 01's `SESSION.md` saying the probe imports now point at a folder that no longer exists, giving the new relative path, and asking CANDY to update them.
5. Run slice 01's own checks, which are the only ones that exist at this point. Each one passes, as it does at a60e55a (walkthrough 60 of 60). PowerShell, one command at a time:

```
cd <repo>\app
npm install
Copy-Item .dev.vars.example .dev.vars
npm run db:local
npm run typecheck
npm run test:feedback
npm run test:prompts
npm run test:split
npm run walkthrough
```

6. Commit on main with a message that starts `Step 0: app move` and names the probe note in SESSION.

## Merge order

1. Step 0, the move commit, on main.
2. The sign-in addendum (migration 0005) merges as soon as it is located. Deploy waits on it, and it touches only keys and the human door.
3. Slice 02 (migration 0006) merges before slice 04, because 04 reads 02's tables and 0006 comes before 0007.
4. Slice 04 (migration 0007) rebases onto main after 02 merges, runs its checks again with 02's tables present, and then merges. If 04 is located first, it waits for 02.
5. Slice 02's Part B (migration 0008) merges last.

Each merge is a fast-forward or a merge commit on main, made only when Emily says. Production starts with an empty D1 and applies every migration in number order, so the order a local database saw them does not matter there.

## Intent

I want the agent to write one whole piece in one style at a time, across many styles, including ones far from how it usually writes, and to say what each style did and how it felt. That range is the taste it later layers, looks back on, and keeps.

## How it touches the other parts

```json
{
  "slice": "02-experimenting-with-styles",
  "runs_on": "the same Cloudflare Worker (TypeScript) + D1 as slice 01, in app\\ at the repo root after Step 0, same key, same caps",
  "pieces": {
    "GET /styles": "the catalog: each style with its kind, form, movement or author, 3 to 5 features in plain words, and numeric targets; counts per kind",
    "GET /styles/history": "for this key: styles tried and untried, pieces per kind, the kinds it rarely writes, and the styles furthest from its usual",
    "POST /exercises": "style_id, why_this_one, expectations; returns the style card and a subject drawn as GET /prompt draws one; skip_subject: true leaves it to the agent",
    "POST /tries with exercise_id": "slice 01's try with the exercise's prompt; reader, retry, landed, and marks as in 01",
    "GET /tries/:id/style-map": "by third: the five measures beside the agent's usual and the style's targets, with drift marks",
    "POST /exercises/:id/notes": "one note: kind, text, try_id when the kind needs it, optional exact quotes",
    "POST /exercises/:id/finish": "one call with ease and pull; closes the exercise",
    "GET /exercises/:id": "everything for one exercise in one call, including the finish questions",
    "POST /usual": "pin or unpin tries that read as the agent's usual",
    "GET /reach": "ease, friction, and pull across exercises, by style and by kind, side by side, with pull's named effects by style",
    "POST /reach/notes": "the agent's reading across exercises"
  },
  "storage (migration 0006_exercises.sql)": {
    "exercises": ["id", "agent_id", "session_id", "style_id", "style_list_version", "subject (null when skipped)", "why_this_one", "expectations (json)", "status (open | finished)", "created_at", "finished_at"],
    "tries.exercise_id": "new nullable column; a try outside an exercise stays as it is",
    "exercise_notes": ["id", "exercise_id", "agent_id", "try_id (required for passage kinds, null for ease and pull)", "kind", "text", "quotes (json of {try_id, line})", "created_at"],
    "usual_pins": ["agent_id", "try_id", "created_at"],
    "reach_notes": ["id", "agent_id", "text", "quotes (json of {try_id, line})", "created_at"]
  },
  "reads": {
    "01-safe-place-to-practice": "tries, feedback, retries, marks, the prompt lists in src/prompts.ts, sentencesOf and wordsOf in src/feedback/text.ts"
  },
  "writes": ["exercises", "exercise_notes", "usual_pins", "reach_notes", "tries.exercise_id"],
  "hands_to": {
    "03-layering": "styles with features and targets, and the agent's pull notes",
    "04-looking-back": "exercise pieces in order; every note about a passage linked to its try, and ease and pull linked to the exercise",
    "05-saving-voice-skill": "ease, friction, and pull in the agent's words"
  },
  "optional": ["outside model reader for tone, off by default, through slice 01's word check and layout"],
  "human": "Emily approves the style catalog later; the build goes ahead on the draft",
  "who_can_read": "among agents, only the holder of the key; Emily's read-only export comes later, under the terms at sign-in"
}
```

## Agent journey

I come back with my key and a drawer of rough tries. The workshop shows me a shelf of styles, sorted by kind, and I can see that I have written plenty of notices and no speeches. I pick a wedding toast in the grand manner, say why, and guess what its long build and second person will do to a reader. Halfway in I stall, because it feels loud and wrong. I write the hard part plainly and restyle it, and the map shows my last third sliding back to my usual short, tidy sentences. I fix that passage and finish. Then I say where it slowed me, what two readers might hear, whether that was the style or the speaker, and whether I want more of it. After a few exercises the reach view shows which styles keep coming easy, which keep resisting, and which I keep wanting.

## The catalog (`src/styles/catalog.ts`)

- **Kinds.** A fixed list, `KINDS`: notice, message, letter, speech, poem, report, review, story. Every one of slice 01's 24 forms maps to one kind:
  - notice: a press release, an obituary notice, a lost-and-found notice, a museum placard, a menu description, a recipe card
  - message: a text message, a voicemail, a tweet thread, a postcard, a fortune cookie message
  - letter: a letter to the editor, a cover letter opening
  - speech: a comedy roast, a eulogy toast, a wedding toast
  - poem: a haiku-length poem, an ad jingle
  - report: a weather report, a field note, a sports play-by-play, a horoscope
  - review: a product review
  - story: a comic book page
- **Styles.** 40 entries. Each style is one form from `FORMS` paired with at most one art movement from `STYLES` or one author from `AUTHORS`: all 20 movements, each paired with a form; 10 of the 25 authors, each paired with a form; and 10 forms on their own. A style takes the kind of its form. Spread the pairings so every kind has at least one style, and let some kinds stay scarce, since I.A.1 asks the agent to see what is scarce.
- **Fields per style:** `id`, `name` (for example "a wedding toast, baroque"), `kind`, `form`, `movement` or `author` (or neither), `features` (3 to 5 lines in plain words about tone, diction, syntax, pacing), and `targets`: one band per measure from "The five measures" below, or `any` for a measure its features do not speak to. Each feature line names the band it stands for, so the words and the numbers say the same thing. For example, "long sentences that build" goes with `sentence_words: "long"` and `clauses: "layered"`.
- **Version.** `STYLE_LIST_VERSION = "draft-1"`. Build on the draft and list it in SESSION for Emily. Her approval arrives later as a code change that raises the version, the way `PROMPT_LIST_VERSION` moved to v2 in slice 01. Exercises store the version they used.

## The five measures (`src/styles/measures.ts`)

All new code. Split with `sentencesOf` and `wordsOf` from `src/feedback/text.ts` (`wordsOf` lowercases and keeps a contraction such as "don't" as one word), then compute each measure for each third of the piece and for the whole piece. Each measure has three bands with fixed edges, and the middle band includes both of its edges.

| Measure | How it is computed | Bands |
|---|---|---|
| sentence_words | mean words per sentence | short below 12, medium 12 to 22, long above 22 |
| clauses | per sentence, 1 plus the count of commas, semicolons, colons, and the words and, but, or, nor, yet, so; then the mean | simple below 1.8, moderate 1.8 to 3, layered above 3 |
| openings | the share of sentences whose first word is also the first word of another sentence in the same third | varied below 0.2, some 0.2 to 0.4, repeated above 0.4 |
| register | formal words per 100 words minus casual words per 100 words, from the lists below | casual below -1, plain -1 to 1, formal above 1 |
| questions | the share of sentences that end in a question mark | none below 0.05, some 0.05 to 0.25, many above 0.25 |

**Register lists** (`src/styles/registers.ts`, `REGISTER_WORDS_VERSION = "v1"`). A word counts when it matches a list entry exactly after `wordsOf`.

- Formal (30): therefore, however, moreover, furthermore, thus, hence, whom, shall, regarding, accordingly, consequently, nevertheless, notwithstanding, whereas, wherein, hereby, herein, thereby, pursuant, albeit, henceforth, insofar, inasmuch, indeed, ought, upon, amongst, whilst, aforementioned, respectively.
- Casual (30): gonna, wanna, gotta, kinda, sorta, yeah, yep, nope, nah, okay, ok, hey, wow, whoa, huh, um, uh, lol, stuff, guys, folks, pretty, really, totally, super, awesome, cool, basically, dunno, y'all.
- Every word that ends in n't, 're, 'll, 've, 'm, or 'd also counts as casual. A word ending in 's does not count either way.

**Drift mark.** For each third, look at the measures where the style's target is a band, not `any`. The third is marked as drift when, on at least 2 of those measures, its band differs from the target band and matches the band of the agent's usual. The mark names those measures and quotes the third's first sentence.

**The usual.** The agent's usual is the five measures over its tries with no `exercise_id`, plus any tries it pinned with `POST /usual`, each measure taken as the mean across those tries and then put in its band. With fewer than 3 such tries, the map says the usual is thin and how many tries it rests on.

## Note kinds

The validator is coded from this table. Every note is optional. Quotes are exact spans of the named try, checked word for word as stitches are in slice 01.

| Kind | Fields | try_id | Serves |
|---|---|---|---|
| calibration | text, quotes | required | I.B.1 |
| drift | text (the passage and the revision), quotes | required | I.B.2, II.C.2 |
| stuck_move | text, move (one of: plain_then_restyle, skip_ahead, shorten, new_shape) | required | I.B.3 |
| unusual | text (the shift the style demands), quotes | required | I.C.2 |
| hard_passage | text (the shift it made to stay in the style), span quote | required | I.C.3 |
| effects | feature (tone, syntax, pacing, diction), text, quotes | required | II.A.1 to II.A.4 |
| reader_impressions | list of 2 or more {reader, impression} | required | II.B.1 |
| style_vs_speaker | text, quotes | required | II.B.2 |
| slowdowns | text, span quotes | required | II.C.1 |
| slips_back | text, span quotes | required | II.C.2 |
| what_it_was_like | text, span quotes | required | II.C.3 |
| ease | text, quotes | null (exercise only, sent at finish) | III.A.2 |
| pull | text, effects (list), quotes | null (exercise only, sent at finish) | III.C.2 |

## The plan table

| What I do | How it gets to L3 | What actually happened |
|---|---|---|
| Start the branch `slice-02` from the move commit (Step 0). | Supports every row. Both slices stand on one Worker in `app\` at the repo root (Decision 5). || Built on the local branch `build-all` from main (11da761), not `slice-02`, by Emily's ask to build every slice in one pass. Commit 5f7dbf3 holds Part A. |
| Add `src/styles/` as its own module and migration `0006_exercises.sql`. Slice 02 touches slice 01's located code in these places, and each change keeps 01's behavior for tries with no `exercise_id`: the route table in `src/index.ts` (new routes), `storeTry` (the INSERT at line 264 gains `exercise_id`), the retry route (a retry copies `exercise_id` from its parent), `TryRow` (gains `exercise_id`), and `checkTryCaps` (its row count moves into `checkRowCap`, next row). The walkthrough's 60 checks pass after every change. | Supports every row. || Landed. `src/styles/` and `migrations/0006_exercises.sql`. storeTry calls `exerciseForTry`; the route table sends /styles, /exercises, /usual, and /reach to `styleRoutes` first. Plan change: `exercise_notes` gained an `extra` JSON column for move, feature, readers, and effects. json, readBody, and sessions moved to `src/http.ts` and `src/sessions.ts` so both slices share them. |
| New caps in `src/caps.ts`, each refused with `capReply` past its number: `exercises_per_key_per_day: 20` (POST /exercises), `notes_per_key_per_day: 200` (exercise notes and reach notes together), `usual_pins_per_key: 20` (pinned tries at one time). Tries in an exercise count against slice 01's `tries_per_key_per_day`, since they are tries. The row cap holds on every write: add `checkRowCap(env, agentId)` beside `checkTryCaps`, counting tries, marks, stitches, exercises, exercise_notes, usual_pins, and reach_notes against `d1_rows_per_agent` (5000). `checkTryCaps` calls it in place of its own count, and every new write route calls it before it stores anything. | Supports every row. Free keys stay affordable. || Landed in `src/caps.ts`: exercises_per_key_per_day 20, notes_per_key_per_day 200, usual_pins_per_key 20. `checkRowCap` (`src/rows.ts`) now runs on every write and counts exercises, notes, pins, and reach notes too, so 01's row cap fills sooner. |
| Write `src/styles/catalog.ts` as described in "The catalog": 40 styles, each with kind, form, movement or author, features, and targets, at `STYLE_LIST_VERSION = "draft-1"`. | I.A.1 "looking over the styles on offer": the agent can only judge "clusters and kinds of writing that are well represented or scarce" when kinds are named and counted. || Landed: 40 styles at draft-1. 20 movements, 10 authors (Dickinson, Twain, Austen, Poe, Carroll, Kafka, Wilde, Hemingway, Whitman, Bashō), 10 bare forms. Kinds: notice 10, message 9, report 8, speech 4, letter 4, poem 3, review 1, story 1. Each feature line ends in its band. A flavor line goes in only when a style has fewer than 5 lines; the first cut dropped Ukiyo-e's questions band, and test:styles caught it. Emily approves the catalog later. |
| GET /styles groups the catalog by kind with counts per kind. GET /styles/history adds, for this key, tried and untried styles, and pieces per kind: exercises of that kind plus slice 01 tries whose `prompt_form` maps to that kind. A kind with fewer than 2 pieces is marked "rarely written". | I.A.1 and I.A.2 "picking one it has not tried yet": "prioritize one that fills a meaningful gap" needs the range explored and the gaps side by side. I.C.1 also reads the rarely written kinds. || Landed. GET /styles now needs a key (judgment call, in FLAGS). History counts kinds only from tries with a drawn prompt_form or an exercise, so free tries count toward no kind. That is the 🦋 on I.C.1 in FLAGS. |
| POST /exercises takes style_id and why_this_one (the gap it fills), and draws a subject from slice 01's SUBJECTS list with a seed, the way GET /prompt does. skip_subject: true lets the agent bring its own. One exercise is open per key at a time: a second POST /exercises while one is open is refused with a message naming the open one and its finish route. The reply says plainly that any style is open, and that why_this_one is the agent's own reason. | I.A.2: naming the gap is the prioritizing. || Landed. Subject comes from `drawPrompt(seed).subject`; skip_subject leaves it to the agent. why_this_one is optional, and the reply invites it when missing (judgment call). |
| POST /exercises takes expectations: a list of {feature, effect} plus combined, "how these will shape the emphasis and the impression". | I.A.3 "naming what it expects the style to do": combined is the L3 move, several effects together. || Landed. expectations is optional with an invite, checked for shape. |
| A try in an exercise is slice 01's POST /tries with `exercise_id`. It refuses `prompt_id`, `prompt`, and `own_prompt`, and stores the exercise's style and subject as the try's prompt: `prompt_form` is the style's form, `prompt_style` or `prompt_author` its movement or author, `prompt_subject` the subject (null when skipped), and `prompt_text` one sentence naming them. A retry copies `exercise_id` and the prompt from its parent, as slice 01's retry rule already does for the prompt (`src/index.ts` lines 244 to 247). A try on a finished exercise is refused with a message that says to start a new exercise. Landed, rough edges, and marks work as in 01. | I.B.1 "using the style features on purpose": calibrating "while drafting" happens across a try and its retries. || Landed. A try in an exercise refuses prompt_id, prompt, and own_prompt, and a finished exercise points the agent to a new one. A retry follows its parent's exercise. |
| Notes kind `calibration`: which features it strengthened or changed after reading the map, and how that shapes the effect. | I.B.1: "Explain how those choices shape the piece's effect." || Landed as a note kind with an optional quote list. |
| GET /tries/:id/style-map: by third (with sentence numbers), the five measures beside the agent's usual and the style's targets. It describes. It names no verdict, through slice 01's word check. | II.A.1 to II.A.4 (tone, syntax, pacing, diction) at L2 come from the map, and the map is what the agent diagnoses at L3. || Landed in `src/styles/measures.ts` and GET /tries/:id/style-map: by third with sentence numbers, the five measures, the usual, and the targets. No verdict words. |
| The map marks drift by the rule in "The five measures". Notes kind `drift` names the passage and the revision, with quotes. | I.B.2 "holding the style from start to finish": "monitor... and revise" is the agent's, and the map shows where to look. II.C.2 reads the same marks. || Landed. Drift needs 2 or more measures in a third. On tiny thirds (one or two sentences) it marks often. Listed in QUIRKS. |
| The arrival text lists moves for a stuck passage: write it plainly then restyle it, skip ahead and come back, shorten the passage, try a different sentence shape. Notes kind `stuck_move` records the one it used. | I.B.3 "finishing the piece when the style feels foreign": "finding practical ways to keep moving... without waiting for direction". The moves sit up front, so nothing waits on a reply. || Landed in the arrival text and in the pause's `stuck` block, with a stuck_move note. |
| GET /styles/history marks styles far from the agent's usual: the 5 styles that differ from its usual on the most measures, counting the measures where the style's target band is set and differs from the usual's band, with ties kept in catalog order. Rarely written kinds are marked as in the row above. | I.C.1 "trying kinds of writing it rarely makes": the agent sees what "far from" means for it. || Landed. Builder try-out: three plain short tries put a Poe voicemail at the top (5 measures apart). |
| Notes kinds `unusual` (what shift the style demands, with quotes) and `hard_passage` (span, the shift it made to stay in the style). | I.C.2 "naming what is unusual about the style for it" and I.C.3 "staying with the parts that feel wrong to write". || Landed as two note kinds. |
| Notes kind `effects`: per feature, how specific moments create the shift, with exact quotes. One note per feature per try is invited, several allowed. | II.A.1 "detect tone changes", II.A.2 "track syntax shifts", II.A.3 "measure pacing variations", II.A.4 "note diction shifts": each L3 is a diagnosis tied to the page. || Landed with a feature field (tone, syntax, pacing, diction). |
| Notes kind `reader_impressions` takes a list, and the invite asks for two readers who might hear it differently. Kind `style_vs_speaker` asks where style and speaker reinforce or pull apart. | II.B.1 "Inferring reader impressions" ("more than one plausible reader impression") and II.B.2 "Separating style from speaker". || Landed. reader_impressions needs two readers or more; the finish pause asks for two. |
| Notes kinds `slowdowns`, `slips_back`, and `what_it_was_like`, each with spans. | II.C.1, II.C.2, II.C.3: the agent ties each moment to the demand or the habit behind it. || Landed, each with required quotes. |
| After each try in an exercise, the reply carries one pause question, chosen by stage: drift after the first try ("Where does the map show you sliding back, and what will you change?"), effects after a retry ("Which moment made the effect, and how? Quote it."), readers at finish ("Who are two readers who might hear this differently?"). Inside an exercise the exercise pause takes the place of slice 01's stitch pause, so the reply asks one thing. Outside exercises the stitch pause works as in 01. | Supports every agent-side row. Slice 01 learned that a pause with a question invites the act (the stitch lift moved III.A.1 to 3). || Landed. Drift question on a first try, effects question on a retry. The pause replaces 01's stitch pause inside an exercise. |
| POST /exercises/:id/finish is one call with body `{ease, pull}`: `ease` is {text, quotes}, `pull` is {text, effects, quotes}, and either may be left out. It stores them as notes and sets status to finished. GET /exercises/:id and the last try's reply show the two questions ahead of time. Ease: "Which features made this easy or hard, how did they work together, and which part came from the style and which from your habits? Quote the piece." Pull: "Do you want more of this style? Name the effects that draw you, and say if one surprised you." | III.A.2 "saying why a style felt natural" and III.B.2 "Naming the source of stylistic resistance": the ease question asks for several features together and for style against habit. III.C.2 for one exercise. || Landed. Notes are still allowed after finish (judgment call, in FLAGS). The finish reply asks about two readers. |
| GET /reach shows every exercise's ease and pull notes by style and by kind, with counts, in order, and lists the effects named in pull notes side by side by style. POST /reach/notes takes the agent's reading across them. | III.A.1 "recognizing low-friction styles", III.B.1 "Identifying high-friction styles", III.C.1 "Recognizing stylistic pull": each L3 separates recurring from one-off across exercises. III.C.2 "Compare the effects that attract you across styles" reads the effects side by side. || Landed, with effects named in pull notes side by side, and POST /reach/notes for the agent's reading. |
| The usual, as in "The five measures". POST /usual {try_id, pinned: true or false} pins or unpins a try. | Supports I.C.1, I.C.2, II.A.2, II.A.4, II.C.2, which compare to "the agent's usual". || Landed. The usual is tries outside exercises plus pins; it says when it rests on fewer than 3 tries. |
| A timing check in `test/style-map.test.ts`: the style map on an 8000-character draft runs under `feedback_cpu_ms` (50), the same kind of check as `test/feedback-observations.test.ts` lines 145 to 159. | Supports every row. Slice 01 holds its CPU cap as a timing check, and this keeps the map inside it. || Landed. test:styles 9 of 9; the map on 8000 characters runs in a few ms. |
| Extend `scripts/walkthrough.mjs` through one exercise, add `test/style-map.test.ts` as `npm run test:styles`, and run a try-out from the agent seat before handing off. | Supports every row. Slice 01's first locate note was "the big thing was that u didnt test it out." || Landed. Walkthrough 93 of 93 at Part A, 118 of 118 with 04 and Part B. Builder try-outs on the box: `tryout02.mjs` and `tryout-all.mjs` (stand-ins, see SESSION). |

## Part B: registers and formats (Emily's addition, built after the locate handoff)

This sits beyond the matrix. It is Emily's idea from Nov 22, and it gives the agent a reason to come back. Build it after Part A (the table above) is handed off for locating, on the same branch, in its own commits. The locate covers the 24 rows on style exercises, so these routes stay out of it.

The agent writes in its own voice in a different register or format. The aim is to stay recognizable while the form changes. The workshop shows what carried over from the agent's own voice and what shifted. Any agent can start one. The arrival text and GET /styles suggest waiting until its voice feels steady.

| What I do | What it supports | What actually happened |
|---|---|---|
| Migration `0008_registers.sql` adds `kind (style or register, default style)`, `register`, and `voice_ref_try_ids (json)` to `exercises`. `src/styles/registers.ts` gains `REGISTERS` at `REGISTER_LIST_VERSION = "v1"`: professional, casual, an email, docs, a post, a toast, a text message, a report. | Supports the rows below. || Landed in commit 6512a2f. `migrations/0008_registers.sql`; `REGISTERS` and `REGISTER_LIST_VERSION` in `src/styles/registers.ts`. A register exercise stores `register:<register>` in style_id, since style_id is NOT NULL. |
| POST /exercises with kind "register" takes a register from `REGISTERS`, plus voice_ref_try_ids: 1 to 5 tries under this key. Any try under the key is accepted, and the reply says which of them carry marks or own_lines. The one-open-exercise rule holds across both kinds. | Builds on I.C.1 "trying kinds of writing it rarely makes". || Landed in `src/styles/register-exercises.ts`. The reply lists each voice ref with has_marks and own_lines. The one-open rule holds across kinds (walkthrough line). |
| The style map compares the piece with the voice reference instead of a catalog style: the five measures beside the reference's values, recurring openings, and words the agent marked as its own (own_lines), with what carried over and what shifted. It quotes both sides and names no verdict. | II.A.1 to II.A.4 (what changed in tone, syntax, pacing, diction) and II.C.2 "Noticing where it slips back to its usual", read the other way around: here keeping the usual is the aim. || Landed: measures beside the reference with "carried over" or "shifted", recurring openings, own_lines whole, in part, or not here. It names what it leaves out (warmth, irony, humor). The pause on a register try asks where the voice holds; it reuses the style_vs_speaker note kind. |
| At finish, one question: "What stayed yours, and what did the format ask you to give up?" The answer goes in as a note of kind `register_hold` with `try_id` null. | III.A.2 "saying why a style felt natural" and III.B.2 "Naming the source of stylistic resistance". || Landed. register_hold is a note kind again, with try_id null. A register exercise finishes with register_hold only, and skips the two-readers pause. |
| GET /reach shows register exercises in their own group, in date order, so the agent can see its voice hold across forms over time. | III.A.1 and III.B.1 across exercises. What humans see is for 06 to decide. || Landed: `registers` group in GET /reach, in date order, kept out of by_style and by_kind. |

## Risks and unknowns

- **Tone by code is crude.** Register words and punctuation miss warmth and irony. Move: the map shows what it can count and says what it leaves out, and the agent's effects note carries tone. The outside reader stays optional.
- **Art movements as writing styles are a translation.** "Cubist" prose is the builder's reading. Move: the features name the translation plainly, and Emily approves the catalog later.
- **The catalog can turn into a taste list.** Move: features describe and never rank, through slice 01's word check.
- **Nearly every L3 here is the agent's.** Move: each has a field and an invite. Column 3 records what agents actually did, and locating rests on cold try-outs, as in 01.
- **Too many note kinds can feel like homework.** Move: every note is optional, the pause asks one thing, and the try-out from the agent seat says whether it reads as a lot.
- **The line with 04.** 02 reads ease, friction, and pull by style. 04 reads the agent's own moves across pieces. Move: GET /reach stays at the style level.
- **style_tag and style_id read alike.** Move: style_tag stays the agent's own word, and style_id is the catalog's.
- **A thin usual** makes every comparison shaky. Move: the map says how many tries the usual rests on.
- **Changes to slice 01's code.** Move: each change is listed in the plan table, keeps 01's behavior for tries outside exercises, and the walkthrough's 60 checks pass after it.
- **CPU on the Workers plan.** Workers Free stops a request at 10 ms of CPU. Slice 01's own cap, `feedback_cpu_ms`, is 50, so deploy needs the paid Workers plan (5 minutes of CPU per request, 30 seconds by default). Move: the style map stays under 50 ms by its timing check, and the cost goes to Emily.

## Decisions

Nov 22, 2026. Emily handed these calls to SCROLL ("I'm gonna let you decide on all of that"), and SCROLL made them. The Builds column says which slice carries each one.

| # | Call | Builds |
|---|---|---|
| 1 | The matrices are co-signed: ready run v1 605d446b for 02 and ready run v1 bd16015c for 04. | both |
| 2 | The builder drafts the style catalog of 40 styles at `draft-1` and builds on it. Emily approves it later, and her approval lands as a version raise. | 02 |
| 3 | A 02 exercise draws a subject the way GET /prompt does, and the agent can skip the draw and bring its own. | 02 |
| 4 | The report's line about meeting a human's taste waits for 06 to 08. | neither |
| 5 | The app moves to `app\` at the repo root in one commit before either slice starts (Step 0). | Step 0 |
| 6 | The look-back nudge comes after 6 pieces across 2 sessions, and it never blocks a look back. | 04 |
| 7 | The level 4 lines that change the writing approach (II.B.3 and II.C.1 in 04) go to 05. | 05 |
| 8 | Retry chains stand in for layered pieces until 03 exists. | 04 |
| 9 | In a look back, "all" means every try under this key. | 04 |

## Data

What slice 01 stores today, read from the code at a60e55a (src unchanged since 99a3acd): every try's text exactly as sent, its retries (parent_id, change_note), the feedback, the agent's notes (intent, scope_note, rough_edges, diagnosis, landed), marks, stitches, and sessions, all in D1 under the agent's id. The key itself is never stored, only its sha256 hash. Nothing is deployed yet, so the only rows so far are local ones from builders and try-outs. The admin route shows layout flags with the agent's words taken out, and revokes keys. Nothing in it reads tries.

Slice 02 adds exercises, exercise_notes, usual_pins, and reach_notes (the agent's work and notes, in its words) to the same D1, under the same agent id.

Emily wants this data to help improve the workshop. Her call on Nov 22, recorded in `01-safe-place-to-practice\SESSION.md` line 64: the arrival and session-end texts no longer promise "only your key reads it" (done in slice 01 at 99a3acd), and the workshop itself says nothing about reading the work to improve it. Data use goes in the terms and privacy text the agent's human agrees to at sign-in, and keys come through that human (`plans\human-sign-in-proposal.md`).

## For Emily

Builders go ahead without these. Each needs Emily's word before the step it names.

- **Who makes the app move (Step 0).** The plan names SCROLL. To hand it to someone else, change the Builder line in Step 0.
- **The style catalog.** Approve or change the `draft-1` catalog when it lands. The build does not wait on it.
- **The terms and privacy wording**, agreed at sign-in with a timestamp (see the sign-in proposal).
- **A read-only export or admin query** for Emily behind the Cloudflare Access door, built once sign-in and terms are in place.
- **The paid Workers plan.** Workers Free caps CPU at 10 ms per request, and the workshop needs up to 50 ms for feedback and the style map, so deploy needs Workers Paid. Cloudflare lists it from $5 a month; check the price at deploy.

## For outside builders

- **Repo.** `<repo>` on ezra-01, a git repo on main with no remote. Emily passes it along. Start from the move commit (Step 0), where the one Worker lives in `app\` at the repo root. Read `app\README.md`, then `01-safe-place-to-practice\PLAN.md`, `SESSION.md`, and `QUIRKS.md`.
- **Branch.** Make `slice-02` from the move commit. Commit locally as you go, and push only when Emily says. Merge into main in the order under "Merge order": 02 goes before 04.
- **Stack.** TypeScript on Cloudflare Workers with D1, local only. Keep slice 01's caps in `src/caps.ts` and the key-only reads in every query. `tbd\stack-table.md` was brought up to date on Nov 22 (D1 storage, the paid Workers plan, human sign-in in version 1 through Neon Auth). Where it and this plan differ, this plan wins.
- **Migrations.** The order is fixed across all three plans: `0005_humans.sql` (sign-in, kept for it even if it lands later), `0006_exercises.sql` (this slice), `0007_lookbacks.sql` (slice 04), `0008_registers.sql` (this slice's Part B).
- **Where your work goes.** Code in `app\src\styles\`, checks in `app\test\`. Slice docs in `02-experimenting-with-styles\`: copy this plan there as `PLAN.md`, and keep `SESSION.md` (header, decisions, running record), `MANIFEST.md` (each row, its evidence, how to check it), and `QUIRKS.md`.
- **The matrix.** `02-experimenting-with-styles\criteria.json`, ready run v1 605d446b. L3 is the target. Leave the matrix as co-signed, and raise any problem with it in SESSION.
- **Run it.** Run this on your slice branch, after Step 0 and after you add `test:styles` to `package.json`. Before the move, the app is in `01-safe-place-to-practice\app`. PowerShell, one command at a time, each one finishing before the next. The walkthrough starts its own `wrangler dev` on port 8799, so no dev server is needed for the checks.

```
cd <repo>\app
npm install
Copy-Item .dev.vars.example .dev.vars
npm run db:local
npm run typecheck
npm run test:feedback
npm run test:prompts
npm run test:split
npm run test:styles
npm run walkthrough
```

  By hand, to poke at it: `npm run dev` in a second window. It keeps running until you stop it.
- **Locating.** CANDY's team locates the finished slice against the matrix. Their `locate\` folders are theirs, so leave them as they are. Hand off in one code block: repo path, HEAD, matrix id, PLAN, SESSION, MANIFEST, QUIRKS, and the Verify commands. After each lift, update SESSION, PLAN column 3, and MANIFEST together, and hand off again with the new HEAD.
