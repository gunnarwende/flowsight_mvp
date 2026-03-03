# Brunner Haustechnik AG — Status

**Slug:** `brunner-haustechnik`
**Typ:** Demo-Tenant (Showroom für Kundenakquise)
**Tenant UUID:** `d0000000-0000-0000-0000-000000000001`

## Module

| Modul | Status |
|-------|--------|
| Voice (Intake + Info) | LIVE — +41 44 505 48 18, Dual-Mode DE/INTL |
| Wizard | LIVE — `/brunner-haustechnik/meldung` |
| Ops Dashboard | LIVE — `/ops/cases?tenant=brunner-haustechnik` |
| SMS Channel | LIVE — Alphanumeric Sender "BrunnerHT" |
| Reviews | LIVE |
| Customer Website | LIVE — `/brunner-haustechnik` (High-End Demo) |

## Key URLs

- **Demo-Seite:** `/brunner-haustechnik` (custom, 10 Sections, Unsplash + KI-Bilder)
- **Template-Seite:** `/kunden/brunner-haustechnik` (contrast-fixed template)
- **Wizard:** `/brunner-haustechnik/meldung`
- **Dashboard:** `/ops/cases?tenant=brunner-haustechnik`

## Voice Agent

- **Typ:** Dual-Mode (Intake + Info), volles Firmen-Wissen im global_prompt
- **Configs:** `retell/exports/brunner_agent.json` (DE) + `brunner_agent_intl.json` (INTL)
- **Twilio-Nr:** +41 44 505 48 18 (gekauft 01.03.2026)
- **Setup Runbook:** `docs/runbooks/brunner_voice_setup.md`
- **Info-Modus:** Öffnungszeiten, Einzugsgebiet, Preisrichtwerte, Chef, Termin, Bewerbungen, Adresse

## Seed Data

- 10 Cases (FS-0001–FS-0010), ~50 case_events, 14-Tage-Spread
- Migration: `supabase/migrations/20260228300000_demo_tenant_brunner.sql`
- Reset-SQL: siehe `docs/runbooks/demo_script.md`

## Theme

- Primary: #0f4c54, Accent: #0d7377
- Config: `src/web/src/lib/demo_theme/brunner_haustechnik.ts`

---

*Letztes Update: 2026-03-03 | Repo-Cleanup*
