-- ============================================================================
-- Case ID Prefix per Tenant
-- 2026-03-13 | Phase 0.3 — Gold Contact Renovation
-- ============================================================================
--
-- Adds case_id_prefix to tenants so each tenant gets branded case IDs.
-- Default "FS" maintains backward compatibility.
-- Identity Contract: Case-IDs use tenant prefix, not "FS".
-- ============================================================================

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS case_id_prefix text NOT NULL DEFAULT 'FS';
COMMENT ON COLUMN tenants.case_id_prefix IS 'Prefix for case display IDs, e.g. "WB" → WB-0001. Default FS for legacy.';

-- Set known tenants
UPDATE tenants SET case_id_prefix = 'DA' WHERE slug = 'doerfler-ag';
UPDATE tenants SET case_id_prefix = 'WB' WHERE slug = 'weinberger-ag';
UPDATE tenants SET case_id_prefix = 'BH' WHERE slug = 'brunner-ht';
UPDATE tenants SET case_id_prefix = 'WL' WHERE slug = 'walter-leuthold';
