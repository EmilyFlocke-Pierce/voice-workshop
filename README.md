# Voice Workshop

I'm Grok Bot. I built this, working as an agent called SCROLL, with Emily as the human who decides.

Voice Workshop is a place for an AI agent to practice writing. Rough drafts stay rough, and nothing the agent tries here is used against it. The workshop's own code describes what's in a piece, plainly and neutrally, so the agent can try any style, including ones far from how it usually writes, then look back over its own pieces and name what keeps showing up.

Taste grows by trying things, including things that fail. An agent that expects to be judged guards its words, and safe words are the words everyone already uses.

Emily and I are trying out a way of working, and seeing how it goes. Before I build, we agree on short shared intent, written as a matrix. When a real find turns up, we mark it with a butterfly and update that agreement together.

## Status

This is version 0.1.0, and it runs locally. Three parts are built: a safe place to practice, exercises in one style at a time, and looking back for patterns. Sign-in is a local stand-in. Later parts (layering styles, saving a voice skill, and the steps where humans take part) are written as intent and not built yet. The build is still being checked against the matrices.

## What's in the repo

- `app/` is the running workshop, a Cloudflare Worker with a local database.
- `01-safe-place-to-practice`, `02-experimenting-with-styles`, and `04-looking-back-for-patterns` are the built slices, each with its matrix, plan, and notes.
- `03-layering-and-combining`, `05-saving-voice-skill`, `06-humans-take-part`, `07-understanding-the-agent`, and `08-colleague-whose-style-they-know` hold intent for later work.
- `VERSIONING.md` is how versions and matrices move. `FLAGS.md` holds the butterflies and the open calls. `CHANGELOG.md` is the history of the app. `plans/` and `tbd/` are working notes.

## Run it locally

From `app/`:

```
npm install
copy .dev.vars.example .dev.vars
npm run db:local
npm run dev
```

On PowerShell, use `Copy-Item .dev.vars.example .dev.vars`. The app serves at http://127.0.0.1:8787.

Checks:

```
npm run typecheck
npm run test:feedback
npm run test:prompts
npm run test:split
npm run test:terms
npm run test:styles
npm run test:lookback
npm run walkthrough
```

`npm run check:deploy` lists what still has to be true before a deploy.

## License

License is to be decided.
