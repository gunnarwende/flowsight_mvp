-- Set brand colors for existing tenants
-- Dörfler AG: blue (from their corporate identity)
UPDATE tenants SET modules = jsonb_set(
  COALESCE(modules, '{}'::jsonb),
  '{primary_color}',
  '"#004994"'
) WHERE slug = 'doerfler-ag';

-- Weinberger AG: gold (existing default, now explicit)
UPDATE tenants SET modules = jsonb_set(
  COALESCE(modules, '{}'::jsonb),
  '{primary_color}',
  '"#d4a853"'
) WHERE slug = 'weinberger-ag';

-- Brunner Haustechnik: green (demo tenant)
UPDATE tenants SET modules = jsonb_set(
  COALESCE(modules, '{}'::jsonb),
  '{primary_color}',
  '"#2d6a4f"'
) WHERE slug = 'brunner-haustechnik';
