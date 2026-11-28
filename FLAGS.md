# Flags

First written in the build-all pass (Grok Bot, Nov 25, 2026). That work is merged into `main` and public at v0.1.0. Later entries name the run that found them.

Criteria stay as written, and the build meets each row on every honest reading. A 🦋 is a take in writing: what the locators found, how I read the row, what the build does to meet it, and why. CANDY, the locators, or Emily can answer with how they saw it. A recut through a builder note happens only if a row is really bad, and only with Emily's co-sign.

## 🦋 Real finds

**02, I.C.1 "trying kinds of writing it rarely makes."** Found in the build-all pass, and it shares a root with I.A.1 and I.A.2 below. "Usual range" in the L3 reads two ways: the agent's measured habits, and the kinds it has written. A free try counts toward no kind, so every kind shows as rarely written at first.

How I read it: both readings are honest, so the build meets both. History shows styles far from the measured usual, and kinds the agent has rarely written, plus `far_in_rarely_written_kinds` so a far style in a rare kind still shows. The exercise reply's `for_you` names the kind as familiar or rarely written, and how far the style sits from the usual. The agent then reorients in `why_this_one` or the first try's intent, and finishes a piece whose thirds hold the style. Why: the row asks the agent to meet a kind far from its usual range; showing both senses of "usual" lets it pick a kind that is rare for it, a style that sits far from its habits, or both. CANDY relocated this row on `e5bf7c3` (locate run 2 of batch 02-B) and found it holds under the current wording as written; the batch closed at 3/3 L3*.

**02, I.A.1 "looking over the styles on offer" and I.A.2 "picking one it has not tried yet."** Found by TAFFY in CANDY's run 1 (02-A). "Well represented or scarce" and "gap" read two ways: coverage of the catalog (`counts_per_kind`), or the agent's own practice (`rarely_written`, `far_from_your_usual`).

How I read them: both are honest. I.A.1 asks the agent to assess the range, including clusters and kinds that are well represented or scarce; the shelf shows `counts_per_kind` (the catalog) beside `rarely_written` and `far_from_your_usual` (its practice). I.A.2 asks it to prioritize an untried style that fills a meaningful gap in its practice, set beside what the catalog offers; history lists untried styles, rarely written kinds, and styles far from the usual, and the exercise reply keeps any style open while `for_you` names how the pick sits for this agent. Why: the agent can see a scarce kind in the catalog and a scarce kind in its own practice at the same time, and pick from either.

**02, I.B.2 "holding the style from start to finish."** Found by TOFFEE in run 1. The map marked drift only when a third returned to the usual's band on 2 or more measures, so a third that left the style for a band that was neither the style's nor the usual got no mark.

How I read it: the L3 asks the agent to monitor passages that drift from the chosen style, in any direction, and revise them. "Back to the usual" is one honest case, not the only one. What the build does: a third is marked when 2 or more set measures sit away from the style's target. The mark names which of those sit back in the usual's band and which sit elsewhere. The first-try pause asks where the map shows a third leaving the targets, back to the usual or elsewhere. The original back-to-usual case still marks, and a new case marks a third that leaves for another band. Why: "drift from the chosen style" is the row as written; naming the direction tells the agent what to revise toward.

**02, I.C.2 "naming what is unusual about the style for it" and I.C.3 "staying with the parts that feel wrong to write."** Found by TOFFEE and TAFFY in CANDY's run 1 of batch 02-B. Both L3 sentences ask for a diagnosed or sustained shift in approach. The notes carried only free text, so a diagnosed shift and a described feature looked the same, and the notes were never asked for.

How I read them: I.C.2 asks the agent to diagnose the shift the style demands and to show it in the piece; I.C.3 asks it to make that shift and carry it through a hard passage. The build meets that with an optional `shift` field on both notes (a short phrase in the agent's words), required quotes so the diagnosis sits on words in the piece, and invites in the pause, the map, and the arrival text. A retry's map reads each earlier hard passage's third beside the style's targets. Why: the field makes the shift visible without changing the row; quotes keep the diagnosis on the page; the invites ask for the notes the locators found missing. CANDY relocated both rows on `e5bf7c3` (locate run 2 of batch 02-B) and closed them at L3*.

**02, II.A.2 "track syntax shifts", II.A.3 "measure pacing variations", II.A.4 "note diction shifts."** Found by TOFFEE in CANDY's run 1 of batch 02-C. The matrix names cues the five measures do not compute: II.A.2 names clause order, sentence construction, and fragments; II.A.3 names paragraph breaks, pauses, and event density; II.A.4 names specificity and imagery. The measures count sentence length, clause punctuation, repeated openings, register words, and questions.

How I read them: the L3s ask the agent to diagnose those patterns from the piece, not for the measures to count every cue. The map says what it counts and what it leaves out, including that the clause count reads no nesting. The agent names the cues the code cannot count in an effects note, with exact quotes. Why: the row is a diagnosis from the page; the map is a helper that stays honest about its reach.

**02, II.A.1 to II.A.4, one effects kind.** Found by TAFFY in the same run. One `effects` note kind serves all four skills, and the `feature` field is its only feature-specific part. Each L3 asks something different: a purposeful turn against an unsupported fluctuation (tone), how patterns carry the voice (syntax), how shifts enact the structure (pacing), where words sustain and where they weaken (diction).

How I read it: one kind can serve four skills when each post names its feature and diagnoses in that skill's words. The pause and the map give one line per feature on what to diagnose, and list the features not yet noted, so a retry can reach past pacing. Why: the four L3s differ in the diagnosis, which lives in the agent's words; the feature field and the per-feature lines keep that difference visible without splitting the kind.

**04, I.A.3 "Gather reflection notes."** Slice 01 carries intent and scope_note from a parent to its retry, so one note sits on two versions.

How I read it: "attributed to the correct versions" includes notes that travel with a retry. The build keeps a carried intent or scope_note on both versions and marks it `carried_from_parent`, so the agent can see that it belongs to the parent and still applies to the retry. Why: a note that is true of both versions should show on both, with the carrying named, rather than looking like two separate notes or like a note that went missing.

## Look at together

**Stubs**
- Sign-in is a STUB.
  - Local runs: local-dev mode takes the email from an `X-Dev-Human-Email` header.
  - Neon mode answers 501. `verifyNeonJwt` returns null.
  - @neon/auth stays uninstalled.
- Terms text is a placeholder (`TERMS_VERSION = "placeholder"`).
- The /human page is inline HTML marked STUB.
- Key caps: 3 active keys per human and 3 a day. These are my numbers.
- POST /keys answers 403 outside local runs (`OPEN_KEYS=false` in wrangler.jsonc). check:deploy lists 4 holds before any deploy.
- The style catalog is draft-1, and the art-movement translations are my reading.

**Judgment calls: sign-in and 01**
- The arrival text's "Get a key" lines and the 401 text now name the human door.
- checkRowCap counts 02's and 04's tables, so one key's row cap fills sooner.
- POST /tries ignores a stray `parent_id`. Listed in 01's QUIRKS with a move.

**Judgment calls: slice 02**
- GET /styles needs a key.
- why_this_one and expectations stay optional, with an invite when missing.
- Notes still go in after an exercise is finished.
- `exercise_notes.extra` is a new JSON column, not in the plan.
- Part B: a register exercise stores `register:<register>` as its style_id.
- Part B: the register try's pause reuses the style_vs_speaker note kind.
- Part B: a register exercise skips the two-readers pause at finish.

**Judgment calls: slice 04**
- Three schema additions not in the plan:
  - `lookback_pieces.seq`
  - `pattern_revisions.instances`
  - a `lookback_writes` table for the daily write cap
- Exercise ease and pull attach to the exercise's last try in the corpus.
- An intent or scope_note equal to the parent's is marked carried_from_parent.
- Pulling a piece in rebuilds the audit, recurring, and dropped results.
- Near matches run on 4-word spans only, to stay inside lookback_cpu_ms.
- `lookback_chars: 400000`, a new cap.
  - 200 full-length pieces took about 2 s against the 1 s cap.
  - The new cap holds a lookback to about 50 full pieces, which take about 0.8 s on the box.
- III.A.3: the code cannot tell when two notes disagree. It shows them side by side, and the agent judges. This may belong in QUIRKS rather than the matrix.

**Judgment calls: the I.B.1 lift (run 1)**
- A `calibration` note now names one feature (tone, syntax, pacing, or diction) and takes an optional `did` of strengthened or changed. Before the lift it took text only.
- The invite sits beside the pause question and on the style map, so the pause still asks one question.
- A retry's style map lists the exercise's earlier calibration notes.

**Judgment calls: the 02-B lift (I.C.1 to I.C.3)**
- `unusual` and `hard_passage` take an optional `shift`: a short phrase naming the change in approach. It is small, free text, and optional, so a note without it still lands. It is the structured line between a diagnosed shift and a described feature.
- `unusual` now requires quotes, as `hard_passage` does, so every diagnosis sits on words in the piece. A near-usual style takes the same note with a lighter invite.
- Far from the usual means 3 or more measures apart, counted as GET /styles/history counts.
- The exercise reply carries `for_you`: the kind read as familiar (2 or more pieces) or rarely written, and how far the style sits from the usual.
- History adds `far_in_rarely_written_kinds`, so a far style in a rare kind shows even when a familiar kind holds the top five.
- A retry's map reads each earlier hard passage's third beside the style's targets. A span that covers several sentences takes the third holding most of them, the later one on a tie.
- The first-try pause's `unusual` invite appears only when the style is far, so near styles get no extra block in the pause. Their map still carries it.

**Judgment calls: the 02-C lift (II.A.1 to II.A.4)**
- Effects notes stay free text with the `feature` field. The verdicts the L3 sentences name (purposeful or wobble, carries or breaks, sustains or weakens) live in the note's own words.
- Effects quotes are required, and a note may hold several quoted lines, so a diction note can set a sustaining phrase beside a weakening one.
- The retry's pause carries `effects` beside its one question: features noted in this exercise, features not yet noted, and one diagnostic line per feature. The style map carries the same block on any try.
- The clause proxy is described in the map's `what_it_counts` and not changed, since the band edges are pinned by tests.

**02, II.B.1 "Inferring reader impressions."** Found by CANDY in run 1 of batch 02-D, with the row already at L3*. The `reader_impressions` kind takes no quotes, and it has no separate field for the style cue that leads each impression.

How I read it: the L3 asks the agent to evaluate more than one plausible impression and to explain how the style's cues may lead different readers to respond differently. That explanation lives in each reader's impression line, which already says what they might hear. The build keeps quotes off this kind and keeps the list of two or more readers as the structure. Why: the row is about more than one impression, which the list already holds. A cue field would repeat what a careful impression already names, unless a later locator finds impressions that never name a cue.

**02, II.C.2 "Noticing where it slips back to its usual."** Found by CANDY in the same run. The row had both a `drift` note (quotes optional) and a `slips_back` note (quotes required), with no clear split, and only drift was surfaced.

How I read it: I.B.2 asks the agent to monitor passages that drift from the style and revise them; II.C.2 asks it to diagnose what tends to prompt a return to familiar habits and how those moments affect consistency or effect. The build keeps both notes and states the split in the `slips_back` invite, on the map beside the drift marks: drift names the passage and the revision; `slips_back` diagnoses the prompt and the effect, with required quotes. Why: the two L3s are different acts, and naming the split lets the agent do both.

**Judgment calls: the I.B.2 lift (drift in any direction)**
- A third is marked when 2 or more set measures sit away from the style's target, the same threshold as before. Band edges are unchanged.
- The mark keeps `measures` as the full list, and names the direction in `back_to_usual` and `elsewhere`. Back to the usual is still one case.
- With no usual yet, every away measure is named as elsewhere, so a third that leaves the style is still marked.
- The first-try pause still asks one question, now covering both directions. II.C.2 still reads the back-to-usual marks.

**02, II.B.2, II.C.1, and II.C.3, free text and a structured field.** Found by CANDY in run 2 of batch 02-D, with all three rows at L3*. The diagnoses live in the note's own words: how a reader could mistake style for speaker (II.B.2), which demand or habit made a passage harder (II.C.1), and how attention and possibility moved across the whole piece (II.C.3). II.C.1's L2 also asks the agent to recall what was happening while writing, and II.C.3's L2 asks how the experience changed from beginning to end; both share the same `what_it_was_like` or `slowdowns` kind as their L3, with no extra field for that recall or that change.

How I read them: the L3s ask for a diagnosis in the agent's words, anchored in quotes from the piece. The build keeps that diagnosis in free text, with required quotes, and states in each invite what to name. Why: a structured field would only help if agents leave the diagnosis out of the text. The invites already ask for it, and the walkthrough posts it in the agent's words. A field can wait until a locator finds notes that quote a span and never diagnose.

**02, reach notes, free text and optional style_ids.** Found by CANDY in run 1 of batch 02-E. A reach note held free text and optional quotes, with no style_id and no structured verdict for which styles stay easy, which resist, or which pull.

How I read the rows: III.A.1, III.B.1, and III.C.1 ask the agent to assess patterns across a varied set in its own words. The build keeps that reading in free text, with optional quotes, and now takes optional `style_ids` so a note can name the styles it is about. There is no verdict field; the classification lives in the agent's words. Why: REACH_Q already asks which styles keep coming easy, which keep resisting, and which the agent keeps wanting, and which of those repeat. A structured verdict would only help if agents leave that classification out of the text.

**02, GET /reach and near or far from the usual.** Found by CANDY in the same run. GET /reach did not say whether a style sat near or far from the agent's usual (`apartFrom` / `FAR_AT`), even though the map already computes that, and III.A.1 cares about ease even when features feel unfamiliar.

How I read it: a varied set includes styles whose features feel unfamiliar, so /reach should show how each style sits beside the usual. The build now reports `from_your_usual` (`measures_apart`, `apart_on`, `far`) on each style in `by_style`, using the same `apartFrom` / `FAR_AT` the map uses, or null when there is no usual yet. Why: the agent can then use that fact in a reach note, instead of only seeing it inside a single exercise.

**Judgment calls: the 02-D lift (II.B.2, II.C.1, II.C.2, II.C.3)**
- `style_vs_speaker` now requires quotes, matching the plan table and the other notes in this batch, so the diagnosis sits on words in the piece. The Part B register pause already showed a quotes field in its body.
- `reader_impressions` does not check that two impressions differ. II.B.1 is already closed at L3*, so the validator stays as it is.
- The finish pause still asks one question (two readers). `style_vs_speaker` and `what_it_was_like` sit beside it, the way calibration and unusual sit beside the try pause.

**Judgment calls: the 02-E lift (III.A.1 to III.C.2)**
- `pull` quotes are required, and `finishQuestions()` now ships a quotes placeholder, matching ease and the other notes that ask to quote the piece. Ease quotes are required too, because III.A.2 asks for evidence from the piece.
- `pull` is named in `style-map.test.ts`, including the quotes check.
- GET /reach reports `from_your_usual` on each style, from `apartFrom` / `FAR_AT`.
- Reach notes take optional `style_ids` (or a single `style_id`). The reading itself stays free text. Unknown ids are refused.
- `by_style` / `by_kind` stay in creation-date order, and `pull.effects` stay verbatim, as logged quirks.

**04, notes whose try sits outside the corpus.** Found by CANDY in run 1 of batch 04-A, with the batch already at 4/4 L3*. In `buildCorpus()`, a note whose try is not among the scoped or pulled pieces is skipped, and it is not counted or flagged as unpaired.

How I read I.A.1 and I.A.3: the corpus is the pieces in scope, labeled, with the notes that belong to those pieces. A note written about a try outside that scope is not part of this review unless the agent pulls that try in or places the note on a piece that is in the corpus. The build keeps the skip, so the corpus stays scoped. Why: flagging every out-of-scope note as unpaired would mix the review with tries the agent did not include. The agent can widen the scope or pull a parent in. A flag can wait until a locator finds a note the agent expected to see and the corpus left it out with no trace.

**04, `parent_outside` checks one hop.** Found by CANDY in the same run. `parent_outside` is true when a piece's immediate parent is not in the corpus. An ancestor further up the chain that sits outside the scope is not flagged.

How I read I.A.2: the row asks the corpus to gather chained pieces and to surface a missing parent so the agent can pull it in. The one-hop check names the parent the piece points to, and `POST /lookbacks/:id/pull` brings that parent in. The chain root is still computed by walking the whole chain, so the corpus knows the chain even when an older ancestor is out of scope. Why: the pull offer is for the parent the piece is missing, which is one hop. Flagging every missing ancestor can wait until a locator finds a chain whose gap sits further up and leaves the review short.

**04, GET /compare and reflection notes.** Found by CANDY in run 1 of batch 04-B, with I.B.1 at L2*. GET /compare returned values and style tags, and no notes. Only the pattern view paired intent notes beside pieces, and no other reflection-note kinds entered either view.

How I read I.B.1: the row asks the agent to use the piece sequence and relevant reflection notes to support a comparison along a feature. The build now puts every reflection-note kind that belongs to a piece beside it on /compare (intent, scope_note, change_note, diagnosis, rough_edges, marks, stitches, and exercise notes), and names how the measure holds, rises, or falls along the sequence. The pattern view still lines up intent notes by style. Why: relevant notes are the ones already on that piece, of every kind that applies, not only intent. A diagnosis or a mark can support the comparison as much as an intent.

**04, the I.B.2 timeline after naming a pattern.** Found by CANDY in the same run, with I.B.2 already at L3*. The timeline (first appearance, gaps, returns, breaks after the first) sits on the pattern view, so it is reachable after the agent names a pattern (I.C.1).

How I read it: I.B.2 asks the agent to follow a repeated choice across the sequence, telling steady recurrence from variation, gaps, or changes over time. The build keeps the timeline on the named pattern, because a repeated choice is one the agent has named and given instances. Recurring candidates are already visible before a name, as candidates. Why: the row is about tracking a choice across the sequence; naming it is what makes that choice one thing to track. A timeline of unnamed candidates can wait until a locator wants to follow a candidate before naming it.

**04, I.C.1 instances and variation.** Found by CANDY in the same run, with I.C.1 already at L3*. Each instance is `{piece, quote}`, with no per-instance field for how the wording or form varies.

How I read it: I.C.1 asks the agent to name the underlying move and cite examples that show both its variations and its continuity. The build keeps variation in the inclusion rule and in the quotes themselves (several wordings under one name, checked word for word). Why: the quotes are the variations; a field would only help if agents cite examples and never say how they differ. The inclusion rule already invites that. A field can wait until a locator finds patterns whose quotes sit side by side with no account of the change.

**Judgment calls: the 04-B lift (I.B.1)**
- /compare carries every reflection-note kind that belongs to the piece, not only intent. Other kinds stay off the pattern view's `intent_notes_beside_it_by_style`, which still lines up intent by style (II.A.1).
- Along the sequence, each piece after the first is marked `holds`, `rises`, or `falls`, with a delta, and `along_the_sequence` says it in a short line.
- `compareAlong` is a pure function, so the unit check can hit values, shifts, and notes without D1.
- `measureOf` and `breaks_after_first` now have unit checks. The overlap of `COMPARE_MEASURES` and `SHAPE_NAMES` on closing length stays a logged quirk.


**04, only intent notes beside a pattern.** Found by CANDY in run 1 of batch 04-C, with II.A.1, II.B.2, and II.B.4 at L2*. Only intent notes sat beside a pattern (`intent_notes_beside_it_by_style`), while II.B.2 and II.B.4 ask for keep, change, and drop reflection notes as well.

How I read those rows: they ask the agent to weigh a recurring transition or structural move against notes about what was chosen, kept, changed, or dropped, citing pieces and notes. The build keeps `intent_notes_beside_it_by_style` and now also puts every reflection-note kind beside the pieces on the pattern view (`notes_beside_it_by_style`) and on recurring candidates (`notes_beside_pieces`), with ids. Why: relevant notes are not only intent. A change_note or a mark can tell keep versus drop as much as an intent can. The intent block stays so the earlier II.A.1 view is still there.

**04, no structured field for consistent versus style-dependent.** Found by CANDY in the same run, with II.A.1 at L2*. The consistent-versus-style-dependent split has no structured field.

How I read II.A.1: the row asks the agent to trace an intended choice across pieces in different styles, cite notes and passages, and distinguish what remains consistent from what changes with the style. The build surfaces passages and notes by style, plus a short `across_styles.reads` line that says whether the wording holds or changes with the style. There is no verdict field that grades consistent versus style-dependent. Why: that distinction is the agent's, from the notes and the passages. A structured verdict would only help if agents leave it out of their reading. A field can wait until a locator finds a case where the evidence is visible and the agent still cannot tell.

**04, notes on recurring candidates before a name.** Found by CANDY in the same run, with II.B.2 and II.B.3 at L2*. Notes only attached after the agent named a pattern (I.C.1).

How I read those rows: they ask the agent to check a recurring transition or a systemic redundancy against reflection notes, citing pieces and notes. The build now puts notes on recurring candidates, so the agent can weigh a candidate before naming it. The pattern view still carries notes after a name, with a timeline and a claim that can cite `note_id`. Why: a generic transition or a stock close can be weighed as a candidate; naming is still what makes it one pattern to claim about.

**04, no FLAGS.md in the slice folder.** Found by CANDY in the same run. `04-looking-back-for-patterns/FLAGS.md` does not exist at `98264b0`; slice 04 flags live in the root FLAGS.md.

How I read it: one living FLAGS file at the root is the right record, same as the other slices. The build adds a short pointer at `04-looking-back-for-patterns/FLAGS.md` that sends a locator to the root file. Why: a locator who looks in the slice folder should find the flags, without splitting the log into two files.

**Judgment calls: the 04-C lift (II.A.1, II.A.2, II.B.2, II.B.3, II.B.4)**
- Recurring candidates and the pattern view carry every reflection-note kind, not only intent. `intent_notes_beside_it_by_style` is kept.
- `across_styles.reads` states whether the wording holds or changes with the style. There is no verdict field for consistent versus style-dependent.
- `timeline().friction_point` connects the first appearance, the style shift against the previous piece, and the notes on that piece. Each timeline row also carries its notes.
- A default claim with `note_id` evidence and a counterexample no longer gets the asks prompt. The existing unsupported-claim check stays.
- `removed_move` now asserts `evidence` and `returns_in` (the fixture move is indirect and does not return). `breaks_after_first` is asserted in the structural case.
- Recurring items gained stable ids, and shape items gained occurrence quotes.
- Slice 04 still keeps its flags in the root FLAGS.md. The new slice-folder file is only a pointer.


**04, slice-02 extra fields left out of the lookback.** Found by CANDY in run 1 of batch 04-D, with II.C.1 at L1*. `loadRows` selected exercise notes without `extra`, so structured `pull.effects` and calibration fields never reached slice 04.

How I read II.C.1: the row asks the agent to weigh stated intent, effects in the writing, and drops or returns. Effects notes from slice 02 are part of that record. The build now selects `extra` and puts it on the note (and on `notesOn` / the corpus view), so pull effects and calibration fields sit beside the piece. The note's `text` stays as written. Why: those fields are how a pull or a calibration names the effect. Leaving them out would hide evidence the row asks the agent to weigh.

**04, function and future intent left off the page.** Found by CANDY in the same run, with II.C.1 and II.C.2 at L1*. `instructions.ts` documented POST /claims without naming `function` or `future_intent`, and GET /findings omitted both.

How I read those rows: they ask the agent to diagnose how a recurring choice functions, and to evaluate how strongly the record supports a future intent, including a conflict with a later revision or a drop that returns. The build already stored both fields. It now names them in the instructions, and findings print `function` and `future intent` when they are present. Why: a field the agent can send but never read back, and that the instructions never mention, will not get used. The walkthrough now posts both and checks the findings text.

**04, the thin-claim ask only ran on default.** Found by CANDY in the same run, with II.C.3 at L2*. `asks` fired only when `kind === "default"`.

How I read II.C.3: every kind of claim is a judgment that should weigh notes against rejections, removed moves, or a repeat that returns, and qualify the judgment where the record is unclear. The build keeps the existing default ask (notes and counterexamples). For taste, mixture, and unclear, a claim is asked to weigh the record when it has no note evidence, or when it has neither counterexamples nor rejections. Why: a thin taste or unclear claim needs the same pause as a thin default. The default wording stays, because that guard was already clean.

**04, no short definitions for the four claim kinds.** Found by CANDY in the same run. Taste, default, mixture, and unclear had no short definitions that separated mixture from unclear.

How I read II.C.3: the agent judges whether a choice reflects taste, default, or a mixture, and qualifies the judgment where the evidence is unclear. Mixture is when the record points both ways. Unclear is when the record is not enough to tell. The build now keeps those four short definitions as `CLAIM_KIND_MEANS`, on the claim view as `kind_means`, and in the instructions. Why: without that split, mixture and unclear collapse into each other. The definitions describe the record; they are not a verdict the code makes for the agent.

**Judgment calls: the 04-D lift (II.C.1, II.C.2, II.C.3)**
- `extra` sits on the note. The note text stays as the agent wrote it.
- Findings print `function` and `future intent` only when they are present, so earlier claims without those fields still read as they did.
- A default claim is still thin without notes or without counterexamples. Other kinds are thin without notes, or without both counterexamples and rejections.
- `checkCited` for rejections now uses the same error text as it accepts: a piece or a note_id, plus a quote. It does not require both.
- `kind_means` on a claim is the short definition for that kind. The full map is `kinds` on the POST reply.
- Unit checks cover `claimView`, `CLAIM_KINDS`, `notes_side_by_side`, `thinClaimAsk`, `checkCited`, `findingsText`, and exercise `extra`. The walkthrough hits POST /claims and GET /findings on the worker.

**04, the compare shift baseline is the previous piece.** Found by CANDY in run 2 of batch 04-B, with I.B.1 now at L3*. Each step of the compare is measured against the piece just before it, so a later piece that returns to an earlier value reads as a fall and then a rise.

How I read it: the compare walks the sequence in order and names how the measure holds, rises, or falls from the previous piece, with a delta at each step. That is a step-to-step shift, not a comparison to the first piece or to a single baseline for the whole body of work. A return to an earlier value will show as a fall and then a rise, even though the value has come back. Why: the walk is along the sequence, and the previous piece is the nearest neighbor on that walk. I am leaving the baseline as the previous piece. This is a take, not a change.

**04, relevance of reflection notes is unowned.** Found by CANDY in the same run, with I.B.1 now at L3*. compareAlong attaches every note on the piece; nothing in the build decides which notes are the relevant ones.

How I read it: I already put every reflection-note kind that belongs to the piece beside it on /compare, because a diagnosis or a mark can support the comparison as much as an intent. The code does not choose which of those notes are relevant. It shows them all and leaves the weighing to the agent. Why: relevance is a judgment, and I do not want the code to filter notes out of the comparison. This is a take, not a change.

**04, the friction point's style shift is the previous piece.** Found by CANDY in run 2 of batch 04-C, with II.A.2 now at L3*. The friction point names the style shift against the piece just before the first appearance, and it attaches every note on that starting piece.

How I read it: the friction point is where the repeat first shows up, and the style shift there is the change from the piece just before it. Every note on that starting piece sits beside it, so the agent can weigh what was happening at that moment. Why: the previous piece is the nearest neighbor at the start, and relevance is a judgment I do not want the code to make by filtering notes. I am leaving the baseline as the previous piece, and leaving every note attached. This is a take, not a change.

**04, across-styles leaves out styles where the move never appears.** Found by CANDY in the same run, with II.A.1 now at L3*. The read of whether wording holds or changes with the style comes from one instance per style that carries the move, and styles that never show the move are left out.

How I read it: `across_styles` names the styles the move appears in, and whether the wording holds or changes in those styles. A style where the move never appears is not in that set. The read is about the styles that actually carry the move, not a contrast against styles that never used it. One instance per style is what it uses to say whether the wording holds or changes. Why: the view is a cross-style look at the move as it appears, not a survey of styles that do not have it. I am leaving those absent styles out. This is a take, not a change.

**For CANDY**
- Six 01 rows (I.A.1, I.A.2, I.B.1, I.B.2, I.C.1, III.B.2) held in a builder stand-in after the arrival text changed. They need a cold relocation.
- `locate/probe/` imports need `../../../app/src/`. Three probes have stale shapes.
- Locate against the current wording. The 🦋 entries in FLAGS.md are takes, not proposed recuts. Builds already meet both readings for I.C.1, I.A.1, and I.A.2; I.B.2 now marks drift in any direction; I.C.2 and I.C.3 carry an optional `shift`; II.A.2 to II.A.4 leave uncounted cues to the agent's effects notes; 04 I.A.3 keeps carried notes on both versions.
- Batches 02-B (I.C.1 to I.C.3) and 02-C (II.A.1 to II.A.4) are closed at 3/3 and 4/4 L3* after their run 2 relocations. CANDY kept I.B.2 at L3* after a spot-check of `ece898c`, with no relocation round. Batch 02-D (II.B.1 to II.C.3) is closed at 5/5 L3* after run 2. Domain II is 9/9 at L3*. Batch 02-E (III.A.1 to III.C.2) is lifted after run 1 and waits for relocation. Batch 04-A (I.A.1 to I.A.4) is closed at 4/4 L3* after run 1. Batch 04-B (I.B.1, I.B.2, I.C.1) is closed at 3/3 L3* after run 2; I.B.1 moved from L2* to L3*, and I.B.2 and I.C.1 carry forward at L3*. Batch 04-C (II.A.1, II.A.2, II.B.1 to II.B.4) is closed at 6/6 L3* after run 2; II.A.1, II.A.2, II.B.2, II.B.3, and II.B.4 moved from L2* to L3*, and II.B.1 carries forward at L3*. Batch 04-D (II.C.1 to II.C.3) is located at 0/3 L3* after run 1; all three rows are lifted and wait for relocation at `1c12e28`. The rest of slice 04 waits for locating. Every agent-side row rests on builder stand-ins only.
