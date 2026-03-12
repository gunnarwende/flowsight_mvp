# Gold Contact Build — Steuerungsdokument

**Zeitraum:** 12.03. – 10.04.2026 | **Maschinenstart:** 11.04. | **Flug:** 01.05.
**Phase:** Build (Zielbilder → Praxis)
**Standard:** Gold Contact — dauerhaft, kompromisslos, Abbruchkriterium

---

## 1. Executive Framing

Dies ist das zentrale Steuerungsdokument fuer die Build-Phase des Gold Contact Redesigns.

**Was diese Phase ist:**
Ueberfuehrung von 6 Gold-Level-Zielbildern in ein funktionierendes, E2E-getestetes System.
Kein Prototyp. Kein MVP-Minimum. Ein kompromisslos gutes Produkt, das am 11.04. auf echte Prospects losgelassen wird.

**Warum sie entscheidend ist:**
Die Zielbilder definieren, was Gold bedeutet. Die Build-Phase entscheidet, ob Gold Realitaet wird.
Jede Woche, die unter Standard gebaut wird, multipliziert sich in der Trial-Phase.
Ein halbgoldener Maschinenstart ist schlimmer als kein Start.

**Gold Contact Standard = Abbruchkriterium:**
- Kein Prospect geht raus, wenn der reale Eindruck nicht Gold ist.
- Kein Feature wird "gut genug" shipped — es wird Gold oder es wird nicht shipped.
- Lieber Scope schneiden als unter Gold live gehen.
- Der Founder Release Gate (§8) ist der finale Beweis. Nicht Checklisten. Nicht CI-Checks. Sondern: "Wuerde ich diesen Prospect ohne Bauchweh kontaktieren?"

---

## 2. Phasen + Gesamtbild

### Was hinter uns liegt

**Phase 0: Redesign-Zielbilder — DONE**

| Strang | Dokument | Status |
|--------|----------|--------|
| Leitstand | leitstand.md | DONE |
| Voice | voice_ist.md + voice.md | DONE |
| Identity Contract | identity_contract.md | DONE (Querschnitt, 7 Regeln R1-R7) |
| Prospect Journey | prospect_journey_ist.md + prospect_journey.md | DONE (geschaerft, 18 Touchpoints) |
| Wizard | wizard_ist.md + wizard.md | DONE (N1-N7, Kategorie-Vereinheitlichung) |
| Review | review_ist.md + review.md | DONE (RS1-RS10, Nachlauf-System) |

**Was die Zielbilder liefern:** Klare Build-Specs. Jeder Build-Block hat eine Zielbild-Referenz. Kein Raten, keine offenen Designfragen.

### Was vor uns liegt

**Phase 1: Build — AKTIV (ab 13.03.) — Block A DONE (PR #168+#169)**

Zweck: Zielbilder in funktionierenden Code, verifizierte Oberflaechen und getestete Journeys ueberfuehren.

```
Woche 1 (13.-18.03.)   REFERENZ — Weinberger = Gold. System-Kern steht.
Woche 2 (19.-25.03.)   DURCHSCHLAG — Standard auf alle 7 + alle Agents + Review Gold.
Woche 3 (26.03.-01.04.) VERIFIKATION — Journey E2E, Dry-Run, Vertrag.
Woche 4 (02.-10.04.)   MASCHINE — 5 Prospects provisioniert. Founder Release Gate.
11.04.                  MASCHINENSTART — Erste E-Mail geht raus.
01.05.                  FLUG — System laeuft founder-arm.
```

---

## 3. SSOT-Rollen

Drei Dokumente. Drei Rollen. Keine Doppelpflege.

| Dokument | Rolle | Wann lesen |
|----------|-------|-----------|
| **docs/redesign/plan.md** | Build-Steuerung: Wochenplan, Streams, Gates, Founder-Aufgaben | "Was mache ich diese Woche?" |
| **docs/ticketlist.md** | Bugs, Findings, Backlog, operative Tickets | "Was ist kaputt / offen?" |
| **docs/STATUS.md** | Laufendes Lagebild: was ist live, aktueller Stand | "Was ist der Zustand des Systems?" |

**Regel:** Nach jedem Build-Block: STATUS.md updaten. Findings → ticketlist.md. Plan-Fortschritt → hier markieren.

---

## 4. Die 4 Build-Streams

### Arbeitslogik

```
Zielbild-Referenz → Build-Block → Done-Kriterium → E2E-Test → naechster Block
```

- Keine Build-Arbeit ohne Zielbildbezug.
- Keine Busywork.
- Kein Website-first Drift (Websites = Stream 2, nicht Stream 1).
- Lieber Scope schneiden als unter Gold live gehen.

### Stream-Uebersicht

| # | Stream | Kern-Inhalt | CC | Founder | Zielbild-Referenz |
|---|--------|------------|-----|---------|-------------------|
| S1 | **System-Kern** | Identity auf alle E-Mails, Day-5-Email, Demo-Tabs, Wizard Gold, Review Gold, Leitstand-Nachlauf | 90% | 10% | identity_contract, prospect_journey, wizard, review, leitstand |
| S2 | **Oberflaechen-Qualitaet** | 7 Websites Gold, alle Agents E2E, SMS-Config | 80% | 20% | voice, wizard, gold_contact |
| S3 | **Journey-Verifikation** | Trial E2E Tag 0-14, Dry-Run beide Profile, Review-Flow | 50% | 50% | prospect_journey, review |
| S4 | **Founder-Readiness** | Videos, Outreach-Templates, Vertrag, Call-Scripts | 20% | 80% | gold_contact, prospect_journey |

### Abhaengigkeiten

```
S1 (System-Kern) ──→ S2 (Oberflaechen) ──→ S3 (Journey E2E) ──→ S4 (Founder Gate)
     ↑                      ↑                      ↑
     │                      │                      │
 Woche 1               Woche 2               Woche 3-4
     │                                             │
     └── S4 laeuft PARALLEL ab Woche 1 ───────────┘
         (Videos, Outreach, Vertrag sind Founder-Work
          und brauchen keinen fertigen System-Kern)
```

**Nicht parallelisierbar:**
- S3 (Journey E2E) braucht S1 + S2 als Voraussetzung.
- Founder Release Gate (Woche 4) braucht alle 3 Streams als Voraussetzung.

**Sinnvoll parallel:**
- S1 (CC baut System-Kern) + S4 (Founder produziert Videos/Outreach) = Woche 1-2.
- S2 (CC baut Oberflaechen) + S4 (Founder uebt Call-Scripts) = Woche 2-3.

---

## 5. Stream-Details + Build-Bloecke

### S1: System-Kern

Der unsichtbare Unterbau. Wenn S1 nicht steht, ist alles andere Fassade.

| Block | Beschreibung | Zielbild | Done-Kriterium |
|-------|-------------|----------|----------------|
| S1.1 | **Identity: 7 E-Mail-Templates auf Tenant-Branding** | identity_contract R1-R7 | ✅ DONE (PR #168) |
| S1.2 | **Day-5-Email bauen** (Profil-Differenzierung Meister/Betrieb) | prospect_journey §4 Tag 5 | ✅ DONE (PR #169) |
| S1.3 | **Demo-Case-Tabs** ("Ihre Faelle" / "So sieht Ihr Alltag aus") | prospect_journey §4 Tag 0 T9 | ✅ DONE (PR #169) |
| S1.4 | **Day-7-Engagement-Snapshot** | prospect_journey §4 Tag 7 | ✅ DONE (PR #169) |
| S1.5 | **Wizard: Notfall-Logik** (N1-N7) | wizard §3 | Notfall → Telefon-CTA primaer. "Schriftlich melden" sekundaer. Kein Case ohne Warnung. |
| S1.6 | **Wizard: Kategorie-Vereinheitlichung** | wizard §8 | Eine Quelle `categories[]` in Tenant-Config. Voice + Wizard lesen dieselbe Liste. |
| S1.7 | **Review Surface: Bewertungs-Vorbereiter** | review §3 (RS1-RS10) | Auftrags-Block, editierbares Textarea, Clipboard + Google CTA, keine Sterne, kein "Max Mustermann". |
| S1.8 | **Review: Nachlauf-System** | review §5 (NS1-NS3) | 6 Status-Badges, review_sent_at, case_events Tracking, max 2 Anfragen, Resend nach 7d. |
| S1.9 | **Leitstand: Review-Badges + Nachlauf** | leitstand + review §5.3 | Review-Badge im Falldetail. "Review anfragen" / "Nochmals" / "Kein Review". |
| S1.10 | **Welcome Page Polish** | prospect_journey §4 Tag 0 T5 | ✅ PARTIAL (PR #168+#169: Countdown + Tagline. TODO: Profil-CTAs, Nav) |

### S2: Oberflaechen-Qualitaet

Was der Prospect sieht und hoert. Der Spiegel-Effekt.

**Websites — Modus × Tier:**

| Website | Modus | Tier | Gold-Standard |
|---------|-------|------|---------------|
| Weinberger AG | 2 (Extend) | 1 (Kern) | Referenz fuer alles |
| Doerfler AG | 1 (Full) | 1 (Kern) | Mobile + Desktop, Reviews, Wizard-Kategorien |
| Walter Leuthold | 1 (Full) | 1 (Kern) | Mobile + Desktop, Reviews |
| Orlandini | 1 (Full) | 1 (Kern) | Mobile + Desktop, Reviews |
| Widmer | 1 (Full) | 1 (Kern) | Mobile + Desktop, Spenglerei-Kategorien |
| Brunner HT | 1 (Full) | 2 (Demo) | Showroom-Qualitaet |
| BigBen Pub | 1 (Full) | 3 (Sonderfall) | Fertig wenn Material da. Zeitbox: max 4h. |

**Website Gold-Kriterium (Tier 1):** Mobile + Desktop pixel-perfect. Lighthouse > 90. Reviews aktuell. Wizard funktioniert. links.md existiert.

| Block | Beschreibung | Done-Kriterium |
|-------|-------------|----------------|
| S2.1 | **Weinberger = Referenz-Gold** | Lighthouse > 90, Mobile QA, Video-Integration, E2E fehlerfrei |
| S2.2 | **Tier-1-Websites × 4** (Doerfler, Leuthold, Orlandini, Widmer) | Gleicher Standard wie Weinberger. Pro Website: CC baut, Founder verifiziert auf iPhone. |
| S2.3 | **Brunner HT Showroom** | Demo = genauso beeindruckend wie Echtbetrieb |
| S2.4 | **Alle Voice-Agents: Gold-QA** | Greeting korrekt, PLZ, Empathie, Closing, FAQ, E2E (Anruf→SMS→Dashboard) |
| S2.5 | **SMS-Config alle Tenants** | Absendername + Inhalt + Link pro Tenant verifiziert |
| S2.6 | **Tab-Titel + Sidebar** | ✅ DONE (PR #168: Tab-Titel = `{short_name} OPS`, Tenant-Initialen) |

### S3: Journey-Verifikation

Der Beweis, dass alles zusammen funktioniert.

| Block | Beschreibung | Zielbild | Done-Kriterium |
|-------|-------------|----------|----------------|
| S3.1 | **Trial-Emails verifizieren** (Welcome, Day-5, Day-13, Offboarding) | prospect_journey §5 | Alle 4 kommen an, richtiger Ton, Tenant-Branding, CTA funktioniert |
| S3.2 | **Provisioning < 15 Min** | prospect_journey §10 | Gemessen, optimiert, reproduzierbar |
| S3.3 | **Review E2E** | review §3-§5 | Case→done→Badge→"Review anfragen"→E-Mail→Surface→Clipboard→Google |
| S3.4 | **Full Dry-Run Profil "Meister"** | prospect_journey §4 komplett | Tag 0-14 real durchgespielt. Jede E-Mail, jeder Screen. |
| S3.5 | **Full Dry-Run Profil "Betrieb"** | prospect_journey §4 komplett | Dasselbe, Betrieb-Perspektive (Buerokraft, Dashboard-Fokus) |
| S3.6 | **Konversions-Flow testen** | prospect_journey §4 Tag 14 | Prospect Ja → Status, Peoplefone, Demo-Cases loeschen. Dokumentiert. |

### S4: Founder-Readiness

Nur der Founder kann diese Arbeit tun. Nicht delegierbar.

| Block | Beschreibung | Referenz | Done-Kriterium |
|-------|-------------|----------|----------------|
| S4.1 | **Video-Setup** (Equipment, Workflow, Test-Recording) | gold_contact | Setup steht, reproduzierbar |
| S4.2 | **Weinberger-Video** (45-60s) | gold_contact | "Das habe ich fuer Jul. Weinberger AG gebaut." Mehrere Takes, geschnitten. |
| S4.3 | **Generisches Intro-Video** (30-45s) | gold_contact | Kein Firmenname. Wiederverwendbar. |
| S4.4 | **3 Prospect-spezifische Videos** | gold_contact | Top-3 Prospects. Persoenlich, kein Template. |
| S4.5 | **Outreach-Templates** (HOT/WARM/COLD) | gold_contact SS11 | Kein "Demo", kein Preis, kein "10 Min Gespraech". Video integriert. |
| S4.6 | **5 persoenliche Outreach-E-Mails** | gold_contact SS11 | Geschrieben (nicht generiert), Firmenname im Betreff |
| S4.7 | **Day-10-Call-Scripts ueben** | prospect_journey §4 Tag 10 | 3 Varianten (begeistert/skeptisch/Buerokraft) laut vorgelesen |
| S4.8 | **SaaS-Vertrag** | — | Template fertig, Anwalt abgestimmt, unterschriftsreif, 299 CHF/Monat |

---

## 6. Wochenplan

### Woche 1: REFERENZ (13.–18.03.)

**Ziel:** Weinberger AG ist das perfekte Referenz-System. System-Kern steht. Video-Setup bereit.

**Warum entscheidend:** Erst wenn Weinberger perfekt ist, wissen wir was "Gold" konkret bedeutet. Alles andere baut darauf auf.

| Was | CC | Founder |
|-----|-----|---------|
| **Baut** | S1.1 (7 E-Mail-Templates), S1.2 (Day-5-Email), S1.3 (Demo-Tabs), S1.5-S1.6 (Wizard Notfall + Kategorien), S1.10 (Welcome Polish), S2.1 (Weinberger Gold), S2.6 (Tab-Titel) | S4.1 (Video-Setup) |
| **Verifiziert** | — | Weinberger E2E Dry-Run (Website→Anruf→SMS→Dashboard→Welcome) |
| **Entscheidet** | — | Video-Hosting (Loom vs Embed), Vertrag-Quelle (Anwalt vs Vorlage) |

**CC: ~30h | Founder: ~20h**

**Test-/QA-Fokus:** Weinberger E2E fehlerfrei. Alle 7 E-Mails Tenant-gebranded.

**Exit-Kriterium:** Weinberger E2E bestanden (WOW 1-4 durchgespielt). Identity Contract auf alle E-Mails angewendet. Day-5-Email funktioniert.

**Groesstes Drift-Risiko:** CC baut zu viel Website-Polish statt System-Kern. **Gegenmittel:** S1 vor S2. Identity + Emails + Demo-Tabs zuerst, Lighthouse-Score danach.

---

### Woche 2: DURCHSCHLAG (19.–25.03.)

**Ziel:** Weinberger-Standard auf alle 7 Websites, alle Agents, alle SMS-Configs. Review Surface = Bewertungs-Vorbereiter. Erstes Video fertig.

**Warum entscheidend:** Der Unterschied zwischen "einem guten Beispiel" und "einem System". Wenn nur Weinberger Gold ist, haben wir kein Produkt.

| Was | CC | Founder |
|-----|-----|---------|
| **Baut** | S1.7-S1.9 (Review Surface + Nachlauf), S2.2 (4 Tier-1-Websites), S2.3 (Brunner), S2.4 (alle Agents QA), S2.5 (SMS-Config) | S4.2 (Weinberger-Video), S4.3 (Generisches Video), S4.5 (Outreach-Templates) |
| **Verifiziert** | — | Mobile QA alle 7 Websites (iPhone), alle Agents live-testen |
| **Entscheidet** | — | Orlandini Partner (#89): rein oder raus? BigBen: Material da? |

**CC: ~35h | Founder: ~25h**

**Test-/QA-Fokus:** Review Surface E2E (Fall→done→Badge→Review→Surface→Google). Alle Agents: Anruf→SMS→Dashboard korrekt.

**Exit-Kriterium:** 5 Tier-1-Websites Gold. Alle Agents E2E. Review Surface live + funktional. 2 Videos fertig. SMS-Config verifiziert.

**Groesstes Drift-Risiko:** Founder verbringt 15h mit Video-Produktion und vergisst Mobile QA. **Gegenmittel:** Mobile QA = Gate fuer Woche 3. Kein Dry-Run auf nicht-getesteten Surfaces.

---

### Woche 3: VERIFIKATION (26.03.–01.04.)

**Ziel:** Trial-Journey Tag 0-14 fuer BEIDE Profile real durchgespielt. Vertrag steht. 5 Videos fertig. Review-Flow verifiziert.

**Warum entscheidend:** Hier bricht, was in Woche 1-2 falsch war. Dry-Run ist der Haertetest. Alles was hier bricht, wird in Woche 4 als Puffer gefixt — oder der Maschinenstart verschiebt sich.

| Was | CC | Founder |
|-----|-----|---------|
| **Baut** | S1.4 (Day-7-Snapshot), S1.8 (Nachlauf-System Feinschliff), S3.1 (Trial-Emails), S3.2 (Provisioning), S3.3 (Review E2E), S3.6 (Konversions-Flow) | S4.4 (3 Prospect-Videos), S4.7 (Call-Scripts ueben), S4.8 (Vertrag finalisieren) |
| **Verifiziert** | Fixes aus Dry-Runs (Puffer: ~6h) | S3.4 (Dry-Run Meister), S3.5 (Dry-Run Betrieb) |
| **Entscheidet** | — | Maschinenstart-Schwelle: 3/5 oder hoeheres Minimum? |

**CC: ~25h | Founder: ~35h**

**Test-/QA-Fokus:** Full Dry-Run beide Profile. Jeder Tag, jede E-Mail, jeder Bildschirm. Was bricht, wird gefixt.

**Exit-Kriterium:** Dry-Run "Meister" bestanden. Dry-Run "Betrieb" bestanden. Vertrag unterschriftsreif. 5 Videos fertig. Provisioning < 15 Min.

**Groesstes Drift-Risiko:** Dry-Run enthuellt zu viele Fehler → Woche 4 wird reine Fix-Woche statt Provisioning. **Gegenmittel:** Puffer 6h CC + 3h Founder. Wenn mehr als 6h Fixes noetig: Scope schneiden (weniger Prospects in Woche 4).

---

### Woche 4: MASCHINE (02.–10.04.)

**Ziel:** 5 Prospects provisioniert, QA-bestanden. Founder Release Gate bestanden. Am 11.04. geht die erste E-Mail raus.

**Warum entscheidend:** Die letzte Woche. Kein Raum fuer neue Features. Nur: provisionieren, testen, freigeben.

| Was | CC | Founder |
|-----|-----|---------|
| **Baut** | 5× Prospect provisionieren (Crawl→Website→Agent→Tenant→SMS→Demo-Cases) | S4.6 (5 persoenliche Outreach-E-Mails) |
| **Verifiziert** | Final System-Check (Health, Sentry, Telegram, Lifecycle Tick) | **FOUNDER RELEASE GATE** pro Prospect (§8) |
| **Entscheidet** | — | Go/No-Go pro Prospect. Maschinenstart-Freigabe. |

**CC: ~20h | Founder: ~30h**

**Test-/QA-Fokus:** Founder ruft jede Nummer an, prueft SMS, oeffnet Dashboard auf iPhone, liest Outreach-E-Mail.

**Exit-Kriterium:** Mindestens 3/5 Prospects bestehen Founder Release Gate. System Health gruen. Morning Report zeigt "outreach-ready".

**Groesstes Drift-Risiko:** Founder gibt Prospects durch, die nicht Gold sind ("Reicht schon fuer den Anfang"). **Gegenmittel:** Gate ist 10/10 oder 8-9/10 (mit dokumentiertem Plan fuer fehlende Punkte). < 8 = Prospect geht nicht raus.

---

## 7. Rollenlogik

### CC-Work (System + Code)

- Alle Build-Bloecke in S1 + S2
- E-Mail-Templates, Wizard-Logik, Review Surface, Leitstand-Nachlauf
- Website Gold-Standard (Code, Performance, Lighthouse)
- Agent-JSON + retell_sync.mjs
- Provisioning der 5 Prospects in Woche 4
- Fixes aus Dry-Runs und QA
- SSOT-Updates nach jedem Block

### Founder-Work (Erlebnis + Entscheid)

- Videos aufnehmen + schneiden
- Outreach-E-Mails schreiben (persoenlich, kein Template)
- Call-Scripts ueben (laut, mit Varianten)
- SaaS-Vertrag (Anwalt, Template, Finalisierung)
- Mobile QA auf echtem iPhone
- Alle Agents live anrufen
- Dry-Run beide Profile durchspielen
- Founder Release Gate durchfuehren

### Gemeinsame Gates

| Gate | Wann | Wer prueft |
|------|------|-----------|
| Weinberger E2E | Ende Woche 1 | Founder (Anruf + iPhone) + CC (System-Check) |
| Mobile QA alle 7 | Ende Woche 2 | Founder (iPhone) + CC (Lighthouse) |
| Dry-Run Meister | Woche 3 | Founder (durchspielt) + CC (fixt was bricht) |
| Dry-Run Betrieb | Woche 3 | Founder (durchspielt) + CC (fixt was bricht) |
| **Founder Release Gate** | Ende Woche 4 | **Founder allein** (nicht delegierbar) |

### Reine Freigabepunkte (Founder)

- Video-Hosting-Entscheid (Woche 1)
- Vertrag-Quelle (Woche 1)
- Orlandini Partner-Entscheid (Woche 2)
- Maschinenstart-Schwelle (Woche 3)
- Go/No-Go pro Prospect (Woche 4)

---

## 8. Founder Release Gate

### Prüfkriterien pro Prospect (10 Beruehrungspunkte)

> **"Wuerde ich diesen Prospect jetzt ohne Bauchweh kontaktieren — ja oder nein?"**

| # | Beruehrungspunkt | Pruefung |
|---|-----------------|---------|
| 1 | **Persoenliche E-Mail** | Klingt persoenlich, nicht nach Template. Firmenname im Betreff. |
| 2 | **Prospect-spezifisches Video** | Zeigt SEINEN Betrieb. Kein Versprecher, guter Ton. |
| 3 | **Website / Webflaeche** | Auf iPhone geoeffnet. Professionell. Sein Name, seine Services. Schnell. |
| 4 | **Voice-Agent** | Angerufen. Lisa sagt seinen Firmennamen. PLZ funktioniert. Kein Fehler. |
| 5 | **SMS-Moment** | SMS kam an. Richtiger Absendername. Link funktioniert. Foto-Upload geht. |
| 6 | **Welcome / Magic Link** | Link geklickt → Dashboard. Kein Passwort. Welcome Page zeigt seine Nummer. |
| 7 | **Dashboard / Mobile** | Auf iPhone. Sein Testfall da. Demo-Cases nicht stoerend. Professionell. |
| 8 | **Trial-Journey Tag 0-14** | Day-5, Day-13 Email kommen an. Richtiger Ton. Lifecycle Tick laeuft. |
| 9 | **Day-10 Call-Script** | Fuer diesen Prospect vorbereitet. Meister oder Betrieb? Welche Variante bei Skepsis? |
| 10 | **Vertrags-/Closing-Readiness** | Wenn er Ja sagt: Vertrag da? Preis klar? Naechster Schritt definiert? |

### Bewertung

- **10/10:** Prospect geht raus am 11.04.
- **8-9/10:** Geht raus, fehlende Punkte werden nachgezogen (kein Kill-Szenario betroffen).
- **< 8/10:** Prospect geht NICHT raus. CC fixt. Founder re-prueft.

### Minimum fuer Maschinenstart

- Mindestens **3 von 5** Prospects muessen Gate bestehen.
- Weniger als 3: Maschinenstart verschieben.
- Das ist kein Scheitern — das ist Qualitaetskontrolle.
- **Kein Prospect geht raus, der das Gate nicht bestanden hat.**

---

## 9. Anti-Drift

### Was NICHT Teil der Build-Phase ist

| Thema | Grund |
|-------|-------|
| Google Reviews API Import | gold_contact: "Google-Link klicken", nicht automatisch importieren |
| Stripe / automatisierte Billing | Vertrag + manuelle Rechnung reicht fuer 1-5 Kunden |
| Mobile App / PWA | Magic Link → Dashboard. Kein App Store. |
| Kalender-Sync | Kundenfeedback-Trigger, nicht Gold Contact |
| Analytics Dashboard | Post-Go-Live |
| LinkedIn | Marketing-Kanal, nicht Contact-to-Test Experience |

### 4 Drift-Gefahren

| Gefahr | Gegenmittel |
|--------|------------|
| **Website-first:** CC verbringt 40h mit Lighthouse statt System-Kern | S1 vor S2. Identity + Emails + Tabs zuerst. |
| **Architektur-Selbstzweck:** Automatisierte CI-Pipeline fuer 5 Prospects | Jeder CC-Task muss bestehen: "Merkt der Prospect den Unterschied?" |
| **Viel gebaut, Erlebnis nicht brutal gut:** Checklisten gruen, Video mittelmaessig | Founder Release Gate testet Erlebnis, nicht System. |
| **BigBen verwaessert Kernfokus:** 15h Swisscom-Debugging statt Call-Scripts | Zeitbox: max 4h. Nur wenn Tier-1-Gates on track. |

---

## 10. Zeithorizont-Uebersicht

| Woche | CC | Founder | Thema | Gate |
|-------|-----|---------|-------|------|
| 1 (13.-18.03.) | ~30h | ~20h | Referenz-Standard + System-Kern | Weinberger E2E |
| 2 (19.-25.03.) | ~35h | ~25h | Standard Durchschlagen + Review Gold | Mobile QA + Agents E2E |
| 3 (26.03.-01.04.) | ~25h | ~35h | Journey Verifikation + Vertrag | Dry-Run × 2 |
| 4 (02.-10.04.) | ~20h | ~30h | Maschine Scharf | **Founder Release Gate** |
| **Total** | **~110h** | **~110h** | | |

**Founder: 110h von 170h** → 60h Reserve fuer Video-Retakes, Vertragsverhandlung, Dry-Run-Fixes, weitere Prospects.

Die Reserve ist kein Budget fuer neue Features. Sie fliesst dorthin, wo Dry-Runs und das Founder Release Gate zeigen, dass es noch nicht reicht.

---

## 11. Am 10.04. erkennen wir Gold daran

Am 11.04. oeffnet Gunnar sein Handy, waehlt Prospect #1 aus und drueckt "Senden" auf eine E-Mail, die den Namen des Betriebs im Betreff hat, ein 45-Sekunden-Video enthaelt das seinen Betrieb zeigt, und eine Testnummer die sofort funktioniert. Alles dahinter — Website, Lisa, SMS, Dashboard, Welcome-Flow, Review-Engine, Trial-Emails, Day-10-Script, Vertrag — steht. Nicht "meistens." Nicht "fuer Weinberger." Fuer jeden Prospect, der das Founder Release Gate bestanden hat. Kompromisslos.
