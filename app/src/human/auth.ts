// STUB: the seam where human sign-in plugs in. No co-signed matrix yet; see FLAGS.md, "Look at together".
//
// humanFromRequest answers one question for every /human route: which signed-in human is calling?
// It returns the humans row, creating it on first sign-in.
//
// HUMAN_AUTH_MODE=local-dev  a fake sign-in for local runs: trusts the X-Dev-Human-Email header.
// HUMAN_AUTH_MODE=neon       the real sign-in. STUB: verifyNeonJwt refuses every token until it is built.
// Any other value refuses.
//
// When Neon Auth plugs in (@neon/auth 0.8.2, browser side):
//   import { BetterAuthVanillaAdapter } from "@neon/auth/vanilla/adapters";
// The page signs in with email codes, reads the JWT from getSession(), and sends it as Authorization: Bearer <jwt>.
// verifyNeonJwt then checks it here: EdDSA signature against <NEON_AUTH_BASE_URL>/.well-known/jwks.json,
// iss and aud equal to the origin of NEON_AUTH_BASE_URL, exp in the future, emailVerified true.
// The JWT comes only from the Authorization header, never a cookie, which guards against cross-site posts.
import type { Env } from "../types.ts";
import { now } from "../http.ts";

export interface Human {
  id: string;
  auth_user_id: string;
  email: string;
  created_at: string;
}

export interface SignedIn {
  sub: string;
  email: string;
}

export type SignInResult = { ok: true; human: Human } | { ok: false; status: number; message: string };

// STUB. Returns null for every token. Replace with the JWKS check described above.
export async function verifyNeonJwt(_token: string, _env: Env): Promise<SignedIn | null> {
  return null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signedInFromRequest(req: Request, env: Env): Promise<SignedIn | { refused: string; status: number }> {
  const mode = env.HUMAN_AUTH_MODE ?? "";
  if (mode === "local-dev") {
    const email = (req.headers.get("X-Dev-Human-Email") ?? "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return { refused: "Local sign-in (STUB): send X-Dev-Human-Email with an email address.", status: 401 };
    return { sub: `local-dev:${email}`, email };
  }
  if (mode === "neon") {
    const match = (req.headers.get("Authorization") ?? "").match(/^Bearer\s+(\S+)$/i);
    if (!match) return { refused: "Sign in at /human first. The page sends your sign-in as Authorization: Bearer <token>.", status: 401 };
    const who = await verifyNeonJwt(match[1], env);
    if (!who) return { refused: "Human sign-in is not built yet (STUB). It opens when Neon Auth plugs in.", status: 501 };
    return who;
  }
  return { refused: "Human sign-in is off here. HUMAN_AUTH_MODE takes local-dev or neon.", status: 503 };
}

export async function humanFromRequest(req: Request, env: Env): Promise<SignInResult> {
  const who = await signedInFromRequest(req, env);
  if ("refused" in who) return { ok: false, status: who.status, message: who.refused };
  const found = await env.DB.prepare("SELECT * FROM humans WHERE auth_user_id = ?").bind(who.sub).first<Human>();
  if (found) return { ok: true, human: found };
  const human: Human = { id: crypto.randomUUID(), auth_user_id: who.sub, email: who.email, created_at: now() };
  await env.DB.prepare("INSERT INTO humans (id, auth_user_id, email, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(auth_user_id) DO NOTHING")
    .bind(human.id, human.auth_user_id, human.email, human.created_at)
    .run();
  const row = await env.DB.prepare("SELECT * FROM humans WHERE auth_user_id = ?").bind(who.sub).first<Human>();
  return { ok: true, human: row ?? human };
}
