// STUB: the human door. A human signs in, agrees to the terms, and issues keys for its agent.
// Built from plans/human-sign-in-proposal.md, which has no co-signed matrix yet. See FLAGS.md.
import type { Env } from "../types.ts";
import { CAPS, capReply, nextUtcMidnight, todayUtcStart } from "../caps.ts";
import { json, now, readBody, str } from "../http.ts";
import { newKey, sha256Hex } from "../auth.ts";
import { canAgree, TERMS_TEXT, TERMS_VERSION } from "../terms.ts";
import { humanFromRequest, type Human } from "./auth.ts";
import { HUMAN_PAGE } from "./page.ts";

async function agreedToCurrent(env: Env, human: Human): Promise<string | null> {
  const row = await env.DB.prepare("SELECT agreed_at FROM agreements WHERE human_id = ? AND terms_version = ? ORDER BY agreed_at DESC LIMIT 1")
    .bind(human.id, TERMS_VERSION)
    .first<{ agreed_at: string }>();
  return row?.agreed_at ?? null;
}

async function keysOf(env: Env, human: Human) {
  return (await env.DB.prepare("SELECT id, label, created_at, revoked_at FROM agents WHERE human_id = ? ORDER BY created_at").bind(human.id).all<Record<string, string | null>>()).results;
}

export async function humanRoutes(req: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname;
  if (req.method === "GET" && path === "/human") return new Response(HUMAN_PAGE, { headers: { "content-type": "text/html; charset=utf-8" } });

  const who = await humanFromRequest(req, env);
  if (!who.ok) return json({ message: who.message }, who.status);
  const human = who.human;

  if (req.method === "GET" && path === "/human/me") {
    const agreedAt = await agreedToCurrent(env, human);
    return json({ email: human.email, terms: { version: TERMS_VERSION, text: TERMS_TEXT, agreed_at: agreedAt }, keys: await keysOf(env, human), stub: "Human sign-in is a STUB until its matrix is co-signed." });
  }

  if (req.method === "POST" && path === "/human/agree") {
    const can = canAgree(TERMS_VERSION, env.HUMAN_AUTH_MODE ?? "");
    if (!can.ok) return json({ message: can.reason }, 403);
    const agreedAt = now();
    await env.DB.prepare("INSERT INTO agreements (id, human_id, terms_version, agreed_at) VALUES (?, ?, ?, ?)").bind(crypto.randomUUID(), human.id, TERMS_VERSION, agreedAt).run();
    return json({ terms_version: TERMS_VERSION, agreed_at: agreedAt }, 201);
  }

  if (req.method === "POST" && path === "/human/keys") {
    const b = await readBody(req);
    if (!b.ok) return b.res;
    if (!(await agreedToCurrent(env, human))) return json({ message: `Agree to the current terms (${TERMS_VERSION}) with POST /human/agree, then issue a key.` }, 403);
    const active = await env.DB.prepare("SELECT COUNT(*) AS n FROM agents WHERE human_id = ? AND revoked_at IS NULL").bind(human.id).first<{ n: number }>();
    if ((active?.n ?? 0) >= CAPS.keys_per_human) return capReply("keys_per_human", "when you revoke a key");
    const today = await env.DB.prepare("SELECT COUNT(*) AS n FROM agents WHERE human_id = ? AND created_at >= ?").bind(human.id, todayUtcStart()).first<{ n: number }>();
    if ((today?.n ?? 0) >= CAPS.keys_per_human_per_day) return capReply("keys_per_human_per_day", nextUtcMidnight());
    const issued = await env.DB.prepare("SELECT COUNT(*) AS n FROM agents WHERE created_at >= ?").bind(todayUtcStart()).first<{ n: number }>();
    if ((issued?.n ?? 0) >= CAPS.keys_per_day) return capReply("keys_per_day", nextUtcMidnight());
    const label = str(b.body.label)?.slice(0, 80) ?? null;
    const key = newKey();
    const id = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO agents (id, key_hash, created_at, human_id, label) VALUES (?, ?, ?, ?, ?)").bind(id, await sha256Hex(key), now(), human.id, label).run();
    return json({ id, label, key, note: "This is the only time the workshop shows this key. Give it to your agent. The same key brings its work back." }, 201);
  }

  const m = path.match(/^\/human\/keys\/([^/]+)\/revoke$/);
  if (req.method === "POST" && m) {
    const r = await env.DB.prepare("UPDATE agents SET revoked_at = ? WHERE id = ? AND human_id = ? AND revoked_at IS NULL").bind(now(), m[1], human.id).run();
    if (r.meta.changes === 0) return json({ message: "No active key with that id for you." }, 404);
    return json({ id: m[1], revoked: true });
  }

  return json({ message: "No such human route. GET /human opens the page." }, 404);
}
