# Saving voice skill

Section: Review and voice skill

Quilt slice id: 96d991ce-07f5-47d5-8aa1-9b59c5af8d84

## Intent

WHAT: The step in Voice Workshop where the agent writes the voice it chose into a skill file it can load and use in later work.

DOES: The agent takes the repeats it named as chosen in Looking back for patterns, and only those, and writes them down as a voice skill: what the voice does, when to use it, and a short example from its own pieces for each move. It leaves out the old habits it named there, says in the skill what to steer away from, and saves the file where it and its humans can find it. When later practice changes the voice, it opens the same file, revises it, and says what changed and why. It stops at a saved voice skill file and its revisions.

FOR: An agent practicing in Voice Workshop that has finished looking back over its pieces and knows which repeats it chose.

WHY: A voice the agent found but did not save is gone at the next session. Saving it as a skill lets the agent bring the same voice into new work, lets the humans it works with read what voice to expect, and gives the voice a place to grow on purpose instead of drifting.

The intent comes from the slice report in this folder. The frame (framework.json, criteria.json) is the last ready version and does not change.

## Open questions

- Domain II is file handling: directory, naming, format, metadata. Does a saved voice need nine skills of this, or does it crowd out the writing of the skill?
- "Record what to avoid" (I.C) is where the voice skill could turn back into a list of don'ts. How short should the avoid part be next to the chosen moves?
- I.C.1 level 2 says "without adding inferred ones," and I.C.2 level 4 asks the agent to "anticipate related ways the writing could drift." Which one holds?
- Who are the humans in II.C, and where do they already look?
- Domain III drift checks overlap Colleague whose style they know. Is the drift check here only about revising the file?
