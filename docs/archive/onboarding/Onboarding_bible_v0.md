> ARCHIVIERT als v0 (2026-06-06). Abgeloest durch die frisch aufgesetzte ONBOARDING_BIBLE.md (Cockpit-Aera, Phasen 1-4) unter docs/gtm/onboarding/. Dieses Dokument ist das alte founder-gefuehrte / Vor-Ort-Termin-Paradigma (BigBen-Aera) und wird als Historie + Migrations-Quelle aufbewahrt (Forwarding-Schritte, PWA-Install, Painpoint-Antworten, 60-Sek-Cheat). Nicht mehr massgeblich.

# Onboarding-Bible

> Master-Doc für die **Onboarding-Maschine**. Parallel zu `PIPELINE_BIBLE.md`.
> Pipeline-Bible baut Demo-Videos für Prospects. Onboarding-Bible **schaltet
> echte Kunden live**. Beide Maschinen lösen denselben Bottleneck: Founder-Zeit.

---

## §1 · Goldene Regeln (übergeordnet)

Diese Regeln sind **nicht-verhandelbar**. Aus Schmerz gelernt — siehe `lessons_learned.md`
für die jeweils konkreten Vorfälle.

| # | Regel | Warum |
|---|---|---|
| **G1** | **Pre-Flight-Check vor jedem Termin.** Voice live, Website 200, App 200, Cron-Bestätigung. Wenn einer rot → Termin verschieben. | Lieber 30 Min später als mit halbem System beim Kunden. |
| **G2** | **Kunde sieht NIE einen anderen Kunden.** Keine Tenant-Listen, keine Cross-Tenant-Daten, keine Sanitär-Wording auf Pub-Tenants. | FB27 — Privacy-Leak. Existenzbedrohend bei Sichtbarkeit. |
| **G3** | **Sprache des Kunden.** Englischer Pub → englische Forms + englische Voice. Schweizer Sanitär → DE. Browser-native Picker zeigen Browser-Locale → IMMER custom Picker mit forced Locale. | FB22/FB23. Native Date-Picker zeigt deutsche Wochentage egal welche Site-Sprache. |
| **G4** | **Voice-Datum dynamisch + verifiziert.** Cron 3× täglich, off-hour, post-publish-verify. Lisa darf NIE auf gestrigem Datum hängen. | FB1 + FB26. Stale Datum = sofortiger Glaubwürdigkeitsverlust. |
| **G5** | **SMS nur bei tatsächlicher Bestätigung.** Submit ≠ Confirm. Kunde bekommt nur SMS wenn der Betrieb aktiv "ja" gedrückt hat. | FB24. Doppel-SMS verwirrt + wirkt unprofessionell. |
| **G6** | **App leer übergeben.** `pub_events`, `pub_reservations` (oder Equivalent) auf 0 vor Hand-Over. Keine Test-Daten verbleiben. | Erste echte Reservierung muss erste Reservierung sein. |
| **G7** | **GH-Secrets vor Cron-Setup verifizieren.** `gh secret list` muss alle benötigten Keys enthalten. Kein Cron läuft mit leerem `process.env.X`. | FB28-Bonus: Morning-Report war monatelang stumm kaputt weil `SUPABASE_URL` fehlte. |
| **G8** | **Per-Tenant-Entry-URL routet auf richtigen Home.** Pub → `/ops/pub-dashboard`, Sanitär → `/ops/cases`. Nie hardcoded. | FB25. URL `/ops/app/<slug>` ist die PWA-Install-Quelle, muss perfect sitzen. |
| **G9** | **Cross-Plattform-Pfade.** `fileURLToPath` statt URL-Pfad-Regex. Windows ≠ Linux. | Cron failte stumm auf Linux mit "ENOENT: src/web/.env.local". |
| **G10** | **Lessons Learned wird nach JEDEM Kunden ergänzt.** Innerhalb 24h nach Hand-Over. | Wissen verfällt. |
| **G11** | **Voice-Agent macht ausschliesslich 100%-bestätigte Versprechen.** NIEMALS Recurrings, Events, Services oder Status-Aussagen die nicht aktuell in der Single Source of Truth stehen. Bei Unsicherheit: "Das ist aktuell nicht eingeplant — du kannst aber gerne deine Nummer hinterlassen, dann meldet sich [Owner]." | BigBen 28.04.: Lisa hat "every Wednesday Quiz Night" versprochen ohne dass Paul es eingetragen hatte. Caller kommt → Pub leer → Vertrauensverlust. Worst-Case-Beispiel für Sanitär: Stellenanzeige nicht mehr aktuell, aber Lisa nimmt Bewerbungen entgegen. |
| **G12** | **Single Source of Truth pro Datenfeld + Voice-Knowledge-Tier.** Pro Kunde wird in Phase-1-Discovery `data_sources.md` erstellt: welche Quelle (DB / GBP / External-Website / Static) pflegt welches Feld, welcher Tier (T1-T4) wird angepeilt, welche Cadence pro Quelle. Lisa-Qualität = Coverage des Tier-Plans + Frische der Quellen. Detail: `docs/architecture/tenant_architecture.md` §3. | Naive Pauschalisierung "Website ist immer SoT" funktioniert nicht — manche Sanitär-Betriebe haben schwache Website + starkes GBP. Per-Kunde-Map ist Pflicht. |

---

## §2 · Onboarding-Phasen (Architektur)

Sechs Phasen, jede mit klarer Definition of Done.

```
PROSPECT (kommt aus Pipeline-Maschine: Demo-Video gesehen, hat zugesagt)
    ↓
[1] DISCOVERY — was braucht dieser Kunde wirklich?
    ↓
[2] PROVISIONING — Tenant + Voice + App + Website live (ohne Kunde)
    ↓
[3] LIVE-SETUP — Termin mit Kunde, alles scharf schalten (60 min)
    ↓
[4] HAND-OVER — Kunde hat App, GBP gepflegt, weiss was er hat
    ↓
[5] VALIDATION — Tag 1-7, läuft es ohne Founder?
    ↓
[6] CONVERT — von Trial zu Paid, Lessons-Learned eintragen
    ↓
KUNDE (autonom; Founder nur noch bei Eskalation)
```

| Phase | Trigger | Definition of Done | Dauer |
|---|---|---|---|
| **1 Discovery** | Prospect sagt "ja, ich nehme es" | Onboarding-Plan steht in `docs/customers/<slug>/onboarding_plan.md`: Modul (Sanitär/Pub/...), Tarif, Hardware, Sprache, GBP-Status, Termin geblockt | 30-60 min Call/Mail |
| **2 Provisioning** | Onboarding-Plan freigegeben | `provision_trial.mjs` durchgelaufen, Tenant + Phone + Voice-Agent + App existieren, Pre-Flight-Check 4/4 grün | 30 min, Founder-only, kein Kunden-Kontakt |
| **3 Live-Setup** | Vor-Ort-Termin (oder Remote-Call) | Run-Sheet `docs/customers/<slug>/onboarding_<slug>.md` durchgespielt: Telefon-Forward, App-Install, Test-Anruf E2E, erste echte Reservierung confirmed | 60 min |
| **4 Hand-Over** | Live-Setup-Termin endet | Kunde hat: App auf Home-Screen, OTP-Login funktioniert, Push aktiv, Handout (PDF/WhatsApp), Founder-Notfallnummer, ggf. GBP-Update | 5-10 min am Ende des Termins |
| **5 Validation** | Tag 1 abends bis Tag 7 | Mind. 1 echter Kunden-Anruf gelandet, in App sichtbar, Push gekommen, keine Sentry-Errors, Telegram-Cron grün jeden Morgen | 7 Tage passive Beobachtung + Tag-7-Anruf |
| **6 Convert** | Tag 7 Check-in-Anruf | Kunde sagt "läuft", Trial → Paid Konvertierung, Lessons-Learned in `lessons_learned.md` eingetragen | 15 min |

---

## §3 · Pro-Phase Checklisten

### Phase 1 · Discovery
- [ ] Modul identifiziert (Sanitär / Pub / ...)
- [ ] Tarif geklärt + dokumentiert in `docs/customers/<slug>/tenant_config.json`
- [ ] Sprache (DE / EN) — bestimmt Voice + Website + App
- [ ] Telefonnummer-Forwarding-Strategie geklärt (Anbieter, Login vorhanden?)
- [ ] Termin geblockt (Datum + Uhrzeit + Format: vor Ort / Remote)
- [ ] `docs/customers/<slug>/onboarding_plan.md` ausgefüllt
- [ ] `docs/customers/<slug>/links.md` angelegt (mind. Website + App-URL + Telefon)
- [ ] **`docs/customers/<slug>/data_sources.md` erstellt (G12)**: pro Datenfeld die Quelle festgelegt (DB / GBP / Website / Static) + Cadence
- [ ] **Voice-Knowledge-Tier-Ziel festgelegt (T1-T4)**: Standard T3, Premium T4
- [ ] **Website-Audit (für T3+)**: Tiefe & Breadth dokumentiert, Stärken/Schwächen
- [ ] **GBP-Audit**: was pflegt der Kunde dort? Wer hat Zugang?
- [ ] **Customer-E-Mail für OTP-Login** notiert (für Phase-2 Pre-Provisioning)

### Phase 2 · Provisioning
- [ ] `node scripts/_ops/provision_trial.mjs --slug <slug> ...` durchgelaufen
- [ ] Tenant in DB existiert mit korrekten `modules` (Pub: events+reservations=true)
- [ ] **Customer-User pre-provisioniert (B1-Pattern, kritisch!):** `auth.users` Eintrag für Customer-E-Mail mit `app_metadata.tenant_id` + `app_metadata.role=admin`. Plus `staff` Tabelle Eintrag. Sonst landet Customer beim OTP-Login auf Default-Tenant ("LS Guidance system"-Bug).
- [ ] **Voice-Knowledge-Extract durchgeführt (T3-Pflicht):** `crawl-website.mjs` + LLM-Strukturierung → `docs/customers/<slug>/website_knowledge.json`. Seed in Voice-Agent-Prompt.
- [ ] Voice-Agent in Retell published, Test-Call vom Founder OK
- [ ] **Voice-Knowledge-Coverage-Test:** 20 typische Caller-Fragen, mind. 80% korrekte Antworten (T3) bzw. 95% (T4).
- [ ] Per-Tenant-Cron eingerichtet (für Pubs: `BigBen Voice Daily Refresh` als Vorlage)
- [ ] GH-Secrets `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RETELL_API_KEY` vorhanden
- [ ] Smoke-Test des Crons via `gh workflow run "<Workflow-Name>"` grün
- [ ] Website live + 200 (`flowsight.ch/<slug>`)
- [ ] App-URL live + 200 (`flowsight.ch/ops/app/<slug>`) — landet auf richtigem Home je nach Modul
- [ ] App-Daten leer (events + reservations = 0)
- [ ] `data_sources.md` Skripte funktionieren (jede source-cadence-Kombination einmal getriggert)

### Phase 3 · Live-Setup
Pro-Kunde-Run-Sheet (Template `customer_runbook_template.md`). Generische Schritte:

- [ ] Pre-Flight 5 Min vor Termin: 4/4 Checks grün
- [ ] Begrüssung + Anker setzen ("Alles ist schon scharf")
- [ ] Telefon-Forwarding einrichten + Sofort-Test
- [ ] App auf Kundengerät installieren (PWA)
- [ ] App-Walkthrough mit Kunde am Gerät (zeigen → Kunde drückt selber)
- [ ] End-to-End-Test mit echtem Anruf
- [ ] Hand-Over-Pack (siehe Phase 4)

### Phase 4 · Hand-Over
- [ ] App auf Home-Screen, eingeloggt
- [ ] Push-Notifications aktiviert (im Browser & im OS)
- [ ] OTP-Login-Mail dokumentiert / vom Kunden bestätigt
- [ ] Telefon-Forwarding bestätigt
- [ ] Handout per PDF + WhatsApp / Mail
- [ ] Founder-Direktnummer notiert
- [ ] Tag-7-Check-in vereinbart
- [ ] GBP-Update-Plan (falls Domain neu, Kontakt-URL etc.)

### Phase 5 · Validation
Tag 1 abends:
- [ ] Mindestens 1 echter Kundenanruf gelandet (DB-Check)
- [ ] Reservierung in App sichtbar
- [ ] Push gekommen
- [ ] Keine Sentry-Errors mit `tenant_id=<slug>`

Tag 2-7:
- [ ] Morning-Report 07:30 UTC täglich grün (Telegram)
- [ ] Voice-Cron-Bestätigung 07:13 CEST täglich (Telegram)
- [ ] Keine Crashes in Sentry

Tag 7 Check-in:
- [ ] Anruf beim Kunden: "Wie läufts? Was nervt? Was fehlt?"
- [ ] Lessons-Learned-Update in `lessons_learned.md`
- [ ] Customer Status auf "live_dock" / "converted" / "decision_pending"

### Phase 6 · Convert
- [ ] Tarif-Vereinbarung schriftlich
- [ ] DB `trial_status: "converted"`
- [ ] Lessons-Learned-Eintrag final
- [ ] Onboarding-Eintrag in `README.md` Tabelle

---

## §4 · Cross-Cutting Konzepte

### 4.1 PWA-Install
- iPhone: Safari → URL eintippen → Teilen → Zum Home-Bildschirm. Beachte: Chrome auf iOS kann KEINE PWA installieren — Safari-only.
- Android: Chrome → Drei-Punkte → "App installieren"
- Push-Permission MUSS in derselben Session erteilt werden, sonst kommen keine Notifications

### 4.2 Voice-Agent Tagesaktualität
- Cron 3× täglich xx:13 (off-hour) → reduziert GH-Actions Skip-Risiko
- Post-Publish-Verifikation als Hard-Gate (Skript exitet ≠ 0 wenn Datum nicht im Live-Prompt)
- Telegram bei Erfolg + Fehler
- `workflow_dispatch` als manueller Notfall-Trigger
- Aussprache-Hints in EN+DE direkt im Prompt-Block — TTS liest "03 May" sonst als "zero three may"

### 4.3 Tenant-Routing
- Per-Tenant-PWA-Entry: `/ops/app/<slug>` setzt Cookie, redirected basierend auf `tenant.modules`
- Pub-Tenant (events || reservations) → `/ops/pub-dashboard`
- Sonst → `/ops/cases`
- TenantSwitcher (Dropdown) ist auf Pub-Tenants AUCH FÜR ADMINS ausgeblendet — Customer-Name-Leak-Schutz

### 4.4 SMS-Lifecycle
- Submit (Website / Manual) → KEIN SMS, nur DB-Insert + Push an Betreiber
- Confirm (Betreiber drückt) → SMS an Gast: "Confirmed!"
- Decline → SMS: "Sorry, fully booked, call us"
- No-Show / Cancel → kein SMS

### 4.5 Datums-Format Voice
- Format: "Tuesday, 28 Apr 2026" (kein Leading-Zero — sonst "zero three may")
- Pronunciation-Hint im Prompt: 'say dates as "May 3rd" or "the 3rd of May"'
- Gilt für EN UND DE (Hint auch auf Deutsch)

### 4.6 Cross-Platform Skripte
- Windows + Linux Cron-Runner: `fileURLToPath` für Pfad-Resolution, NIE Regex auf URL-Pathname
- `path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..")` ist die kanonische Form

### 4.7 GH-Secrets-Setup pro Kunde
Standard-Set für jeden Kunden mit Cron:
```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
RETELL_API_KEY  (wenn Voice-Agent involviert)
```
Verifikation: `gh secret list` listet alle. Smoke-Test: `gh workflow run "<Cron-Name>"` muss grün durchgehen, NICHT nur die Workflow-Schale (die exitet 0 auch bei stillschweigend kaputtem Skript).

---

## §5 · Onboarding-Maschine — Roadmap

Was die Maschine **noch** wird (priorisiert):

### Stufe 1 — Standardisierung (jetzt)
- [x] Run-Sheet-Template
- [x] Pre-Flight-Check als Skript (4/4-Verify)
- [x] Lessons-Learned-Loop nach jedem Kunden
- [ ] Phase-2-Provision-Skript pro Modul (Pub vs. Sanitär) als One-Liner

### Stufe 2 — Automatisierung (Q3)
- [ ] Selbst-Service-Onboarding für Pubs (Kunde klickt sich selber durch, Founder nur Review)
- [ ] PWA-Install-Anleitung als geführter Wizard im Browser (Detect iOS/Android, zeige passende Schritte)
- [ ] GBP-Update-Generator (E-Mail an Kunde mit copy-paste-fertigen Texten)

### Stufe 3 — Skalierung (ab 10 Kunden)
- [ ] Onboarding-Telegram-Bot: Founder schreibt Slug + Termin, Bot generiert Run-Sheet auto
- [ ] Tag-7-Check-in als Auto-Telegram-Reminder
- [ ] Pre-Flight-Skript läuft cron-mäßig morgens vor jedem Termin und Telegram-bestätigt

### North Star
**Founder kann 5 Kunden pro Woche onboarden ohne Kontextwechsel.**
Heute: 1-2 pro Tag mit voller Aufmerksamkeit.
Limiter weg: jede manuelle Wiederholung wird in §4 + Skripte überführt.

---

## §6 · Anker

- **Pipeline-Bible:** `docs/gtm/pipeline/PIPELINE_BIBLE.md` (was vorher passiert — Demo-Produktion)
- **Lessons Learned (Onboarding):** `docs/gtm/onboarding/lessons_learned.md`
- **Lessons Learned (Pipeline/Demo):** `docs/customers/lessons-learned.md`
- **Customer-Runbooks:** `docs/customers/<slug>/onboarding_<slug>.md` (per-Kunde)
- **6-Phasen-Playbook (legacy/detail):** `docs/gtm/onboarding/playbook_6_phases.md`
- **Status:** `docs/STATUS.md` §Onboarding-Maschine
- **Memory:** Auto-loaded via MEMORY.md

