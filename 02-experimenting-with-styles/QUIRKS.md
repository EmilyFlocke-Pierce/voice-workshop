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
| `did` and quotes stay optional on a `calibration` note, so a note can name a feature and an effect without saying whether it was strengthened or changed, or tying it to a span. | TOFFEE, CANDY run 2 (02-A relocate) | I.B.1 | Invite `did` and a quoted span in the reply when they are left out, and keep the note. |
| The clause proxy counts commas, semicolons, colons, and joining words, so a comma-heavy sentence with no nesting reads as layered (TOFFEE, CANDY 02-C run 1). | II.A.2 | The map now says so in `what_it_counts`. Changing the count moves the band edges that tests pin, so a better proxy (subordinating words such as "which", "whose", "because") waits for a locator who finds it matters. |
| `effectsSoFar` sits on the retry pause, not the first-try pause. First-try agents reach the four asks on the style map and in the arrival text. (CANDY, 02-C run 2) | II.A.1 to II.A.4 | Keep it so: the first-try pause already asks the drift question, and the map carries the same effects block on any try. |
| `effectsSoFar.noted` counts across the whole exercise, so `not_yet` can read empty on a retry that has no effects note of its own. (CANDY, 02-C run 2) | II.A.1 to II.A.4 | Keep the exercise-wide count, so a retry can see what has already been diagnosed and reach for a feature that has not. A later move can also name which of those notes belong to this try. |
| `reader_impressions` does not check that the two readers' impressions differ. (CANDY, 02-D run 1) | II.B.1 | Leave the closed row as it is. The walkthrough already posts two distinct impressions. A same-impression check can wait until a locator finds two identical impressions posted as if they were different. |
| The creation reply's `ahead` block uses `try_id: "..."` before any try exists (CANDY, 02-D run 2). | II.B.2, II.C.3 | Leave it. The same `"..."` mark already stands for "fill this in" in the ease and pull bodies on that reply. Once a try exists, GET /exercises/:id and the finish pause fill in the real id. |
| A `slowdowns` note accepts a single quoted spot (CANDY, 02-D run 2). | II.C.1 | Leave it. Recurrence lives in the diagnosis, which can name a pattern from one quoted moment. Requiring two quotes can wait until a locator finds a one-spot note that never names a pattern. |
| A `what_it_was_like` note checks that a quote exists, and does not require one from the opening and one from the ending (CANDY, 02-D run 2). | II.C.3 | Leave it. The invite already asks for moments from opening to ending. Enforcing two spans can wait until a locator finds a note that only quotes one end. |
| The first-try pause carries seven invite blocks beside its one question (CANDY, 02-D run 2). | pause shape | Leave it. The pause still asks one question; the blocks sit beside it, the way calibration and unusual already did. Thin the payload only if it starts to get in the way. |
| GET /reach lists `by_style` and `by_kind` in creation-date order rather than ranked by ease (CANDY, 02-E run 1, carried in run 2). | III.A.1 | Leave the chronological order, so the set stays in the order it was written. A later move can also sort if a locator wants the low-friction styles first. |
| `pull.effects` strings are aggregated verbatim, without normalization (CANDY, 02-E run 1, carried in run 2). | III.C.2 | Leave the agent's words as they named them, so two phrasings of the same effect stay distinct until a locator finds a split that gets in the way. |
| Ease and pull are exercise-level notes with no try of their own; only their quotes can carry a `try_id`. (CANDY, 02-E run 2) | III.A.2, III.C.2 | Leave them as exercise-level notes. The finish call stores ease and pull on the exercise, and the quotes can name a try. A later move can give ease and pull their own `try_id` if a locator wants the note tied to one try without a quote. |
| The low-friction map, the friction comparison, and the pull reading live in one free-text reach note; /reach supplies the counts, distance, and effects beside it. (CANDY, 02-E run 2) | III.A.1, III.B.1, III.C.1 | Leave the reading in one free-text note. /reach already puts the counts, distance, and effects beside it, and the note can name the styles. A later move can split the note into three kinds if a locator wants those readings separated. |
| The placard sits near the usual and still turned hard on piece two; /reach does not relate ease to distance. (CANDY, 02-E run 2; an observation, not a gap at L3*) | III.A.1 | Leave them side by side, not joined. A style can sit near the usual and still feel hard, and a style can sit far and still come easy. A later move can add a line that relates the two if a locator wants that contrast named in /reach. A 🦋 take is in FLAGS.md. |
| A register exercise stores `register:<register>` as its style_id, so slice 04 shows that string as the piece's style. | Grok Bot | 04 compare, II.A.1 in 04 | Show the register by name in 04's style column. |

## Closed

| Quirk | Commit |
|---|---|
| `pull` quotes were optional, and `finishQuestions()` shipped `quotes: []` (CANDY, 02-E run 1). Quotes are now required, matching ease and the other notes that ask to quote the piece, and the finish body shows a quotes placeholder. | the 02-E lift |
| `pull` was not named in `style-map.test.ts` (CANDY, 02-E run 1). It is named there now, including the quotes check. Ease quotes are required there too. | the 02-E lift |
| `style_vs_speaker` quotes were optional while `slowdowns`, `slips_back`, and `what_it_was_like` required them (CANDY, 02-D run 1). Quotes are now required, matching the plan table and anchoring the diagnosis in the piece. | the 02-D lift |
| The four kinds `style_vs_speaker`, `slowdowns`, `slips_back`, and `what_it_was_like` were not named in `style-map.test.ts` (CANDY, 02-D run 1). They are named there now, including the quotes check. | the 02-D lift |
| A walkthrough check was labeled as listing "the one not yet noted" while it asserted `not_yet.length === 0` (all four features already noted). (CANDY, 02-C run 2) The label now matches what it asserts. A separate check already covers the not-yet case. | this commit |
| `effects` quotes were optional while `EFFECTS_Q` asks to quote the moment (TOFFEE, TAFFY, CANDY 02-C run 1). Quotes are now required. | the 02-C lift |
| The retry pause asked one effects question over four features, so a retry could answer about pacing alone (TOFFEE, CANDY 02-C run 1). The pause now lists the features noted and not yet noted, beside the same one question. | the 02-C lift |
| `unusual` quotes were optional while `hard_passage` required a span (TOFFEE, CANDY 02-B run 1). `unusual` now requires quotes, so its diagnosis sits on words in the piece. | the 02-B lift |
| `far_from_your_usual` ranked across all kinds apart from `rarely_written` (TOFFEE, CANDY 02-B run 1). History now also lists `far_in_rarely_written_kinds`, the top 5 inside the rarely written kinds. | the 02-B lift |
| A flavor line cut Ukiyo-e's questions band. | 5f7dbf3 |
| The slice folder had no `FLAGS.md`, so a link to `02-experimenting-with-styles/FLAGS.md` returned 404, while the live flags sit in the root FLAGS.md (CANDY, 02-E run 2). A pointer file now sits in the slice folder, the way slice 04 already does, and sends a locator to the root file. | the 02-E run 2 close |

## Ideas

- Part B could show register exercises in slice 04's scope by kind ("register").
- The `shift` on `unusual` and `hard_passage` stays free text. If locators find agents leave it empty, ask for it in the reply when it is missing.
- A retry that rewrites a hard passage loses the exact span, so the map reads that passage's third and not its words.
