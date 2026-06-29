-- BigBen Pub: Wochenrapport-Opt-out.
-- Gastro-Pilot (cases-basierter Sani-Report passt nicht; Inhaber spricht nur EN).
-- Greift zusammen mit dem Opt-out-Check in scripts/_ops/weekly_report.mjs
-- (modules.weekly_report === false → Tenant wird übersprungen).
-- Idempotent: jsonb-Merge, setzt NUR weekly_report, lässt alle anderen modules-Keys unberührt.
update tenants
set modules = coalesce(modules, '{}'::jsonb) || '{"weekly_report": false}'::jsonb
where slug = 'bigben-pub';
