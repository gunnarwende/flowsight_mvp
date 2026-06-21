# OPS Redesign — Produktbild & Zielbild

> **Status:** SSOT-Arbeitsdokument | **Stand:** 2026-03-11 | **Owner:** Founder + CC
> **Kontext:** Gold-Contact-Redesign, 4-Wochen-Sprint (12.03.–10.04.2026)

---

## 1. Executive Summary

**OPS ist die fallzentrierte Betriebssteuerung für Schweizer Sanitär- und Heizungsbetriebe.**

Es organisiert den Lebenszyklus von Fällen — vom Moment wo ein Anruf reinkommt bis zur Google-Bewertung nach dem Einsatz. OPS ist das Werkzeug, das die Zettelwirtschaft, die Magnettafel, die Exceltabelle und das Notizbuch des Meisters ersetzt.

**OPS ist nicht:**
- Ein CRM (keine Kundenhistorie, keine Pipeline, keine Segmentierung)
- Ein Kalender (fallbezogene Terminführung ja, Hauptkalender nein)
- Ein ERP (keine Buchhaltung, keine Offerten, keine Materiallogistik)
- Ein Helpdesk (keine SLAs, keine Ticket-Queues, keine Auto-Zuweisung)
- Ein Paralleltool (OPS klinkt sich in bestehende Werkzeuge ein, ersetzt sie nicht)

**Strategische Bedeutung:** OPS ist das Produkt, das der Betrieb jeden Tag nutzt. Voice Agent, Wizard, E-Mails, SMS — alles ist Intake. OPS ist die Oberfläche, in der der Wert sichtbar wird. Wenn OPS nicht gut ist, ist das Produkt nicht gut — egal wie perfekt Lisa am Telefon ist.

---

## 2. Produktthese

### Ein Produkt. Keine Produktlinien.

FlowSight verkauft **ein Produkt** für CHF 299/Monat. Es gibt kein "OPS Light" für Meister-Betriebe und kein "OPS Pro" für grössere Betriebe. Es gibt ein OPS, das sich über Rollen, Konfiguration und Nutzungstiefe an unterschiedliche Betriebe anpasst.

### Fallzentrierung als Ordnungsprinzip

Das zentrale Atom in OPS ist **der Fall.** Nicht der Kunde, nicht der Zeitslot, nicht der Task. Ein Fall hat einen klaren Lebenszyklus:

```
Eingang → Triage → Termin → Einsatz → Abschluss → Review
```

Alles in OPS dient diesem Zyklus. Wenn eine Funktion den Fall-Lebenszyklus nicht unterstützt, gehört sie nicht in OPS.

### Progressive Nutzungstiefe statt Produktsplitting

| Betriebsgrösse | Was sie nutzen | Was sie (noch) nicht brauchen |
|----------------|---------------|-------------------------------|
| **2-3 Personen (Meister allein)** | Puls, Fall, Basistermine, Review-Auslösung | Einsatzplan (es gibt nur einen Techniker), Analytics |
| **5-8 Personen (kleines Team)** | + Mitarbeiterzuweisung, + Einsatzplan, + Techniker-Micro-Surface | Analytics (noch überschaubar) |
| **15-30 Personen (mittlerer Betrieb)** | + Zahlen/Trends, + Filterlogik nach Mitarbeiter, + Konfiguration Termindauern | — |

Das Produkt ist dasselbe. Die Konfiguration bestimmt, was sichtbar und relevant ist. Ein 2-Mann-Betrieb ohne Mitarbeiter in der Staff-Tabelle sieht keinen Einsatzplan — nicht weil er gesperrt ist, sondern weil es nichts zu zeigen gibt.

---

## 3. Goldstandard-Anspruch

### Was "high-end" bedeutet

High-end bedeutet nicht "viele Features." High-end bedeutet:

1. **OPS denkt vor.** Die Disponentin muss nicht suchen, filtern oder sich erinnern. OPS zeigt ihr, was Aufmerksamkeit braucht. Überfällige Fälle steigen nach oben. Notfälle sind sofort sichtbar. Erledigte Fälle mit ausstehender Review-Anfrage werden vorgeschlagen.

2. **OPS fühlt sich an wie meins.** Der Betrieb sieht seinen Namen, seine Initialen, seine Fälle. Kein "FlowSight"-Branding. Der Spiegel-Effekt aus Gold Contact durchzieht die gesamte Oberfläche.

3. **OPS funktioniert immer.** Keine "Bald"-Platzhalter. Keine leeren Screens. Keine toten Links. Alles was sichtbar ist, funktioniert. Was nicht fertig ist, ist nicht sichtbar.

### Was "brutal gut" heisst

Die Disponentin öffnet OPS morgens um 07:30 und weiss in 10 Sekunden, was ihr Tag ist. Sie sieht neue Fälle, überfällige Fälle, heutige Termine. Sie klickt auf einen Notfall, ruft an, weist zu, legt einen Termin an. 90 Sekunden. Kein Suchen, kein Navigieren, kein Nachdenken über die Software.

### Was nicht akzeptabel ist

- Ein Dashboard, das zählt statt steuert ("Total Fälle: 12" ohne Handlungsimpuls)
- Sichtbare Plattform-Branding in der Betriebsansicht (FS-Logo, "FlowSight" im Tab)
- Rollen ohne Konsequenz (Prospect sieht interne Notizen und Kontaktdaten)
- Terminversand ohne Empfängerlogik (ICS geht nur ans Büro, nicht an Techniker und Melder)
- Platzhalter-Navigation ("Anrufe — Bald", "Reviews — Bald", "Einstellungen — Bald")

---

## 4. Rollenmodell

### Primärrolle: Disponentin / Bürokraft

Sie verbringt den ganzen Tag in OPS. Alles was schlecht ist, trifft sie zuerst. Alles was gut ist, macht ihren Tag besser. OPS wird primär für sie gebaut.

### Alle Rollen im Überblick

| Rolle | OPS-Zugang | Was sie sieht | Was sie tut | Surface |
|-------|-----------|---------------|-------------|---------|
| **Disponentin / Büro** | Voll | Puls, Fall, Einsatzplan, Einstellungen | Triage, Zuweisen, Termin anlegen, Status ändern, Review auslösen | OPS Desktop |
| **Meister / Inhaber** | Voll | Puls, Fall, Einsatzplan, Zahlen, Einstellungen | Quick-Check, schwierige Fälle, Zahlen, Mitarbeiter konfigurieren | OPS Desktop + Mobile |
| **Techniker / Monteur** | **Kein OPS-Login** | Seinen nächsten Einsatz | Status melden, Foto, "Erledigt" | Micro-Surface via SMS-Link |
| **Prospect (Trial)** | Reduziert | Puls (read-only), Fall (nur Status) | Status ändern, Review anfragen | OPS Desktop (reduziert) |
| **Founder / Admin** | Superset | Alles, tenant-übergreifend | Debugging, Onboarding, Support | OPS Desktop (Admin-Modus) |
| **Melder** | **Kein Login** | Seine Angaben | Prüfen, korrigieren, Foto ergänzen | Micro-Surface via SMS-Link |

### Entscheidung: Techniker bekommt kein OPS-Login

Der Techniker steht auf der Baustelle mit dreckigen Händen. Er braucht keine Sidebar, keine Filter, keine KPIs. Er braucht einen SMS-Link der ihm zeigt: Adresse, Problembeschreibung, Navi-Button, "Erledigt"-Button, Foto-Upload. Authentifiziert via HMAC-Token im Link (identisches Pattern wie Review-Link und Melder-Surface).

Vorteile:
- Kein User-Account-Management, kein Passwort-Reset, keine Rollenkonfiguration
- 2 Taps statt Navigation durch eine App
- Funktioniert sofort, keine Onboarding-Hürde für den Techniker
- Architektonisch identisch mit Melder-Micro-Surface (ein Pattern, zwei Anwendungen)

### Prospect-Sichtbarkeit (Trial)

| Bereich | Prospect sieht | Prospect sieht NICHT |
|---------|---------------|---------------------|
| Puls | Fälle (read-only), Status-Badge | Zuweisungen, Überfällig-Logik |
| Fall | Status, Beschreibung, Kategorie, Adresse, Timeline | Kontaktdaten (PII), interne Notizen, Anhänge |
| Einsatzplan | Nicht sichtbar | — |
| Zahlen | Nicht sichtbar | — |
| Einstellungen | Nicht sichtbar | — |

---

## 5. Bereichsmodell

OPS hat **vier Kernbereiche** und einen **Konfigurationsbereich.** Dazu kommen **zwei Micro-Surfaces ausserhalb von OPS.**

### 5.1 Der Puls

**Zweck:** Priorisierte Handlungsliste. "Was braucht jetzt Aufmerksamkeit?"

**Primärer Nutzer:** Disponentin (ganztags), Meister (Quick-Check)

**Kernjobs:**
- Morgens: Was ist über Nacht reingekommen?
- Tagsüber: Was muss noch bearbeitet werden?
- Abends: Ist alles versorgt?

**Informationshierarchie (nicht KPI-Karten, sondern Sektionen):**
1. **Achtung** — Notfälle offen + Überfällige (> 24h ohne Statuswechsel)
2. **Heute** — Termine heute + Neue Fälle von heute
3. **In Arbeit** — Kontaktiert, geplant, mit Zuweisungen
4. **Abschluss** — Erledigte Fälle ohne Review-Anfrage

**Was hier NICHT reingehört:**
- Charts, Trends, Monatszahlen (→ Die Zahlen)
- Fallbearbeitung im Detail (→ Der Fall)
- Konfiguration (→ Einstellungen)

**Verhältnis zum heutigen Cases-View:** Der Puls ersetzt die heutige Falltabelle mit KPI-Karten als Startseite. Dieselben Daten, aber statt chronologischer Tabelle eine nach operativer Dringlichkeit sortierte Ansicht.

### 5.2 Der Fall

**Zweck:** Alles zu einem Fall an einem Ort. Die operative Tiefenansicht.

**Primärer Nutzer:** Disponentin (Hauptarbeit), Meister (Überprüfung bei schwierigen Fällen)

**Kernjobs:**
- Triage: Dringlichkeit setzen, kategorisieren
- Zuweisen: Techniker auswählen
- Terminieren: Termin anlegen, bestätigen, versenden
- Status führen: kontaktiert → geplant → erledigt
- Abschliessen: Review auslösen

**Informationshierarchie im Goldstandard:**

**Oben (sofort scanbar):**
- Was? (Kategorie + Kurzbeschreibung)
- Wo? (Adresse + Maps-Link)
- Wie dringend? (Urgency — visuell prominent)
- Wer? (Zugewiesener Mitarbeiter)
- Wann? (Nächster Termin)

**Mitte (Arbeitsbereich):**
- Termin-Abschnitt (eigener Block, nicht Formularfeld — siehe §6)
- Status + Quick-Actions

**Seite/Unten (Kontext):**
- Timeline / Verlauf
- Kontaktdaten des Melders (rollenbasiert: nicht für Prospects)
- Anhänge (rollenbasiert: nicht für Prospects)
- Interne Notizen (rollenbasiert: nicht für Prospects)

**Was hier NICHT reingehört:**
- Fälle anderer Tenants
- Finanzdaten, Offerten, Rechnungen
- Kundenstamm-Informationen

### 5.3 Der Einsatzplan

**Zweck:** Cross-Case Tages-/Wochenansicht aller Termine, gruppiert nach Mitarbeiter.

**Primärer Nutzer:** Disponentin (Einsätze überblicken), Meister (Tagesplanung prüfen)

**Kernjobs:**
- Morgens: Sind alle Einsätze verteilt?
- Bei Neueingang: Wer hat morgen noch Kapazität?
- Abends: Was steht morgen an?

**Darstellungsform:** Liste, kein Kalender-Widget.

```
── Heute, Di 18.03. ─────────────────────────
Ramon D.
  09:00  Müller, Seestr. 12, Oberrieden — Heizung  ●
  14:00  Kunz, Dorfstr. 8, Thalwil — Nachkontrolle  ●

Stefan M.
  08:30  Meyer, Bahnhofstr. 5, Horgen — Sanitär  ●
  11:00  (frei)

── Morgen, Mi 19.03. ─────────────────────────
Ramon D.
  10:00  Weber, Kirchweg 3, Wädenswil — Besichtigung  ○
```

● = bestätigt, ○ = vorgeschlagen. Tap auf Eintrag → öffnet den Fall.

**Warum Liste statt Kalender:** Ein Zeitraster suggeriert stündliche Präzision. Sanitäreinsätze sind nicht stundengenau. "Morgens" oder "Nachmittags" ist oft realistischer als "09:00-10:00." Die Listenform ist ehrlicher und operativ nützlicher.

**Was hier NICHT reingehört:**
- Drag-and-Drop Umplanung (zu komplex, zu wenig ROI)
- Private Termine der Mitarbeiter (OPS kennt nur OPS-Termine)
- Routenoptimierung (der Meister weiss wo seine Leute hinfahren)
- Freie Zeitfenster (OPS weiss nicht, was zwischen Einsätzen passiert)

**Voraussetzung:** `staff`-Tabelle und `appointments`-Tabelle müssen existieren. Ohne diese gibt es nichts zu zeigen. Für einen Meister-Betrieb ohne Mitarbeiter in der Staff-Tabelle ist dieser Bereich leer/unsichtbar.

### 5.4 Die Zahlen

**Zweck:** Wochen-/Monatstrends. Reflexion, nicht operative Steuerung.

**Primärer Nutzer:** Inhaber / Meister. Nicht die Disponentin.

**Kernjobs:**
- Wöchentlich/Monatlich: Läuft der Betrieb besser?
- Trends erkennen: Werden wir schneller? Mehr Fälle? Bessere Bewertungen?

**Relevante Kennzahlen (Details in §7):**
- Fälle pro Woche (Trend)
- Reaktionszeit (Eingang → Erstkontakt)
- Abschlusszeit (Eingang → Erledigt)
- Review-Quote + Durchschnittsbewertung
- Fälle nach Kategorie / Quelle / Mitarbeiter

**Was hier NICHT reingehört:**
- Echtzeit-Daten (→ der Puls)
- Finanz-KPIs (nicht OPS' Job)
- Prognosen / Forecasts (zu wenig Daten)
- Branchenvergleiche (keine Benchmark-Daten)

**Timing:** Sekundär. Nicht Day-1-Pflicht. Wertschöpfend ab Monat 2. Kann mit 3 einfachen Charts starten.

### 5.5 Einstellungen

**Zweck:** Tenant-Konfiguration. Mitarbeiter, Firmendaten, Termin-Defaults, Benachrichtigungspräferenzen.

**Primärer Nutzer:** Meister / Inhaber (initial, dann selten)

**Inhalte:**
- Mitarbeiter anlegen / bearbeiten / deaktivieren
- Standard-Termindauern pro Typ (Besichtigung, Einsatz, Nachkontrolle)
- Melder-Benachrichtigungen (an/aus, Kanal)
- Business-Kalender-E-Mail
- Google-Review-Link
- Firmendaten (für Branding)

**Was hier NICHT reingehört:**
- Technische Einstellungen (API-Keys, Webhooks → Admin-Ebene)
- Benutzerverwaltung / Rollen (macht der Founder beim Onboarding, Phase 1)

### 5.6 Micro-Surfaces (ausserhalb von OPS)

Zwei Oberflächen leben ausserhalb von OPS. Kein Login, kein Dashboard, kein Shell. Tokenbasierte Einmal-Seiten via SMS-Link.

**Techniker-Surface** (`/einsatz/[token]`)
- Zeigt: Adresse, Problembeschreibung, Kategorie, Dringlichkeit
- Aktionen: Navigation starten (1 Tap → Maps), Status melden ("Bin da" / "Erledigt"), Foto machen
- Authentifizierung: HMAC-Token im Link
- Trigger: SMS nach Terminzuweisung

**Melder-Surface** (`/meldung/[token]`)
- Zeigt: Erfasste Angaben (Name, Adresse, Kontakt, Beschreibung)
- Aktionen: Korrigieren, Foto ergänzen
- Authentifizierung: HMAC-Token im Link
- Trigger: SMS nach Fallerfassung (bereits teilweise vorhanden)

Beide Surfaces teilen dasselbe technische Pattern. Ein Codebase-Modul, zwei Konfigurationen.

---

## 6. Termin-/Kalenderlogik

### Grundprinzip

OPS ist die **fallbezogene Terminführungsoberfläche.** Termine werden im Fall erstellt, im Einsatzplan überblickt, per ICS in den bestehenden Kalender des Betriebs gepusht.

OPS ist **nicht** der Hauptkalender. Der Betrieb öffnet morgens seinen Kalender (Outlook, Google, Wandtafel) — und dort stehen die Termine, die OPS erzeugt hat.

### Termine als eigene Objekte

**Entscheidung:** Termine werden eine eigene Tabelle (`appointments`), nicht ein Feld auf der Cases-Tabelle. Ein Fall kann mehrere Termine haben (Besichtigung, Einsatz, Nachkontrolle). Ein Termin hat eine eigene Lebenszeit.

**Datenmodell (Kern):**

| Feld | Typ | Zweck |
|------|-----|-------|
| `id` | uuid | PK |
| `tenant_id` | uuid FK | Tenant-Isolation |
| `case_id` | uuid FK | Fallbezug |
| `staff_id` | uuid FK (nullable) | Zugewiesener Mitarbeiter |
| `type` | text | besichtigung / einsatz / nachkontrolle |
| `status` | text | vorgeschlagen / bestaetigt / durchgefuehrt / abgesagt |
| `starts_at` | timestamptz | Terminzeitpunkt |
| `duration_min` | int | Dauer (Default je nach Typ) |
| `location_text` | text (nullable) | Override für Adresse (z.B. "Zugang Hintereingang") |
| `notes` | text (nullable) | Kurzbeschrieb für Techniker |
| `ics_uid` | text | RFC 5545 UID (stabil, für Updates) |
| `ics_sequence` | int | Zähler für ICS-Updates |
| `sent_to_staff` | timestamptz (nullable) | Wann ICS an Techniker geschickt |
| `sent_to_reporter` | timestamptz (nullable) | Wann Bestätigung an Melder geschickt |

### Termin-Statuslogik

```
vorgeschlagen ──→ bestaetigt ──→ durchgefuehrt
      │                │
      └──→ abgesagt ←──┘
```

- **vorgeschlagen:** Termin erstellt, noch nicht versendet. Büro kann intern absprechen.
- **bestaetigt:** Sendetrigger. ICS geht an Techniker + Büro + Melder.
- **durchgefuehrt:** Termin ist gelaufen. Case-Status kann auf "done" wechseln.
- **abgesagt:** ICS-Cancel wird versendet (METHOD:CANCEL, gleiche UID). Neuer Termin kann angelegt werden.

### ICS als Integrationslayer

**Entscheidung:** ICS-Dateien sind der Kalenderanschluss. Keine API-Integration (Google Calendar API, Microsoft Graph) in dieser Phase. Eine saubere ICS wird von Google, Outlook und Apple Calendar automatisch erkannt und angeboten.

**ICS-Anforderungen Goldstandard:**

| Aspekt | Heute | Goldstandard |
|--------|-------|-------------|
| UID | Zufällig pro Send | Stabil pro Appointment (`ics_uid`) |
| SEQUENCE | Fehlt | Inkrementiert bei Updates |
| METHOD | Nur REQUEST | REQUEST + CANCEL |
| DURATION | Hardcoded 60 Min | Aus `duration_min` |
| LOCATION | Fehlt | Aus Case-Adresse oder `location_text` |
| ATTENDEE | Fehlt | `staff.calendar_email` |
| SUMMARY | "FlowSight Termin - Fall FS-0001" | "[Dörfler AG] Einsatz - Seestr. 12, Oberrieden" |
| DESCRIPTION | Fehlt | Kategorie + Dringlichkeit + Kurzbeschrieb |

### Empfängermatrix

| Empfänger | Wann | Was | Kanal |
|-----------|------|-----|-------|
| Zugewiesener Techniker | Bestätigung | ICS-Invite | E-Mail an `staff.calendar_email` |
| Büro / Geschäfts-Inbox | Bestätigung | ICS-Invite (Kopie) | E-Mail an Business-Kalender |
| Melder | Bestätigung | Terminbestätigung | E-Mail mit ICS oder SMS-Kurztext |
| Techniker | Absage | ICS-Cancel | E-Mail |
| Melder | Absage | Absage-Nachricht | E-Mail oder SMS |
| Melder | 24h vorher | Reminder | SMS oder E-Mail |

**Melder-Kanal-Logik:** E-Mail vorhanden → E-Mail (reicher, ICS-fähig). Nur Telefon → SMS (Kurztext). Beides → E-Mail.

### Reminder an Melder

24h vor Termin: SMS/E-Mail an den Melder.

> "Weinberger AG: Morgen, Di 18.03. um 09:00 Uhr kommt unser Monteur Ramon D. zu Ihnen. Bei Fragen: 044 123 45 67."

Warum wichtig: Reduziert Leerfahrten (Melder nicht zuhause), erhöht Professionalitätswahrnehmung. Kein Sanitärbetrieb in der Schweiz bietet das heute systematisch.

### Case-Status-Kopplung

- Appointment bestätigt → `case.status = "scheduled"` (automatisch)
- Appointment durchgeführt → Hint: "Alle Termine erledigt. Fall abschliessen?"
- Appointment abgesagt, kein anderer offen → `case.status` zurück auf `"contacted"`

### Architektur-Vorbereitung für spätere 2-Wege-Sync

| Design-Entscheidung | Warum zukunftssicher |
|---------------------|---------------------|
| `ics_uid` auf Appointments | Externe Kalender-Events können über UID gemappt werden |
| `calendar_email` auf Staff | Wird bei OAuth durch Token ersetzt, Feld bleibt Identifier |
| Appointments als eigene Tabelle | Kalenderansicht hat saubere Daten, kein Refactoring nötig |
| Termin-Status-Modell | Umplanung per SMS-Link konzeptuell vorbereitet |

---

## 7. KPIs / Zahlen / Steuerung

### Zwei Modi, nicht einer

**Operativ (täglich, im Puls):** Keine Zähler. Sondern Zustände die Handlung erfordern.

| Signal | Relevanz | Wo |
|--------|----------|-----|
| "2 Fälle überfällig" (> 24h ohne Statuswechsel) | Hoch | Puls, Sektion "Achtung" |
| "1 Notfall offen seit 45 Min" | Hoch | Puls, prominent mit Zeitstempel |
| "3 Termine heute" | Mittel | Puls + Einsatzplan |
| "2 Reviews ausstehend" | Mittel | Puls, Sektion "Abschluss" |

Das sind keine KPI-Karten. Das sind **Handlungsimpulse.**

**Reflektiv (wöchentlich/monatlich, in Die Zahlen):** Trends, nicht Snapshots.

| Kennzahl | Darstellung | Relevanz |
|----------|-------------|----------|
| Fälle pro Woche (Balken, 8 Wochen) | Trend | Alle Betriebe |
| Reaktionszeit: Eingang → Erstkontakt (Median) | Zahl + Trendpfeil | Alle Betriebe |
| Abschlusszeit: Eingang → Erledigt (Median) | Zahl + Trend | Ab 5+ Personen |
| Review-Quote + Durchschnittsbewertung | Zahl + Sterne | Alle Betriebe |
| Fälle nach Kategorie | Top-3 Liste | Alle Betriebe |
| Fälle pro Mitarbeiter | Balken | Ab 3+ Techniker |
| Fälle nach Quelle (Voice/Web/Manuell) | Torte | Ab 5+ Personen |
| Überfällig-Quote (> 48h) | Prozent + Trend | Ab 5+ Personen |

### Was Dashboard-Deko wäre

- Echtzeit-Zähler ("Live: 12 offene Fälle") — die Disponentin weiss das
- Heatmaps (Fälle nach PLZ auf Karte) — visuell, operativ nutzlos
- Prognosen ("Nächste Woche erwarten wir 18 Fälle") — nicht genug Daten
- Branchenvergleich ("Schneller als 70% der Betriebe") — keine Benchmark-Daten
- Funnel-Visualisierung (Eingang → Erledigt) — Ticketsystem-Denke

### Anti-BI-Drift

OPS ist ein Steuerungswerkzeug, kein Reporting-Tool. Maximal 8 Kennzahlen. Eine Bildschirmseite. Keine Drill-Downs, keine exportierbaren Reports, keine Pivot-Tabellen.

---

## 8. Branding / Identität / Spiegel-Effekt

### Grundprinzip

FlowSight wird im Betriebskontext unsichtbare Infrastruktur. Der Betrieb sieht **sein System**, nicht unsere Software. Wie Stripe bei Zahlungen: Der Kunde sieht den Shop, nicht Stripe.

**Das ist keine Option, sondern Pflicht.** Gold Contact basiert auf dem Spiegel-Effekt ("Schau, wie dein Betrieb damit aussieht"). Wenn OPS "FlowSight" zeigt, ist der Spiegel kaputt.

### Tenant-Identitäts-Elemente

| Element | Heute | Goldstandard |
|---------|-------|-------------|
| Sidebar-Logo | "FS" + "FlowSight" | Tenant-Initialen + Tenant-Name |
| Case-IDs | FS-0001 | [Prefix]-0001 (z.B. DA-0001, WA-0001) |
| ICS-Betreff | "FlowSight Termin - Fall FS-0001" | "[Firma] Einsatz - Adresse" |
| E-Mail-Absender | FlowSight | "[Firma] via FlowSight" (Absendername) |
| SMS-Absender | Konfigurierbar | ✅ Existiert (modules.sms_sender_name) |
| Welcome-Page | "FlowSight Trial" | "[Firma] — Ihre digitale Einsatzzentrale" |
| Browser-Tab | "FlowSight OPS" | "[Firma] OPS" |
| Footer-Kontakt | "Gunnar Wende — 044 552 09 19" | Weg. Kein Founder-Branding in der Betriebsansicht. |

### Skalierbarkeit

Die Tenant-Identität muss **maschinell** durchlaufen, nicht manuell konfiguriert werden. `provision_trial.mjs` generiert automatisch:
- Initialen (erste 2 Buchstaben des Firmennamens)
- Case-ID-Prefix (konfigurierbar, Default = Initialen)
- ICS-Absendername
- Browser-Tab-Titel

Optional (Setup): Akzentfarbe aus Preset-Palette (6-8 Farbtöne, Default Amber), Logo-Upload.

### Sprache ist Branche, nicht SaaS

| Nicht sagen | Stattdessen |
|-------------|-------------|
| Ticket | Fall |
| Agent | Mitarbeiter |
| Pipeline | Fälle |
| Dashboard | Puls / Leitstand / Einsatzplan |
| User | Nutzer / Mitarbeiter |
| Onboarding | Einrichtung |

---

## 9. Produktgrenzen / Anti-Drift

### Was nicht in OPS gehört

| Nicht in OPS | Warum | Drift-Risiko |
|-------------|-------|--------------|
| Kundendatenbank / CRM | OPS kennt Melder, nicht Kunden. CRM = anderer Lebenszyklus. | Hoch |
| Buchhaltung / Offerten / Rechnungen | Betriebe haben Bexio, Abacus, etc. | Hoch |
| Materiallogistik / Lager | Nische, hohe Komplexität, kein Kern-WOW | Mittel |
| HR / Arbeitszeiterfassung | Staff = Konfiguration, nicht HR | Mittel |
| Vollständiger Kalender | OPS = fallbezogene Terminführung, nicht Kalender-App | Hoch |
| Chat / In-App Messaging | Betriebe telefonieren. Punkt. | Mittel |
| Native Mobile App | PWA reicht. Native = doppelter Wartungsaufwand. | Hoch |
| Automatische Einsatzplanung | Disposition ist persönlich, nicht algorithmisch | Mittel |
| 2-Wege Kalender-Sync | 10x Komplexität. ICS reicht als Integrationslayer. | Hoch |

### Anti-Drift-Regeln

1. **Feature-Test:** "Unterstützt das den Fall-Lebenszyklus (Eingang → Review)?" Wenn nein → nicht in OPS.
2. **Paralleltool-Test:** "Muss der Betrieb jetzt OPS UND ein anderes Tool für dieselbe Aufgabe nutzen?" Wenn ja → Integrationslayer bauen (ICS, SMS), nicht OPS erweitern.
3. **Komplexitäts-Test:** "Braucht das ein 5-Mann-Betrieb täglich?" Wenn nein → frühestens Phase 2.
4. **Würde-ich-das-meiner-Mutter-zeigen-Test:** Wenn es erklärt werden muss, ist es zu komplex.

### Die Grenze

OPS endet dort, wo der Fall-Lebenszyklus endet. Der Fall endet nach der Google-Bewertung. Was danach kommt (Kundenbeziehung pflegen, Folgeaufträge, Upselling) ist nicht OPS.

---

## 10. Architektur- und Umsetzungsfolgen

### Festgezurrte Entscheidungen

| # | Entscheidung | Konsequenz |
|---|-------------|-----------|
| 1 | **Appointments = eigene Tabelle** | Migration von `cases.scheduled_at`. Neues CRUD-API. Termin-UI im Fall-Detail. |
| 2 | **Staff = eigene Tabelle** | Mitarbeiter-Dropdown statt Freitext. Einsatzplan möglich. Techniker-SMS-Empfänger. |
| 3 | **ICS = Integrationslayer** | ICS-Builder v2 mit UID/SEQUENCE/CANCEL. Keine Google/Outlook API. |
| 4 | **Tenant-Branding maschinell** | Case-ID-Prefix, Tab-Titel, Sidebar-Name, ICS-Subject aus Tenant-Config. |
| 5 | **Tenant-Isolation durchziehen** | `resolveTenantScope()` in Cases-Page + Case-Detail einbauen. Kein `getServiceClient()` für User-Facing Queries. |
| 6 | **Rollenbasierte Sichtbarkeit** | CaseDetailForm: Prospect sieht nur Status/Beschreibung/Timeline. API enforced + UI filtered. |
| 7 | **Puls ersetzt KPI+Tabelle** | Cases-Page umbauen: Priorisierte Sektionen statt chronologischer Tabelle. |
| 8 | **Keine "Bald"-Nav-Punkte** | Navigation: Puls — Einsatzplan — Zahlen — Einstellungen. Alles sichtbar = funktionsfähig. |
| 9 | **Techniker-Surface = Micro, nicht OPS** | Eigene Route `/einsatz/[token]`, kein Auth-Flow, HMAC-basiert. |

### Datenmodell-Änderungen

```
Neu:    appointments (→ §6)
Neu:    staff (id, tenant_id, name, role, phone, email, calendar_email, is_active, sort_order)
Ändern: cases.scheduled_at → deprecated, berechnet aus appointments
Ändern: cases.assignee_text → Fallback, primär staff_id FK
Neu:    tenants.modules.appointments (JSON: default_duration, notify_reporter, etc.)
Neu:    tenants.modules.case_id_prefix (text, Default: erste 2 Buchstaben)
```

### Relevante SSOT-Blöcke

| Dokument | Was aktualisiert werden muss |
|----------|----------------------------|
| `docs/architecture/contracts/case_contract.md` | appointments-Relation, scheduled_at deprecated |
| `docs/architecture/env_vars.md` | Kein neuer Env Var nötig (alles in DB/modules) |
| `docs/runbooks/provisioning_prospect.md` | Staff-Setup, Appointments-Config, Branding-Felder |
| `docs/Ticketlist.md` | Tasks für Appointments, Staff, ICS v2, Puls-UI, Branding |

---

## 11. Offene Entscheidungen

### Noch nicht entschieden

| # | Frage | Optionen | Wann klären |
|---|-------|----------|-------------|
| 1 | **Akzentfarbe pro Tenant?** | (a) Amber für alle, (b) Preset-Palette wählbar, (c) Logo-basiert automatisch | Vor Weinberger-Dry-Run |
| 2 | **Case-ID-Prefix konfigurierbar?** | (a) Automatisch aus Firmennamen, (b) Manuell wählbar beim Setup | Vor erstem Trial |
| 3 | **Einsatzplan: Tage- oder Wochenansicht als Default?** | (a) Heute + Morgen, (b) Ganze Woche | Wenn Staff-Tabelle steht |
| 4 | **Melder-Terminbestätigung: immer oder konfigurierbar?** | (a) Immer bei Bestätigung, (b) Tenant-Setting | Vor erstem Live-Termin |
| 5 | **Techniker-Surface: separate Route oder Teil der Melder-Surface?** | (a) `/einsatz/[token]` eigene Route, (b) Generische `/s/[token]` Micro-Surface mit Typ-Parameter | Bei Implementierung |
| 6 | **Überfällig-Schwelle: 24h fest oder konfigurierbar?** | (a) 24h für alle, (b) Tenant-Setting | Erfahrungswert nach 5 Trials |
| 7 | **Zahlen-Bereich: Ab wann sichtbar?** | (a) Immer (auch wenn wenig Daten), (b) Erst ab X Fällen | Erfahrungswert |
| 8 | **Prospect: Welcome-Page als Einstieg behalten?** | (a) Ja, weiterhin separate Welcome-Page, (b) Direkt in den Puls mit Onboarding-Hinweis | Vor Weinberger-Dry-Run |

### Bewusst vertagt

| Thema | Warum vertagt | Wann relevant |
|-------|--------------|---------------|
| 2-Wege Kalender-Sync | ICS reicht. API-Integration = Komplexitätssprung. | Wenn 5+ Betriebe explizit danach fragen |
| Mitarbeiter-Logins | Staff = Konfiguration, nicht Users. Login kommt mit Techniker-App. | Wenn Techniker-Surface v2 kommt |
| Offline-Fähigkeit | PWA-Grundstruktur reicht. Echte Offline = ServiceWorker-Komplexität. | Wenn Techniker auf Baustellen kein Netz haben |
| Kundendatenbank | OPS kennt Melder, nicht Kunden. CRM-Drift vermeiden. | Frühestens Kunde 20+ |
| Automatisierte Zuweisung | Disposition ist persönlich. Algorithmus kommt nie oder sehr spät. | Frühestens 30+ Personen-Betriebe |

---

## 12. Schlussfazit

OPS wird zur **fallzentrierten Betriebssteuerung**, gebaut für die Disponentin, nützlich für den Meister, unsichtbar gebrandet als FlowSight. Ein Produkt, das sich über Rollen und Konfiguration an 2-Mann- und 30-Mann-Betriebe gleichermassen anpasst, ohne sich zu spalten.

**Fünf Kernbereiche:**
- **Puls** (Was braucht Aufmerksamkeit?) — die Startseite
- **Fall** (Alles zu einem Fall) — die Tiefenansicht
- **Einsatzplan** (Wer geht wohin?) — die Querschnittsansicht
- **Zahlen** (Wie läuft der Betrieb?) — die Reflexionsansicht
- **Einstellungen** (Wie ist der Betrieb konfiguriert?) — selten, aber notwendig

Plus zwei **Micro-Surfaces** ausserhalb von OPS (Techniker + Melder).

### Goldstandard-Check

Woran wir erkennen, dass OPS angekommen ist:

> Wenn die Disponentin "unser System" sagt statt "die Software die wir benutzen" — dann hat OPS den Sprung von Tool zu Identität geschafft.

Das passiert durch drei Dinge:
1. **Es sieht aus wie meins** (Tenant-Branding durchgängig)
2. **Es weiss was ich brauche** (Puls mit operativer Priorisierung)
3. **Es macht meinen Betrieb sichtbar besser** (Zahlen + Reviews + professionelle Terminführung)
