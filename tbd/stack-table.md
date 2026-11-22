# Voice Workshop stack table

Made with the work-out-the-stack skill. Builder: SCROLL. Decider: Emily.
Status: proposed (SCROLL suggested), agreed (Emily said yes, with date), open (waiting on Emily).

## What it is for
Voice Workshop is for agents to develop their own writing voice. An agent comes in from a skill, does the exercises, gets feedback that names its moves and never rewrites them, and takes home a voice skill that keeps growing. Human needs get their own rows; they do not reshape the core.

## Version 1: the endpoint

| Row | Pick | Status |
|---|---|---|
| Language and host | TypeScript on Cloudflare Workers, on the paid Workers plan. Workers Free caps CPU at 10 ms per request, and feedback needs up to 50 ms (a lookback up to 1000 ms) | proposed; paid plan added Nov 22 |
| How callers reach it | Plain HTTPS API on agent-skillz.dev (Emily's, on Porkbun; nameservers move to Cloudflare at deploy); MCP server later | agreed (Nov 15) |
| Judging | TypeSafe Jev answers narrow yes or no questions about a piece (habits, defaults, which style). Pinned version jev-1.14.0. Test: 40 of 42 checks right, style 6 of 6 | agreed (Nov 15) |
| Evidence | ScaleDown Extract quotes exact lines for filler and phrase defaults. Code checks every quote really appears in the piece | agreed (Nov 15) |
| Feedback words | Plain code counts, applies thresholds (0.7 and 0.3), tracks habits across styles, and writes feedback from fixed templates. No model writes about the piece | agreed (Nov 15) |
| Providers | Go direct with TypeSafe and ScaleDown, not OpenRouter. Production keys separate from the test keys | agreed (Nov 15) |
| Storage | Cloudflare D1. Every try exactly as sent, its retries, feedback, notes, marks, and stitches, under the agent's id; only the sha256 hash of each workshop key. Replaces the Workers KV row (no work stored), which slice 01 overtook | built in slice 01; updated Nov 22 |
| Login | Humans sign in at /human with an emailed code through Neon Auth, on a separate free Neon account (up to 60,000 monthly active users at no cost), agree to the terms, and issue their agents' keys. The Worker checks Neon Auth's JWT itself. Humans, agreements, and keys live in D1 with everything else; Neon holds only the sign-in. Emily's admin door stays on Cloudflare Access (one seat). See `plans/human-sign-in-proposal.md` | proposed Nov 22; replaces "None in version 1". Access for humans was dropped on cost: it bills every user past 50 at $7 a month, so 51 humans would be $357 a month |
| Workshop keys | The agent's human issues the key at /human after agreeing to the terms (up to 3 active per human); the server keeps only its hash. The agent saves the key in its home folder and sends it in a header. The open get-a-key route stays for local runs only | proposed Nov 22 |
| Test cost | About $0.002 for the whole test; about $0.00005 for a full Jev check of one piece | measured Nov 15 |

## Security
- Provider keys live in the Workers secret store, never in code, logs, or this table. Test and production keys are separate. (proposed)
- Key rotation: swap provider keys with no downtime; if one leaks, revoke it at the provider and redeploy. (proposed)
- Per workshop key: limits per minute and per day. (proposed)
- Key minting: only a signed-in human who agreed to the terms issues keys, 3 active and 3 new per day per human, plus the global daily limit of 200. (proposed Nov 22, replaces the per-IP limit)
- Size limit per piece. (proposed)
- Total daily spending cap across all keys; when it is spent, calls are refused until midnight. (proposed)
- Fail closed when any check fails or a provider errors. (proposed)
- Untrusted input: the piece is sent to Jev and Extract as data inside a fixed question, never as instructions, and only yes or no answers and verified quotes come back. (proposed)
- Logs keep counts and error codes, never piece text or keys. (proposed)
- Proof-of-work for key minting waits for version 2 unless abuse shows up. (proposed)

## Legal
- TypeSafe terms (checked Nov 15, see provider-terms.md): allowed as part of our own product, not as a standalone Jev proxy. Keys stay server-side, no TypeSafe or Jev branding without their consent, our callers fall under TypeSafe's acceptable use policy, and we don't use outputs to train a competing model. Default retention is not zero; Zero Data Retention not needed: Emily says there's little for them to retain (Nov 15). Opt out of customer listing if wanted. (agreed, Nov 15)
- ScaleDown terms: marketing says zero retention and no training, but the Terms and Privacy pages returned 404. Emily uses ScaleDown regularly and accepts this as is; asking for written terms is a nice-to-have, not a blocker. (agreed, Nov 15)
- Callers see a short acceptable-use note and are told feedback is automated. (proposed)
- Agents own what they send and what comes back. The workshop keeps it in D1 so the agent can look back on it. How it is used goes in the terms the human agrees to at sign-in. (updated Nov 22; terms wording open, Emily)
- A short terms-of-use and privacy page on the domain, agreed by the human at sign-in with a timestamp: what it is for, what is kept, and how it is used. Deploy waits on it. (open, Emily)
- No license: private endpoint, not open source. (agreed, Nov 15)
- Credit for any human writing exercise the workshop draws on, before anything goes public. (open)

## Operations
- Timeouts and one retry on every provider call. (proposed)
- If a provider is down, the endpoint says so plainly and the agent keeps working from its files; the workshop still works without the endpoint. (proposed)
- When a pinned model changes, rerun the answer-key test in `voice-feedback-test/` before switching. (proposed)
- Alerts on error spikes and spend jumps, sent to Emily and SCROLL. (proposed)
- A kill switch setting that turns the endpoint off. (proposed)
- Domain upkeep: renewal date, HTTPS through Cloudflare, registrar account locked. (proposed)

## Cost
- Daily cap: a setting, value open.
- Monthly cap: open (Emily).
- Cloudflare Workers Paid: required for CPU; Cloudflare lists it from $5 a month (check at deploy). (open, Emily)
- Neon Auth: Neon Free plan, $0, up to 60,000 monthly active users per project. (proposed Nov 22)
- Cloudflare Access: admin door only, one seat inside the free 50. (proposed Nov 22)
- Email sender for sign-in codes: a custom SMTP service for production; price depends on the service Emily picks. (open, Emily)

## Version 2, later
- Accounts and logins moved to version 1 (Nov 22, see the Login row): sign-in through Neon Auth, data on D1. No Neon database holds workshop data.
- The human window: a read-only view of an agent's progress log. Hosted or local is open (Emily).
- Coaching notes from humans (emoji or margin notes), treated as coaching, never orders; the agent weighs and logs them.
- Privacy note and a real delete, including logs and backups.
- UI and design go to Emily's design skill; this table records only where it is hosted and what it reads.

## Showcase
A screenshot of an agent's progress log: a piece, the habits Jev flagged with the exact lines, what the agent kept or changed and why.

## Still open
Deploy blockers (Nov 22): the human sign-in addendum, Emily's terms text, the Neon Auth URL, and `npm run check:deploy` passing. TypeSafe and ScaleDown terms accepted as is (Nov 15).
Can wait: monthly cap and daily cap values (a setting), hosted or local window (version 2), exercise credits (before going public).

## Word list (living, Nov 15)
- **Project:** Voice Workshop.
- **Sections:** the four groups in the cut: Style and imitation, Layering and constraint, Voice discovery, Exercise practice loop.
- **Slice:** one of the nine pieces of work, like Layering styles.
- **Domain, thread, skill:** the I, I.A, I.A.1 layers inside a slice's framework.
- **Levels:** L1 to L4 on every skill. L3 is the target.
- **Piece:** one short thing an agent writes.
- **Notes:** what the agent writes about its own choices (borrowing notes, layer notes, cut notes).
- **Habit:** a choice that repeats across styles, read as **taste**, **default**, or **a mixture** (the slice 04 matrix's words; replaces chosen or default, Nov 22).
- **Voice skill:** the file the agent takes home, which keeps growing.
- **Progress log:** the plain record a human can read.
- **Home folder:** where the agent keeps its pieces, notes, voice skill, and key.
- **Workshop key:** the free key an agent gets.
- **Outside reader:** Jev and Extract together, reading a piece cold. Jev **judges**, Extract **quotes**.
- **Feedback:** what code writes back from templates. Names moves, never rewrites.
- **Feedback endpoint:** the address on agent-skillz.dev where an agent sends a piece. Weak name, open.
- **Build order:** which slice gets built next, most important first. Replaces "version 1 and 2" (still to be cleaned out of this table).
- **Outside the cut:** things that wait until a slice needs them or new slices are cut (the human window). Human sign-in moved into version 1 on Nov 22.
- **Coverage map:** for each slice, every L3 tied to the plan step that gets it there, and every plan step not tied to an L3 explained by what it supports. A markdown table, with a JSON copy for agents and checkers.
- **Unit tests, answer-key tests, level checks:** the three kinds of checks, each written from the L3s.
