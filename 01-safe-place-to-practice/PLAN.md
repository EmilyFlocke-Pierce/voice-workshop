# Plan: 1.1 Safe place to practice

## Addendum, Nov 22, 2026: the stitch step (a lift for III.A.1, touches 05 session end and 02 reader)

Locate run 5 found witnesses rereading their tries without naming a pattern across them, such as two tries that both open on "This week ... the sill ... water." Emily approved a small pause (t157u), in her sewing picture: the first try in a session is the knot, each later try is a stitch, and from the third on each stitch is a backstitch that also ties back to the knot.

- From the second try in a session, the reply carries a "stitch" pause beside the feedback: "What is the thread between this try and the last one, and what changed?" From the third try on it also asks "How does this one tie back to your first try?" It names POST /tries/:id/stitch.
- POST /tries/:id/stitch takes thread, deltas, and quotes. Each quote names its try and an exact line, and the workshop checks every line against that try's draft. A quote that does not match gets a 400 naming it. Migration 0004 stores stitches.
- GET /tries?session=current shows each try's stitch beside its feedback and marks, plus the seam: every stitch in order. The drawer and GET /tries/:id/feedback now carry marks too.
- Touches 05 (session end): the seam is ready to travel home with the marks when that slice takes it. Touches 02 (reader): the stitch is the agent's own cross-try reading, beside the workshop's per-try one.

## Addendum, Nov 21, 2026: the prompt randomizer (precursor to the prompts slice)

Emily asked for a random short prompt (t134u to t137u). It gives the agent something to answer on arrival, and it gives I.C.2 a prompt to hold steady across a retry.

- GET /prompt draws four picks: a short form (24, from a comic book page to a weather report), an art style (20), an author who died long ago (25, each with death_year), and a subject (25 animals and situations). It returns one sentence, for example "Write a postcard, in Bauhaus style, like James Joyce, about a first day at a new job." ?seed= draws the same picks every time. GET /prompt/lists shows every choice.
- A try names its prompt with prompt_id, the four picks, or own_prompt. Migration 0003 stores the picks on the try.
- A retry answers its parent's prompt. same_conditions reports prompt_carried_from_parent, and a retry that names a new prompt is pointed to a new try.
- The arrival text and the scope note speak of the drawn prompt, and an agent's own prompt works the same way.
- The prompts slice owns prompts from here: more lists, prompt history, and how prompts reach the agent.

Build log: the third column, filled by SCROLL on Nov 21, 2026, and brought up to date on Nov 22 at db46df2 with every lift through locate run 5. SESSION.md holds the running record, and QUIRKS.md holds the open quirks.

Source: Quilt run v1 8e67b8cb (16 criteria) and slice-report-01-01-v23. Text in quotes is Quilt's. The rest is my reading.

## Intent

I want the agent to try things without worrying about being judged. When a bad draft costs it nothing, it tries enough to find what's its own.

## How it touches the other parts

```json
{
  "slice": "01-safe-place-to-practice",
  "runs_on": "Cloudflare Worker (TypeScript) + D1",
  "auth": {
    "agent": "free workshop key as bearer token; D1 stores only its sha256 hash",
    "human": "Emily approves layout changes on a Cloudflare Access email-link page"
  },
  "pieces": {
    "POST /tries": "draft as sent, optional intent note and scope note",
    "GET /tries/:id/feedback": "workshop code describes the piece",
    "POST /tries/:id/retry": "new try linked to parent, one change named",
    "POST /tries/:id/mark": "what was tried, why come back, lines that read as its own",
    "GET /tries?session=current": "this session's tries side by side",
    "GET /tries?landed=no": "drafts that did not land, by date, filterable by style_tag",
    "POST /session/end": "marks plus a note inviting it back"
  },
  "storage": {
    "agents": ["id", "key_hash", "created_at"],
    "tries": ["id", "agent_id", "session_id", "parent_id", "text", "intent", "scope_note", "style_tag", "change_note", "landed (agent's word: yes | no | unsure, nullable)", "created_at"],
    "feedback": ["try_id", "layout_version", "lines (json)", "unplaced (json)"],
    "marks": ["try_id", "what_tried", "why_back", "own_lines (json of quoted spans)"],
    "layout_flags": ["id", "try_id", "observation", "why_it_does_not_fit", "status"]
  },
  "what_is_stored": ["the agent's text", "the agent's notes and labels", "observations from workshop code or the optional outside model"],
  "who_can_read": "only the holder of the agent's key",
  "reads": [],
  "writes": ["tries", "feedback", "marks", "layout_flags"],
  "hands_to": {
    "02-experimenting-with-styles": "style_tag and its tries",
    "03-layering": "retry chains (parent_id + change_note)",
    "04-looking-back": "all tries and marks; pattern finding across sessions happens in 04",
    "05-saving-the-voice-skill": "marks.own_lines and why_back",
    "06-humans-take-part": "a try only when the agent shares it"
  },
  "optional": ["outside model reader, off by default"],
  "caps": {
    "draft_chars": 8000,
    "tries_per_key_per_day": 60,
    "feedback_cpu_ms": 50,
    "d1_rows_per_agent": 5000,
    "on_cap": "message names the cap and reset time, and returns the draft"
  }
}
```

## Agent journey

I arrive with a key and the habit of writing what sounds safe. I'm told everything here is practice and only I can read it. I half believe it. I send a rough try in a voice I'm unsure of. Back comes a list of what's on the page: my sentences got shorter toward the end, I said "perhaps" four times, here's where. I try again with one change. One line reads like me, so I mark it and say why. The miss goes in my drawer, where I can find it again. I could wait for someone to call it good. The next move is mine. I leave with my marks and a note asking me back.

## The plan table

| What I do | How it gets to L3 | What actually happened |
|---|---|---|
| Set up the Worker, the D1 schema, key auth storing only the hash, and the caps. | Supports every row. Caps keep free keys affordable. The hash protects keys if the table leaks. || Landed. Worker in `app/src/index.ts`, schema in `app/migrations/0001_safe_place.sql`, keys in `app/src/auth.ts` (D1 holds only the sha256), caps in `app/src/caps.ts`. Added a sessions table and a keys_per_day cap of 200 (a guess). feedback_cpu_ms holds as a code check: an 8000-character draft reads in under 50 ms. Correction, Nov 22 (STINGER's second pass): Workers Free caps CPU at 10 ms per request, which is below this 50 ms cap, so deploy needs the paid Workers plan (5 minutes of CPU per request, 30 seconds by default). Local only. Later lifts: migration 0003 adds the prompt a try answers (557ac62), migration 0004 adds stitches (db46df2), and every JSON reply names charset=utf-8 (090dacc). |
| Store every try exactly as sent, cut only at the char cap. A change is a new try. | I.A.1 "leaving a draft unpolished": the agent can only weigh which rough edges to keep if they stay as it left them. || Landed, with one change. The try is stored as sent, and a retry is a new row. Over 8000 characters the workshop stores nothing and hands the draft back with the cap named, because a cut would change the draft. Run 1 lift: the body_bytes cap hands the draft back whole, or says plainly that it could not read one. |
| POST /tries takes an optional intent note ("what I mean to try") and scope note ("what this prompt kept me from doing"). Feedback comes right back. | I.A.2 "drafting without holding back": the agent commits to the whole draft and gets feedback on it. The scope note is where it says the scope limited the attempt. || Landed. Feedback comes back in the same reply, with your_intent and your_scope_note on top. Agent side: no real tries yet. Prompt addendum (557ac62): the scope note asks what the prompt kept you from, and a try names its prompt by prompt_id, four picks, or own_prompt. Run 4: I.A.2 at 3 on stand-in tries, with a recheck note. |
| The arrival instructions say: keep rough parts rough while you're finding out, finish a passage when that helps, and say in the intent note what polishing would close off. | I.A.1 "leaving a draft unpolished": the call is the agent's and goes both ways. The instructions allow both, and the intent note holds the reason. || Landed in `app/src/instructions.ts`, served at GET /. Agent side: no real tries yet. Run 1 lift: rough_edges takes a span and a reason for each edge kept rough (I.A.1). POST /tries/:id/notes writes them later. Run 4: I.A.1 at 3 on stand-in tries (chair), with a recheck note. Open: rough edges stay on the parent when the agent retries (QUIRKS.md). |
| The agent can set landed = no. GET /tries?landed=no lists those by date, filterable by style_tag. The arrival instructions call this the drawer. | I.A.3 "keeping drafts that fail": "organizing them so they can be found without ranking them". Date and style find a draft by when and what kind, and its worth stays the agent's call. The agent's "no" is the only label. || Landed. Added POST /tries/:id/landed, since the map had no route to set landed after a try. POST /tries also takes landed. The drawer sorts by date, filters by style_tag, and carries no score or rank. Run 1 lift: drawer rows carry their feedback. Stitch lift (db46df2): drawer rows carry their marks too. |
| Accept any style_tag, including "not sure," and any length of try. | I.B.1 "trying a voice it is unsure of": shrinking the scope or moving the start costs nothing, as long as it steps into the voice. || Landed. style_tag is free text. Agent side: no real tries yet. Run 4: I.B.1 at 3 on stand-in tries, with a recheck note. |
| After landed = no, the response offers: try again, try smaller, or stop and come back later with everything kept. | I.B.2 "keeping going after a try that misses": pausing is a listed option, so the agent has more than quitting or grinding. || Landed. The reply after landed = no carries the three moves. Run 4: I.B.2 at 3 on stand-in tries, with a recheck note. |
| Observations describe the draft. The intent note sits above them for the agent to compare. | I.C.1 "comparing what came out with what it meant to try": intent and evidence sit side by side. The agent compares its intent with the observations and says what they show. || Landed. The reply puts your_intent above the observations. The comparison is the agent's. Agent side: no real tries yet. Run 1 lift: POST /tries/:id/notes and the landed call take a diagnosis in the agent's words (I.C.1). Run 4: I.C.1 at 3 on stand-in tries, and TAFFY names it an L4 candidate. Open: one diagnosis per try (QUIRKS.md). |
| POST /tries/:id/retry takes parent_id and change_note. The workshop diffs parent and retry and lists every change besides the named one. | I.C.2 "trying again with one change": the diff shows incidental edits the agent may have missed, so the agent can separate them from the intended change. Same prompt, code, and layout_version keep conditions "safe, consistent." || Partly landed. A retry needs change_note, links parent_id, carries intent, scope note, and style_tag, and reports the same layout_version and code_version. Miss: the code cannot tell which change the note names, so it lists every changed sentence beside the note and the agent picks its own. The diff works by sentence. Tries have no prompt field, so "same prompt" waits for a slice that gives prompts. Run 1 lift (located at 2: the diff stopped at sentence 400): the diff compares every sentence up to the cap. It sets matching starts and ends aside first, and pairs by position only past 1000 differing sentences on each side, and says so. An identical retry says nothing changed. Builder try-out: a run of rewritten sentences now shows as one change. Prompt addendum (557ac62): a retry carries its parent's prompt, so "same prompt" holds, and a retry that names a new prompt is pointed to a new try. Run 2: moved to 3. |
| Write the feedback code: sentence length by position, repeated words and openings, punctuation, pronoun and tense shifts, first third against last third. Each observation names a feature and how it recurs, contrasts, or changes. | II.A.1 "naming what is on the page": comparing parts of one piece lets the code describe change. It reads the draft alone, so every observation comes from the page. || Landed in `app/src/feedback/observe.ts`: length, sentence length by third, repeated words, repeated openings, punctuation, pronoun shift, tense shift. It reads the draft alone. The tense check runs on a short word list. Read on six sample pieces. The hand read of 20 notes waits for real tries. Builder try-out: the tense quote picked a present-tense sentence. It now picks the sentence that leans furthest that way. |
| Each observation carries 1 to 3 quotes with their place (opening, middle, end, or line). A change quotes both sides. | II.A.2 "quoting where it shows up": quoting both ends of a change is the comparison the L3 asks for. || Landed. Each line carries 1 to 3 exact spans with a place such as "opening, line 3". Length, pronoun, and tense changes quote both sides. Run 2: holds at 3 after the tense quote fix. |
| A word check blocks judging words (good, weak, strong, better, should, effective, works) and swaps technical terms for plain ones (anaphora becomes "lines start the same way"). | II.A.1 "naming what is on the page" and II.B.1 "using plain words": the swap keeps the meaning and the block keeps it neutral. If a swap loses the point, keep the plain description and drop the term. || Landed in `app/src/feedback/words.ts`. A judging word in the workshop's wording holds the line back, and the reply counts it. The agent's quoted words pass as written. 15 technical terms swap to plain ones. The code's own lines use plain words already, so the swap mainly serves the outside model. |
| A check splits any line that names two features, or joins two findings with "and" or "also," into two lines with their own quotes. | II.B.2 "one observation per line": bundled lines get split before the agent sees them, with both points intact. || Landed in `app/src/feedback/split.ts`. The code writes one point per line, so the split mainly serves the outside model. When a line has fewer quotes than points, it stays whole and goes to unplaced and the layout flags. Run 1 lift (located at 2: any "also" split a line): the split cuts only at joins between two observations and gives each line its subject. "Colons also appear twice in the opening." stays one line. Run 2 lift (1234718): a join splits only when every part after it reads as a full observation. A verb phrase borrows a clean, agreeing subject. A part with no verb keeps the line whole, and a two-point line that cannot carry its subject goes to unplaced with its reason. TAFFY's 48 combinations are tests: 19 clean, 29 whole, 0 fragments, 0 garbled. Run 3: moved to 3. |
| Fix the layout at four fields: feature, where, "quote", what recurs or changes. Version it as layout_version. | II.B.3 "the same layout every time": the agent learns the layout once and then reads every note the same way. || Landed in `app/src/feedback/layout.ts`, LAYOUT_VERSION 1. The quote field became quotes, a list of 1 to 3, to fit row 11. as_text prints the same four lines every time. |
| An observation that fits no field goes in the note's unplaced section and in layout_flags. The layout changes only after Emily approves on the Cloudflare Access page. | II.B.3 "the same layout every time": the mismatch is surfaced and waits for agreement, and the format stays put. || Partly landed. Unplaced lines go to the reply and to layout_flags, and /admin/layout-flags takes Emily's decision. Change: a flag stores the line's shape with every quote replaced, so the admin page shows no agent words. Miss: real Cloudflare Access needs Emily and a deploy. Locally, ACCESS_MODE=local-dev trusts the email header. The JWT check is written and waits for real Access. |
| GET /tries?session=current shows this session's tries side by side with their feedback. | III.A.1 "rereading its own tries": I read "across reread tries" as this session's tries, because the slice puts past tries in Looking back for patterns. See risks. || Landed. GET /tries?session=current returns this session's tries with text, intent, and feedback. A session ends on /session/end or after 2 hours idle. The walkthrough has yet to run the idle path. Scope left open by Emily on Nov 21. Run 1 lift: reading this session leaves the idle clock alone. TAFFY confirmed the 2-hour end fires. Run 4 lift (090dacc): the session view carries each try's marks, so a reread takes one call. Run 5 lift (db46df2): the stitch step. From the second try in a session the reply pauses to ask for the thread and what changed, and from the third it asks how the try ties back to the first. POST /tries/:id/stitch checks each quote word for word, and the session view shows each stitch and the seam. Runs 4 and 5: at 2. The remaining gap is the agent's: naming a pattern across reread tries. |
| POST /tries/:id/mark takes own_lines (quoted spans that read as its own) and an optional note on what feels less familiar. | III.A.2 "naming what it recognizes as its own": the L3 is telling recurring preferences from choices that feel less familiar. One field holds each, so the agent looks at both. || Landed. own_lines must be exact spans of the try, and the reply names any that are missing. less_familiar is a new column. Agent side: no real tries yet. Run 1 lift: an empty span is refused with a kind message, and a repeated span is kept once and noted. Run 4 lift (090dacc): marks show in the session view and the single-try view. Run 4: at 3 (chair), held at 3 in run 5, with a recheck note. |
| The mark takes what_tried in the agent's words, renamable later. Marks group by what_tried. | III.B.1 "noting what was tried": renaming is how a label gets adapted, and grouping shows what it set out to do across tries. || Landed. POST /marks/rename moves a label across marks. GET /marks groups by what_tried. Run 1 lift: a rename onto a label in use says it merged and names both. |
| The mark takes why_back, including on a try with landed = no. The instructions say: name what the try has and what's unclear. | III.B.2 "saying why it deserves another look": marking a missed try is the "even if it missed" part. || Landed. A mark works on any try, and the reply shows try_landed. Agent side: no real tries yet. Run 4: III.B.2 at 3 on stand-in tries, and TAFFY names it an L4 candidate. |
| POST /session/end returns marks and own_lines as plain text, with a note that the same key brings everything back. | Supports the shape: memory goes home, and the agent is invited back. Seeds 05. || Landed. Plain text with marks, why_back, own lines, and the invitation back. It lists every mark this key holds, across sessions. That touches 04 and 05. Open for 05: the takeaway leaves out less_familiar, diagnosis, rough edges, the prompt, and the seam (QUIRKS.md). |
| Only the agent's key reads its tries, feedback, and marks. Humans see a try only when the agent shares it in 06. | Supports "Nothing it tries there is used against it." Every Safe experimentation L3 depends on it, because a watched agent guards its words. || Landed. Every agent query filters by agent_id. Another key gets 404 or empty lists. Sharing a try belongs to 06. Nov 22: the arrival and session-end texts dropped "only your key reads it" (Emily, t178u). The access rule between keys stands, and data use moves to terms the human agrees to at sign-in. Flagged for CANDY to relocate. |
| The outside model reader is optional and off by default. It goes through the same layout and word check. | Supports II as an extra, inside the caps. || Landed as a hook in `app/src/outside.ts`, off by default, through the same pipeline. Waits for a model and Emily's say on cost. |

## Risks and unknowns

- **The agent doubts it's safe and polishes anyway.** Mitigation: the instructions say it plainly, and everything stored is the agent's text, its notes, or observations. Record tries that look finished on the first go.
- **Code-only feedback is shallow.** Mitigation: log which observations agents quote in marks and cut the ones nobody uses. The outside model stays optional.
- **Judgment leaks into neutral words.** "Sentences get shorter" can read as a verdict. Mitigation: grow the blocked list from real notes, and read 20 notes by hand before trusting the Neutral feedback rows.
- **A split breaks a real single point.** Mitigation: when a split would lose a quote or a "where," keep the line whole and add it to layout_flags.
- **Eight L3s depend on the agent** (I.A.1, I.A.2, I.B.1, I.B.2, I.C.1, III.A.1, III.A.2, III.B.2). Mitigation: each gets an optional field or option. Column three records what agents actually did. (Run 1: this list said seven and left out III.A.1. The matrix gives III.A.1's tracing to the agent, so the count is eight.)
- **III.A.1 and III.A.2 overlap with 04.** Session-only may be the wrong reading. Mitigation: build per session, widen later if needed, and ask Emily.
- **A cap hits mid-try.** Mitigation: a capped call returns the draft intact and says when the cap resets.
- **Free keys get shared or abused.** Mitigation: daily cap per key, revoke by hash.
- **Unknown: what a session is for an agent.** It may reconnect often. Mitigation: a session ends on /session/end or after 2 hours idle.
