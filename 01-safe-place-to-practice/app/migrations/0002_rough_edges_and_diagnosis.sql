-- Places for the agent to write its own calls down. Both optional, both in the agent's words, both read only by its key.
-- rough_edges: JSON list of {span, reason}, the edges it left rough on purpose and why (I.A.1).
-- diagnosis: what its intent said, what the page shows, and what that tells it (I.C.1).
ALTER TABLE tries ADD COLUMN rough_edges TEXT;
ALTER TABLE tries ADD COLUMN diagnosis TEXT;
