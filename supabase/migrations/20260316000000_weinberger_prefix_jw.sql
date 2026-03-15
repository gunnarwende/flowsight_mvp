-- Change Weinberger AG case_id_prefix from WB to JW
-- Aligns with sidebar initials (Jul. Weinberger → JW) for visual consistency
UPDATE tenants SET case_id_prefix = 'JW' WHERE slug = 'weinberger-ag';
