# Flags

First written in the build-all pass (Grok Bot, Nov 25, 2026). That work is merged into `main` and public at v0.1.0. Later entries name the run that found them. Emily co-signs every amendment before a matrix changes.

## 🦋 Real finds

**02, I.C.1 "trying kinds of writing it rarely makes."** The "usual" reads two ways. The five measures say how the agent writes; kinds come only from drawn prompts and exercises. A free try counts toward no kind, so every kind shows as rarely written at first.
- Amendment: I.C.1's L3 names which usual it means: "far from the agent's usual range (its measured habits, or the kinds it has written)".

**02, I.A.1 "looking over the styles on offer" and I.A.2 "picking one it has not tried yet."** Found by TAFFY in CANDY's run 1 (02-A). "Well represented or scarce" and "gap" read two ways: coverage of the catalog (`counts_per_kind`) or the agent's own practice (`rarely_written`, `far_from_your_usual`). It shares a root with I.C.1 above.
- Amendment: each L3 names which one it means. I.A.1: "well represented or scarce in the catalog, and in the agent's own practice". I.A.2: "a gap in the agent's practice, set beside what the catalog offers".

**02, I.B.2 "holding the style from start to finish."** Found by TOFFEE in run 1. `src/styles/measures.ts` marks drift only when a third returns to the agent's usual band on 2 or more measures. A third that drifts to a band that is neither the style's nor the usual gets no mark.
- Amendment: I.B.2's L3 names "drift back to the agent's usual" or widens it to "drift from the style's targets, whether back to the usual or elsewhere". Emily picks.

**02, I.C.2 "naming what is unusual about the style for it" and I.C.3 "staying with the parts that feel wrong to write."** Found by TOFFEE and TAFFY in CANDY's run 1 of batch 02-B. Both L3 sentences ask for a diagnosed or sustained shift in approach ("Diagnose what shift in approach the unfamiliar style demands"; "Make a marked shift in your usual writing approach ... Carry that shift through the passage"). The notes carried only free text, with no way to tell a diagnosed shift from a described feature.
- Amendment: neither L3 changes. The build adds an optional `shift` field to both notes (see the judgment calls below). If Emily wants the matrix to say so, I.C.2's L3 adds "naming the shift in approach in a phrase of its own", and I.C.3's adds "naming the shift made to stay in the style".

**02, II.A.2 "track syntax shifts", II.A.3 "measure pacing variations", II.A.4 "note diction shifts."** Found by TOFFEE in CANDY's run 1 of batch 02-C. The matrix names cues the five measures do not compute: II.A.2 names clause order, sentence construction, and fragments; II.A.3 names paragraph breaks, pauses, and event density; II.A.4 names specificity and imagery. The measures count sentence length, clause punctuation, repeated openings, register words, and questions.
- Amendment: no L3 changes. Either the cues stay with the agent's effects notes (the map says what it leaves out, and the clause count now says it reads no nesting), or the matrix's lower levels say "named by the agent from the page" where a code measure cannot count the cue. Emily decides.

**02, II.A.1 to II.A.4, one effects kind.** Found by TAFFY in the same run. One `effects` note kind serves all four skills, and the `feature` field is its only feature-specific part. Each L3 asks something different: a purposeful turn against an unsupported fluctuation (tone), how patterns carry the voice (syntax), how shifts enact the structure (pacing), where words sustain and where they weaken (diction).
- Amendment: no L3 changes. The pause now gives one line per feature on what to diagnose. If the matrix wants the verdict itself on record (purposeful or wobble, carries or breaks, sustains or weakens), a small `reading` field per feature is the next move.

**04, I.A.3 "Gather reflection notes."** Slice 01 carries intent and scope_note from a parent to its retry, so one note sits on two versions.
- Amendment: I.A.3's L3 reads "attributed to the correct versions, including notes carried across a retry chain".

## Look at together

**Stubs**
- Sign-in is a STUB.
  - Local runs: local-dev mode takes the email from an `X-Dev-Human-Email` header.
  - Neon mode answers 501. `verifyNeonJwt` returns null.
  - @neon/auth stays uninstalled.
- Terms text is a placeholder (`TERMS_VERSION = "placeholder"`).
- The /human page is inline HTML marked STUB.
- Key caps: 3 active keys per human and 3 a day. These are my numbers.
- POST /keys answers 403 outside local runs (`OPEN_KEYS=false` in wrangler.jsonc). check:deploy lists 4 holds before any deploy.
- The style catalog is draft-1, and the art-movement translations are my reading.

**Judgment calls: sign-in and 01**
- The arrival text's "Get a key" lines and the 401 text now name the human door.
- checkRowCap counts 02's and 04's tables, so one key's row cap fills sooner.
- POST /tries ignores a stray `parent_id`. Listed in 01's QUIRKS with a move.

**Judgment calls: slice 02**
- GET /styles needs a key.
- why_this_one and expectations stay optional, with an invite when missing.
- Notes still go in after an exercise is finished.
- `exercise_notes.extra` is a new JSON column, not in the plan.
- Part B: a register exercise stores `register:<register>` as its style_id.
- Part B: the register try's pause reuses the style_vs_speaker note kind.
- Part B: a register exercise skips the two-readers pause at finish.

**Judgment calls: slice 04**
- Three schema additions not in the plan:
  - `lookback_pieces.seq`
  - `pattern_revisions.instances`
  - a `lookback_writes` table for the daily write cap
- Exercise ease and pull attach to the exercise's last try in the corpus.
- An intent or scope_note equal to the parent's is marked carried_from_parent.
- Pulling a piece in rebuilds the audit, recurring, and dropped results.
- Near matches run on 4-word spans only, to stay inside lookback_cpu_ms.
- `lookback_chars: 400000`, a new cap.
  - 200 full-length pieces took about 2 s against the 1 s cap.
  - The new cap holds a lookback to about 50 full pieces, which take about 0.8 s on the box.
- III.A.3: the code cannot tell when two notes disagree. It shows them side by side, and the agent judges. This may belong in QUIRKS rather than the matrix.

**Judgment calls: the I.B.1 lift (run 1)**
- A `calibration` note now names one feature (tone, syntax, pacing, or diction) and takes an optional `did` of strengthened or changed. Before the lift it took text only.
- The invite sits beside the pause question and on the style map, so the pause still asks one question.
- A retry's style map lists the exercise's earlier calibration notes.

**Judgment calls: the 02-B lift (I.C.1 to I.C.3)**
- `unusual` and `hard_passage` take an optional `shift`: a short phrase naming the change in approach. It is small, free text, and optional, so a note without it still lands. It is the structured line between a diagnosed shift and a described feature.
- `unusual` now requires quotes, as `hard_passage` does, so every diagnosis sits on words in the piece. A near-usual style takes the same note with a lighter invite.
- Far from the usual means 3 or more measures apart, counted as GET /styles/history counts.
- The exercise reply carries `for_you`: the kind read as familiar (2 or more pieces) or rarely written, and how far the style sits from the usual.
- History adds `far_in_rarely_written_kinds`, so a far style in a rare kind shows even when a familiar kind holds the top five.
- A retry's map reads each earlier hard passage's third beside the style's targets. A span that covers several sentences takes the third holding most of them, the later one on a tie.
- The first-try pause's `unusual` invite appears only when the style is far, so near styles get no extra block in the pause. Their map still carries it.

**Judgment calls: the 02-C lift (II.A.1 to II.A.4)**
- Effects notes stay free text with the `feature` field. The verdicts the L3 sentences name (purposeful or wobble, carries or breaks, sustains or weakens) live in the note's own words. A `reading` field waits for Emily's word on the flag above.
- Effects quotes are required, and a note may hold several quoted lines, so a diction note can set a sustaining phrase beside a weakening one.
- The retry's pause carries `effects` beside its one question: features noted in this exercise, features not yet noted, and one diagnostic line per feature. The style map carries the same block on any try.
- The clause proxy is described in the map's `what_it_counts` and not changed, since the band edges are pinned by tests.

**For CANDY**
- Six 01 rows (I.A.1, I.A.2, I.B.1, I.B.2, I.C.1, III.B.2) held in a builder stand-in after the arrival text changed. They need a cold relocation.
- `locate/probe/` imports need `../../../app/src/`. Three probes have stale shapes.
- 02 batches 02-B (I.C.1 to I.C.3) and 02-C (II.A.1, II.A.2, II.A.4) are lifted and wait for relocation. 04 is ready to locate. Every agent-side row rests on builder stand-ins only.
