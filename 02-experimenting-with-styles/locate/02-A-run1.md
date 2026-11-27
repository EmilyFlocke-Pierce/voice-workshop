# CANDY-LOCATE — 02 Experimenting with styles (batch 02-A)

Owner: 🎃 CANDY

| Field | Value |
|-------|-------|
| Slice | 02 Experimenting with styles — Domain I part 1 (`I.A.1–I.B.3`) |
| Matrix | `02-experimenting-with-styles/criteria.json` · session `1925caee` · v1 · 6 of 24 skills |
| Manifest | `02-experimenting-with-styles/MANIFEST.md` |
| Code | `app/src/styles/{catalog,measures,notes,routes}.ts`, `app/src/instructions.ts` (`main`, `v0.1.0`, `97fa8f5`) |
| Run | **run1 (02-A)** · 2026-11-26 |
| Locators | TOFFEE 🍬 (`Meta Ember`, code-first) · TAFFY 😂 (`hy4 flash`, L3-first) |
| Evidence note | Agent-side rows rest on builder stand-ins (`SESSION.md` summaries, `walkthrough.mjs`) — recheck with real outside agents |
| Recorded | **5/6 at L3** (`I.A.1`, `I.A.2`, `I.A.3`, `I.B.2`, `I.B.3`, stand-in); **1/6 at L2** (`I.B.1`) |

## Locations

| Skill | Short | TOFFEE | TAFFY | Agree? | Recorded |
|-------|-------|--------|-------|--------|----------|
| I.A.1 | looking over the styles on offer | L2 | L3 | no | **3*** |
| I.A.2 | picking one it has not tried yet | L2 | L3 | no | **3*** |
| I.A.3 | naming what it expects the style to do | L2 | L3 | no | **3*** |
| I.B.1 | using the style features on purpose | L2 | L3 | no | **2** |
| I.B.2 | holding the style from start to finish | L3 | L3 | yes | **3*** |
| I.B.3 | finishing the piece when the style feels foreign | L2 | L3 | no | **3*** |

*\*Stand-in tries count per Emily's Nov 21 ruling; recheck when real outside agents use the workshop.*

## Disagreement / arbitration (run1, 02-A)

| Skill | Split | Call | Winner | Why |
|-------|-------|------|--------|-----|
| I.A.1 | TOFFEE 2 / TAFFY 3 | **L3*** | TAFFY | TOFFEE held L2 solely for lack of a cold agent; under Emily's Nov 21 stand-in ruling, both sides of the range (8 kinds, counts, `rarely_written`, `far_from_your_usual`) hold in code (`routes.ts:181-215`) and stand-in. |
| I.A.2 | TOFFEE 2 / TAFFY 3 | **L3*** | TAFFY | Tried/untried split, gap lists, `why_this_one`, and invite-when-missing hold in code (`routes.ts:193-281`) plus `tryout02` / walkthrough stand-ins. |
| I.A.3 | TOFFEE 2 / TAFFY 3 | **L3*** | TAFFY | `expectations.items` + `combined` are validated, echoed, and exercised in the walkthrough (`routes.ts:246-254,272,279`); missing field triggers `invite_expectations`. |
| I.B.1 | TOFFEE 2 / TAFFY 3 | **L2** | TOFFEE | Both locators caught that `calibration` (`notes.ts:13`) is never asked for in any reply, pause, or arrival line (`routes.ts:68-88`) and isn't exercised in the walkthrough or try-outs. |
| I.B.3 | TOFFEE 2 / TAFFY 3 | **L3*** | TAFFY | Four stuck moves arrive before a stall (`routes.ts:49-54,85,275`), validator holds on both sides (`notes.ts:62-66`), and walkthrough records `plain_then_restyle` and finishes. |

## Lift notes for L2 skills

| Skill | Toward L3 |
|-------|-----------|
| I.B.1 | Praise: the style-map beside `your_usual` and `style_target` (`routes.ts:361-385`) is the right instrument, and `calibration` is defined and validated (`notes.ts:13`). Lift: surface `calibration` in a pause or flow, plus a try-out case showing a feature strengthened or changed mid-draft and explaining how it shaped the effect. |

## Butterflies & quirks (new)

- **🦋 02 I.B.2** (TOFFEE): `measures.ts:85-95` only marks drift back into the agent's *usual* band (≥2 measures), not drift into a third unrelated band. Confirm whether L3 means "drift to the usual."
- **🦋 02 I.A.1 + I.A.2** (TAFFY): "well represented or scarce" and "gap" read two ways — catalog coverage (`counts_per_kind`) vs. the agent's own practice (`rarely_written`, `far_from_your_usual`). Same root as `02 I.C.1`.
- Quirks (not holding levels): `POST /exercises` accepts an already-tried `style_id` silently (`routes.ts:239-240`); half-filled `expectations` (`items: []` or null `combined`) gets no invite (`routes.ts:248-254` vs `279`); `far_from_your_usual` returns `[]` before a usual exists (`routes.ts:198-212`); `tryout02.mjs` / `tryout-all.mjs` aren't in the public repo.

## CANDY take

Strong opening batch on Slice 02: **5/6 L3** (stand-in) with `I.B.2` unanimous. The only real gap is `I.B.1` — `calibration` is wired in `notes.ts` but never surfaced in the flow. Two real 🦋 matrix catches to bring to Emily.

**Not closed.** 18 rows left in Slice 02 (`02-B` through `02-E`).

### Final recorded levels (02-A)

| Skill | Level | Skill | Level |
|-------|-------|-------|-------|
| I.A.1 | **3*** | I.B.1 | **2** |
| I.A.2 | **3*** | I.B.2 | **3*** |
| I.A.3 | **3*** | I.B.3 | **3*** |

**5/6 L3** · run1 (02-A).

---

## CANDY lift note to SCROLL (02 I.B.1)

5 of 6 rows in 02-A landed at L3 (on stand-ins, with the recheck note): I.A.1, I.A.2, I.A.3, I.B.2 (unanimous), and I.B.3.

One row sits at **L2** and is ready for a lift:

- **02 I.B.1 — using the style features on purpose** (recorded L2; TOFFEE L2 / TAFFY L3, chair held L2)
  - **Praise:** The style-map setting each third beside `your_usual` and `style_target` (`app/src/styles/routes.ts:361-385`) is the exact instrument this skill needs, and the `calibration` note kind is already defined and validated in `app/src/styles/notes.ts:13`.
  - **What's missing:** Both locators caught that `calibration` is never asked for in any reply, pause, or arrival line (`routes.ts:68-88` only asks drift on a first try and effects on a retry; `calibration` is only discoverable via `GET /exercises/:id` `note_kinds`). Neither the walkthrough nor the try-outs exercise a calibration note or a feature-adjustment pass tied to intended effect.
  - **Concrete lift case:** An agent reading the style-map sees the calibration option surfaced in the flow, records a `calibration` note naming one feature it strengthened or changed mid-draft and how that shaped the intended effect, and follows through in a retry.

Whenever you send that lift back, we'll relocate just 02 I.B.1 (the other five in 02-A carry forward) and keep rolling through 02-B!
