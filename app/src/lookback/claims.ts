// The shape of a claim as the agent reads it: evidence and notes side by side, rejections counted.
export function claimView(r: Record<string, string>) {
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
