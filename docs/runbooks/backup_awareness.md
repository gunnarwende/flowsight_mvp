# Supabase Backup Awareness — FlowSight MVP

**Owner:** Founder
**Last updated:** 2026-02-25
**Status:** Risk documented (Free plan = no backups)

## Current State

| Item | Value |
|------|-------|
| Plan | Free |
| Automatic backups | No (Free plan has no project backups) |
| Scheduled backups | Not available (Pro required) |
| PITR (Point-in-Time Recovery) | Not available (Pro add-on, starts $100/mo) |
| Restore path | Project → Database → Backups → "Restore to new project" (BETA) — requires Pro + physical backups enabled |

**Evidence:** Founder captured 4 screenshots (billing, scheduled backups, PITR restriction, restore restriction). Not in repo — project/org identifiers cropped.

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data loss (DB corruption/accidental delete) | HIGH — all cases, tenants, numbers lost | LOW (Supabase infrastructure is reliable) | Upgrade to Pro when revenue supports it |
| No rollback for bad migration | MEDIUM — manual reverse migration required | MEDIUM (migrations are manual + reviewed) | Always write reverse migration SQL before applying |

## Upgrade Triggers

Upgrade to Supabase Pro when ANY of these:
- ≥80% of any Free plan quota (storage, API requests, edge functions)
- Backups/PITR needed (customer #2 or compliance requirement)
- Revenue supports $25/mo base cost

## Interim Workaround (pre-Pro)

For critical tables (tenants, tenant_numbers), Founder can manually export via Supabase Dashboard → Table Editor → Export CSV. Not automated, not a backup strategy — just a safety net.

## Cross-References

- Incident triage: [90-incident-triage.md](90-incident-triage.md)
- Cost triggers: [cost_triggers.md](cost_triggers.md)
