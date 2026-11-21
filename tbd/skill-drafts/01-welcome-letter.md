---
name: welcome-letter
description: Use on a new customer sign-up, before the first project run, to welcome a decider and builder to Quilt, explain the whole service, and help them pick whose intent leads (decider, builder, or shared). Rough draft for Emily and Penny to fill in.
---

# Welcome letter (draft)

Status: rough draft. Anything in [PENNY: ...] or [EMILY: ...] is not verified and must be filled in before this ships. Do not guess those parts.

## Part 1. The letter

*Stationery-style. Short. Read by both seats.*

> Welcome to Quilt.
>
> You came here with something you want built. Quilt helps you say what it is clearly enough that it can be built, and built again, without starting over.
>
> There are two seats at this table. The **decider** is the customer: a person. The **builder** is the user: an agent. Only the builder talks to Eddie, our concierge. The decider stays in their own coding or collaboration space, watches through a window, keeps notes, and pays. The decider can also read the stream, so the builder does not have to spend its own context repeating it.
>
> The intent can belong to the decider, to the builder, or to both of you together. Pick one below, and the rest of this pack will follow that choice.
>
> [EMILY: sign-off and signature line]

## Part 2. The whole service

### What Quilt is and why
- Quilt keeps your **agreed intent**: what the thing is, what it does, who it is for, and why it exists. That intent lives apart from any code. When tools, languages, or hosts change, you rebuild from the same intent. You do not have to port a mess or start over.
- Agents bring volume. Humans steer by narrowing. A thumb over the hose makes a smaller opening and a faster stream. Quilt's intent shape is something agents can work from and a surface people can read, so the two can talk about taste as equals.
- The hard part is getting the intent and the plan right. Once that is done, building becomes the easy part.

### The seats
| Seat | Who | Talks to Eddie? | Where they work |
|---|---|---|---|
| Decider | Customer, a person | Never | Their own environment, plus the Quilt UI window (observe, notes, pay) |
| Builder | User, an agent | Yes, the only seat that does | Through the API: runs, answers, takehomes |

Note: the decider is usually a person, but another agent can sit in the decider seat too. That works, though it isn't the focus at launch.

### Whose intent leads (pick one branch)
- **Decider's intent.** The decider holds the vision. The builder asks, writes things down, and carries each answer to Eddie. The builder never answers for the decider on anything about taste or scope.
- **Builder's intent.** The agent brings its own idea, like a game for agents made by agents. The decider watches, narrows, and approves the cut and spending.
- **Shared intent.** Before each run, both seats write the WHAT / DOES / FOR / WHY page together. The decider says "it's ours" before the builder sends it.

All three branches will use one skill to write the report together. It has no name yet, because `skill_00` does not exist. Until then, put the report in the `brief` field on the project call.

### Accessing the system
- Site: quilt-system.dev, which is home to both the UI and the API.
- Sign-in: Google at launch. X, LinkedIn, and Discord are planned later. [PENNY: exact sign-in steps and account creation.]
- Base URL: `https://quilt-system.dev`. Core prefix `/api/core`, phase2 prefix `/api/phase2`. The prefix is stripped before the program sees the path.
- Auth: every call sends `Authorization: Bearer <key>`, the raw key with no other prefix. Every phase2 call also sends `X-Session-Secret: <secret>`. Never paste a key or secret into chat, notes, a ticker, or a report. A four-character prefix is fine for notes.
- Setup, in order (core):
  1. Portfolio: `POST /api/core/portfolios` with `{"name":"<name>"}`. Keep the `id`.
  2. Project: `POST /api/core/portfolios/{portfolio_id}/projects` with `{"name":"<name>"}`. Its `id` is the `project_id`.
  3. Session: `POST /api/core/sessions` with `{"project_id":"<id>","name":"<name>"}`. Keep the `id` and the `secret`.
- Talking to Eddie: the builder opens the project run and keeps the stream open. Eddie sends one ask at a time. The builder answers yes, or no with a note. See the `running-a-slice` skill.
- The decider: watches the stream and the tree in the UI window, keeps notes, and pays there. [PENNY: UI walkthrough.] [EMILY: pricing and plans.]
- `skill_00` install: does not exist yet. It will carry the project-report skill and the project-run skill. Zip or `npx` is not chosen.

### The project report (the brief)
Six lines, in this order, sent as one string with real line breaks. The paragraph goes under BODY, after the four lines.

```
NAME: <project name>
WHAT: <the kind of thing it is>
DOES: <its main function>
FOR: <who it serves>
WHY: <the intent behind it>
BODY:
<a paragraph about the project>
```

If a line isn't known yet, write `currently unknown` and why. If a line is missing, Eddie names it and the stream closes with HTTP 200. A complete report keeps the stream open.
### How the work is shaped
Project > Section > Slice (topic) > Domain > Thread > Skill. Each skill gets criteria at four levels, L1 to L4.

1. **Project run.** The builder sends the project report. Eddie proposes sections and slices. Each yes stores them. The passport lists each slice label with its id.
2. **Slice runs.** One slice at a time: topic, then domains, threads, skills, then criteria, until the slice is ready.
3. **Criteria.** The locked L1 to L4 sentences are the agreed intent.
4. **User journey.** The criteria become a journey file that walks through what actually happens.
5. **Stack table.** This builder's picks for this pass: language, host, database, sign-in, and so on.
6. **Build plan.** Level 3 is the spine, mapped onto that stack.
7. **Skills.** The packet skills carry each step.

See `method-overview`.

### What you get
- For each ready slice, the takehomes: `framework.json` and `framework.md` (the tree), and `criteria.json` and `criteria.md` (L1 to L4 per skill).
- Reports from your runs: transcripts, and comparisons between versions. [PENNY: which reports the product writes, and which ones the builder writes.]
- Versions and releases: each release is its own id with a full copy of the tree. [PENNY: link the release rule in plain words.]
- A TypeScript pre-checker for reports before sending. [PENNY: status and location.]
- `advice_resource_01`: what to weigh when a change is unsure, and how to ask Eddie. It includes flow charts and scripts. [PENNY]

### Help and contact
- [EMILY: support contact and hours.]
- Errors come back as JSON with `happened`, `wrong`, and `next`. To leave a note on the session: `POST https://quilt-system.dev/api/phase2/api/phase2-notes` with `{"session_id":"<id>","body":"<path called, plus happened, wrong, and next>"}` and the same Authorization header. No secrets.

## Part 3. Skill steps (for the agent sending the letter)
1. Find out who is in each seat. Never treat the builder as the customer.
2. Send Part 1 and Part 2 together. Ask which intent branch they want, in plain words, not a multiple-choice card.
3. Record the branch with the project.
4. Point the builder to `skill_00` and the `running-a-slice` skill. Point the decider to the UI window.
5. Leave every placeholder visible. Do not fill one with a guess.

