# Mobile Ops — Live-Aktionen vom Handy auslösen

Der Cloud-Agent am Handy (claude.ai/code) hat **keine App-Secrets** (gut so — Secrets gehören nie in eine ephemere Sandbox). Secret-pflichtige Live-Ops laufen deshalb **server-seitig als GitHub Actions** (die tragen die Repo-Secrets) und werden vom Handy nur **angestoßen**. Secrets bleiben sicher, das Handy drückt den Knopf.

## Was geht direkt vom Handy (ohne Workflow)
Lesen, branchen, committen, pushen, **PRs öffnen/reviewen/mergen**, CI-Status + Logs, Issues, Code/Docs analysieren, Node-Scripts ohne Secret. Das ist die tägliche Sales-/Doc-/Code-Arbeit — voll mobil.

## Was über Workflows läuft (secret-pflichtig)
Alle Workflows unten haben `workflow_dispatch` — also vom Handy auslösbar.

**Auslösen — zwei Wege:**
1. **GitHub-Mobile-App** → Repo → Actions → Workflow wählen → „Run workflow" (Branch `main`, ggf. Inputs eintragen). Kein CLI nötig.
2. **Über den Handy-Agenten** (claude.ai/code), falls seine GitHub-Tools Workflow-Dispatch unterstützen: „Trigger workflow `<name>.yml` on main with inputs …".

Ergebnis kommt server-seitig zurück (Telegram-Alert / Action-Log / ggf. PR-Kommentar) — nicht in die Sandbox.

| Ich will … | Workflow | Inputs | Hinweis |
|---|---|---|---|
| Tages-Status (Cases/Trials/Health) | `morning-report.yml` | — | sonst täglich 07:30; on-demand jederzeit |
| Wochen-Status | `weekly-report.yml` | — | |
| System-Health prüfen | `ops-doctor.yml` | — | DB/Email/Retell-Health |
| Trial-Milestones ticken | `lifecycle-tick.yml` | — | idempotent |
| **Voice-Agent inspizieren** (read-only) | `retell-inspect.yml` | `prefixes` (z. B. `doerfler`) | sicher, nur lesen |
| **Voice-Agent publishen/syncen** | `retell-publish.yml` | `prefix`, `dry_run` | erst `dry_run=true` testen! Dörfler = `doerfler` |
| Retell-Calls abfragen | `retell-calls.yml` | `to_number`, `limit` | |
| **DB-Operation** (gated, nur Daten) | `supabase-fix.yml` | `table`, `operation`, `filter`, `patch` | mächtig — genau prüfen, was du schreibst; PostgREST, kein DDL |
| **DB-Migration anwenden** (gated, DDL) | `db-migrate.yml` | `file`, `dry_run` | Wendet EINE benannte Datei aus `supabase/migrations/` gezielt + idempotent an (Management-API, kein blindes `db push`). **Erst `dry_run=true`!** Secret `SUPABASE_ACCESS_TOKEN` ist hinterlegt. Flow: Migrations-Datei (mit `IF NOT EXISTS`) per PR → merge → hier mit `file=<name>` triggern |
| Google-Reviews crawlen | `google-review-crawl.yml` | — | |
| Outreach-Reminder | `outreach-reminder.yml` | — | |
| BigBen Voice-Health | `bigben-check.yml` | `to_number`, `fetch_limit` | |
| BigBen Calls syncen / Voice refresh | `bigben-sync-calls.yml` · `bigben-voice-daily.yml` | — | |
| **Hero-Assets bauen** (Stern 3) | `produce-hero.yml` | `phase` (call), `gewerk` (waerme/sanitaer), `betrieb`, `brunner_voice`, `upload`, `dry_run` | Phase `call` = Lisa+Brunner-Call-Audio via **ElevenLabs** → Master-WAV (+ optional Bunny-Upload). **Erst `dry_run=true`!** Artefakt „hero-call" im Run. `screens/montage/proof` brauchen erst Founder-Gesichts-Footage. |

## Goldene Regeln (Mobile Live-Ops)
- **Schreibende/publishende Workflows zuerst im Dry-Run** (z. B. `retell-publish dry_run=true`), Ergebnis lesen, dann scharf.
- **`supabase-fix` ist mächtig** — `filter`/`patch` doppelt prüfen, bevor du auslöst.
- **Was scharf an Kunden geht** (E-Mail/SMS, Prod-Deploy via Merge nach `main`) bleibt **Founder-Entscheidung** — auch vom Handy bewusst, nicht im Vorbeigehen.
- Persistenz: die Sandbox ist ephemer — nur **committet + gepusht** überlebt. Live-Wirkung immer über Workflow/Commit, nie über lokale Sandbox-Schritte.

## Was (noch) nicht direkt geht
Direkter Live-Datenzugriff aus der Sandbox (Supabase-Query, Retell-API ad hoc) — dafür den passenden Workflow nutzen. Direkter Vercel-Deploy-Status — über GitHub/Vercel-Dashboard.
