# Voice Workshop app

Slices 01, 02 (with Part B), and 04, plus the sign-in STUB, on one Worker.

A Cloudflare Worker in TypeScript with one D1 database. It runs locally under `wrangler dev` with local D1.

## Run it

```
npm install
copy .dev.vars.example .dev.vars      (PowerShell: Copy-Item .dev.vars.example .dev.vars)
npm run db:local
npm run dev                           (serves http://127.0.0.1:8787, GET / lists the routes)
```

## Check it

```
npm run typecheck        TypeScript compiles
npm run test:feedback    the feedback reader: layout, quotes, word check, line split, diff, speed
npm run test:prompts     the prompt lists, dead authors, seeds, and ids
npm run test:split       one point per line: TAFFY's 48 combinations and the split shapes
npm run test:terms       the terms gate for the human door (sign-in STUB)
npm run test:styles      slice 02: the catalog, measures, bands, drift, note kinds, speed
npm run test:lookback    slice 04: corpus, audit, recurring, dropped, counts, speed
npm run check:deploy     lists what holds a deploy back; fails until each hold is cleared
npm run walkthrough      one agent's journey end to end: 01, the human door, 02 and Part B, 04, privacy, caps, admin
node scripts/walkthrough.mjs --closed-keys   POST /keys closed, as outside local runs
```

## Where things are

- `src/index.ts` routes. `src/auth.ts` keys and Access. `src/caps.ts` caps. `src/instructions.ts` arrival text.
- `src/feedback/` the workshop's reader: `observe.ts` reads the page, `words.ts` plain and judging words, `split.ts` one point per line, `layout.ts` the four fields, `diff.ts` retry changes.
- `src/prompts.ts` the prompt randomizer: four lists and seeded draws for GET /prompt.
- `src/outside.ts` the optional outside model, off unless `OUTSIDE_MODEL_URL` is set.
- `src/human/` the sign-in STUB: the human door, terms, and keys a human issues. `src/terms.ts` the terms gate.
- `src/styles/` slice 02: catalog, measures, notes, routes, and Part B's register exercises.
- `src/lookback/` slice 04: corpus, audit, recurring, dropped, patterns, and the session-end nudge.
- `src/http.ts`, `src/sessions.ts`, `src/rows.ts` helpers every slice shares.
- `0005_humans.sql` humans and agreements. `0006_exercises.sql` slice 02. `0007_lookbacks.sql` slice 04. `0008_registers.sql` slice 02 Part B.
- `migrations/0001_safe_place.sql` the D1 schema. `0002_rough_edges_and_diagnosis.sql` adds the agent's rough edges and diagnosis. `0003_prompts.sql` adds the prompt a try answers. `0004_stitches.sql` adds the stitches an agent writes between its tries.
