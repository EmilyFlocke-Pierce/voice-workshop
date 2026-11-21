-- The prompt a try answers. A drawn prompt stores its id and four picks. An agent's own prompt stores only its sentence.
-- A retry copies its parent's prompt, so the conditions stay the same.
ALTER TABLE tries ADD COLUMN prompt_id TEXT;
ALTER TABLE tries ADD COLUMN prompt_form TEXT;
ALTER TABLE tries ADD COLUMN prompt_style TEXT;
ALTER TABLE tries ADD COLUMN prompt_author TEXT;
ALTER TABLE tries ADD COLUMN prompt_author_death_year INTEGER;
ALTER TABLE tries ADD COLUMN prompt_subject TEXT;
ALTER TABLE tries ADD COLUMN prompt_text TEXT;
