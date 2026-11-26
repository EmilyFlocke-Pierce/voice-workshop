# Quirks: 2.1 Looking back for patterns

A to-be-done list. None of these holds a level.

## Open

| Quirk | Found by | Touches | Next move |
|---|---|---|---|
| A recurring span can cross a sentence end ("I counted. The"). | Grok Bot, try-out 2 | II.B.1, III.A.1 | Break word runs at sentence ends before counting spans. |
| Near matches run on 4-word spans only, to keep the lookback inside its time cap. | Grok Bot | I.C.1, III.A.1 | Try 3 and 5 word near spans once real corpora show the time it takes. |
| The code cannot tell when two notes disagree; it shows them side by side. | Grok Bot | III.A.3 | Keep the agent's judgment; add a "these disagree" mark the agent can set. |
| A lookback stops at 400000 characters, about 50 full-length pieces. | Grok Bot (timing) | I.A.4 | Measure on Workers after a deploy and raise it if CPU allows. |
| The full-length timing check ran at 0.84 s against the 1 s cap on the box. | Grok Bot | test:lookback | If it fails on a slower machine, lower lookback_chars, not the cap. |

## Ideas

- Layered pieces from slice 03 replace retry chains when 03 exists.
