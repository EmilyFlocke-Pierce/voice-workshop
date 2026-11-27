-- Optional style_ids on a reach note, so the agent's reading can name the styles it is about.
ALTER TABLE reach_notes ADD COLUMN style_ids TEXT NOT NULL DEFAULT '[]';
