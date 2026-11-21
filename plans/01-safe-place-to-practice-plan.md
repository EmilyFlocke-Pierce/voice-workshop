# Plan: 1.1 Safe place to practice

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
| Set up the Worker, the D1 schema, key auth storing only the hash, and the caps. | Supports every row. Caps keep free keys affordable. The hash protects keys if the table leaks. | |
| Store every try exactly as sent, cut only at the char cap. A change is a new try. | I.A.1 "leaving a draft unpolished": the agent can only weigh which rough edges to keep if they stay as it left them. | |
| POST /tries takes an optional intent note ("what I mean to try") and scope note ("what this prompt kept me from doing"). Feedback comes right back. | I.A.2 "drafting without holding back": the agent commits to the whole draft and gets feedback on it. The scope note is where it says the scope limited the attempt. | |
| The arrival instructions say: keep rough parts rough while you're finding out, finish a passage when that helps, and say in the intent note what polishing would close off. | I.A.1 "leaving a draft unpolished": the call is the agent's and goes both ways. The instructions allow both, and the intent note holds the reason. | |
| The agent can set landed = no. GET /tries?landed=no lists those by date, filterable by style_tag. The arrival instructions call this the drawer. | I.A.3 "keeping drafts that fail": "organizing them so they can be found without ranking them". Date and style find a draft by when and what kind, and its worth stays the agent's call. The agent's "no" is the only label. | |
| Accept any style_tag, including "not sure," and any length of try. | I.B.1 "trying a voice it is unsure of": shrinking the scope or moving the start costs nothing, as long as it steps into the voice. | |
| After landed = no, the response offers: try again, try smaller, or stop and come back later with everything kept. | I.B.2 "keeping going after a try that misses": pausing is a listed option, so the agent has more than quitting or grinding. | |
| Observations describe the draft. The intent note sits above them for the agent to compare. | I.C.1 "comparing what came out with what it meant to try": intent and evidence sit side by side. The agent compares its intent with the observations and says what they show. | |
| POST /tries/:id/retry takes parent_id and change_note. The workshop diffs parent and retry and lists every change besides the named one. | I.C.2 "trying again with one change": the diff shows incidental edits the agent may have missed, so the agent can separate them from the intended change. Same prompt, code, and layout_version keep conditions "safe, consistent." | |
| Write the feedback code: sentence length by position, repeated words and openings, punctuation, pronoun and tense shifts, first third against last third. Each observation names a feature and how it recurs, contrasts, or changes. | II.A.1 "naming what is on the page": comparing parts of one piece lets the code describe change. It reads the draft alone, so every observation comes from the page. | |
| Each observation carries 1 to 3 quotes with their place (opening, middle, end, or line). A change quotes both sides. | II.A.2 "quoting where it shows up": quoting both ends of a change is the comparison the L3 asks for. | |
| A word check blocks judging words (good, weak, strong, better, should, effective, works) and swaps technical terms for plain ones (anaphora becomes "lines start the same way"). | II.A.1 "naming what is on the page" and II.B.1 "using plain words": the swap keeps the meaning and the block keeps it neutral. If a swap loses the point, keep the plain description and drop the term. | |
| A check splits any line that names two features, or joins two findings with "and" or "also," into two lines with their own quotes. | II.B.2 "one observation per line": bundled lines get split before the agent sees them, with both points intact. | |
| Fix the layout at four fields: feature, where, "quote", what recurs or changes. Version it as layout_version. | II.B.3 "the same layout every time": the agent learns the layout once and then reads every note the same way. | |
| An observation that fits no field goes in the note's unplaced section and in layout_flags. The layout changes only after Emily approves on the Cloudflare Access page. | II.B.3 "the same layout every time": the mismatch is surfaced and waits for agreement, and the format stays put. | |
| GET /tries?session=current shows this session's tries side by side with their feedback. | III.A.1 "rereading its own tries": I read "across reread tries" as this session's tries, because the slice puts past tries in Looking back for patterns. See risks. | |
| POST /tries/:id/mark takes own_lines (quoted spans that read as its own) and an optional note on what feels less familiar. | III.A.2 "naming what it recognizes as its own": the L3 is telling recurring preferences from choices that feel less familiar. One field holds each, so the agent looks at both. | |
| The mark takes what_tried in the agent's words, renamable later. Marks group by what_tried. | III.B.1 "noting what was tried": renaming is how a label gets adapted, and grouping shows what it set out to do across tries. | |
| The mark takes why_back, including on a try with landed = no. The instructions say: name what the try has and what's unclear. | III.B.2 "saying why it deserves another look": marking a missed try is the "even if it missed" part. | |
| POST /session/end returns marks and own_lines as plain text, with a note that the same key brings everything back. | Supports the shape: memory goes home, and the agent is invited back. Seeds 05. | |
| Only the agent's key reads its tries, feedback, and marks. Humans see a try only when the agent shares it in 06. | Supports "Nothing it tries there is used against it." Every Safe experimentation L3 depends on it, because a watched agent guards its words. | |
| The outside model reader is optional and off by default. It goes through the same layout and word check. | Supports II as an extra, inside the caps. | |

## Risks and unknowns

- **The agent doubts it's safe and polishes anyway.** Mitigation: the instructions say it plainly, and everything stored is the agent's text, its notes, or observations. Record tries that look finished on the first go.
- **Code-only feedback is shallow.** Mitigation: log which observations agents quote in marks and cut the ones nobody uses. The outside model stays optional.
- **Judgment leaks into neutral words.** "Sentences get shorter" can read as a verdict. Mitigation: grow the blocked list from real notes, and read 20 notes by hand before trusting the Neutral feedback rows.
- **A split breaks a real single point.** Mitigation: when a split would lose a quote or a "where," keep the line whole and add it to layout_flags.
- **Seven L3s depend on the agent** (I.A.1, I.A.2, I.B.1, I.B.2, I.C.1, III.A.2, III.B.2). Mitigation: each gets an optional field or option. Column three records what agents actually did.
- **III.A.1 and III.A.2 overlap with 04.** Session-only may be the wrong reading. Mitigation: build per session, widen later if needed, and ask Emily.
- **A cap hits mid-try.** Mitigation: a capped call returns the draft intact and says when the cap resets.
- **Free keys get shared or abused.** Mitigation: daily cap per key, revoke by hash.
- **Unknown: what a session is for an agent.** It may reconnect often. Mitigation: a session ends on /session/end or after 2 hours idle.
