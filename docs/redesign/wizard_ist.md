# Wizard IST-Audit — Schriftliche Annahme

> **Strang:** Wizard · **Phase:** IST-Audit
> **Datum:** 2026-03-12
> **Methode:** Code-Audit aller beteiligten Dateien, kein Hörensagen
> **Scope:** Website-Wizard (`/kunden/{slug}/meldung`) + API-Pipeline + Nachgelagerte Prozesse
> **Bezugsdokumente:** identity_contract.md, prospect_journey.md, case_contract.md

---

## 1. System-Überblick

Der Wizard ist die **schriftliche Annahme** — das Pendant zur Voice-Annahme (Lisa).
Er besteht aus vier Code-Einheiten:

| Einheit | Datei | Zeilen | Verantwortung |
|---------|-------|--------|---------------|
| Page Entry | `app/kunden/[slug]/meldung/page.tsx` | 122 | SSG, Kategorie-Ableitung, Props-Mapping |
| Form | `app/kunden/[slug]/meldung/CustomerWizardForm.tsx` | 795 | 3-Schritt-Formular, Photo-Upload, Success-Screen |
| API | `app/api/cases/route.ts` | 357 | Validation, Tenant-Lookup, DB-Insert, Events, E-Mail, SMS |
| Verify/Korrektur | `app/verify/[caseId]/CorrectionForm.tsx` | 489 | Post-Submit-Korrektur (Adresse + Fotos) |

**Zusätzlich relevant:**
- `src/lib/email/resend.ts` — Ops-Benachrichtigung + Reporter-Bestätigung
- `src/lib/sms/postCallSms.ts` — SMS mit Korrektur-Link (shared mit Voice)
- `src/lib/customers/registry.ts` — Tenant-Daten (build-time, TypeScript)
- `src/lib/tenants/` — Supabase-Lookup (runtime)

---

## 2. Ablauf Schritt für Schritt

### 2.1 Einstieg

Der Endkunde landet auf `/kunden/{slug}/meldung`. Die Seite ist **SSG** (Static Site Generation) — zur Build-Zeit generiert aus der TypeScript Customer Registry (`getCustomer(slug)`).

**Was passiert:** `page.tsx` liest den Tenant aus der Registry, leitet daraus 3 dynamische + 3 fixe Kategorien ab (via `deriveWizardCategories`), übergibt alles als Props an `CustomerWizardForm`.

**Tenant-Daten am Einstieg:**
- `companyName`, `companySlug`, `phone`, `phoneRaw` → aus Registry
- `emergency` → optionaler Notfall-Block (enabled/phone/label)
- `accent` → Brand Color (Fallback `#2b6cb0`)
- `categories` → 3 dynamische (aus `services[]`) + 3 fixe (Allgemein/Angebot/Kontakt)
- `backUrl` → `/kunden/{slug}`

### 2.2 Schritt 1 — Anliegen (Kategorie + Dringlichkeit)

**Obere Reihe:** 3 dynamische Problem-Kategorien, abgeleitet aus den Services des Tenants.
Algorithmus: `CASE_POOL` (10 Einträge) wird per `triggers[]` gegen die Service-Slugs gematcht. Erste 3 Treffer gewinnen. Falls <3 Treffer: Auffüllung aus Pool.

**Untere Reihe:** 3 fixe Kategorien: Allgemein, Angebot, Kontakt.

**Dringlichkeit:** 3 Stufen — Notfall (rot), Dringend (amber), Normal (blau). Rein visuell, keine Konsequenz für Routing oder Eskalation.

**Validation:** `step1Valid = category !== "" && urgency !== ""` — beide Pflicht.

**Beobachtungen:**
- Kein Notfall-Schnellweg. Endkunde wählt "Notfall" + Kategorie → geht weiter zu Schritt 2 (Adresse). Kein sofortiger Hinweis "Rufen Sie an: XXX" bis ganz am Ende.
- Kategorie-Labels können zwischen Wizard und Voice divergieren (Voice: 6 hardcoded im Retell Agent, Wizard: 3+3 dynamisch aus Services).
- Kein Tooltip, kein Hilfetext jenseits des `hint`-Einzeilers.

### 2.3 Schritt 2 — Adresse (Strasse, Nr., PLZ, Ort)

**Felder:** Strasse (required), Hausnummer (required), PLZ (required), Ort (required).

**Validation:** `step2Valid = street.trim().length > 0 && houseNumber.trim().length > 0 && plz.trim().length > 0 && city.trim().length > 0` — reine Nicht-Leer-Prüfung.

**Beobachtungen:**
- **Keine PLZ-Validierung.** PLZ "9999" wird akzeptiert. Kein Check gegen `maxLength={5}` (Schweizer PLZ = 4 Stellen, Feld erlaubt 5).
- **Keine PLZ→Ort-Autokorrektur.** Voice hat `PLZ_CITY_MAP` (25 Einträge), der Wizard hat nichts. Endkunde tippt "8800" und muss "Thalwil" selbst eingeben.
- **Kein Service-Area-Check.** Endkunde kann PLZ "3000" eingeben (Bern) für einen Betrieb in Oberrieden. Kein Hinweis, keine Warnung.
- **Strasse + Hausnummer sind Pflicht** — strenger als Voice (wo beides optional ist). Korrekt für schriftliche Meldung, aber Asymmetrie.

### 2.4 Schritt 3 — Kontakt + Beschreibung + Fotos

**Kontaktdaten:** Name (required), Telefon (optional), E-Mail (optional) — aber `hasContact = phone || email`, mindestens eines muss ausgefüllt sein (UI-Level). API validiert dasselbe.

**Beschreibung:** Freitext, required. Kein Min/Max-Hinweis. `placeholder="Beschreiben Sie Ihr Anliegen kurz…"`

**Fotos:** Optional, max 5 Dateien à 10 MB. `accept="image/*,video/*"`. Files werden im State gehalten (`pendingFiles[]`) und erst nach erfolgreichem Submit hochgeladen.

**Beobachtungen:**
- **Keine Telefon-Validierung.** "+41 79 123 45 67" und "abc" werden gleich behandelt.
- **Keine E-Mail-Validierung.** `type="email"` verlässt sich auf Browser-Validierung (minimal).
- **Foto-Upload-Timing:** Files werden erst NACH Submit hochgeladen (Zeile 148–152). Wenn der Tab geschlossen wird, gehen Fotos verloren — kein Hinweis.
- **Kein Video-Thumbnail.** Videos zeigen keinen Preview im Pending-State.
- **Name-Feld hat kein Label-Star.** UI zeigt "Ihr Name *" aber Telefon/E-Mail zeigen kein "(mind. eines)" oder ähnlich.

### 2.5 Submit

`POST /api/cases` mit `source: "wizard"`, `tenant_slug`, allen Feldern.

**API-Pipeline:**

1. **Validation** — `validateBody()`: required fields + source-spezifisch (wizard braucht `street` + `house_number`).
2. **Tenant-Auflösung** — `tenant_slug` → Supabase-Lookup → `tenant_id`. Fallback: `FALLBACK_TENANT_ID`.
3. **Module-Check** — `hasModule(tenantId, "website_wizard")` muss true sein.
4. **DB-Insert** — `cases`-Tabelle. Returns `id`, `seq_number`, `verify_token`.
5. **Case-Event** — `case_created` mit `source: "Website-Formular"`.
6. **Reporter-Bestätigung** — E-Mail an `contact_email` (falls vorhanden).
7. **Ops-Benachrichtigung** — E-Mail an Betrieb (Resend).
8. **SMS** — Bestätigungs-SMS an `contact_phone` mit Korrektur-Link (falls Telefon vorhanden + `sms`-Modul aktiv).
9. **Alerts** — RED-Alert via Telegram bei E-Mail-Fehler.

### 2.6 Success-Screen

Zeigt: Checkmark, "Meldung aufgenommen", Fall-Nr. (gekürzt), Kategorie, Dringlichkeit, Ort.

**Parallel:** Photo-Upload läuft im Hintergrund, Fortschritt als Liste (uploading/done/error).

**CTAs:** "Zurück zur Website" + "Neue Meldung".

**Notfall-Hinweis:** NUR sichtbar wenn `urgency === "notfall" && emergency?.enabled`. Zeigt dann Notrufnummer.

**Beobachtungen:**
- **"Wir melden uns schnellstmöglich"** — sagt nicht WER sich meldet. FlowSight? Der Betrieb? Verletzt Identity Contract R4.
- **Kein nächster Schritt erklärt.** "SMS kommt gleich" oder "Bestätigung per E-Mail" — nichts davon.
- **Kein Zeitrahmen.** "Schnellstmöglich" ist für einen Notfall zu vage, für Normal zu verbindlich.
- **Fall-Nr. ist UUID-Fragment** (`id.slice(0, 8) + "…"`), nicht die lesbare `FS-0029`. Obwohl `seq_number` in der API-Response existiert.

### 2.7 Post-Submit: SMS + Verify-Seite

**SMS:** Wenn Telefon vorhanden → SMS via Twilio mit Korrektur-Link `/v/{caseId}?t={token}`.
SMS-Text: `"{senderName}: Ihre Meldung ({category}) wurde aufgenommen. Erfasste Adresse: {street} {nr}, {plz} {city}. Stimmt alles? Haben Sie Fotos?"` + Link.

**Verify/Correction-Seite** (`/verify/[caseId]`): Zeigt vorausgefülltes Formular mit Name, Strasse, Nr., PLZ, Ort + Foto-Upload. Endkunde kann Daten korrigieren und zusätzliche Fotos hochladen.

**Beobachtungen:**
- **SMS-Sender = `sms_sender_name` aus Tenant-Config**, nicht `companyName` aus Registry. Potenzielle Abweichung (Identity Contract E1).
- **Correction-Seite hat keinen Tenant-Branding.** Teal-Farbe (#0d9488) statt Brand Color. Keine CompanyName-Anzeige. Fühlt sich an wie eine andere Anwendung.
- **HMAC-Token hat kein Ablaufdatum im UI.** Technisch basiert er auf `created_at`, aber der Endkunde sieht keinen Hinweis "Dieser Link ist 24h gültig".

---

## 3. Kategorie-System: Wizard vs. Voice

| Dimension | Wizard | Voice (Lisa) |
|-----------|--------|-------------|
| Quelle | `CASE_POOL` (10 Einträge) × `services[]` → Top 3 + 3 fixe | 6 hardcoded im Retell Agent JSON |
| Logik | Dynamisch (pro Tenant, Build-Time) | Statisch (pro Agent, manuell gepflegt) |
| Beispiel Dörfler | Verstopfung, Leck/Wasserschaden, Heizungsausfall + Allgemein, Angebot, Kontakt | Verstopfung, Wasserschaden, Heizungsausfall, Rohrleitungsproblem, Sanitäranlage, Allgemein |
| Allgemein/Angebot/Kontakt | Immer vorhanden (fixe Reihe) | Nur "Allgemein" als Catch-All |
| Divergenz-Risiko | Hoch — getrennte Quellen, kein Sync-Mechanismus | — |

**Konsequenz:** Identischer Endkunde könnte telefonisch "Sanitäranlage" sagen und schriftlich "Verstopfung" wählen — gleicher Betrieb, gleiche Leistung, anderer Kategorie-Name. Leitstand sieht inkonsistente Kategorien.

---

## 4. Wizard vs. Voice — Vergleich auf 12 Dimensionen

| Dimension | Wizard | Voice (Lisa) | Delta |
|-----------|--------|-------------|-------|
| **Einstieg** | URL → sofort Formular | Anruf → Begrüssung → Gespräch | Voice: wärmer |
| **Identität** | Brand Color + CompanyName in TopBar | Greeting mit Firmenname + KI-Disclosure | Wizard: kein KI-Hinweis nötig |
| **Kategorie** | User wählt aus 6 Cards | Lisa leitet aus Gespräch ab | Wizard: expliziter, Voice: natürlicher |
| **Dringlichkeit** | User wählt explizit (3 Stufen) | Lisa inferiert aus Kontext | Wizard: objektiver |
| **Adresse** | Strasse + Nr. Pflicht | Optional (nur PLZ + Ort required) | Wizard: strenger |
| **PLZ-Korrektur** | Keine | PLZ_CITY_MAP (25 Orte) | Voice: +1 |
| **Service-Area-Check** | Keiner | Keiner | Beide: Lücke |
| **Kontaktdaten** | Name + Phone/Email | Automatisch (Caller-ID) | Wizard: mehr Aufwand |
| **E-Mail-Capture** | Ja (optional) | Nein | Wizard: +1 |
| **Beschreibung** | Freitext (User tippt) | Transkript oder custom_analysis | Wizard: strukturierter |
| **Fotos** | Ja (bis 5) | Nein (via SMS-Link nachgelagert) | Wizard: +1 |
| **Post-Submit** | Success-Screen + SMS + E-Mail | SMS + E-Mail | Beide: SMS als Brücke |

**Fazit:** Der Wizard hat **strukturelle Vorteile** (Fotos, E-Mail, explizite Kategorie) aber **emotionale Nachteile** (kalt, formular-artig, keine Rückfrage-Möglichkeit, kein "Ich kümmere mich darum"-Moment).

---

## 5. Perspektive Endkunde — Erlebnis-Audit

### Touchpoint-Kette

```
Website → "Meldung erfassen" → Wizard Schritt 1 → Schritt 2 → Schritt 3
→ Submit → Success-Screen → [SMS] → [E-Mail] → [Korrektur-Seite]
```

### Emotionale Temperatur

| Moment | Temperatur | Begründung |
|--------|-----------|------------|
| Einstieg (Schritt 1) | Neutral | Sauberes UI, Brand Color, klare Cards |
| Schritt 2 (Adresse) | Kalt | Reines Formular, kein Kontext, keine Hilfe |
| Schritt 3 (Kontakt) | Kalt | Viele Felder, keine Erklärung warum |
| Submit-Moment | Angespannt | "Wird gesendet…" — dauert 2-5 Sekunden |
| Success-Screen | Erleichterung | Checkmark, aber zu wenig Info über was jetzt passiert |
| SMS (30s später) | Vertrauen | Persönlich, mit Korrektur-Link — stärkstes Signal |
| Korrektur-Seite | Verwirrung | Anderes Design, kein Branding, "was ist das?" |

### Vertrauenskiller (in Reihenfolge der Schwere)

1. **Kein Notfall-Shortcut.** Endkunde hat Wasserrohrbruch, wählt "Notfall", muss trotzdem 3 Schritte Formular ausfüllen. Voice: sofortige Reaktion.

2. **Success-Screen sagt nicht, was passiert.** "Wir kümmern uns darum" — wer ist "wir"? Wann? Wie? Kein "Der Betrieb wurde benachrichtigt" oder "Sie erhalten gleich eine SMS".

3. **Korrektur-Seite ohne Branding.** Endkunde klickt SMS-Link und landet auf einer Seite ohne Firmenname, ohne Brand Color, in Teal. Fühlt sich an wie Phishing.

4. **PLZ-Eingabe ohne Hilfe.** Keine Autocomplete, keine Validierung, keine Ort-Vorausfüllung. Voice macht das automatisch.

5. **Kein Zwischenspeicher.** Browser-Tab zu → alles weg. Kein "Möchten Sie wirklich verlassen?"-Dialog.

---

## 6. Perspektive Betrieb/Tenant — Was kommt an?

### Ops-E-Mail (Benachrichtigung an Betrieb)

Enthält: Fall-Nr. (FS-XXXX), Quelle ("Website-Formular"), Kategorie, Dringlichkeit, Adresse, Kontaktdaten, Beschreibung, Deep-Link zum Leitstand.

**Beobachtungen:**
- **Absender:** `"FlowSight Ops" <ops@flowsight.ch>` — nicht der Betriebsname. Verletzt Identity Contract R4 (FlowSight-Unsichtbarkeit).
- **Kein Unterschied Wizard vs. Voice im Layout.** Nur das Label "Website-Formular" vs. "Voice Agent" im Quell-Feld. Gut: konsistent. Schlecht: keine source-spezifische Aufbereitung.
- **Fotos nicht in der E-Mail.** Falls Fotos hochgeladen wurden → nirgendwo sichtbar bis Leitstand.

### Leitstand-Darstellung

Case landet in der Cases-Tabelle mit `source: "wizard"`. Dashboard zeigt Source-Badge.

**Beobachtung:** Kein visueller Unterschied in der Fall-Qualität. Wizard-Cases haben typisch mehr Daten (Strasse, E-Mail, Fotos), aber das Leitstand zeigt das nicht prominent.

---

## 7. Perspektive Leitstand — Operative Weiterverarbeitung

### Datenqualität Wizard vs. Voice

| Feld | Wizard | Voice |
|------|--------|-------|
| `reporter_name` | Manuell eingegeben | Aus Gespräch extrahiert (fehlt oft) |
| `contact_phone` | Manuell eingegeben (optional) | Automatisch (Caller-ID) |
| `contact_email` | Manuell eingegeben (optional) | Nie vorhanden |
| `street` + `house_number` | Required | Optional |
| `plz` | Manuell (keine Validierung) | Extrahiert + PLZ_CITY_MAP-korrigiert |
| `city` | Manuell (keine Validierung) | PLZ-basiert auto-korrigiert |
| `category` | Exakt (User-Auswahl) | Extrahiert (STT-Fehler möglich) |
| `urgency` | Exakt (User-Auswahl) | Inferiert (Fehler möglich) |
| `description` | Freitext (oft kurz) | Transkript oder AI-Summary (oft länger) |
| `photo_url` | Via Upload (0-5 Fotos) | Nie (nur via SMS-Link nachgelagert) |

**Paradox:** Wizard-Cases haben strukturell bessere Daten (vollständige Adresse, E-Mail, Fotos), aber emotional ärmere Beschreibungen (2-3 Sätze vs. Gespräch-Transkript).

### Tote Übergänge

1. **Fotos → Leitstand:** Fotos werden via Supabase Storage hochgeladen, aber der Leitstand hat kein Foto-Viewer-Widget. Betrieb muss in Supabase Storage navigieren.

2. **Verify-Korrekturen → Case:** Korrektur-Seite updatet `plz`, `city`, `street`, `house_number`, `reporter_name` direkt in der Cases-Tabelle. Aber: **kein Case-Event wird erstellt.** Betrieb sieht nicht, dass Daten korrigiert wurden.

3. **Reporter-Bestätigung → Endkunde:** E-Mail wird gesendet, aber der Inhalt ist generisch ("Ihre Meldung wurde aufgenommen"). Keine case-spezifischen Details, keine Zusammenfassung.

---

## 8. Zweiter Schriftlicher Eingang: Manuelle Fallerfassung

Neben dem Wizard gibt es einen **zweiten schriftlichen Intake:** `source: "manual"` via API.

- Verwendet dieselbe `POST /api/cases`-Route
- Keine eigene UI (vermutlich für Ops-Dashboard oder Telefon-Notizen)
- Validation: Lockerer als Wizard (kein `street`/`house_number` required)
- Module-Check: Kein `website_wizard`-Gate

**Beobachtung:** Manuelle Fälle teilen die gesamte Downstream-Pipeline (Events, E-Mail, SMS) mit dem Wizard. Kein eigenständiger Ablauf.

---

## 9. Drift-Analyse: Wizard ↔ Identity Contract

| Regel | IST-Status | Verstoss |
|-------|-----------|----------|
| R1 (display_name sync) | TopBar zeigt `companyName` aus Registry. Success-Screen sagt "Wir". Korrektur-Seite zeigt gar nichts. | **Verstoss** auf Success + Korrektur |
| R2 (Kategorie-Identität) | Wizard-Kategorien ≠ Voice-Kategorien. Keine gemeinsame Quelle. | **Verstoss** |
| R3 (PLZ-Einheit) | Kein PLZ-Check. Voice hat Map, Wizard nicht. | **Verstoss** |
| R4 (FlowSight-Unsichtbarkeit) | Footer: "Website powered by FlowSight". Ops-E-Mail: "FlowSight Ops". Korrektur-Seite: FlowSight-Teal. | **3× Verstoss** |
| R5 (short_name Scope) | SMS nutzt `sms_sender_name` korrekt. | OK |
| R6 (Keine Halluzination) | Statische Daten aus Registry. | OK |
| R7 (Slug-Eindeutigkeit) | SSG generiert pro Slug. | OK |

**Bilanz:** 4 von 7 Konsistenzregeln verletzt. Der Wizard ist die **zweitgrösste Verstoss-Quelle** nach der E-Mail-Pipeline.

---

## 10. Prospect Journey — Einbettung

Im Kontext der 14-Tage-Trial (prospect_journey.md) ist der Wizard **der erste produktive Touchpoint** des Prospects:

- **Tag 0:** Prospect bekommt Welcome-Mail → Link zu "seiner" Website → Wizard ist dort verlinkt
- **Tag 0-3:** Prospect testet den Wizard (eigene Testmeldung)
- **Tag 5-14:** Endkunden-Meldungen laufen durch den Wizard

**Heutiger IST-Stand:**
- Der Wizard hat **keinen Trial-Modus.** Prospect-Testmeldung = echte Meldung. Kein "Das ist ein Test"-Hinweis, kein spezielles Routing.
- **Kein Onboarding-Hinweis** auf der Wizard-Seite. Kein "So funktioniert Ihre digitale Annahme" beim ersten Besuch.
- **Kein Zusammenhang mit Demo-Cases.** Die in prospect_journey.md spezifizierten Demo-Fälle ("So sieht Ihr Alltag aus") haben keinen Bezug zum Wizard — sie leben nur im Leitstand.

---

## 11. Dokumentierte Lücken (L1–L20)

### Kritisch (blockiert Gold-Contact)

| # | Lücke | Wo | Impact |
|---|-------|-----|--------|
| L1 | Kein Notfall-Shortcut | Step 1 | Endkunde mit Wasserrohrbruch füllt 3 Schritte aus statt sofort anzurufen |
| L2 | Kein PLZ-Lookup / Autokorrektur | Step 2 | Asymmetrie zu Voice, unnötige Tipparbeit, Fehlerquelle |
| L3 | Keine Service-Area-Prüfung | Step 2 | Case aus PLZ 3000 für Betrieb in 8942 — nicht einmal Warnung |
| L4 | Korrektur-Seite ohne Branding | Verify | Endkunde klickt SMS-Link → landet auf unbrandeter Seite → Vertrauensbruch |
| L5 | Kategorie-Divergenz Wizard↔Voice | Step 1 / Retell | Inkonsistente Leitstand-Daten, verwirrte Betriebe |

### Major (deutlich unter Gold-Niveau)

| # | Lücke | Wo | Impact |
|---|-------|-----|--------|
| L6 | Success-Screen sagt nicht was passiert | Success | Endkunde weiss nicht: SMS kommt, Betrieb ist informiert, Timeline |
| L7 | Keine Phone-Validierung | Step 3 | "abc" wird als Telefonnummer akzeptiert |
| L8 | Keine E-Mail-Validierung (beyond browser) | Step 3 | Typos → Reporter-Bestätigung bounced |
| L9 | Verify-Korrektur erzeugt kein Case-Event | Verify API | Betrieb sieht nicht, dass Daten korrigiert wurden |
| L10 | Ops-E-Mail zeigt "FlowSight Ops" statt Betriebsname | E-Mail | Identity Contract R4 verletzt |
| L11 | Fall-Nr. auf Success = UUID-Fragment statt FS-XXXX | Success | Endkunde und SMS nutzen verschiedene Referenzen |

### Design-Schwächen

| # | Lücke | Wo | Impact |
|---|-------|-----|--------|
| L12 | Schritt 2 hat keine Persönlichkeit | Step 2 | Reines Formular, kein Kontext, kein "Warum brauchen wir das" |
| L13 | Kein Zwischenspeicher / "Verlassen?"-Dialog | Alle Steps | Tab zu → alles weg |
| L14 | Fotos nur sichtbar in Supabase Storage, nicht im Leitstand | Ops | Betrieb sieht keine Fotos |
| L15 | Kein mobile-first Photo-Capture (kein `capture="environment"`) | Step 3 | Wizard-Form fehlt `capture` Attribut (Verify hat es) |
| L16 | Dringlichkeit hat keine operative Konsequenz | Step 1 → Pipeline | "Notfall" = gleiche Geschwindigkeit wie "Normal" |

### Minor

| # | Lücke | Wo | Impact |
|---|-------|-----|--------|
| L17 | PLZ maxLength=5 statt 4 (Schweiz = 4-stellig) | Step 2 | Potenzielle Fehleingabe |
| L18 | Kein Progress-Indicator im Photo-Upload (pre-submit) | Step 3 | Nur Dateiname, kein "uploading..." |
| L19 | "Neue Meldung" nach Success = harter Reset | Success | Formular-State wird gelöscht, kein Pre-fill |
| L20 | Footer zeigt "Website powered by FlowSight" auch im Wizard | Footer | Identity Contract R4, minor weil klein |

---

## 12. Zusammenfassung

### Was funktioniert

- **3-Schritt-Struktur** ist klar und schnell (Anliegen → Adresse → Kontakt)
- **Foto-Upload** ist gut implementiert (Presigned URLs, 3-Step-Protocol)
- **Brand Color** durchgängig in Buttons, TopBar, Step-Indicator
- **SMS als Brücke** zwischen Wizard und Verify ist eine starke Idee
- **Shared Pipeline** — Wizard und Voice nutzen dieselbe `POST /api/cases`-Route + Events + E-Mail + SMS. Konsistenz in der Backend-Verarbeitung.

### Was fehlt für Gold-Contact-Niveau

Der Wizard ist ein **funktionales Webformular**, aber kein **schriftlicher Einstieg in ein Leitsystem.** Er wirkt wie ein Kontaktformular, nicht wie der Beginn einer professionellen Fallbearbeitung.

**Die drei grössten Lücken:**

1. **Kein Notfall-Bewusstsein.** Voice erkennt Dringlichkeit und reagiert sofort. Der Wizard behandelt "Notfall" und "Normal" gleich — keine Sofort-Aktion, keine Eskalation, keine Kurzschaltung.

2. **Kein Vertrauensbogen nach Submit.** Success-Screen → SMS → Verify-Seite ist eine Kette von drei getrennten Erlebnissen ohne roten Faden. Weder Branding noch inhaltliche Klammer.

3. **Kategorie- und PLZ-Drift zu Voice.** Zwei Intake-Kanäle, die verschiedene Sprachen sprechen. Der Leitstand sieht inkonsistente Daten, der Betrieb muss mental übersetzen.
