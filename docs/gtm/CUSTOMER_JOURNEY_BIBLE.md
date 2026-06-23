# Customer Journey Bible — FlowSight

Version: 1 (2026-06-17)
Status: lebendes Orchestrator-Dokument
Owner: Founder + CC
Stil: nüchtern, ein Lesepfad

---

## 0. Was dieses Dokument ist

Dies ist das **oberste Dokument** von FlowSight. Es bildet das Unternehmen als
**eine durchgehende Reise** ab — von Stern 1 (erster Kontakt) bis Stern 8
(zufriedener Kunde wird zur Referenz). Wer dieses Dokument liest, versteht in
wenigen Minuten, **was FlowSight ist, wie der Prozess läuft, und wo jedes Detail liegt.**

Drei Funktionen:

1. **Einstiegspunkt.** „Schau dir die Customer Journey Bible an" genügt, um das
   Geschäft, den Ablauf und die Sprache zu verstehen. Danach geht es gezielt in
   die Detail-Dokumente.
2. **Orchestrator.** Jeder Stern zeigt seinen Zweck, das Konversions-Ereignis
   (den Übergang zum nächsten Stern) und das Dokument, das ihn im Detail besitzt.
3. **Kompass.** Jede offene Aufgabe und jede neue Idee lässt sich genau einem
   Stern zuordnen.

Was es **nicht** ist: kein Ersatz für die drei Detail-Bibles (Sales, Onboarding,
Pipeline). Es orchestriert sie und verlinkt nach unten. Es dupliziert keine
Details — Stern-Details werden in der HTML / den Bibles gepflegt, nicht hier.

**Kein „Drei-Säulen-Modell" mehr.** Früher wurde FlowSight als drei Säulen
(Sales / Pipeline / Onboarding) beschrieben. Das traf das Geschäft nicht. Es ist
**eine Customer Journey, ein Schwungkreis** — der gesamte Umsatzprozess als
Schleife. Die drei Bibles sind keine Säulen, sondern **Handbücher für Abschnitte
der Reise** (welcher Abschnitt von welcher Bible besessen wird, steht je Stern unten).

---

## 1. FlowSight in einem Absatz

**Multi-tenant Leitsystem für Schweizer Sanitär- und Heizungsbetriebe — damit
keine Kundenanfrage verloren geht.** Neue Anfragen aus Telefon, Website, E-Mail
oder direkt aus einem Gespräch laufen an einem Ort zusammen (die Leitzentrale).
Eine Telefon-Assistentin (Lisa) nimmt Anrufe auf (intake-only, nennt nie einen
Preis), ein Wizard nimmt Web-Anfragen auf. Der Betrieb sieht jederzeit, was
eingegangen ist, was offen ist und was weiterlaufen muss — bis zum sauberen
Abschluss und zur Bewertung. Ausgabe an Kunden: **E-Mail**. Founder-Ops-Alerts:
WhatsApp (intern, ohne PII).

---

## 1.1 North Star (Positionierung)

FlowSight verkauft **kein** KI / keine Telefonassistentin / keine App / keine SMS — sondern ein **Leitsystem**. Staerkste Positionierung: **inhabergefuehrten Handwerksbetrieben helfen, vom Reagieren zum Steuern zu kommen.** Das ist groesser als „keine Anfrage geht verloren" — Letzteres ist nur der konkrete Beweis, die Transformation ist weg vom Nachrennen/Blindflug hin zu Sichtbarkeit, Kontrolle, Steuerbarkeit. Lisa/Wizard/Leitzentrale sind Mechanismen, nicht die Verkaufsstory. (Quelle: `docs/archive/onboarding/FlowSight_Customer_Journey_Long.md` §1)

Discovery-Anker (warmes Gespraech, Stern 5): zuerst Realitaet, dann Konsequenz, dann Commitment. Zwei Kernfragen — **R1:** „Wenn heute um 14 Uhr jemand anruft und niemand rangeht — was passiert dann normalerweise?"; **R2:** „Woher wissen Sie eigentlich, dass keine Anfragen verloren gehen?" (verschiebt von Erreichbarkeit zu **Sichtbarkeit**).

---

## 2. Das Modell: der Schwungkreis

Acht Sterne, eine Schleife. Der entscheidende Gedanke ist die **Ökonomie-Umkehr**:
zuerst qualifiziert ein Mensch kalt (billig), erst für die Ja-Sager baut die
automatische Pipeline die teure Simulation, und das Onboarding liefert. Am Ende
trägt der Schwung zurück: ein zufriedener Kunde wird zur Referenz und speist
Stern 1.

```
        8 Begleitung & Wert ── (Referenz) ──► 1 Kontakt
       ▲                                               │
   7 Go-live & Vertrag                            2 Cold Call
       ▲                                               │
   6 Cockpit                                      3 Simulation
       ▲                                               │
   5 Verkaufsgespräch ◄──────────────────────── 4 Gesehen
```

**Sales klammert die Pipeline.** Verkauf passiert zweimal: kalt bei Stern 2
(das Ja, die Simulation schicken zu dürfen) und warm bei Stern 5 (das eigentliche
Verkaufsgespräch nach dem Klick). Dazwischen — Stern 3 und 4 — arbeitet die
Pipeline still im Hintergrund; der Kunde sieht nur das Ergebnis.

**Das Konversions-Ereignis pro Stern ist heilig.** Jeder Stern hat genau einen
Übergang, der zählt (siehe Tabelle unten). Alles andere ist Vorbereitung.

---

## 3. Die 8 Sterne

Kompakt. Detail/operativ jeweils in der HTML (`docs/gtm/customer_journey.html`)
und der genannten Bible.

### Stern 1 — Kontakt  (Abschnitt: Sales)
- **Zweck:** Lead-Liste pflegen + kurze Recherche (Website gegenchecken), bevor gewählt wird. Der Funnel-Einstieg.
- **Konversions-Ereignis:** Betrieb steht qualifiziert auf der Tagesliste → anrufen.
- **Owner:** SALES_BIBLE + Lead-Motor (`build_leads.mjs` → `docs/sales/leads.csv`, `todays_list.mjs`, `enrich_leads.mjs`/P12). Operativ: HTML Stern 1 (Kontaktliste).
- **Kennzahl:** Wählversuche.

### Stern 2 — Cold Call  (Abschnitt: Sales)
- **Zweck:** Das Ja gewinnen, die Simulation schicken zu dürfen. Kein Preis, keine Discovery.
- **Konversions-Ereignis:** „Ja, schicken Sie mir den Link."
- **Owner:** `cold_call_script.md` (Wortlaut eingefroren) + SALES_BIBLE. Operativ: HTML Stern 2 (Live-Baum / Drill).
- **Kennzahl:** Erreicht → Ja zur Simulation.

### Stern 3 — Simulation  (Abschnitt: Pipeline)
- **Zweck:** Nach dem Ja baut die Pipeline die personalisierte Beweis-Seite (4 Videos T1–T4 + Prüfung), Mail rund 35 Minuten nach dem Anruf. Automatische Fabrik — der Kunde sieht sie nie.
- **Konversions-Ereignis:** Beweis-Seite live + Mail versandt.
- **Owner:** PIPELINE_BIBLE; `build_proof_page.mjs`, `send_outreach.mjs`; Seite `/p/[token]` (Bunny-Stream).
- **Kennzahl:** Versandt.

### Stern 4 — Gesehen  (Abschnitt: Pipeline → Sales)
- **Zweck:** First-View-Signal — der Aha. Die 4 Videos zeigen fast alles ausser dem Preis.
- **Konversions-Ereignis:** Erster Klick auf die Beweis-Seite (View-Tracking) → warmer Follow-up.
- **Owner:** View-Tracking (`proof_pages`); Follow-up-Logik in SALES_BIBLE.
- **Kennzahl:** Gesehen (Klick).

### Stern 5 — Verkaufsgespräch  (Abschnitt: Sales)
- **Zweck:** Das eigentliche warme Gespräch nach dem Klick: Reaktion, Discovery (komprimiert), Konsequenz, Brücke, Preis, Abschluss zum geführten Aufbau.
- **Konversions-Ereignis:** Zusage zum geführten Aufbau.
- **Owner:** `stern5_warmes_verkaufsgespraech_uebergabe_cc.md` (Version 1) + SALES_BIBLE.
- **Kennzahl:** Warmes Gespräch → Zusage.

### Stern 6 — Cockpit  (Abschnitt: Onboarding)
- **Zweck:** Der Kunde baut sein Leitsystem geführt selbst im Cockpit (Self-Service, confirm-not-create, ~70 % aus `tenant_config` vorbefüllt). Inkl. Rückmelde-Versprechen + Wunschtermin (OC8).
- **Konversions-Ereignis:** Cockpit durchlaufen → Founder-Review-bereit.
- **Owner:** ONBOARDING_BIBLE + Cockpit `/aufbau/[token]` (Konstellation + progressives Lisa-Gesicht, origin/main #603) + `phase2_rueckmelde_termin_logik.md`.
- **Kennzahl:** Onboarding gestartet.

### Stern 7 — Go-live & Vertrag  (Abschnitt: Onboarding)
- **Zweck:** Founder-Review (Freigabe), dann Zahlung am Go-live — das ist der Vertragsabschluss. Weiterleitung, erste echte Anrufe.
- **Konversions-Ereignis:** Geprüfter Go-live + erste Zahlung → **Kunde**.
- **Owner:** ONBOARDING_BIBLE (Phase 3) + Pricing (siehe §4).
- **Kennzahl:** Abschlüsse.

### Stern 8 — Begleitung & Wert  (Abschnitt: Onboarding → zurück zu Sales)
- **Zweck:** Die ersten echten Fälle gemeinsam anschauen — nicht verkaufen, anbieten: mitschauen, mitlernen, Nähe. Plus Wochen-Rapport. Der zufriedene Kunde wird zur Referenz.
- **Konversions-Ereignis:** Referenz / Weiterempfehlung → speist Stern 1 (Schleife geschlossen).
- **Owner:** ONBOARDING_BIBLE (Phase 4) + `weekly_report.mjs`.
- **Kennzahl:** Referenzen.

---

## 4. ICP & Preis (kanonisch in SALES_BIBLE — hier der Anker)

- **Leitsignal:** „Inhaber am Telefon?" Inhabergeführt, klein bis mittel, Sanitär/Heizung, echte Website, 1–12 Mitarbeiter.
- **Zweistufig (Größe = Preis-Schalter):**
  - Solo 1–3 MA → rund **CHF 950 / Monat**
  - Premium 4–12 MA → rund **CHF 2'000 / Monat**
- **Aktivierung:** einmalig rund **CHF 2'500** (geführter Aufbau).
- **Handelsregeln:** monatlich kündbar (Risiko-Umkehr), **kein Trial**, **zahlend erst am Go-live**, nie rabattieren (Knappheit ~10/Monat).

Quelle der Wahrheit für ICP/Preis ist die SALES_BIBLE. Ändert sich hier etwas,
dort zuerst — dieses Dokument verlinkt nur.

---

## 5. Vokabular

- **Leitsystem / Leitzentrale:** das Produkt aus Kundensicht — der eine Ort, an dem alle Anfragen sichtbar weiterlaufen. (Kundengerichtet immer „Leitsystem", nie „Dashboard".)
- **Lisa:** die Telefon-Assistentin (Retell Voice Agent). Intake-only, max 7 Fragen, nennt nie Preise, sagt nie fixe Termine zu, Recording OFF.
- **Wizard:** die Web-Aufnahme einer Anfrage (`/start/[slug]`).
- **Beweis-Seite / Simulation:** die private `/p/[token]`-Seite mit 4 Videos (T1–T4), die der Prospect nach dem Cold Call erhält. Der Klick darauf ist das Konversions-Ereignis von Stern 3→4.
- **Cockpit / Aufbau:** das Self-Service-Onboarding (`/aufbau/[token]`), in dem der Kunde sein Leitsystem geführt selbst baut.
- **Disposition:** wie ein Anruf endet (Fall / Nachricht / nichts) — Voice-Logik im Onboarding.
- **tenant_config.json:** die Through-Line — aus dem Crawl abgeleitet, befüllt Pipeline + Cockpit vor.

---

## 6. Wo liegt was (Zielarchitektur-Karte)

Dies ist der Doc-Satz, der FlowSight 1:1 abbildet. Für die Arbeit mit ChatGPT
(ohne Repo-Zugriff): immer diese Dokumente aktuell mitsenden.

| Dokument | Pfad | Rolle |
|---|---|---|
| **STATUS** | `docs/STATUS.md` | Aktueller Stand + Dokumenten-Karte. Zuerst lesen. |
| **Ticketlist** | `docs/ticketlist.md` | Einziger Task-Tracker (Roadmap + offene Aufgaben). |
| **Zielarchitektur** | `docs/architecture/zielarchitektur.md` | Zielbild Business + Produkt + GTM; Decision Map (D1–D102). |
| **Business-Briefing** | `docs/business_briefing.md` | Geschäftliche Einordnung. |
| **Customer Journey Bible** | `docs/gtm/CUSTOMER_JOURNEY_BIBLE.md` | **Dieses Dokument — der Orchestrator über allem.** |
| **Customer Journey (visuell)** | `docs/gtm/customer_journey.html` | Das Schwungrad zum Draufschauen + operatives Tool (Kontaktliste, Cold-Call-Baum, Funnel). Stern-Details werden hier gepflegt. |
| **Customer Journey — Bauplan** | `docs/gtm/customer_journey_buildplan.md` | Bau-/Architekturdetail für die Journey als Software (DB-SSOT, Schema, Phasen, Fund-Protokoll). Kein Orchestrator — trägt nur das Bau-Detail. |
| **Sales-Bible** | `docs/gtm/sales/SALES_BIBLE.md` | Sterne 1, 2, 4, 5, 8 — kalt + warm verkaufen. ICP/Preis kanonisch. |
| **Pipeline-Bible** | `docs/gtm/pipeline/PIPELINE_BIBLE.md` | Stern 3 — die Simulation/Video-Fabrik. |
| **Onboarding-Bible** | `docs/gtm/onboarding/ONBOARDING_BIBLE.md` | Sterne 6, 7, 8 — Cockpit, Go-live, Begleitung. |
| Stern-2-Wortlaut | `docs/gtm/sales/cold_call_script.md` | Cold Call, eingefroren. |
| Stern-5-Wortlaut | `docs/gtm/sales/stern5_warmes_verkaufsgespraech_uebergabe_cc.md` | Warmes Verkaufsgespräch, Version 1. |
| Rückmelde/Termin (OC8) | `docs/gtm/onboarding/phase2_rueckmelde_termin_logik.md` | Stern 6 — Rückmelde-Versprechen + Wunschtermin. |
| Auto-Memory | `C:\Users\wende\.claude\projects\C--flowsight-mvp\memory\` | CC-Gedächtnis über Sessions (MEMORY.md = Index). |

Technische Eckpfeiler (Detail in Zielarchitektur): Supabase = SSOT (Tenants +
Cases), Vercel (Region fra1, Root `src/web`), Resend = Mail, Retell = Voice,
ElevenLabs = TTS, Bunny = Video-Stream.

---

## 7. Aktueller Stand & Nicht-Verhandelbares

**Stand (Kurzfassung — Details immer in STATUS):**
- Phase: **Sales.** 0 zahlende Kunden.
- **Stern 1→3→4 in der Praxis bewiesen (18.06.):** erster Kalt-Rep-Tag → 3 Treffer → alle 3 über die Pipeline produziert + live versandt (Burkhardt, Schäfli + Dieterich, Serafini); Antworten/First-Views laufen, warmer Rückruf (Stern 5) folgt.
- **Welle 1 komplett versandt (19.06.):** 10 Simulationen live an echte Betriebe (+ Rickenbach, musa, Hutt, Künzi, Wattinger + Schwendener, R. Gerber, Brühwiler), 2 zurückgestellt (MS + Regiotherm = reine Heizung → Heizungs-Notfall-T2-Variante fehlt). Lehren: harter E-Mail-Domain-Check vor Versand (Cockpit-Liste = Quelle, nicht Crawl), dynamische Inhaber-Anrede, feste Schablone „nicht erreicht" (`sales/templates/email_nicht_erreicht.md`).
- Pipeline (Stern 3): funktional + **gehärtet** — kanonischer Weg `build_take*_final`, Ein-Kommando `produce_videos.mjs` inkl. Hochkant-Pflichtschritt, Tracking-Scharfschaltung beim Live-Versand. Runbook: `pipeline/NEUER_BETRIEB_VIDEO_RUNBOOK.md`.
- Onboarding-Cockpit (Stern 6): Design komplett, Build offen (OC-Backlog).

**Fixentscheidungen (gelten immer):**
- Ausgabe an Kunden = **E-Mail**. WhatsApp = Founder-Ops-Alerts, intern, ohne PII.
- Mail-Provider = **Resend** (kein M365-Graph; Graph nur Kalender).
- SSOT = **Supabase**. Deploy = **Vercel**, Root `src/web`.
- Voice = **intake-only**, max 7 Fragen, Recording OFF, **nie Preis**, nie fixe Termine.
- Onboarding: **kein Trial, monatlich kündbar, zahlend am Go-live.**
- Retell: jede Agent-Änderung endet mit **publish**.
- **Website ist kein Produktbestandteil (D83, 14.04.).** Produktgrenze: Voice + Wizard + Leitzentrale + Reviews + SMS — Modul 2 ist Standard, Wizard-Einstieg `/start/[slug]` fuer alle Betriebe. Eine Basis-Website (Legacy-Template) entsteht **nur als Fallback**, wenn **alle vier** Bedingungen zutreffen: (1) keine oder kaputte Website (SSL, mobil unbrauchbar), (2) kein sinnvoller Kontakt-/CTA-Pfad, (3) die Web-Praesenz beschaedigt aktiv Vertrauen, (4) der Betrieb **fragt aktiv danach** — FlowSight bietet es nicht an. GTM-Sprache: „Ihre bestehende Website bleibt wie sie ist — wir integrieren uns nahtlos." (Quelle: `docs/_archive/gtm-website/entscheidung_final.md`)

---

## 8. Pflege-Regel

Dieses Dokument ist der Orchestrator — es bleibt **kurz und aktuell**, nicht
detailreich. Regeln:

- **Stern-Details** (Wortlaute, Listen, Funnel) leben in der HTML / den Bibles.
  Hier nur Zweck, Übergang, Owner, Kennzahl. Keine Doppelpflege.
- **Eine SSOT pro Fakt.** ICP/Preis stehen kanonisch in der SALES_BIBLE; hier nur
  der Anker. Ändert sich ein Fakt, in seiner SSOT zuerst.
- **Bei strukturellen Änderungen** (neuer Stern, anderes Konversions-Ereignis,
  neues Bible-Dokument) hier nachziehen — denn das ist die Karte, die alles verbindet.
- Verwandte Dokumente immer **verlinken**, nicht kopieren.

Verlinkt: [[project_sales_machine_phase0]] · SALES_BIBLE · ONBOARDING_BIBLE · PIPELINE_BIBLE · Zielarchitektur · `customer_journey.html`
