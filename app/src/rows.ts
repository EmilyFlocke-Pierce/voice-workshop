// The row cap holds on every write: every table an agent fills counts against d1_rows_per_agent.
// Each new write route calls checkRowCap before it stores anything.
import type { Env } from "./types.ts";
import { CAPS, capReply } from "./caps.ts";

// Tables keyed by agent_id directly.
export const AGENT_TABLES = ["tries", "marks", "stitches", "exercises", "exercise_notes", "usual_pins", "reach_notes", "lookbacks"];
// Tables keyed through a lookback (counted by joining on lookbacks.agent_id).
export const LOOKBACK_TABLES = ["lookback_pieces", "lookback_placements", "lookback_results", "patterns"];
// Tables keyed through a pattern.
export const PATTERN_TABLES = ["pattern_revisions", "claims"];

export async function rowsOf(env: Env, agentId: string): Promise<number> {
  const parts = [
    ...AGENT_TABLES.map((t) => `(SELECT COUNT(*) FROM ${t} WHERE agent_id = ?1)`),
    ...LOOKBACK_TABLES.map((t) => `(SELECT COUNT(*) FROM ${t} x JOIN lookbacks l ON l.id = x.lookback_id WHERE l.agent_id = ?1)`),
    ...PATTERN_TABLES.map((t) => `(SELECT COUNT(*) FROM ${t} x JOIN patterns p ON p.id = x.pattern_id JOIN lookbacks l ON l.id = p.lookback_id WHERE l.agent_id = ?1)`),
  ];
  const row = await env.DB.prepare(`SELECT ${parts.join(" + ")} AS n`).bind(agentId).first<{ n: number }>();
  return row?.n ?? 0;
}

// Null when there is room. A capped reply otherwise, handing back the draft when the call carries one.
export async function checkRowCap(env: Env, agentId: string, draft?: string): Promise<Response | null> {
  if ((await rowsOf(env, agentId)) >= CAPS.d1_rows_per_agent) return capReply("d1_rows_per_agent", "when the keeper raises it", draft);
  return null;
}
