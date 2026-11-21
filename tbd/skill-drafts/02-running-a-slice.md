---
name: running-a-slice
description: Use when a builder agent drives one Quilt slice run with Eddie, from topic through domain, thread, skill, and criteria to ready, including reopening a ready slice for edit or scratch and resuming an open run.
---

# Running a slice (draft)

## Before you start
- The project run is done, and the session is sliced. Get the slice ids with `GET https://quilt-system.dev/api/core/sessions/{id}/cut` (Authorization header only). The body has `slices`, each with `id`, `label`, and `section`. The stream does not send the ids, and there is no passport file; "passport" means this list.
- You have a slice report with WHAT / DOES / FOR / WHY, ending in its own `WHY:` line. The decider has said it's theirs, or it's shared.
- Only the builder talks to Eddie. The decider watches in the UI.
- Credentials: `Authorization: Bearer <key>` (raw key, no other prefix) on every call, plus `X-Session-Secret: <session secret>` on every phase2 call. Never print, log, or quote a key, token, or secret. A four-character prefix is fine for notes.

## Before the slices: the project run
- Open it: `POST https://quilt-system.dev/api/phase2/sessions/{id}/project` with `{"brief":"<report>"}`. Leave the connection open.
- The report is six lines in this order, with real line breaks: NAME, WHAT, DOES, FOR, WHY, then `BODY:` with the paragraph under it.
- If a line is missing, Eddie names it and the stream closes with HTTP 200. Fix the line and post again. A complete report keeps the stream open, with heartbeats while the team cuts.
- Answer the cut on `POST https://quilt-system.dev/api/phase2/sessions/{id}/answer`: `{"answer":"yes"}`, or `{"answer":"no","note":"<what to change>"}`.
- If the connection drops, call the project route again, wait until Eddie asks, then send yes or no.

## The call
1. Open the slice run: `POST https://quilt-system.dev/api/phase2/sessions/{id}/slices/{slice_id}/run`, with the slice report as `brief`. Keep the stream open.
2. While the seats work, the stream sends heartbeats. When an ask is stored, it sends `ask-ready`, then the ask.
3. Answer on `https://quilt-system.dev/api/phase2/sessions/{id}/slices/{slice_id}/answer`: `yes`, or `no` with a `note` saying what to change. Use the same slice id as the open run.
4. Repeat through the levels: **topic â†’ domain â†’ thread â†’ skill â†’ criteria**. The slice is ready when the stream sends `files`.
5. Take home `framework` and `criteria` (json and md). Check status on the monitor: `slice_runs[].phase2_status` = `ready`.

Never post to the project-level run path for slice work. One slice is one `/slices/{slice_id}/run`.

## Version: scratch, edit, resume
- **Resume.** Posting to a slice whose run is still open picks that run back up. Answer the waiting ask. Do not start fresh.
- **Ready slice.** Posting again makes Eddie ask: edit or scratch.
  - **Edit** copies the ready version into the next one. Name the level and the label: `delete domain X`, `rename skill old to new`. Send `done` to mark the copy ready.
  - **Scratch** starts the next version from topic.
- The earlier ready version stays intact either way. Only reopen a slice when the decider asks.
- After a resume, check that your answers land on the run id you expect.

## How to answer (lessons from real runs)
- **Criteria read-aloud.** Every criteria ask must show the L1 to L4 lines. If Eddie says you already heard them, or skips them, answer no and ask him to read them out. Never say yes to criteria you can't see.
- **Packed criteria.** Each line should carry one idea for one skill. Say no when a line pulls in a sibling skill, another domain, or an open brief note. Name the skill it borrowed from. Say yes after it's unbundled.
- **Name checks.** Watch for labels that repeat a locked skill, a near-duplicate, a label under the wrong thread, or a brief note dressed up as a skill. Say no and say where the label already lives. Tip: names of people or characters usually aren't skills. They are who a skill belongs to.
- **False locks.** If an ask says something is locked when you never said yes to it, it isn't locked. Check against your own answers.
- **Project-level choices belong to the decider.** If a project post asks whether to add something or change the release, that is outside slice work. Leave it for the decider.
- **Notes stay short and specific.** One change per note. Use the decider's words when the point is about taste.
- **Errors.** Errors come back as `happened`, `wrong`, and `next`. Stop. Record the time, the session id prefix, the slice id, and the run id. Leave a note: `POST https://quilt-system.dev/api/phase2/api/phase2-notes` with `{"session_id":"<id>","body":"<path, happened, wrong, next>"}`. Resume on the same run once it's fixed. Don't paper over it with a new version.

## After ready
Save the takehomes in the project folder by slice (for example `NN-NN-slice-name/criteria.json`). Write a short log: what changed, the run id, ask counts, and anything left open.

*Worked example: belly-tape "Walking out" ran v1 to v4. Edit removed names-as-skills. Resume finished v4 after a server error, and the earlier versions stayed intact.*



## Answer words (from Penny via Emily, Nov 15, 2026)
POST /answer body: {"answer": ..., "note"?: ..., "thread_id"?: ...}. Match the answer to the kind of ask:
- Sections recorded (add-section): "add" with note = section name only (a few words, first line, max 8), or "stay".
- Slice names on the ask: "yes", or "no" with a note saying what to change. "stay" is refused here.
- Stage ask: "yes", or "no" with a note.
- Slice run ready: "edit" or "scratch".
- Edit open: "done", or "edit" with a note like "delete skill Old name" or "rename skill Old name to New name". Level is domain, thread, or skill.
- Thread with status error: "resend" with thread_id from the ask.
