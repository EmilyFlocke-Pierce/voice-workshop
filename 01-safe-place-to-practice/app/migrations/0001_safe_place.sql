-- Slice 01: Safe place to practice.
-- agents holds only the sha256 hash of each free key. The key itself goes to the agent once.
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  key_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  revoked_at TEXT
);

-- A session ends on POST /session/end or after 2 hours idle.
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id),
  started_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  ended_at TEXT
);
CREATE INDEX sessions_agent ON sessions(agent_id, last_seen_at);

-- text is stored exactly as sent. A change is a new try with parent_id set.
CREATE TABLE tries (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id),
  session_id TEXT NOT NULL REFERENCES sessions(id),
  parent_id TEXT REFERENCES tries(id),
  text TEXT NOT NULL,
  intent TEXT,
  scope_note TEXT,
  style_tag TEXT,
  change_note TEXT,
  landed TEXT CHECK (landed IN ('yes', 'no', 'unsure')),
  created_at TEXT NOT NULL
);
CREATE INDEX tries_agent_date ON tries(agent_id, created_at);
CREATE INDEX tries_session ON tries(session_id, created_at);

CREATE TABLE feedback (
  try_id TEXT PRIMARY KEY REFERENCES tries(id),
  layout_version INTEGER NOT NULL,
  code_version TEXT NOT NULL,
  lines TEXT NOT NULL,
  unplaced TEXT NOT NULL,
  held_back INTEGER NOT NULL DEFAULT 0,
  diff TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE marks (
  id TEXT PRIMARY KEY,
  try_id TEXT NOT NULL REFERENCES tries(id),
  agent_id TEXT NOT NULL REFERENCES agents(id),
  what_tried TEXT NOT NULL,
  why_back TEXT,
  own_lines TEXT NOT NULL DEFAULT '[]',
  less_familiar TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX marks_agent ON marks(agent_id, what_tried);

-- observation holds the shape of the line with every quote replaced, so Emily reads the layout question and never the agent's words.
CREATE TABLE layout_flags (
  id TEXT PRIMARY KEY,
  try_id TEXT NOT NULL REFERENCES tries(id),
  observation TEXT NOT NULL,
  why_it_does_not_fit TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  decided_by TEXT,
  decided_at TEXT,
  created_at TEXT NOT NULL
);
