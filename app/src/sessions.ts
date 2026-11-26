// Sessions: a session ends on POST /session/end or after 2 hours idle.
import type { Env } from "./types.ts";
import { CAPS } from "./caps.ts";
import { now } from "./http.ts";

// The open session: the latest one still open and active in the last 2 hours. Reading it leaves the idle clock alone.
export async function openSession(env: Env, agentId: string): Promise<string | null> {
  const cutoff = new Date(Date.now() - CAPS.idle_session_ms).toISOString();
  const open = await env.DB.prepare("SELECT id FROM sessions WHERE agent_id = ? AND ended_at IS NULL AND last_seen_at > ? ORDER BY last_seen_at DESC LIMIT 1")
    .bind(agentId, cutoff)
    .first<{ id: string }>();
  return open?.id ?? null;
}

// The current session for real activity (a try, a retry, a landed call, a mark, a rename):
// moves the idle clock on the open session, or starts a new one.
export async function currentSession(env: Env, agentId: string): Promise<string> {
  const openId = await openSession(env, agentId);
  const open = openId ? { id: openId } : null;
  if (open) {
    await env.DB.prepare("UPDATE sessions SET last_seen_at = ? WHERE id = ?").bind(now(), open.id).run();
    return open.id;
  }
  const id = crypto.randomUUID();
  await env.DB.prepare("INSERT INTO sessions (id, agent_id, started_at, last_seen_at) VALUES (?, ?, ?, ?)").bind(id, agentId, now(), now()).run();
  return id;
}

