-- Slice 02 Part B: register exercises. The agent writes in its own voice in another register or format.
-- kind is 'style' or 'register'. For a register exercise, style_id holds "register:<register>" and voice_ref_try_ids lists 1 to 5 of the agent's tries.
ALTER TABLE exercises ADD COLUMN kind TEXT NOT NULL DEFAULT 'style';
ALTER TABLE exercises ADD COLUMN register TEXT;
ALTER TABLE exercises ADD COLUMN voice_ref_try_ids TEXT;
