# Outlook-Kalender Onboarding — FlowSight

> **Typ:** Runbook (operativ) | **Stand:** 2026-03-20
> **Verwandte Dokumente:**
> - Technischer Plan + Phasen: [`plan_kalender_integration.md`](../redesign/leitstand/plan_kalender_integration.md)
> - Architektur-Entscheidungen + Session-Log: [`kalender_integration_outlook_implementation_log.md`](../redesign/leitstand/kalender_integration_outlook_implementation_log.md)
> - Terminführung Produktbild: [`leitstand.md §6`](../redesign/leitstand/leitstand.md)

## Zweck

Dieses Runbook beschreibt den **operativen Onboarding-Ablauf** für die Outlook-Kalenderintegration — sowohl für den Founder-Testbetrieb als auch für echte Kundenbetriebe.

Es ist **kein** Architektur- oder Implementierungsdokument. Für technische Details → siehe verlinkte Dokumente oben.

---

## Produktgrundsatz

FlowSight ist das führende Arbeitswerkzeug. Outlook ist angebundene Kalender-Infrastruktur im Hintergrund.

**Konkret:**
- Büro/Dispo darf Termine nicht manuell doppelt in Outlook nachpflegen müssen
- Techniker-Verfügbarkeit muss in FlowSight sichtbar sein
- Kollisionen zwischen internem Termin und Outlook-Belegung müssen erkennbar sein

**Nicht akzeptabel:** Doppelpflege, parallele Disposition in zwei Tools, unklare Führung.

**Konsequenz für Write-back:** Reine Read-Only-Integration (Phase 1) ist ein bewusster Zwischenzustand. Für jeden Betrieb, der Outlook aktiv im Alltag nutzt, ist Write-back (Phase 2) **mittelfristig Pflicht** — sonst entsteht genau die Doppelpflege, die der Produktgrundsatz verbietet. Phase 1 genügt nur, wenn der Betrieb Outlook kaum aktiv nutzt oder explizit nur mit FlowSight-Terminen arbeiten will.

---

## Technische Kurzreferenz (für Onboarding)

> Vollständige technische Details: [`kalender_integration_outlook_implementation_log.md`](../redesign/leitstand/kalender_integration_outlook_implementation_log.md)

| Aspekt | Entscheidung |
|--------|-------------|
| **Verbindungsmodell** | Tenant-weiter Admin-Consent (1× pro Betrieb) |
| **Kalender-Mapping** | `staff.email` = Outlook-Adresse (1:1) |
| **Microsoft API** | `POST /me/calendar/getSchedule` (Graph API) |
| **OAuth Scopes** | `Calendars.Read` (Phase 1), + `Calendars.ReadWrite` (Phase 2) |
| **Token-Speicherung** | `tenants.modules.calendar_*` (verschlüsselt, App-Layer) |
| **Caching** | 15 Min Server-side Cache für FreeBusy-Daten |
| **Fallback** | Ohne Outlook-Verbindung → nur interne `appointments`-Tabelle |

### API-Routen (geplant)

| Route | Zweck |
|-------|-------|
| `GET /api/ops/calendar/connect` | OAuth-Redirect → Microsoft Consent Screen |
| `GET /api/ops/calendar/callback` | OAuth-Callback → Token speichern |
| `GET /api/ops/calendar/freebusy` | FreeBusy-Abruf für UI (cached) |
| `GET /api/ops/appointments/check-collision` | Erweitert: intern + Outlook-Kollision |

---

## Voraussetzungen

### Technisch
- Microsoft 365 / Outlook im Betrieb vorhanden
- Microsoft Admin / Inhaber verfügbar
- FlowSight-Tenant existiert, Staff-Daten angelegt
- `staff.email` pro Mitarbeiter korrekt und = Outlook-Adresse

### Organisatorisch
- Klar, wer Admin/Inhaber ist und wer Microsoft-Consent freigeben kann
- Klar, wer Termine disponiert und welche Mitarbeiter termingebunden arbeiten
- Klar, ob persönliche Kalender oder zentrale Office-Kalender genutzt werden

### Produktseitig
- Leitstand / Terminvergabe aktiv
- Interne `appointments`-Logik + Collision Check funktionsfähig

---

## Onboarding-Ablauf für echte Betriebe

## Schritt 1 — Discovery vor dem Setup

Ziel:
Verstehen, wie der Betrieb heute Termine organisiert.

Zu klären:
- nutzt der Betrieb Microsoft 365 / Outlook?
- gibt es persönliche Kalender pro Techniker?
- disponiert das Büro Termine zentral?
- arbeitet der Betrieb mit einzelnen Mitarbeiterkalendern oder eher improvisiert?
- sind die Mitarbeiter-E-Mail-Adressen sauber gepflegt?

Ergebnis von Schritt 1:
- Entscheidung, ob Outlook-Onboarding direkt möglich ist
- Entscheidung, welche Mitarbeiter in Scope sind

---

## Schritt 2 — Microsoft-Verantwortlichen identifizieren

Ziel:
Sicherstellen, dass die Person mit den nötigen Rechten verfügbar ist.

Typisch:
- Inhaber
- IT-Verantwortlicher
- Microsoft-Admin
- externer IT-Partner

Zu klären:
- wer kann Microsoft-Consent freigeben?
- wer kennt die Microsoft-Umgebung?
- wer kann bei Bedarf Rollen / Berechtigungen anpassen?

---

## Schritt 3 — Microsoft-Verbindung herstellen

Ziel: Der Betrieb verbindet Microsoft 365 einmal zentral mit FlowSight.

### Konkreter UI-Flow

1. **Admin öffnet Einstellungen** im Leitstand (`/ops/settings`, vgl. `leitstand.md §5.5`)
2. **Klickt "Microsoft Outlook verbinden"** — Button im Bereich "Kalender"
3. **Redirect zu Microsoft:** FlowSight leitet an `login.microsoftonline.com` weiter (OAuth 2.0 Authorization Code Flow)
   - Scope: `Calendars.Read` (Phase 1)
   - Die Microsoft-Consent-Seite zeigt: "FlowSight möchte Kalenderverfügbarkeit lesen"
4. **Admin meldet sich mit seinem Microsoft-365-Konto an** und bestätigt
5. **Microsoft leitet zurück** an `/api/ops/calendar/callback`
   - FlowSight empfängt Authorization Code
   - Tauscht Code gegen Access Token + Refresh Token
   - Verschlüsselt Tokens (App-Layer, AES-256) und speichert in `tenants.modules`
6. **Erfolgssignal:** Admin sieht in den Einstellungen:
   - Grüner Status "Microsoft Outlook verbunden"
   - Verbundenes Konto (E-Mail-Adresse)
   - Datum der Verbindung
   - Button "Verbindung trennen"

### Wichtig
- Nicht jeder Techniker muss selbst etwas verbinden
- Admin-Consent gilt tenant-weit: `getSchedule` kann FreeBusy für alle `staff.email`-Adressen im selben Microsoft-365-Tenant lesen
- Bei Betrieben mit externem IT-Partner: ggf. muss dieser den Consent freigeben

---

## Schritt 4 — Mitarbeiter-Mapping prüfen

Ziel:
Sicherstellen, dass `staff.email` zu den echten Outlook-Adressen passt.

Prüfen pro relevantem Mitarbeiter:
- existiert der Mitarbeiter in `staff`
- ist `staff.email` korrekt
- entspricht diese Adresse dem echten Microsoft-/Outlook-Konto
- soll dieser Mitarbeiter in der Terminlogik berücksichtigt werden

Wichtig:
Hier entstehen in der Praxis oft die meisten Probleme.
Nicht wegen Technik, sondern wegen unsauberer Stammdaten.

---

## Schritt 5 — Free/Busy-Test

Ziel:
Prüfen, ob Outlook-Verfügbarkeit in FlowSight sichtbar ist.

Test:
- im Outlook des Mitarbeiters einen Testtermin blockieren
- in FlowSight den Terminpicker / Leitstand öffnen
- prüfen, ob die belegte Zeit korrekt als nicht frei erscheint

Bestanden, wenn:
- belegte Zeit in FlowSight sichtbar ist
- freie Zeit weiterhin korrekt planbar ist
- keine falsche Freimeldung entsteht

---

## Schritt 6 — Konfliktprüfung testen

Ziel:
Sicherstellen, dass FlowSight vor Terminüberschneidungen schützt.

Testfälle:
1. interner Termin kollidiert mit internem Termin
2. Outlook-Belegung kollidiert mit geplanter Terminzeit
3. interner Termin + Outlook-Termin gleichzeitig

Bestanden, wenn:
- Kollisionen im Terminprozess sichtbar werden
- Dispo/Büro nicht blind in blockierte Zeiten plant

---

## Schritt 7 — E2E-Terminprozess prüfen

Ziel:
Sicherstellen, dass die reale Arbeitslogik funktioniert.

Beispiel:
- Büro öffnet Fall
- weist Techniker zu
- sieht Verfügbarkeit
- wählt freie Zeit
- verschickt Termin an Kunden

Bestanden, wenn:
- FlowSight als führende Oberfläche genügt
- die gewählte Zeit fachlich plausibel ist
- kein manuelles Nebenher-Arbeiten nötig ist

---

## Schritt 8 — Write-back-Bedarf klären

Ziel: Festlegen, ob Phase 1 (Read-Only) für diesen Betrieb ausreicht oder Write-back priorisiert werden muss.

### Entscheidungsfrage
Nutzt der Betrieb Outlook aktiv im Alltag als Kalender (Techniker schauen morgens rein, Büro plant dort)?

| Antwort | Konsequenz |
|---------|-----------|
| **Ja, Outlook ist aktiver Arbeitskalender** | Write-back ist **Pflicht**, nicht nice-to-have. Ohne Write-back entsteht exakt die Doppelpflege, die der Produktgrundsatz verbietet. Phase 1 ist dann nur ein Zwischenzustand. |
| **Nein, Betrieb hat keinen aktiven Kalender** | Phase 1 genügt dauerhaft. FlowSight IST der Kalender. |
| **Gemischt (Inhaber ja, Techniker nein)** | Write-back für Inhaber/Büro priorisieren. Techniker erhalten weiterhin ICS per E-Mail. |

### Write-back Scope (Phase 2)
Wenn in FlowSight ein Termin erstellt, verschoben oder abgesagt wird:
- Graph API: `POST /me/events` (erstellen), `PATCH /me/events/{id}` (ändern), `DELETE` (absagen)
- Scope-Erweiterung: `Calendars.ReadWrite` (erfordert neuen Consent)
- Mapping: `appointments.ics_uid` ↔ Outlook Event-ID

---

## Schritt 9 — Go-Live-Freigabe

Ein Betrieb ist erst dann go-live-fähig, wenn alle Kernpunkte bestanden sind.

---

## Go-Live-Checkliste

### Fachlich
- [ ] relevante Mitarbeiter sind in `staff` korrekt angelegt
- [ ] `staff.email` ist pro Mitarbeiter korrekt
- [ ] Dispo/Büro versteht die Terminlogik
- [ ] FlowSight ist als führendes Werkzeug definiert

### Technisch
- [ ] Microsoft-Verbindung hergestellt
- [ ] Consent erfolgreich
- [ ] Free/Busy-Abruf funktioniert
- [ ] interne Collision Checks funktionieren
- [ ] externe Outlook-Kollisionen sind sichtbar
- [ ] Fallback ohne Outlook ist definiert

### E2E
- [ ] blockierter Outlook-Slot wird in FlowSight korrekt erkannt
- [ ] freie Zeit wird korrekt als frei angezeigt
- [ ] Termin kann aus dem Fall heraus sauber geplant werden
- [ ] Kunde kann Termin erhalten
- [ ] kein Blindflug in belegte Zeiten

### Betriebslogik
- [ ] Rollen sind klar
- [ ] Verantwortlichkeit bei Fehlern ist klar
- [ ] Sonderfälle sind dokumentiert
- [ ] Betrieb weiß, was FlowSight kann und was Outlook im Hintergrund macht

---

## Rollenbild im Betrieb

### Inhaber / Admin
- gibt Microsoft-Verbindung frei
- bestätigt Berechtigungen
- verantwortet Grundsetup

### Büro / Disposition
- plant Termine im Fall
- nutzt Verfügbarkeitsanzeige
- prüft Konflikte
- soll nicht separat in Outlook disponieren müssen

### Techniker
- wird disponiert
- seine Outlook-Verfügbarkeit soll berücksichtigbar sein
- soll möglichst keine Zusatzarbeit wegen FlowSight haben

### FlowSight / Implementierung
- sorgt für Verbindung
- Mapping
- Test
- Abnahme
- Troubleshooting
- spätere Weiterentwicklung Richtung Write-back

---

## Real-Life-Sonderfälle

### Fall 1 — Betrieb hat Outlook, aber chaotische Stammdaten
Problem:
- `staff.email` stimmt nicht
- Mitarbeiter haben mehrere Adressen
- Kalender laufen über Fremdkonten

Folge:
- Mapping-Probleme
- falsche oder fehlende Free/Busy-Daten

### Fall 2 — Nicht jeder Techniker hat ein eigenes sauberes Microsoft-Konto
Problem:
- ein Teil der Mannschaft arbeitet ohne echten persönlichen Kalender

Folge:
- nicht alle Mitarbeiter können gleich behandelt werden
- ggf. Mischbetrieb aus Outlook + nur interne appointments

### Fall 3 — Betrieb arbeitet eher zentral über Büro statt persönliche Kalender
Problem:
- Kalenderlogik ist nicht personenscharf

Folge:
- zusätzliche Produktentscheidung nötig:
  - Personenkalender
  - Office-Kalender
  - Mischmodell

### Fall 4 — Outlook wird stark genutzt, aber FlowSight soll führend sein
Problem:
- Risiko der Doppelpflege

Folge:
- Write-back nach Outlook wird schnell geschäftskritisch

---

## Token-Lifecycle & Betriebssicherheit

### Token-Lebensdauer
- **Access Token:** ~1h (Microsoft Standard)
- **Refresh Token:** 90 Tage (bei Inaktivität), unbegrenzt bei regelmässiger Nutzung
- **Token-Refresh:** Automatisch bei jedem FreeBusy-Abruf — wenn Access Token abgelaufen, nutzt die App den Refresh Token für ein neues Paar

### Was passiert bei Token-Ablauf?

| Szenario | Auswirkung | Erkennung | Aktion |
|----------|-----------|-----------|--------|
| Access Token abgelaufen | Keiner — automatischer Refresh | Transparent | Automatisch |
| Refresh Token abgelaufen (90 Tage Inaktivität) | FreeBusy-Abruf schlägt fehl | Morning Report → RED | Admin muss neu verbinden |
| Microsoft-Passwort geändert | Alle Tokens invalidiert | FreeBusy-Abruf schlägt 401 | Admin muss neu verbinden |
| Consent widerrufen (IT-Admin) | Alle Tokens invalidiert | FreeBusy-Abruf schlägt 403 | Admin muss neu consenten |

### Monitoring-Integration

Der **Morning Report** (GH Actions, täglich 07:30 UTC, vgl. `docs/runbooks/reise_checklist.md`) prüft bereits Health-Checks. Kalender-Health wird analog integriert:

- **Health-Check:** `GET /api/health` bekommt zusätzlichen Check: "Kann Token für Tenants mit `calendar_provider=microsoft` refresht werden?"
- **Severity:** Token-Fehler = **RED** (Betrieb verliert Outlook-Sichtbarkeit ohne Warnung)
- **Alert:** Telegram + E-Mail an Founder
- **Meldung:** "Outlook-Verbindung für [Betrieb] unterbrochen. Admin muss unter Einstellungen → Kalender neu verbinden."

### Reconnect-Flow
Identisch mit Schritt 3 (gleicher OAuth-Flow). Der Admin klickt erneut "Microsoft Outlook verbinden" — bestehende Tokens werden überschrieben.

---

## Troubleshooting-Checkliste

Wenn etwas nicht funktioniert, diese Reihenfolge prüfen:

1. ist der Betrieb überhaupt verbunden?
2. wurde der Microsoft-Consent erfolgreich erteilt?
3. stimmt `staff.email` mit der echten Outlook-Adresse überein?
4. hat der Mitarbeiter wirklich einen Microsoft-/Outlook-Kalender?
5. liegt die Belegung wirklich im richtigen Zeitzonenfenster?
6. ist der Mitarbeiter im Scope der Terminprüfung?
7. greift nur interner Fallback statt echter Outlook-Abfrage?
8. ist das Problem fachlich oder technisch?

---

## Abnahmekriterien für Phase 1

Phase 1 gilt als erfolgreich, wenn:

- Outlook Free/Busy für relevante Mitarbeiter gelesen werden kann
- diese Verfügbarkeit im Leitstand / Terminprozess sichtbar ist
- Kollisionen mit Outlook-Belegungen erkannt werden
- der Betrieb Termine verlässlicher planen kann als zuvor
- kein zusätzlicher Dispo-Blindflug entsteht

---

## Abnahmekriterien für Phase 2

Phase 2 gilt als erfolgreich, wenn zusätzlich:

- FlowSight-Termine automatisch nach Outlook geschrieben werden
- Änderungen und Löschungen sauber synchronisiert werden
- keine manuelle Doppelpflege mehr nötig ist
- FlowSight im Betriebsalltag als einzige aktive Arbeitsoberfläche genügt

---

## Doku-Pflicht während der Umsetzung

Während der Implementierung müssen laufend dokumentiert werden:

- Architekturentscheidungen
- Consent-Modell
- Token-/Security-Entscheidungen
- Mapping-Regeln
- Sonderfälle aus echten Betrieben
- Go-Live-Erfahrungen
- Onboarding-Dauer
- typische Fehlerbilder
- notwendige Support-Texte / Hilfehinweise

---

## Offene strategische Fragen

| Frage | Kontext | Entscheidung fällig |
|-------|---------|-------------------|
| Admin-Consent vs. Self-Connect | Reicht Admin-Consent langfristig, oder brauchen grössere Betriebe (15+ MA) Self-Connect pro Techniker? | Nach ersten 3 Kunden evaluieren |
| Google Workspace | Gleiche Architektur (`calendar_provider=google`), aber eigene App Registration + Scopes | Wenn erster Kunde ohne M365 |
| Write-back Timing | Ab wann wird Write-back Standard-Bestandteil statt Phase 2? | Nach Founder-Test (Schritt 8) |
