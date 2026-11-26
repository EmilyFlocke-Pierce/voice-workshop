// Part B: register exercises. The map sets a piece beside the agent's own voice reference, never beside a catalog style.
// It counts what it can, quotes both sides, and names no verdict.
import type { Env } from "../types.ts";
import { str } from "../http.ts";
import { sentencesOf, wordsOf } from "../feedback/text.ts";
import { MEASURES } from "./catalog.ts";
import { usualOf, wholeValues, bandsOf } from "./measures.ts";
import { REGISTERS, REGISTER_LIST_VERSION } from "./registers.ts";

export { REGISTERS, REGISTER_LIST_VERSION };
export const REGISTER_HOLD_Q = "What stayed yours, and what did the format ask you to give up?";
export const REGISTER_TRY_Q = "Where does your own voice hold in this format, and where did the format move it? Quote both.";

export interface RegisterRefs {
  ids: string[];
  view: { try_id: string; created_at: string; opening: string; has_marks: boolean; own_lines: string[] }[];
}

async function refsOf(env: Env, agentId: string, ids: string[]): Promise<RegisterRefs | string[]> {
  const view: RegisterRefs["view"] = [];
  const missing: string[] = [];
  for (const id of ids) {
    const t = await env.DB.prepare("SELECT id, text, created_at FROM tries WHERE id = ? AND agent_id = ?").bind(id, agentId).first<{ id: string; text: string; created_at: string }>();
    if (!t) { missing.push(id); continue; }
    const marks = (await env.DB.prepare("SELECT own_lines FROM marks WHERE agent_id = ? AND try_id = ?").bind(agentId, id).all<{ own_lines: string | null }>()).results;
    const own = marks.flatMap((m) => JSON.parse(m.own_lines ?? "[]") as string[]);
    view.push({ try_id: t.id, created_at: t.created_at, opening: t.text.split(/\s+/).slice(0, 8).join(" "), has_marks: marks.length > 0, own_lines: own });
  }
  return missing.length ? missing : { ids, view };
}

export async function registerExerciseCard(env: Env, agentId: string, body: Record<string, unknown>): Promise<{ ok: true; register: string; refs: RegisterRefs } | { ok: false; message: string }> {
  const register = str(body.register);
  if (!register || !(REGISTERS as readonly string[]).includes(register)) return { ok: false, message: `register takes one of: ${REGISTERS.join(", ")}.` };
  const ids = body.voice_ref_try_ids;
  if (!Array.isArray(ids) || ids.length < 1 || ids.length > 5 || !ids.every((x) => typeof x === "string") || new Set(ids).size !== ids.length)
    return { ok: false, message: "voice_ref_try_ids takes 1 to 5 of your try ids: pieces that sound like you. Tries with marks or own_lines give the map the most to compare." };
  const refs = await refsOf(env, agentId, ids as string[]);
  if (Array.isArray(refs)) return { ok: false, message: `No try with these ids under this key: ${refs.join(", ")}.` };
  return { ok: true, register, refs };
}

const opening = (s: string) => wordsOf(s).slice(0, 2).join(" ");

// Openings that come back in the voice reference: the first two words of sentences, seen in 2 or more sentences.
function recurringOpenings(texts: string[]) {
  const seen = new Map<string, { n: number; example: string }>();
  for (const t of texts) for (const s of sentencesOf(t)) {
    const o = opening(s.text);
    if (o.split(" ").length < 2) continue;
    const e = seen.get(o) ?? { n: 0, example: s.text };
    e.n++;
    seen.set(o, e);
  }
  return [...seen.entries()].filter(([, e]) => e.n >= 2).map(([o, e]) => ({ opening: o, in_reference: e.n, example: e.example }));
}

export async function registerMap(env: Env, agentId: string, ex: { id: string; register: string | null; voice_ref_try_ids: string | null }, t: { id: string; text: string }) {
  const ids = JSON.parse(ex.voice_ref_try_ids ?? "[]") as string[];
  const refs = await refsOf(env, agentId, ids);
  const view = Array.isArray(refs) ? [] : refs.view;
  const refTexts: string[] = [];
  for (const r of view) refTexts.push((await env.DB.prepare("SELECT text FROM tries WHERE id = ?").bind(r.try_id).first<{ text: string }>())!.text);
  const ref = usualOf(refTexts);
  const pv = wholeValues(t.text);
  const pb = bandsOf(pv);
  const lower = t.text.toLowerCase();
  const pieceSentences = sentencesOf(t.text);
  const openings = recurringOpenings(refTexts).map((o) => {
    const hit = pieceSentences.find((s) => opening(s.text) === o.opening);
    return { ...o, in_piece: hit ? hit.text : null, reads: hit ? "carried over" : "not in this piece" };
  });
  const own = view.flatMap((r) => r.own_lines.map((line) => {
    const ws = line.toLowerCase().split(/\s+/).filter(Boolean);
    const whole = lower.includes(line.toLowerCase());
    const part = !whole && ws.length >= 3 ? ws.slice(0, -2).map((_, i) => ws.slice(i, i + 3).join(" ")).find((w) => lower.includes(w)) ?? null : null;
    return { line, from_try: r.try_id, in_piece: whole ? "whole" : part ? `in part: "${part}"` : "not here", reads: whole || part ? "carried over" : "shifted" };
  }));
  return {
    try_id: t.id, exercise_id: ex.id, register: ex.register, register_list_version: REGISTER_LIST_VERSION,
    compared_with: { voice_reference: view.map((r) => ({ try_id: r.try_id, opening: r.opening })), note: "Your piece beside your own voice reference. Here keeping your usual is the aim." },
    measures: MEASURES.map((m) => ({
      measure: m, piece: pv[m], piece_band: pb[m], reference: ref ? ref.values[m] : null, reference_band: ref ? ref.bands[m] : null,
      reads: !ref ? "no reference" : pb[m] === ref.bands[m] ? "carried over" : "shifted",
    })),
    recurring_openings: openings,
    own_lines: own,
    leaves_out: "Counts miss warmth, irony, and humor. Your notes carry tone.",
    question: REGISTER_TRY_Q,
  };
}
