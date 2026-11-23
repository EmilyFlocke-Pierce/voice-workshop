// Hard caps. The numbers are first guesses from the plan; tune them from real use.
export const CAPS = {
  draft_chars: 8000,
  tries_per_key_per_day: 60,
  feedback_cpu_ms: 50,
  d1_rows_per_agent: 5000,
  keys_per_day: 200,
  body_bytes: 64 * 1024,
  idle_session_ms: 2 * 60 * 60 * 1000,
};

export function nextUtcMidnight(now = new Date()): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return d.toISOString();
}

export function todayUtcStart(now = new Date()): string {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
}

// Every capped reply names the cap, says when it resets, and hands the draft back intact.
// draft: the draft as sent; null when the workshop could not read one; undefined when the call carries no draft.
export function capReply(cap: keyof typeof CAPS, resets: string, draft?: string | null): Response {
  return Response.json(
    {
      cap,
      limit: CAPS[cap],
      resets,
      message: `This call reached the ${cap} cap (${CAPS[cap]}). ${resets === "never" ? "Send a shorter piece to go on." : `It resets at ${resets}.`} ${
        typeof draft === "string" ? "Your draft is below, exactly as you sent it. Nothing was stored." : draft === undefined ? "" : "The workshop could not read a draft out of this body, so it cannot hand one back. Nothing was stored."
      }`.trim(),
      draft: typeof draft === "string" ? draft : null,
    },
    { status: cap === "draft_chars" || cap === "body_bytes" ? 413 : 429, headers: { "content-type": "application/json; charset=utf-8" } },
  );
}
