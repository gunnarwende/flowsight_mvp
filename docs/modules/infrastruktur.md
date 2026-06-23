# Modul: Infrastruktur (bauen & ausliefern)

> Teil der [FlowSight Bible](../flowsight_bible.md). Wie gebaut und ausgeliefert wird —
> **nicht** das Beobachten (das ist [Monitoring](monitoring.md)).

## Zweck
Die Maschine, die Code sicher in Produktion bringt: Deploy, CI, DB-Migrationen, Secrets, Backups, Workflows.

## Status heute (geerntet — was wir HABEN)
- **Deploy:** Vercel, Region `fra1`, Root `src/web`. **SSOT = Supabase** (Pro, **tägliche Backups** seit ~03/2026).
- **CI:** lint (`eslint --max-warnings 0`) + build; gated `production`-Environment (Founder-Gate). Branch-Schutz auf `main` (PR + Checks Pflicht).
- **Workflows:** `db-migrate.yml` (Schema via Management-API, gated), `retell-publish.yml`, `supabase-fix.yml`, Mobile-Ops-Katalog.
- **Secrets-SSOT:** Vercel-Env (runtime) + GitHub-Actions-Secrets (Workflows). Nie im Repo. Geräteverlust → [`98-device-loss`](../runbooks/98-device-loss.md).
- **CEO-App Admin** (Phase 5 live): Env-Status, Deploy-Info, Integration-Hub, Script-Runner.

## Kanonische Quelle (SSOT)
- [zielarchitektur](../architecture/zielarchitektur.md) (technische SSOT, Decision-Map) + [env_vars](../architecture/env_vars.md).
- `.github/workflows/`, `supabase/migrations/`, `scripts/_ops/`.
- Runbooks (geteilte Schicht): [`mobile_ops`](../runbooks/mobile_ops.md) · [`ops_setup`](../runbooks/ops_setup.md) · [`ops_doctor`](../runbooks/ops_doctor.md) · [`release_checklist`](../runbooks/release_checklist.md) · [`backup_awareness`](../runbooks/backup_awareness.md) · [`99-secrets-policy`](../runbooks/99-secrets-policy.md) · [`storage_setup`](../runbooks/storage_setup.md).

## Dateibereich (Parallel-Konflikt-Regel)
- **Besitzt:** `.github/workflows/`, `supabase/migrations/`, `scripts/_ops/`, `docs/architecture/env_vars.md`, Deploy-Config.
- **Kollidiert mit:** Betrieb (App-Code wird hier nur ausgeliefert, nicht editiert), Monitoring (Sentry-Plumbing).

## Lücke zum Nordstern (was FEHLT für „100 % verlässlich")
1. **PITR (Point-in-Time-Recovery) nicht aktiv** — heute nur tägliche Backups → bis zu 24 h Datenverlust möglich. Entscheiden ab wann nötig (Trigger: Compliance-Pflicht oder hohes Schreibvolumen, `backup_awareness.md`). Ein echter Kunde mit echten Fällen = Schwelle näher.
2. **Reverse-Migration-Disziplin nicht erzwungen** — Regel „Reverse-SQL schreiben, bevor angewendet" steht in `backup_awareness`, ist aber nicht im Migrations-Workflow verankert. → in `db-migrate`-Prozess gießen.
3. **CI deckt nur lint+build** — keine automatischen Smoke-/E2E-Tests (`email_smoke`, `voice_e2e` sind manuelle Runbooks). Gap: Intake-Pfad (P0) automatisch testen.
4. **Secret-Rotation-Kadenz** undefiniert — Verfahren existiert (`98-device-loss`), aber kein „alle X Monate rotieren".
5. **Kleinkram:** ticketlist **V7c** (retell-publish Auto-Commit branch-protection-sauber) · **OPS1** (Deploy-Mail-Lärm) — niedrige Prio.
