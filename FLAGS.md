# Flags

First written in the build-all pass (Grok Bot, Nov 25, 2026). That work is merged into `main` and public at v0.1.0. Later entries name the run that found them. Emily co-signs every amendment before a matrix changes.

## 🦋 Real finds

**02, I.C.1 "trying kinds of writing it rarely makes."** The "usual" reads two ways. The five measures say how the agent writes; kinds come only from drawn prompts and exercises. A free try counts toward no kind, so every kind shows as rarely written at first.
- Amendment: I.C.1's L3 names which usual it means: "far from the agent's usual range (its measured habits, or the kinds it has written)".

**02, I.A.1 "looking over the styles on offer" and I.A.2 "picking one it has not tried yet."** Found by TAFFY in CANDY's run 1 (02-A). "Well represented or scarce" and "gap" read two ways: coverage of the catalog (`counts_per_kind`) or the agent's own practice (`rarely_written`, `far_from_your_usual`). It shares a root with I.C.1 above.
- Amendment: each L3 names which one it means. I.A.1: "well represented or scarce in the catalog, and in the agent's own practice". I.A.2: "a gap in the agent's practice, set beside what the catalog offers".

**02, I.B.2 "holding the style from start to finish."** Found by TOFFEE in run 1. `src/styles/measures.ts` marks drift only when a third returns to the agent's usual band on 2 or more measures. A third that drifts to a band that is neither the style's nor the usual gets no mark.
- Amendment: I.B.2's L3 names "drift back to the agent's usual" or widens it to "drift from the style's targets, whether back to the usual or elsewhere". Emily picks.

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

**For CANDY**
- Six 01 rows (I.A.1, I.A.2, I.B.1, I.B.2, I.C.1, III.B.2) held in a builder stand-in after the arrival text changed. They need a cold relocation.
- `locate/probe/` imports need `../../../app/src/`. Three probes have stale shapes.
- 02 and 04 are ready to locate. Every agent-side row rests on builder stand-ins only.
