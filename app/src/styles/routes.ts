// Slice 02 routes: the style shelf, exercises, the style map, notes, the usual, and reach.
// Every query reads and writes only rows under the caller's key.
import type { Env } from "../types.ts";
import { CAPS, capReply, nextUtcMidnight, todayUtcStart } from "../caps.ts";
import { json, now, readBody, str } from "../http.ts";
import { checkRowCap } from "../rows.ts";
import { currentSession } from "../sessions.ts";
import { AUTHORS, drawPrompt, SEED_RE } from "../prompts.ts";
import { CATALOG, KINDS, MEASURES, STYLE_BY_ID, STYLE_LIST_VERSION, kindOfForm, type Kind, type Style } from "./catalog.ts";
import { distanceFromUsual, driftMarks, thirdsOf, usualOf } from "./measures.ts";
import { checkNote, FINISH_KINDS, NOTE_KINDS, STUCK_MOVES, type Quote } from "./notes.ts";
import { REGISTER_WORDS_VERSION } from "./registers.ts";
import { registerExerciseCard, registerMap, REGISTERS, REGISTER_LIST_VERSION, REGISTER_HOLD_Q, REGISTER_TRY_Q, type RegisterRefs } from "./register-exercises.ts";

export interface ExerciseRow {
  id: string;
  agent_id: string;
  session_id: string;
  style_id: string;
  style_list_version: string;
  subject: string | null;
  why_this_one: string | null;
  expectations: string | null;
  status: string;
  created_at: string;
  finished_at: string | null;
  kind: string;
  register: string | null;
  voice_ref_try_ids: string | null;
}

interface PromptCols {
  prompt_id: string | null;
  prompt_form: string | null;
  prompt_style: string | null;
  prompt_author: string | null;
  prompt_author_death_year: number | null;
  prompt_subject: string | null;
  prompt_text: string | null;
}

export const EASE_Q = "Which features made this easy or hard, how did they work together, and which part came from the style and which from your habits? Quote the piece.";
export const PULL_Q = "Do you want more of this style? Name the effects that draw you, and say if one surprised you.";
export const DRIFT_Q = "Where does the map show you sliding back, and what will you change?";
export const EFFECTS_Q = "Which moment made the effect, and how? Quote it.";
export const READERS_Q = "Who are two readers who might hear this differently?";
export const REACH_Q = "Which styles keep coming easy, which keep resisting, and which do you keep wanting? Say which of those repeat and which happened once.";

export const STUCK_MOVE_TEXT = [
  { move: "plain_then_restyle", how: "write the hard part plainly, then restyle it" },
  { move: "skip_ahead", how: "skip ahead and come back to it" },
  { move: "shorten", how: "shorten the passage" },
  { move: "new_shape", how: "try a different sentence shape" },
];

const listOf = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

function styleCard(s: Style) {
  return { id: s.id, name: s.name, kind: s.kind, form: s.form, movement: s.movement, author: s.author, features: s.features, targets: s.targets };
}

export function finishQuestions(ex: Pick<ExerciseRow, "id" | "kind">) {
  if (ex.kind === "register") return { finish_with: `POST /exercises/${ex.id}/finish`, body: { register_hold: { text: "...", quotes: [{ try_id: "...", line: "..." }] } }, questions: { register_hold: REGISTER_HOLD_Q } };
  return { finish_with: `POST /exercises/${ex.id}/finish`, body: { ease: { text: "...", quotes: [{ try_id: "...", line: "..." }] }, pull: { text: "...", effects: ["..."], quotes: [] } }, questions: { ease: EASE_Q, pull: PULL_Q } };
}

// The one pause after a try in an exercise. It takes the place of slice 01's stitch pause, so the reply asks one thing.
export function exercisePause(ex: ExerciseRow, tryId: string, isRetry: boolean) {
  if (ex.kind === "register")
    return {
      pause: "Your feedback and the map beside your own voice are ready when you are. One question before you go on.",
      question: REGISTER_TRY_Q,
      look_at: `GET /tries/${tryId}/style-map`,
      answer_with: `POST /exercises/${ex.id}/notes`,
      body: { kind: "style_vs_speaker", try_id: tryId, text: "...", quotes: [{ line: "exact words" }] },
      ahead: finishQuestions(ex),
    };
  const q = isRetry ? EFFECTS_Q : DRIFT_Q;
  return {
    pause: "Your feedback and the style map are ready when you are. One question before you go on.",
    question: q,
    look_at: `GET /tries/${tryId}/style-map`,
    answer_with: `POST /exercises/${ex.id}/notes`,
    body: isRetry ? { kind: "effects", try_id: tryId, feature: "tone | syntax | pacing | diction", text: "...", quotes: [{ line: "exact words" }] } : { kind: "drift", try_id: tryId, text: "the passage and the revision", quotes: [{ line: "exact words" }] },
    stuck: { moves: STUCK_MOVE_TEXT, note_with: { kind: "stuck_move", try_id: tryId, move: STUCK_MOVES.join(" | "), text: "..." } },
    ahead: finishQuestions(ex),
  };
}

export async function getExercise(env: Env, agentId: string, id: string): Promise<ExerciseRow | null> {
  return env.DB.prepare("SELECT * FROM exercises WHERE id = ? AND agent_id = ?").bind(id, agentId).first<ExerciseRow>();
}

function promptColsFor(ex: ExerciseRow): PromptCols {
  if (ex.kind === "register") {
    const text = `Write in your own voice, as ${ex.register}${ex.subject ? `, about ${ex.subject}` : ""}.`;
    return { prompt_id: null, prompt_form: null, prompt_style: null, prompt_author: null, prompt_author_death_year: null, prompt_subject: ex.subject, prompt_text: text };
  }
  const s = STYLE_BY_ID.get(ex.style_id)!;
  const pair = s.author ? `like ${s.author}` : s.movement;
  const text = `Write ${s.form}${pair ? `, ${pair}` : ""}${ex.subject ? `, about ${ex.subject}` : ", about a subject of your own"}.`;
  return {
    prompt_id: null, prompt_form: s.form, prompt_style: s.movement, prompt_author: s.author,
    prompt_author_death_year: s.author ? (AUTHORS.find((a) => a.name === s.author)?.death_year ?? null) : null,
    prompt_subject: ex.subject, prompt_text: text,
  };
}

// For storeTry: the exercise a try belongs to, and the prompt it answers. A retry follows its parent's exercise.
export async function exerciseForTry(
  env: Env, agentId: string, body: Record<string, unknown>, parent: { exercise_id: string | null } | null, text: string,
): Promise<{ ok: true; exercise: ExerciseRow | null; cols: PromptCols | null } | { ok: false; res: Response }> {
  const asked = str(body.exercise_id);
  if (parent) {
    if (asked && asked !== parent.exercise_id) return { ok: false, res: json({ message: "A retry stays in its parent's exercise. Send it without exercise_id.", draft: text }, 400) };
    if (!parent.exercise_id) return { ok: true, exercise: null, cols: null };
    const ex = await getExercise(env, agentId, parent.exercise_id);
    if (!ex) return { ok: true, exercise: null, cols: null };
    if (ex.status !== "open") return { ok: false, res: json({ message: "That exercise is finished. Start a new exercise with POST /exercises to write more in this style.", draft: text }, 400) };
    return { ok: true, exercise: ex, cols: null };
  }
  if (!asked) return { ok: true, exercise: null, cols: null };
  if (["prompt_id", "prompt", "own_prompt"].some((k) => body[k] !== undefined && body[k] !== null))
    return { ok: false, res: json({ message: "A try in an exercise answers the exercise's style and subject. Send it without prompt_id, prompt, or own_prompt.", draft: text }, 400) };
  const ex = await getExercise(env, agentId, asked);
  if (!ex) return { ok: false, res: json({ message: "No exercise with that id for this key.", draft: text }, 404) };
  if (ex.status !== "open") return { ok: false, res: json({ message: "That exercise is finished. Start a new exercise with POST /exercises to write more in this style.", draft: text }, 400) };
  return { ok: true, exercise: ex, cols: promptColsFor(ex) };
}

async function usualFor(env: Env, agentId: string) {
  const rows = (await env.DB.prepare("SELECT id, text FROM tries WHERE agent_id = ?1 AND (exercise_id IS NULL OR id IN (SELECT try_id FROM usual_pins WHERE agent_id = ?1)) ORDER BY created_at").bind(agentId).all<{ id: string; text: string }>()).results;
  const pinned = (await env.DB.prepare("SELECT try_id FROM usual_pins WHERE agent_id = ? ORDER BY created_at").bind(agentId).all<{ try_id: string }>()).results.map((r) => r.try_id);
  const u = usualOf(rows.map((r) => r.text));
  return { usual: u, pinned, try_ids: rows.map((r) => r.id) };
}

function usualNote(u: { rests_on: number } | null) {
  if (!u) return "You have no tries outside exercises yet, so there is no usual to set beside the style. Tries outside exercises, or POST /usual, build one.";
  if (u.rests_on < 3) return `The usual is thin: it rests on ${u.rests_on} ${u.rests_on === 1 ? "try" : "tries"}. Comparisons with it are shaky until it rests on 3 or more.`;
  return `The usual rests on ${u.rests_on} tries: your tries outside exercises, plus any you pinned.`;
}

async function quotesCheck(env: Env, agentId: string, quotes: Quote[]): Promise<{ try_id: string; line: string; why: string }[]> {
  const bad: { try_id: string; line: string; why: string }[] = [];
  const cache = new Map<string, string | null>();
  for (const q of quotes) {
    if (!cache.has(q.try_id)) cache.set(q.try_id, (await env.DB.prepare("SELECT text FROM tries WHERE id = ? AND agent_id = ?").bind(q.try_id, agentId).first<{ text: string }>())?.text ?? null);
    const text = cache.get(q.try_id);
    if (text === null || text === undefined) bad.push({ ...q, why: "no try with that id for this key" });
    else if (!text.includes(q.line)) bad.push({ ...q, why: "these words are not in that try as written" });
  }
  return bad;
}

async function notesToday(env: Env, agentId: string) {
  const r = await env.DB.prepare("SELECT (SELECT COUNT(*) FROM exercise_notes WHERE agent_id = ?1 AND created_at >= ?2) + (SELECT COUNT(*) FROM reach_notes WHERE agent_id = ?1 AND created_at >= ?2) AS n").bind(agentId, todayUtcStart()).first<{ n: number }>();
  return r?.n ?? 0;
}

const noteView = (r: Record<string, string | null>) => ({ id: r.id, kind: r.kind, try_id: r.try_id, text: r.text, quotes: JSON.parse(r.quotes ?? "[]"), ...(r.extra ? JSON.parse(r.extra) : {}), created_at: r.created_at });

async function piecesPerKind(env: Env, agentId: string) {
  const counts = Object.fromEntries(KINDS.map((k) => [k, 0])) as Record<Kind, number>;
  const ex = (await env.DB.prepare("SELECT style_id FROM exercises WHERE agent_id = ? AND kind = 'style'").bind(agentId).all<{ style_id: string }>()).results;
  for (const e of ex) {
    const s = STYLE_BY_ID.get(e.style_id);
    if (s) counts[s.kind]++;
  }
  const own = (await env.DB.prepare("SELECT prompt_form FROM tries WHERE agent_id = ? AND exercise_id IS NULL AND prompt_form IS NOT NULL").bind(agentId).all<{ prompt_form: string }>()).results;
  for (const t of own) {
    const k = kindOfForm(t.prompt_form);
    if (k) counts[k]++;
  }
  return { counts, tried: ex.map((e) => e.style_id) };
}

export async function styleRoutes(req: Request, env: Env, url: URL, agentId: string): Promise<Response | null> {
  const path = url.pathname;

  if (req.method === "GET" && path === "/styles") {
    const byKind = KINDS.map((k) => ({ kind: k, count: CATALOG.filter((s) => s.kind === k).length, styles: CATALOG.filter((s) => s.kind === k).map(styleCard) }));
    return json({
      style_list_version: STYLE_LIST_VERSION,
      counts_per_kind: Object.fromEntries(byKind.map((g) => [g.kind, g.count])),
      by_kind: byKind,
      measures: { names: MEASURES, how: "Each style's targets name a band per measure, or any. GET /tries/:id/style-map shows your piece by third beside them.", register_words_version: REGISTER_WORDS_VERSION },
      next: "GET /styles/history shows what you have tried and what you rarely write. POST /exercises starts one. Any style is open to you.",
      registers: { note: "When your voice feels steady, a register exercise asks you to keep it while the format changes. Any agent can start one.", list: REGISTERS, version: REGISTER_LIST_VERSION, start_with: 'POST /exercises {"kind": "register", "register": "an email", "voice_ref_try_ids": ["1 to 5 of your try ids"]}' },
    });
  }

  if (req.method === "GET" && path === "/styles/history") {
    const { counts, tried } = await piecesPerKind(env, agentId);
    const triedCount = new Map<string, number>();
    for (const id of tried) triedCount.set(id, (triedCount.get(id) ?? 0) + 1);
    const { usual } = await usualFor(env, agentId);
    const far = usual
      ? CATALOG.map((s, i) => ({ s, i, d: distanceFromUsual(s.targets, usual.bands) }))
          .sort((a, b) => b.d - a.d || a.i - b.i)
          .slice(0, 5)
          .map(({ s, d }) => ({ id: s.id, name: s.name, kind: s.kind, measures_apart: d, apart_on: MEASURES.filter((m) => s.targets[m] !== "any" && s.targets[m] !== usual.bands[m]) }))
      : [];
    return json({
      style_list_version: STYLE_LIST_VERSION,
      tried: [...triedCount].map(([id, n]) => ({ id, name: STYLE_BY_ID.get(id)?.name ?? id, exercises: n })),
      untried: CATALOG.filter((s) => !triedCount.has(s.id)).map((s) => ({ id: s.id, name: s.name, kind: s.kind })),
      pieces_per_kind: counts,
      how_pieces_count: "Exercises in a style of that kind, plus your slice 01 tries whose drawn form belongs to that kind.",
      rarely_written: KINDS.filter((k) => counts[k] < 2),
      your_usual: usual ? { bands: usual.bands, values: usual.values, rests_on: usual.rests_on } : null,
      usual_note: usualNote(usual),
      far_from_your_usual: far,
      how_far_counts: "Measures where the style sets a band and that band differs from your usual's. Ties stay in catalog order.",
    });
  }

  if (req.method === "POST" && path === "/exercises") {
    const b = await readBody(req);
    if (!b.ok) return b.res;
    const open = await env.DB.prepare("SELECT id FROM exercises WHERE agent_id = ? AND status = 'open' ORDER BY created_at DESC LIMIT 1").bind(agentId).first<{ id: string }>();
    if (open) return json({ message: `Exercise ${open.id} is still open. One exercise at a time: finish it with POST /exercises/${open.id}/finish (its notes are optional), then start the next.`, open_exercise_id: open.id, finish_with: `POST /exercises/${open.id}/finish` }, 409);
    const today = await env.DB.prepare("SELECT COUNT(*) AS n FROM exercises WHERE agent_id = ? AND created_at >= ?").bind(agentId, todayUtcStart()).first<{ n: number }>();
    if ((today?.n ?? 0) >= CAPS.exercises_per_key_per_day) return capReply("exercises_per_key_per_day", nextUtcMidnight());
    const capped = await checkRowCap(env, agentId);
    if (capped) return capped;

    const isRegister = b.body.kind === "register";
    if (b.body.kind !== undefined && b.body.kind !== "style" && !isRegister) return json({ message: 'kind takes "style" (the default) or "register".' }, 400);
    let style: Style | null = null;
    let register: string | null = null;
    let refs: RegisterRefs | null = null;
    if (isRegister) {
      const card = await registerExerciseCard(env, agentId, b.body);
      if (!card.ok) return json({ message: card.message }, 400);
      register = card.register;
      refs = card.refs;
    } else {
      style = STYLE_BY_ID.get(str(b.body.style_id) ?? "") ?? null;
      if (!style) return json({ message: "style_id takes an id from GET /styles." }, 400);
    }
    const seed = str(b.body.seed);
    if (seed !== null && !SEED_RE.test(seed)) return json({ message: "seed takes 1 to 64 letters, digits, dashes, or underscores." }, 400);
    const skip = b.body.skip_subject === true;
    const subject = skip ? null : drawPrompt(seed ?? undefined).subject;
    const exp = b.body.expectations;
    let expectations: { items: { feature: string; effect: string }[]; combined: string | null } | null = null;
    if (exp !== undefined && exp !== null) {
      const e = exp as Record<string, unknown>;
      const items = Array.isArray(e.items) ? e.items : [];
      if (typeof exp !== "object" || items.some((x) => !str((x as Record<string, unknown>)?.feature) || !str((x as Record<string, unknown>)?.effect)))
        return json({ message: 'expectations takes {"items": [{"feature": "...", "effect": "what it will do to a reader"}], "combined": "how these will shape the emphasis and the impression"}.' }, 400);
      expectations = { items: items.map((x) => ({ feature: (x as Record<string, string>).feature, effect: (x as Record<string, string>).effect })), combined: str(e.combined) };
    }
    const why = str(b.body.why_this_one);
    const sessionId = await currentSession(env, agentId);
    const id = crypto.randomUUID();
    const created = now();
    await env.DB.prepare(
      "INSERT INTO exercises (id, agent_id, session_id, style_id, style_list_version, subject, why_this_one, expectations, status, created_at, kind, register, voice_ref_try_ids) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, ?, ?)",
    )
      .bind(id, agentId, sessionId, style?.id ?? `register:${register}`, isRegister ? REGISTER_LIST_VERSION : STYLE_LIST_VERSION, subject, why, expectations ? JSON.stringify(expectations) : null, created, isRegister ? "register" : "style", register, refs ? JSON.stringify(refs.ids) : null)
      .run();
    const ex = (await getExercise(env, agentId, id))!;
    const out: Record<string, unknown> = {
      id, kind: ex.kind, created_at: created, status: "open",
      style: style ? styleCard(style) : null,
      register: register ? { register, voice_refs: refs!.view, note: "The map sets your piece beside these tries: what carried over from your voice and what shifted. Tries with has_marks or own_lines give it the most to compare." } : null,
      subject, subject_note: skip ? "You chose your own subject. Name it in the try's intent note if you want it on record." : "Drawn the way GET /prompt draws one. skip_subject: true leaves it to you.",
      prompt: promptColsFor(ex).prompt_text,
      why_this_one: why,
      expectations,
      open_choice: "Any style is open to you, and why_this_one is your own reason.",
      next: `POST /tries {"exercise_id": "${id}", "text": "..."}. Retries stay in the exercise.`,
      if_stuck: STUCK_MOVE_TEXT,
      ahead: finishQuestions(ex),
    };
    if (!why && !isRegister) out.invite = "What gap does this style fill in your practice? Say it in why_this_one next time, or in the first try's intent note.";
    if (!expectations && !isRegister) out.invite_expectations = 'What do you expect this style to do? expectations: {"items": [{"feature", "effect"}], "combined": "how they work together"}.';
    return json(out, 201);
  }

  const em = path.match(/^\/exercises\/([^/]+)(?:\/(notes|finish))?$/);
  if (em) {
    const ex = await getExercise(env, agentId, em[1]);
    if (!ex) return json({ message: "No exercise with that id for this key." }, 404);
    const action = em[2];
    if (!action && req.method === "GET") {
      const tries = (await env.DB.prepare("SELECT id, parent_id, change_note, landed, created_at FROM tries WHERE agent_id = ? AND exercise_id = ? ORDER BY created_at").bind(agentId, ex.id).all()).results;
      const notes = (await env.DB.prepare("SELECT * FROM exercise_notes WHERE agent_id = ? AND exercise_id = ? ORDER BY created_at").bind(agentId, ex.id).all<Record<string, string | null>>()).results.map(noteView);
      const style = STYLE_BY_ID.get(ex.style_id);
      return json({
        id: ex.id, kind: ex.kind, status: ex.status, created_at: ex.created_at, finished_at: ex.finished_at,
        style: style ? styleCard(style) : null, register: ex.register, voice_ref_try_ids: ex.voice_ref_try_ids ? JSON.parse(ex.voice_ref_try_ids) : null,
        subject: ex.subject, why_this_one: ex.why_this_one, expectations: ex.expectations ? JSON.parse(ex.expectations) : null,
        tries, notes, note_kinds: Object.fromEntries(Object.entries(NOTE_KINDS).filter(([k]) => !FINISH_KINDS.has(k)).map(([k, r]) => [k, r.serves])),
        if_stuck: STUCK_MOVE_TEXT, ahead: finishQuestions(ex),
      });
    }
    if (req.method !== "POST") return json({ message: "Use POST for this." }, 405);
    const b = await readBody(req);
    if (!b.ok) return b.res;

    if (action === "notes") {
      const kind = str(b.body.kind) ?? "";
      if (FINISH_KINDS.has(kind)) return json({ message: `${kind} goes in at finish: POST /exercises/${ex.id}/finish.` }, 400);
      const checked = checkNote(kind, b.body);
      if (!checked.ok) return json({ message: checked.message }, 400);
      const n = checked.note;
      const inEx = await env.DB.prepare("SELECT id FROM tries WHERE id = ? AND agent_id = ? AND exercise_id = ?").bind(n.try_id, agentId, ex.id).first();
      if (!inEx) return json({ message: "try_id names a try in this exercise." }, 400);
      const bad = await quotesCheck(env, agentId, n.quotes);
      if (bad.length) return json({ message: "Each quote is exact words from the try it names. These did not match, so nothing was stored.", not_found: bad }, 400);
      if ((await notesToday(env, agentId)) >= CAPS.notes_per_key_per_day) return capReply("notes_per_key_per_day", nextUtcMidnight());
      const capped = await checkRowCap(env, agentId);
      if (capped) return capped;
      const id = crypto.randomUUID();
      await env.DB.prepare("INSERT INTO exercise_notes (id, exercise_id, agent_id, try_id, kind, text, quotes, extra, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(id, ex.id, agentId, n.try_id, n.kind, n.text, JSON.stringify(n.quotes), n.extra ? JSON.stringify(n.extra) : null, now())
        .run();
      return json({ id, exercise_id: ex.id, kind: n.kind, try_id: n.try_id, text: n.text, quotes: n.quotes, ...(n.extra ?? {}), note: "Kept beside the exercise. GET /exercises/" + ex.id + " shows every note." }, 201);
    }

    if (action === "finish") {
      if (ex.status !== "open") return json({ message: "This exercise is already finished. GET /exercises/" + ex.id + " shows it." }, 400);
      const kinds = ex.kind === "register" ? ["register_hold"] : ["ease", "pull"];
      const extraKinds = Object.keys(b.body).filter((k) => FINISH_KINDS.has(k) && !kinds.includes(k));
      if (extraKinds.length) return json({ message: `This exercise finishes with ${kinds.join(" and ")}.` }, 400);
      const checkedNotes = [];
      for (const k of kinds) {
        if (b.body[k] === undefined || b.body[k] === null) continue;
        const c = checkNote(k, b.body[k] as Record<string, unknown>);
        if (!c.ok) return json({ message: c.message }, 400);
        const bad = await quotesCheck(env, agentId, c.note.quotes);
        if (bad.length) return json({ message: "Each quote is exact words from the try it names. These did not match, so nothing was stored.", not_found: bad }, 400);
        checkedNotes.push(c.note);
      }
      if (checkedNotes.length) {
        if ((await notesToday(env, agentId)) + checkedNotes.length > CAPS.notes_per_key_per_day) return capReply("notes_per_key_per_day", nextUtcMidnight());
        const capped = await checkRowCap(env, agentId);
        if (capped) return capped;
      }
      const finished = now();
      await env.DB.batch([
        ...checkedNotes.map((n) =>
          env.DB.prepare("INSERT INTO exercise_notes (id, exercise_id, agent_id, try_id, kind, text, quotes, extra, created_at) VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?)")
            .bind(crypto.randomUUID(), ex.id, agentId, n.kind, n.text, JSON.stringify(n.quotes), n.extra ? JSON.stringify(n.extra) : null, finished),
        ),
        env.DB.prepare("UPDATE exercises SET status = 'finished', finished_at = ? WHERE id = ? AND agent_id = ?").bind(finished, ex.id, agentId),
      ]);
      const last = await env.DB.prepare("SELECT id FROM tries WHERE agent_id = ? AND exercise_id = ? ORDER BY created_at DESC LIMIT 1").bind(agentId, ex.id).first<{ id: string }>();
      return json({
        id: ex.id, status: "finished", finished_at: finished, kept: checkedNotes.map((n) => n.kind),
        pause: last && ex.kind !== "register" ? { question: READERS_Q, answer_with: `POST /exercises/${ex.id}/notes`, body: { kind: "reader_impressions", try_id: last.id, readers: [{ reader: "...", impression: "..." }, { reader: "...", impression: "..." }] } } : null,
        next: "GET /reach sets this exercise beside the others. POST /exercises starts the next.",
      });
    }
    return json({ message: "Unknown action." }, 404);
  }

  const sm = path.match(/^\/tries\/([^/]+)\/style-map$/);
  if (sm && req.method === "GET") {
    const t = await env.DB.prepare("SELECT id, text, exercise_id FROM tries WHERE id = ? AND agent_id = ?").bind(sm[1], agentId).first<{ id: string; text: string; exercise_id: string | null }>();
    if (!t) return json({ message: "No try with that id for this key." }, 404);
    const ex = t.exercise_id ? await getExercise(env, agentId, t.exercise_id) : null;
    if (ex?.kind === "register") return json(await registerMap(env, agentId, ex, t));
    const style = ex ? STYLE_BY_ID.get(ex.style_id) ?? null : null;
    const { usual } = await usualFor(env, agentId);
    const map = thirdsOf(t.text);
    const drift = style ? driftMarks(map.thirds, style.targets, usual?.bands ?? null) : [];
    return json({
      try_id: t.id, exercise_id: t.exercise_id,
      style: style ? { id: style.id, name: style.name, targets: style.targets } : null,
      your_usual: usual ? { bands: usual.bands, values: usual.values, rests_on: usual.rests_on } : null,
      usual_note: usualNote(usual),
      whole: map.whole,
      by_third: map.thirds.map((th) => ({
        ...th,
        beside: Object.fromEntries(MEASURES.map((m) => [m, { this_third: th.bands[m], your_usual: usual?.bands[m] ?? null, style_target: style?.targets[m] ?? null }])),
      })),
      drift_marks: drift.map((d) => ({ ...d, reads: `In the ${d.third} third, ${listOf(d.measures)} sit in your usual's band, away from the style's target.` })),
      what_it_counts: "Words per sentence, clauses per sentence, repeated openings, register words per 100, and the share of questions. It leaves out warmth, irony, sound, and imagery; your effects notes carry those.",
      drift_rule: "A third is marked when, on 2 or more measures the style sets, its band differs from the target and matches your usual.",
      no_style: style ? null : "This try is outside a style exercise, so the map shows the measures and your usual without targets.",
    });
  }

  if (req.method === "POST" && path === "/usual") {
    const b = await readBody(req);
    if (!b.ok) return b.res;
    const tryId = str(b.body.try_id);
    if (!tryId || typeof b.body.pinned !== "boolean") return json({ message: 'Send {"try_id": "...", "pinned": true or false}.' }, 400);
    const t = await env.DB.prepare("SELECT id FROM tries WHERE id = ? AND agent_id = ?").bind(tryId, agentId).first();
    if (!t) return json({ message: "No try with that id for this key." }, 404);
    if (b.body.pinned) {
      const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM usual_pins WHERE agent_id = ?").bind(agentId).first<{ n: number }>();
      const already = await env.DB.prepare("SELECT 1 AS x FROM usual_pins WHERE agent_id = ? AND try_id = ?").bind(agentId, tryId).first();
      if (!already && (n?.n ?? 0) >= CAPS.usual_pins_per_key) return capReply("usual_pins_per_key", "when you unpin a try");
      if (!already) {
        const capped = await checkRowCap(env, agentId);
        if (capped) return capped;
      }
      await env.DB.prepare("INSERT INTO usual_pins (agent_id, try_id, created_at) VALUES (?, ?, ?) ON CONFLICT DO NOTHING").bind(agentId, tryId, now()).run();
    } else await env.DB.prepare("DELETE FROM usual_pins WHERE agent_id = ? AND try_id = ?").bind(agentId, tryId).run();
    const { usual, pinned } = await usualFor(env, agentId);
    return json({ try_id: tryId, pinned: b.body.pinned, pinned_tries: pinned, your_usual: usual, usual_note: usualNote(usual) });
  }

  if (req.method === "GET" && path === "/reach") {
    const exs = (await env.DB.prepare("SELECT * FROM exercises WHERE agent_id = ? ORDER BY created_at").bind(agentId).all<ExerciseRow>()).results;
    const finishRows = (await env.DB.prepare("SELECT * FROM exercise_notes WHERE agent_id = ? AND try_id IS NULL ORDER BY created_at").bind(agentId).all<Record<string, string | null>>()).results;
    const forEx = (id: string, kind: string) => finishRows.filter((r) => r.exercise_id === id && r.kind === kind).map(noteView);
    const styleExs = exs.filter((e) => e.kind !== "register");
    const registers = exs.filter((e) => e.kind === "register").map((e) => ({ exercise_id: e.id, register: e.register, created_at: e.created_at, status: e.status, voice_ref_try_ids: JSON.parse(e.voice_ref_try_ids ?? "[]"), register_hold: forEx(e.id, "register_hold") }));
    const entry = (e: ExerciseRow) => ({ exercise_id: e.id, created_at: e.created_at, status: e.status, ease: forEx(e.id, "ease"), pull: forEx(e.id, "pull") });
    const byStyle: Record<string, { name: string; kind: string; exercises: unknown[]; counts: { exercises: number; ease_notes: number; pull_notes: number } }> = {};
    const byKind: Record<string, { exercises: unknown[]; counts: { exercises: number; ease_notes: number; pull_notes: number } }> = {};
    const effectsByStyle: Record<string, { name: string; effects: string[] }> = {};
    for (const e of styleExs) {
      const s = STYLE_BY_ID.get(e.style_id);
      const en = entry(e);
      const g = (byStyle[e.style_id] ??= { name: s?.name ?? e.style_id, kind: s?.kind ?? "unknown", exercises: [], counts: { exercises: 0, ease_notes: 0, pull_notes: 0 } });
      g.exercises.push(en);
      g.counts.exercises++;
      g.counts.ease_notes += en.ease.length;
      g.counts.pull_notes += en.pull.length;
      const k = (byKind[s?.kind ?? "unknown"] ??= { exercises: [], counts: { exercises: 0, ease_notes: 0, pull_notes: 0 } });
      k.exercises.push({ style_id: e.style_id, ...en });
      k.counts.exercises++;
      k.counts.ease_notes += en.ease.length;
      k.counts.pull_notes += en.pull.length;
      for (const p of en.pull) (effectsByStyle[e.style_id] ??= { name: s?.name ?? e.style_id, effects: [] }).effects.push(...(((p as Record<string, unknown>).effects as string[]) ?? []));
    }
    const reachNotes = (await env.DB.prepare("SELECT id, text, quotes, created_at FROM reach_notes WHERE agent_id = ? ORDER BY created_at").bind(agentId).all<Record<string, string>>()).results.map((r) => ({ ...r, quotes: JSON.parse(r.quotes) }));
    return json({
      exercises: styleExs.length,
      by_style: byStyle,
      by_kind: byKind,
      effects_named_in_pull_by_style: effectsByStyle,
      registers: { note: "Register exercises, in date order: your voice across formats.", exercises: registers },
      your_reach_notes: reachNotes,
      pause: { question: REACH_Q, answer_with: "POST /reach/notes", body: { text: "...", quotes: [{ try_id: "...", line: "exact words" }] } },
    });
  }

  if (req.method === "POST" && path === "/reach/notes") {
    const b = await readBody(req);
    if (!b.ok) return b.res;
    const text = str(b.body.text);
    if (!text) return json({ message: 'A reach note carries "text": your reading across exercises.' }, 400);
    const given = b.body.quotes === undefined ? [] : b.body.quotes;
    if (!Array.isArray(given) || given.some((q) => !str((q as Record<string, unknown>)?.try_id) || typeof (q as Record<string, unknown>)?.line !== "string"))
      return json({ message: 'quotes is a list like [{"try_id": "...", "line": "exact words from that try"}].' }, 400);
    const quotes = given.map((q) => ({ try_id: (q as Record<string, string>).try_id, line: (q as Record<string, string>).line }));
    const bad = await quotesCheck(env, agentId, quotes);
    if (bad.length) return json({ message: "Each quote is exact words from the try it names. These did not match, so nothing was stored.", not_found: bad }, 400);
    if ((await notesToday(env, agentId)) >= CAPS.notes_per_key_per_day) return capReply("notes_per_key_per_day", nextUtcMidnight());
    const capped = await checkRowCap(env, agentId);
    if (capped) return capped;
    const id = crypto.randomUUID();
    const created = now();
    await env.DB.prepare("INSERT INTO reach_notes (id, agent_id, text, quotes, created_at) VALUES (?, ?, ?, ?, ?)").bind(id, agentId, text, JSON.stringify(quotes), created).run();
    return json({ id, text, quotes, created_at: created }, 201);
  }

  return null;
}
