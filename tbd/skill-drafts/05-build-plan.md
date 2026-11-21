---
name: build-plan
description: Use after criteria, user journey, and stack table exist, to write a build plan whose spine is each skill's Level 3 sentence mapped onto the chosen stack; rebuild from intent, never port old code.
---

# Build plan (draft)

## WHAT
A `PLAN.md` (one per section, or one per build pass) at the project root, next to the stack table.

## WHY
The plan has to name files, hosts, and a build order, and those only exist once there's a stack. Level 3 is the spine because it's the bar where a skill is actually carried through: each L3 sentence becomes something the code must do and a check that proves it. Rebuild from that intent onto the stack you chose. A port copies old structure, and if that structure was nonsense, a new language holds it with more confidence because now it compiles.

## Steps
1. **Copy the intent in, unchanged.** The skill set, the labels, the shape (Section > Slice > Domain > Thread > Skill), and each skill's Level 3 sentence exactly as it was locked. Note L4 where it raises the bar.
2. **Name the patient.** The code or service this plan builds or changes, and where it lives.
3. **Skill-to-code map.** For each skill: the L3 sentence, then the file, module, or component on the stack that carries it, then whether it's ordinary software or a model (from stack question 9).
4. **Build sequence.** Order by the journey: the entry and door first, then the main loop, then endings, then the views. Each step names the skills it lands.
5. **Out of scope.** Anything the journey or stack table lists as open or later. Don't build it quietly.
6. **Verify.** One check per L3 sentence (a test, a probe, or an observable behavior). A skill isn't done until its L3 check passes.
7. **Open questions.** Carry over from the journey and the stack table. Don't resolve them in the plan.
8. Have the decider read it. Build only after they say go.

## Don'ts
- Don't rewrite Level 3 to fit the code. If L3 is wrong, that's a slice edit, and it's the decider's call.
- Don't read old code for structure. Read it only to learn lessons, and only if the decider asks.
- Don't pick a stack in the plan. Use the stack table.

*History: an earlier plan shape (copy skills and L3, then patient, map, sequence, out of scope, verify) came from the first prototype pass. That shape stays. What's new is the order: the stack table comes before the plan.*

## Level 3 touchstone (check every piece)
1. **Smooth case (Level 2):** it works when everything goes as expected. This is the floor.
2. **Pushed case (Level 3):** name what pushes on it, like a retry, an early start, drift, or an odd input. It holds, notices, and restores itself. Each push gets a test.
3. **Teaching case (Level 4):** it also shows the player why. This is extra, usually carried by the writing, and built when we choose it.

A piece is at Level 3 when each of its Level 3s has a passing pushed-case test, with a Level 2 test beside it so the difference shows.

## Shape of each moment in the plan
1. **Header:** where it runs, the stack, and the services. Mark anything that could be a safety or cost concern with ★.
2. **Level 3s that apply,** in full text. One Level 3 can apply to several moments.
3. **What I'll build,** and how each piece makes those Level 3s true.
4. **Tests:** a Level 2 smooth case and Level 3 pushed cases.
