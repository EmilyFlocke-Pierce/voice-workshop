-- Slice 04: looking back for patterns. A lookback stores ids, never text: the words are read from tries when a view answers.
CREATE TABLE lookbacks (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  scope TEXT NOT NULL,
  piece_count INTEGER NOT NULL,
  capped INTEGER NOT NULL DEFAULT 0,
  limits_note TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX lookbacks_agent ON lookbacks(agent_id, created_at);
CREATE TABLE lookback_pieces (
  lookback_id TEXT NOT NULL REFERENCES lookbacks(id),
  label TEXT NOT NULL,
  seq INTEGER NOT NULL,
  try_id TEXT NOT NULL,
  chain_root_try_id TEXT NOT NULL,
  pulled INTEGER NOT NULL DEFAULT 0,
  note_ids TEXT NOT NULL,
  shapes TEXT NOT NULL,
  PRIMARY KEY (lookback_id, label)
);
CREATE TABLE lookback_placements (
  lookback_id TEXT NOT NULL REFERENCES lookbacks(id),
  note_id TEXT NOT NULL,
  belongs_to TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (lookback_id, note_id)
);
-- audit, recurring, and dropped, split into rows of at most 100 items and 256 KB.
CREATE TABLE lookback_results (
  lookback_id TEXT NOT NULL REFERENCES lookbacks(id),
  section TEXT NOT NULL,
  seq INTEGER NOT NULL,
  items TEXT NOT NULL,
  PRIMARY KEY (lookback_id, section, seq)
);
CREATE TABLE patterns (
  id TEXT PRIMARY KEY,
  lookback_id TEXT NOT NULL REFERENCES lookbacks(id),
  name TEXT NOT NULL,
  inclusion_rule TEXT NOT NULL,
  rule_version INTEGER NOT NULL,
  denominator TEXT NOT NULL,
  instances TEXT NOT NULL,
  counts TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE pattern_revisions (
  pattern_id TEXT NOT NULL REFERENCES patterns(id),
  rule_version INTEGER NOT NULL,
  inclusion_rule TEXT NOT NULL,
  denominator TEXT NOT NULL,
  instances TEXT NOT NULL,
  counts TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE claims (
  id TEXT PRIMARY KEY,
  pattern_id TEXT NOT NULL REFERENCES patterns(id),
  kind TEXT NOT NULL,
  function TEXT,
  future_intent TEXT,
  evidence TEXT NOT NULL,
  interpretation TEXT,
  counterexamples TEXT NOT NULL,
  rejections TEXT NOT NULL,
  qualifiers TEXT,
  created_at TEXT NOT NULL
);
-- One row per lookback write today, for lookback_writes_per_key_per_day. Older rows are cleared on each write.
CREATE TABLE lookback_writes (
  agent_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX lookback_writes_agent ON lookback_writes(agent_id, created_at);
