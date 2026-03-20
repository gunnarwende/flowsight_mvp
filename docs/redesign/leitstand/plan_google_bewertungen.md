# Google-Bewertungen — E2E-Plan (Leitzentrale → Google)

**Version:** 1.0 | **Datum:** 2026-03-20
**Autor:** CC (Head Ops) + Founder-Input
**Status:** Phase 1 LIVE (Pre-Filter), Phase 2 OFFEN (Google-Abgleich)
**Pfad:** `docs/redesign/leitstand/plan_google_bewertungen.md`

---

## 1. Executive Summary

Ziel: Nur zufriedene Kunden (≥4★) sollen auf Google landen. Unzufriedene (≤3★) geben Feedback intern — der Betrieb kann reagieren, bevor Schaden entsteht. Der gesamte Flow ist transparent, DSGVO-konform und braucht keine manuelle Intervention nach der Einrichtung.

---

## 2. Aktueller Stand (Was LIVE ist)

### 2.1 Pre-Filter (PR #288, LIVE)
```
Fall erledigt → Admin klickt "Bewertung anfragen" → E-Mail an Kunden
                                                        ↓
                                         /review/[caseId] (Landingpage)
                                                        ↓
                                         Sterne-Picker (1-5)
                                                        ↓
                              ┌──── ≥4 Sterne ────┬──── ≤3 Sterne ────┐
                              ↓                                        ↓
                   "Vielen Dank!"                          "Danke für Ihr Feedback."
                   [→ Google Review Link]                  (kein Google-Link sichtbar)
                   + Bewertungstext-Editor                 Feedback intern gespeichert
```

### 2.2 DB-Felder (Migration 20260319000000)
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| `review_rating` | smallint (1-5) | Kundenbewertung vom Pre-Filter |
| `review_received_at` | timestamptz | Zeitpunkt der Bewertungsabgabe |
| `review_sent_count` | smallint | Anzahl Bewertungsanfragen (max 2) |
| `review_sent_at` | timestamptz | Letzte Anfrage gesendet |

### 2.3 Nachlauf-System (deriveReviewStatus.ts, LIVE)
- Max 2 Anfragen pro Fall
- 7 Tage Cooldown zwischen Anfragen
- 7 Status: möglich → angefragt → geöffnet → geklickt / übersprungen / kein_kontakt
- Status aus `case_events` berechnet (nicht gespeichert)

### 2.4 Status-Farben in Leitzentrale (LIVE)
| Zustand | Darstellung |
|---------|-------------|
| Erledigt (ohne Review) | Grüner Badge |
| Erledigt + Review gesendet | Grüner Badge mit **goldenem Rand** |
| Erledigt + Rating ≥4★ | **Goldener Badge** |

---

## 3. Offene Fragen (Founder)

### F1: "Muss man dem Kunden sagen, dass ≥4★ bei Google landet?"

**Antwort: Nein.** Der Kunde entscheidet selbst:
1. Kunde gibt Rating auf unserer Seite (intern, nur für uns sichtbar)
2. Bei ≥4★ ZEIGEN wir den Google-Link — der Kunde kann klicken oder nicht
3. Der Kunde geht dann SELBST zu Google und gibt dort NOCHMALS eine Bewertung ab
4. Wir schreiben NICHTS automatisch auf Google (das geht technisch auch nicht)

**Fazit:** Der Pre-Filter ist ein **Routing-Mechanismus**, kein Zwang. Ethisch und rechtlich sauber. Google selbst empfiehlt sogar, zufriedene Kunden um Bewertungen zu bitten.

### F2: "Wie kommen Google-Bewertungen zurück in den Fall?"

**Phase 1 (jetzt):** Manuell. Der Betrieb sieht im Leitstand den Gold-Status (≥4★ auf unserer Seite). Ob der Kunde dann AUCH auf Google bewertet hat, sieht der Betrieb auf seinem Google Business Profile.

**Phase 2 (geplant):** Automatisch via Google Places API. Siehe §6.

### F3: "Wo sehe ich die Bewertung im Fall?"

**Aktuell:** Im Verlauf (Timeline) als Event "Kundenbewertung: X Sterne". Der Status-Badge oben wird gold.

**Geplant (dieses Update):** Sterne-Anzeige direkt im Fall sichtbar, nicht nur im Verlauf.

### F4: "Kann ich auf 'X erhalten' / 'X angefragt' klicken zum Filtern?"

**Geplant (dieses Update):** Ja. Bewertungs-KPI wird klickbar:
- Klick auf "erhalten" → Tabelle filtert auf Fälle mit `review_rating != null`
- Klick auf "angefragt" → Tabelle filtert auf Fälle mit `review_sent_at != null`

---

## 4. E2E-Flow (Komplett)

### Schritt 1: Fall erledigen
- Techniker/Admin setzt Status auf "Erledigt"
- Bewertungsanfrage wird möglich (Button erscheint im Verlauf)

### Schritt 2: Bewertung anfragen
- Admin klickt "Bewertung anfragen" im CaseDetailForm
- API: `POST /api/ops/cases/[id]/request-review`
- **Gates:** Status=done, Kontaktdaten vorhanden, max 2 Anfragen, 7d Cooldown
- E-Mail an Melder mit Link `/review/[caseId]?token=<HMAC>`
- Fallback: SMS wenn nur Telefon vorhanden
- `case_events`: "Bewertungsanfrage gesendet"
- `review_sent_at` + `review_sent_count` aktualisiert

### Schritt 3: Kunde öffnet Link
- HMAC-Validierung (Schutz gegen Manipulation)
- Tenant-Branding (Firmenname, Farbe)
- Fall-Referenz (Kategorie, Ort, Datum)
- `case_events`: "Bewertungsseite geöffnet"

### Schritt 4: Kunde gibt Sterne (Pre-Filter)
- 5 klickbare Sterne, Hover-Effekt
- Rating wird sofort gespeichert: `POST /api/review/[caseId]/rate`
- `review_rating` + `review_received_at` in DB

### Schritt 5a: ≥4 Sterne → Google-Pfad
- "Vielen Dank für Ihre tolle Bewertung!"
- Bewertungstext-Editor (vorausgefüllter Text, editierbar)
- Button "Auf Google bewerten" → kopiert Text + öffnet Google Review URL
- `case_events`: "CTA geklickt" (wenn Track-URL vorhanden)

### Schritt 5b: ≤3 Sterne → Interner Pfad
- "Danke für Ihr ehrliches Feedback."
- KEIN Google-Link sichtbar
- Feedback ist intern gespeichert (review_rating)
- **Geplant:** Admin-Notification ("Negative Bewertung eingegangen")

### Schritt 6: Ergebnis im Leitstand
- KPI "Bewertung": "X erhalten / Y angefragt"
- Gold-Badge in Tabelle bei ≥4★
- Klick auf KPI filtert Tabelle

---

## 5. Was NICHT möglich ist (technische Grenzen)

### 5.1 Google Reviews API — kein Schreiben
**Google erlaubt NICHT, programmatisch Reviews zu erstellen.** Die Google My Business API / Places API bietet:
- **Lesen:** Ja (Reviews abrufen, Durchschnitt, einzelne Texte)
- **Antworten:** Ja (Owner Reply auf Reviews)
- **Schreiben/Erstellen:** NEIN — Reviews können nur von echten Nutzern auf google.com abgegeben werden

### 5.2 Automatischer Abgleich "Google → Fall"
**Problem:** Wenn ein Kunde auf Google bewertet, enthält die Review KEINEN Bezug zu unserem Fall-ID. Matching müsste über Name + Zeitfenster laufen — unzuverlässig bei häufigen Namen.

**Lösung Phase 2:** Heuristisches Matching (Name + Datum ±3 Tage). Nicht 100%, aber besser als nichts.

### 5.3 Bewertung erzwingen
Wir können den Kunden NICHT zwingen, auf Google zu bewerten. Wir machen es ihm nur einfach (Text vorkopiert, Link direkt). Conversion-Rate typisch: 20-40% der ≥4★-Bewerter klicken tatsächlich auf Google.

---

## 6. Phase 2: Google Places API (automatischer Review-Abgleich)

### Voraussetzungen
| Was | Status |
|-----|--------|
| Google Cloud Projekt | OFFEN — Founder-Action |
| Places API aktiviert | OFFEN — Founder-Action |
| API Key (restricted) | OFFEN — Founder-Action |
| Anleitung | DONE — `docs/runbooks/founder_kalender_setup.md` §3 |

### Funktionsweise
```
Cron (täglich) → Google Places API → Reviews für Tenant abrufen
                                          ↓
                              Heuristisches Matching:
                              - Reviewer-Name ≈ reporter_name
                              - Review-Datum ≈ review_received_at ±3 Tage
                                          ↓
                              Match gefunden → google_review_rating auf Case
                              Kein Match → Log (manuell prüfbar)
```

### DB-Erweiterung (Phase 2)
```sql
ALTER TABLE cases
  ADD COLUMN google_review_rating smallint,
  ADD COLUMN google_review_text text,
  ADD COLUMN google_review_matched_at timestamptz;

ALTER TABLE tenants
  -- google_review_url existiert bereits in modules
  -- Neu:
  ADD COLUMN google_place_id text; -- für API-Abfrage
```

### Kosten
- Google Places API: $0.005 pro Request (Details Endpoint)
- Bei 10 Betrieben × 1 Abfrage/Tag = $1.50/Monat
- Innerhalb Free Tier ($200 Guthaben/Monat)

### Aufwand
- ~4-6 Stunden Entwicklung
- Cron-Job (GH Actions oder Vercel Cron)
- Matching-Logik + Admin-UI für manuelle Korrektur

---

## 7. Bewertung im Fall anzeigen (geplant)

### Im CaseDetailForm (Verlauf-Card)
Wenn `review_rating` vorhanden:
```
┌─────────────────────────────────────┐
│  ★★★★★  4 Sterne                   │
│  Erhalten am 18.03.2026            │
│  ───────────────────                │
│  [Phase 2: Google-Review-Text]      │
└─────────────────────────────────────┘
```

### In der Leitzentrale-Tabelle
- Gold-Badge bei ≥4★ (LIVE)
- Tooltip oder Mini-Sterne bei Hover (geplant)

---

## 8. Klickbare Bewertungs-KPI (geplant)

### Admin FlowBar
```
★★★★★  4.7
BEWERTUNG
12 erhalten / 42 angefragt
        ↑              ↑
    klickbar        klickbar
```

- Klick "erhalten" → `activeNode = "bewertung_erhalten"` → Tabelle filtert auf `review_rating != null`
- Klick "angefragt" → `activeNode = "bewertung_angefragt"` → Tabelle filtert auf `review_sent_at != null AND review_rating IS NULL`

---

## 9. Checkliste — Was brauchen wir noch?

### Sofort umsetzbar (kein Founder nötig)
- [x] Pre-Filter auf Review-Surface (LIVE)
- [x] review_rating DB-Feld (LIVE)
- [x] Gold-Status in Tabelle (LIVE)
- [ ] Demo-Daten für Weinberger (Bewertungen seeden)
- [ ] Bewertungs-Anzeige im Fall (Sterne im Verlauf sichtbar)
- [ ] Klickbare "erhalten" / "angefragt" Filter
- [ ] Admin-Hinweis bei ≤3★ Bewertung ("Achtung: negative Bewertung")
- [ ] Gold-Ring dicker (2px statt 1px)

### Braucht Founder-Action
- [ ] Google Cloud Projekt + Places API Key (für Phase 2)
- [ ] Google Place ID pro Tenant in DB (für API-Abfrage)

### Nicht/schwer umsetzbar
- **Automatisches Schreiben auf Google:** Technisch unmöglich (Google API erlaubt es nicht)
- **100% zuverlässiges Matching Google→Fall:** Heuristik (Name+Datum), nicht perfekt
- **Bewertung verhindern:** Kunde kann trotzdem direkt auf Google gehen und ≤3★ geben — daran können wir nichts ändern

---

## 10. Zusammenfassung

| Aspekt | Status |
|--------|--------|
| Pre-Filter (≥4★ → Google, ≤3★ → intern) | **LIVE** |
| Nachlauf-System (max 2, 7d Cooldown) | **LIVE** |
| Gold-Status in Leitzentrale | **LIVE** |
| Demo-Daten Weinberger | OFFEN (dieses Update) |
| Bewertung im Fall sichtbar | OFFEN (dieses Update) |
| Klickbare KPI-Filter | OFFEN (dieses Update) |
| Google Places API Abgleich | OFFEN (Phase 2, Founder-Action) |
| Automatisches Google-Schreiben | **NICHT MÖGLICH** |
