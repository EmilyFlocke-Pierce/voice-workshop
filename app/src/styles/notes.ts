// Exercise note kinds, coded from the plan's table. Every note is optional. Quotes are exact spans of the try they name.
export const STUCK_MOVES = ["plain_then_restyle", "skip_ahead", "shorten", "new_shape"] as const;
export const EFFECT_FEATURES = ["tone", "syntax", "pacing", "diction"] as const;

export interface KindRule {
  try: "required" | "none";
  quotes: "optional" | "required" | "none";
  extra?: "move" | "feature" | "readers" | "effects";
  serves: string;
}

export const NOTE_KINDS: Record<string, KindRule> = {
  calibration: { try: "required", quotes: "optional", serves: "I.B.1" },
  drift: { try: "required", quotes: "optional", serves: "I.B.2, II.C.2" },
  stuck_move: { try: "required", quotes: "none", extra: "move", serves: "I.B.3" },
  unusual: { try: "required", quotes: "optional", serves: "I.C.2" },
  hard_passage: { try: "required", quotes: "required", serves: "I.C.3" },
  effects: { try: "required", quotes: "optional", extra: "feature", serves: "II.A.1 to II.A.4" },
  reader_impressions: { try: "required", quotes: "none", extra: "readers", serves: "II.B.1" },
  style_vs_speaker: { try: "required", quotes: "optional", serves: "II.B.2" },
  slowdowns: { try: "required", quotes: "required", serves: "II.C.1" },
  slips_back: { try: "required", quotes: "required", serves: "II.C.2" },
  what_it_was_like: { try: "required", quotes: "required", serves: "II.C.3" },
  // Sent at finish, about the whole exercise.
  ease: { try: "none", quotes: "optional", serves: "III.A.2" },
  pull: { try: "none", quotes: "optional", extra: "effects", serves: "III.C.2" },
};

export const FINISH_KINDS = new Set(["ease", "pull"]);

export interface Quote {
  try_id: string;
  line: string;
}

export interface CheckedNote {
  kind: string;
  try_id: string | null;
  text: string;
  quotes: Quote[];
  extra: Record<string, unknown> | null;
}

const s = (v: unknown) => (typeof v === "string" && v.trim() ? v : null);

// Shape check only. Quote text is checked against the tries by the route, word for word.
export function checkNote(kind: string, body: Record<string, unknown>): { ok: true; note: CheckedNote } | { ok: false; message: string } {
  const rule = NOTE_KINDS[kind];
  if (!rule) return { ok: false, message: `kind takes one of: ${Object.keys(NOTE_KINDS).filter((k) => !FINISH_KINDS.has(k)).join(", ")}. ease and pull go in at finish.` };
  const tryId = s(body.try_id);
  if (rule.try === "required" && !tryId) return { ok: false, message: `A ${kind} note names the try it is about in "try_id".` };
  const text = s(body.text);
  let extra: Record<string, unknown> | null = null;
  if (rule.extra === "readers") {
    const readers = Array.isArray(body.readers) ? body.readers : [];
    const ok = readers.filter((r) => s((r as Record<string, unknown>)?.reader) && s((r as Record<string, unknown>)?.impression));
    if (ok.length < 2 || ok.length !== readers.length) return { ok: false, message: 'reader_impressions takes "readers": a list of 2 or more {"reader": "who", "impression": "what they might hear"}.' };
    extra = { readers: ok.map((r) => ({ reader: (r as Record<string, string>).reader, impression: (r as Record<string, string>).impression })) };
  } else if (!text) return { ok: false, message: `A ${kind} note carries "text" in your words.` };
  if (rule.extra === "move") {
    const move = s(body.move);
    if (!move || !(STUCK_MOVES as readonly string[]).includes(move)) return { ok: false, message: `stuck_move takes "move": one of ${STUCK_MOVES.join(", ")}.` };
    extra = { move };
  }
  if (rule.extra === "feature") {
    const feature = s(body.feature);
    if (!feature || !(EFFECT_FEATURES as readonly string[]).includes(feature)) return { ok: false, message: `effects takes "feature": one of ${EFFECT_FEATURES.join(", ")}.` };
    extra = { feature };
  }
  if (rule.extra === "effects") {
    const effects = body.effects === undefined ? [] : body.effects;
    if (!Array.isArray(effects) || effects.some((e) => !s(e))) return { ok: false, message: 'pull takes "effects": a list of the effects that draw you, each in a few words.' };
    extra = { effects };
  }
  const given = body.quotes === undefined ? [] : body.quotes;
  if (!Array.isArray(given)) return { ok: false, message: 'quotes is a list like [{"try_id": "...", "line": "exact words from that try"}].' };
  if (rule.quotes === "none" && given.length) return { ok: false, message: `A ${kind} note takes no quotes.` };
  const quotes: Quote[] = [];
  for (const q of given) {
    const qt = (q ?? {}) as Record<string, unknown>;
    const line = typeof qt.line === "string" && qt.line.trim() ? qt.line : null;
    const qTry = s(qt.try_id) ?? tryId;
    if (!line || !qTry) return { ok: false, message: 'Each quote takes "line" (exact words) and "try_id" (the try it comes from; the note\'s try when left out).' };
    quotes.push({ try_id: qTry, line });
  }
  if (rule.quotes === "required" && !quotes.length) return { ok: false, message: `A ${kind} note quotes the span it is about: "quotes": [{"line": "exact words"}].` };
  return { ok: true, note: { kind, try_id: rule.try === "none" ? null : tryId, text: text ?? "", quotes, extra } };
}
