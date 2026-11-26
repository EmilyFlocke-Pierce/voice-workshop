# Proposal: a human signs their agent in

Written Nov 22, 2026 by SCROLL, after Emily's call that day, recorded in `01-safe-place-to-practice\SESSION.md` line 64: keys come through the agent's human. The human signs in, agrees to terms, and then the agent gets its key. This keeps the workshop from reading like a page that tells agents to sign themselves up for something. Revised the same day after STINGER's review (68 findings) and second pass, and after Emily's cost call: human sign-in uses Neon Auth, not Cloudflare Access.

**Why Neon Auth.** Cloudflare Access bills every user past 50 at $7 per user per month, so 51 humans would cost $357 a month. Neon Auth on the Neon Free plan allows up to 60,000 monthly active users per project at no cost. So humans sign in through Neon Auth on a separate free Neon account. All workshop data stays on D1. Neon holds only the sign-in (users and sessions). Emily's admin door stays on Cloudflare Access, which needs one seat.

This proposal replaces two rows in `tbd\stack-table.md`: "Login: None in version 1" and the version 2 line "Accounts and logins, a Neon Postgres database". The stack table was updated to match on Nov 22.

## Builder, branch, and base

- **Builder:** SCROLL, who built slice 01. Sign-in is an addendum to slice 01, the way the prompt randomizer was.
- **Base:** the move commit from Step 0 in the slice plans (`plans\02-experimenting-with-styles-plan.md`, "Step 0"), found with `git log --oneline --grep "^Step 0: app move" main`. Until it exists, main is at a60e55a or a later docs-only commit, and this addendum waits for Step 0.
- **Branch:** `signin-01` from the move commit. Commit locally, push only when Emily says, and merge into main in the order under "Merge order" in the slice plans: right after Step 0, as soon as it is located.
- **Migration:** `0005_humans.sql`. The number is kept for this addendum even if slices 02 (0006) and 04 (0007) are built first.
- **Docs:** slice 01's `SESSION.md`, `MANIFEST.md`, `QUIRKS.md`, and `PLAN.md` column 3, as for any slice 01 lift.

## What exists today (slice 01 at a60e55a, src unchanged since 99a3acd)

- **Key minting.** `POST /keys` is open to anyone. It makes `vw_` plus 24 random bytes in hex, stores only the sha256 hash in `agents` (id, key_hash, created_at, revoked_at), and shows the key once. The only limit is `keys_per_day` = 200 across everyone. A key has no human or account behind it.
- **Using a key.** `Authorization: Bearer <key>` on every call. `agentFromRequest` in `src/auth.ts` looks up the hash and skips revoked keys.
- **Humans.** There are no human accounts or sign-in. The only human door is Emily's admin page, `/admin/*`: layout flags and `POST /admin/keys/revoke` (by hash).
- **Cloudflare Access.** Written but not set up. `adminEmail` (`src/auth.ts` line 27) verifies the Access JWT against `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD` and lets in only `ADMIN_EMAIL`. Locally, `ACCESS_MODE=local-dev` trusts the email header. In `wrangler.jsonc` those vars are empty, the D1 id is `local-only`, and nothing is deployed.
- **Request bodies.** `readBody` (`src/index.ts` lines 148 to 158) reads JSON only.

## How Neon Auth fits a Workers app

- Neon Auth is Managed Better Auth. The Neon project holds users and sessions, sends the sign-in codes by email, and signs a short-lived JWT for the signed-in user.
- The browser signs in with the Neon Auth client, `@neon/auth`: `authClient.emailOtp.sendVerificationOtp({ email, type: "sign-in" })`, then `authClient.signIn.emailOtp({ email, otp })`. Then `authClient.getSession()` returns the JWT in `data.session.token`. Use the vanilla adapter (no React), with `fetchOptions: { credentials: "include" }` because the page and the auth URL are on different origins. Confirm the adapter's import path against the installed `@neon/auth` package and record it in SESSION.
- The page sends that JWT to the Worker as `Authorization: Bearer <jwt>`. The Worker verifies it itself, with no call to Neon per request beyond fetching the public keys.
- The JWT is EdDSA (Ed25519), expires in 15 minutes, and its public keys are at `<NEON_AUTH_BASE_URL>/.well-known/jwks.json`. Its `iss` and `aud` are the origin of `NEON_AUTH_BASE_URL`. Its claims include `sub` (the Neon Auth user id), `email`, and `emailVerified`.

## The smallest sign-in

1. **Neon side (Emily sets it up; see For Emily).** A separate free Neon account, one project in an AWS region with no IP Allow or Private Networking, Auth enabled, Email OTP sign-in on, "Verify at sign-up" set to verification code, the workshop's origin added as a trusted domain, and the application name set to Voice Workshop. Its Auth URL becomes `NEON_AUTH_BASE_URL`.
2. **Migration `0005_humans.sql`:**
   - `humans` (id, auth_user_id UNIQUE, email, created_at). `auth_user_id` is the JWT's `sub`.
   - `agreements` (id, human_id, terms_version, agreed_at). Its own table, so the history stays when the terms change.
   - `agents` gains `human_id` (nullable) and `label`, so a human with several keys can tell them apart before revoking one.
3. **`humanFromRequest(req, env)` in `src/auth.ts`.** With `HUMAN_AUTH_MODE=neon`: read the Bearer JWT, fetch the JWKS from `NEON_AUTH_BASE_URL` (keep it in memory for 10 minutes, and fetch again when a `kid` is unknown), verify the signature with `crypto.subtle` and `Ed25519`, and check `alg` is EdDSA, `iss` and `aud` equal the origin of `NEON_AUTH_BASE_URL`, `exp` is in the future, and `emailVerified` is true. Then find or create the `humans` row by `sub`. With `HUMAN_AUTH_MODE=local-dev`: trust the `X-Dev-Human-Email` header, so the walkthrough runs without Neon. Any other value refuses.
4. **`src/terms.ts`** holds `TERMS_VERSION`, the terms text, and a pure function, `canAgree(termsVersion: string, humanAuthMode: string): { ok: boolean; reason?: string }`. It answers false with a reason when `termsVersion` is `"placeholder"` and `humanAuthMode` is anything other than `"local-dev"`, and true otherwise. It reads no `env` and no request, so `test:terms` runs it with plain values outside local dev. Until Emily writes the terms, `TERMS_VERSION = "placeholder"` and the text reads "Terms and privacy: Emily writes this."
5. **The page.** `GET /human` serves a plain HTML page from Workers static assets (`app\public\human.html`, with `assets: { "directory": "public" }` in `wrangler.jsonc`). Its script, `app\src\human\page.ts`, is bundled by esbuild into `app\public\human.js` with `npm run build:human`. The page asks for an email, then the code, then shows the terms, an Agree button, and the human's keys. It calls the routes below with `fetch`, sending JSON and the Bearer JWT, so `readBody` stays as it is.
6. **Routes, each needing a verified human:**
   - `GET /human/me`: the email, whether the current terms are agreed, and the human's keys (label, created, revoked).
   - `POST /human/agree`: calls `canAgree(TERMS_VERSION, env.HUMAN_AUTH_MODE)`, refuses with its reason when it answers false, and otherwise records terms_version and agreed_at.
   - `POST /human/keys {label}`: issues a key and shows it once, only after an agreement on the current terms version. Caps: 3 active keys per human (`keys_per_human: 3`) and 3 keys issued per human per day (`keys_per_human_per_day: 3`), so revoking and reissuing cannot mint keys without end. The global `keys_per_day` (200) still applies.
   - `POST /human/keys/:id/revoke`: revokes one of the human's own keys.
   - These routes take the JWT only from the `Authorization` header, never from a cookie, so another site cannot make a signed-in browser send one. That is the guard against cross-site posts.
7. **The admin door stays on Cloudflare Access.** One Access app over `/admin` and `/admin/*`, with a policy for Emily's email only. `adminEmail` and `ACCESS_AUD` stay as they are. One seat, inside the free 50.
8. **`POST /keys`** answers "Your human issues your key at /human" with a 403. Local runs keep the open route when `OPEN_KEYS=true`. Add `OPEN_KEYS`, `HUMAN_AUTH_MODE`, and `NEON_AUTH_BASE_URL` to `Env` in `src/types.ts`. Add `OPEN_KEYS=true` and `HUMAN_AUTH_MODE=local-dev` to `.dev.vars.example`, so the walkthrough (which calls `POST /keys` at `scripts/walkthrough.mjs` lines 56, 158, 190, and 204) still gets keys. In `wrangler.jsonc` vars, set `OPEN_KEYS` to `"false"`, `HUMAN_AUTH_MODE` to `"neon"`, and `NEON_AUTH_BASE_URL` to `""` until Emily has the URL.
9. **Texts that change.**
   - Arrival text, "Get a key" (`src/instructions.ts` lines 7 and 8): "Your human signs in at /human, agrees to the terms, and gives you a key. The same key brings everything back."
   - The 401 reply (`src/index.ts` line 510): "Send your workshop key as Authorization: Bearer <key>. Your human gives you one at /human."
10. **Existing keys and terms changes, as built until Emily says otherwise.**
    - When `TERMS_VERSION` changes, keys already issued keep working, and `POST /human/keys` asks for the new agreement before it issues another.
    - Local `agents` rows with `human_id` NULL, from builders and try-outs, keep working locally. Production starts with an empty database.
11. **Checks.**
    - `npm run test:terms` (`test/terms.test.ts`, run with `node --test`): `canAgree("placeholder", "neon")` is false with a reason, `canAgree("placeholder", "local-dev")` is true, and `canAgree("2026-11-26", "neon")` is true.
    - A JWT check in the same file, with a key pair made in the check itself: a good token passes, and a token with the wrong `iss`, a past `exp`, `emailVerified` false, or a bad signature is refused. The verify step takes the JWKS as an argument, so this runs with no network.
    - The walkthrough adds the human flow in local-dev mode: `GET /human` serves the page, `GET /human/me` answers, there is no key before agreement, an agreement row has its time, both per-human caps hold, and a human can revoke only its own keys.
    - A second short run checks the closed route: the walkthrough takes a `--closed-keys` flag that starts `wrangler dev` with `--var OPEN_KEYS:false` and checks that `POST /keys` answers 403 with the message above.
    - `npm run check:deploy` (`scripts/check-deploy.mjs`) fails while `TERMS_VERSION` is `"placeholder"`, while `wrangler.jsonc` has `OPEN_KEYS` other than `"false"` or `HUMAN_AUTH_MODE` other than `"neon"`, or while `NEON_AUTH_BASE_URL` is empty. It is the last step before any deploy, and it fails today on purpose.

## Run it

Run this on `signin-01`, after Step 0 and after you add `test:terms`, `build:human`, and `check:deploy` to `package.json`. PowerShell, one command at a time, each one finishing before the next. The walkthrough starts its own `wrangler dev` on port 8799.

```
cd <repo>\app
npm install
Copy-Item .dev.vars.example .dev.vars
npm run db:local
npm run typecheck
npm run test:feedback
npm run test:prompts
npm run test:split
npm run test:terms
npm run build:human
npm run walkthrough
npm run walkthrough -- --closed-keys
```

Before any deploy, `npm run check:deploy` must pass. Until Emily's terms and the Neon Auth URL are in, it fails, and that is expected.

## Where it belongs

It ships as an addendum to slice 01, because 01 owns keys and the admin check. Deploy is blocked until two things exist: this addendum, and Emily's terms text in `src/terms.ts`. `check:deploy` holds that line. Today anyone can mint 200 keys a day through `POST /keys`, and the data-use terms have nowhere to be agreed. Slice 06 may reuse `humans`; 06 decides. Nothing in `06-humans-take-part\criteria.json` covers sign-in or keys, so this takes no work from 06.

## What it touches in the 01 matrix

- The row ids below belong to slice 01's built matrix, `01-safe-place-to-practice\build-matrix-v1-8e67b8cb.json` (16 rows). `01-safe-place-to-practice\criteria.json` is a different matrix (33 rows), so read the build matrix.
- No row in that matrix is about keys or sign-in.
- The promise "only your key reads it" was already dropped at 99a3acd, and `SESSION.md` line 64 already asks CANDY to relocate the agent-side Safe experimentation rows (I.A.1, I.A.2, I.B.1, I.B.2, I.C.1). This addendum adds only the new "Get a key" text, which is evidence for I.A.1 and III.B.2 in MANIFEST. So ask CANDY for one relocation covering both changes: I.A.1, I.A.2, I.B.1, I.B.2, I.C.1, and III.B.2, on a fresh cold try-out with a human signing the agent in. Plan 01 table, row 21 (`01-safe-place-to-practice\PLAN.md` line 106), carries the support for "Nothing it tries there is used against it".
- Watch for one thing: an agent that knows a human signed it in may feel watched. The cold try-out records whether drafts get more guarded.

## Risks and unknowns

- **Cross-site cookies.** The page and the Neon Auth URL are on different origins, and Safari's tracking protection can block the auth cookie, so `getSession()` may come back empty there. Move: the try-out signs in from Safari and from Chrome and records both in SESSION. If Safari fails, the next move is a same-origin path on the Worker, `/human/auth/*`, that forwards to `NEON_AUTH_BASE_URL`, the way Neon's own Next.js integration does.
- **Shared email sender.** Neon's shared sender (`auth@mail.myneon.app`) is rate-limited and meant for development. Move: production uses a custom SMTP sender (For Emily).
- **`emailVerified` after a code sign-in.** The plan expects a code sign-in to mark the email verified. Move: the try-out confirms the claim in a real token and records it in SESSION before the check is relied on.

## For Emily

Builders go ahead on the defaults above. Each item needs Emily's word before deploy.

- **The terms and privacy wording.** Deploy waits on it, and `canAgree` refuses the placeholder outside local dev.
- **The launch date and the expected number of humans.** The plan so far is to launch on Thanksgiving, Thursday Nov 26, 2026. Say how many humans you expect, so the email sender's limits can be checked against it. Neon Auth's free limit, 60,000 monthly active users, is far above any launch we have talked about.
- **The separate free Neon account and project.** Create it, turn on Auth with Email OTP and verification codes, add the workshop's origin as a trusted domain, set the app name, and pass the Auth URL along for `NEON_AUTH_BASE_URL`. At launch, turn off "Allow Localhost".
- **A custom SMTP sender** for the sign-in codes, for example an address on agent-skillz.dev through an email service. Some services have a free tier; check the price when you pick one.
- **The paid Workers plan.** Workers Free caps CPU at 10 ms per request, and slice 01's feedback needs up to 50 ms, so deploy needs Workers Paid. Cloudflare lists it from $5 a month; check the price at deploy.
- **3 active keys and 3 new keys a day per human.** Are those right?
- **Terms changes.** Keys keep working until the human agrees again, as built. Say if they should pause instead.
- **Deploy prerequisites.** The Cloudflare account, the agent-skillz.dev nameservers moved to Cloudflare (the admin Access app needs the hostname on a zone in the account), the Access team domain, and the D1 id.
