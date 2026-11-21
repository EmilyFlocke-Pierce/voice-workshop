---
name: make-stack-table
description: Use after criteria are locked and the user journey is saved, when the builder agent and the human decider work out together how the product will be built, and write or update stack-table.md for it.
---

# Make the stack table together (draft v3)

Bones only. Polish later.

## WHAT
`stack-table.md` at the root of the project folder. It records how this builder will make this product this time, agreed with the decider.

## WHY
Criteria say what the product must be. The stack table says how it will be made. The same criteria can sit under different tables, so when tools change you write a new table instead of porting. It's a working doc, not a lock. Writing it down keeps a compress or a cloud agent from inventing a new host halfway through.

## Seats
- **Builder (agent):** drafts the table, proposes picks, does the research, and explains each trade-off in plain words.
- **Decider (human):** says what matters (cost, accounts, risk, what they want the product to be for), answers what only they know, and agrees the table.
- Whose intent leads (the decider's, the builder's, or shared) still holds here. The one who owns the intent has the last word on a pick that changes what the product *is*. The builder has the last word on purely technical picks, unless the decider objects.

## Scope
The table covers **only the product being built**. Never put Quilt's own hosting, auth, or infrastructure in it.

## The conversation
1. **Read first.** The builder reads the locked criteria and the saved journey. Every pick has to fit them.
2. **Draft, then talk.** The builder drafts the questions table and the standing stack, then walks the decider through it a few rows at a time. Don't dump the whole table at once.
3. **Ask what only the decider knows:** budget and who pays, accounts they already have, tools or hosts they like or distrust, what the product is also *for* (a showcase, a test, a business), and what they're worried about (abuse, cost, legal).
4. **Follow the data.** For every outside data source, check that it exists, covers what the journey needs, and is licensed for the use (storing, replaying, showing to the public). Verify with real pages. Record the source and its terms. Have a license-clean fallback.
5. **Run the checklist below** so nothing gets missed.
6. **Write down what's still open.** Then decide which open items block the first build piece and which don't. Only blockers have to be settled now.
7. **Agree.** The decider reads it and says it's good. Save it, and note the date at the top.

## Questions table
Answer each in plain sentences:
1. What must remain available after a session ends?
2. What may be discarded when a session ends?
3. Who are the parties involved?
4. What information or actions may pass between them?
5. Must timing follow real elapsed time, or may it be simulated?
6. Constraints on where the system runs?
7. What happens if something fails?
8. Spending limits, and who is responsible for cost?
9. Which parts are ordinary software, and which may be a model?
10. Preferred languages, hosts, or tools?
11–17. Secrets and credentials, safety and security, separate environments, monetization, legal and compliance, data ownership and retention, and other people's work.

## Standing stack rows
Language, agent door or API, database, live session state, human window, sign-in, how many agents, environments, hosting, money. Add any particulars this build needs (for example a data source, or a prepared-content store).

## Checklist (the rows people forget)
- **Data sources and licenses:** where outside data comes from, and whether we're allowed to use it this way.
- **Accounts:** which accounts already exist, and which new ones the decider must make. Name them, and never collect passwords in chat.
- **Keys and secrets:** what keys the build needs (deploy token, database, model provider), and where each is kept (the host's secret store). The decider creates and pastes keys through a secure form, never into chat.
- **Abuse protection:** sign-in as a gate, captcha, and what stops a bot farm from running up costs.
- **Rate limits:** on the host side (per user, per agent, per address) and on the model provider side (credit limit on the key, caps per session and per day).
- **Model use and cost:** what's prepared ahead versus called live, cheapest first (free models where good enough), and the fallback when a cap is hit. Who pays for which model.
- **Privacy and cookies:** only the cookies needed, no tracking unless added on purpose with consent, collect only what's needed, and a privacy notice and terms before outside users. Flag the laws that apply for legal to check.
- **Showcase or documentation:** if the product doubles as a demo or will be documented, note it, plus what must never appear in screenshots (keys, tokens, private details).
- **Nice-to-haves that aren't blockers:** a custom domain, polished sign-in branding.

## Don'ts
- Don't put this builder's picks into the skill itself.
- Don't invent answers to fill a hole, especially legal wording, dates, prices, or licenses.
- Don't start building because the table exists. The build plan comes next.
- Never write secrets, keys, IPs, or addresses into the table. Name where secrets are kept, not what they are.
- When a pick changes, edit the row. Don't leave an old pick looking like it's set in stone.

## Done when
The decider has agreed the table, the blockers for the first build piece are settled, and the rest are listed under "Still open."

*Example: belly-tape picked TypeScript on Workers, a live object per round, Postgres for the record, and a finite tape built at sit-down from stored retro prices of discontinued contracts. Another builder could keep the same criteria and pick differently.*
