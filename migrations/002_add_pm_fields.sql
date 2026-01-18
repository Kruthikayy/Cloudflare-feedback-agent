-- Add new PM-focused columns to feedback table
ALTER TABLE feedback ADD COLUMN priority TEXT;
ALTER TABLE feedback ADD COLUMN category TEXT;
ALTER TABLE feedback ADD COLUMN impact TEXT;

-- Reset analysis so new fields get populated
UPDATE feedback SET sentiment = NULL, priority = NULL, category = NULL, impact = NULL, themes = NULL, analyzed_at = NULL;