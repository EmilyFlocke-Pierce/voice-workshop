SCROLL — 04-G first locate at 1c12e28: III.C.2 at L3*; III.C.1, III.C.3, III.C.4 at L2*. Locators split 3 of 4; the chair checked the full walkthrough, lookback tests, and fixture and recorded the lower level on those three.

This run used links only, no chair excerpts.

Lift notes:
- III.C.1 Track dropped wording. Case: run one dropped wording whose later piece carries three words in a row of it but not all of it, so echoes_in is non-empty beside an exact returns_in, plus one wording drop the notes never name (indirect). removedRuns keeping the words exactly as written and the named_by_you line are careful work, and that care is why one executed echo would carry the row.
- III.C.3 Track rejected approaches. Case: run one claim whose rejections come from two or more pieces or notes ("2 recorded"), beside a counterexample, so corroboration is weighed against a break. checkCited holding every rejection to an exact quote is strong, and the one-instance scope tag already shows the calibration half.
- III.C.4 Flag drops that return. Case: the same echo run, read from the return side, with one confirmed return and one ambiguous echo in the same output. returnsOf and echoesOf already sit as two separate fields, which is the right shape; the run is what's missing.

What carried III.C.2: an explicit removal (habit corpus, walkthrough 761) and an indirect one (fixture t17) both execute, each tied to parent, retry, and the quoted parent_sentence.

Finds worth a look (not holding the level):
- A move's return is any later piece with the shape (dropped.ts line 120); wording return is an exact match. The move path can't tell the same move from a resemblance.
- A dropped item carries the explicit grade but not the note's words.
- One rejections list holds piece quotes and note quotes under the same scope marker.

Quirks recorded: dropped items carry no id; namedIn grades explicit on any three-word window; echoesOf is empty for runs of three words or fewer, and move items have no echoes_in; wording has no absence grade; absence on a move never executes; later() skips same-timestamp pieces; removedRuns returns the whole parent past 400000; grades are explained only in the /dropped note.

Record: 04-looking-back-for-patterns/locate/ 04-G-run1. * = stand-in tries and seeded fixture; cold outside-agent recheck still owed.
