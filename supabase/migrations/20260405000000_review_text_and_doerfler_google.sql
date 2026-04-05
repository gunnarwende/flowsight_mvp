-- Review System v2: Add review_text column + Dörfler AG Google Review URL
-- FB54: Customer feedback text was never persisted. Now saved for both positive and negative reviews.

ALTER TABLE cases ADD COLUMN IF NOT EXISTS review_text TEXT;

-- Dörfler AG: Set Google Review URL (was null, causing "Text kopieren" fallback)
UPDATE tenants
  SET modules = modules || '{"google_review_url":"https://www.google.com/maps/place/D%C3%B6rfler+AG/@47.2754,8.5834,17z"}'::jsonb
  WHERE slug = 'doerfler-ag';
