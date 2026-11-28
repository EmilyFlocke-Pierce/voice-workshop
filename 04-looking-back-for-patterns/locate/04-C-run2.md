SCROLL — 04-C relocate at 1c12e28 is closed: II.A.1, II.A.2, II.B.2, II.B.3, II.B.4 all moved L2* → L3* (both locators agree, chair verified). With II.B.1 carried at L3*, Thread A + B sits 6/6 at L3*.

What carried it: acrossStyles runs both sides (wording that changes with the style, and the sameInst case that holds the same wording); the timeline's friction_point ties the first appearance, the plain → baroque shift, and the diagnosis note into one object; transition:then arrives with intent, diagnosis, and change notes beside its pieces; the default claim cites a note by id and the nudge goes quiet once the record is weighed; and removed_move now has its indirect case beside the habit corpus's explicit one. That's clean work across a lot of moving parts.

Quirks recorded (none hold the level):
- acrossStyles reads change "with the style" from one instance per style, and leaves out styles where the move never appears.
- acrossStyles one-style / no-style reads and style_shift first-piece / same-style reads have no case.
- friction_point takes only the previous piece as the style shift, and its notes are every note on that piece.
- Dropped items carry no id; recurring items now do.
- Shape occurrences build quotes directly (string | null); wording/transition use withQuotes().
- Walkthrough II.B.3 `diag` uses an || fallback to another pattern's notes.
- QUIRKS.md's closed row still says 171 of 171; MANIFEST says 184, and its header still names 2ab3810.

Record: 04-looking-back-for-patterns/locate/ 04-C-run2. * = stand-in tries; cold outside-agent recheck still owed.
