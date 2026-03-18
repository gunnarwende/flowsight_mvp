# Kommunikationsmatrix — FlowSight

**Erstellt:** 2026-03-18
**Owner:** Founder + CC
**Scope:** Systemweite Kommunikationsarchitektur (alle Module, alle Kanäle, alle Akteure)
**Prinzip:** Jede Nachricht hat einen Zweck. Kein Spam. Kein Informationsverlust.

---

## 1. Warum diese Matrix?

FlowSight orchestriert Kommunikation zwischen **5 Akteursgruppen** über **5 Kanäle** in **4 Modulen**. Die Komplexität ergibt sich aus:

- **Kanalvielfalt:** Voice Agent, SMS, E-Mail, Online-Formular (Wizard), Leitstand-UI
- **Bidirektionalität:** Kunde → Betrieb, Betrieb → Kunde, Betrieb intern, System → Founder
- **Betriebsgrössen:** 2-Mann-Betrieb (Meister = alles) bis 30 Mann (Disponent, Techniker, Büro)
- **Kontaktdaten-Asymmetrie:** Voice-Fälle haben nur Telefon (keine E-Mail). Wizard-Fälle haben beides.
- **Timing:** Benachrichtigungen müssen zur richtigen Zeit kommen — nicht zu früh (Spam), nicht zu spät (Informationsverlust)

Ohne diese Matrix riskieren wir: doppelte Benachrichtigungen, fehlende Benachrichtigungen, falsche Kanäle, Spam-Gefühl beim Kunden.

---

## 2. Akteure

| Akteur | Rolle | Kommunikationskanäle | Typischer Kontakt |
|--------|-------|---------------------|-------------------|
| **Endkunde** | Meldet Schaden, empfängt Termin/Bestätigung | Anruf (Voice Agent), Online-Formular, SMS, E-Mail | Telefon + evtl. E-Mail |
| **Inhaber / Disponent** | Sichtet Fälle, plant Einsätze, verwaltet Team | Leitstand (Web/PWA), E-Mail, SMS (Alerts) | E-Mail + Telefon |
| **Techniker** | Führt Einsatz durch, bestätigt Erledigung | SMS (Einsatz-Info), E-Mail (Zuweisung), ICS (Termin) | E-Mail + Telefon |
| **Lieferant** | (Zukunft) Wird über Voice Agent weitergeleitet | Anruf | Telefon |
| **FlowSight (Founder)** | Support, Onboarding/Offboarding, Monitoring | Telegram, E-Mail, Morning Report | Telegram + E-Mail |

### Betriebsgrössen-Impact

| Grösse | Inhaber-Rolle | Benachrichtigungs-Bedarf | Besonderheiten |
|--------|--------------|-------------------------|----------------|
| **2 MA** | Meister = Disponent = Techniker | Minimal (macht alles selbst) | Zuweisung = "an sich selbst", Kalender-Check irrelevant |
| **5 MA** | Meister sichtet, weist zu | Mittel (Techniker braucht Zuweisung + Termin) | 1 Techniker pro Fall |
| **10 MA** | Disponent plant Woche | Hoch (mehrere Techniker, Kalender-Konflikte) | Einsatzplan wird wichtig |
| **30 MA** | Büro-Team koordiniert | Sehr hoch (Team-basierte Zuweisung, Tages-Briefing) | Tages-Briefing SMS sinnvoll |

---

## 3. Kommunikationskanäle & Provider

| Kanal | Provider | Richtung | Kosten | Einschränkungen |
|-------|----------|----------|--------|-----------------|
| **Voice Agent** | Retell AI + Twilio SIP + Peoplefone | Eingehend (Kunde → System) | Pay-as-you-go (Retell) | Max 7 Fragen, Recording OFF, Sanitär-spezifisch |
| **SMS** | eCall.ch (Swiss Gateway) | Ausgehend (System → Kunde/Techniker) | CHF 0.10–0.14/SMS | Max 160 Zeichen (>160 = doppelter Preis), Alphanumerischer Sender max 11 Chars |
| **E-Mail** | Resend (send.flowsight.ch) | Ausgehend (System → alle) | Free Tier (100/Tag) | SPF/DKIM/DMARC aktiv, Sender = "{Firma} via FlowSight" |
| **Online-Formular** | Next.js (Wizard) | Eingehend (Kunde → System) | Inkl. Hosting | Foto-Upload, PLZ-Validierung, Notfall → Telefon-CTA |
| **Telegram** | CoreBot | Bidirektional (Founder ↔ System) | Gratis | GitHub Issues, Voice-Transkription, Foto-Attachments |
| **Leitstand (UI)** | Next.js PWA | Intern (Betrieb) | Inkl. Hosting | Desktop + Mobile, Offline-Shell, Auto-Update |

### API-Schnittstellen

| Provider | Endpoint | Auth | Zweck |
|----------|----------|------|-------|
| **Resend** | `POST https://api.resend.com/emails` | `RESEND_API_KEY` (Bearer) | E-Mail-Versand (alle Templates) |
| **eCall.ch** | `POST https://rest.ecall.ch/api/message` | Basic Auth (`ECALL_API_USERNAME` / `ECALL_API_PASSWORD`) | SMS-Versand (CH) |
| **Retell** | Webhook `POST /api/retell/webhook` | `x-retell-signature` (HMAC) | Voice-Analyse-Daten empfangen |
| **Retell** | `POST https://api.retellai.com/v2/create-agent` | `RETELL_API_KEY` (Bearer) | Agent-Provisioning |
| **Twilio** | SIP Trunk | Account SID + Auth Token | Voice-Routing (KEIN SMS) |
| **Telegram** | Webhook `POST /api/telegram/webhook` | `x-telegram-bot-api-secret-token` | CoreBot Nachrichten empfangen |
| **Sentry** | SDK (auto) | DSN | Fehler-Tracking (tags: tenant_id, case_id, area) |

---

## 4. Kommunikationsmatrix — Vollständig

### 4.1 Fall-Eingang (Intake)

| Trigger | Quelle | Empfänger | Kanal | Inhalt | Bedingung |
|---------|--------|-----------|-------|--------|-----------|
| Anruf bei Betriebsnummer | Endkunde | Voice Agent (Lisa) | Voice | Strukturierte Aufnahme: Kategorie, Ort, Dringlichkeit, Beschreibung | 24/7, max 7 Fragen |
| Voice-Fall erstellt | System | Ops-E-Mail (Inhaber) | E-Mail | Fall-Notification: Kategorie, Ort, Dringlichkeit, Beschreibung, Deep-Link | Immer |
| Voice-Fall erstellt | System | Endkunde (Melder) | SMS | Bestätigung + Korrekturlink (`/v/[id]?t=<token>`) | Telefonnummer vorhanden + SMS aktiv |
| Wizard-Formular abgeschickt | Endkunde | System | HTTP POST | Alle Felder + optional Foto | Pflicht: Strasse + PLZ + min. 1 Kontakt |
| Wizard-Fall erstellt | System | Ops-E-Mail (Inhaber) | E-Mail | Fall-Notification (identisch mit Voice) | Immer |
| Wizard-Fall erstellt | System | Endkunde (Melder) | E-Mail | Bestätigung: "Ihre Meldung wurde erfasst" + Referenznummer | E-Mail vorhanden |
| Wizard-Fall erstellt | System | Endkunde (Melder) | SMS | Bestätigung + Korrekturlink | Telefon vorhanden + SMS aktiv |

### 4.2 Fallbearbeitung (Leitstand — Interne Kommunikation)

| Trigger | Quelle | Empfänger | Kanal | Inhalt | Bedingung |
|---------|--------|-----------|-------|--------|-----------|
| Zuständiger hinzugefügt | Inhaber/Disponent | Neuer Zuständiger (Techniker) | E-Mail | "Dir wurde ein neuer Fall zugewiesen" + Fall-Details + Dashboard-Link | Manueller Klick auf "Benachrichtigen" im Leitstand. NUR neue Zuständige, nicht bestehende. |
| Termin gesetzt/geändert | Inhaber/Disponent | Alle Zuständigen | E-Mail (ICS) | Kalendereinladung (RFC 5545) mit Termin, Ort, Fall-Nr, Dashboard-Link | Manueller Klick auf "Termin versenden" im Leitstand |
| Termin gesetzt/geändert | Inhaber/Disponent | Endkunde (Melder) | E-Mail | "Ihr Termin am {Datum}, {Uhrzeit}" + Kategorie + Betriebstelefon | Manueller Klick + E-Mail vorhanden |
| Termin gesetzt/geändert | Inhaber/Disponent | Endkunde (Melder) | SMS | "Ihr Termin am {Tag} {Datum}, {Zeit}. Bei Fragen: {Tel}." | Manueller Klick + KEINE E-Mail + Telefon vorhanden + SMS aktiv |
| Termin in 24h (Erinnerung) | System (automatisch) | Endkunde (Melder) | SMS | "{Firma}: Erinnerung — Ihr Termin morgen um {Zeit}." | Termin in nächsten 24h + Admin hat Erinnerung in Einstellungen aktiviert + Telefon vorhanden |
| Status geändert | System | (Verlauf-Eintrag) | Leitstand UI | "Status: Neu → Geplant" (sichtbar im Verlauf) | Automatisch bei jeder Statusänderung. KEINE SMS/E-Mail an Kunden. |
| Felder aktualisiert | System | (Verlauf-Eintrag) | Leitstand UI | "Adresse aktualisiert" / "Priorität, Kategorie aktualisiert" | Automatisch. KEINE externe Benachrichtigung. |

### 4.3 Bewertung (Review Engine)

| Trigger | Quelle | Empfänger | Kanal | Inhalt | Bedingung |
|---------|--------|-----------|-------|--------|-----------|
| Bewertung angefragt | Inhaber/Disponent | Endkunde | E-Mail (primär) | "Wie war unser Service?" + Link zur Review Surface | Status = Erledigt, max 2 Anfragen, 7 Tage Cooldown |
| Bewertung angefragt | Inhaber/Disponent | Endkunde | SMS (Fallback) | Review-Link | Nur wenn KEINE E-Mail vorhanden + Telefon + SMS aktiv |
| Bewertung abgegeben | System | (Verlauf-Eintrag) | Leitstand UI | "Bewertung erhalten" + Sterne | Automatisch via Event-Tracking |

### 4.4 Trial-Lifecycle (Automatisiert)

| Trigger | Quelle | Empfänger | Kanal | Inhalt | Bedingung |
|---------|--------|-----------|-------|--------|-----------|
| Tag 0: Trial gestartet | System | Prospect (Inhaber) | E-Mail | Welcome-Mail + Zugangslink (OTP) + Testnummer | Automatisch via `provision_trial.mjs` |
| Tag 5: Wenig Aktivität | System | Prospect | E-Mail | Engagement-Nudge: "Probieren Sie einen Testanruf" | Cases < 3, unterdrückt wenn aktiv |
| Tag 7: Engagement-Check | System | (Intern) | DB (Snapshot) | Aktivitäts-Snapshot (Cases, Logins) | Immer (kein Versand) |
| Tag 10: Follow-up fällig | System | Founder | Telegram | "Follow-up fällig: {Prospect}" | Automatisch |
| Tag 13: Trial endet | System | Prospect | E-Mail | "Ihr Test endet morgen" | Automatisch |
| Tag 14: Entscheidung | System | (Intern) | DB | Status → decision_pending | Kein Auto-Offboard |
| Offboarding | Founder | Prospect | E-Mail | Offboarding-E-Mail | Manuell via `offboard_tenant.mjs` |

### 4.5 FlowSight Sales & Support

| Trigger | Quelle | Empfänger | Kanal | Inhalt | Bedingung |
|---------|--------|-----------|-------|--------|-----------|
| Anruf FlowSight-Nummer | Interessent | Lisa (Sales Agent) | Voice | Interest Capture: Name, Firma, Telefon, Interesse | 044 552 09 19 |
| Sales-Call beendet | System | Founder | E-Mail | Lead-Notification: Firma, Interesse-Level, Rückruf-Wunsch | Immer |
| Systemfehler (RED) | System | Founder | WhatsApp | Incident-Alert (throttled 15min) | Case-Creation oder E-Mail-Dispatch fehlgeschlagen |
| Täglicher Status | System | Founder | Telegram + E-Mail | Morning Report: 15 KPIs + Trial-Status + Health | Immer Telegram, E-Mail nur bei RED/YELLOW |

---

## 5. Kanal-Entscheidungslogik (Fallback-Kaskade)

Für **Endkunden-Kommunikation** gilt folgende Kaskade:

```
Hat Kunde E-Mail?
├── JA → E-Mail senden
│   └── Hat Kunde auch Telefon + SMS aktiv?
│       └── JA → zusätzlich SMS (bei Termin, Bestätigung)
│       └── NEIN → nur E-Mail
└── NEIN → Hat Kunde Telefon + SMS aktiv?
    ├── JA → SMS senden
    └── NEIN → Kein Versand möglich → Hinweis im Leitstand:
        "Keine Kontaktdaten für Benachrichtigung vorhanden"
```

Für **Mitarbeiter-Kommunikation** (Techniker/Zuständige):

```
Hat Mitarbeiter E-Mail in Staff-Tabelle?
├── JA → E-Mail senden (Zuweisung + ICS Termin)
└── NEIN → Kein Versand → Hinweis im Leitstand:
    "Keine E-Mail für {Name} hinterlegt"
```

**Wichtig:** Voice-Fälle haben typischerweise NUR Telefon (keine E-Mail). Daher:
- **Termin-Benachrichtigung → SMS** (nicht E-Mail)
- **Review-Anfrage → SMS** (Fallback aktiv)
- **Bestätigung → SMS** (bereits implementiert via postCallSms)

---

## 6. Sonderfälle & Edge Cases

### 6.1 Notfall-Kommunikation
- Voice Agent erkennt Notfall → Dringlichkeit = "notfall"
- Ops-E-Mail erhält Prefix "NOTFALL" im Betreff
- Im Leitstand: Rote Prioritäts-Markierung, zuoberst sortiert
- **Kein separater Notfall-Kanal** — gleiche Pipeline, höhere Sichtbarkeit

### 6.2 Korrektur durch Kunden (SMS-Link)
- Nach Fall-Erstellung erhält Kunde SMS mit Korrekturlink
- `/v/[caseId]?t=<HMAC-Token>` — kein Login nötig
- Kunde kann: Name, Adresse, Telefon, E-Mail korrigieren + Fotos hochladen
- HMAC-gesichert (kein Zugriff ohne gültigen Token)

### 6.3 Mehrere Zuständige
- Fall kann 1–N Zuständige haben (Multi-Select)
- Bei Zuweisung: NUR neue Zuständige werden benachrichtigt
- Bei Termin: ALLE Zuständigen erhalten ICS-Einladung
- Bei Termin-Änderung: Alle erhalten aktualisierte ICS (gleiche UID → Update im Kalender)

### 6.4 Techniker ohne E-Mail
- Kleinbetriebe haben evtl. Techniker ohne E-Mail-Adresse
- **Heute:** Kein Versand möglich → Hinweis im Leitstand
- **Phase 3 (Zukunft):** Techniker-Micro-Surface per SMS-Link (`/einsatz/[token]`) — kein Login, kein Account, HMAC-gesichert

### 6.5 Betrieb ohne SMS-Modul
- Einige Betriebe haben nur Wizard (kein Voice, kein SMS)
- Keine SMS-Benachrichtigungen möglich
- E-Mail = einziger Kanal zum Endkunden
- Review-Anfrage nur per E-Mail

### 6.6 Founder-Abwesenheit (Reise)
- Morning Report: Telegram + E-Mail (garantiert via Outlook Mobile)
- WhatsApp-Alerts: Optional (Sandbox)
- System läuft autonom (Lifecycle-Tick, Morning Report, alle Benachrichtigungen)
- Nur Offboarding = manuell (kein Auto-Offboard)

---

## 7. SMS-Templates (IST + SOLL)

### Aktuelle Templates (alle ≤ 160 Zeichen prüfen!)

| Template | Empfänger | Trigger | IST Chars | Beispiel |
|----------|-----------|---------|-----------|----------|
| Post-Call Bestätigung | Melder | Fall erstellt (Voice/Wizard) | ~200-250 | "{Sender}: Ihre Meldung ({Kat}) wurde aufgenommen. Name: {Name}. Stimmt alles? {URL}" |
| Termin-Benachrichtigung | Melder | Termin versenden (Leitstand) | ~80-100 | "{Sender}: Ihr Termin am Mi 18.03, 10:00–11:00. Bei Fragen: {Tel}." |
| Review-Anfrage | Melder | Review angefragt (Leitstand) | ~120-150 | "{Sender}: Wie war unser Service? Wir freuen uns über Ihre Bewertung: {URL}" |

**PROBLEM:** Post-Call SMS überschreitet 160 Zeichen → doppelte Kosten.

### Phase 2 Action: SMS-Audit
- Alle Templates auf ≤ 160 Zeichen kürzen
- Zeichenzähler als Dev-Tool einbauen
- eCall Enforcement: reject > 160 Zeichen serverseitig
- Kosten-Monitoring: Punkte pro Template tracken

---

## 8. E-Mail-Templates (IST)

| Template | Empfänger | Trigger | Sender | Format |
|----------|-----------|---------|--------|--------|
| Fall-Notification | Ops (Inhaber) | Fall erstellt | {Firma} via FlowSight | HTML (Gold-Theme) + Plain Text |
| Melder-Bestätigung | Endkunde | Fall erstellt (Wizard) | {Firma} via FlowSight | HTML (Clean White) |
| Zuweisung | Techniker | Zuständig geändert (manuell) | {Firma} via FlowSight | Plain Text |
| Termin-Bestätigung | Endkunde | Termin versenden (manuell) | {Firma} (kein FlowSight) | Plain Text |
| ICS Termin-Einladung | Techniker/Kalender | Termin versenden (manuell) | {Firma} | Plain Text + ICS Attachment |
| Review-Anfrage | Endkunde | Review angefragt (manuell) | {Firma} (kein FlowSight) | Plain Text |
| Welcome (Trial) | Prospect | Trial gestartet | {Firma} via FlowSight | Plain Text |
| Day-5 Nudge | Prospect | Lifecycle Tick (auto) | {Firma} via FlowSight | Plain Text |
| Day-13 Reminder | Prospect | Lifecycle Tick (auto) | {Firma} via FlowSight | Plain Text |
| Offboarding | Prospect | Manuell (offboard_tenant.mjs) | {Firma} via FlowSight | Plain Text |
| Sales Lead | Founder | Sales-Call beendet | FlowSight Sales | Plain Text |
| OTP Login-Code | Staff/Prospect | Login-Versuch | {Firma} via FlowSight | Plain Text (6-stelliger Code) |

### Identity Contract Compliance (R4)

| Empfänger | Sichtbarkeit "FlowSight" | Sender-Format |
|-----------|--------------------------|---------------|
| **Endkunde** | UNSICHTBAR | `{Firma} <noreply@send.flowsight.ch>` |
| **Techniker/Staff** | Via FlowSight (OK) | `{Firma} via FlowSight <noreply@send.flowsight.ch>` |
| **Prospect (Trial)** | Via FlowSight (OK) | `{Firma} via FlowSight <noreply@send.flowsight.ch>` |
| **Founder (Intern)** | FlowSight (OK) | `FlowSight Sales <noreply@send.flowsight.ch>` |

---

## 9. Kommunikationsfluss pro Falltyp (E2E)

### 9.1 Voice-Fall (Anruf → Erledigt → Bewertung)

```
1. Kunde ruft an → Voice Agent nimmt auf
2. → System erstellt Fall
3. → E-Mail an Inhaber (Fall-Notification)
4. → SMS an Kunde (Bestätigung + Korrekturlink)
5. Inhaber öffnet Leitstand → sichtet Fall
6. Inhaber weist Techniker zu → Klick "Benachrichtigen"
7. → E-Mail an Techniker (Zuweisung)
8. Inhaber setzt Termin → Klick "Termin versenden"
9. → ICS an Techniker (Kalendereinladung)
10. → SMS an Kunde (Termin-Bestätigung) ← KEIN E-Mail (Voice hat keine)
11. Techniker erledigt Einsatz → Status = Erledigt
12. Inhaber klickt "Bewertung anfragen"
13. → SMS an Kunde (Review-Link) ← KEIN E-Mail (Voice hat keine)
14. Kunde bewertet → Event im Verlauf
```

### 9.2 Wizard-Fall (Online-Formular → Erledigt → Bewertung)

```
1. Kunde füllt Formular aus → System erstellt Fall
2. → E-Mail an Inhaber (Fall-Notification)
3. → E-Mail an Kunde (Melder-Bestätigung)
4. → SMS an Kunde (Bestätigung + Korrekturlink)
5. Inhaber sichtet → weist zu → Klick "Benachrichtigen"
6. → E-Mail an Techniker (Zuweisung)
7. Inhaber setzt Termin → Klick "Termin versenden"
8. → ICS an Techniker (Kalendereinladung)
9. → E-Mail an Kunde (Termin-Bestätigung)
10. → SMS an Kunde (Termin-Bestätigung, zusätzlich)
11. Techniker erledigt → Status = Erledigt
12. Inhaber klickt "Bewertung anfragen"
13. → E-Mail an Kunde (Review-Link, primär)
14. Kunde bewertet → Event im Verlauf
```

### 9.3 Trial-Prospect (Onboarding → Entscheidung)

```
1. Founder provisioniert Trial → provision_trial.mjs
2. → E-Mail an Prospect (Welcome + OTP-Zugang + Testnummer)
3. Tag 0-2: Founder ruft an → First-Call-Moment (persönlich)
4. Tag 5: System prüft Aktivität
5. → E-Mail an Prospect (Nudge, wenn < 3 Cases)
6. Tag 10: System meldet Follow-up
7. → Telegram an Founder ("Follow-up fällig")
8. Tag 13: Trial endet bald
9. → E-Mail an Prospect ("Ihr Test endet morgen")
10. Tag 14: Founder entscheidet (Convert / Offboard)
```

---

## 10. Abgleich mit Zielarchitektur

### Konsistent (Code = Zielarchitektur)

| Aspekt | Zielarchitektur §| Status |
|--------|-----------------|--------|
| eCall.ch = einziger SMS-Provider (CH) | §12 | KONSISTENT |
| Twilio = nur Voice/SIP, KEIN SMS | §12 | KONSISTENT |
| 2-Tier Sender (Alphanumerisch → Servicenummer) | §12 | KONSISTENT |
| Sender = "{Firma} via FlowSight" (E-Mail) | §12, Identity Contract E4 | KONSISTENT |
| FlowSight unsichtbar für Endkunden | Identity Contract R4 | KONSISTENT |
| Recording OFF (Voice) | §3 | KONSISTENT |
| Custom OTP Login (statt Magic-Link) | §11 | KONSISTENT |
| RLS + Tenant Isolation | §5, §18 | KONSISTENT |

### Lücken (Zielarchitektur beschreibt es, Code fehlt noch)

| Aspekt | Zielarchitektur §| Gap |
|--------|-----------------|-----|
| **SMS ≤ 160 Zeichen Enforcement** | §12 | Post-Call SMS überschreitet 160 Chars. Kein Server-Reject. |
| **Termin per SMS bei Voice-Fällen** | (implizit) | Termin-Benachrichtigung an Melder geht NUR per E-Mail. Voice-Fälle ohne E-Mail → kein Termin-Versand an Kunde. **FB10 = Phase 2 Fix.** |
| **Techniker-Micro-Surface** | §7 (Phase 3.4 im Plan) | SMS-Link `/einsatz/[token]` für Techniker ohne Login. Noch nicht gebaut. |
| **Einsatz-SMS an Techniker** | (geparkt) | Abhängig von Micro-Surface. Heute nur E-Mail. |
| **24h Termin-Erinnerung** | Backlog N15 | Definiert, nicht implementiert. |
| **Tages-Briefing SMS** | (geparkt) | Für Betriebe ab 10+ MA sinnvoll. Noch nicht gebaut. |
| **Zustellberichte (eCall)** | §12 | eCall liefert Zustellberichte. Werden nicht ausgewertet. |
| **Kunden-Historie** | Backlog N16 | Kunde sieht keine eigenen Fälle. Nur Korrekturlink. |

### Empfehlung: Zielarchitektur-Update nötig

1. **§12 ergänzen:** Kanal-Fallback-Logik (E-Mail → SMS → Hinweis) explizit dokumentieren
2. **§12 ergänzen:** SMS-Templates mit Zeichenzählung als Pflicht
3. **Neuer §:** Benachrichtigungs-Matrix als Referenz (dieses Dokument)
4. **§7 schärfen:** Termin-SMS an Melder als Phase 2 Deliverable

---

## 11. Phase 2 Deliverables (priorisiert)

| # | Deliverable | Priorität | Abhängigkeit |
|---|-------------|-----------|--------------|
| **P2.1** | SMS-Audit: Alle Templates auf ≤ 160 Zeichen | HOCH | — |
| **P2.2** | Termin per SMS an Melder (FB10: Voice-Fälle ohne E-Mail) | HOCH | — |
| **P2.3** | Kanal-Fallback im Leitstand: Hinweis wenn kein Kontakt für Versand | HOCH | — |
| **P2.4** | E-Mail-Templates Audit (Identity Contract, Handwerker-Wording) | MITTEL | — |
| **P2.5** | eCall Enforcement: Server-Reject bei > 160 Zeichen | MITTEL | P2.1 |
| **P2.6** | Zustellberichte (eCall) auswerten + loggen | NIEDRIG | — |
| **P2.7** | Anti-Spam: SPF/DKIM/DMARC Monitoring + Zustellbarkeits-Check | NIEDRIG | — |

---

## 12. Offene Entscheidungen

| # | Frage | Entscheidung (18.03.) |
|---|-------|----------------------|
| **K1** | PWA Push bei Notfall? | **JA.** Inhaber erhält Push-Notification bei Notfall-Eingang. |
| **K2** | Techniker SMS bei Zuweisung? | **NEIN.** E-Mail reicht. Kein SMS bei Zuweisung. |
| **K3** | Post-Call SMS auf ≤ 160 kürzen? | **JA**, wenn High-End-Qualität erhalten bleibt. Template-Optimierung mit maximalem Effekt in minimalem Platz. |
| **K4** | SMS an Kunde bei Status-Änderung? | **NEIN** bei Status-Änderungen. **JA** nur bei: (1) Meldungseingang (Bestätigung), (2) Termin-Erinnerung 24h vorher (wenn Admin in Einstellungen aktiviert), (3) Termin-Bestätigung, (4) Google-Bewertungsanfrage. |
| **K5** | Voice Agent: Nicht-Service-Anrufe (Familie, Lieferanten, Bestandskunden...)? | **Phase 2 (Minimal):** Lisa nimmt Nachricht auf → E-Mail an Inhaber. **Phase 3 (Voll):** Rezeptionistin-Modell mit Nachricht-Bereich im Leitstand + Warm Transfer auf Inhaber-Handy. Siehe §K5 Detail. |

### K5 Detail: Lisa als Rezeptionistin (Skalierbar)

**Problem:** In der Realität rufen auf einer Handwerkernummer nicht nur Kunden mit Schäden an, sondern auch: Familie ("Wann holst du die Kinder ab?"), Lieferanten ("Lieferung morgen 8 Uhr"), Versicherungen, Bestandskunden (Follow-up), andere Betriebe, Falschanrufer. Lisa muss ALLE Anrufe professionell behandeln.

**Zielbild (Phase 3):**
```
Anruf → Lisa erkennt Intent
├── Service-Anfrage → INTAKE (wie heute, strukturierte Aufnahme → Fall)
├── Sonstiges → NACHRICHT ("Ich richte das aus. Wer soll zurückrufen?")
│   └── Erfasst: Name, Telefon, Nachricht, Dringlichkeit
│   └── → E-Mail + optional SMS an Inhaber
│   └── → Leitstand: eigener Bereich "Nachrichten"
└── "Verbinden bitte" → WARM TRANSFER auf Inhaber-Handy
    └── Falls nicht erreichbar → NACHRICHT (Fallback)
```

**Skalierung:** 2 MA (Meister bekommt SMS "Deine Frau hat angerufen") → 30 MA (Büro-Team sieht Nachrichten im Leitstand).

---

## Referenzen

| Dokument | Rolle |
|----------|-------|
| `docs/architecture/zielarchitektur.md` | Zielarchitektur (§12 = SMS, §11 = OTP, §5 = Tenant) |
| `docs/architecture/contracts/case_contract.md` | Fall-Datenmodell (Kontaktfelder, Source) |
| `docs/architecture/env_vars.md` | Alle Provider-Credentials (SSOT) |
| `docs/redesign/identity_contract.md` | Branding-Regeln (R1-R7, E1-E5) |
| `docs/redesign/leitstand/plan_Leitsystem.md` | Phase 2 Tasks (§2.1-2.5) |
| `docs/compliance/data_processing.md` | Subprocessors + Retention |
| `docs/gtm/operating_model.md` | Trial-Lifecycle Kommunikation |
| `src/web/src/lib/email/resend.ts` | Alle E-Mail-Templates (Code) |
| `src/web/src/lib/sms/` | Alle SMS-Templates (Code) |
| `src/web/app/api/retell/webhook/route.ts` | Voice-Intake + Post-Call Notifications |
