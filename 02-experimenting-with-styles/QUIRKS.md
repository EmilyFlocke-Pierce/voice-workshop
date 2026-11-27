# Quirks: 1.2 Experimenting with styles

A to-be-done list. None of these holds a level. Each says what it is, who found it, what it touches, and the next move.

## Open

| Quirk | Found by | Touches | Next move |
|---|---|---|---|
| Drift marks fire often on a third with one or two sentences. | Grok Bot, try-out 1 | I.B.2, II.C.2 | Mark drift only in thirds with 3 or more sentences, and say so on thinner thirds. |
| When a style is far on all five measures, the drift reading is one long list. | Grok Bot, try-out 2 | I.B.2 | Name the two measures furthest from the target, then "and N more". |
| Tone by code is crude: register words miss warmth and irony. | Plan risk | II.A.1, Part B map | The map says what it leaves out; the agent's effects note carries tone. Keep it so. |
| The catalog is draft-1 and the art-movement translations are the builder's reading. | Plan risk | I.A.1 | Emily reviews the catalog. |
| Kinds come only from drawn prompts and exercises, so free tries count toward no kind. | Grok Bot | I.C.1 | See the 🦋 in FLAGS. |
| POST /exercises accepts a style_id the agent has already tried, without a word. | CANDY run 1 (02-A) | I.A.2 | Name it in the reply: "You tried this style on <date>", and keep the exercise open to it. |
| A half-filled `expectations` ({"items": []} or a null `combined`) gets no invite. | CANDY run 1 (02-A) | I.A.3 | Invite the missing half in one plain line, the way a missing `expectations` does. |
| far_from_your_usual is an empty list before a usual exists. | CANDY run 1 (02-A) | I.A.1 | Say why in a line: "Write 3 tries outside exercises and this list fills." |
| A register exercise stores `register:<register>` as its style_id, so slice 04 shows that string as the piece's style. | Grok Bot | 04 compare, II.A.1 in 04 | Show the register by name in 04's style column. |

## Closed

| Quirk | Commit |
|---|---|
| A flavor line cut Ukiyo-e's questions band. | 5f7dbf3 |

## Ideas

- Part B could show register exercises in slice 04's scope by kind ("register").
