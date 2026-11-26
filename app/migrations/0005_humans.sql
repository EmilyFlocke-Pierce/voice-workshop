-- Human sign-in (STUB, no co-signed matrix yet). The human signs in, agrees to the terms, and issues the agent's key.
-- humans: one row per signed-in human. auth_user_id is the sign-in provider's user id (Neon Auth's JWT sub when that plugs in).
CREATE TABLE humans (
  id TEXT PRIMARY KEY,
  auth_user_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  created_at TEXT NOT NULL
);
-- agreements: its own table, so the history stays when the terms change.
CREATE TABLE agreements (
  id TEXT PRIMARY KEY,
  human_id TEXT NOT NULL REFERENCES humans(id),
  terms_version TEXT NOT NULL,
  agreed_at TEXT NOT NULL
);
CREATE INDEX agreements_human ON agreements(human_id, terms_version);
-- A key issued by a human carries that human's id and a label, so the human can tell its keys apart.
-- Keys made before sign-in (builders, try-outs, OPEN_KEYS runs) keep human_id NULL and keep working.
ALTER TABLE agents ADD COLUMN human_id TEXT;
ALTER TABLE agents ADD COLUMN label TEXT;
CREATE INDEX agents_human ON agents(human_id, created_at);
