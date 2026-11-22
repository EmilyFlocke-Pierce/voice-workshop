-- Stitches: the agent's own words on how a try connects to the tries before it in a session (III.A.1).
-- The first try in a session is the knot. Each later try stitches to the previous one, and from the third on it also ties back to the knot.
-- thread: what runs between this try and the last. deltas: what changed. quotes: JSON list of {try_id, line}, each line exact words from that try.
CREATE TABLE stitches (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  try_id TEXT NOT NULL UNIQUE,
  previous_try_id TEXT NOT NULL,
  knot_try_id TEXT,
  thread TEXT NOT NULL,
  deltas TEXT,
  quotes TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX stitches_session ON stitches(agent_id, session_id, created_at);
