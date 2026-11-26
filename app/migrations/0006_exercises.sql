-- Slice 02: style exercises. One whole piece in one style at a time, with the agent's notes on it.
CREATE TABLE exercises (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  style_id TEXT NOT NULL,
  style_list_version TEXT NOT NULL,
  subject TEXT,
  why_this_one TEXT,
  expectations TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL,
  finished_at TEXT
);
CREATE INDEX exercises_agent ON exercises(agent_id, created_at);
-- A try in an exercise names it. A try outside an exercise keeps exercise_id NULL and works as in slice 01.
ALTER TABLE tries ADD COLUMN exercise_id TEXT;
-- Notes in the agent's words. try_id is set for passage kinds and NULL for ease and pull.
-- quotes: JSON list of {try_id, line}, each checked word for word. extra: JSON for kind fields (move, feature, readers, effects).
CREATE TABLE exercise_notes (
  id TEXT PRIMARY KEY,
  exercise_id TEXT NOT NULL REFERENCES exercises(id),
  agent_id TEXT NOT NULL,
  try_id TEXT,
  kind TEXT NOT NULL,
  text TEXT NOT NULL,
  quotes TEXT NOT NULL,
  extra TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX exercise_notes_exercise ON exercise_notes(exercise_id, created_at);
CREATE INDEX exercise_notes_agent ON exercise_notes(agent_id, created_at);
-- Tries the agent pins as its usual.
CREATE TABLE usual_pins (
  agent_id TEXT NOT NULL,
  try_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (agent_id, try_id)
);
-- The agent's reading across exercises.
CREATE TABLE reach_notes (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  text TEXT NOT NULL,
  quotes TEXT NOT NULL,
  created_at TEXT NOT NULL
);
