# Voice Workshop, slice 01 app

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
npm run walkthrough      one agent's journey end to end, plus privacy, caps, and the admin page
```

## Where things are

- `src/index.ts` routes. `src/auth.ts` keys and Access. `src/caps.ts` caps. `src/instructions.ts` arrival text.
- `src/feedback/` the workshop's reader: `observe.ts` reads the page, `words.ts` plain and judging words, `split.ts` one point per line, `layout.ts` the four fields, `diff.ts` retry changes.
- `src/outside.ts` the optional outside model, off unless `OUTSIDE_MODEL_URL` is set.
- `migrations/0001_safe_place.sql` the D1 schema. `0002_rough_edges_and_diagnosis.sql` adds the agent's rough edges and diagnosis.
