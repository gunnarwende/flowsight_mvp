# GTM Pipeline Plan v2 — High-End-Maschine

> **SSOT** fuer die FlowSight Premium-Outbound-Maschine.
> Erstellt: 2026-03-09 | Owner: Claude Code (CC) | Strategische Architektur: ChatGPT | Entscheidungen: Founder
> Goldstandard-Betrieb: Jul. Weinberger AG, Thalwil

---

## 1. Warum dieses Dokument existiert

FlowSight braucht ein GTM-System das:

1. **Jeden Prospect in <10 Minuten** mit personalisiertem Video, eigener Lisa, Demo-Website und E2E-Proof erreicht
2. **High-End nach aussen** wirkt — kein Massen-Outreach, kein "Demo buchen", sondern "Erleben Sie Ihre eigene Lisa"
3. **Modular nach innen** gebaut ist — atomare Scripts, Templates, Runbooks statt monolithischer Agent
4. **In 4 Wochen steht** und danach laeuft, ohne nochmal angefasst zu werden

Dieses Dokument ist die komplette Referenz: Was existiert, was fehlt, was gebaut wird, wer was tut, und welche Konsequenzen das fuer den Rest des Systems hat.

---

## 2. Kernpositionierung (verbindlich)

> **FlowSight = Leitsystem, damit keine Anfrage verloren geht.**

### Was das fuer GTM bedeutet

| Regel | Konsequenz |
|-------|-----------|
| Nicht website-first framen | Die Website ist ein Baustein, nicht das Produkt. Voice + Ops + Reviews sind gleichwertig. |
| CTA = "Eigene Lisa testen" | Nie "Demo buchen". Der Prospect ruft an und erlebt. |
| Bestehende Websites bleiben | FlowSight ersetzt nicht, sondern ergaenzt (CTA/Button auf Wizard + Voice) |
| Fokus Sanitaer/Heizung | Keine Branchenstreuung im MVP |
| Wizard = Standard | Schriftliche Anliegen laufen immer ueber den Wizard, nie Kontaktformular |
| Integration ueber CTA | Zusaetzlicher Button auf bestehender Website zeigt auf Wizard |

### Wizard Operating Rules (verbindlich)

| Regel | Bedeutung |
|-------|-----------|
| **Wizard = einziger schriftlicher Intake** | Kein Kontaktformular, kein E-Mail-Formular, kein "Schreiben Sie uns". Schriftliche Anliegen laufen ausschliesslich ueber den FlowSight-Wizard. |
| **Kein Kontaktformular-Mapping** | Wir bauen keine Bruecke zwischen bestehenden Kontaktformularen und FlowSight. Der Wizard IST der Eingangskanal. |
| **Website-CTA zeigt auf Wizard** | Jeder "Schaden melden"-Button, jeder "Kontakt"-CTA auf der FlowSight-Website fuehrt zum Wizard. Nicht zu einem Formular, nicht zu einer E-Mail-Adresse. |
| **Wizard erzeugt strukturierten Fall in Ops** | Jede Wizard-Eingabe wird sofort als Case in Supabase angelegt (POST /api/cases), mit seq_number (FS-XXXX), Urgency-Erkennung, und Ops-Notification per Email. Kein manueller Zwischenschritt. |
| **Wizard-Kategorien aus services[]** | Die Wizard-Kategorien werden automatisch aus der Customer Config abgeleitet. Wenn der Betrieb Sanitaer + Heizung + Lueftung anbietet, zeigt der Wizard genau diese 3 Kategorien. |
| **Wizard in Leckerli C/D = operativer Beweis** | Im E2E-Proof (C) und High-touch (D) ist der Wizard der sichtbare schriftliche Eingangskanal neben Voice. Er zeigt: auch ohne Anruf geht keine Anfrage verloren. |
| **Wizard ist nicht das Erst-Leckerli** | Im Outreach fuehrt der CTA zu Lisa (Voice), nicht zum Wizard. Der Wizard wird sichtbar wenn der Prospect die Website besucht oder den E2E-Proof erlebt. |

### Was "High End" in dieser Pipeline konkret bedeutet

High-End ist kein vager Anspruch, sondern eine pruefbare Checkliste. Jeder Prospect-Touchpoint muss ALLE diese Punkte erfuellen:

1. **Kein generisches Outreach** — Jede Email, jedes Video, jeder Anruf enthaelt den Firmennamen, die Region, das Gewerk und einen glaubwuerdigen Use Case. Nie "Sehr geehrter Handwerksbetrieb".
2. **Keine generische Lisa** — Die Lisa des Prospect begruesst mit seinem Firmennamen, kennt seine Gewerke, triagiert seine typischen Faelle. Nicht "Willkommen beim Kundendienst".
3. **Keine erfundenen Fakten** — Goldene Regel #1. Jeder Service, jedes Team-Mitglied, jedes Gruendungsjahr kommt von der Originalwebsite. Lieber Luecke als Luege.
4. **Keine halbe Demo** — Wenn wir A+B zeigen, muss beides funktionieren. Keine kaputten Links, keine unpublished Agents, keine leeren Website-Sektionen mit Platzhaltern.
5. **Klare operative Story** — Jeder Touchpoint zeigt: Triage, Dringlichkeit, strukturierte Aufnahme, SMS-Bestaetigung, sauberer Fall in Ops. Das ist der rote Faden.
6. **Persoenlicher CTA** — "Testen Sie Ihre eigene Lisa: [Nummer]". Nicht "Demo buchen". Nicht "Kontaktieren Sie uns". Der Prospect kann SOFORT handeln.
7. **Modularer, driftfreier Unterbau** — Qualitaet ist wiederholbar weil das System modular gebaut ist. Nicht weil jemand an einem guten Tag besonders sorgfaeltig war.

**Pruefungsregel:** Wenn ein Prospect einen Touchpoint erhaelt und auch nur EINEN dieser 7 Punkte nicht erfuellt sieht → es geht nicht raus. Lieber 3 perfekte Outreaches pro Woche als 10 mittelmässige.

### Was im Pitch NIE gesagt wird

- "KI-Telefonassistent" (klingt nach Spielerei)
- "Wir ersetzen Ihre Website" (klingt nach Drohung)
- "Automatisierung" (klingt kalt)
- "Demo buchen" (zu hohe Hemmschwelle)

### Was im Pitch IMMER gezeigt wird

- Operative Staerke: Triage, Dringlichkeit, strukturierte Aufnahme
- Persoenlicher Betriebsbezug: Firmenname, Region, Gewerk
- End-to-End-Kette: Anruf → SMS → Fall in Ops
- "Keine Anfrage geht verloren" als Leitgedanke

---

## 3. Proof-System: Leckerli A-D

Vier Tiefenstufen, kein separates Produkt. Jede Stufe baut auf der vorherigen auf.

### A — Personalisiertes Kurzvideo (45-60 Sekunden)

**Ziel:** Aufmerksamkeit + Relevanz. "Wir haben Ihren Betrieb verstanden."

**Dramaturgie (5 Szenen, immer gleich):**

```
SZENE 1 (5s): Persoenlicher Einstieg
  "Jul. Weinberger AG, Haustechnik seit 1912 in Thalwil."
  [Screenshot: aktuelle Website des Prospect]

SZENE 2 (10s): Typischer Fall
  "Samstag Abend. Ein Kunde ruft an: Wasserleck im Keller.
   Ihr Pikett nimmt ab — oder eben nicht."
  [Screenshot: Handy klingelt, verpasster Anruf]

SZENE 3 (15s): Lisa-Moment
  "Mit FlowSight nimmt Ihre persoenliche Lisa den Anruf an.
   Sie erkennt den Notfall, sammelt Adresse und Situation."
  [Screen Recording: Lisa-Anruf live]

SZENE 4 (15s): Proof-Moment
  "Der Kunde bekommt eine SMS-Bestaetigung.
   Der Fall landet sofort in Ihrem Dashboard — mit allen Details."
  [Screenshot: SMS + Ops-Dashboard mit Fall]

SZENE 5 (10s): CTA
  "Testen Sie Ihre eigene Lisa: [Testnummer]
   Oder schauen Sie sich Ihre neue Website an: [URL]"
  [Screenshot: Prospect-Website auf FlowSight]
```

**Produktion:** Founder nimmt auf (Loom/OBS). Screen Recording + Voice-Over. ~15 Min pro Video nach Template.

**Technische Voraussetzung:** Leckerli B + D muessen vorher stehen (Lisa + Website fuer Screenshots).

### B — Persoenliche Test-Lisa des Betriebs

**Ziel:** Erlebnis. "Rufen Sie Ihre eigene Lisa jetzt an."

**Was die Lisa koennen muss:**
- Begruessen mit Firmenname + Gewerk
- 1-2 typische Faelle triagieren (Notfall vs. Kundendienst vs. Neuinstallation)
- Dringlichkeit erkennen
- Postleitzahl, Ort, Name, Beschreibung sammeln
- Sauber verabschieden

**Zwei Varianten:**

| Variante | Einsatz | Setup-Zeit | Personalisierung |
|----------|---------|-----------|-----------------|
| **B-Quick:** Parametrisierter Demo-Agent | Leckerli A+B (Standard-Outreach) | ~2 Min | Firmenname + Region + Gewerk via Dynamic Variables |
| **B-Full:** Eigener Agent pro Prospect | Leckerli C+D (Top-Prospects) | ~10 Min | Volle Kontrolle: Greeting, Faelle, Tonalitaet, Services |

**B-Quick Implementierung (NEU zu bauen):**
- 1 universeller Demo-Agent mit Variablen-Slots im Global Prompt
- Variablen: `{FIRMA}`, `{GEWERK}`, `{REGION}`, `{SERVICES}`, `{NOTDIENST}`
- Beim Anruf: Variablen aus Prospect Card injiziert
- Shared Testnummer (Brunner Demo-Nr oder neue dedizierte Prospect-Demo-Nr)

**B-Full Implementierung (EXISTIERT bereits):**
- `prospect_pipeline.mjs` generiert bereits `{slug}_agent.json` + `{slug}_agent_intl.json`
- `retell_sync.mjs --prefix {slug}` synct + publisht
- Volle Personalisierung: FIRMEN-WISSEN Block, Kategorien, Gemeinden, Preise
- Eigene Nummer oder SIP-Routing

### C — Personalisierter E2E-Proof

**Ziel:** Operativer Beweis. "Die ganze Kette funktioniert."

**Was der Prospect sieht:**
1. Anruf → Lisa nimmt ab, triagiert
2. SMS-Bestaetigung mit Korrekturmoeglichkeit
3. Fall im Ops-Dashboard (Kategorie, Dringlichkeit, alle Details)
4. Optional: Review-Anfrage als Folgeprozess

**Technische Voraussetzung:** B-Full + Supabase Tenant + SMS-Channel aktiv.
Entspricht dem bestehenden `onboarding_customer_full.md` Runbook (55 Min), reduziert auf Prospect-Demo-Scope.

### D — High-touch Website-Vorwegnahme

**Ziel:** "So sieht Ihre Zukunft mit FlowSight aus."

**Was der Prospect sieht:**
- Volle FlowSight-Website mit seinen Services, Team, Reviews, Galerie
- Wizard mit seinen Kategorien
- Voice-CTA mit seiner Lisa
- Notdienst-Banner (wenn relevant)

**Technische Voraussetzung:** Customer Config + Bilder + Registry.
Entspricht dem bestehenden `prospect_pipeline.mjs --url` Workflow (~20 Min).

**EXISTIERT BEREITS** — das Template-System ist produktionsreif (12 Sektionen, ServiceDetailOverlay, Lightbox, Brand Color).

### Einsatzlogik: Wer bekommt was?

| ICP Score | Leckerli-Paket | Assets | Setup-Zeit |
|-----------|---------------|--------|-----------|
| 90+ (Top) | A+B-Full+C+D | Video + eigener Agent + E2E + Website | ~45 Min |
| 75-89 (Gut) | A+B-Quick+D | Video + parametrisierte Lisa + Website | ~20 Min |
| 60-74 (Okay) | B-Quick+D | Parametrisierte Lisa + Website | ~12 Min |
| <60 | Skip | — | 0 |

**Sonderfall: Bestehende Kunden-Websites (Leuthold, Orlandini, Widmer):**
Diese sind bereits Leckerli D. Fehlend: B (Lisa) + A (Video). Koennen mit B-Quick in <5 Min ergaenzt werden.

---

## 4. Goldstandard: Jul. Weinberger AG, Thalwil

### Warum Weinberger

| Eigenschaft | Wert | GTM-Relevanz |
|-------------|------|-------------|
| Gruendung | 1912 (113 Jahre) | Emotionale Story: "Seit 1912. Jetzt mit dem Leitsystem der naechsten Generation." |
| Team | 10+ Mitarbeiter, 4 Abteilungsleiter | Groesse = Budget + operative Komplexitaet (= mehr Pain bei Anrufmanagement) |
| Gewerke | Sanitaer, Heizung, Lueftung, Badsanierung | Breite Triage-Moeglichkeiten fuer Lisa |
| Standort | Thalwil | Selber Ort wie Brunner HT (Demo-Tenant) → Cluster-Effekt |
| Notdienst | 24h Emergency Service | **Killer-Use-Case**: Samstag-Nacht-Szenario |
| Google Reviews | 4.3 Sterne / 17 Bewertungen | Genug fuer Reviews-Sektion + Verbesserungspotenzial als Pitch |
| Website | Modern (Elementor, professionell) | Betrieb investiert in digital = Budget-Signal |
| Lehrstellen | Sanitaer EFZ + Heizung EFZ | Zeigt Substanz und Langfristigkeit |
| Brand Color | Navy #004994 | Professionell, passt zu FlowSight-Aesthetik |
| LinkedIn | Firmenprofil vorhanden | Zusaetzlicher Outreach-Kanal moeglich |

### Weinberger A-D konkret

**A (Video):**
> "Jul. Weinberger AG — Haustechnik seit 1912 in Thalwil. 10 Mitarbeiter, 4 Abteilungen, 24-Stunden-Notdienst. Sie kennen das: Samstag Abend, ein Kunde ruft an — Wasserleck im Keller. Wer nimmt ab? [Lisa-Anruf zeigen] Mit FlowSight nimmt Ihre Lisa den Anruf an, erkennt den Notfall, und der Fall landet sofort in Ihrem Dashboard. Testen Sie Ihre eigene Lisa: [Nummer]."

**B (Lisa — B-Full):**
- Greeting: "Guten Tag, hier ist Lisa — die digitale Assistentin der Jul. Weinberger AG. Wie kann ich Ihnen helfen?"
- Triage: Kundendienst (Reparatur) vs. Notfall (24h) vs. Neuinstallation (Heizung/Bad/Lueftung)
- Kategorien: Sanitaer, Heizung, Lueftung, Badsanierung, Boiler, Reparatur
- Gemeinden: Thalwil, Oberrieden, Horgen, Kilchberg, Rueschlikon, Adliswil
- Notdienst-Erkennung: "Wasserleck", "Rohrbruch", "Gas" → urgency=notfall

**C (E2E):**
Samstag-Nacht-Szenario:
1. Anruf: "Guten Abend, ich habe ein Wasserleck im Keller, Wasser laeuft, es ist dringend!"
2. Lisa: Erkennt Notfall, sammelt PLZ 8800, Thalwil, Seestrasse 15, Herr Mueller
3. SMS: "Vielen Dank, Herr Mueller. Ihre Meldung wurde aufgenommen. Die Weinberger AG meldet sich umgehend."
4. Ops: Fall FS-0001, urgency=notfall, Kategorie=Sanitaer, alle Details sichtbar
5. Pikett-Monteur sieht Fall sofort auf Handy

**D (Website):**
- 4+ Services mit ServiceDetailOverlay + Bullets
- 17 Reviews (4.3 Sterne)
- Team-Sektion (10+ Personen mit Rollen)
- 24h Notdienst-Banner
- Galerie pro Service
- Wizard mit Kategorien aus services[]
- Brand Color #004994

---

## 5. Was existiert vs. was gebaut werden muss

### Bestandsaufnahme: Bestehende Assets

| Asset | Status | Abdeckung |
|-------|--------|-----------|
| **scout.mjs** | LIVE | ICP-Scoring, Multi-Query, Municipality Scouting → Prospect Discovery |
| **crawl-website.mjs** | LIVE | Image-Extraction, 50+ Pages, Lightbox-Detection → Bilder fuer Website |
| **prospect_pipeline.mjs** | LIVE | End-to-End: Crawl → Config → Tenant → Voice Agent JSON (Quick + Config Mode) |
| **retell_sync.mjs** | LIVE | Agent JSON → Retell API → Auto-Publish (DE + INTL, Cross-Link, Persist IDs) |
| **onboard_tenant.mjs** | LIVE | Supabase Tenant + Phone Numbers (Standalone) |
| **promote.mjs** | LIVE | Scout CSV → Pipeline CSV (Founder-reviewed) |
| **Kunden-Template** | LIVE | 12 Sektionen, ServiceDetailOverlay, Lightbox, Brand Color, Wizard, responsive |
| **Kunden-Registry** | LIVE | 5 Kunden + BigBen Pub registriert |
| **Retell Agent Template** | LIVE | Brunner als Master-Template: FIRMEN-WISSEN, Modus-Erkennung, Kategorien, 7-Fragen-Limit |
| **Email-Templates** | LIVE | Ops-Notification, Melder-Bestaetigung, Review-Request, Sales-Lead |
| **Pipeline Tracking** | LIVE | pipeline.csv + pipeline.md (Stages, Email-Template, Call-Script, Metrics) |
| **Sales Email-Template** | LIVE | In pipeline.md definiert (Betreff, Body, CTA auf Demo-Website) |
| **Outreach Call-Script** | LIVE | In pipeline.md definiert (Follow-up nach 2 Tagen) |
| **Voice Analysis Chain** | LIVE | 6 Module: collect → transcribe → analyze → correlate → report |
| **32 Runbooks** | LIVE | Onboarding, Voice E2E, Sales Agent, Demo Script, Monitoring, Incidents |

**Fazit: ~70% der GTM-Maschine existiert bereits.** prospect_pipeline.mjs allein deckt Crawl + Config + Tenant + Voice Agent ab.

### Was FEHLT (zu bauen in 4 Wochen)

| # | Baustein | Beschreibung | Abhaengigkeit | Aufwand |
|---|---------|-------------|--------------|---------|
| G1 | **Prospect Card Format** | Strukturiertes JSON zwischen Scout und Provisioning. Enthalt: Firma, Gewerk, Region, Brand Color, Services, Phone, Notdienst, Reviews, ICP-Score, Leckerli-Empfehlung, staerkster Demo-Fall | scout.mjs + crawl | ~3h |
| G2 | **B-Quick Demo-Agent** | 1 parametrisierter Retell Agent mit Variablen-Slots. Shared Testnummer. Fuer Standard-Outreach (Score 60-89). | Retell Dynamic Variables oder General Prompt Slots | ~4h |
| G3 | **Provisioning Runbook (<10 Min)** | Step-by-Step: Prospect Card → Config → Deploy → Lisa → Video → Outreach. Checkliste + Quality Gates. | G1, G2 | ~2h |
| G4 | **Video-Produktions-Template** | Standardisiertes Skript mit Variablen, OBS/Loom Scene-Setup, Szenenfolge, Export-Specs. Founder produziert nach Template. | Leckerli B+D muessen stehen | ~2h |
| G5 | **Premium Outreach-Templates** | Upgrade der bestehenden Email/Call-Templates auf Premium-Niveau. Mit Leckerli A-D Varianten. Von ChatGPT getextet. | ChatGPT-Messaging | ~1h (CC-Verankerung) |
| G6 | **Einsatzlogik-Engine** | Script oder Entscheidungstabelle: ICP Score → Leckerli-Paket → Asset-Liste → Provisioning-Steps. | G1 | ~1h |
| G7 | **Pipeline Tracker Upgrade** | pipeline.csv um Leckerli-Stage, Asset-Status, Demo-URLs, Testnummern erweitern. Scout-Review XLSX um Leckerli-Empfehlung. | promote.mjs | ~2h |
| G8 | **Quality Gates Checklist** | Pro Prospect: Wirkt persoenlich? Lisa glaubwuerdig? Testfall operativ? SMS stimmt? Fall sauber? CTA klar? Datenschutz-Framing? | G3 | ~1h |
| G9 | **Weinberger Goldstandard** | Voller A+B+C+D Durchlauf fuer Weinberger AG als Referenzimplementierung. | Alles oben | ~4h |
| G10 | **GTM SSOT Docs** | Dieses Dokument + Decision Rules + Rollen-Referenz im Repo verankert. | — | ~1h |

**Gesamt-Aufwand Neubau: ~20h** (verteilt auf 4 Wochen, ~5h/Woche CC-Arbeit)

---

## 6. Downstream-Konsequenzen (was sich aendert)

Der Bau der GTM-Maschine hat Auswirkungen auf bestehende Systeme:

### 6.1 prospect_pipeline.mjs — Erweiterung

**Aktuell:** Crawl → Config → Tenant → Voice Agent JSON
**Neu:** + Prospect Card Output (G1) + B-Quick Agent Option + Leckerli-Stage Tracking

Aenderungen:
- `--mode quick` generiert zusaetzlich `docs/customers/{slug}/prospect_card.json`
- Neuer Flag `--demo-only` — erstellt Config + Registry, aber KEINEN Supabase Tenant (spart Ressourcen fuer Prospects die noch nicht Kunde sind)
- Neuer Flag `--lisa-quick` — verwendet parametrisierten Demo-Agent statt eigenem Agent
- Output-Summary enthaelt: Leckerli-Empfehlung basierend auf ICP Score

### 6.2 scout.mjs — Erweiterung

**Aktuell:** ICP Score → Tier (HOT/WARM/COLD)
**Neu:** + Leckerli-Empfehlung + Staerkster Demo-Fall Ableitung

Aenderungen:
- Neues Feld `leckerli_recommendation` in scout_raw.csv: A+B+C+D / A+B+D / B+D / SKIP
- Neues Feld `best_demo_case` abgeleitet aus: Notdienst-Signal → "Samstag-Nacht-Notfall", Heizung-Fokus → "Heizung faellt aus im Winter", Sanitaer-Standard → "Kein Warmwasser seit heute Morgen"
- XLSX Export zeigt Leckerli-Empfehlung farbcodiert

### 6.3 retell_sync.mjs — Keine Aenderung

Funktioniert bereits korrekt: Liest JSON, synct, cross-linkt, publisht. Keine Anpassung noetig.

### 6.4 Retell Agent Template — Erweiterung

**Aktuell:** brunner_agent.json als Master-Template
**Neu:** + Universeller Demo-Agent Template (B-Quick)

Neues File: `retell/exports/demo_prospect_agent.json`
- Global Prompt mit Variablen-Slots: `{FIRMA}`, `{GEWERK}`, `{REGION}`, `{SERVICES}`, `{NOTDIENST_TEXT}`
- Reduzierter Scope: Nur Intake-Modus (kein Info-Modus — Prospect-Lisa muss nicht Oeffnungszeiten kennen)
- Generische Kategorien: Sanitaer, Heizung, Lueftung, Reparatur, Notfall
- Generisches Einzugsgebiet: "{REGION} und Umgebung"
- Kein SMS-Channel (Demo only)
- Webhook: Shared Demo-Tenant oder `/api/retell/webhook` mit Demo-Fallback

### 6.5 Kunden-Template System — Keine Aenderung

Das Template-System (types.ts, registry.ts, page.tsx, ImageGallery.tsx) ist bereits produktionsreif. prospect_pipeline.mjs generiert konforme Configs. Keine Anpassung noetig.

### 6.6 FlowSight Marketing-Website — Anpassung

**Aktuell:** Homepage, Pricing, Demo-Booking, Impressum, Datenschutz
**Neu:** CTA-Anpassung auf Premium-Positioning

Aenderungen:
- Demo-Seite (`/demo`): "Buchen Sie eine Demo" → "Erleben Sie Ihre eigene Lisa" mit Testnummer
- Pricing-Seite: Testimonial-Sektion vorbereiten (nach erstem zahlenden Kunden)
- Homepage: "Leitsystem" Messaging schaerfen (wenn ChatGPT finale Texte liefert)

**Prioritaet:** NIEDRIG. Erst nach Weinberger-Goldstandard. Die Marketing-Website ist nicht der primaere Sales-Kanal.

### 6.7 Sales Agent "Lisa" — Pruefung

**Aktuell:** Lisa auf 044 552 09 19, nimmt Sales-Anfragen an, sendet Lead-Email
**Frage:** Soll die Sales-Lisa auch als Demo-Entry-Point fuer Prospects dienen?

**Empfehlung:** Nein. Sales-Lisa bleibt fuer eingehende Anfragen. Prospect-Demo-Lisa ist separat (parametrisiert pro Betrieb). Klare Trennung.

### 6.8 Pipeline Tracking — Erweiterung

**Aktuell:** pipeline.csv mit: firma, ort, website, kontakt, telefon, email, status, notizen, demo_url, email_gesendet, anruf_1, google_rating, google_reviews, score
**Neu:** + leckerli_paket, + lisa_status (none/quick/full), + video_status (none/draft/sent), + website_url, + testnummer

Aenderungen in pipeline.csv:
```
+ leckerli_paket: "A+B+D" | "B+D" | "A+B+C+D"
+ lisa_status: "none" | "quick" | "full" | "published"
+ video_status: "none" | "recorded" | "sent"
+ website_url: "flowsight.ch/kunden/{slug}"
+ testnummer: "+41 44 505 XX XX"
```

### 6.9 Email-System — Erweiterung

**Aktuell:** 4 Email-Typen (Ops-Notification, Reporter-Confirmation, Review-Request, Sales-Lead)
**Neu:** + Premium Outreach Email (5. Typ)

Optionen:
1. **Manuell (Founder sendet aus eigenem Mail)** — Empfohlen fuer MVP. Persoenlicher.
2. **Resend-Template** — Spaeter, wenn >10 Outreaches/Woche

**Empfehlung:** Manuell. Die Outreach-Mail kommt von gunnar@flowsight.ch, nicht von noreply@. Das ist persoenlicher und High-End-konformer.

### 6.10 Supabase — Pruefung

**Frage:** Brauchen wir eine `prospects` Tabelle?
**Antwort:** Noch nicht. pipeline.csv reicht bis Prospect #30. Supabase-Tabelle erst wenn:
- >30 aktive Prospects
- Ops-Dashboard Prospect-View gewuenscht
- Automatische Status-Updates noetig

---

## 7. Rollenmodell (verbindlich)

### Founder

| Verantwortung | Beispiele |
|--------------|-----------|
| **Markt + Urteil** | Welcher Prospect? A/B/C Rating? Welches Leckerli-Paket? |
| **Qualitaetsschwelle** | Wirkt die Lisa glaubwuerdig? Ist das Video high-end genug? |
| **Outreach + Closing** | Email senden, Anruf machen, Verhandlung, Abschluss |
| **Priorisierung** | Welche 5 Prospects diese Woche? Was hat Vorrang? |
| **Stop/Go** | Finale Freigabe vor jedem Outreach |
| **Video-Produktion** | Aufnehmen nach CC-Template (Loom/OBS, ~15 Min/Video) |

### Claude Code (CC)

| Verantwortung | Beispiele |
|--------------|-----------|
| **System-Owner** | Repo, SSOT, Runbooks, Scripts, Agent-Configs |
| **Implementierung** | Scripts bauen/erweitern, Templates erstellen, Configs generieren |
| **Orchestrierung** | prospect_pipeline.mjs, retell_sync.mjs, Deployment |
| **Drift-Vermeidung** | SSOT-Docs aktuell halten, Widersprueche markieren |
| **Qualitaetssicherung** | Build, Lint, Voice Regression, QA-Checklisten |
| **Challenge** | ChatGPT-Vorschlaege gegen technische Realitaet pruefen |

### ChatGPT

| Verantwortung | Beispiele |
|--------------|-----------|
| **GTM-Architektur** | Positionierung, Angebotslogik, Phasenmodell |
| **Messaging** | Outreach-Texte, CTA-Formulierungen, Video-Skripte |
| **Proof-Design** | A-D Dramaturgie, Demo-Fall-Auswahl |
| **Sparring** | CC-Vorschlaege auf kommerzielle Schaerfe pruefen |

### Handoff-Regeln

1. **ChatGPT → CC:** ChatGPT liefert Texte/Struktur als Markdown. CC verankert als SSOT im Repo. CC darf Texte NICHT eigenmächtig aendern — Aenderungsvorschlaege zurueck an Founder.
2. **CC → Founder:** CC liefert fertige Assets (Website, Lisa, Prospect Card). Founder reviewed und gibt frei.
3. **Founder → CC:** "Mach Weinberger" reicht. CC fuehrt Provisioning Runbook aus.
4. **Founder → ChatGPT:** Strategische Fragen, Messaging-Iterationen, Pitch-Formulierungen.

---

## 8. Vier-Wochen-Fahrplan

### Woche 1: Foundation + Weinberger Crawl

| Tag | CC-Task | Founder-Task | ChatGPT-Task |
|-----|---------|-------------|-------------|
| Mo | G10: Dieses Dokument finalisieren + im Repo verankern | Review + Freigabe GTM Plan v2 | — |
| Di | G1: Prospect Card Format definieren + in scout.mjs/prospect_pipeline.mjs integrieren | — | Premium Outreach-Texte (Email + Call-Script + Video-Skript) |
| Mi | Weinberger Crawl: `prospect_pipeline.mjs --url julweinberger.ch --slug weinberger-ag` | Review Crawl-Output, Bilder-Auswahl | — |
| Do | Weinberger Config verfeinern (Services, Team, Reviews, Notdienst, Brand Color) | QA: Stimmen alle Fakten? Nichts erfunden? | — |
| Fr | Weinberger Website deployen + Registry + Build + PR | Review Website auf Handy + Desktop | — |

**Woche 1 Output:**
- GTM SSOT verankert (dieses Dokument)
- Prospect Card Format definiert
- Weinberger Website LIVE (Leckerli D fertig)

### Woche 2: Lisa + Video-System

| Tag | CC-Task | Founder-Task | ChatGPT-Task |
|-----|---------|-------------|-------------|
| Mo | G2: B-Quick Demo-Agent Template bauen (`retell/exports/demo_prospect_agent.json`) | — | Video-Skript finalisieren (5-Szenen-Template) |
| Di | Weinberger B-Full Agent: `prospect_pipeline.mjs` Voice-Output → `retell_sync.mjs --prefix weinberger-ag` | Weinberger Lisa anrufen, Qualitaet pruefen | — |
| Mi | G4: Video-Produktions-Template erstellen (Szenen, Timing, Variablen, Export-Specs) | — | Outreach-Email Varianten (mit/ohne Referenz, mit/ohne Video) |
| Do | G5: Premium Outreach-Templates im Repo verankern (von ChatGPT-Texten) | Erstes Weinberger-Video aufnehmen (Loom/OBS nach Template) | — |
| Fr | G6: Einsatzlogik-Engine (Score → Leckerli → Steps) + G7: Pipeline Tracker Upgrade | Video QA: Wirkt es high-end? Ist der CTA stark? | — |

**Woche 2 Output:**
- B-Quick Demo-Agent Template (universell)
- Weinberger Lisa LIVE (B-Full, eigener Agent, published)
- Video-Template standardisiert
- Erstes Weinberger-Video produziert (Leckerli A)
- Outreach-Templates verankert
- Pipeline Tracker erweitert

### Woche 3: E2E Proof + Provisioning Runbook

| Tag | CC-Task | Founder-Task | ChatGPT-Task |
|-----|---------|-------------|-------------|
| Mo | Weinberger C: Supabase Tenant + SMS Channel + Full E2E Test | Weinberger E2E Testanruf (Samstag-Nacht-Szenario durchspielen) | — |
| Di | G3: Provisioning Runbook schreiben (Step-by-Step, <10 Min Target) | Review E2E: SMS korrekt? Ops-Fall sauber? | QA auf Messaging: Wirkt alles premium? |
| Mi | G8: Quality Gates Checklist + in Runbook einbetten | — | — |
| Do | Zweiter Prospect: B-Quick + D testen an einem WARM-Prospect (Score 60-74). Validierung: Geht es in <12 Min? | Auswaehlen: Welcher Prospect aus Pipeline? | — |
| Fr | Iteration: Was hat beim zweiten Prospect nicht funktioniert? Runbook anpassen. | Feedback: Wo war es nicht high-end genug? | — |

**Woche 3 Output:**
- Weinberger E2E komplett (Leckerli A+B+C+D)
- Provisioning Runbook fertig (<10 Min Ziel validiert)
- Quality Gates Checklist
- Zweiter Prospect provisioniert (Validierung des Systems)

### Woche 4: Haertung + GTM-Go-Live

| Tag | CC-Task | Founder-Task | ChatGPT-Task |
|-----|---------|-------------|-------------|
| Mo | 3. + 4. Prospect provisionieren (verschiedene Leckerli-Stufen testen) | QA: Qualitaet konsistent? | — |
| Di | scout.mjs Erweiterung: Leckerli-Empfehlung + Best-Demo-Case Felder | Review XLSX: Stimmen die Empfehlungen? | — |
| Mi | Alle SSOT-Docs updaten: STATUS.md, OPS_BOARD.md, Runbooks angleichen | — | Finale QA auf alle Outreach-Texte |
| Do | Smoke-Test: Gesamter Flow 1x durchspielen (Scout → Card → Provision → Lisa → Video → Email) | Durchspielen als Founder: Fuehlt sich der Flow natuerlich an? | — |
| Fr | Bugfixes + letzte Anpassungen. GTM-Maschine = LIVE. | **Go/No-Go Entscheidung: Ist die Maschine high-end genug?** | — |

**Woche 4 Output:**
- 4-5 Prospects provisioniert (verschiedene Stufen)
- Scout mit Leckerli-Empfehlung
- Alle SSOT-Docs aktuell
- Gesamter Flow validiert
- **GTM-Maschine GO-LIVE**

---

## 9. Der <10-Minuten-Flow (Zielzustand Woche 4)

```
FOUNDER:  "Mach Huber Sanitaer AG, Horgen."

CC:       1. prospect_pipeline.mjs --url huber-sanitaer.ch
             --slug huber-sanitaer --demo-only          [3 Min]
          → Crawl: Brand Color, Services, Phone, Emergency
          → Config: src/lib/customers/huber-sanitaer.ts (Draft)
          → Prospect Card: docs/customers/huber-sanitaer/prospect_card.json
          → Bilder: public/kunden/huber-sanitaer/

          2. Registry Update + Build + Deploy             [2 Min]
          → Website LIVE: flowsight.ch/kunden/huber-sanitaer

          3. Lisa Provisioning (B-Quick oder B-Full)      [2-10 Min]
          → B-Quick: Variablen in Demo-Agent setzen       [2 Min]
          → B-Full: retell_sync.mjs --prefix huber-sanitaer [10 Min]

          4. Pipeline Tracker Update                       [1 Min]
          → pipeline.csv: Status, Leckerli, Assets, URLs

FOUNDER:  5. Video aufnehmen (nach Template)              [15 Min]
          6. Outreach-Email senden                         [2 Min]

TOTAL CC-ARBEIT:  ~8 Min (B-Quick) oder ~15 Min (B-Full)
TOTAL FOUNDER:    ~17 Min (Video + Email)
TOTAL:            ~25 Min fuer A+B+D Paket
                  ~10 Min fuer B+D Paket (ohne Video)
```

### Optimierungspotenzial nach Woche 4

| Engpass | Loesung | Spart |
|---------|---------|-------|
| Config-Review braucht Founder | Auto-Validate gegen Crawl-Daten (keine erfundenen Fakten wenn nur Crawl-Input) | ~3 Min |
| Bilder manuell auswaehlen | Top-12-by-Filesize Heuristik (schon in prospect_pipeline.mjs) | ~5 Min |
| Video-Aufnahme | Semi-Template mit Pre-filled Slides/Screens | ~5 Min |
| Registry manuell updaten | prospect_pipeline.mjs macht das bereits automatisch | 0 (schon automatisch) |

---

## 10. Quality Gates (verbindlich)

### Gate 1: Prospect Card (nach Scout)
- [ ] ICP Score >= 60
- [ ] Mindestens 1 Telefonnummer
- [ ] Website erreichbar
- [ ] Gewerk = Sanitaer/Heizung/Haustechnik
- [ ] Region = Deutschschweiz (Fokus Zuerichhsee)

### Gate 2: Website (vor Deploy)
- [ ] Alle Services verifiziert (auf echter Website vorhanden)
- [ ] Kein Content erfunden (Goldene Regel #1)
- [ ] Brand Color korrekt extrahiert
- [ ] Firmenname EXAKT wie auf Originalwebsite
- [ ] Bilder aus Crawl, nicht generisch
- [ ] Notdienst NUR wenn auf Originalwebsite angeboten
- [ ] Wizard-Kategorien passen zu Services
- [ ] Mobile responsive (Schnellcheck)

### Gate 3: Lisa (vor Outreach)
- [ ] Begruessng mit korrektem Firmennamen
- [ ] Gewerk-Triage funktioniert (mindestens 2 Kategorien)
- [ ] Notfall-Erkennung aktiv (wenn Notdienst)
- [ ] Verabschiedung sauber (kein Loop)
- [ ] Testanruf absolviert (CC oder Founder)

### Gate 4: Video (vor Versand)
- [ ] Persoenlicher Einstieg mit Firmenname
- [ ] Typischer Fall glaubwuerdig fuer diesen Betrieb
- [ ] Lisa-Moment zeigt operative Staerke
- [ ] CTA klar: Testnummer + URL
- [ ] Keine generische Sprache
- [ ] Maximal 60 Sekunden

### Gate 5: Outreach (vor Versand)
- [ ] Email persoenlich formuliert (kein Template-Gefuehl)
- [ ] CTA = "Testen Sie Ihre eigene Lisa" (nicht "Demo buchen")
- [ ] URL + Testnummer enthalten
- [ ] Kein Datenschutz-Problem (keine PII im Video/Screenshot)
- [ ] Pipeline-Status auf KONTAKTIERT gesetzt

---

## 11. Datenschutz-Framing (verbindlich)

| Thema | Regel |
|-------|-------|
| Demo-Lisa | Recording OFF (wie alle FlowSight Voice Agents). KI-Disclosure im Greeting. |
| Prospect-Daten | Nur oeffentlich verfuegbare Daten (Website, Google Maps, Google Reviews). Kein Scraping von persoenlichen Profilen. |
| Demo-Website | Nur verifizierte Fakten von Originalwebsite. Kein Erfinden. Kein Google-Foto-Klau. |
| Video | Zeigt nur: FlowSight-UI, Demo-Website, Lisa-Anruf (eigener Test). Keine Screenshots von echten Kundendaten. |
| Pipeline | Kein PII in Git (pipeline.csv enthaelt nur oeffentliche Geschaeftsdaten). |

---

## 12. Erfolgskriterien

### Technisch (CC-messbar)
- [ ] Provisioning-Zeit <10 Min fuer B+D Paket
- [ ] Provisioning-Zeit <25 Min fuer A+B+D Paket
- [ ] prospect_pipeline.mjs laeuft fehlerfrei im Quick-Modus
- [ ] B-Quick Demo-Agent funktioniert mit Variablen
- [ ] 5 Prospects erfolgreich provisioniert

### Qualitativ (Founder-messbar)
- [ ] Weinberger A+B+C+D wirkt high-end (Founder Stop/Go)
- [ ] Video fuer Weinberger ist ueberzeugend (Founder Stop/Go)
- [ ] Lisa klingt nach dem Betrieb, nicht nach FlowSight
- [ ] Kein einziger erfundener Fakt auf irgendeiner Prospect-Website
- [ ] Outreach-Email fuehlt sich persoenlich an

### Kommerziell (nach Go-Live)
- [ ] Erster Outreach gesendet (Weinberger)
- [ ] Response Rate nach 10 Outreaches messen
- [ ] Erstes Closing innerhalb 8 Wochen nach Go-Live

---

## 13. Bestehende Kunden als sofortige Leckerli-Kandidaten

| Kunde | Was existiert | Was fehlt | Aufwand |
|-------|-------------|-----------|---------|
| **Walter Leuthold** (Oberrieden) | Website LIVE (Leckerli D) | Lisa (B-Quick), Video (A) | ~20 Min |
| **Orlandini** (Horgen) | Website LIVE (Leckerli D) | Lisa (B-Quick), Video (A) | ~20 Min |
| **Widmer Sanitaer** (Horgen) | Website LIVE (Leckerli D) | Lisa (B-Quick), Video (A) | ~20 Min |
| **Doerfler AG** (Oberrieden) | Website + Voice + Ops LIVE (Leckerli B+C+D) | Video (A), Go-Live Entscheidung | ~15 Min (Video) |

**Quick Win nach Woche 2:** Sobald B-Quick Demo-Agent steht, koennen Leuthold, Orlandini und Widmer in je 20 Min auf A+B+D aufgeruestet werden. Das sind 3 zusaetzliche Outreach-Kandidaten mit fast null Aufwand.

---

## 14. Zusammenfassung

Diese GTM-Maschine ist **kein Plan fuer einen Plan**. Sie ist ein konkretes Bausystem mit:

- **6 existierenden Scripts** die 70% der Arbeit abdecken
- **10 neuen Bausteinen** (G1-G10) die in 4 Wochen gebaut werden
- **1 Goldstandard** (Weinberger AG) der A-D komplett durchdekliniert
- **3 bestehende Websites** die sofort aufgeruestet werden koennen
- **<10 Min** Provisioning-Ziel pro Prospect (B+D Paket)
- **Quality Gates** die den Premium-Standard absichern
- **Klarer Fahrplan** mit Wochen-Meilensteinen

Die Maschine rattert ab Woche 5.

---

*Letztes Update: 2026-03-09 | CC + Founder + ChatGPT GTM-Architektur*
