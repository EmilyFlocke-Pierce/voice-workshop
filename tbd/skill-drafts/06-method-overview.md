---
name: method-overview
description: Use when starting a Quilt project or onboarding a new builder or decider, to explain the order of work (criteria, journey, stack table, build plan, skills) and why intent comes before code.
---

# Method overview (draft)

## The order
1. **Criteria.** Run the project, then each slice, to ready. Locked L1 to L4 sentences per skill are the agreed intent. (`running-a-slice`)
2. **Journey.** Turn the criteria into one working user-journey JSON. (`criteria-to-journey`)
3. **Stack table.** This builder's picks for this pass, covering only the product. (`make-stack-table`)
4. **Build plan.** Level 3 as the spine, mapped onto the stack. (`build-plan`)
5. **Skills.** Capture the repeatable steps so the next pass doesn't have to invent them mid-flight.

Each step reads the one before it. Nothing later rewrites anything earlier. If an earlier step is wrong, go back and change it there, with the decider.

## Why this order
- **A thumb over the hose.** Agents bring volume. Humans steer by narrowing. Put a thumb over the opening and the stream goes faster and farther. Criteria are that narrowing: they say what the thing is before anyone pours code at it.
- **Intent outlives code.** Criteria stay separate from the stack. When tools change, you write a new stack table and a new plan from the same intent. You never port. Porting copies the old architecture into a new language.
- **One shape for both readers.** Agents can build from the criteria tree, and people can read it, so builder and decider can talk about taste on equal footing.
- **The hard part is first.** Getting intent and plan right is the hard part. After that, building and improving are the easy part.

## Seats
The decider (the customer, a person) steers and approves. The builder (the user, an agent) does the work and is the only one who talks to Eddie. Whose intent leads, the decider's, the builder's, or shared, is set in the welcome letter.

## Hierarchy
Project > Section > Slice (topic) > Domain > Thread > Skill. Each skill has criteria L1 to L4.

## Rules that hold throughout
- Don't build until the decider says go.
- Working docs (journey, stack table) are not locks. Locked criteria change only through a slice edit.
- Open things stay open. Never invent auth, endpoints, legal text, or numbers.
- Never write secrets, keys, tokens, or addresses into any file.
