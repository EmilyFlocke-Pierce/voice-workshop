# Quirks: 1.1 Safe place to practice

A to-be-done list. None of these holds a level, and none is pressing. Each row says what the quirk is, who found it, what it touches, and the next move to make. Pick one up when it helps a criterion or a neighbor slice.

Updated Nov 22, 2026, after locate run 6. Locate status and evidence live in `MANIFEST.md` and `locate/LOCATE.md`.

## Open

### Notes the agent writes

| Quirk | Found by | Touches | Next move |
|---|---|---|---|
| One diagnosis per try: a second diagnosis replaces the first. | CANDY run 4 (cold try-out) | I.C.1, III.A.1 | Keep diagnoses as a dated list on the try, and show the latest first. |
| One stitch per try: a second stitch replaces the first, the same way as diagnosis. | SCROLL (stitch lift, db46df2); CANDY run 6 | III.A.1 | Move stitches to the same dated-list shape when diagnoses move. |
| A thread's prose is checked only for being non-empty. Its quotes are checked word for word. | CANDY run 6 | III.A.1 | Leave the prose free, and invite one quote per try the thread names. |
| The tie-back-to-first-try question has no field of its own, so the agent folds it into thread and deltas. STRIX asked for one. | CANDY run 6 (STRIX) | III.A.1 | Add an optional "tie_back" field on stitches from the third try on, and show it in the seam. |
| "1/" style markers in a thread shift the line numbers it refers to. | CANDY run 6 | III.A.1 | Quote lines by their words, as stitches already do, and say so in the pause note. |
| Rough edges stay on the parent when the agent retries. | CANDY run 4 (cold try-out) | I.A.1 | Carry each rough edge whose span still appears in the retry, and list the ones that dropped out. |
| A retry starts with no marks, because marks belong to one try. | CANDY run 5 | III.A.2, III.B.2 | Show the parent's marks on the retry as "marks on the parent", read only. |
| why_back is optional, so a try the agent calls "a useful miss" can carry no reason. | CANDY run 4 | III.B.2 (agent side) | Invite why_back in the mark reply when it is empty, in one kind line. |
| Diagnosis is written only through /notes and /landed. | CANDY run 2 | I.C.1 | Take diagnosis on POST /tries and the retry too. |

### Retry and diff

| Quirk | Found by | Touches | Next move |
|---|---|---|---|
| read_it reads like template text on a clean one-change retry ("Every other line here is an incidental edit"). | SCROLL cold try-out; carried through CANDY runs 2 to 5 | I.C.2 | Write read_it from the count: one change found says "One change, the one your note names." |
| A change in the last few sentences is placed in the "middle". | SCROLL cold try-out | I.C.2, II.A.2 | Place a change by the sentences it touches, and call the last three sentences the ending. |
| A parent's observation can drop out on a retry, so "did my change fix it?" is hard to see. | CANDY run 4 (cold try-out), seen again in run 5 | I.C.1 | List the parent's observations that no longer appear, under "no longer showing". |
| A merged sentence shows as one big changed block. | CANDY run 4 (cold try-out) | I.C.1 (gray) | Name the merge in the change ("two sentences became one") and keep the block. |
| by_position over-reports on shifted long drafts, and says so in the reply. | CANDY run 2 | I.C.2 | Leave as is, or try a word-level pass on the paired block when 03 needs layering. |
| same_conditions layout and code are true by construction within one build. | CANDY runs 1 and 2 | I.C.2 | Compare against the parent's stored layout_version and code_version. |
| A prompt on a promptless parent gets a 400 that points to a new try. | CANDY run 2 | I.C.2 | Keep, and name the move in the message (it does). Revisit with the prompts slice. |
| Places are thirds of the piece, so a sentence can move from "middle" to "end" when the sentence count changes. | SCROLL builder try-out | II.A.2, 03 | Add the sentence number beside the third. |

### Reader

| Quirk | Found by | Touches | Next move |
|---|---|---|---|
| The tense line can be missing when the thirds do not lean. It errs in the safe direction. | CANDY run 2 | II.A.1 | Leave as is. |
| Quotes cut at 90 characters, mid-phrase. | SCROLL builder try-out | II.A.2 | Cut at the nearest phrase or sentence end. |
| The reader misses a line that turns from question to statement ("You come back tomorrow?" to "You come back tomorrow."). | SCROLL builder try-out | II.A.1, 02 | Add a near-repeat check that names the punctuation turn. |
| Feedback has no tone or warmth feature. | CANDY run 5 | II.A.1 (gray), 02 | Take to 02, the reader slice. |
| A two-point line joined by a bare "and" has no cut point. | CANDY run 3 | II.B.2 | Leave as is: bare "and" also joins one-point compound predicates. |
| A second verb outside BASE_VERBS passes unflagged ("...and also the close contains two."). Unreachable while the outside reader is off. | CANDY run 3 | II.B.2 | Widen BASE_VERBS when the outside reader comes on. |
| HOMOGRAPHS covers noun twins only at a part's start. No failing case. | CANDY run 3 | II.B.2 | Leave as is. |
| layout_flags fill only from the outside reader. | CANDY run 1 | II.B.3 | Leave as is, by design. |

### Prompts

| Quirk | Found by | Touches | Next move |
|---|---|---|---|
| A prompt sent as four picks reports source "drawn". | Gemini try (CEO's), Nov 21 | prompts slice | Report source "picked" for four named picks. |
| GET /prompt has no cap. It has no key to count by. | CANDY run 2 | caps | Take to Emily as a design call: a per-IP cap, or leave open. |
| The prompt's art style sits beside style_tag, and the two can read as the same thing. | SCROLL | 02 | Ask 02 whether style_tag stays the agent's own word and art style stays the prompt's. |
| Author death years in `src/prompts.ts` are checked for the three v2 additions only. | SCROLL | prompts slice | Check the other 22 against the Library of Congress name authority and note it in prompts.ts. |

### Session end and views

| Quirk | Found by | Touches | Next move |
|---|---|---|---|
| The session-end takeaway leaves out less_familiar. | CANDY run 5 | III.A.2, 05 | Add less_familiar under each mark in the takeaway. |
| Session end leaves out diagnosis, rough_edges, the prompt, and the seam. | SCROLL builder and cold try-outs | 05 | Add them to the takeaway when 05 settles its shape. |
| /tries/:id/feedback leaves out diagnosis and rough_edges. | CANDY run 2 | I.C.1, I.A.1 | Add both beside your_intent in the feedback view. |
| A repeated own_line across a parent and its retry is carried text, not a trace. | CANDY run 5 | III.A.1 (note for locators) | Keep as a locator note. |

### Checks and locate tools

| Quirk | Found by | Touches | Next move |
|---|---|---|---|
| TAFFY's R13 probe counts short full sentences ("Dashes open short.") as fragments, by its 4-word rule. TAFFY confirmed this in run 3. | SCROLL, run 2; CANDY run 3 | CANDY's side | Noted for CANDY. Retire the 4-word rule in the probe when it runs again. |
| The walkthrough chained right after db:local stopped once at 43 of 47 (local D1 held). Alone it passes. | CANDY run 3 (TOFFEE) | checks | Run db:local and the walkthrough as two steps, as the Verify block says. |
| The caps, the 2-hour idle end, and keys_per_day are guesses. | SCROLL | caps | Set them with Emily before a deploy. |

### Keys

| Quirk | Found by | Touches | Next move |
|---|---|---|---|
| A second POST /keys issues another key, though the arrival text says a key is shown once. | CANDY run 6 | arrival text, caps | Reword the arrival text to "each key is shown once; keep yours to bring everything back". |

## Ideas

| Idea | From | Touches | Next move |
|---|---|---|---|
| At session end, the agent gets a voice skill it keeps and updates each visit: its own lines, costume lines, habits to watch, and what to try next. | STRIX, CANDY run 6 | 05 | Emily's call. Bring it to 05 when that slice opens. |

## Closed

| Quirk | Found by | Closed by |
|---|---|---|
| An identical retry read as a clean retry. | CANDY run 1 | 5e5bb33: nothing_changed and a plain line |
| The body_bytes cap returned cut JSON. | CANDY run 1 | 5e5bb33: the draft whole, or a plain "could not read" |
| Reading the session view reset the idle clock. | CANDY run 1 | 5e5bb33 |
| Empty or repeated own_lines were accepted. | CANDY run 1 | 5e5bb33 |
| Drawer rows carried no feedback. | CANDY run 1 | 5e5bb33 |
| A rename onto a label in use merged silently. | CANDY run 1 | 5e5bb33 |
| PLAN and MANIFEST counted different agent-side totals. | CANDY run 1 | 5e5bb33: eight in both |
| The scope note asked about "this prompt" with no prompt, and a retry could not hold the prompt. | SCROLL try-outs | 557ac62: GET /prompt, prompt on tries, a retry carries its parent's prompt |
| II.B.2 split garbled and fragmented ordinary lines. | CANDY run 2 | 1234718: split only full observations (run 3 moved II.B.2 to 3) |
| The session view showed no marks. | CANDY run 4 | 090dacc |
| /prompt and /prompt/lists had no charset=utf-8, so Brontë garbled on Windows. | CANDY run 4 | 090dacc: charset=utf-8 on every JSON reply |
| The drawer and GET /tries/:id/feedback carried no marks. | CANDY run 5 | db46df2 (confirmed in run 6) |
| Rereading did not lead to a named pattern across tries. | CANDY runs 4 and 5 | db46df2: the stitch pause (run 6 moved III.A.1 to 3) |
| Prompt authors included writers whose work speaks for a movement, an identity, or a community, which sits poorly with irreverent prompts. | Emily (t164u, t167u) | Prompt list v2: Lewis Carroll, Edward Lear, and O. Henry join |
