# LOCATE — 02 Experimenting with styles (batch 02-B, run 1)

Owner: Locating Chair

| Field | Value |
|-------|-------|
| Slice | 02 Experimenting with styles — Domain I, Thread C (`I.C.1`–`I.C.3`) |
| Matrix | `02-experimenting-with-styles/criteria.json` · session `1925caee` · v1 · `3 of 24 skills` |
| Manifest | `02-experimenting-with-styles/MANIFEST.md` |
| Code | `app/src/styles/catalog.ts`, `measures.ts`, `notes.ts`, `routes.ts`, `instructions.ts`, `test/style-map.test.ts`, `scripts/walkthrough.mjs`, `tryouts/` (`main`, `cc59387`) |
| Run | **run1 (02-B)** · 2026-11-26 |
| Locators | TOFFEE · TAFFY |
| Evidence note | Stand-in tries and walkthrough (`125/125`); recheck `*` rows with real outside use. |
| Recorded | **0/3 at L3**; **3/3 at L2*** (`I.C.1`, `I.C.2`, `I.C.3`) |

## Locations

| Skill | Short | TOFFEE | TAFFY | Agree? | Recorded |
|-------|-------|--------|-------|--------|----------|
| I.C.1 | trying kinds of writing it rarely makes | L2* (L3* under FLAG) | L2* | yes | **2*** |
| I.C.2 | naming what is unusual about the style for it | L2* | L2* | yes | **2*** |
| I.C.3 | staying with the parts that feel wrong to write | L2* | L2* | yes | **2*** |

*\*Stand-in tries count per decider ruling. Recheck with real outside use.*

## Disagreement / arbitration (run1)

None. Both locators placed `I.C.1`, `I.C.2`, and `I.C.3` at **L2*** under the current `criteria.json` wording.

## Lift notes for L2 skills

| Skill | The case | The decider can close it by deciding |
|-------|----------|--------------------------------------|
| I.C.1 | Praise: `GET /styles/history` (`routes.ts:222-245`) reports `rarely_written`, `your_usual`, and `far_from_your_usual` with exact `apart_on` measures and plain counting rules, and warns when `your_usual` rests on fewer than 3 tries. Case: Under the current wording, an agent with an established kind history (at least one kind at 2+ pieces) picks a rarely written kind, names the reorientation in approach, and finishes a piece whose thirds hold that style's targets without drifting back, contrasted against a familiar kind (and note that co-signing the `FLAGS.md` amendment would narrow which "usual" applies). | |
| I.C.2 | Praise: The style map (`routes.ts:362-410`) places each third beside `your_usual` and `style_target`, `far_from_your_usual` names the measures apart, and quote-checking (`routes.ts:167-177`) verifies exact spans. Case: `unusual` (`notes.ts:17`) is never surfaced in a pause, style map, or arrival text and has zero positive cases in tests, walkthrough, or try-outs; a concrete case shows an agent in a far exercise diagnosing the shift in approach the style demands (not just listing a differing feature) with an anchor in the piece, contrasted with a near-usual style. | |
| I.C.3 | Praise: `hard_passage` (`notes.ts:18`) enforces a required quote span, the four stuck moves are surfaced up front in arrival text and every exercise pause, and `stuck_move` validation holds both sides of its boundary. Case: `hard_passage` is never surfaced in the flow and has zero positive cases in tests, walkthrough, or try-outs, while the one stand-in naming strain retreats to short sentences; a concrete case shows an agent naming a hard passage with its exact span, sustaining the shift through that passage on a retry without drifting back, and finishing the exercise. | |

*(Leave the decider column blank until the decider weighs in.)*

## Matrix gaps & quirks (new)

- **FLAG `I.C.2` / `I.C.3` (TOFFEE, TAFFY)**: Both `level_3` sentences ask for a diagnosed or sustained shift in approach, while `unusual` and `hard_passage` notes carry only free-text `text` (and an optional/required quote), leaving no structured distinction between diagnosing a shift and describing a feature.
- **Quirks (not holding levels)**:
  - `unusual` quotes stay optional while `hard_passage` requires a span (`notes.ts:17-18`). (TOFFEE)
  - `far_from_your_usual` ranks across all kinds independently of `rarely_written`, so history can suggest a far style in a frequently written kind without surfacing the farthest style inside a rarely written kind. (TOFFEE)

## Chair take

All three Thread C skills sit at **L2*** for the same root pattern we saw on `I.B.1`: the note kinds (`unusual`, `hard_passage`) and history metrics exist, but the flow never surfaces `unusual` or `hard_passage` and neither tests, walkthrough, nor try-outs execute a positive L3 case for them. On `I.C.1`, co-signing the `FLAGS.md` amendment narrows the two-"usual" ambiguity, though a clear executed case showing a sustained reorientation in approach is still needed.

**Open.**

### Final recorded levels

| Skill | Level | Skill | Level |
|-------|-------|-------|-------|
| I.C.1 | **2*** | I.C.3 | **2*** |
| I.C.2 | **2*** | | |
