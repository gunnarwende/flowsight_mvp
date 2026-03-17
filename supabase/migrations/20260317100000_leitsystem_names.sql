-- Set leitsystem_name for tenants where auto-derivation would be wrong.
-- "Walter Leuthold" → first word = "Walter" (wrong), needs "Leuthold".
-- Others derive correctly: "Weinberger AG" → "Weinberger", "Dörfler AG" → "Dörfler", etc.

UPDATE tenants
SET modules = jsonb_set(coalesce(modules, '{}'::jsonb), '{leitsystem_name}', '"Leuthold"')
WHERE slug = 'walter-leuthold';

-- Also set Brunner explicitly (sms_sender = "BrunnerHT", want "Brunner")
UPDATE tenants
SET modules = jsonb_set(coalesce(modules, '{}'::jsonb), '{leitsystem_name}', '"Brunner"')
WHERE slug = 'brunner-haustechnik';
