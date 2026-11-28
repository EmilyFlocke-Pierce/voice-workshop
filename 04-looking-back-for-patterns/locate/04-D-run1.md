Batch 04-D (Run 1 at 98264b0) — 0/3 at L3*, 3 to lift

Recorded levels:
- II.C.1 (Explain the repeat's function): L1*
- II.C.2 (Assess future choice intent): L1*
- II.C.3 (Distinguish taste from default): L2* — really nice thin-claim guard on default claims (asks for notes weighed and counterexamples when missing) and clean four-way CLAIM_KINDS vocabulary.

Lift notes (one concrete case per L1/L2 skill; decider column left blank):
- II.C.1: An agent diagnoses how a recurring choice functions across pieces—weighing stated intent, its effects in the writing, and examples where it was dropped or returned to—and explains whether it operates as a chosen preference or an unexamined habit, supported by cited pieces and notes (function is never posted in walkthrough.mjs or lookback.test.ts, is omitted from GET /findings, and loadRows drops slice-02 extra effects).
- II.C.2: An agent evaluates how strongly the evidence supports future choice intent—including a case where reflections conflict with later revisions or a dropped move returns—and explains what that suggests about deliberate taste versus habit (future_intent and qualifiers are never posted in walkthrough.mjs or lookback.test.ts, and GET /findings omits future_intent).
- II.C.3: An agent weighs a recurring choice across pieces and reflection notes (evidence by note_id) against rejected approaches (rejections), removed moves, and a repeat that returns (counterexamples), judging taste, default, mixture, or unclear with qualifiers where evidence is unclear—with executed cases covering both the thin-claim nudge and a weighed claim (right now only the single unweighed default claim runs in walkthrough.mjs:466-467; taste/mixture/unclear, rejections, counterexamples, note_id evidence, and qualifiers never execute).

Flags & non-blocking quirks to note:
- FLAGS.md candidates: loadRows drops slice-02 extra so structured pull.effects / calibration fields don't reach Slice 04; instructions.ts documents POST /claims without naming function or future_intent (and GET /findings omits both); asks fires only on kind === "default", not taste/mixture/unclear; taste/default/mixture/unclear have no short definitions separating mixture from unclear.
- Quirks: POST /claims, claimView, CLAIM_KINDS, notes_side_by_side, and GET /findings have no unit tests in lookback.test.ts; checkCited for rejections accepts either piece or note_id while its error text asks for both; rejections.scope: "one instance" never executes.
