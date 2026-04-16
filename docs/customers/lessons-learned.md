# Lessons Learned — GTM-Maschine

> Lebendes Dokument. Wird nach jedem Maschinendurchlauf ergänzt.
> Ziel: Jeder neue Betrieb schneller + sauberer als der letzte.
> Scope: Volle Pipeline (Scout → Website → Voice → Provision → Script → Video → Outreach).

---

## Goldene Regeln (übergeordnet)

1. **NUR verifizierte Fakten.** Lieber Lücke als Lüge. Niemals Content erfinden — weder Website noch prospect_card noch Script.
2. **Phase A/B Trennung ist Pflicht.** Phase A = System bereit, kein Kontakt. Phase B = Outreach. Immer `--no-welcome-mail` in Phase A.
3. **pain_types treiben alles.** Website-Analyse → pain_types → Demo-Script → Outreach-Mail. Nie Features runterrattern.
4. **SSOT-Update nach JEDEM Schritt.** prospect_card + status.md + pipeline.csv.
5. **Smoke-Test vor Video-Aufnahme.** Technische Checkliste abarbeiten. Peinliche Fehler im Video = Deal-Killer.
6. **DB = SSOT.** Nicht Docs. Nach Provision immer status.md mit DB-Werten abgleichen.

---

## Maschinen-Regeln (M1-M6)

| # | Regel | Warum |
|---|-------|-------|
| M1 | **Phase A/B Trennung.** `--no-welcome-mail` in Phase A. | Verhindert versehentlichen Prospect-Kontakt |
| M2 | **prospect_card: Jeder Name muss in FACTS_VERIFIED stehen.** | "Beat Dörfler"-Fehler darf nie bei Outreach passieren |
| M3 | **pain_types im prospect_card dokumentieren.** | Fließt ins Demo-Script und in die Outreach-Mail |
| M4 | **Demo-Script = pain_type-basiert.** Feedback > Pitch. | Schweizer sind defensiv. |
| M5 | **Smoke-Test vor Video.** Checkliste in demo_script.md. | Video-Fehler = Deal-Killer |
| M6 | **SSOT-Update nach JEDEM Schritt.** | Sonst driften Docs auseinander |

---

## 1. Scout

*Script: `scripts/_ops/scout.mjs`*

**Learnings:**
- GOOGLE_SCOUT_KEY muss lokal in `.env.local` gesetzt sein (nicht nur Vercel)
- `--gemeinde` für Einzelort, `--region` für Batch
- PLZ-basiert geht nicht direkt — Gemeindename verwenden

---

## 2. Website-Erstellung

### Goldene Regeln Website

1. **Wizard = Standard.** Kein Kontaktformular.
2. **Brand Color ab Tag 1.** Aus alter Website extrahieren, nie FlowSight-Farben verwenden.
3. **Bilder: Founder entscheidet.** Crawler ist Fallback, nicht SSOT.
4. **Alle Links prüfen** bevor committed wird.
5. **1 Feedback-Runde reicht** wenn der Intake sauber ist.

### Standardisierter Intake-Prozess (15 Regeln)

> Festgelegt 2026-03-08 nach Orlandini + Widmer Feedback. Verbindlich für alle neuen Kunden.

**Founder liefert pro Kunde:**

1. **Leistungen:** Liste + je 1 Ordner mit 3-6 Bildern unter `docs/customers/<slug>/leistungen/<service>/`
2. **Hero-Bild:** unter `docs/customers/<slug>/titelbild/` — Founder wählt
3. **Google Reviews:** Screenshots unter `docs/customers/<slug>/reviews/` — wenn vorhanden. Wenn kein Ordner → keine Reviews anzeigen.
4. **Alte Website URL** (für Kontaktdaten, Texte, Einzugsgebiet)

**CC-Regeln (verbindlich):**

| # | Thema | Regel |
|---|-------|-------|
| 1 | **Services** | Kommen AUS den Ordnern unter `leistungen/` + Founder-Liste. Nichts erfinden. |
| 2 | **Bilder** | Nur die Bilder aus dem jeweiligen Ordner. Keine generischen Platzhalter. |
| 3 | **Hero** | Immer das Bild aus `titelbild/`. Founder entscheidet. |
| 4 | **Reviews** | NUR wenn `reviews/`-Ordner existiert. Screenshots → Struct extrahieren. Sonst: `highlights: []` |
| 4b | **Reviews < 5** | "Basierend auf X Bewertungen" wird NICHT angezeigt wenn `totalReviews < 5`. |
| 5 | **Brand Color** | Aus alter Website extrahieren. Falls >15 Jahre Design → modernisieren, Founder fragen. |
| 6 | **Gründungsjahr** | Nur anzeigen wenn Betrieb >20 Jahre alt. |
| 7 | **History** | Nur wenn >20 Jahre UND alte Website hat Meilensteine. Sonst weglassen. |
| 8 | **Team** | NUR verifizierte Personen. Minimum 2 für Section-Anzeige. |
| 9 | **Text** | Alte Website als Basis + High-End Creative Writing. Keine 1:1-Kopie, kein Erfinden. |
| 10 | **Wizard** | Immer aktiv. Kategorien aus `services[]` ableiten. |
| 11 | **Notfall/Notdienst** | NUR wenn alte Website explizit Notdienst anbietet. |
| 12 | **Firmenname** | EXAKT wie auf alter Website/Impressum. |
| 13 | **Stellenanzeigen** | Wenn alte Website Jobs ausschreibt → `careers[]` übernehmen. |
| 14 | **Partner/Verbände** | URLs prüfen! Tote Links → entfernen. |
| 15 | **Partner-URLs** | JEDE URL muss vor Commit geprüft werden (HTTP 200). |

### Pflicht-Output pro Kunde (IMMER):
- `docs/customers/<slug>/links.md` — Website-URL, Links-Seite, Wizard-URL
- Config in `src/web/src/lib/customers/<slug>.ts`
- Bilder in `src/web/public/kunden/<slug>/`
- Registry-Eintrag in `registry.ts`

### Template-Status

| Komponente | Pfad | Status |
|-----------|------|--------|
| Daten-Schema | `src/web/src/lib/customers/types.ts` | fertig |
| Kunden-Registry | `src/web/src/lib/customers/registry.ts` | fertig — 1 Zeile pro Kunde |
| Seiten-Template | `src/web/app/kunden/[slug]/page.tsx` | fertig — 12 Sektionen |
| Bild-Galerie | `src/web/app/kunden/[slug]/ImageGallery.tsx` | fertig |
| Impressum/Datenschutz | `src/web/app/kunden/[slug]/impressum` + `datenschutz` | fertig (01.04.) |
| Brand Color System | via `brandColor` in Config | fertig |
| Wizard-Integration | Nav + Hero CTA + Contact Banner | fertig |

### Neuen Kunden anlegen (5 Schritte)

1. Config erstellen: `src/web/src/lib/customers/<slug>.ts`
2. Registry ergänzen: 1 import + 1 Zeile in `registry.ts`
3. Bilder ablegen: `src/web/public/kunden/<slug>/`
4. **`docs/customers/<slug>/links.md` anlegen** — PFLICHT
5. Build + Push — fertig

---

## 3. Voice Agent

*Script: `scripts/_ops/retell_sync.mjs`*

**Learnings:**
- DSGVO: `data_storage_setting` MUSS `everything_except_pii` sein (nicht `everything`)
- Laura (DE) + Juniper (INTL) = aktuelle Stimmen
- retell_sync publiziert automatisch — nie manuell im Dashboard
- Transfer-Tool-Beschreibungen in INTL-Agents referenzieren noch "Susi" (nur Label, kein Funktionsproblem)

---

## 4. Provisioning

*Script: `scripts/_ops/provision_trial.mjs`*

**Learnings:**
- `--no-welcome-mail` = Standard für Phase A
- seed_demo_data: STATUS_DISTRIBUTION muss zum aktuellen DB-Schema passen (6-Status-Modell seit 16.03.)
- Tenant-ID kann sich bei Upsert ändern → immer DB als SSOT, nicht alte Docs
- CEO-App erkennt trial_active automatisch — kein manueller Eingriff nötig

---

## 5. Demo-Script + Video

*Script-Vorlage: `docs/customers/<slug>/demo_script.md` (Speakflow-optimiert)*
*Verpackung: `docs/customers/<slug>/vorstellung_script_v2.md`*

**Architektur (seit 07.04.):**
- **4 Module statt 1 langes Video.** Jedes Modul = 1 Loom-Take (1-2 Min).
- **Kein 5. Video für den Abschluss** — Text auf der Seite ist ehrlicher als ein 30s-Clip.
- **2 Dokumente pro Betrieb:** demo_script.md (Speakflow-Text zum Ablesen) + vorstellung_script_v2.md (Verpackung + Versandlogik)

**Die 4 Module (Standard-Struktur):**

| # | Titel | Fokus |
|---|-------|-------|
| 1 | Ihr Alltag — und die eigentliche Frage | Empathie, Pain zeigen |
| 2 | Wenn Sie gerade nicht direkt rangehen können | Voice-Demo (Live-Anruf) |
| 3 | Wenn ein Kunde lieber online meldet | Wizard + Website zeigen |
| 4 | Wie gute Arbeit sichtbar wird | Bewertungs-Engine |

**Learnings:**
- Script-Struktur: Intro (Respekt) → Pain (nicht Features) → Website → Live-Anruf → Leitzentrale → Feedback-Bitte
- Dont's: Kein Preis, kein "KI", kein "Dashboard/Wizard/Onboarding", keine Feature-Listen
- pain_types aus Website-Analyse dynamisch ins Script einbauen
- Technische Checkliste VOR Aufnahme abarbeiten (SMS, Email, Leitzentrale, Voice)
- Modultitel = Unternehmerlogik, nicht Feature-Sprache ("Wenn Sie gerade nicht rangehen können" statt "KI-Telefonassistent")
- Modul 4 NICHT technisch formulieren ("Wie gute Arbeit sichtbar wird" statt "Vom erledigten Fall zur Bewertung")

---

## 6. Vorstellungsseite

*Seite: `/kunden/<slug>/vorstellung` (SSG, noindex)*
*Config: `src/web/src/lib/customers/vorstellung.ts`*
*Komponenten: `src/web/app/kunden/[slug]/vorstellung/`*

**Was ist das:**
Persönliche Hub-Seite pro Betrieb. Gunnar-Foto + Kernfrage + 4 Video-Module + Abschlusstext. Ersetzt rohe Loom-Links in der E-Mail.

**Aufbau (Standard):**
1. **Hero:** Gunnar-Foto (klickbar → Lightbox) + Name/Ort + Überschrift + Kernfrage (Blockquote mit Tenant-Farbe) + Nutzenverdichtung
2. **4 Module:** Nummeriert, vertikal verbunden (Connector-Linie), je Titel + Untertitel + Video (Loom-Embed oder Platzhalter)
3. **Closing:** Gunnar-Foto klein + 2 Sätze (persönlich, kein CTA)
4. **Kontakt:** Telefon + E-Mail

**Neuen Betrieb anlegen (3 Schritte):**
1. Eintrag in `src/web/src/lib/customers/vorstellung.ts` → `vorstellungen` Map ergänzen
2. Texte anpassen: headline, question, valueProp, modules[], closing (alles betriebsspezifisch)
3. Push → SSG-Seite wird automatisch generiert

**Nach Video-Aufnahme:**
Loom-URLs in `vorstellung.ts` bei `videoUrl` eintragen → Push → Videos erscheinen embedded auf der Seite.

**Design-Regeln (hart gelernt):**
- max-w-xl (576px) — schmaler = persönlicher, nicht Landing-Page
- Warm-white Hintergrund (#faf9f7)
- Tenant-Farbe nur als Akzent (Blockquote-Balken, Modul-Nummern)
- Keine Anführungszeichen um die Kernfrage (Blockquote + Balken reicht)
- Gedankenstrich inline im Textfluss, kein erzwungener Zeilenumbruch
- Überschrift: geschütztes Leerzeichen vor "AG" (`\u00a0`) verhindert Waisenkind
- Foto-Lightbox: Prospect will den Founder sehen bevor er Videos schaut
- Footer: max 2 Sätze. Kein CTA, kein "Jetzt starten"

---

## 7. Outreach (E-Mail Phase B-1)

*Script: `scripts/_ops/send_outreach_mail.mjs`*
*Preview: `docs/customers/<slug>/mail1_preview.html`*

**2-Mail-Strategie:**
- **Mail 1:** Persönlich, 1 Link zur Vorstellungsseite. Kein Pitch, kein Trial-Angebot.
- **Mail 2:** Zugänge (automatisch via `activate_prospect.mjs` nach Prospect-Go)

**Mail 1 senden (1 Kommando):**
```bash
node --env-file=src/web/.env.local scripts/_ops/send_outreach_mail.mjs <slug> <email>
```

**Was die Mail enthält:**
- Absender: `Gunnar Wende <noreply@send.flowsight.ch>`
- Reply-To: `gunnar.wende@flowsight.ch`
- Gunnar-Foto mit Play-Button (Startbild_B1), 120px rund, klickbar → Vorstellungsseite
- Link als Text-Fallback darunter
- Plain-Text-Fallback für alte Clients
- Kein HTML-Newsletter-Look, kein Tracking-Pixel

**Neuen Betrieb hinzufügen:**
1. Eintrag im `prospects`-Objekt in `send_outreach_mail.mjs` (anrede, firma, betreff, kontext, vorstellungUrl)
2. Foto bereitstellen: `src/web/public/vorstellung/gunnar_play.png` (gleich für alle — ist Gunnar, nicht der Betrieb)
3. `mail1_preview.html` kopieren + anpassen (optional, für Browser-Preview)

**Design-Regeln E-Mail:**
- Foto NACH dem Kontextaufbau, VOR dem Link (Kontext → Vertrauen → Handlung)
- Foto OHNE Play-Button auf der Vorstellungsseite, MIT Play-Button in der E-Mail
- Calibri/Segoe UI (Outlook-nativ)
- Kein grauer Wrapper, kein Card-Design — plain-persönlich
- "Hier können Sie es sich anschauen" statt "Jetzt ansehen"

**Learnings:**
- E-Mail-Adresse: `gunnar.wende@flowsight.ch` (mit Punkt!)
- HTML-Datei in VS Code öffnen ≠ im Browser öffnen → Script-Versand ist sicherer
- Resend Free: 100 Mails/Tag reicht für Outreach locker
- Outlook Dark Mode: Foto mit hellem Rand (3px #e0e0e0) bleibt sichtbar

---

## Betriebsspezifische Learnings

### Dörfler AG (2026-02-26 Website, 2026-04-01 Maschine, 2026-04-07 Vorstellung)

**Kontext:** Sanitär/Heizung, Oberrieden ZH, seit 1926, 3. Generation (Ramon + Luzian)

**Website-Phase (Februar):**
- Puppeteer-Crawler: 297 Bilder, 90% unbrauchbar (20KB-Thumbnails von 2005)
- Erfundener Content (2024 Eintrag) → Regel 1 (nur verifizierte Fakten)
- 3+ Feedback-Loops → Standardisierter Intake löst das
- Template-Erstellung: 10h → Soll 1h bei nächstem Betrieb

**Maschinen-Phase (01.04.):**
- seed_demo_data Bug (contacted → in_arbeit/warten): ~15 min Zeitverlust
- provision_trial hätte Mail geschickt → --no-welcome-mail Flag eingebaut
- "Beat Dörfler" in prospect_card erfunden → Korrigiert (Ramon + Luzian)
- Impressum/Datenschutz Links → 404 → Seiten gebaut
- Phase A Total: ~70 min (Soll nächster Betrieb: ~40 min)

**Vorstellung + Outreach (07.04.):**
- Vorstellungsseite: `/kunden/doerfler-ag/vorstellung` (PRs #414-#422, 9 Iterationen)
- 4 Module statt 1 Video (Founder-Entscheid: kürzere Takes, einzeln wiederholbar)
- Kernfrage im Hero: Gedankenstrich inline, kein erzwungener Umbruch (3× iteriert)
- Modultitel: "Wie gute Arbeit sichtbar wird" statt technisch (2× umformuliert)
- Foto-Lightbox: Prospect will den Founder sehen → klick = vergrössern
- "Dörfler AG" mit `\u00a0` zusammenhalten (Waisenkind-Fix Mobile)
- E-Mail: Startbild_B1 (mit Play-Button) → klickbar → Vorstellungsseite
- E-Mail-Adresse: 3× korrigiert (gunnar@ → gunnarwende@ → gunnar.wende@) — IMMER beim Founder verifizieren!
- HTML-Mail per Script statt manuell in Outlook → skaliert, keine Copy-Paste-Fehler
- Dateien: `vorstellung_script_v2.md` (Verpackung), `demo_script.md` (Speakflow, unberührt)
- **Key Insight:** demo_script.md und vorstellung_script_v2.md sind GETRENNTE Dokumente. demo_script.md = Ablese-Script. vorstellung_script_v2.md = Verpackung + Versandlogik. Nie vermischen.

### Walter Leuthold (2026-03-08)

**Kontext:** Sanitär, Heizung, Spenglerei, Dachdecker, Fassadenbau. Seit 2001. 25 Kunden-Bilder.

**Key Learnings:**
- Bilder VOM Kunden > Crawler (25 echte vs. 297 Thumbnails bei Dörfler)
- ServiceCard + ServiceDetailOverlay Pattern = Standard
- `bullets?: string[]` pro Service = High-End-Qualität
- Team-Sektion ausblenden wenn nur 1 Person
- Total: ~6h (inkl. Template-Erweiterung die jetzt allen zugute kommt)

### BigBen Pub (2026-04-14 Onboarding, 2026-04-16 Go-Live Prep)

**Kontext:** Gastro / Pub, Oberrieden ZH, Paul (English-only). Erster zahlender Kunde. Barter-Deal (300 CHF einmalig + ~23 CHF/Mo + Free Drinks). Go-Live Target 30.04.

**Onboarding (14.04., 11 PRs in 1 Tag):**
- Pub/Gastro = ein ANDERES Produkt als Sanitär — braucht Events, Reservierungen, No-Show-Tracking, Walk-in (nicht Cases/Tickets)
- Neue DB-Tabellen (pub_events, pub_reservations) statt bestehende cases-Tabelle zu missbrauchen
- Dark Theme (kennedys.ch-Basis) + dynamic events statt Standard-Kunden-Template

**Go-Live Prep (PRs #479-#491, 13 PRs):**
- **Retell webhook_url feuert nicht:** Agent hat webhook_url konfiguriert, aber Retell feuert ihn nicht für BigBen. Polling via sync-calls API = stabiler Workaround. Lesson: Webhook nie als einzigen Integrationspfad annehmen.
- **is_transfer_cf = Flow-Creation-Time-Only:** Steht in voice_agent_lessons_learned.md, hat uns trotzdem erwischt. Muss bei JEDEM neuen Flow explizit gesetzt werden. Kann nicht nachgepatcht werden.
- **English-only Customer = i18n-Audit JEDER Oberfläche:** OpsShell logout-Text, Datumsformate, Fehlermeldungen — alles war auf Deutsch. Jeder EN-Kunde braucht einen Durchlauf durch alle Screens.
- **No-Show = echtes Business-Problem für Gastro:** Yellow/Red Card System = hoher Kundenwert, niedriger Dev-Aufwand. Paul war sofort begeistert.
- **Mobile-first Kunde:** Paul testet ALLES auf dem Handy. Jede UI-Entscheidung muss Mobile-first validiert werden.
- **Barter-Deal = Zero-Friction erster Kunde:** Free Drinks schaffen alignment of interests. Kein Vertragsrisiko, kein Zahlungsverzug.
- **24h SMS Reminder > No-Show Tracking:** Prävention (Reminder) hat höheren Kundenwert als Nachverfolgung (Yellow/Red Card). Beides zusammen = komplett.
- **Voice Events statisch:** Events sind als Text im Prompt. Dynamischer Fetch wäre ideal, aber Retell unterstützt keine Runtime-API-Calls im Prompt. Manuelles Update vor Abreise nötig.
- **Total Onboarding: ~8h** (inkl. DB-Schema, Voice, Website, Dashboard). Neuer Gastro-Kunde: Soll ~4h.

### Orlandini + Widmer (2026-03-08)

**Kontext:** Rebuild nach Qualitäts-Audit. Erfundene Services + Team-Mitglieder.

**Key Learnings:**
- Service "Erdsonden" erfunden (Widmer) → Showstopper
- Gründungsjahr falsch (1974 statt 1898) → Vertrauensverlust
- Ergebnis: Standardisierter 15-Regeln Intake-Prozess
- Total Rebuild: ~2.5h (beide Kunden)

---

## Zeitentwicklung (Website-Erstellung)

| Betrieb | Ist | Soll |
|---------|-----|------|
| Dörfler AG (erster) | ~10h | — |
| Walter Leuthold (zweiter) | ~6h | — |
| Orlandini + Widmer (Rebuild) | ~2.5h | — |
| **Nächster Betrieb (Ziel)** | — | **~1h** |

## Zeitentwicklung (Volle Maschine Phase A)

| Betrieb | Ist | Soll |
|---------|-----|------|
| Dörfler AG (erster) | ~70 min | — |
| **Nächster Betrieb (Ziel)** | — | **~40 min** |

---

## Offene Optimierungen

- [ ] Pain-Type-Erkennung in scout.mjs integrieren (Website-Signale automatisch)
- [ ] run_phase_a.mjs Orchestrierungs-Script (retell_sync → provision → seed → SSOT)
- [ ] Partner-Logo Crawler Script
- [ ] Automatische Brand-Color-Extraktion aus bestehender Website
- [ ] AI-generierte Referenzbilder pro Service (Nano Banana Pro) evaluieren
- [ ] Mobile QA Checklist für Kunden-Websites

---

*Letztes Update: 2026-04-16 | Quelle: BigBen Pub Go-Live Prep (PRs #479-#491)*
