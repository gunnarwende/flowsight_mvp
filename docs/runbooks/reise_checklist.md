# Reise-Checklist — Founder-Abwesenheit

**Erstellt:** 2026-03-11 | **Owner:** Founder + CC
**Kontext:** Philippinen-Reise (~25 Tage, davon 3-4 Tage ohne WLAN/Strom). Mobile Daten vorhanden → E-Mail (Outlook) täglich erreichbar.

---

## Vor Abflug (1-2 Tage vorher)

### GitHub Actions Secrets setzen/prüfen

| Secret | Quelle | Prüfen |
|--------|--------|--------|
| `SUPABASE_URL` | Supabase Project Settings | `gh secret list` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase API Keys (service-role) | |
| `RESEND_API_KEY` | Resend Dashboard | |
| `FOUNDER_EMAIL` | Outlook-Adresse | |
| `APP_URL` | `https://flowsight-mvp.vercel.app` | |
| `LIFECYCLE_TICK_SECRET` | Bitwarden (self-generated, 32+ chars) | |
| `TELEGRAM_BOT_TOKEN` | BotFather (bereits gesetzt ✅) | |
| `TELEGRAM_CHAT_ID` | Telegram Ops Channel (bereits gesetzt ✅) | |

### Vercel Env Vars prüfen

- [ ] `LIFECYCLE_TICK_SECRET` — gleicher Wert wie GitHub Secret
- [ ] `DEMO_SIP_CALLER_ID` — persönliche Handynummer in E.164 (z.B. +41791234567)
- [ ] `RESEND_API_KEY` — gültig (nicht abgelaufen)

### Sentry Alert Rules einrichten (einmalig)

1. **CASE_CREATE_FAILED** — Alert on `error_code:DB_INSERT_ERROR` → E-Mail
2. **EMAIL_DISPATCH_FAILED** — Alert on `error_code:RESEND_API_ERROR` → E-Mail
3. **RESEND_EXCEPTION** — Alert on `error_code:RESEND_EXCEPTION` → E-Mail

Ziel: Sentry → E-Mail → Outlook → sichtbar auf Reise.

### System-Smoke-Test

```bash
# 1. Health Check
curl https://flowsight-mvp.vercel.app/api/health
# Erwartung: { "ok": true, "db": "ok", "email": "ok" }

# 2. Morning Report manuell triggern
gh workflow run morning-report.yml
# Erwartung: Telegram + (bei RED/YELLOW) E-Mail

# 3. Lifecycle Tick manuell triggern
gh workflow run lifecycle-tick.yml
# Erwartung: Telegram ✅

# 4. Test-Anruf auf Weinberger-Nummer
# → Lisa antwortet → SMS kommt → Fall im Dashboard
```

### Trial-Timing-Regel (H8)

**Regel:** Keine neuen Trials starten, deren Day 10 (Follow-up Call) in ein geplantes Offline-Fenster fällt.

**Berechnung:**
- Trial Start = Tag X
- Day 10 = Tag X + 10
- Day 13 = Tag X + 13 (Auto-Email — kein Problem)
- Day 14 = Tag X + 14 (Auto-Status → decision_pending — kein Problem)
- **Kritisch:** Day 10 braucht persönlichen Anruf

**Vor der Reise:**
- Prüfe: Gibt es aktive Trials, deren Day 10 in die Offline-Fenster fällt?
- Wenn ja: Follow-up Call VOR Abflug vorziehen
- Keine neuen Trials starten, die Day 10 während Offline haben

**Während der Reise (Hotel-Tage mit WLAN):**
- Neue Trials nur starten, wenn Day 10 auf einen Hotel-Tag fällt
- Im Zweifel: Trial-Start verschieben auf nach Rückkehr

### Letzte Checks

- [ ] `git stash` / `git status` — kein offener Branch
- [ ] Vercel: letzte Deployment-Status = OK (Dashboard prüfen)
- [ ] Telegram Ops Channel: letzte Nachricht = grün
- [ ] Bitwarden: alle kritischen Zugänge dokumentiert (Supabase, Vercel, Retell, Twilio, Resend, GitHub)

---

## Während der Reise

### Tägliche Routine (2 Minuten, Mobile)

1. **Outlook prüfen** — Morning Report kommt bei RED/YELLOW als E-Mail
   - GREEN = alles läuft → nichts tun
   - YELLOW = Follow-up fällig oder Backlog → wenn möglich handeln, sonst ignorieren
   - RED = System-Problem → Telegram prüfen für Details
2. **Telegram prüfen** — Lifecycle Tick Status (✅ oder 🔴)

### Was läuft automatisch (kein Eingriff nötig)

| System | Frequenz | Was passiert |
|--------|----------|-------------|
| Voice Intake (Lisa) | 24/7 | Anruf → Case → E-Mail → SMS |
| Wizard Intake | 24/7 | Formular → Case → E-Mail |
| Lifecycle Tick | Täglich 07:00 UTC | Day 7/10/13/14 Milestones |
| Morning Report | Täglich 07:30 UTC | KPIs → Telegram + E-Mail |
| Vercel Deploy | Bei Merge | Auto-deploy |
| Review Engine | Bei Trigger | Review-Link → E-Mail/SMS |

### Was NICHT automatisch läuft (bewusst akzeptiert)

| Aktion | Timing | Risiko bei Ausfall | Akzeptabel? |
|--------|--------|-------------------|-------------|
| Follow-up Call (Day 10) | Per Trial | Trial-Conversion sinkt | JA — nachholen nach Rückkehr |
| Trial Decision (Day 14) | Per Trial | Zombie in decision_pending | JA — System macht nichts Destruktives |
| Trial Offboarding | Nach Decision | Zombie bleibt aktiv | JA — kein Schaden, nur Kosten (minimal) |
| Trial Provisioning | Per neuer Prospect | Kein neuer Trial gestartet | JA — Akquise pausiert |
| Retell Agent Changes | Bei Bedarf | Alter Agent läuft weiter | JA — kein Change nötig |

### Offline-Fenster (3-4 Tage ohne WLAN)

**Was passiert:**
- Morning Report E-Mail kommt an → du siehst sie erst nach Offline-Fenster
- Lifecycle Tick läuft weiterhin (GitHub Actions braucht kein Founder-Input)
- Cases werden erstellt, E-Mails gesendet, SMS verschickt — alles automatisch
- Falls System bricht: Sentry + Morning Report loggen alles → du siehst es nach Rückkehr online

**Worst Case (System bricht während Offline):**
1. Supabase kurzzeitig down → Cases gehen verloren (kein Retry)
2. Resend down → E-Mails gehen nicht raus (Sentry loggt)
3. Lifecycle Tick failed → Milestones verspätet (Catch-up beim nächsten Tick)
4. Voice/Twilio Outage → Anrufe scheitern (Peoplefone Voicemail als Fallback)

**Recovery nach Offline:**
- Morning Report Backlog durchgehen (Telegram oder E-Mail)
- Health Check: `curl .../api/health`
- Falls RED: Sentry Dashboard prüfen
- Falls Tick ausgefallen: `gh workflow run lifecycle-tick.yml` manuell triggern
- Verpasste Follow-up Calls nachholen

---

## Nach Rückkehr

### Sofort (erste 30 Minuten)

1. **Health Check:** `curl https://flowsight-mvp.vercel.app/api/health`
2. **Morning Report:** `gh workflow run morning-report.yml` — manuell triggern
3. **Ops Dashboard:** `/ops/cases` öffnen — Backlog prüfen
4. **Sentry:** Dashboard öffnen — Errors der letzten Wochen prüfen
5. **Trial Status:** Morning Report zeigt active_trials, zombies, decision_pending

### Erste Woche

- [ ] Alle `decision_pending` Trials reviewen → convert oder offboard
- [ ] Verpasste Follow-up Calls nachholen
- [ ] GitHub Issues prüfen (CoreBot → Telegram → Issues)
- [ ] Pipeline CSV aktualisieren (`docs/sales/pipeline.csv`)
- [ ] Resend Usage prüfen (Dashboard → sind wir nahe 100/Tag?)

---

## Upgrade-Empfehlungen vor Reise

| Service | Aktuell | Empfehlung | Kosten | Grund |
|---------|---------|------------|--------|-------|
| **Supabase** | Free | **Pro** | $25/Mo | Automatische Backups. Ohne: Datenverlust bei DB-Corruption nicht recoverable. |
| **Vercel** | Hobby | **Pro** | $20/Mo | 30s Function Timeout (statt 10s), bessere Analytics. Verhindert Timeout bei langsamen Email-Sends. |
| Resend | Free (100/Tag) | Free reicht | $0 | 100/Tag reicht für aktuelle Last (~15-20/Tag). |
| Twilio | Pay-as-you-go | Reicht | ~$5/Mo | Voice + SMS funktioniert. |
| Retell | Pay-as-you-go | Reicht | ~$10/Mo | Voice Agent läuft stabil. |

**Priorität:** Supabase Pro > Vercel Pro. Supabase Pro eliminiert das Backup-Risiko komplett.

---

## Notfall-Kontakte

| Wer | Wann | Wie |
|-----|------|-----|
| CC (Claude Code) | Jederzeit | Neue Session starten, Kontext aus MEMORY.md + STATUS.md |
| Supabase Support | DB-Notfall | supabase.com/support (Pro-Plan = Priority) |
| Vercel Support | Deploy-Notfall | vercel.com/support |
| Retell Support | Voice-Notfall | retell.ai (Dashboard) |

---

## Signal-Übersicht

```
System OK:
  07:00 UTC  ✅ Lifecycle tick OK (Telegram)
  07:30 UTC  🟢 Morning Report (Telegram only, kein E-Mail)

System WARNING:
  07:30 UTC  🟡 Morning Report (Telegram + E-Mail an Outlook)
  → Follow-up fällig oder Backlog > 5

System ALARM:
  07:00 UTC  🔴 Lifecycle tick FAILED (Telegram)
  07:30 UTC  🔴 Morning Report (Telegram + E-Mail an Outlook)
  Jederzeit   Sentry Alert → E-Mail an Outlook
  → DB down, Health fail, Trial expired, Tick stale
```
