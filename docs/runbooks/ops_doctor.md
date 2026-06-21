# Runbook — Ops Doctor (Remote Live-Diagnose)

**Zweck:** Vollständiger, read-only Health-Check über alle Live-Systeme — auslösbar vom Handy (über Claude / GitHub UI), ohne Laptop, ohne dass Secrets die GitHub-Umgebung verlassen.

## Was geprüft wird (alles nur lesend)
1. **App / DB / Mail** — `GET {APP_URL}/api/health` → Vercel-Prozess lebt, Supabase-DB erreichbar, Resend-Key vorhanden
2. **Retell Voice** — `GET /list-agents` → flaggt jeden Agent mit `is_published=false` (der klassische Silent-Routing-Fehler)
3. **Resend Mail** — `GET /domains` → flaggt jede Domain, die nicht `verified` ist

## Auslösen
- **Vom Handy (Claude):** "Check mal die Systeme" → Claude triggert den Workflow `ops-doctor.yml` und liest das Job-Log zurück.
- **GitHub UI:** Actions → *Ops Doctor* → *Run workflow*.
- Ergebnis kommt zusätzlich als **Telegram-Report** (nutzt `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID`).

## Run-Farbe = Diagnose auf einen Blick
- 🟢 **grün** = keine kritischen Findings (ggf. weiche Warnungen im Log)
- 🔴 **rot** = mindestens ein CRITICAL: App down, DB-Fehler oder **unpublished Retell-Agent** → sofort handeln

## Sicherheit
- Keine Mutation, keine Schreibvorgänge. Secrets liegen verschlüsselt als GitHub Action Secrets und werden nur im Runner injiziert — nie im Claude-Kontext.
- Jeder Lauf ist als Workflow-Run auditiert.

## Benötigte Secrets
`APP_URL`, `RETELL_API_KEY`, `RESEND_API_KEY` (Checks), `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` (Report, optional).
Fehlt ein Key, wird der betreffende Check als Warnung übersprungen statt hart zu failen.

## Gegatete Schreib-Workflows (Phase 2)

Schreib-Aktionen laufen über separate Workflows mit **Required-Reviewer-Freigabe** (GitHub Environment `production`) → Ein-Tap-Approval aufs Handy, bevor irgendetwas Live-Daten/Routing berührt.

### `retell-publish.yml` — Voice-Agent publishen
- **Zweck:** Tenant-Agents (DE+INTL) aus `retell/exports/<prefix>_agent.json` synchronisieren + **publishen** (`retell_sync.mjs`), danach `is_published=true` **verifizieren**, dann `retell/agent_ids.json` zurück-committen (idempotent, keine Duplikate).
- **Inputs:** `prefix` (z.B. `doerfler`), `dry_run` (optional).
- **Voraussetzung:** Es müssen `<prefix>_agent.json` UND `<prefix>_agent_intl.json` existieren.
- **Deckt den Guardrail ab:** „EVERY Retell change MUST end with publish" — sonst silent routing failures.

### `supabase-fix.yml` — präzise Datenkorrektur
- **Zweck:** gezielte Daten-Operation via PostgREST (kein Raw-SQL): `select` / `update` / `delete`.
- **Inputs:** `table`, `operation`, `filter` (PostgREST, z.B. `id=eq.<uuid>`), `patch` (JSON, nur bei update).
- **Leitplanken:** `update`/`delete` **erzwingen einen Filter** (kein Tabellen-Wipe); immer Vorher-/Nachher-Log; `update` braucht Patch-JSON.

## ⚙️ Einmaliges Setup für das Freigabe-Gate (GitHub UI, ~3 Min)
Damit die Required-Reviewer-Freigabe greift:
1. GitHub → Repo **Settings → Environments → New environment** → Name exakt `production`.
2. **Required reviewers** aktivieren → dich (`gunnarwende`) hinzufügen.
3. Speichern.

Effekt: Beim Auslösen von `retell-publish` oder `supabase-fix` pausiert der Run und schickt dir eine Freigabe-Anfrage (GitHub-App-Push) → ein Tap zum Genehmigen.
⚠️ Ohne diesen Schritt existiert die Umgebung ohne Schutzregel → die Workflows würden **sofort ohne Freigabe** laufen. `ops-doctor` (read-only) ist bewusst ungegatet.
