# Review — Zielbild (Gold)

**Typ:** SSOT-Zielbild (Gold)
**Stand:** 2026-03-12
**IST-Grundlage:** review_ist.md (15 dokumentierte Luecken, L1–L15)
**Nordstern:** gold_contact.md (WOW 7: "Eine Google-Bewertung")
**Referenziert:** identity_contract.md (R1–R7), prospect_journey.md, wizard.md, leitstand.md

---

## 1. Executive Summary

Der Review ist der Nachlauf des Leitsystems.
Nicht eine Bewertungs-Bitte, sondern der Beweis, dass der Kreislauf funktioniert:
Annahme → Arbeit → Abschluss → Anerkennung.

WOW 7 sagt: "FlowSight bringt mir nicht nur Ordnung — sondern auch Sterne."
Das funktioniert nur, wenn der Endkunde eine ehrliche, konkrete, einfache Erfahrung macht.
Und der Betrieb sieht, dass es funktioniert.

### Was dieses Dokument definiert

- Die ehrliche Review Surface (kein Fake-Google, kein dekorativer Klon)
- Den Nachlauf als System (Trigger, Timing, Reminder, Sichtbarkeit)
- Die Verbindung zwischen Review-Engine und Website-Bewertungen
- Die Einbettung in Prospect Journey, Leitstand und Identity Contract
- Das Endkunden-Erlebnis von Anfrage bis Google-Bewertung

### Was dieses Dokument NICHT ist

- Kein Google Places API-Integrationsdokument
- Kein Bewertungs-Marketing-Konzept
- Keine Nachricht-Optimierung (A/B-Tests, Betreffzeilen-Varianten)

### Kernthese

> Die Review Surface ist kein Google-Klon. Sie ist ein Bewertungs-Vorbereiter.
> Sie zeigt dem Endkunden, was er erlebt hat, hilft ihm einen guten Text zu formulieren,
> und bringt ihn mit einem Klick zu Google — vorbereitet, nicht ueberrumpelt.
> Das Ergebnis: eine echte Bewertung, die der Betrieb auf seiner Website zeigt.

---

## 2. Grundprinzipien

5 verbindliche Prinzipien. Jede Designentscheidung muss gegen sie bestehen.

### P1: Ehrlichkeit statt Attrappe

Jedes Element auf der Review Surface hat eine echte Funktion.
Kein dekorativer Stern, kein read-only Textfeld, kein Button ohne Handler.
Was klickbar aussieht, muss klickbar sein. Was nicht funktioniert, wird entfernt.

**IST-Verstoss:** 5 dekorative Sterne, read-only Textarea, "Fotos"-Button und "Abbrechen" ohne Funktion.

### P2: Fallbezug statt Anonymitaet

Jede Review-Anfrage nennt den konkreten Fall: Betriebsname, Kategorie, Ort, Datum.
Der Endkunde erinnert sich sofort: "Ah, die Verstopfung in Oberrieden letzte Woche."
Keine generische Bitte "Wie war unser Service?".

**IST-Verstoss:** E-Mail/SMS ohne Fallbezug. "Ihr Service-Team" statt Betriebsname.

### P3: Vorbereitung statt Umleitung

Die Review Surface bereitet den Endkunden auf die Google-Bewertung vor.
Er sieht seinen Fall, kann den vorgeschlagenen Text anpassen, und wird dann zu Google geleitet —
mit dem Text in der Zwischenablage, nicht mit leeren Haenden.
Keine doppelte Arbeit, kein Gefuehl der Taeuschung.

**IST-Verstoss:** Surface sieht aus wie Google, leitet dann auf Google weiter. Doppelte Arbeit.

### P4: System statt Knopfdruck

Review ist kein einzelner Button-Klick. Es ist ein Nachlauf-System:
Trigger → Versand → Tracking → Reminder → Ergebnis.
Der Betrieb sieht den Status jedes Reviews. Der Founder sieht die Gesamtquote.

**IST-Verstoss:** Manueller One-Shot. Kein Tracking, kein Resend, kein Reminder.

### P5: Betrieb sichtbar, FlowSight unsichtbar

Alles was der Endkunde sieht, traegt den Betriebsnamen.
E-Mail, SMS, Surface — ueberall `{display_name}`, nirgends "FlowSight".

**IST-Verstoss:** E-Mail Subject "[FlowSight]", Body "Ihr Service-Team", "Max Mustermann" hardcoded.

---

## 3. Die Review Surface — Bewertungs-Vorbereiter

### 3.1 Grundentscheidung

> Die Review Surface ist KEIN Google-Klon.
> Sie ist ein **Bewertungs-Vorbereiter**: zeigt den Fall, hilft beim Text, bringt zu Google.

**Begruendung:**
- Die Bewertung MUSS auf Google landen (gold_contact.md: "Bewertungsseite → Google-Link klicken").
- Ein Google-Klon taeuscht den Endkunden und erzeugt doppelte Arbeit.
- Ein Vorbereiter ist ehrlich, hilfreich und reduziert die Huerde.

### 3.2 Layout

```
┌─────────────────────────────────────────────────────┐
│  {display_name}                        [brand_color] │
│                                                      │
│  Vielen Dank fuer Ihren Auftrag.                    │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ Ihr Auftrag                                   │   │
│  │ Kategorie:   Verstopfung                      │   │
│  │ Ort:         8942 Oberrieden                  │   │
│  │ Datum:       05.03.2026                       │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  Ueber eine Google-Bewertung wuerden wir uns        │
│  sehr freuen. Hier ist ein Vorschlag:               │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ Sehr kompetenter und zuverlaessiger Service.  │   │
│  │ Schnelle Reaktion, saubere Arbeit, faire      │   │
│  │ Preise. Jederzeit wieder — klare Empfehlung!  │   │
│  │                                    [editierbar]│   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌───────────────────────────────────────┐          │
│  │  ★ Auf Google bewerten               │          │
│  │  (Text wird in die Zwischenablage     │          │
│  │   kopiert)                            │          │
│  └───────────────────────────────────────┘          │
│                                                      │
│  Kein Interesse? Sie muessen nichts tun.            │
│                                                      │
│  ─────────────────────────────                      │
│  Website powered by FlowSight                       │
└─────────────────────────────────────────────────────┘
```

### 3.3 Regeln

| Regel | Beschreibung |
|-------|-------------|
| RS1 | Header: `{display_name}` in `{brand_color}`. Kein Google-Branding. |
| RS2 | Auftrags-Block: Kategorie, Ort (PLZ + City), Datum (`created_at` formatiert). Kein Endkunden-Name (Datensparsamkeit). |
| RS3 | Text-Vorschlag: editierbares Textarea (nicht readonly). 3-Zeiler als Default, Endkunde kann anpassen. |
| RS4 | Primaer-CTA: "Auf Google bewerten". Klick kopiert Text in Zwischenablage (Clipboard API) UND oeffnet `google_review_url` in neuem Tab. |
| RS5 | Nach Klick: Inline-Bestaetigung "Text kopiert — Sie koennen ihn auf Google einfuegen." |
| RS6 | Kein "Abbrechen"-Button. Stattdessen: "Kein Interesse? Sie muessen nichts tun." (Text, kein Button). |
| RS7 | Keine Sterne auf der Surface. Sterne waehlt der Endkunde auf Google selbst. |
| RS8 | Keine "Fotos hinzufuegen"-Attrappe. Fotos kann der Endkunde auf Google selbst hinzufuegen. |
| RS9 | Wenn `google_review_url` nicht konfiguriert: CTA zeigt "Text kopieren" (ohne Google-Link). Kein toter Button. |
| RS10 | Footer: "Website powered by FlowSight" — dezent, wie Wizard. |

### 3.4 Tracking

| Event | Trigger | Was wird gespeichert |
|-------|---------|---------------------|
| `review_surface_opened` | Page-Load mit gueltigem Token | `case_events`: Timestamp |
| `review_cta_clicked` | Klick auf "Auf Google bewerten" | `case_events`: Timestamp + `{ clipboard_copied: true/false }` |

**Keine weiteren Tracking-Events.** Ob der Endkunde auf Google tatsaechlich bewertet, wissen wir nicht und tracken wir nicht. Das ist die Grenze unseres Systems.

---

## 4. Review-Anfrage — E-Mail und SMS

### 4.1 Review-E-Mail

**Subject:** `{display_name} — Wie war unser Service?`
**From (Name):** `{display_name} via FlowSight` (Identity Contract E4)
**From (Adresse):** `noreply@send.flowsight.ch` (Domain-Constraint)

**Body (HTML, gebranded):**

```
[Initials-Badge in brand_color]

Guten Tag {reporter_name_or_empty},

vielen Dank, dass Sie sich an {display_name} gewandt haben.

Ihr Auftrag:
━━━━━━━━━━━━
Kategorie:  {category}
Ort:        {plz} {city}
Datum:      {created_at_formatted}

Ueber eine kurze Google-Bewertung wuerden wir uns sehr freuen.
Es dauert nur 1–2 Minuten:

[Button: "Jetzt bewerten" → Review Surface URL]

Vielen Dank fuer Ihr Vertrauen.

Freundliche Gruesse
{display_name}

──────────
Sie erhalten diese Nachricht, weil {display_name} einen Auftrag fuer Sie erledigt hat.
```

**Regeln:**
- EM1: Subject traegt `{display_name}`, NICHT "[FlowSight]".
- EM2: Greeting nutzt `{reporter_name}` wenn vorhanden, sonst "Guten Tag" ohne Namen.
- EM3: Auftrags-Block mit Kategorie, Ort, Datum — konkreter Fallbezug.
- EM4: CTA fuehrt zu Review Surface, NICHT direkt zu Google. Surface ist der Vorbereiter.
- EM5: Absender-Signatur: `{display_name}`, nicht "Ihr Service-Team".
- EM6: HTML-Format mit Brand Color fuer Initials-Badge. Fallback: Plain Text.
- EM7: Unsubscribe-Hinweis: "...weil {display_name} einen Auftrag fuer Sie erledigt hat." Nicht: "...weil wir."

### 4.2 Review-SMS

**Absender:** `{short_name}` (Identity Contract R5)

**Text:**
```
{short_name}: Vielen Dank fuer Ihren Auftrag ({category}, {plz} {city}).

Ueber eine Google-Bewertung wuerden wir uns freuen:
{review_surface_url}

{display_name}
```

**Regeln:**
- SMS1: Fallbezug: Kategorie + Ort direkt in der SMS.
- SMS2: Signatur: `{display_name}`, nicht "Ihr Service-Team".
- SMS3: Kein Fallback zu "FlowSight" als Absender. Wenn kein `sms_sender_name` → SMS wird nicht gesendet (Fehler in der Tenant-Config, nicht silent swallow).

---

## 5. Nachlauf als System

### 5.1 Trigger-Logik

**Primaer-Trigger:** Betrieb setzt Case-Status auf `done`.

**Automatisches Verhalten:**
- Status → `done` erzeugt einen **Review-Reminder im Leitstand**: Badge "Review moeglich" auf dem Case.
- Review wird NICHT automatisch gesendet. Der Betrieb entscheidet, wann.
- **Warum kein Auto-Send?** Nicht jeder erledigte Fall verdient eine Review-Anfrage. Schlechte Erfahrungen, kleine Reparaturen, wiederholte Kunden — der Betrieb muss waehlen koennen.

**Fallback-Reminder:** Wenn Case seit 3 Tagen `done` UND Review nicht gesendet:
- Gelber Hinweis im Leitstand-Falldetail: "Review noch nicht angefragt."
- Kein externer Alert (kein Telegram, keine E-Mail an Founder). Nur Leitstand-Sichtbarkeit.

### 5.2 Review-Status im Leitstand

Jeder Case mit `status === "done"` hat einen Review-Status:

| Review-Status | Bedingung | Anzeige im Leitstand |
|--------------|-----------|---------------------|
| `moeglich` | done + Kontaktdaten + review_sent_at === null | Badge "Review moeglich" (gruen) |
| `angefragt` | review_sent_at gesetzt + kein surface_opened Event | Badge "Angefragt" (gelb) |
| `geoeffnet` | review_surface_opened Event vorhanden | Badge "Geoeffnet" (blau) |
| `geklickt` | review_cta_clicked Event vorhanden | Badge "Google geoeffnet" (gruen, stark) |
| `kein_kontakt` | done + keine Kontaktdaten | Badge "Kein Kontakt" (grau) |
| `uebersprungen` | Betrieb hat explizit "Kein Review" gewaehlt | Badge "Uebersprungen" (grau) |

**Regeln:**
- NS1: Review-Status ist abgeleitet (berechnet aus case_events + review_sent_at), nicht als eigenes DB-Feld.
- NS2: Der Betrieb kann "Kein Review" waehlen (= explizites Ueberspringen, kein Reminder mehr).
- NS3: Resend moeglich nach 7 Tagen (review_sent_at + 7 Tage). Nicht frueher. Max 2 Anfragen pro Case.

### 5.3 Leitstand-Integration

**Falldetail:**
- Review-Badge prominent neben Status-Dropdown
- "Review anfragen"-Button (wenn `moeglich`)
- "Nochmals anfragen"-Button (wenn `angefragt` + 7 Tage vergangen)
- "Kein Review"-Option (explizites Ueberspringen)

**Fallliste:**
- Filter: "Review moeglich" (done + Kontakt + nicht gesendet)
- Spalte: Review-Status als Badge

**Keine eigene Review-Seite im Leitstand.** Review lebt im Falldetail und in der Fallliste als Filter/Spalte. Kein separater Tab.

---

## 6. Website-Bewertungen ↔ Review-Engine

### 6.1 Grundentscheidung

> Kein Real-Time-Sync mit Google Places API. Kein automatischer Import.
> Stattdessen: **Manueller Refresh** via Ops-Script, das Google-Daten holt und die Website aktualisiert.

**Begruendung:** gold_contact.md: "Bewertungsseite → Google-Link klicken. Nicht automatisch importieren. Das IST der Standard." API-Sync ist fragil (Rate Limits, Key-Rotation, Kosten) und fuer MVP nicht noetig.

### 6.2 Ziel-Architektur

```
Heute:
  TypeScript Registry (hardcoded) → Website rendert statische Reviews

Zielbild:
  Google Business Profile → [Script: refresh_reviews.mjs] → Supabase tenants.reviews JSONB
  Supabase tenants.reviews → Website rendert aktuelle Reviews
```

**Script `refresh_reviews.mjs`:**
- Liest `google_place_id` aus Tenant-Config
- Holt aktuelle Reviews via Google Places API (oder manuellen Scrape/Export)
- Schreibt `{ averageRating, totalReviews, highlights[] }` nach Supabase `tenants.reviews`
- Laeuft manuell oder als monatlicher Cron

**Website-Rendering:**
- Liest Reviews aus Supabase statt aus TypeScript Registry
- Uebergangsphase: TypeScript Registry bleibt Fallback bis Migration abgeschlossen

### 6.3 Feedback-Loop

```
Endkunde erhaelt Review-Anfrage
  → Klickt → Review Surface → Google-Bewertung
      → Google Rating steigt
          → refresh_reviews.mjs holt neue Daten
              → Website zeigt aktualisierte Bewertungen
                  → Naechster Prospect sieht besseres Rating
```

**Kein Real-Time-Loop.** Refresh passiert manuell oder monatlich. Das reicht fuer MVP. Der Betrieb sieht trotzdem: "Meine Sterne steigen."

---

## 7. Erwartungsmanagement

| Moment | Was der Endkunde versteht |
|--------|--------------------------|
| E-Mail/SMS erhalten | "Mein Auftrag bei {display_name} ({category}, {ort}) ist erledigt. Sie haetten gern eine Bewertung." |
| Review Surface oeffnen | "Das war mein Auftrag. Hier ist ein Text-Vorschlag, den ich anpassen kann." |
| CTA klicken | "Text ist kopiert, Google ist offen. Ich kann ihn einfuegen und absenden." |
| Google-Bewertung abgeben | "Fertig. Mein Text ist drin." |
| Nichts tun | "Ich muss nichts tun. Kein Druck, keine Folge-E-Mails." |

**Regel EM-R1:** Max 2 Review-Anfragen pro Case (1 initial + 1 Reminder nach 7 Tagen). Danach: Ruhe. Keine Dritte.

---

## 8. Prospect-/Trial-Perspektive

### 8.1 Wann ist Review Proof of Value?

**Tag 5–10 (kontrollierter Echt-Moment):** Ein echter Endkunde meldet via Voice/Wizard. Der Prospect bearbeitet den Fall im Leitstand, setzt ihn auf `done`, klickt "Review anfragen". Der Endkunde bekommt die Anfrage.

**Was der Prospect erlebt:**
- "Mein System hat gerade meinem Kunden eine Bewertungs-Anfrage geschickt."
- "Die Anfrage traegt meinen Firmennamen, nicht FlowSight."
- "Im Leitstand sehe ich: angefragt, geoeffnet, geklickt."
- "Das ist ein vollstaendiger Kreislauf."

**Das ist WOW 7:** Nicht die Bewertung selbst, sondern das System dahinter.

### 8.2 Trial-Besonderheiten

- **Demo-Cases:** Demo-Faelle haben keinen echten Endkunden → Review-Button ist disabled (kein `contact_email`/`contact_phone`). Das ist korrekt — keine Attrappe.
- **Test-Case des Prospects:** Prospect testet mit eigenem Case → kann Review an sich selbst senden → erlebt den vollen Flow. Sinnvoll und gewollt.

### 8.3 Wann wirkt Review noch wie Demo?

Wenn der Prospect nur Demo-Cases sieht und nie einen echten Fall bearbeitet, bleibt Review ein ausgegrau­ter Button. **Loesung:** Der kontrollierte Echt-Moment (prospect_journey.md T13) muss stattfinden, damit Review zum Proof of Value wird.

---

## 9. Identity Contract Compliance

| Regel | Zielbild-Status | Massnahme |
|-------|-----------------|-----------|
| R1 (display_name sync) | Konform | E-Mail, SMS, Surface — ueberall `{display_name}` |
| R2 (Kategorien identisch) | N/A | Review zeigt Kategorie, nicht zur Auswahl |
| R3 (PLZ-Einheit) | N/A | Review zeigt PLZ/Ort, nicht zur Eingabe |
| R4 (FlowSight unsichtbar) | Konform | Subject: `{display_name}`. Footer: "powered by". Kein "[FlowSight]". |
| R5 (short_name Scope) | Konform | SMS: `{short_name}`. Kein "FlowSight"-Fallback. Fehlende Config = kein Send. |
| R6 (Keine Halluzination) | Konform | Kein "Max Mustermann". Kein fiktiver Name. |
| R7 (Slug-Eindeutigkeit) | N/A | |

**Bilanz:** 4/4 relevante Regeln konform (IST: 0/4). Alle Identity-Verstoesse aufgehoben.

---

## 10. Beziehung zu Prospect Journey

### 10.1 Review im 14-Tage-Bogen

| Tag | Review-Relevanz |
|-----|----------------|
| 0–3 | Keine. Prospect sieht Review-Button, aber noch kein Case auf `done`. |
| 5–10 | **Proof of Value.** Kontrollierter Echt-Moment → Case done → Review-Flow testen. |
| 10 | **Founder-Anruf** (prospect_journey.md T14). Founder kann erwaehnen: "Haben Sie den Bewertungs-Flow gesehen?" |
| 13–14 | Review-Rate als Argument: "Ihre Endkunden bekommen professionelle Bewertungs-Anfragen." |

### 10.2 Automatisch vs. Persoenlich

| Element | Typ |
|---------|-----|
| Review-Badge im Leitstand | Automatisch (System) |
| Review-Anfrage versenden | Manuell (Betrieb entscheidet) |
| Reminder nach 3 Tagen im Leitstand | Automatisch (System) |
| Resend nach 7 Tagen | Manuell (Betrieb entscheidet) |
| Founder erwaehnt Review im Day-10-Call | Persoenlich |

**Designprinzip:** Das System macht sichtbar. Der Mensch entscheidet. Keine kalte Automatik gegenueber dem Endkunden.

---

## 11. Kill-Liste

8 Dinge, die Gold zerstoeren. Jedes einzelne ist ein No-Go.

| # | Kill-Moment | Warum toedlich |
|---|------------|---------------|
| K1 | Dekorative Sterne | Endkunde denkt er bewertet, tut es aber nicht. Taeuschung. |
| K2 | Read-only Textarea | "Warum kann ich nichts schreiben?" → Verwirrung → Abbruch. |
| K3 | "Max Mustermann" oder jeder hardcoded Name | Sofort: "Das bin ich nicht." → Misstrauen. |
| K4 | "Posten"-Button ohne Funktion | Klick ins Nichts = Vertrauensverlust. |
| K5 | "[FlowSight]" im E-Mail-Subject | Endkunde kennt FlowSight nicht. Spam-Verdacht. |
| K6 | "Wie war unser Service?" ohne Fallbezug | Welcher Service? Von wem? Wann? Generisch = ignoriert. |
| K7 | Auto-Send ohne Betriebs-Kontrolle | Schlechte Erfahrung + automatische Review-Bitte = negative Bewertung. |
| K8 | Mehr als 2 Review-Anfragen pro Fall | Belaestigung. Endkunde fuehlt sich gedraengt. |

---

## 12. Goldstandard-Kriterien

10 pruefbare Kriterien. Ein Review-System auf Gold-Niveau erfuellt alle 10.

| # | Kriterium | Pruefung |
|---|----------|---------|
| G1 | Review Surface zeigt Auftrags-Details (Kategorie, Ort, Datum) | Test-Case → Surface oeffnen → Block sichtbar? |
| G2 | Text-Vorschlag ist editierbar (nicht readonly) | Surface → Textarea klicken → Text aenderbar? |
| G3 | CTA kopiert Text in Zwischenablage + oeffnet Google | Surface → CTA klicken → Clipboard pruefen + neuer Tab? |
| G4 | Keine dekorativen Sterne, kein "Fotos"-Button, kein "Abbrechen"-Button | Surface → visuelle Pruefung |
| G5 | E-Mail Subject = `{display_name}`, nicht "[FlowSight]" | Test-E-Mail → Subject pruefen |
| G6 | E-Mail Body nennt Kategorie, Ort, Datum | Test-E-Mail → Fallbezug vorhanden? |
| G7 | Review-Badge im Leitstand (moeglich/angefragt/geoeffnet/geklickt) | Case → done → Badge sichtbar? |
| G8 | Resend moeglich nach 7 Tagen, max 2 Anfragen | Case → 7 Tage warten → "Nochmals anfragen" sichtbar? |
| G9 | `review_surface_opened` Event wird geschrieben | Surface oeffnen → case_events pruefen |
| G10 | Surface traegt `{display_name}` + `{brand_color}`, kein FlowSight-Branding | Surface → visuell + String-Suche |

---

## 13. Offene Entscheidungen

| # | Entscheidung | Abhaengigkeit | Wer entscheidet |
|---|-------------|--------------|----------------|
| O1 | `google_place_id` pro Tenant — wo speichern? (Supabase modules vs. eigenes Feld) | Website-Review-Refresh | Architektur |
| O2 | `refresh_reviews.mjs` — manuell vs. monatlicher Cron | Ops-Aufwand, API-Kosten | Founder |
| O3 | HTML-E-Mail-Template — eigenes Build-System oder Inline-HTML? | E-Mail-Infrastruktur | Architektur |
| O4 | Review-Badges in Fallliste — eigene Spalte oder Overlay auf Status? | Leitstand-Design | Produkt |
| O5 | Clipboard API Fallback (Safari, aeltere Browser) — Toast-Hinweis "Text manuell kopieren"? | Browser-Kompatibilitaet | Produkt |

---

## 14. Zusammenfassung

```
IST:     Button → generische E-Mail → Fake-Google-Surface → Google-Weiterleitung
         Kein Fallbezug, kein Tracking, kein Resend, kein Betriebsname

GOLD:    done → Badge → Betrieb entscheidet → gebrandete E-Mail mit Fallbezug
         → ehrliche Surface (Auftrags-Block, editierbarer Text, Clipboard + Google)
         → Tracking (geoeffnet, geklickt) → Resend nach 7 Tagen (max 2)
         → Website-Reviews via Refresh-Script aktualisiert

Review auf Gold = ehrlicher Nachlauf, sichtbarer Status, echter Feedback-Loop.
```
