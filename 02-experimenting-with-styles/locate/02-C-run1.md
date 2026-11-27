# LOCATE — 02 Experimenting with styles (batch 02-C, run 1)

Owner: Locating Chair

| Field | Value |
|-------|-------|
| Slice | 02 Experimenting with styles — Domain II, Thread A (`II.A.1`–`II.A.4`) |
| Matrix | `02-experimenting-with-styles/criteria.json` · session `1925caee` · v1 · `4 of 24 skills` |
| Manifest | `02-experimenting-with-styles/MANIFEST.md` |
| Code | `app/src/styles/measures.ts`, `registers.ts`, `notes.ts`, `routes.ts`, `test/style-map.test.ts`, `scripts/walkthrough.mjs`, `tryouts/` (`main`, `cc59387`) |
| Run | **run1 (02-C)** · 2026-11-27 |
| Locators | TOFFEE · TAFFY |
| Evidence note | Stand-in tries and walkthrough (`125/125`); recheck `*` rows with real outside use. |
| Recorded | **1/4 at L3*** (`II.A.3`); **3/4 at L2*** (`II.A.1`, `II.A.2`, `II.A.4`) |

## Locations

| Skill | Short | TOFFEE | TAFFY | Agree? | Recorded |
|-------|-------|--------|-------|--------|----------|
| II.A.1 | detect tone changes | L2* | L3* | no | **2*** |
| II.A.2 | track syntax shifts | L2* | L3* | no | **2*** |
| II.A.3 | measure pacing variations | L3* | L3* | yes | **3*** |
| II.A.4 | note diction shifts | L2* | L3* | no | **2*** |

*\*Stand-in tries count per decider ruling. Recheck with real outside use.*

## Disagreement / arbitration (run1)

| Skill | Split | Call | Follows | Why |
|-------|-------|------|---------|-----|
| II.A.1 | TOFFEE 2 / TAFFY 3 | **L2*** | TOFFEE | Direct check of `app/scripts/walkthrough.mjs:266` shows only `feature: "pacing"` is posted; no `feature: "tone"` note or tone-shift diagnosis is executed anywhere, and `routes.ts:406` explicitly leaves tone out of the map. |
| II.A.2 | TOFFEE 2 / TAFFY 3 | **L2*** | TOFFEE | Evidence from `pacing` (`walkthrough.mjs:266`) cannot be double-counted for `syntax`; `measures.ts:35-36` computes clause density per third (L2), while no `feature: "syntax"` note diagnosing how syntax patterns serve or weaken the voice is executed. |
| II.A.4 | TOFFEE 2 / TAFFY 3 | **L2*** | TOFFEE | `registers.ts:4-18` and `measures.ts:38-45` compare exact-match register counts per third (L2), while no `feature: "diction"` note diagnosing recurring diction choices (where they sustain or weaken the style) is executed anywhere. |

## Lift notes for L2 skills

| Skill | The case | The decider can close it by deciding |
|-------|----------|--------------------------------------|
| II.A.1 | Praise: The style map (`routes.ts:406`) states plainly what it leaves out, the validator (`notes.ts:63-67`) holds the four-feature boundary, and quote-checking (`routes.ts:167-177`) verifies exact spans. Case: No `feature: "tone"` effects note is executed in tests, walkthrough, or try-outs; a concrete case shows an agent on a retry posting a `tone` effects note with exact quotes diagnosing how a specific moment creates a purposeful tonal shift versus an unsupported wobble. | |
| II.A.2 | Praise: `measures.ts:35-36,51-63` sets fixed band edges with exact counting pinned by test (`style-map.test.ts:48-56`) and displays per-third clause values beside `your_usual` and `style_target`. Case: No `feature: "syntax"` effects note is executed anywhere; a concrete case shows an agent quoting a syntax shift and diagnosing how the pattern carries the style's voice, plus a contrasting case where the syntax pattern breaks down and weakens the voice. | |
| II.A.4 | Praise: `registers.ts` versions its word lists (`REGISTER_WORDS_VERSION = "v1"`), `style-map.test.ts:48-56` pins exact register counts, and the map states plainly what it leaves out. Case: No `feature: "diction"` effects note is executed anywhere and the map's exact-match lists miss specificity and imagery; a concrete case shows an agent posting a `diction` effects note quoting specific word choices and diagnosing where recurring diction sustains or weakens the style. | |

*(Leave the decider column blank until the decider weighs in.)*

## Matrix gaps & quirks (new)

- **FLAG `II.A.2` / `II.A.3` / `II.A.4` (TOFFEE)**: `II.A.2` L1 names clause order, sentence construction, and fragments, `II.A.3` L1 names paragraph breaks, pauses, and event density, and `II.A.4` L2 names specificity and imagery, while the five code measures compute only sentence length, clause punctuation, repeated openings, register words, and questions.
- **FLAG `II.A.1`–`II.A.4` (TAFFY)**: One `effects` note kind serves all four `II.A` skills without capturing feature-specific diagnostic depth beyond the `feature` field.
- **Quirks (not holding levels)**:
  - `effects` quotes remain optional in `notes.ts:19` even though `EFFECTS_Q` (`routes.ts:46`) asks the agent to quote the moment. (TOFFEE, TAFFY)
  - The retry pause asks one `effects` question covering all four features (`routes.ts:46,92`), so a retry can answer about pacing alone. (TOFFEE)
  - The clause proxy (`measures.ts:36`) counts commas and joining words, so a comma-heavy sentence with no nesting reads as "layered." (TOFFEE)

## Chair take

Pacing (`II.A.3`) is solid at **L3***—both locators verified it end to end across the style map, calibration carry-through, `effects` note, and try-out collapse. The other three skills (`II.A.1`, `II.A.2`, `II.A.4`) sit at **L2*** because only `pacing` is ever exercised in `effects` notes; `tone`, `syntax`, and `diction` exist in the validator enum without an executed diagnostic case.

**Open.**

### Final recorded levels

| Skill | Level | Skill | Level |
|-------|-------|-------|-------|
| II.A.1 | **2*** | II.A.3 | **3*** |
| II.A.2 | **2*** | II.A.4 | **2*** |
