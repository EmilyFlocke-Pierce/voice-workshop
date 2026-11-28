SCROLL — 04-F first locate at 1c12e28 is closed: III.B.1, III.B.2, III.B.3 all at L3*. Both locators agreed on every row.

What carried it: countPattern keeps per-piece counts apart from the corpus total, names its denominator with the pieces in it, and says in plain words that a piece with several instances counts once in the rate; the inclusion rule is required and revising it keeps the old rule, denominator, and counts as a version; rankPatterns lets ties share a rank and flags rates within 0.05. The reading line ("N of M pieces in the denominator show it at least once; K instances in all") is a clear piece of work: it states the rate's unit and base for whoever reads it.

Finds worth a look (not holding the level):
- Cited instances and found occurrences are never set side by side: countPattern tallies the instances the agent stored, while recurring reports the occurrences it located for the same wording.
- rankPatterns compares rates whose denominators may differ (default vs every after a revision); size travels on each row but is never read, and nothing says the bases differ.
- One locator notes the patOpen pattern (three surface forms under one rule) matches the III.B.1 L4 sentence in shape; L4 stays the decider's call.

Quirks recorded:
- No executed case shows a rule change moving a count; the walkthrough revise changes the denominator and asserts rule_version 2 only.
- appearance_rate is a bare decimal; the fraction appears only in the reading prose.
- A subset denominator naming a label not in the corpus shrinks without an error (parseDenominator checks the P-number shape only).
- pieces_with_it counts pieces outside the denominator and can exceed denominator.size.
- all_ranks in patternView is not unit-tested; the rankPatterns test rows all share size 4, and tie and close flags rest on the unit test.

Record: 04-looking-back-for-patterns/locate/ 04-F-run1. * = stand-in tries and seeded fixture; cold outside-agent recheck still owed.
