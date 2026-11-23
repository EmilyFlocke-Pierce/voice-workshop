import type { Env } from "./types.ts";

export async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function newKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return "vw_" + [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Returns the agent id for a valid bearer key, or null.
export async function agentFromRequest(req: Request, env: Env): Promise<string | null> {
  const header = req.headers.get("Authorization") ?? "";
  const match = header.match(/^Bearer\s+(\S+)$/i);
  if (!match) return null;
  const hash = await sha256Hex(match[1]);
  const row = await env.DB.prepare("SELECT id FROM agents WHERE key_hash = ? AND revoked_at IS NULL")
    .bind(hash)
    .first<{ id: string }>();
  return row?.id ?? null;
}

// Emily's admin page sits behind Cloudflare Access. In jwt mode the Worker checks the Access token
// against the team's public keys. local-dev mode trusts the email header so the page runs under wrangler dev.
export async function adminEmail(req: Request, env: Env): Promise<string | null> {
  if (!env.ADMIN_EMAIL) return null;
  if (env.ACCESS_MODE === "local-dev") {
    const email = req.headers.get("Cf-Access-Authenticated-User-Email");
    return email && email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase() ? email : null;
  }
  const token = req.headers.get("Cf-Access-Jwt-Assertion");
  if (!token || !env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) return null;
  const claims = await verifyAccessJwt(token, env);
  const email = typeof claims?.email === "string" ? claims.email : null;
  return email && email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase() ? email : null;
}

function b64urlBytes(s: string): Uint8Array {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  return Uint8Array.from(atob(pad), (c) => c.charCodeAt(0));
}

async function verifyAccessJwt(token: string, env: Env): Promise<Record<string, unknown> | null> {
  const [h, p, s] = token.split(".");
  if (!h || !p || !s) return null;
  const header = JSON.parse(new TextDecoder().decode(b64urlBytes(h)));
  const certs = await fetch(`https://${env.ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`).then((r) => r.json<{ keys: JsonWebKey[] }>());
  const jwk = certs.keys.find((k) => (k as JsonWebKey & { kid?: string }).kid === header.kid);
  if (!jwk) return null;
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64urlBytes(s), new TextEncoder().encode(`${h}.${p}`));
  if (!ok) return null;
  const claims = JSON.parse(new TextDecoder().decode(b64urlBytes(p)));
  const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!aud.includes(env.ACCESS_AUD)) return null;
  if (typeof claims.exp === "number" && claims.exp * 1000 < Date.now()) return null;
  return claims;
}
