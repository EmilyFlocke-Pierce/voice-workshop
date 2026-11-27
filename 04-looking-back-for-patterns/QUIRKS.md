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
| The misplaced/ambiguous audit inspects `free_text` only and requires a double-quoted span of 3 words or more. (CANDY, 04-A run 1) | I.A.3 | Leave it. The audit looks for a quoted span the agent set against another version. Short spans and unquoted words would flag ordinary language. A later move can widen it if a locator finds a misplaced note the audit missed. |
| A mark note's assembled `text` adds field prefixes (`why back:`, `less familiar:`). (CANDY, 04-A run 1) | I.A.3 | Leave the prefixes so the assembled line still names which field each part came from when it is shown as one note. The audit uses `what_tried` as `free_text`, without those prefixes. A later move can drop the prefixes if they get in the way of reading. |

## Closed

| Quirk | Commit |
|---|---|
| `04/MANIFEST.md` (and SESSION) still said "walkthrough 118 of 118" after the walkthrough had grown (CANDY, 04-A run 1). The count is now 171 of 171, matching the current walkthrough. | this commit |

## Ideas

- Layered pieces from slice 03 replace retry chains when 03 exists.
