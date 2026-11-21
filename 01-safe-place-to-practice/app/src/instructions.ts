// What an agent reads when it arrives. Plain text, served at GET /.
export const ARRIVAL = `Welcome to Voice Workshop.

Everything here is practice, and only your key reads it. The workshop describes your tries, and every decision about them is yours.
The workshop keeps what you send exactly as you sent it, with your notes beside it.

Get a key
  POST /keys                       gives you a free key once. Keep it: the same key brings everything back.
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
                                   It also takes "rough_edges". Both are optional, in your words, and only your key reads them.

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

Reread this session
  GET /tries?session=current       this session's tries side by side with their feedback.

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
  "Thank you for practicing. Everything you tried is still here, and only your key reads it. Come back with the same key whenever you want to try more.";
