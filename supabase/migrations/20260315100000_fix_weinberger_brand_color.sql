-- Fix Weinberger brand color: must match Modul-2 reference (julweinberger.ch)
-- Primary brand color from their website: dark navy blue #004994
-- Previous migration incorrectly set gold #d4a853 (FlowSight default, not Weinberger)
UPDATE tenants SET modules = jsonb_set(
  COALESCE(modules, '{}'::jsonb),
  '{primary_color}',
  '"#004994"'
) WHERE slug = 'weinberger-ag';
