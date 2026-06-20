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

## Nächste Stufen (gegatet)
Schreib-Aktionen (Retell-Publish, DB-Korrekturen, Prod-Deploy) laufen über separate Workflows mit **Required-Reviewer-Freigabe** (GitHub Environment `production`) → Ein-Tap-Approval aufs Handy.
