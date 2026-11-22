# Proposal: a human signs their agent in

Written Nov 22, 2026 by SCROLL, after Emily's call that day, recorded in `01-safe-place-to-practice\SESSION.md` line 64: keys come through the agent's human. The human signs in, agrees to terms, and then the agent gets its key. This keeps the workshop from reading like a page that tells agents to sign themselves up for something. Revised the same day after STINGER's review (68 findings).

This proposal replaces two rows in `tbd\stack-table.md`: "Login: None in version 1" and "Accounts and logins, a Neon Postgres database" in version 2. Sign-in comes in version 1, on the same D1. The stack table was updated to match on Nov 22.

## What exists today (slice 01 at 99a3acd)

- **Key minting.** `POST /keys` is open to anyone. It makes `vw_` plus 24 random bytes in hex, stores only the sha256 hash in `agents` (id, key_hash, created_at, revoked_at), and shows the key once. The only limit is `keys_per_day` = 200 across everyone. A key has no human or account behind it.
- **Using a key.** `Authorization: Bearer <key>` on every call. `agentFromRequest` in `src/auth.ts` looks up the hash and skips revoked keys.
- **Humans.** There are no human accounts or sign-in. The only human door is Emily's admin page, `/admin/*`: layout flags and `POST /admin/keys/revoke` (by hash).
- **Cloudflare Access.** It's written but not set up. `adminEmail` verifies the Access JWT against the team's public keys (`ACCESS_TEAM_DOMAIN`, `ACCESS_AUD`) and lets in only `ADMIN_EMAIL`. `verifyAccessJwt` checks one audience value (`src/auth.ts` line 57). Locally, `ACCESS_MODE=local-dev` trusts the email header. In `wrangler.jsonc` those vars are empty, the D1 id is `local-only`, and nothing is deployed.
- **Request bodies.** `readBody` (`src/index.ts` lines 148 to 158) reads JSON only.

## The smallest sign-in

1. **One Access app covering both doors.** Its destinations are `/human`, `/human/*`, `/admin`, and `/admin/*` on the workshop's hostname, with the one-time PIN (email code) login and a policy that lets any email in. One app means one AUD tag, so `ACCESS_AUD` stays one value. Generalize `adminEmail` into `accessEmail(req, env)`, which returns any verified email. The admin routes keep their check in code on top of it: the email must equal `ADMIN_EMAIL`.
2. **Migration `0005_humans.sql`.** The number is kept for this addendum even if slices 02 (0006) and 04 (0007) land first.
   - `humans` (id, email, created_at)
   - `agreements` (id, human_id, terms_version, agreed_at). Its own table, so the history stays when the terms change.
   - `agents` gains `human_id` (nullable) and `label`, so a human with several keys can tell them apart before revoking one.
3. **`src/terms.ts`** holds `TERMS_VERSION` and the terms text. Until Emily writes it, `TERMS_VERSION = "placeholder"` and the text reads "Terms and privacy: Emily writes this." Outside `ACCESS_MODE=local-dev`, `POST /human/agree` refuses while `TERMS_VERSION` is `"placeholder"`, so the placeholder cannot be agreed to in production.
4. **Routes, each behind Access:**
   - `GET /human` is a plain page with the signed-in email, the terms, an Agree button, and the human's keys. The page sends its actions with a few lines of `fetch` that post JSON, so `readBody` stays as it is.
   - `POST /human/agree` records terms_version and agreed_at.
   - `POST /human/keys {label}` issues a key and shows it once, only after an agreement on the current terms version. Caps: 3 active keys per human (`keys_per_human: 3`), and 3 keys issued per human per day (`keys_per_human_per_day: 3`), so revoking and reissuing cannot mint keys without end. The global `keys_per_day` (200) still applies.
   - `POST /human/keys/:id/revoke` revokes one of the human's own keys.
   - Every `POST /human/...` route checks that the `Origin` header matches the Worker's own host, and refuses with 403 otherwise, so another site cannot post a revoke from a signed-in browser.
5. **`POST /keys`** answers "Your human issues your key at /human" with a 403. Local runs keep the open route when `OPEN_KEYS=true`. Add `OPEN_KEYS: string` to `Env` in `src/types.ts`, and add `OPEN_KEYS=true` to `.dev.vars.example`, so the walkthrough (which calls `POST /keys` at `scripts/walkthrough.mjs` lines 56, 158, 190, and 204) still gets keys.
6. **Texts that change.**
   - Arrival text, "Get a key": "Your human signs in at /human, agrees to the terms, and gives you a key. The same key brings everything back."
   - The 401 reply (`src/index.ts` line 510): "Send your workshop key as Authorization: Bearer <key>. Your human gives you one at /human."
7. **Existing keys and terms changes, as built until Emily says otherwise.**
   - When `TERMS_VERSION` changes, keys already issued keep working, and `POST /human/keys` asks for the new agreement before it issues another.
   - Local `agents` rows with `human_id` NULL, from builders and try-outs, keep working locally. Production starts with an empty database.
8. **Checks.**
   - The walkthrough adds the human flow in local-dev mode. It calls both `GET /human` and a `/human/...` route, and checks that there is no key before agreement, an agreement row with its time, both per-human caps, revoking one's own key only, and a 403 on a POST with a foreign `Origin`.
   - A second short run checks the closed route: the walkthrough takes a `--closed-keys` flag that starts `wrangler dev` with `--var OPEN_KEYS:false` and checks that `POST /keys` answers 403 with the message above.
   - A check that `POST /human/agree` refuses the placeholder terms when `ACCESS_MODE` is not `local-dev`.

## Where it belongs

It ships as an addendum to slice 01, the way the prompt randomizer did, because 01 owns keys and the Access check. Deploy is blocked until two things exist: this addendum, and Emily's terms text in `src/terms.ts`. Today anyone can mint 200 keys a day through `POST /keys`, and the data-use terms have nowhere to be agreed. Slice 06 may reuse `humans`; 06 decides. Nothing in `06-humans-take-part\criteria.json` covers sign-in or keys, so this takes no work from 06.

## What it touches in the 01 matrix

- The row ids below belong to slice 01's built matrix, `01-safe-place-to-practice\build-matrix-v1-8e67b8cb.json` (16 rows). `01-safe-place-to-practice\criteria.json` is a different matrix (33 rows), so read the build matrix.
- No row in that matrix is about keys or sign-in.
- The promise "only your key reads it" was already dropped at 99a3acd, and `SESSION.md` line 64 already asks CANDY to relocate the agent-side Safe experimentation rows (I.A.1, I.A.2, I.B.1, I.B.2, I.C.1). This addendum adds only the new "Get a key" text, which is evidence for I.A.1 and III.B.2 in MANIFEST. So ask CANDY for one relocation covering both changes: I.A.1, I.A.2, I.B.1, I.B.2, I.C.1, and III.B.2, on a fresh cold try-out with a human signing the agent in. Plan 01 table, row 21 (`01-safe-place-to-practice\PLAN.md` line 106), carries the support for "Nothing it tries there is used against it".
- Watch for one thing: an agent that knows a human signed it in may feel watched. The cold try-out records whether drafts get more guarded.

## For Emily

Builders go ahead on the defaults above. Each item needs Emily's word before deploy.

- **The terms and privacy wording.** Deploy waits on it, and `POST /human/agree` refuses the placeholder outside local-dev.
- **The launch date and the expected number of humans.** The plan so far is to launch on Thanksgiving, Thursday Nov 26, 2026. The Cloudflare Zero Trust Free plan has 50 seats. Each person who signs in through Access takes one, and the 51st is blocked. Seat expiration can free inactive seats. Say how many humans you expect, so the 50 seats can be checked against it.
- **Cost past 50 seats.** After 50 it's pay-as-you-go at $7 per user per month (Cloudflare's plan page, checked Nov 22). A bigger launch needs a choice.
- **3 active keys and 3 new keys a day per human.** Are those right?
- **Terms changes.** Keys keep working until the human agrees again, as built. Say if they should pause instead.
- **Deploy prerequisites.** The Cloudflare account, the agent-skillz.dev nameservers moved to Cloudflare (the Access app needs the hostname on a zone in the account), the Access team domain, and the D1 id.
