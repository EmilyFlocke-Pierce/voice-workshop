// Claims: kinds, the shape the agent reads, cited evidence, the thin-claim pause, and findings text.
import { str } from "../http.ts";
import type { Corpus } from "./corpus.ts";
import type { Instance } from "./patterns.ts";

export const CLAIM_KINDS = ["taste", "default", "mixture", "unclear"] as const;
export type ClaimKind = (typeof CLAIM_KINDS)[number];

// Short definitions that separate mixture (the record points both ways) from unclear (the record is not enough to tell).
export const CLAIM_KIND_MEANS: Record<ClaimKind, string> = {
  taste: "a choice you mean to keep, supported by what you said and what the pieces show",
  default: "a habit that recurs without a deliberate choice, or against what you said you wanted",
  mixture: "the record shows both a deliberate preference and a habit, in different places or at once",
  unclear: "the record is not enough to tell taste from habit, so the judgment stays open",
};

export function isClaimKind(kind: string): kind is ClaimKind {
  return (CLAIM_KINDS as readonly string[]).includes(kind);
}

export function claimView(r: Record<string, string>) {
  const rejections = JSON.parse(r.rejections) as unknown[];
  const evidence = JSON.parse(r.evidence) as Record<string, unknown>[];
  const notes = evidence.filter((e) => e.note_id);
  return {
    id: r.id, pattern_id: r.pattern_id, kind: r.kind, function: r.function, future_intent: r.future_intent,
    kind_means: isClaimKind(r.kind) ? CLAIM_KIND_MEANS[r.kind] : null,
    evidence, interpretation: r.interpretation, counterexamples: JSON.parse(r.counterexamples), qualifiers: r.qualifiers,
    rejections: { recorded: rejections.length === 1 ? "1 recorded" : `${rejections.length} recorded`, entries: rejections, ...(rejections.length === 1 ? { scope: "one instance" } : {}) },
    notes_side_by_side: notes.length > 1 ? notes : null,
    created_at: r.created_at,
  };
}

export function thinClaimAsk(kind: string, evidence: Record<string, unknown>[], counterexamples: unknown[], rejections: unknown[]): string | null {
  const notesWeighed = evidence.filter((e) => e.note_id).length;
  if (kind === "default" && (!notesWeighed || !counterexamples.length))
    return "A default claim weighs the record: which reflection notes did you weigh (evidence with note_id), and where does the pattern break (counterexamples)?";
  if (!notesWeighed || (!counterexamples.length && !rejections.length))
    return `A ${kind} claim weighs the record: which reflection notes did you weigh (evidence with note_id), and where does the pattern break or get set aside (counterexamples or rejections)?`;
  return null;
}

// Checks a list of {piece, quote} or {note_id, quote} entries word for word. Rejections take the same shape.
export function checkCited(c: Corpus, list: unknown, needs: "piece" | "piece_or_note" | "rejection"): { ok: true; value: Record<string, unknown>[] } | { ok: false; bad: unknown[]; message?: string } {
  if (list === undefined || list === null) return { ok: true, value: [] };
  if (!Array.isArray(list)) return { ok: false, bad: [], message: "Send a list." };
  const value: Record<string, unknown>[] = [];
  const bad: unknown[] = [];
  const why = needs === "piece" ? 'each entry takes "piece" and an exact "quote"' : 'each entry takes "piece" (or "note_id") and an exact "quote"';
  for (const raw of list) {
    const e = (raw ?? {}) as Record<string, unknown>;
    const quote = typeof e.quote === "string" && e.quote.trim() ? e.quote : null;
    const pieceL = str(e.piece);
    const noteId = str(e.note_id);
    if (!quote || (needs === "piece" && !pieceL) || (needs !== "piece" && !pieceL && !noteId)) {
      bad.push({ entry: e, why });
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

export function claimFindingLines(x: { kind: string; function?: string | null; future_intent?: string | null; interpretation?: string | null; qualifiers?: string | null }): string[] {
  const lines = [`  claim: ${x.kind}${x.interpretation ? `, ${x.interpretation}` : ""}`];
  if (x.function) lines.push(`  function: ${x.function}`);
  if (x.future_intent) lines.push(`  future intent: ${x.future_intent}`);
  if (x.qualifiers) lines.push(`  how sure: ${x.qualifiers}`);
  return lines;
}

export function findingsText(pieceCount: number, patterns: { name: string; inclusion_rule: string; reading: string; piece_labels: string; instances: Instance[]; claims: { kind: string; function?: string | null; future_intent?: string | null; interpretation?: string | null; qualifiers?: string | null }[] }[], limitsNote: string | null): string {
  const lines = [`Findings from Voice Workshop, lookback over ${pieceCount} pieces`, ""];
  for (const p of patterns) {
    lines.push(`- ${p.name}`, `  what counts: ${p.inclusion_rule}`, `  ${p.reading}`, `  pieces: ${p.piece_labels || "(none)"}`);
    for (const i of p.instances) lines.push(`  ${i.piece}: "${i.quote}"`);
    for (const x of p.claims) lines.push(...claimFindingLines(x));
  }
  if (limitsNote) lines.push("", `Limits: ${limitsNote}`);
  if (!patterns.length) lines.push("(no patterns named yet)");
  return lines.join("\n") + "\n";
}
