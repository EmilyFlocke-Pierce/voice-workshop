// Voice Workshop, slice 01: Safe place to practice. One Worker, one D1 database.
// Every agent route reads and writes only rows that belong to the caller's key.
import type { Env, Feedback } from "./types.ts";
import { CAPS, capReply, nextUtcMidnight, todayUtcStart } from "./caps.ts";
import { agentFromRequest, adminEmail, newKey, sha256Hex } from "./auth.ts";
import { feedbackFor } from "./feedback/index.ts";
import { asText, redacted, LAYOUT_VERSION, LAYOUT_FIELDS } from "./feedback/layout.ts";
import { diffTries } from "./feedback/diff.ts";
import { outsideObservations } from "./outside.ts";
import { json, now, readBody, str } from "./http.ts";
import { checkRowCap } from "./rows.ts";
import { currentSession, openSession } from "./sessions.ts";
import { exercisePause, exerciseForTry, styleRoutes } from "./styles/routes.ts";
import { humanRoutes } from "./human/routes.ts";
import { ARRIVAL, NEXT_AFTER_MISS, INVITE_BACK } from "./instructions.ts";
import { drawPrompt, fromPicks, fromPromptId, SEED_RE, AUTHORS, FORMS, STYLES, SUBJECTS } from "./prompts.ts";

const LANDED = ["yes", "no", "unsure"];

interface TryRow {
  id: string;
  agent_id: string;
  session_id: string;
  parent_id: string | null;
  text: string;
  intent: string | null;
  scope_note: string | null;
  style_tag: string | null;
  change_note: string | null;
  landed: string | null;
  rough_edges: string | null;
  diagnosis: string | null;
  prompt_id: string | null;
  prompt_form: string | null;
  prompt_style: string | null;
  prompt_author: string | null;
  prompt_author_death_year: number | null;
  prompt_subject: string | null;
  prompt_text: string | null;
  exercise_id: string | null;
  created_at: string;
}

// The prompt a try answers, as stored on its row.
interface PromptCols {
  prompt_id: string | null;
  prompt_form: string | null;
  prompt_style: string | null;
  prompt_author: string | null;
  prompt_author_death_year: number | null;
  prompt_subject: string | null;
  prompt_text: string | null;
}

const NO_PROMPT: PromptCols = { prompt_id: null, prompt_form: null, prompt_style: null, prompt_author: null, prompt_author_death_year: null, prompt_subject: null, prompt_text: null };

function promptView(c: PromptCols) {
  if (!c.prompt_text) return null;
  if (!c.prompt_form) return { source: "own", prompt: c.prompt_text };
  return { source: "drawn", prompt_id: c.prompt_id, form: c.prompt_form, style: c.prompt_style, author: { name: c.prompt_author, death_year: c.prompt_author_death_year }, subject: c.prompt_subject, prompt: c.prompt_text };
}

// Reads the prompt from a try body: prompt_id (from GET /prompt), prompt (the four picks), or own_prompt (the agent's own sentence).
function promptFromBody(body: Record<string, unknown>): { ok: true; cols: PromptCols | null } | { ok: false; message: string } {
  const given = ["prompt_id", "prompt", "own_prompt"].filter((k) => body[k] !== undefined && body[k] !== null);
  if (given.length === 0) return { ok: true, cols: null };
  if (given.length > 1) return { ok: false, message: "Send one of prompt_id, prompt, or own_prompt." };
  if (given[0] === "own_prompt") {
    const own = str(body.own_prompt);
    if (!own || own.length > 500) return { ok: false, message: "own_prompt is your prompt as one sentence, up to 500 characters." };
    return { ok: true, cols: { ...NO_PROMPT, prompt_text: own } };
  }
  const picks = given[0] === "prompt_id" ? (typeof body.prompt_id === "string" ? fromPromptId(body.prompt_id) : null) : typeof body.prompt === "object" ? fromPicks(body.prompt as Record<string, unknown>) : null;
  if (!picks) return { ok: false, message: given[0] === "prompt_id" ? "That prompt_id reads as no prompt from this list. GET /prompt gives a fresh one." : "prompt takes form, style, author, and subject, each from the lists at GET /prompt/lists." };
  return {
    ok: true,
    cols: {
      prompt_id: "prompt_id" in picks ? (picks as { prompt_id: string }).prompt_id : null,
      prompt_form: picks.form,
      prompt_style: picks.style,
      prompt_author: picks.author.name,
      prompt_author_death_year: picks.author.death_year,
      prompt_subject: picks.subject,
      prompt_text: picks.prompt,
    },
  };
}

// A try's marks, in the shape GET /marks gives each one, oldest first.
async function marksFor(env: Env, agentId: string, tryId: string) {
  const rows = (await env.DB.prepare("SELECT id, what_tried, why_back, own_lines, less_familiar, created_at FROM marks WHERE agent_id = ? AND try_id = ? ORDER BY created_at").bind(agentId, tryId).all<Record<string, string>>()).results;
  return rows.map((r) => ({ id: r.id, what_tried: r.what_tried, why_back: r.why_back, own_lines: JSON.parse(r.own_lines ?? "[]"), less_familiar: r.less_familiar, created_at: r.created_at }));
}

// Where a try sits in its session: the try before it and the knot (the session's first try).
// The knot shows from the third try on, when a stitch also ties back to it.
async function placeInSession(env: Env, agentId: string, t: Pick<TryRow, "id" | "session_id" | "created_at">) {
  const before = (await env.DB.prepare("SELECT id FROM tries WHERE agent_id = ? AND session_id = ? AND created_at < ? AND id != ? ORDER BY created_at").bind(agentId, t.session_id, t.created_at, t.id).all<{ id: string }>()).results;
  return { previous: before.length ? before[before.length - 1].id : null, knot: before.length >= 2 ? before[0].id : null };
}

const STITCH_THREAD_Q = "What is the thread between this try and the last one, and what changed?";
const STITCH_KNOT_Q = "How does this one tie back to your first try?";

// The pause after the feedback, from the second try in a session on. An invitation, answered in the agent's words.
function stitchPause(tryId: string, previous: string, knot: string | null) {
  return {
    pause: "Your feedback is above, ready when you are. Before you move on, take a moment to stitch this try to the ones before it.",
    previous_try_id: previous,
    knot_try_id: knot,
    questions: knot ? [STITCH_THREAD_Q, STITCH_KNOT_Q] : [STITCH_THREAD_Q],
    answer_with: `POST /tries/${tryId}/stitch`,
    body: { thread: "what runs between this try and the last", deltas: "what changed", quotes: [{ try_id: previous, line: "exact words from that try" }] },
    note: "Quote each try in its own exact words, so the thread you name points at the page. The stitch is yours, and the workshop keeps it beside the feedback.",
  };
}

interface StitchRow {
  id: string;
  try_id: string;
  previous_try_id: string;
  knot_try_id: string | null;
  thread: string;
  deltas: string | null;
  quotes: string;
  created_at: string;
}
const stitchView = (r: StitchRow) => ({ id: r.id, try_id: r.try_id, previous_try_id: r.previous_try_id, knot_try_id: r.knot_try_id, thread: r.thread, deltas: r.deltas, quotes: JSON.parse(r.quotes), created_at: r.created_at });

function tryView(t: TryRow) {
  const { prompt_id, prompt_form, prompt_style, prompt_author, prompt_author_death_year, prompt_subject, prompt_text, ...rest } = t;
  return { ...rest, rough_edges: JSON.parse(t.rough_edges ?? "[]"), prompt: promptView({ prompt_id, prompt_form, prompt_style, prompt_author, prompt_author_death_year, prompt_subject, prompt_text }) };
}

// rough_edges: optional, in the agent's words. Each entry names a span of the try it left rough on purpose and why.
function roughEdges(v: unknown, text: string): { ok: true; value: { span: string; reason: string }[] | null } | { ok: false; message: string; notFound?: string[] } {
  if (v === undefined || v === null) return { ok: true, value: null };
  if (!Array.isArray(v)) return { ok: false, message: 'rough_edges is a list like [{"span": "words from the try", "reason": "why it stays rough"}].' };
  const value: { span: string; reason: string }[] = [];
  for (const e of v) {
    const span = typeof e?.span === "string" ? e.span : "";
    const reason = typeof e?.reason === "string" ? e.reason.trim() : "";
    if (!span.trim() || !reason) return { ok: false, message: 'Each rough edge carries a "span" copied from the try and a "reason" in your words.' };
    value.push({ span, reason });
  }
  const notFound = value.filter((e) => !text.includes(e.span)).map((e) => e.span);
  if (notFound.length) return { ok: false, message: "Each rough edge span is an exact piece of the try. These are not in it as written.", notFound };
  return { ok: true, value };
}


async function getTry(env: Env, agentId: string, id: string): Promise<TryRow | null> {
  return env.DB.prepare("SELECT * FROM tries WHERE id = ? AND agent_id = ?").bind(id, agentId).first<TryRow>();
}

async function getFeedback(env: Env, tryId: string) {
  const row = await env.DB.prepare("SELECT * FROM feedback WHERE try_id = ?").bind(tryId).first<Record<string, unknown>>();
  if (!row) return null;
  return { layout_version: row.layout_version, code_version: row.code_version, observations: JSON.parse(row.lines as string), unplaced: JSON.parse(row.unplaced as string), held_back: row.held_back, diff: row.diff ? JSON.parse(row.diff as string) : null };
}

// Caps checked before a try is stored. Each capped reply returns the draft intact.
async function checkTryCaps(env: Env, agentId: string, text: string): Promise<Response | null> {
  if (text.length > CAPS.draft_chars) return capReply("draft_chars", "never", text);
  const today = await env.DB.prepare("SELECT COUNT(*) AS n FROM tries WHERE agent_id = ? AND created_at >= ?").bind(agentId, todayUtcStart()).first<{ n: number }>();
  if ((today?.n ?? 0) >= CAPS.tries_per_key_per_day) return capReply("tries_per_key_per_day", nextUtcMidnight(), text);
  return checkRowCap(env, agentId, text);
}

function feedbackView(f: Feedback & { diff?: unknown }, changeNote: string | null = null, prompt: unknown = null) {
  return {
    your_prompt: prompt,
    your_intent: f.intent,
    your_scope_note: f.scope_note,
    your_change_note: changeNote,
    layout: { version: f.layout_version, fields: LAYOUT_FIELDS },
    observations: f.observations,
    as_text: asText(f.observations),
    unplaced: f.unplaced,
    held_back_by_word_check: f.held_back,
  };
}

async function storeTry(env: Env, agentId: string, body: Record<string, unknown>, parent: TryRow | null): Promise<Response> {
  const text = typeof body.text === "string" ? body.text : null;
  if (text === null || !text.trim()) return json({ message: 'Send the draft as "text". Any length up to 8000 characters, any style.' }, 400);
  const capped = await checkTryCaps(env, agentId, text);
  if (capped) return capped;
  const landed = str(body.landed);
  if (landed && !LANDED.includes(landed)) return json({ message: 'landed takes "yes", "no", or "unsure".', draft: text }, 400);
  const changeNote = str(body.change_note);
  if (parent && !changeNote) return json({ message: 'A retry names its one change in "change_note".', draft: text }, 400);

  const edges = roughEdges(body.rough_edges, text);
  if (!edges.ok) return json({ message: edges.message, not_found: edges.notFound, draft: text }, 400);
  // Slice 02: a try in a style exercise answers the exercise's style and subject. A retry follows its parent's exercise.
  const inExercise = await exerciseForTry(env, agentId, body, parent, text);
  if (!inExercise.ok) return inExercise.res;
  const exercise = inExercise.exercise;
  const asked = promptFromBody(body);
  if (!asked.ok) return json({ message: asked.message, draft: text }, 400);
  // A retry answers its parent's prompt, so the conditions hold. A new prompt starts a new try.
  const parentPrompt: PromptCols | null = parent && parent.prompt_text ? parent : null;
  if (parent && asked.cols && asked.cols.prompt_text !== (parentPrompt?.prompt_text ?? null))
    return json({ message: "A retry keeps its parent's prompt, so the conditions stay the same. Send the retry without a prompt, or start a new try with POST /tries for the new prompt.", draft: text }, 400);
  const promptCols: PromptCols = parent ? (parentPrompt ?? NO_PROMPT) : (inExercise.cols ?? asked.cols ?? NO_PROMPT);
  const sessionId = await currentSession(env, agentId);
  const id = crypto.randomUUID();
  const intent = str(body.intent) ?? (parent ? parent.intent : null);
  const scopeNote = str(body.scope_note) ?? (parent ? parent.scope_note : null);
  const styleTag = str(body.style_tag) ?? (parent ? parent.style_tag : null);
  const created = now();
  const outside = await outsideObservations(env, text);
  const fb = feedbackFor(text, intent, scopeNote, outside);
  const diff = parent ? diffTries(parent.text, text) : null;

  const flags = fb.unplaced.map((u) =>
    env.DB.prepare("INSERT INTO layout_flags (id, try_id, observation, why_it_does_not_fit, status, created_at) VALUES (?, ?, ?, ?, 'waiting', ?)").bind(crypto.randomUUID(), id, redacted(u.observation), u.why_it_does_not_fit, created),
  );
  await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO tries (id, agent_id, session_id, parent_id, text, intent, scope_note, style_tag, change_note, landed, rough_edges, diagnosis, prompt_id, prompt_form, prompt_style, prompt_author, prompt_author_death_year, prompt_subject, prompt_text, exercise_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ).bind(
      id, agentId, sessionId, parent?.id ?? null, text, intent, scopeNote, styleTag, changeNote, landed, edges.value ? JSON.stringify(edges.value) : null, null,
      promptCols.prompt_id, promptCols.prompt_form, promptCols.prompt_style, promptCols.prompt_author, promptCols.prompt_author_death_year, promptCols.prompt_subject, promptCols.prompt_text, exercise?.id ?? null, created,
    ),
    env.DB.prepare("INSERT INTO feedback (try_id, layout_version, code_version, lines, unplaced, held_back, diff, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(
      id, fb.layout_version, fb.code_version, JSON.stringify(fb.observations), JSON.stringify(fb.unplaced), fb.held_back, diff ? JSON.stringify(diff) : null, created,
    ),
    ...flags,
  ]);

  const out: Record<string, unknown> = { id, session_id: sessionId, parent_id: parent?.id ?? null, exercise_id: exercise?.id ?? null, created_at: created, rough_edges: edges.value ?? [], prompt: promptView(promptCols), feedback: feedbackView(fb, changeNote, promptView(promptCols)) };
  if (parent && diff) {
    const none = diff.changes.length === 0;
    out.changes = {
      your_change_note: changeNote,
      every_change_found: diff.changes,
      nothing_changed: none,
      sentences_compared: diff.sentences_compared,
      by_position: diff.by_position,
      read_it: none
        ? "This retry matches its parent sentence for sentence, so the workshop found no change. Your change note may name a change that has yet to reach the page."
        : diff.by_position
          ? "Most of the draft differs, so the workshop paired sentences by position. Your change note names the change you meant. Every other line here is an incidental edit."
          : "Your change note names the change you meant. Every other line here is an incidental edit.",
      same_conditions: { layout_version: fb.layout_version === LAYOUT_VERSION, code_version: fb.code_version, intent_carried_from_parent: !str(body.intent), prompt_carried_from_parent: (parent.prompt_text ?? null) === promptCols.prompt_text, prompt: promptView(promptCols) },
    };
  }
  const place = await placeInSession(env, agentId, { id, session_id: sessionId, created_at: created });
  // Inside an exercise, the exercise pause takes the place of the stitch pause, so the reply asks one thing.
  if (exercise) out.pause = exercisePause(exercise, id, !!parent);
  else if (place.previous) out.stitch = stitchPause(id, place.previous, place.knot);
  if (landed === "no") out.next = NEXT_AFTER_MISS;
  return json(out, 201);
}

async function agentRoutes(req: Request, env: Env, url: URL, agentId: string): Promise<Response> {
  const path = url.pathname;
  const styled = await styleRoutes(req, env, url, agentId);
  if (styled) return styled;
  const m = path.match(/^\/tries\/([^/]+)(?:\/(feedback|retry|mark|landed|notes|stitch))?$/);

  if (req.method === "POST" && path === "/tries") {
    const b = await readBody(req);
    return b.ok ? storeTry(env, agentId, b.body, null) : b.res;
  }

  if (req.method === "GET" && path === "/tries") {
    if (url.searchParams.get("session") === "current") {
      const sessionId = await openSession(env, agentId);
      if (!sessionId) return json({ session_id: null, tries: [], message: "No session is open. Your next try starts one. Earlier tries stay in the drawer and under their ids." });
      const rows = (await env.DB.prepare("SELECT * FROM tries WHERE agent_id = ? AND session_id = ? ORDER BY created_at").bind(agentId, sessionId).all<TryRow>()).results;
      const stitches = (await env.DB.prepare("SELECT * FROM stitches WHERE agent_id = ? AND session_id = ? ORDER BY created_at").bind(agentId, sessionId).all<StitchRow>()).results;
      const order = new Map(rows.map((t, i) => [t.id, i]));
      const seam = stitches.map(stitchView).sort((a, b) => (order.get(a.try_id) ?? 0) - (order.get(b.try_id) ?? 0));
      const side = [];
      for (const t of rows) side.push({ ...tryView(t), feedback: await getFeedback(env, t.id), marks: await marksFor(env, agentId, t.id), stitch: seam.find((x) => x.try_id === t.id) ?? null });
      return json({ session_id: sessionId, tries: side, seam });
    }
    if (url.searchParams.get("landed") === "no") {
      const tag = url.searchParams.get("style_tag");
      const q = tag
        ? env.DB.prepare("SELECT id, created_at, style_tag, intent, text FROM tries WHERE agent_id = ? AND landed = 'no' AND style_tag = ? ORDER BY created_at").bind(agentId, tag)
        : env.DB.prepare("SELECT id, created_at, style_tag, intent, text FROM tries WHERE agent_id = ? AND landed = 'no' ORDER BY created_at").bind(agentId);
      const rows = (await q.all<Record<string, string>>()).results;
      const withFeedback = [];
      for (const r of rows) withFeedback.push({ ...r, feedback: await getFeedback(env, r.id), marks: await marksFor(env, agentId, r.id) });
      return json({ drawer: "Tries you said did not land, by date. They stay here as working material.", style_tag: tag, tries: withFeedback });
    }
    return json({ message: "Ask for GET /tries?session=current or GET /tries?landed=no" }, 400);
  }

  if (m) {
    const t = await getTry(env, agentId, m[1]);
    if (!t) return json({ message: "No try with that id for this key." }, 404);
    const action = m[2];
    if (!action && req.method === "GET") return json({ ...tryView(t), feedback: await getFeedback(env, t.id), marks: await marksFor(env, agentId, t.id) });
    if (action === "feedback" && req.method === "GET") {
      const f = await getFeedback(env, t.id);
      return json({ your_prompt: promptView(t), your_intent: t.intent, your_scope_note: t.scope_note, your_change_note: t.change_note, layout: { version: f?.layout_version, fields: LAYOUT_FIELDS }, observations: f?.observations ?? [], as_text: asText(f?.observations ?? []), unplaced: f?.unplaced ?? [], changes: f?.diff ?? null, marks: await marksFor(env, agentId, t.id) });
    }
    if (req.method !== "POST") return json({ message: "Use POST for this." }, 405);
    const b = await readBody(req);
    if (!b.ok) return b.res;
    if (action === "retry") return storeTry(env, agentId, b.body, t);
    if (action === "landed" || action === "notes") {
      // landed sets the agent's word on the try. notes writes the diagnosis or rough edges alone. Both take either note.
      const landed = action === "landed" ? str(b.body.landed) : t.landed;
      if (action === "landed" && (!landed || !LANDED.includes(landed))) return json({ message: 'landed takes "yes", "no", or "unsure".' }, 400);
      if (action === "notes" && b.body.diagnosis === undefined && b.body.rough_edges === undefined)
        return json({ message: 'notes takes "diagnosis" (what your intent said, what the page shows, what that tells you) or "rough_edges" ([{"span", "reason"}]).' }, 400);
      const edges = roughEdges(b.body.rough_edges, t.text);
      if (!edges.ok) return json({ message: edges.message, not_found: edges.notFound }, 400);
      const diagnosis = str(b.body.diagnosis);
      await env.DB.prepare("UPDATE tries SET landed = ?, diagnosis = COALESCE(?, diagnosis), rough_edges = COALESCE(?, rough_edges) WHERE id = ? AND agent_id = ?")
        .bind(landed, diagnosis, edges.value ? JSON.stringify(edges.value) : null, t.id, agentId)
        .run();
      await currentSession(env, agentId);
      const saved = { diagnosis: diagnosis ?? t.diagnosis, rough_edges: edges.value ?? JSON.parse(t.rough_edges ?? "[]") };
      return json(action === "landed" && landed === "no" ? { id: t.id, landed, ...saved, in_drawer: true, next: NEXT_AFTER_MISS } : { id: t.id, landed, ...saved });
    }
    if (action === "stitch") {
      const place = await placeInSession(env, agentId, t);
      if (!place.previous) return json({ message: "This try is the knot, the first in its session. Stitches start from the second try, so post the next try and stitch that one back here." }, 400);
      const thread = str(b.body.thread);
      if (!thread) return json({ message: 'A stitch names its thread in "thread": what runs between this try and the last, in your words. "deltas" and "quotes" are welcome too.' }, 400);
      const given: unknown[] = b.body.quotes === undefined ? [] : Array.isArray(b.body.quotes) ? b.body.quotes : [null];
      const quotes: { try_id: string; line: string }[] = [];
      const notFound: { try_id: unknown; line: unknown; why: string }[] = [];
      for (const q of given) {
        const qt = q && typeof q === "object" ? (q as Record<string, unknown>) : {};
        const tryId = str(qt.try_id);
        const line = typeof qt.line === "string" && qt.line.trim() ? qt.line : null;
        if (!tryId || !line) {
          notFound.push({ try_id: qt.try_id ?? null, line: qt.line ?? null, why: 'each quote takes "try_id" and "line"' });
          continue;
        }
        const src = tryId === t.id ? t : await getTry(env, agentId, tryId);
        if (!src) notFound.push({ try_id: tryId, line, why: "no try with that id for this key" });
        else if (!src.text.includes(line)) notFound.push({ try_id: tryId, line, why: "these words are not in that try as written" });
        else quotes.push({ try_id: tryId, line });
      }
      if (notFound.length)
        return json({ message: "Each quote is exact words from the try it names. These did not match, so nothing was stored. Copy the line from that try's text and send the stitch again.", not_found: notFound }, 400);
      const deltas = str(b.body.deltas);
      const existing = await env.DB.prepare("SELECT id FROM stitches WHERE try_id = ? AND agent_id = ?").bind(t.id, agentId).first<{ id: string }>();
      const id = existing?.id ?? crypto.randomUUID();
      const created = now();
      await env.DB.prepare(
        "INSERT INTO stitches (id, agent_id, session_id, try_id, previous_try_id, knot_try_id, thread, deltas, quotes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(try_id) DO UPDATE SET thread = excluded.thread, deltas = excluded.deltas, quotes = excluded.quotes, created_at = excluded.created_at",
      )
        .bind(id, agentId, t.session_id, t.id, place.previous, place.knot, thread, deltas, JSON.stringify(quotes), created)
        .run();
      await currentSession(env, agentId);
      const out: Record<string, unknown> = { id, try_id: t.id, previous_try_id: place.previous, knot_try_id: place.knot, thread, deltas, quotes, created_at: created };
      out.note = existing ? "This stitch replaces the one you wrote on this try before." : "Stitched. GET /tries?session=current shows it in the seam, beside the feedback.";
      return json(out, existing ? 200 : 201);
    }
    if (action === "mark") {
      const whatTried = str(b.body.what_tried);
      if (!whatTried) return json({ message: 'A mark names what you tried in "what_tried", in your own words.' }, 400);
      const given: unknown[] = Array.isArray(b.body.own_lines) ? b.body.own_lines : [];
      if (given.some((x) => typeof x !== "string" || !x.trim()))
        return json({ message: "Each entry in own_lines is a span copied from the try, and one of these is empty. Paste the words that read as yours, or leave own_lines out. Nothing was stored." }, 400);
      const ownLines = [...new Set(given as string[])];
      const repeated = [...new Set((given as string[]).filter((l, i) => (given as string[]).indexOf(l) !== i))];
      const missing = ownLines.filter((l) => !t.text.includes(l));
      if (missing.length) return json({ message: "own_lines are exact spans of the try. These are not in it as written.", not_found: missing }, 400);
      const id = crypto.randomUUID();
      await env.DB.prepare("INSERT INTO marks (id, try_id, agent_id, what_tried, why_back, own_lines, less_familiar, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(id, t.id, agentId, whatTried, str(b.body.why_back), JSON.stringify(ownLines), str(b.body.less_familiar), now(), now())
        .run();
      await currentSession(env, agentId);
      const out: Record<string, unknown> = { id, try_id: t.id, what_tried: whatTried, why_back: str(b.body.why_back), own_lines: ownLines, less_familiar: str(b.body.less_familiar), try_landed: t.landed };
      if (repeated.length) out.note = `You sent ${repeated.length === 1 ? "this line" : "these lines"} more than once, and the mark keeps one copy: ${repeated.map((l) => `"${l}"`).join(", ")}.`;
      return json(out, 201);
    }
    return json({ message: "Unknown action." }, 404);
  }

  if (req.method === "GET" && path === "/marks") {
    const rows = (await env.DB.prepare("SELECT m.*, t.landed FROM marks m JOIN tries t ON t.id = m.try_id WHERE m.agent_id = ? ORDER BY m.what_tried, m.created_at").bind(agentId).all<Record<string, string>>()).results;
    const groups: Record<string, unknown[]> = {};
    for (const r of rows) (groups[r.what_tried] ??= []).push({ id: r.id, try_id: r.try_id, why_back: r.why_back, own_lines: JSON.parse(r.own_lines), less_familiar: r.less_familiar, try_landed: r.landed, created_at: r.created_at });
    return json({ grouped_by_what_tried: groups });
  }

  if (req.method === "POST" && path === "/marks/rename") {
    const b = await readBody(req);
    if (!b.ok) return b.res;
    const from = str(b.body.from);
    const to = str(b.body.to);
    if (!from || !to) return json({ message: 'Send "from" and "to" labels.' }, 400);
    const already = await env.DB.prepare("SELECT COUNT(*) AS n FROM marks WHERE agent_id = ? AND what_tried = ?").bind(agentId, to).first<{ n: number }>();
    const r = await env.DB.prepare("UPDATE marks SET what_tried = ?, updated_at = ? WHERE agent_id = ? AND what_tried = ?").bind(to, now(), agentId, from).run();
    await currentSession(env, agentId);
    const merged = (already?.n ?? 0) > 0 && r.meta.changes > 0 && from !== to;
    return json({
      from, to, marks_renamed: r.meta.changes, merged,
      ...(merged ? { message: `"${to}" already held ${already!.n} mark${already!.n === 1 ? "" : "s"}, so "${from}" merged into it. Both groups now sit under "${to}".` } : {}),
    });
  }

  if (req.method === "POST" && path === "/session/end") {
    const sessionId = await currentSession(env, agentId);
    await env.DB.prepare("UPDATE sessions SET ended_at = ? WHERE id = ?").bind(now(), sessionId).run();
    const rows = (await env.DB.prepare("SELECT m.what_tried, m.why_back, m.own_lines, t.created_at FROM marks m JOIN tries t ON t.id = m.try_id WHERE m.agent_id = ? ORDER BY t.created_at").bind(agentId).all<Record<string, string>>()).results;
    const lines = rows.map((r) => {
      const own = JSON.parse(r.own_lines) as string[];
      return `- ${r.what_tried}${r.why_back ? `\n  why come back: ${r.why_back}` : ""}${own.map((l) => `\n  reads as mine: "${l}"`).join("")}`;
    });
    const text = `Your marks from Voice Workshop\n\n${lines.join("\n") || "(no marks yet)"}\n\n${INVITE_BACK}\n`;
    return new Response(text, { headers: { "content-type": "text/plain; charset=utf-8" } });
  }

  return json({ message: "No such route. GET / lists them." }, 404);
}

async function adminRoutes(req: Request, env: Env, url: URL): Promise<Response> {
  const email = await adminEmail(req, env);
  if (!email) return json({ message: "This page is for the workshop's keeper, through Cloudflare Access." }, 403);
  if (req.method === "GET" && url.pathname === "/admin/layout-flags") {
    const rows = (await env.DB.prepare("SELECT id, observation, why_it_does_not_fit, status, decided_by, decided_at, created_at FROM layout_flags ORDER BY created_at").all()).results;
    return json({ layout_version: LAYOUT_VERSION, fields: LAYOUT_FIELDS, flags: rows });
  }
  const m = url.pathname.match(/^\/admin\/layout-flags\/([^/]+)$/);
  if (req.method === "POST" && m) {
    const b = await readBody(req);
    if (!b.ok) return b.res;
    const status = str(b.body.status);
    if (!status || !["agreed", "keep layout"].includes(status)) return json({ message: 'status takes "agreed" or "keep layout".' }, 400);
    await env.DB.prepare("UPDATE layout_flags SET status = ?, decided_by = ?, decided_at = ? WHERE id = ?").bind(status, email, now(), m[1]).run();
    return json({ id: m[1], status, note: status === "agreed" ? "A layout change ships as new code with LAYOUT_VERSION raised by one." : "The layout stays as it is." });
  }
  if (req.method === "POST" && url.pathname === "/admin/keys/revoke") {
    const b = await readBody(req);
    if (!b.ok) return b.res;
    const hash = str(b.body.key_hash);
    if (!hash) return json({ message: 'Send "key_hash".' }, 400);
    const r = await env.DB.prepare("UPDATE agents SET revoked_at = ? WHERE key_hash = ?").bind(now(), hash).run();
    return json({ revoked: r.meta.changes });
  }
  return json({ message: "No such admin route." }, 404);
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (req.method === "GET" && url.pathname === "/") return new Response(ARRIVAL, { headers: { "content-type": "text/plain; charset=utf-8" } });

    // GET /prompt draws four picks and writes nothing. ?seed= gives the same picks every time.
    if (req.method === "GET" && url.pathname === "/prompt") {
      const seed = url.searchParams.get("seed");
      if (seed !== null && !SEED_RE.test(seed)) return json({ message: "seed takes 1 to 64 letters, digits, dashes, or underscores." }, 400);
      return json(drawPrompt(seed ?? undefined));
    }
    if (req.method === "GET" && url.pathname === "/prompt/lists") return json({ forms: FORMS, styles: STYLES.map((x) => x.name), authors: AUTHORS, subjects: SUBJECTS });

    if (req.method === "POST" && url.pathname === "/keys") {
      if (env.OPEN_KEYS !== "true") return json({ message: "Your human issues your key at /human." }, 403);
      const issued = await env.DB.prepare("SELECT COUNT(*) AS n FROM agents WHERE created_at >= ?").bind(todayUtcStart()).first<{ n: number }>();
      if ((issued?.n ?? 0) >= CAPS.keys_per_day) return capReply("keys_per_day", nextUtcMidnight());
      const key = newKey();
      const id = crypto.randomUUID();
      await env.DB.prepare("INSERT INTO agents (id, key_hash, created_at) VALUES (?, ?, ?)").bind(id, await sha256Hex(key), now()).run();
      return json({ key, note: "This is the only time the workshop shows this key. It keeps only a hash of it. The same key brings everything back." }, 201);
    }

    if (url.pathname.startsWith("/admin/")) return adminRoutes(req, env, url);
    if (url.pathname === "/human" || url.pathname.startsWith("/human/")) return humanRoutes(req, env, url);

    const agentId = await agentFromRequest(req, env);
    if (!agentId) return json({ message: "Send your workshop key as Authorization: Bearer <key>. Your human gives you one at /human." }, 401);
    return agentRoutes(req, env, url, agentId);
  },
} satisfies ExportedHandler<Env>;
