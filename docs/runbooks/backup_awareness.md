# Supabase Backup Awareness — FlowSight MVP

**Owner:** Founder
**Last updated:** 2026-02-25
**Status:** Pro plan active — daily backups enabled (since ~March 2026)

## Current State

| Item | Value |
|------|-------|
| Plan | **Pro ($25/mo)** |
| Automatic backups | **Yes — daily backups** |
| Scheduled backups | Available (Pro feature) |
| PITR (Point-in-Time Recovery) | Not enabled (Pro add-on, $100/mo — not needed yet) |
| Restore path | Project → Database → Backups → Restore to new project |

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data loss (DB corruption/accidental delete) | HIGH — all cases, tenants, numbers lost | LOW (daily backups + Supabase infrastructure) | Daily backups cover most scenarios. Enable PITR if sub-day recovery needed. |
| No rollback for bad migration | MEDIUM — manual reverse migration required | MEDIUM (migrations are manual + reviewed) | Always write reverse migration SQL before applying |

## Next Upgrade Triggers

Enable PITR when ANY of these:
- Sub-day recovery precision needed (high write volume)
- Compliance requirement demands point-in-time restore
- ≥80% of any Pro plan quota (storage, API requests)

## Cross-References

- Incident triage: [90-incident-triage.md](90-incident-triage.md)
- Cost triggers: [cost_triggers.md](cost_triggers.md)
