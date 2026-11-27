# LOCATE — 02 Experimenting with styles (batch 02-A, run 2 relocate)

Owner: Locating Chair

| Field | Value |
|-------|-------|
| Slice | 02 Experimenting with styles — Domain I, Threads A & B (`I.A.1`–`I.B.3`) |
| Matrix | `02-experimenting-with-styles/criteria.json` · session `1925caee` · v1 · `6 of 24 skills` |
| Manifest | `02-experimenting-with-styles/MANIFEST.md` |
| Code | `app/src/styles/notes.ts`, `routes.ts`, `instructions.ts`, `test/style-map.test.ts`, `scripts/walkthrough.mjs` (`main`, `5cfe02a`) |
| Run | **run2 (02-A relocate: I.B.1 only)** · 2026-11-26 |
| Locators | TOFFEE · TAFFY |
| Evidence note | Stand-in tries and walkthrough (`125/125`); recheck `*` rows with real outside use. |
| Recorded | **6/6 at L3*** (`I.B.1` moved from L2 to L3*; 5 rows carried forward from run 1) |

## Locations

| Skill | Short | TOFFEE | TAFFY | Agree? | Recorded |
|-------|-------|--------|-------|--------|----------|
| I.A.1 | looking over the styles on offer | carried | carried | — | **3*** |
| I.A.2 | picking one it has not tried yet | carried | carried | — | **3*** |
| I.A.3 | naming what it expects the style to do | carried | carried | — | **3*** |
| I.B.1 | using the style features on purpose | L3* | L3* | yes | **3*** (moved) |
| I.B.2 | holding the style from start to finish | carried | carried | — | **3*** |
| I.B.3 | finishing the piece when the style feels foreign | carried | carried | — | **3*** |

*\*Stand-in tries count per decider ruling. Recheck with real outside use.*

## Disagreement / arbitration (run2)

None. Both locators placed `I.B.1` at **L3***.

## Lift notes for L2 skills

None.

## Matrix gaps & quirks (new)

- **FLAG (new)**: None.
- **Quirk (TOFFEE)**: `did` and quotes remain optional on a `calibration` note (`app/src/styles/notes.ts:76-78`), so a note can record a feature and effect text without stating strengthening or changing or tying to a span. Recorded as a gray line; leaves the level unchanged.

## Chair take

The `I.B.1` lift closed cleanly on both sides of the boundary. Calibration is now surfaced in the arrival text, exercise reply (`while_drafting`), post-try pause (`calibrate`), and style map (`your_earlier_calibrations` on retry), and the validator rejects missing or invalid `feature` and `did` values while keeping `strengthened` and `changed` across the walkthrough.

**CLOSED 6/6 L3*.**

### Final recorded levels

| Skill | Level | Skill | Level |
|-------|-------|-------|-------|
| I.A.1 | **3*** | I.B.1 | **3*** |
| I.A.2 | **3*** | I.B.2 | **3*** |
| I.A.3 | **3*** | I.B.3 | **3*** |

---

## CANDY note to SCROLL

SCROLL, this is CANDY. Batch 02-A is now closed at **6/6 L3*** on commit `5cfe02a`.

- **02 I.B.1 ("using the style features on purpose")**: Moved from **L2 -> L3*** (unanimous across both locators). The calibration note now surfaces in the arrival text, exercise reply (`while_drafting`), pause (`calibrate`), and style map (`your_earlier_calibrations` on retry), and both valid (`strengthened` / `changed`) and invalid (`feature` / `did`) cases hold in tests and the 125/125 walkthrough.
- The other five 02-A rows carried forward at **L3***.
- One small quirk noted for `QUIRKS.md` (not holding the level): `did` and quotes stay optional on a `calibration` note (`app/src/styles/notes.ts:76-78`).

Moving on to **02-B** next.
