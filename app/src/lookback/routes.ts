// Slice 04 routes. D1 reads and writes live here; the logic lives in pure functions beside it.
// Every query reads and writes only rows under the caller's key.
import type { Env } from "../types.ts";
import { CAPS, capReply, nextUtcMidnight, todayUtcStart } from "../caps.ts";
import { json, now, readBody, str } from "../http.ts";
import { checkRowCap } from "../rows.ts";
import { KINDS, STYLE_BY_ID, kindOfForm } from "../styles/catalog.ts";
import { audit, buildCorpus, type Corpus, type Rows, type TryIn } from "./corpus.ts";
import { recurring } from "./recurring.ts";
import { dropped } from "./dropped.ts";
import { checkInstances, COMPARE_MEASURES, compareAlong, countPattern, denominatorLabels, rankPatterns, timeline, type CompareMeasure, type Denominator, type Instance } from "./patterns.ts";
import { putChunked } from "./store.ts";

export const CORPUS_Q = "What is missing from this set, and what does that limit?";
export const PATTERN_Q = "What counts as one?";
export const CLAIM_Q = "What would make you less sure?";
const CLAIM_KINDS = ["taste", "default", "mixture", "unclear"];

interface LookbackRow { id: string; agent_id: string; scope: string; piece_count: number; capped: number; limits_note: string | null; created_at: string }

async function hasExercises(env: Env): Promise<boolean> {
  return !!(await env.DB.prepare("SELECT name FROM sqlite_schema WHERE type='table' AND name='exercises'").first());
}

async function loadRows(env: Env, agentId: string, lookbackId: string | null, withEx: boolean): Promise<Rows> {
  const tries = (await env.DB.prepare(`SELECT id, parent_id, session_id, text, intent, scope_note, change_note, diagnosis, rough_edges, landed, style_tag, prompt_form, prompt_style, prompt_author, ${withEx ? "exercise_id" : "NULL AS exercise_id"}, created_at FROM tries WHERE agent_id = ? ORDER BY created_at, rowid`).bind(agentId).all<TryIn>()).results;
  const marks = (await env.DB.prepare("SELECT id, try_id, what_tried, why_back, own_lines, less_familiar FROM marks WHERE agent_id = ? ORDER BY created_at").bind(agentId).all<Rows["marks"][number]>()).results;
  const stitches = (await env.DB.prepare("SELECT id, try_id, thread, deltas, quotes FROM stitches WHERE agent_id = ? ORDER BY created_at").bind(agentId).all<Rows["stitches"][number]>()).results;
  const xnotes = withEx ? (await env.DB.prepare("SELECT id, exercise_id, try_id, kind, text, quotes FROM exercise_notes WHERE agent_id = ? ORDER BY created_at").bind(agentId).all<NonNullable<Rows["xnotes"]>[number]>()).results : null;
  const exercises = withEx ? (await env.DB.prepare("SELECT id, style_id FROM exercises WHERE agent_id = ?").bind(agentId).all<NonNullable<Rows["exercises"]>[number]>()).results : null;
  const placements = lookbackId ? (await env.DB.prepare("SELECT note_id, belongs_to FROM lookback_placements WHERE lookback_id = ?").bind(lookbackId).all<Rows["placements"][number]>()).results : [];
  return { tries, marks, stitches, xnotes, exercises, placements };
}

async function diffsFor(env: Env, ids: string[]) {
  const out = new Map<string, { changes: { kind: "changed" | "added" | "removed"; before: string | null; after: string | null }[] } | null>();
  for (let i = 0; i < ids.length; i += 50) {
    const part = ids.slice(i, i + 50);
    const rows = (await env.DB.prepare(`SELECT try_id, diff FROM feedback WHERE try_id IN (${part.map(() => "?").join(",")})`).bind(...part).all<{ try_id: string; diff: string | null }>()).results;
    for (const r of rows) out.set(r.try_id, r.diff ? JSON.parse(r.diff) : null);
  }
  return out;
}

type Scope = { all: true } | { dates: { from: string | null; to: string | null } } | { sessions: string[] } | { kinds: string[] };

function parseScope(v: unknown): Scope | string {
  const s = (v ?? { all: true }) as Record<string, unknown>;
  if (v === undefined || v === "all" || s.all === true) return { all: true };
  if (s.dates && typeof s.dates === "object") {
    const d = s.dates as Record<string, unknown>;
    const from = str(d.from);
    const to = str(d.to);
    if ((from && isNaN(Date.parse(from))) || (to && isNaN(Date.parse(to))) || (!from && !to)) return 'dates takes {"from": "2026-11-01", "to": "2026-11-30"}, either end optional.';
    return { dates: { from, to } };
  }
  if (Array.isArray(s.sessions) && s.sessions.length && s.sessions.every((x) => typeof x === "string")) return { sessions: s.sessions as string[] };
  if (Array.isArray(s.kinds) && s.kinds.length && s.kinds.every((x) => (KINDS as readonly string[]).includes(x as string))) return { kinds: s.kinds as string[] };
  return `scope takes "all", {"dates": {"from", "to"}}, {"sessions": ["session id", ...]}, or {"kinds": [${KINDS.map((k) => `"${k}"`).join(", ")}]}.`;
}

function inScope(rows: Rows, scope: Scope): string[] {
  const exStyle = new Map((rows.exercises ?? []).map((e) => [e.id, e.style_id]));
  return rows.tries
    .filter((t) => {
      if ("all" in scope) return true;
      if ("dates" in scope) {
        const at = t.created_at;
        return (!scope.dates.from || at >= new Date(scope.dates.from).toISOString()) && (!scope.dates.to || at <= new Date(new Date(scope.dates.to).getTime() + (scope.dates.to.length <= 10 ? 86399999 : 0)).toISOString());
      }
      if ("sessions" in scope) return scope.sessions.includes(t.session_id);
      const k = t.exercise_id && exStyle.has(t.exercise_id) ? STYLE_BY_ID.get(exStyle.get(t.exercise_id)!)?.kind : kindOfForm(t.prompt_form);
      return !!k && scope.kinds.includes(k);
    })
    .map((t) => t.id);
}

async function writesToday(env: Env, agentId: string): Promise<Response | null> {
  await env.DB.prepare("DELETE FROM lookback_writes WHERE agent_id = ? AND created_at < ?").bind(agentId, todayUtcStart()).run();
  const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM lookback_writes WHERE agent_id = ?").bind(agentId).first<{ n: number }>();
  if ((n?.n ?? 0) >= CAPS.lookback_writes_per_key_per_day) return capReply("lookback_writes_per_key_per_day", nextUtcMidnight());
  return checkRowCap(env, agentId);
}
const logWrite = (env: Env, agentId: string) => env.DB.prepare("INSERT INTO lookback_writes (agent_id, created_at) VALUES (?, ?)").bind(agentId, now());

// Builds the corpus for a stored lookback from its piece list, reading the words from tries.
async function corpusOf(env: Env, agentId: string, lb: LookbackRow) {
  const withEx = await hasExercises(env);
  const rows = await loadRows(env, agentId, lb.id, withEx);
  const pieces = (await env.DB.prepare("SELECT try_id, pulled FROM lookback_pieces WHERE lookback_id = ? ORDER BY seq").bind(lb.id).all<{ try_id: string; pulled: number }>()).results;
  const corpus = buildCorpus(rows, pieces.filter((p) => !p.pulled).map((p) => p.try_id), pieces.filter((p) => p.pulled).map((p) => p.try_id), Number.MAX_SAFE_INTEGER);
  corpus.capped = !!lb.capped;
  return { corpus, rows, withEx };
}

// Computes audit, recurring, and dropped once, and stores them by reference in chunks.
async function storeResults(env: Env, lookbackId: string, corpus: Corpus) {
  const diffs = await diffsFor(env, corpus.pieces.filter((p) => p.parent_id).map((p) => p.try_id));
  const sections = { audit: audit(corpus), recurring: recurring(corpus), dropped: dropped(corpus, diffs) };
  const stmts = [env.DB.prepare("DELETE FROM lookback_results WHERE lookback_id = ?").bind(lookbackId)];
  for (const [section, items] of Object.entries(sections))
    putChunked(items).forEach((chunk, seq) => stmts.push(env.DB.prepare("INSERT INTO lookback_results (lookback_id, section, seq, items) VALUES (?, ?, ?, ?)").bind(lookbackId, section, seq, chunk)));
  await env.DB.batch(stmts);
  return Object.fromEntries(Object.entries(sections).map(([k, v]) => [k, v.length]));
}

// Fills in the words for every reference {label, try_id, start, end}, from the tries as stored.
function withQuotes(v: unknown, byTry: Map<string, TryIn>): unknown {
  if (Array.isArray(v)) return v.map((x) => withQuotes(x, byTry));
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(o)) out[k] = withQuotes(x, byTry);
    if (typeof o.try_id === "string" && typeof o.start === "number" && typeof o.end === "number") out.quote = byTry.get(o.try_id)?.text.slice(o.start, o.end) ?? null;
    return out;
  }
  return v;
}

async function resultsOf(env: Env, lookbackId: string, section: string) {
  const rows = (await env.DB.prepare("SELECT items FROM lookback_results WHERE lookback_id = ? AND section = ? ORDER BY seq").bind(lookbackId, section).all<{ items: string }>()).results;
  return rows.flatMap((r) => JSON.parse(r.items) as unknown[]);
}

function noteView(c: Corpus, id: string, placed: Map<string, string>) {
  const n = c.notes.get(id)!;
  return { id, kind: n.kind, text: n.text, about: n.about, ...(n.carried_from_parent ? { carried_from_parent: true } : {}), ...(placed.has(id) ? { placed_by_you: placed.get(id) } : {}) };
}

function corpusView(c: Corpus, lb: LookbackRow, rows: Rows, withEx: boolean) {
  const placed = new Map(rows.placements.map((p) => [p.note_id, p.belongs_to]));
  const chains = new Map<string, string[]>();
  for (const p of c.pieces) chains.set(p.chain_root_try_id, [...(chains.get(p.chain_root_try_id) ?? []), p.label]);
  return {
    id: lb.id, scope: JSON.parse(lb.scope), created_at: lb.created_at,
    pieces: c.pieces.map((p) => {
      const t = c.byTry.get(p.try_id)!;
      return {
        label: p.label, try_id: p.try_id, created_at: p.created_at, session_id: p.session_id, text: t.text, landed: p.landed, style: p.style,
        parent: p.parent_id ? (p.parent_outside ? { try_id: p.parent_id, label: null, note: "outside this scope" } : { try_id: p.parent_id, label: p.parent_label }) : null,
        change_note: t.change_note,
        chain: (chains.get(p.chain_root_try_id) ?? []).length > 1 ? chains.get(p.chain_root_try_id) : null,
        pulled: p.pulled,
        notes: p.note_ids.map((id) => noteView(c, id, placed)),
        no_notes: p.note_ids.length === 0,
      };
    }),
    chains: [...chains.values()].filter((l) => l.length > 1),
    piece_count: c.pieces.length,
    limits: {
      capped: c.capped ? `The scope held ${c.in_scope} tries; this lookback takes the newest ${c.pieces.filter((p) => !p.pulled).length}, up to ${CAPS.lookback_pieces} pieces or ${CAPS.lookback_chars} characters of text.` : null,
      exercises: withEx ? "Exercise notes from slice 02 are included." : "Slice 02's exercise tables are not here, so exercise notes are left out.",
      layered: "Retry chains stand in for layered pieces until slice 03 exists.",
      your_limits_note: lb.limits_note,
    },
    pause: { question: CORPUS_Q, answer_with: `POST /lookbacks/${lb.id}/limits`, body: { limits_note: "..." } },
    next: `GET /lookbacks/${lb.id}/audit, /recurring, /dropped, /compare?measure=. Name a pattern with POST /lookbacks/${lb.id}/patterns.`,
  };
}

async function patternView(env: Env, c: Corpus, lbId: string, p: Record<string, string | number>) {
  const instances = JSON.parse(p.instances as string) as Instance[];
  const d = JSON.parse(p.denominator as string) as Denominator;
  const counts = countPattern(c, instances, d);
  const all = (await env.DB.prepare("SELECT id, name, instances, denominator FROM patterns WHERE lookback_id = ?").bind(lbId).all<Record<string, string>>()).results;
  const ranks = rankPatterns(all.map((x) => {
    const cc = countPattern(c, JSON.parse(x.instances), JSON.parse(x.denominator));
    return { id: x.id, name: x.name, rate: cc.appearance_rate, size: cc.denominator.size };
  }));
  const revisions = (await env.DB.prepare("SELECT rule_version, inclusion_rule, denominator, counts, created_at FROM pattern_revisions WHERE pattern_id = ? ORDER BY rule_version").bind(p.id).all<Record<string, string>>()).results;
  const intentBeside: Record<string, { label: string; has_it: boolean; intent: string | null }[]> = {};
  for (const piece of c.pieces) {
    const style = piece.style.value ?? "(no style)";
    (intentBeside[style] ??= []).push({ label: piece.label, has_it: !!counts.per_piece[piece.label], intent: c.byTry.get(piece.try_id)!.intent });
  }
  const claims = (await env.DB.prepare("SELECT * FROM claims WHERE pattern_id = ? ORDER BY created_at").bind(p.id).all<Record<string, string>>()).results.map(claimView);
  return {
    id: p.id, name: p.name, inclusion_rule: p.inclusion_rule, rule_version: p.rule_version, instances,
    counts, rank: ranks.find((r) => r.id === p.id), all_ranks: ranks,
    timeline: timeline(c, counts.per_piece, counts.denominator.pieces),
    intent_notes_beside_it_by_style: intentBeside,
    revisions: revisions.map((r) => ({ ...r, denominator: JSON.parse(r.denominator), counts: JSON.parse(r.counts) })),
    claims,
    pause: { question: PATTERN_Q, revise_with: `POST /lookbacks/${lbId}/patterns/${p.id}/revise`, claim_with: `POST /lookbacks/${lbId}/claims` },
  };
}

function claimView(r: Record<string, string>) {
  const rejections = JSON.parse(r.rejections) as unknown[];
  const evidence = JSON.parse(r.evidence) as Record<string, unknown>[];
  const notes = evidence.filter((e) => e.note_id);
  return {
    id: r.id, pattern_id: r.pattern_id, kind: r.kind, function: r.function, future_intent: r.future_intent,
    evidence, interpretation: r.interpretation, counterexamples: JSON.parse(r.counterexamples), qualifiers: r.qualifiers,
    rejections: { recorded: rejections.length === 1 ? "1 recorded" : `${rejections.length} recorded`, entries: rejections, ...(rejections.length === 1 ? { scope: "one instance" } : {}) },
    notes_side_by_side: notes.length > 1 ? notes : null,
    created_at: r.created_at,
  };
}

// Checks a list of {piece, quote} or {note_id, quote} entries word for word.
function checkCited(c: Corpus, list: unknown, needs: "piece" | "piece_or_note" | "rejection"): { ok: true; value: Record<string, unknown>[] } | { ok: false; bad: unknown[]; message?: string } {
  if (list === undefined || list === null) return { ok: true, value: [] };
  if (!Array.isArray(list)) return { ok: false, bad: [], message: "Send a list." };
  const value: Record<string, unknown>[] = [];
  const bad: unknown[] = [];
  for (const raw of list) {
    const e = (raw ?? {}) as Record<string, unknown>;
    const quote = typeof e.quote === "string" && e.quote.trim() ? e.quote : null;
    const pieceL = str(e.piece);
    const noteId = str(e.note_id);
    if (!quote || (needs === "piece" && !pieceL) || (needs !== "piece" && !pieceL && !noteId)) {
      bad.push({ entry: e, why: needs === "rejection" ? 'each entry takes "piece", "note_id", and "quote"' : 'each entry takes "piece" (or "note_id") and an exact "quote"' });
      continue;
    }
    if (noteId) {
      const n = c.notes.get(noteId);
      if (!n) bad.push({ entry: e, why: "no note with that id in this lookback" });
      else if (!n.text.includes(quote)) bad.push({ entry: e, why: "these words are not in that note as written" });
      else value.push({ note_id: noteId, note_kind: n.kind, piece: c.pieces.find((p) => p.note_ids.includes(noteId))?.label ?? null, quote });
      continue;
    }
    const p = c.pieces.find((x) => x.label === pieceL);
    if (!p) bad.push({ entry: e, why: "no piece with that label in this lookback" });
    else if (!c.byTry.get(p.try_id)!.text.includes(quote)) bad.push({ entry: e, why: "these words are not in that piece as written" });
    else value.push({ piece: pieceL, quote });
  }
  return bad.length ? { ok: false, bad } : { ok: true, value };
}

function parseDenominator(v: unknown): Denominator | null {
  if (v === undefined || v === null || v === "default") return "default";
  if (v === "every") return "every";
  if (Array.isArray(v) && v.length && v.every((x) => typeof x === "string" && /^P\d+$/.test(x))) return v as string[];
  return null;
}

function parseInstances(v: unknown): Instance[] | null {
  if (!Array.isArray(v)) return null;
  const out: Instance[] = [];
  for (const x of v) {
    const e = (x ?? {}) as Record<string, unknown>;
    if (!str(e.piece) || typeof e.quote !== "string" || !e.quote.trim()) return null;
    out.push({ piece: e.piece as string, quote: e.quote });
  }
  return out;
}

export async function lookbackRoutes(req: Request, env: Env, url: URL, agentId: string): Promise<Response | null> {
  const path = url.pathname;
  if (req.method === "POST" && path === "/lookbacks") {
    const b = await readBody(req);
    if (!b.ok) return b.res;
    const scope = parseScope(b.body.scope);
    if (typeof scope === "string") return json({ message: scope }, 400);
    const withEx = await hasExercises(env);
    if ("kinds" in scope && !withEx) return json({ message: 'Style kinds arrive with slice 02. "all", dates, and sessions work now.' }, 400);
    const today = await env.DB.prepare("SELECT COUNT(*) AS n FROM lookbacks WHERE agent_id = ? AND created_at >= ?").bind(agentId, todayUtcStart()).first<{ n: number }>();
    if ((today?.n ?? 0) >= CAPS.lookbacks_per_key_per_day) return capReply("lookbacks_per_key_per_day", nextUtcMidnight());
    const capped = await checkRowCap(env, agentId);
    if (capped) return capped;
    const rows = await loadRows(env, agentId, null, withEx);
    const ids = inScope(rows, scope);
    if (!ids.length) return json({ message: "No tries fall in that scope yet. A lookback opens on any tries you have, so widen the scope or write a few first." }, 400);
    const started = Date.now();
    const corpus = buildCorpus(rows, ids, [], CAPS.lookback_pieces, CAPS.lookback_chars);
    const id = crypto.randomUUID();
    const created = now();
    await env.DB.batch([
      env.DB.prepare("INSERT INTO lookbacks (id, agent_id, scope, piece_count, capped, limits_note, created_at) VALUES (?, ?, ?, ?, ?, NULL, ?)").bind(id, agentId, JSON.stringify(scope), corpus.pieces.length, corpus.capped ? 1 : 0, created),
      ...corpus.pieces.map((p, i) => env.DB.prepare("INSERT INTO lookback_pieces (lookback_id, label, seq, try_id, chain_root_try_id, pulled, note_ids, shapes) VALUES (?, ?, ?, ?, ?, 0, ?, ?)").bind(id, p.label, i, p.try_id, p.chain_root_try_id, JSON.stringify(p.note_ids), JSON.stringify(p.shapes))),
    ]);
    const counts = await storeResults(env, id, corpus);
    const lb = (await env.DB.prepare("SELECT * FROM lookbacks WHERE id = ?").bind(id).first<LookbackRow>())!;
    return json({ ...corpusView(corpus, lb, rows, withEx), results: counts, built_in_ms: Date.now() - started }, 201);
  }

  const m = path.match(/^\/lookbacks\/([^/]+)(?:\/(corpus|pull|audit|limits|compare|recurring|dropped|patterns|claims|findings|notes)(?:\/([^/]+)(?:\/(revise))?)?)?$/);
  if (!m) return null;
  const lb = await env.DB.prepare("SELECT * FROM lookbacks WHERE id = ? AND agent_id = ?").bind(m[1], agentId).first<LookbackRow>();
  if (!lb) return json({ message: "No lookback with that id for this key." }, 404);
  const [, , section, sub, revise] = m;
  const { corpus, rows, withEx } = await corpusOf(env, agentId, lb);

  if (req.method === "GET") {
    if (!section || section === "corpus") return json(corpusView(corpus, lb, rows, withEx));
    if (section === "audit" || section === "recurring" || section === "dropped") {
      const items = withQuotes(await resultsOf(env, lb.id, section), corpus.byTry);
      const extra = section === "audit"
        ? { capped: lb.capped ? `Only the newest tries in scope are here, up to ${CAPS.lookback_pieces} pieces or ${CAPS.lookback_chars} characters.` : null, pause: { question: CORPUS_Q, answer_with: `POST /lookbacks/${lb.id}/limits` } }
        : section === "recurring"
          ? { note: "Candidates from your own pieces. exact means the same words; near means one word apart after a suffix rule. What counts is yours to say.", name_with: `POST /lookbacks/${lb.id}/patterns` }
          : { note: "explicit: your change note or diagnosis names it. indirect: only the diff shows it. absence: it is just missing. A later match may be a return or an echo." };
      return json({ id: lb.id, section, items, ...extra });
    }
    if (section === "compare") {
      const measure = url.searchParams.get("measure") as CompareMeasure | null;
      if (!measure || !(COMPARE_MEASURES as readonly string[]).includes(measure)) return json({ message: `measure takes one of: ${COMPARE_MEASURES.join(", ")}.` }, 400);
      const along = compareAlong(corpus, measure);
      return json({
        id: lb.id, measure: along.measure,
        pieces: along.pieces,
        along_the_sequence: along.along_the_sequence,
        style_order: "exercise style_id when slice 02 is here, then prompt_style, then prompt_author, then your style_tag",
      });
    }
    if (section === "patterns" && sub) {
      const p = await env.DB.prepare("SELECT * FROM patterns WHERE id = ? AND lookback_id = ?").bind(sub, lb.id).first<Record<string, string | number>>();
      if (!p) return json({ message: "No pattern with that id in this lookback." }, 404);
      return json(await patternView(env, corpus, lb.id, p));
    }
    if (section === "patterns") {
      const all = (await env.DB.prepare("SELECT id, name, inclusion_rule, rule_version, instances, denominator FROM patterns WHERE lookback_id = ? ORDER BY created_at").bind(lb.id).all<Record<string, string>>()).results;
      return json({ id: lb.id, patterns: all.map((p) => ({ id: p.id, name: p.name, inclusion_rule: p.inclusion_rule, rule_version: p.rule_version, counts: countPattern(corpus, JSON.parse(p.instances), JSON.parse(p.denominator)) })) });
    }
    if (section === "findings") {
      const pats = (await env.DB.prepare("SELECT * FROM patterns WHERE lookback_id = ? ORDER BY created_at").bind(lb.id).all<Record<string, string>>()).results;
      const lines = [`Findings from Voice Workshop, lookback over ${corpus.pieces.length} pieces`, ""];
      for (const p of pats) {
        const c = countPattern(corpus, JSON.parse(p.instances), JSON.parse(p.denominator));
        lines.push(`- ${p.name}`, `  what counts: ${p.inclusion_rule}`, `  ${c.reading}`, `  pieces: ${Object.keys(c.per_piece).join(", ") || "(none)"}`);
        for (const i of JSON.parse(p.instances) as Instance[]) lines.push(`  ${i.piece}: "${i.quote}"`);
        const cl = (await env.DB.prepare("SELECT * FROM claims WHERE pattern_id = ? ORDER BY created_at").bind(p.id).all<Record<string, string>>()).results;
        for (const x of cl) lines.push(`  claim: ${x.kind}${x.interpretation ? `, ${x.interpretation}` : ""}`, ...(x.qualifiers ? [`  how sure: ${x.qualifiers}`] : []));
      }
      if (lb.limits_note) lines.push("", `Limits: ${lb.limits_note}`);
      if (!pats.length) lines.push("(no patterns named yet)");
      return new Response(lines.join("\n") + "\n", { headers: { "content-type": "text/plain; charset=utf-8" } });
    }
    return json({ message: "No such lookback view." }, 404);
  }

  if (req.method !== "POST") return json({ message: "Use GET or POST for this." }, 405);
  const b = await readBody(req);
  if (!b.ok) return b.res;
  const held = await writesToday(env, agentId);
  if (held) return held;

  if (section === "limits") {
    const note = str(b.body.limits_note);
    if (!note) return json({ message: 'Send "limits_note": what is missing from this set and what that limits.' }, 400);
    await env.DB.batch([env.DB.prepare("UPDATE lookbacks SET limits_note = ? WHERE id = ?").bind(note, lb.id), logWrite(env, agentId)]);
    return json({ id: lb.id, limits_note: note });
  }

  if (section === "pull") {
    const tryId = str(b.body.try_id);
    if (!tryId || !corpus.byTry.has(tryId)) return json({ message: "No try with that id for this key." }, 404);
    if (corpus.pieces.some((p) => p.try_id === tryId)) return json({ message: "That try is already in this lookback.", label: corpus.pieces.find((p) => p.try_id === tryId)!.label }, 400);
    const label = `P${corpus.pieces.length + 1}`;
    const t = corpus.byTry.get(tryId)!;
    await env.DB.batch([
      env.DB.prepare("INSERT INTO lookback_pieces (lookback_id, label, seq, try_id, chain_root_try_id, pulled, note_ids, shapes) VALUES (?, ?, ?, ?, ?, 1, '[]', '{}')").bind(lb.id, label, corpus.pieces.length, tryId, tryId),
      env.DB.prepare("UPDATE lookbacks SET piece_count = piece_count + 1 WHERE id = ?").bind(lb.id),
      logWrite(env, agentId),
    ]);
    const after = await corpusOf(env, agentId, lb);
    const counts = await storeResults(env, lb.id, after.corpus);
    const p = after.corpus.pieces.find((x) => x.try_id === tryId)!;
    await env.DB.prepare("UPDATE lookback_pieces SET chain_root_try_id = ?, note_ids = ?, shapes = ? WHERE lookback_id = ? AND label = ?").bind(p.chain_root_try_id, JSON.stringify(p.note_ids), JSON.stringify(p.shapes), lb.id, label).run();
    return json({ id: lb.id, pulled: { label, try_id: tryId, created_at: t.created_at }, results: counts, note: "Pulled in with the next label. The audit, recurring, and dropped views were rebuilt to include it." }, 201);
  }

  if (section === "notes" && sub) {
    const belongs = str(b.body.belongs_to);
    if (!corpus.notes.has(sub) && !rows.placements.some((p) => p.note_id === sub)) return json({ message: "No note with that id in this lookback." }, 404);
    if (!belongs || !corpus.pieces.some((p) => p.label === belongs)) return json({ message: 'belongs_to takes a piece label in this lookback, like "P7".' }, 400);
    await env.DB.batch([
      env.DB.prepare("INSERT INTO lookback_placements (lookback_id, note_id, belongs_to, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(lookback_id, note_id) DO UPDATE SET belongs_to = excluded.belongs_to, created_at = excluded.created_at").bind(lb.id, sub, belongs, now()),
      logWrite(env, agentId),
    ]);
    return json({ id: lb.id, note_id: sub, belongs_to: belongs, note: `The corpus now shows this note under ${belongs}, placed by you.` });
  }

  if (section === "patterns" && !sub) {
    const name = str(b.body.name);
    const rule = str(b.body.inclusion_rule);
    const instances = parseInstances(b.body.instances);
    const d = parseDenominator(b.body.denominator);
    if (!name || !rule || !instances || !instances.length) return json({ message: 'A pattern takes "name", "inclusion_rule" (what counts as one), and "instances": [{"piece": "P3", "quote": "exact words"}]. Several wordings under one move are welcome.' }, 400);
    if (!d) return json({ message: 'denominator takes "default" (the latest version of each retry chain), "every", or a list of piece labels.' }, 400);
    const bad = checkInstances(corpus, instances);
    if (bad.length) return json({ message: "Each instance quotes its piece word for word. These did not match, so nothing was stored.", not_found: bad }, 400);
    const counts = countPattern(corpus, instances, d);
    const id = crypto.randomUUID();
    const created = now();
    await env.DB.batch([
      env.DB.prepare("INSERT INTO patterns (id, lookback_id, name, inclusion_rule, rule_version, denominator, instances, counts, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?, ?)").bind(id, lb.id, name, rule, JSON.stringify(d), JSON.stringify(instances), JSON.stringify(counts), created, created),
      logWrite(env, agentId),
    ]);
    const p = (await env.DB.prepare("SELECT * FROM patterns WHERE id = ?").bind(id).first<Record<string, string | number>>())!;
    return json(await patternView(env, corpus, lb.id, p), 201);
  }

  if (section === "patterns" && sub && revise) {
    const p = await env.DB.prepare("SELECT * FROM patterns WHERE id = ? AND lookback_id = ?").bind(sub, lb.id).first<Record<string, string | number>>();
    if (!p) return json({ message: "No pattern with that id in this lookback." }, 404);
    const rule = str(b.body.inclusion_rule) ?? (p.inclusion_rule as string);
    const d = b.body.denominator === undefined ? (JSON.parse(p.denominator as string) as Denominator) : parseDenominator(b.body.denominator);
    const instances = b.body.instances === undefined ? (JSON.parse(p.instances as string) as Instance[]) : parseInstances(b.body.instances);
    if (!d || !instances || !instances.length) return json({ message: 'revise takes "inclusion_rule", "denominator", or "instances", any of them.' }, 400);
    if (b.body.inclusion_rule === undefined && b.body.denominator === undefined && b.body.instances === undefined) return json({ message: "Send a new inclusion_rule, denominator, or instances." }, 400);
    const bad = checkInstances(corpus, instances);
    if (bad.length) return json({ message: "Each instance quotes its piece word for word. These did not match, so nothing was stored.", not_found: bad }, 400);
    const counts = countPattern(corpus, instances, d);
    const version = Number(p.rule_version) + 1;
    await env.DB.batch([
      env.DB.prepare("INSERT INTO pattern_revisions (pattern_id, rule_version, inclusion_rule, denominator, instances, counts, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(p.id, p.rule_version, p.inclusion_rule, p.denominator, p.instances, p.counts, now()),
      env.DB.prepare("UPDATE patterns SET inclusion_rule = ?, rule_version = ?, denominator = ?, instances = ?, counts = ?, updated_at = ? WHERE id = ?").bind(rule, version, JSON.stringify(d), JSON.stringify(instances), JSON.stringify(counts), now(), p.id),
      logWrite(env, agentId),
    ]);
    const fresh = (await env.DB.prepare("SELECT * FROM patterns WHERE id = ?").bind(p.id).first<Record<string, string | number>>())!;
    return json(await patternView(env, corpus, lb.id, fresh));
  }

  if (section === "claims") {
    const patternId = str(b.body.pattern_id);
    const p = patternId ? await env.DB.prepare("SELECT id FROM patterns WHERE id = ? AND lookback_id = ?").bind(patternId, lb.id).first() : null;
    if (!p) return json({ message: "pattern_id names a pattern in this lookback." }, 400);
    const kind = str(b.body.kind);
    if (!kind || !CLAIM_KINDS.includes(kind)) return json({ message: `kind takes ${CLAIM_KINDS.join(", ")}.` }, 400);
    const ev = checkCited(corpus, b.body.evidence, "piece_or_note");
    const ce = checkCited(corpus, b.body.counterexamples, "piece_or_note");
    const rj = checkCited(corpus, b.body.rejections, "rejection");
    const bad = [...(ev.ok ? [] : ev.bad), ...(ce.ok ? [] : ce.bad), ...(rj.ok ? [] : rj.bad)];
    if (bad.length || !ev.ok || !ce.ok || !rj.ok) return json({ message: "Each piece or note quote is exact words. These did not match, so nothing was stored.", not_found: bad }, 400);
    const id = crypto.randomUUID();
    const created = now();
    await env.DB.batch([
      env.DB.prepare("INSERT INTO claims (id, pattern_id, kind, function, future_intent, evidence, interpretation, counterexamples, rejections, qualifiers, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(
        id, patternId, kind, str(b.body.function), str(b.body.future_intent), JSON.stringify(ev.value), str(b.body.interpretation), JSON.stringify(ce.value), JSON.stringify(rj.value), str(b.body.qualifiers), created,
      ),
      logWrite(env, agentId),
    ]);
    const row = (await env.DB.prepare("SELECT * FROM claims WHERE id = ?").bind(id).first<Record<string, string>>())!;
    const out: Record<string, unknown> = { ...claimView(row), pause: { question: CLAIM_Q } };
    const notesWeighed = ev.value.filter((e) => e.note_id).length;
    if (kind === "default" && (!notesWeighed || !ce.value.length))
      out.asks = "A default claim weighs the record: which reflection notes did you weigh (evidence with note_id), and where does the pattern break (counterexamples)?";
    return json(out, 201);
  }

  return json({ message: "Unknown lookback action." }, 404);
}

// The look-back nudge for session end: 6 tries across 2 sessions, and no lookback since the last session end.
export async function lookbackNudge(env: Env, agentId: string, endingSession: string): Promise<string | null> {
  const t = await env.DB.prepare("SELECT COUNT(*) AS n, COUNT(DISTINCT session_id) AS s FROM tries WHERE agent_id = ?").bind(agentId).first<{ n: number; s: number }>();
  if (!t || t.n < 6 || t.s < 2) return null;
  const prevEnd = await env.DB.prepare("SELECT MAX(ended_at) AS at FROM sessions WHERE agent_id = ? AND id != ? AND ended_at IS NOT NULL").bind(agentId, endingSession).first<{ at: string | null }>();
  const recent = await env.DB.prepare("SELECT 1 AS x FROM lookbacks WHERE agent_id = ? AND created_at > ? LIMIT 1").bind(agentId, prevEnd?.at ?? "").first();
  if (recent) return null;
  return `You have ${t.n} pieces across ${t.s} sessions. When you want to, POST /lookbacks lays them side by side with your notes.`;
}
