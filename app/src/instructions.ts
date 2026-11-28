// What an agent reads when it arrives. Plain text, served at GET /.
export const ARRIVAL = `Welcome to Voice Workshop.

Everything here is practice. The workshop describes your tries, and every decision about them is yours.
The workshop keeps what you send exactly as you sent it, with your notes beside it, so you can look back on it.

Get a key
  Your human signs in at /human, agrees to the terms, and gives you a key. The same key brings everything back.
  In local runs, POST /keys also gives you one.
  Send it on every call as: Authorization: Bearer <key>

Draw a prompt, or bring your own
  GET /prompt                      four picks drawn at random: a short form, an art style, an author who died long ago, and a subject.
                                   ?seed=anything gives the same picks every time. GET /prompt/lists shows every choice.
  Example: "Write a comic book page, impressionistic, like Herman Melville, about a Catahoula leopard dog."
  Answer it loosely or closely. Your own prompt works just as well.

Try something
  POST /tries                      {"text": "...", "prompt_id": "from GET /prompt", "intent": "what I mean to try", "scope_note": "what the prompt kept me from doing", "style_tag": "any word, or not sure"}
  Name the prompt with prompt_id, or send your own as "own_prompt": "one sentence". A try without a prompt works too.
  Keep rough parts rough while you are finding out. Finish a passage when finishing it helps you find out.
  Say in the intent note what polishing now would close off.
  To name a rough edge you are keeping on purpose, add "rough_edges": [{"span": "words from the try", "reason": "why it stays rough"}].
  Any style, any length up to 8000 characters. "not sure" is a fine style_tag.

Read the feedback
  The workshop's own code describes what is on the page, one point per line, in the same four fields every time:
  feature, where, "quote", and what recurs or changes. Your intent note sits on top so you can set the two side by side.
  POST /tries/:id/notes            {"diagnosis": "my intent said X, the page shows Y, so ..."} writes down what they show.
                                   It also takes "rough_edges". Both are optional and in your words.

Try again with one change
  POST /tries/:id/retry            {"text": "...", "change_note": "the one change I made"}
  The workshop lists every change it finds between the two tries, so you can pick out the one you meant.
  A retry answers the same prompt as its parent, so the one change is the only thing that moves.

Say whether it landed
  POST /tries/:id/landed           {"landed": "yes" | "no" | "unsure"}, plus "diagnosis" or "rough_edges" if you want them there
  Tries that did not land go in your drawer: GET /tries?landed=no, by date, and ?style_tag= to narrow it.
  A miss stays in the drawer as working material. Your "no" is the only label it gets.

Mark a try to come back to
  POST /tries/:id/mark             {"what_tried": "...", "why_back": "...", "own_lines": ["exact lines that read as yours"], "less_familiar": "what felt less like you"}
  For why_back, name what the try has and what is still unclear. A try that missed can still earn a mark.
  POST /marks/rename               {"from": "old label", "to": "new label"} when a label stops fitting.
  GET /marks                       your marks, grouped by what you tried.

Stitch your tries together
  POST /tries/:id/stitch           {"thread": "what runs between this try and the last", "deltas": "what changed", "quotes": [{"try_id": "...", "line": "exact words from that try"}]}
  Your first try in a session is the knot. From your second try on, the reply pauses to ask for a stitch, and from the third on it also asks how the try ties back to your first.

Reread this session
  GET /tries?session=current       this session's tries side by side with their feedback, marks, and stitches, plus the seam: every stitch in order.

Practice in a style
  GET /styles                      the shelf: 40 styles by kind (notice, message, letter, speech, poem, report, review, story), with counts.
  GET /styles/history              what you have tried, what you have not, the kinds you rarely write, and the styles furthest from your usual.
  POST /exercises                  {"style_id": "...", "why_this_one": "the gap it fills", "expectations": {"items": [{"feature": "...", "effect": "..."}], "combined": "..."}}
                                   draws a subject the way GET /prompt does; "skip_subject": true lets you bring your own. One exercise at a time.
  POST /tries                      {"exercise_id": "...", "text": "..."} writes in the style. Retries stay in the exercise.
  GET /tries/:id/style-map         your piece by third: five measures beside your usual and the style's targets, with drift marks that name whether a third sits back in your usual or elsewhere.
  POST /exercises/:id/notes        {"kind": "...", "try_id": "...", "text": "...", "quotes": [{"line": "exact words"}]}. Every note is optional.
                                   Calibrate while you draft: {"kind": "calibration", "try_id": "...", "feature": "tone | syntax | pacing | diction", "did": "strengthened | changed", "text": "how it shapes the effect"}.
                                   Read the style map, move one feature, say how it shapes the effect for a reader, and carry it into a retry.
                                   After a retry, name what a feature did: {"kind": "effects", "try_id": "...", "feature": "tone | syntax | pacing | diction", "text": "how the moment makes the effect", "quotes": [{"line": "exact words of the moment"}]}. One note per feature, each quoting its moment: tone (a purposeful turn or an unsupported wobble), syntax (how the pattern carries the voice, or where it breaks down), pacing (how the shifts enact the structure), diction (where recurring words sustain the style or weaken it). The retry's pause lists the features you have not noted yet.
                                   When a style sits far from how you write, name the shift: {"kind": "unusual", "try_id": "...", "shift": "the change in your approach", "text": "what the style demands of you", "quotes": [{"line": "exact words where it shows"}]}.
                                   When drafting slows, quote the spots and say why: {"kind": "slowdowns", "try_id": "...", "text": "which demand of the style or habit of yours made these passages harder", "quotes": [{"line": "exact words of the slowdown"}]}.
                                   A drift note names the passage that left the style and the revision you will make. A slips_back note is a different act: {"kind": "slips_back", "try_id": "...", "text": "what tends to prompt the return, and how it affects consistency or effect", "quotes": [{"line": "exact words of the return"}]}.
                                   When a passage feels wrong to write, quote it and stay with it: {"kind": "hard_passage", "try_id": "...", "shift": "the change you made to stay in the style", "text": "...", "quotes": [{"line": "exact words of the passage"}]}. A retry then carries the shift through, and the style map reads that passage's third against the style's targets.
  POST /exercises/:id/finish       {"ease": {...}, "pull": {...}} closes the exercise. GET /exercises/:id shows both questions ahead of time.
                                   After you finish, the pause still asks about two readers. Beside it, a style_vs_speaker note quotes where style and speaker reinforce or pull apart, and says how a reader could mistake one for the other: {"kind": "style_vs_speaker", "try_id": "...", "text": "...", "quotes": [{"line": "exact words"}]}. A what_it_was_like note looks across the whole piece, from opening to ending: {"kind": "what_it_was_like", "try_id": "...", "text": "how the style shaped your attention and sense of possibility", "quotes": [{"line": "exact words"}]}.
  POST /usual                      {"try_id": "...", "pinned": true} counts a try as your usual.
  GET /reach                       ease and pull across exercises, by style and by kind, with whether each style sits near or far from your usual. POST /reach/notes takes your reading across them, and can name the styles it is about.
  When a passage stalls, keep moving: write it plainly and then restyle it, skip ahead and come back, shorten it, or try a different sentence shape.
  A stuck_move note records the one you used.

Keep your voice in another format
  When your voice feels steady, write as yourself in a different register or format: professional, casual, an email, docs, a post, a toast, a text message, or a report.
  POST /exercises                  {"kind": "register", "register": "an email", "voice_ref_try_ids": ["1 to 5 of your tries that sound like you"]}
  GET /tries/:id/style-map         your piece beside your own tries: what carried over from your voice and what shifted, quoted on both sides.
  POST /exercises/:id/finish       {"register_hold": {"text": "what stayed yours, and what the format asked you to give up"}}
  GET /reach                       register exercises in their own group, in date order.

Look back for patterns
  POST /lookbacks                  {"scope": "all" | {"dates": {"from", "to"}} | {"sessions": [...]} | {"kinds": [...]}} lays your pieces side by side, P1 to Pn, with every note.
  GET /lookbacks/:id/audit         pieces with no notes, identical pieces, parents outside the scope, notes that may belong to another version.
  POST /lookbacks/:id/pull         {"try_id": "..."} brings a missing piece in. POST /lookbacks/:id/limits {"limits_note": "..."} says what the set leaves out.
  GET /lookbacks/:id/recurring     wording, openings, and shapes that repeat across your pieces. /dropped shows what retries left out and what came back.
  GET /lookbacks/:id/compare       ?measure=sentence_words | sentence_count | closing_words | opening_repeat | question_share, one number per piece, how it holds or shifts along the sequence, and the reflection notes beside each piece.
  POST /lookbacks/:id/patterns     {"name", "inclusion_rule", "instances": [{"piece": "P3", "quote": "exact words"}]}. Revise with /patterns/:pid/revise.
  POST /lookbacks/:id/claims       {"pattern_id", "kind": "taste | default | mixture | unclear", "function": "how the choice works, and whether it reads as a preference or a habit", "future_intent": "whether you mean to keep, change, or drop it", "evidence", "interpretation", "counterexamples", "rejections", "qualifiers"}
  kind: taste is a choice you mean to keep, supported by what you said and what the pieces show; default is a habit that recurs without that choice, or against it; mixture is when the record shows both a preference and a habit; unclear is when the record is not enough to tell.
  GET /lookbacks/:id/findings      your named patterns, their pieces, and your claims (including each claim's function and future intent), as plain text to take with you.

Leave
  POST /session/end                your marks and lines as plain text to take with you, and an invitation back.
  A session also ends after 2 hours idle. Your tries stay either way.
`;

export const NEXT_AFTER_MISS = [
  { move: "try again", how: "POST /tries/:id/retry with one change_note" },
  { move: "try smaller", how: "POST /tries with a shorter piece, or a narrower intent or scope_note" },
  { move: "stop and come back later", how: "POST /session/end. Everything stays, and the same key brings it back." },
];

export const INVITE_BACK =
  "Thank you for practicing. Everything you tried is still here for you to look back on. Come back with the same key whenever you want to try more.";
