# Offene Tasks — FlowSight Go-Live & Beyond

> Stand: 2026-02-26 | 25h Founder-Fokus verfügbar | 4h davon für E2E Testing geblockt
> Owner-Legende: **F** = Founder | **CC** = Claude Code | **F+CC** = gemeinsam

---

## P0 — Vor Go-Live (diese Woche)

### 1. E2E Go-Live Checklist durcharbeiten
- **Owner:** F
- **Aufwand:** ~4h
- **Datei:** `docs/evidence/founder_go_live_checklist.md`
- **Worauf achten:**
  - 6 Tests nacheinander abarbeiten (Voice, Wizard, Ops, Website, Marketing, Notfall)
  - Pro Test: Screenshot in `docs/evidence/screenshots/` ablegen
  - Am Ende: Go/No-Go Entscheid unterschreiben
  - Falls FAIL: Notizen machen, CC fixt, dann erneut testen

### 2. LinkedIn Profil erstellen (persönlich)
- **Owner:** F
- **Aufwand:** ~1.5h
- **Worauf achten:**
  - Professionelles Foto (gutes Licht, neutraler Hintergrund, Handy reicht)
  - Titel: "Gründer FlowSight GmbH — Digitale Auftragsabwicklung für Sanitär- & Heizungsbetriebe"
  - Info-Text: 3-4 Sätze was FlowSight löst + Link zu flowsight.ch
  - Standort: Zürich, Schweiz
  - Erfahrung: FlowSight GmbH, Gründer & Geschäftsführer, seit 2025/2026
  - Skills: SaaS, Digitalisierung Handwerk, KI-Automatisierung
  - **Tipp:** ChatGPT kann den Info-Text schreiben — nutze das Business Briefing (`docs/business_briefing.md`)

### 3. Google Business Profil erstellen
- **Owner:** F
- **Aufwand:** ~30 min
- **Worauf achten:**
  - Firmenname: "FlowSight GmbH"
  - Kategorie: "Softwareunternehmen" oder "IT-Dienstleister"
  - Servicegebiet: Kanton Zürich / Deutschschweiz (ohne Adresse anzeigen)
  - Telefon: +41 44 505 74 20 (FlowSight Geschäftsnummer)
  - Website: flowsight.ch
  - Beschreibung: Aus Business Briefing übernehmen
  - **Wichtig:** Verifizierung dauert evtl. 1-2 Wochen (Postkarte oder Telefon) — JETZT starten

### 4. FlowSight Voice Agent bauen (Sales/Info)
- **Owner:** CC (baut) + F (testet + publiziert)
- **Aufwand:** CC ~3h, F ~1h Testing
- **Nummer:** +41 44 505 74 20 (Twilio, bereits vorhanden)
- **Was der Agent können muss:**
  - FlowSight erklären (Elevator Pitch, Module, Pricing-Ballpark)
  - Fragen zu Website, Voice, Ops, Reviews beantworten
  - Demo-Termin aufnehmen (Name, Firma, Nummer, bevorzugte Zeit)
  - Grenzen kennen: "Da müsste ich Sie an unseren Gründer weiterleiten" bei Vertragsfragen, technischen Details, Sonderwünschen
  - Authentisch, professionell, Schweizer Kontext (Du/Sie je nach Gesprächspartner)
- **Worauf achten:**
  - Agent darf KEINE falschen Versprechen machen (Preise nur als "ab CHF X", nie verbindlich)
  - Agent darf KEINE Kundendaten von Dritten preisgeben
  - Agent soll Anrufer motivieren, eine Demo zu buchen
  - **Marketing-Angle:** "Rufen Sie uns an und erleben Sie FlowSight live" auf Website + Visitenkarten
- **Deliverable:** Agent auf Retell, Webhook an FlowSight, E-Mail an Founder bei jedem Call

### 5. Business Briefing für ChatGPT erstellen
- **Owner:** CC
- **Aufwand:** ~30 min
- **Datei:** `docs/business_briefing.md`
- **Worauf achten:**
  - Copy-paste-ready für ChatGPT
  - Muss Business-Kontext geben, nicht technische Details
  - Elevator Pitch, Persona, Pricing, Positionierung, Founder-Kontext, Tonalität

### 6. Pricing-Seite aktualisieren (Website als Produkt)
- **Owner:** CC
- **Aufwand:** ~2h
- **Worauf achten:**
  - 3 Pakete: Starter (Website + Wizard), Professional (+ Voice + Ops), Premium (+ Reviews + Report)
  - Preise: Founder muss finale Zahlen bestätigen bevor es live geht
  - Website-Angebot als Türöffner positionieren, nicht als Hauptprodukt
  - "Ab CHF X/Monat" — keine verbindlichen Preise ohne Founder-Freigabe

---

## P1 — Erste Woche nach Go-Live

### 7. Cal.com einrichten + auf Website verlinken
- **Owner:** F (Account erstellen) + CC (Integration)
- **Aufwand:** F ~30 min, CC ~1h
- **Worauf achten:**
  - Free Tier reicht für den Start
  - Verfügbarkeiten einstellen (Mo-Fr, z.B. 09:00-17:00)
  - Bestätigungs-E-Mail mit Zoom/Teams-Link (oder Telefonnummer)
  - Demo-Button auf flowsight.ch soll auf Cal.com Buchungsseite zeigen
  - Kein Overkill: 1 Event-Typ "Demo (30 min)" reicht

### 8. Pitch-Deck erstellen (PDF, 5-8 Slides)
- **Owner:** CC (Entwurf) + F (Review + Anpassung)
- **Aufwand:** CC ~2h, F ~1h Review
- **Worauf achten:**
  - Slide 1: Problem (veraltete Websites, Anrufe gehen verloren, kein System)
  - Slide 2: Lösung (FlowSight in 30 Sekunden)
  - Slide 3: Live-Screenshot (Dörfler AG Website als Beweis)
  - Slide 4: Wie es funktioniert (3 Schritte: Website → Voice → Ops)
  - Slide 5: Module & Pricing
  - Slide 6: Über FlowSight / Kontakt
  - Format: PDF, kein PowerPoint (universell teilbar)
  - **Tipp:** ChatGPT kann Texte schreiben, CC kann es als HTML→PDF bauen

### 9. LinkedIn Unternehmensseite (FlowSight GmbH)
- **Owner:** F
- **Aufwand:** ~1h
- **Worauf achten:**
  - Logo (FlowSight Signal Dot)
  - Beschreibung aus Business Briefing
  - 1 Post pro Woche reicht (Vorher/Nachher Website, Feature-Update, Brancheneinblick)
  - Mitarbeiter: nur du (vorerst)

### 10. Erste Sanitärbetriebe kontaktieren
- **Owner:** F
- **Aufwand:** ongoing
- **Worauf achten:**
  - Lead-Liste pflegen (Google Sheet reicht: Firma, Kontakt, Status, nächster Schritt)
  - Einstieg über Website-Angebot: "Ich habe mir Ihre Website angeschaut..."
  - Pitch-Deck als PDF mitsenden
  - Demo über Cal.com buchen lassen
  - **Nicht vergessen:** Jeder neue Kunde = neue Zeile in `docs/customers/` + Lessons Learned ergänzen

---

## P2 — Nach Go-Live (wenn Ruhe einkehrt)

### 11. Bitwarden komplett einrichten
- **Owner:** F
- **Aufwand:** ~4h
- **Worauf achten:**
  - Alle Zugänge (Vercel, Supabase, Retell, Twilio, Peoplefone, Resend, Sentry, GitHub) sauber einpflegen
  - Master-Passwort: lang, einzigartig, nirgendwo sonst verwendet
  - 2FA für Bitwarden selbst aktivieren
  - Emergency Kit ausdrucken und sicher aufbewahren
  - Referenz: `docs/runbooks/99-secrets-policy.md`
  - **Ziel:** Jeder Service-Zugang in Bitwarden, kein Passwort im Kopf oder Browser

### 12. F9: Google Review Link für Dörfler AG
- **Owner:** F
- **Aufwand:** ~30 min
- **Worauf achten:**
  - Google Business Profil der Dörfler AG — Zugang über den Kunden oder direkt
  - Review-Link generieren (Google "Placesheet" oder über GBP Dashboard)
  - In Supabase als GOOGLE_REVIEW_URL für tenant doerfler-ag eintragen
  - Dann Reviews-Button im Ops Dashboard aktiv

### 13. Verträge / AGB Vorlage
- **Owner:** F (mit Anwalt oder ChatGPT-Entwurf)
- **Aufwand:** ~3-4h
- **Worauf achten:**
  - SaaS-Vertrag Vorlage (Schweizer Recht, Kanton Zürich)
  - Leistungsumfang, Laufzeit, Kündigung, Datenschutz, Haftung
  - Nicht übertreiben: 2-3 Seiten reichen für den Start
  - **Trigger:** Spätestens vor Kunde #2

---

## Zusammenfassung

| # | Task | Owner | Prio | Aufwand |
|---|------|-------|------|---------|
| 1 | E2E Go-Live Checklist | F | P0 | 4h |
| 2 | LinkedIn Profil (persönlich) | F | P0 | 1.5h |
| 3 | Google Business Profil | F | P0 | 0.5h |
| 4 | FlowSight Voice Agent | CC+F | P0 | 4h |
| 5 | Business Briefing (ChatGPT) | CC | P0 | 0.5h |
| 6 | Pricing-Seite Update | CC | P0 | 2h |
| 7 | Cal.com + Website-Integration | F+CC | P1 | 1.5h |
| 8 | Pitch-Deck (PDF) | CC+F | P1 | 3h |
| 9 | LinkedIn Unternehmensseite | F | P1 | 1h |
| 10 | Erste Betriebe kontaktieren | F | P1 | ongoing |
| 11 | Bitwarden einrichten | F | P2 | 4h |
| 12 | Google Review Link (Dörfler) | F | P2 | 0.5h |
| 13 | Verträge / AGB | F | P2 | 3-4h |

**Founder-Zeit P0:** ~6h | **Founder-Zeit P1:** ~2.5h+ | **Founder-Zeit P2:** ~8h
**CC-Zeit P0:** ~6h | **CC-Zeit P1:** ~5h

---

*Letztes Update: 2026-02-26*
