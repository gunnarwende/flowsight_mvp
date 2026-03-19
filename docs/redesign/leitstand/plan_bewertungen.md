# Bewertungen — Ganzheitlicher Prozess-Plan

## Ist-Zustand

- **Bewertungsanfrage:** `review_sent_at` Timestamp auf Case (manuell gesetzt)
- **Keine Rückmeldung-Tracking:** Kein Feld für "Bewertung erhalten" oder Rating-Wert
- **Google-Anbindung:** Keine (manueller Refresh als bewusste Entscheidung)
- **Darstellung:** Sterne-Widget in FlowBar, "X von Y" Anzeige

## Prozess E2E

```
Fall erledigt → Bewertungsanfrage senden → Kunde bewertet auf Google → Rating erfassen → Analyse
```

### Schritt 1: Bewertungsanfrage
- **Wann:** Nach Fallabschluss (status=done), manuell durch Betrieb
- **Wie:** E-Mail mit direktem Google-Bewertungslink
- **Max:** 2 Anfragen pro Fall (bestehende Regel)
- **Tracking:** `review_sent_at` (erster Versand), `review_sent_count` (Anzahl)

### Schritt 2: Rückmeldung erfassen
- **Neues Feld:** `review_rating` (1-5, nullable) — manuell eingetragen
- **Neues Feld:** `review_received_at` (timestamp) — wann eingegangen
- **Kein Auto-Sync:** Bewusste Entscheidung (kein Google API in MVP)
- **Manueller Refresh:** Betrieb prüft Google-Profil, trägt Rating ein

### Schritt 3: Darstellung

#### FlowBar (KPI-Kachel "Bewertung")
- **Sterne:** Immer 5 Sterne anzeigen, gefüllt nach Durchschnitt (Gold)
- **Kein Strich:** Wenn kein Rating vorhanden → "Noch keine" statt "—"
- **Zahl:** Durchschnitts-Rating (z.B. "4.7")
- **Sub:** "X erhalten / Y angefragt" (statt "X von Y")

#### Admin-Sicht
- Sieht alle Bewertungen aller Fälle
- Aggregat: Durchschnitt, Anzahl angefragt vs. erhalten, Antwortquote
- Bewertungen 1-3 Sterne: Rot markiert (Handlungsbedarf)
- Bewertungen 4-5 Sterne: Grün markiert (Erfolg)

#### Techniker-Sicht
- Sieht nur Bewertungen seiner eigenen Fälle
- Gleiche Darstellung: persönlicher Durchschnitt, eigene Anfragen/Antworten
- Motivation: "Deine Kunden bewerten dich mit 4.8 ★"

### Schritt 4: Analyse (Handlungsbedarf)

| Rating | Bedeutung | Aktion |
|--------|-----------|--------|
| 5 ★ | Exzellent | Zitat als Featured Review nutzen |
| 4 ★ | Gut | Keine Aktion nötig |
| 3 ★ | Mittelmässig | Betrieb prüft, ob Nachfrage sinnvoll |
| 1-2 ★ | Schlecht | Sofort-Alert an Admin, Nachbearbeitung |

### Schritt 5: Google-Strategie
- **Ziel:** Nur 4-5-Sterne-Bewertungen auf Google
- **1-3 Sterne:** Intern erfassen, NICHT auf Google-Link drängen
- **Pre-Filter:** Bewertungsanfrage-E-Mail könnte "Waren Sie zufrieden?" fragen:
  - Ja → Google-Link
  - Nein → Internes Feedback-Formular (kein Google)
- **Phase 2 Feature:** Optional, nicht im MVP

## DB-Änderungen (Migration)

```sql
ALTER TABLE cases
  ADD COLUMN review_rating smallint CHECK (review_rating >= 1 AND review_rating <= 5),
  ADD COLUMN review_received_at timestamptz,
  ADD COLUMN review_sent_count smallint DEFAULT 0;
```

## UI-Änderungen

1. **FlowBar:** Durchschnitt aus `review_rating` (statt statisch null), Sterne gold, kein "—"
2. **CaseDetailForm:** Feld "Bewertung" (1-5 Sterne-Picker) + "Anfrage senden" Button
3. **Tabelle:** Optional: Bewertungsspalte für erledigte Fälle

## Reihenfolge

1. Migration (review_rating, review_received_at, review_sent_count)
2. CaseDetailForm: Rating-Eingabe
3. FlowBar: Durchschnittsberechnung aus DB
4. Admin-Analyse: Antwortquote, Handlungsbedarf bei 1-3 Sternen
5. (Phase 2) Pre-Filter in Bewertungs-E-Mail
