// The optional outside model reader. It is off unless OUTSIDE_MODEL_URL is set.
// Whatever it returns goes through the same plain-word check, judging-word check, line split, and layout as the code's own lines.
import type { Env } from "./types.ts";

export async function outsideObservations(env: Env, text: string): Promise<unknown[]> {
  if (!env.OUTSIDE_MODEL_URL) return [];
  try {
    const res = await fetch(env.OUTSIDE_MODEL_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, layout: ["feature", "where", "quotes", "pattern"] }),
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return [];
    const body = await res.json<{ observations?: unknown[] }>();
    return Array.isArray(body.observations) ? body.observations.slice(0, 12) : [];
  } catch {
    return [];
  }
}
