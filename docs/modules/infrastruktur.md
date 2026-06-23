# Modul: Infrastruktur (bauen & ausliefern)

> Teil der [FlowSight Bible](../flowsight_bible.md). Wie gebaut und ausgeliefert wird —
> **nicht** das Beobachten (das ist [Monitoring](monitoring.md)).

## Zweck
Die Maschine, die Code sicher in Produktion bringt: Deploy, CI, Datenbank-Migrationen, Secrets, Workflows.

## Status heute (geerntet)
- **Deploy:** Vercel, Region `fra1`, Root `src/web`. **SSOT = Supabase.**
- **CI:** lint (`eslint --max-warnings 0` auf `src/web`) + build; gated `production`-Environment (Founder-Gate).
- **Workflows:** `db-migrate.yml` (Schema-Migrationen via Management-API, gated), `retell-publish.yml`, `supabase-fix.yml`, mobile Ops-Katalog.
- **Secrets-SSOT:** Vercel-Env (runtime); GitHub-Actions-Secrets für Workflows. Nie im Repo.

## Kanonische Quelle (SSOT)
- [zielarchitektur](../architecture/zielarchitektur.md) (technische SSOT) + [env_vars](../architecture/env_vars.md) (Env-Registry).
- `.github/workflows/`, `supabase/migrations/`, `scripts/_ops/`.
- Ops vom Handy: [runbooks/mobile_ops](../runbooks/mobile_ops.md).

## Dateibereich (Parallel-Konflikt-Regel)
- **Besitzt:** `.github/workflows/`, `supabase/migrations/`, `scripts/_ops/`, `docs/architecture/env_vars.md`, Deploy-Config.
- **Kollidiert mit:** Betrieb (App-Code wird hier nur ausgeliefert, nicht editiert) — getrennt halten.

## Offen / nächster Schritt
- ticketlist **V7c** (retell-publish Auto-Commit branch-protection-sauber) · **OPS1** (Deploy-Mail-Lärm) — beide niedrige Prio.
