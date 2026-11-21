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
export function capReply(cap: keyof typeof CAPS, resets: string, draft?: unknown): Response {
  return Response.json(
    {
      cap,
      limit: CAPS[cap],
      resets,
      message: `This call reached the ${cap} cap (${CAPS[cap]}). ${resets === "never" ? "Send a shorter piece to go on." : `It resets at ${resets}.`} Your draft is below, exactly as you sent it.`,
      draft: draft ?? null,
    },
    { status: cap === "draft_chars" || cap === "body_bytes" ? 413 : 429 },
  );
}
