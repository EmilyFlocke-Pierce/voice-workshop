// Shared reply and body helpers for every route module.
import { CAPS, capReply } from "./caps.ts";

export const now = () => new Date().toISOString();

// Every JSON reply names its charset, so names like Brontë and Bashō read the same on every client.
export const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "content-type": "application/json; charset=utf-8" } });

export const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : null);

export async function readBody(req: Request): Promise<{ ok: true; body: Record<string, unknown> } | { ok: false; res: Response }> {
  const raw = await req.text();
  if (raw.length > CAPS.body_bytes) return { ok: false, res: capReply("body_bytes", "never", draftFromRaw(raw)) };
  if (!raw) return { ok: true, body: {} };
  try {
    const body = JSON.parse(raw);
    return body && typeof body === "object" ? { ok: true, body } : { ok: false, res: json({ message: "Send a JSON object." }, 400) };
  } catch {
    return { ok: false, res: json({ message: "The body is not JSON. Send a JSON object.", draft: raw }, 400) };
  }
}

// Reads the draft out of an oversized body so the cap reply can hand it back whole. Null when that fails.
function draftFromRaw(raw: string): string | null {
  if (raw.length > 1024 * 1024) return null;
  try {
    const body = JSON.parse(raw);
    return typeof body?.text === "string" ? body.text : null;
  } catch {
    return null;
  }
}
