# FlowSight — Business Briefing

> Dieses Dokument ist dein Kontext-Dokument für ChatGPT, externe Tools und Partner.
> Copy-paste den gesamten Inhalt als System-Prompt oder ersten Message.
> Letzte Aktualisierung: 2026-02-28

---

## Was ist FlowSight?

FlowSight ist ein SaaS-Produkt für Schweizer Sanitär- und Heizungsbetriebe. Wir digitalisieren die Auftragsannahme — vom ersten Anruf bis zum erledigten Fall.

**Elevator Pitch (30 Sekunden):**
"Die meisten Sanitärbetriebe in der Schweiz haben eine veraltete Website, nehmen Aufträge per Telefon und Zettel an, und verlieren dabei Kunden. FlowSight gibt ihnen eine moderne Website, einen KI-Telefonassistenten der 24/7 Aufträge aufnimmt, und ein einfaches Dashboard wo sie alles im Griff haben. In einer Woche live, ohne IT-Kenntnisse."

## Wer ist der Zielkunde?

**Primäre Persona: Inhaber eines Sanitär-/Heizungsbetriebs**
- 3-30 Mitarbeiter
- Standort: Deutschschweiz (Fokus: Kanton Zürich, linkes Zürichseeufer)
- Alter: 35-60 Jahre
- Website: veraltet (oft von 2005-2015, nicht mobil-optimiert)
- Digitalisierungsgrad: gering bis mittel
- Schmerz: Verpasste Anrufe, unklare Auftragslage, zeitaufwändige Administration
- Entscheidung: Inhabergeführt, kurze Entscheidungswege

**Typische Aussagen:**
- "Ich bin den ganzen Tag auf der Baustelle, kann nicht ans Telefon."
- "Unsere Website sieht veraltet aus, aber wir haben keine Zeit dafür."
- "Ich schreibe mir die Aufträge auf Zettel und vergesse manchmal was."
- "Google-Bewertungen? Dazu kommen wir nie."

## Was bietet FlowSight?

### Module

| Modul | Was es macht | Kundenwert |
|-------|-------------|------------|
| **Moderne Website** | High-End Website im Firmenlook, mobil-optimiert, SEO | Professioneller Auftritt, neue Kunden über Google |
| **Schadenmelde-Wizard** | Online-Formular auf der Website: Kunde meldet Schaden direkt | Keine verpassten Aufträge, 24/7 erreichbar |
| **KI-Telefonassistent** | Sprachbasierter Agent nimmt Anrufe entgegen, erfasst den Auftrag | Kein verpasster Anruf, auch nachts/Wochenende |
| **Ops Dashboard** | Zentrale Fallübersicht: Status, Termine, Fotos, Verlauf | Überblick ohne Excel, direkt am Handy |
| **Google Reviews** | Automatisierte Bewertungsanfrage nach erledigtem Auftrag | Mehr Google-Sterne, besseres Ranking |
| **Morning Report** | Täglicher Statusbericht per WhatsApp | Tagesstart mit Überblick |

### Pakete (in Finalisierung)

| Paket | Inhalt | Preis (indikativ) |
|-------|--------|-------------------|
| **Starter** | Website + Wizard | ab CHF 99/Monat + Setup |
| **Professional** | + Voice Agent + Ops Dashboard | ab CHF 249/Monat + Setup |
| **Premium** | + Reviews + Morning Report | ab CHF 349/Monat + Setup |

*Preise sind indikativ und werden vor Launch finalisiert.*

## Was ist gebaut und live?

Alle Module sind technisch fertig und deployed:
- Website-Template: 12 Sektionen, per Kunde konfigurierbar, in ~1h erstellbar
- Voice Agent: Dual-Language (DE/INTL), Schweizer Telefonnummer, 24/7
- Wizard: 3-Schritt-Formular, mobil-optimiert
- Ops Dashboard: Fallliste, Detailansicht, Termine, Fotos, Reviews
- E-Mail-Notifications: Automatisch bei jedem neuen Fall
- Alles hosted auf Vercel (Schweizer Performance), Datenbank auf Supabase

**Erster Referenzkunde:** Dörfler AG, Oberrieden (Sanitär/Heizung seit 1926)
- Live-Website: flowsight.ch/kunden/doerfler-ag
- Voice Agent aktiv: +41 44 552 09 19

**Demo-Showcase:** Brunner Haustechnik AG (fiktiv, für Sales-Demos)
- High-End Demo-Website: flowsight.ch/brunner-haustechnik
- 10 Seed Cases im Ops Dashboard
- Wizard: flowsight.ch/brunner-haustechnik/meldung

**FlowSight Sales Agent:** "Lisa" — KI-Assistentin auf +41 44 552 09 19
- Nimmt Anrufe entgegen, qualifiziert Leads, sendet E-Mail an Gründer

## Wettbewerb und Positionierung

**Direkte Konkurrenz:** Kaum vorhanden. Es gibt keine SaaS-Lösung in der Schweiz die Website + Voice + Ops + Reviews als Paket für Sanitärbetriebe anbietet.

**Indirekte Konkurrenz:**
- Web-Agenturen (CHF 5'000-15'000 für eine Website, kein laufender Service)
- Offertenportale (renovero, local.ch — generisch, kein eigenes Branding)
- Allgemeine CRM/Ticketing (Freshdesk, Zendesk — zu komplex, nicht branchenspezifisch)

**Unser Vorteil:**
- Branchenspezifisch: Gebaut für Sanitär/Heizung, nicht generisch
- All-in-one: Website + Voice + Ops in einem Produkt
- Schnell: In einer Woche live, kein IT-Projekt
- Bezahlbar: Ab CHF 99/Monat statt CHF 10'000 einmalig
- Schweizerisch: Schweizer Nummer, Schweizer Hosting, Deutsch/Schweizerdeutsch

## Über den Gründer

- Solo-Founder, operiert remote aus Zürich
- Hintergrund: Tech + Business, hands-on Builder
- Arbeitet mit KI-Tools (Claude Code für Entwicklung, ChatGPT für Business/Content)
- Direkter Kundenkontakt: Fährt auch persönlich hin wenn nötig
- Firma: FlowSight GmbH (Schweizer GmbH)

## Tonalität und Kommunikation

- **Sprache:** Hochdeutsch mit Schweizer Einschlag (Du-Form mit Kunden, Sie-Form auf Website/offiziell)
- **Ton:** Professionell aber nahbar. Kein Corporate-Sprech. Direkt, ehrlich, lösungsorientiert.
- **Keine Buzzwords:** Nicht "KI-Revolution" sondern "Ihr digitaler Telefonassistent"
- **Branchensprache nutzen:** Sanitär, Heizung, Spenglerei, Notdienst, Rohrbruch, Badsanierung
- **Schweizer Kontext:** CHF (nicht EUR), Kantone, Gemeinden, suissetec, SIA

## Aktuelle Prioritäten

1. ~~Go-Live Testing~~ → Founder E2E Checklist (6 Tests, letzte Schritte)
2. ~~LinkedIn Profil~~ ✅ linkedin.com/in/gunnar-wende
3. ~~Google Business Profil~~ ✅ GBP live mit 7 Bildern
4. ~~FlowSight Sales Voice Agent~~ ✅ "Lisa" auf 044 552 09 19
5. **Aktive Kundenakquise ab 01.03.2026** — Demo-Website pro Prospect bauen → E-Mail → Anruf. Ziel: 5 Prospects/Woche, erster zahlender Kunde innert 6 Wochen.

## Links

- **Website:** flowsight.ch
- **Referenz-Website:** flowsight.ch/kunden/doerfler-ag
- **Demo-Showcase:** flowsight.ch/brunner-haustechnik
- **Pricing:** flowsight.ch/pricing
- **Geschäftsnummer (Lisa):** +41 44 552 09 19
- **LinkedIn:** linkedin.com/in/gunnar-wende
