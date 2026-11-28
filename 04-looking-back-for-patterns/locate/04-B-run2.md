Batch 04-B Run 2 (I.B.1 at 1725848) — CLOSED 3/3 at L3*

- I.B.1 (Compare across pieces): L3*, moved from L2*, both locators agree. compareAlong is lovely work: holds, rises, holds along the sequence with a delta per step, every reflection-note kind beside each piece, and a plain along_the_sequence line, pinned in lookback.test.ts and walked through in walkthrough.mjs:626-666.
- I.B.2 and I.C.1 carry forward at L3*.

Flag candidates (butterfly takes, no criteria wording):
- shift compares each piece only to the one before it, so a return to an earlier value reads as falls then rises; worth a take on which baseline "across the body of practice" means.
- "relevant reflection notes" leaves relevance unowned; compareAlong attaches every note on the piece.

Non-blocking quirks:
- falls is never exercised; a zero-note piece and rough_edges, stitch, or exercise notes in compare rows are unasserted; style and the style_order fallback are unasserted.
- compareAlong is not in the timing tests and is not chunked, so the 256 KB cap does not cover a compare response.
- QUIRKS.md's closed row still says 171 of 171 while the 04 MANIFEST says 174 of 174, and the 04 MANIFEST header still names build-all / 2ab3810.
