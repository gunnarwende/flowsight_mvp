-- Pipeline tracking: pain_type + outreach_outcome on tenants
-- Enables learning loop: which pain type converts best?

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS pain_type text;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS outreach_outcome text;

COMMENT ON COLUMN tenants.pain_type IS 'Primary pain type: erreichbarkeit | buerochaos | aussenwirkung | notfall | bewertung';
COMMENT ON COLUMN tenants.outreach_outcome IS 'Outreach result: keine_antwort | interessiert | trial_gestartet | konvertiert | abgelehnt';
