# BigBen Pub — Projekt-Briefing (Paul)

**Datum:** 2026-04-14
**Status:** Paul hat sich gemeldet. Angetan von der bisherigen Website. Will Voice Agent + Event-System + App.
**Referenz:** kennedys.ch (Pauls frueherer Arbeitgeber, findet die Website klasse)
**Prioritaet:** Erster zahlender Nicht-Sanitaer-Kunde? → Founder-Entscheid noetig.

---

## Was Paul will

### 1. Voice Agent (EN default)
- **Sprache:** Englisch als Default (Pub-Publikum = international)
- **Switch:** DE, FR, IT on demand (wie bei Sanitaer-Agents, Sprachgate)
- **Use Cases:**
  - Reservierungen: "I'd like to book a table for 4 on Saturday at 7pm"
  - Events-Info: "What's on this weekend?", "Is there a match tonight?"
  - Oeffnungszeiten: "What time do you open?"
  - Allgemeine Fragen: "Do you have Guinness on tap?", "Where exactly are you?"
- **NICHT:** Bestellungen aufnehmen, Preise nennen, Speisekarte vorlesen

### 2. Event-Management (das Kernproblem)
- **2 Kategorien:** Sport (Fussball, Rugby, etc.) + Events (Quiz, Karaoke, Live Music)
- **Website-Darstellung:** Links/rechts auf Laptop, oben/unten auf Handy
- **Pflege:** Paul muss Events NUR ueber sein Handy pflegen koennen
- **Paul ist faul** → muss maximal einfach sein (kein Login in ein CMS, kein Backend-Dashboard)
- **Dynamisch:** Wenn Paul ein Event hinzufuegt, aktualisiert sich die Website sofort

**Strukturelles Problem:** Aktuell sind Events hardcoded im React-Code (BigBenContent.tsx). Keine Datenbank, keine Pflege-Moeglichkeit. Muss komplett neu gebaut werden.

**Loesungsansatz:**
- Events in Supabase (Tabelle: `pub_events`)
- Felder: `id, tenant_id, category (sport|event), title, date, time, description, recurring (boolean), image_url`
- PWA-App fuer Paul: `/ops/events` (eigene Seite im Leitsystem, Handy-optimiert)
- Website liest Events via API (ISR oder client-side fetch)

### 3. Website Richtung kennedys.ch
- **Was Paul an kennedys.ch gefaellt:**
  - Dunkles, warmes Farbschema (braun/holz, Pub-Atmosphaere)
  - Prominente Event/Sport-Anzeige
  - Professionelle Interior-Fotos
  - Separate Menuekarte (PDF oder eigene Seite)
  - Reservierungs-CTA prominent
- **Was wir schon haben:**
  - BigBenContent.tsx: Hero, About, Events (hardcoded), Menu, Reviews, Gallery, Reservation, Hours
  - ReservationForm.tsx: Datum/Zeit/Personen → API (aktuell nur Frontend)
  - i18n (EN + DE)
  - Bilder in `/images/kunden/bigben-pub/`

### 4. Reservierungs-E2E
- **Aktuell:** ReservationForm.tsx existiert, aber KEIN Backend. Form submitted → nichts passiert.
- **Ziel:** Gast reserviert → Paul bekommt Push/SMS → Paul bestaetigt/ablehnt → Gast bekommt Bestaetigung
- **Kanaele:**
  - Gast: Website-Formular ODER Voice Agent ("I'd like to book a table")
  - Paul: Push-Notification in seiner App + optional SMS
  - Bestaetigung: SMS an Gast ODER E-Mail

### 5. Paul's App (PWA)
- **Was Paul auf dem Handy braucht:**
  - Events hinzufuegen/bearbeiten/loeschen (Sport + Events getrennt)
  - Reservierungen sehen + bestaetigen/ablehnen
  - Tagesansicht: "Was ist heute los?" (Events + Reservierungen)
- **Technisch:** Erweiterung des bestehenden Leitsystems (/ops) mit Pub-spezifischen Seiten
- **Login:** OTP per E-Mail (wie bei Sanitaer-Kunden)

---

## Strategische Ueberlegung

### Ist BigBen Pub ein FlowSight-Kunde?

**Pro:**
- Erster zahlender Nicht-Sanitaer-Kunde → beweist Branchen-Flexibilitaet
- Paul ist begeistert → warmer Lead, kein Kaltakquise-Aufwand
- Pub im Dorf → spricht sich rum ("Paul hat eine App fuer sein Pub")
- Gastronomie = geplante Branchen-Erweiterung (laut business_briefing.md)

**Contra:**
- Komplett neues Produkt (Event-Management, Reservierungen) → Development-Aufwand hoch
- Voice Agent auf Englisch = neues Territory (Prompts, TTS-Stimme)
- Website-Redesign = genau das was wir gerade als Maschinenprodukt aufgegeben haben
- Ablenkt von Doerfler/Leuthold Outreach (die eigentliche Sales-Pipeline)

### Aufwand-Schaetzung (grob)

| Komponente | Aufwand | Prioritaet |
|-----------|---------|-----------|
| Voice Agent (EN + Sprachgate) | 4-6h | HOCH (Kernprodukt) |
| Supabase Events-Tabelle + API | 2-3h | HOCH (Grundlage fuer alles) |
| Events-Pflege im Leitsystem (/ops/events) | 6-8h | HOCH (Paul braucht das) |
| Website Events dynamisch (ISR/fetch) | 3-4h | MITTEL |
| Website Redesign Richtung kennedys.ch | 8-12h | NIEDRIG (Kosmetik, nicht Kernprodukt) |
| Reservierungs-Backend (DB + Notifications) | 4-6h | MITTEL |
| **Total** | **~30-40h** | |

### Empfehlung

**Founder-Entscheid noetig.** Das ist kein Quick-Win. 30-40h Development fuer einen einzelnen Pub-Kunden. ABER: wenn Paul zahlt (CHF 299/Mo) und das Wort im Dorf verbreitet, ist es ein strategischer Investment.

**Vorschlag: Phased approach.**
- **Phase 1 (1 Woche):** Voice Agent + Events-Tabelle + Events-Pflege → Paul kann sofort Events pflegen und Anrufe werden beantwortet
- **Phase 2 (1 Woche):** Reservierungs-Backend + Website Events dynamisch → E2E-Flow funktioniert
- **Phase 3 (bei Bedarf):** Website-Redesign Richtung kennedys.ch → nur wenn Paul es explizit will und zahlt

---

## Naechste Schritte (Founder-Entscheid)

1. Will Founder Paul als Kunden aufnehmen? (JA/NEIN)
2. Wenn JA: Welches Pricing? (CHF 299 Standard? Oder Custom weil Gastronomie?)
3. Wenn JA: Phased approach oder alles auf einmal?
4. Wann starten? (Nach Doerfler-Outreach oder parallel?)
