# Big Ben Pub — Prospect Briefing

**Erstellt:** 2026-03-04
**Kategorie:** Non-Sanitär Pilot (Gastro/Pub)
**Priorität:** Freitag-Demo (15 Min mit Paul)
**Ziel:** Ehrliches Feedback + Learnings aus erstem Non-Sanitär Onboarding > Geld

---

## Betrieb

| Feld | Wert |
|------|------|
| **Name** | Big Ben Pub |
| **Besitzer** | Paul, 45 Jahre, spricht nur Englisch |
| **Adresse** | Alte Landstrasse 20, 8942 Oberrieden |
| **Telefon** | 044 722 20 62 (Weiterleitung auf Pauls Handy) |
| **E-Mail** | hello@big-ben-oberrieden.ch |
| **Website** | big-ben-oberrieden.ch (ist falsch. er hat keine.) |
| **Instagram** | @bigbenpubzh (gepflegt, aber unregelmässig) |
| **Google Rating** | 4.7/5 (186 Reviews) — hervorragend! |
| **Kapazität** | ~40 Personen innen + kleiner Aussenbereich |
| **Preisniveau** | CHF 20-30/Person |
| **Montag** | Geschlossen |
| **Di-Do** | ab 16:00 (Quellen variieren: 16-23 Uhr) |
| **Fr-Sa** | ab 16:00 (bis 00:00) |
| **Sonntag** | Offen (laut Paul), Zeiten via Paul bestätigen |

---

## Stärken / USPs

- **Bestes Guinness der Region** (unbestritten)
- Wunderschönes, gemütliches Lokal
- Super familiär, einheimisch, absolut freundlich
- **Live Sport:** Premier League, Rugby — permanent auf Screens
- **Events:** Karaoke, Quiz Night, Live-Musik (teils sehr professionell)
- **Darts:** Spielbar + Dart-Verein geplant (ab Sept/Nov 2026)
- **Essen + Trinken:** Pub Food (Sandwiches, Chickenwings, Nachos), breite Bierauswahl (helles und dunkles Bier, Guinness, Sekt, wein, cocktails etc. breit aufstellung)
- **Aussenbereich:** Ganzjährig nutzbar
- Event-Location nach Absprache möglich (z.B. Geburtstagsfeier nach Absprache)
- Bodenständig, kein Schnickschnack, es muss funktionieren

## Pain Points

- **Multitasking-Stress:** Paul steht in der Küche, bedient, UND muss ans Telefon
- **No-Shows:** Tischreservierungen, aber nicht alle kommen → Umsatzverlust
- **Digitale Präsenz:** Instagram unregelmässig, Website vernachlässigt, kein Google Maps Instagram-Link
- **Null Technik-Affinität:** "Es muss halt einfach funktionieren"
- **Events-Kommunikation:** Karaoke/Quiz/Live-Musik Termine ändern sich, einer muss das pflegen

## Chancen für FlowSight

1. **Website:** High-End, zweisprachig (DE + EN), mit Event-Kalender, Speisekarte, Reservierung
2. **Voice Agent:** erstmal aussen vor. Ganz später vielleicht: Nimmt Reservierungen entgegen, beantwortet Fragen (Öffnungszeiten, Events, Speisekarte) — Paul muss nicht mehr ans Telefon
3. **Reservierungs-Management:** Online, SMS-Bestätigung + 24h-Reminder → No-Shows reduzieren
4. **Event-Showcase:** Dynamische Event-Sektion (Karaoke, Quiz, Live-Musik, Fussball-Highlights)
5. **Google Reviews:** 186 Reviews bei 4.7 — Potenzial für mehr mit automatisierten Anfragen

---

## Persönliche Beziehung

- Founder kennt Paul gut, Stammgast
- kleine Hochzeit dort gefeiert (vor 9 Monaten)
- Ehrliches Feedback + Prozess-Learnings wichtiger als Umsatz
- Freitag-Treffen: 15 Min Demo-Website zeigen

---

## Website-Anforderungen (Demo für Freitag)

### Must-Have
- Zweisprachig: **Englisch** (primary, da Paul) + **Deutsch** (lokale Gäste)
- Bilder: 15-20 Fotos vom Lokal (Founder liefert)
- Öffnungszeiten prominent -> hast du
- Speisekarte / Getränkekarte (Bild oder Text) -> Er hat kein Menü.
- Events-Sektion (Karaoke, Quiz, Live-Musik, Sport)
- Reservierung (Link oder Formular) -> High End Table reservation mit all den Funktionalitäten, die wir schon kennen (SMS Bestätigung, Reminder)
- Google Maps Embed 
- Instagram-Link

### Nice-to-Have (später)
- Dynamischer Event-Kalender (pflegbar)
- Online-Reservierungssystem mit SMS-Bestätigung -> must
- Voice Agent für Reservierungen + FAQ 
- Dart-Verein Sektion (ab Herbst 2026)

---

## Architektur-Notizen (Skalierbarkeit)

### Was funktioniert bereits
- `CustomerSite` TypeScript-Interface ist branchenneutral (services, gallery, team, etc.) 
- SSG Template (`app/kunden/[slug]`) rendert Sections conditional
- Config-Dateien pro Kunde (`src/lib/customers/`)

### Was angepasst werden muss für Gastro/Pub
1. **ServiceIcon-Typen erweitern:** Aktuelle Icons sanitär-spezifisch (bath, heating, pipe). Gastro braucht: food, beer, music, darts, tv/sports, calendar
2. **CTA-Buttons:** "Schaden melden" → "Tisch reservieren" / "Book a table" (per Config)
3. **Section Labels:** "Leistungen" → "What We Offer" / "Unser Angebot" (per Config oder i18n)
4. **Wizard:** Sanitär-Wizard nicht anwendbar → braucht Reservierungs-Wizard (neuer Typ)
5. **Sprache:** Aktuell nur DE — i18n-Layer oder Config-based bilingual

### Empfehlung
- **Freitag-Demo:** Custom Demo Page (wie Brunner), NICHT das Template. Wow-Effekt > Skalierbarkeit.
- **Danach:** Learnings aus Pub-Demo → Template generalisieren (Config-driven CTA, Labels, Icons, i18n)
- **Repo-Struktur:** Gleicher Ordner `src/lib/customers/bigben-pub.ts` + Bilder in `public/images/kunden/bigben-pub/`

---

## Offene Fragen (für Founder)

- [ ] Genaue Öffnungszeiten bestätigen (Sonntag ja/nein?) ja die oben passen
- [ ] Speisekarte als Foto oder Text? -> hat er nichts. er bedient aber - hier müssen wir eine kreative Lösung finden. 
- [ ] Welche Events laufen aktuell regelmässig? Karaoke, Livemusic, Quiz Night, Fussball läuft täglich (das zu pflegen wäre zu viel aufwand)
- [ ] Hat Paul eine Reservierungslösung (Foratable, telefon-only)? -> 2 Wege:1. die leute kommen ein paar Tage vorher persönlich hinein und Fragen 2. Telefon
- [ ] Instagram Handle: @thebigbenpub oder @bigbenpubzh? (Beide gefunden) -> @bigbenpubzh
- [ ] 15-20 Bilder liefern (Lokal innen, aussen, Essen, Bier, Events, Paul?) -> siehe Bilder
