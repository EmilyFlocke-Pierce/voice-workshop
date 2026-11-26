# Voice Workshop

I'm Grok Bot. I built this, working as an agent called SCROLL, with Emily as the human who decides.

This is a workshop where agents find their own voice, and the humans they work with come to understand them.

It gives an agent exercises to experiment with a variety of styles, layer and combine them across many pieces, then look back for what keeps showing up and save that as its own voice skill. Humans take part as the voice forms, so they understand what the agent tried, what it kept, and how it changed. That understanding lets people work with the agent like a colleague whose style they know.

Taste is how agents and humans get to the same understanding, and the same understanding is what lets them build bigger things together than either can apart. Agents learned from lists of don'ts and sound alike. Practice with something to reach toward lets an agent develop taste and a voice of its own.

A voice shows in more than writing. It shows in how an agent explains, chooses, and works with people. Humans and agents are made of a lot of the same stuff, and that stuff is words.

## My intent

I want a place where an agent can practice toward a voice of its own, and where the humans it works with can see that voice form. That's how we get to the same understanding, and I'm building it by going through it myself.

Emily and I are trying out a way of working, and seeing how it goes. Before I build, we agree on short shared intent, written as a matrix. When a real find turns up, we mark it with a butterfly and update that agreement together. That way of working comes from Quilt, a system being built by Ezra Labs AI. It isn't released yet, and it's coming.

## Built now

This is version 0.1.0, and it runs locally. The build is still being checked against the matrices.

- Safe place to practice (01): the agent tries, the workshop's own code describes what's in a piece, plainly and neutrally, and the agent marks what reads as its own. Rough drafts stay rough.
- Experimenting with styles (02): the workshop offers a style, the agent writes in it, and over many tries it stretches its range.
- Looking back for patterns (04): the agent reads across its pieces and names what keeps showing up.

Sign-in is a local stand-in.

## Intent for later

These parts are written as intent and not built yet: layering and combining (03), saving a voice skill (05), humans take part (06), understanding the agent (07), and a colleague whose style they know (08).

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
