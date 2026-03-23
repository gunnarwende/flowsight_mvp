# Redesign Website — Projektplan

**Projekt:** FlowSight Website Redesign (flowsight.ch)
**Status:** Planung — noch keine Umsetzung
**Erstellt:** 2026-03-23
**Beteiligte:** Founder (Gunnar), ChatGPT (Strategie/Copy), Claude Code (Architektur/Umsetzung)

---

## Projektkontext

Die aktuelle Website transportiert nicht, was FlowSight kann und wofür es steht. Das Produkt, die Gold-Contact-Logik und die operative Tiefe sind weiter als die Website. Dadurch entsteht eine Lücke: Persönliches Video und Outreach können stark sein — aber wenn der Prospect danach die Website öffnet und keinen klaren roten Faden erlebt, sinkt Vertrauen und Conversion.

Die Website ist Teil der Gold-Contact-Kette, nicht der gesamte Vertrieb. Sie ist primär **Vertrauensverstärker + Einordnungsmaschine** nach dem ersten persönlichen Kontakt.

---

## Founder-Leitplanken (nicht verhandelbar)

Jede Entscheidung im Projekt wird gemessen an:

| Leitplanke | Bedeutung |
|------------|-----------|
| **Skalierung** | Funktioniert die Entscheidung auch bei 50 Kunden und 3 Branchen? |
| **Weitsicht** | Müssen wir in 6 Monaten wieder umbauen oder hält das? |
| **Örtliche Verbundenheit** | Spürt man Schweiz, Region, Handwerk — nicht Silicon Valley? |
| **Kaufpsychologie** | Senkt das die Kaufhürde oder erzeugt es neue Reibung? |
| **High-End-Wirkung** | Würde ein Hilti/Festool-Marketingleiter nicken oder den Kopf schütteln? |

**Operativer Test für jede Entscheidung:** "Nickt ein Sanitär-Meister nach 30 Sekunden auf seinem iPhone?"

---

## Redesign-Nordstern

**Die Website darf nicht zeigen, was FlowSight alles hat. Sie muss zeigen, wie ein Betrieb mit FlowSight sauber läuft.**

### Was der Prospect verstehen muss:
- **Nach 10 Sek:** "Das ist ein professionelles System für Handwerksbetriebe."
- **Nach 30 Sek:** "Die verstehen meinen Alltag. Das löst ein Problem das ich habe."
- **Nach 60 Sek:** "Das ist seriös, das ist für mich, ich will mehr sehen."

### Was der Prospect als Nächstes tun soll:
"Live erleben" klicken → Video schauen / Kontakt aufnehmen.

---

## Homepage vs. /live-erleben — Klare Trennung

| | **Homepage** | **/live-erleben** |
|---|---|---|
| **Aufgabe** | Verstehen + Vertrauen aufbauen | Beweisen + nächsten Schritt ermöglichen |
| **Dauer** | 30-60 Sek Aufmerksamkeit | 2-5 Min für Interessierte |
| **Scroll-Budget** | Max 7 Thumb-Scrolls auf iPhone | Kann länger sein |
| **Video** | Kein embedded Video. Nur Motion-Loop im Hero (optional) | 2-Min-Video prominent (wenn verfügbar) |
| **Inhalt** | 5-Akt-Struktur: Versprechen → Empathie → Beweis → Sicherheit → Handlung | Video + Detail-Prozess + Formular + FAQ |
| **CTA-Ziel** | → /live-erleben | → Formular (Kontaktaufnahme) |
| **Pricing** | Teaser (Startpreis + "transparent, fair") | Verweis auf /pricing |

**Regel:** Was auf der Homepage steht, steht NICHT nochmal auf /live-erleben. Keine Redundanz.

---

## 5-Akt-Struktur Homepage

| Akt | Psychologische Rolle | Was der Prospect denkt | Mobile-Scroll |
|-----|---------------------|----------------------|---------------|
| **1. Versprechen** (Hero) | Catch + Positionierung | "Was ist das und für wen?" | Screen 1 |
| **2. Empathie** | Wiedererkennung | "Die kennen meinen Alltag." | Screen 2 |
| **3. Beweis** (Prozess) | Proof + Klarheit | "So läuft das also. Das ergibt Sinn." | Screen 3-4 |
| **4. Sicherheit** (Preis + Vertrauen) | Hürden senken | "Was kostet's? Ist es sicher? Kein Risiko?" | Screen 5-6 |
| **5. Handlung** (CTA) | Nächster Schritt | "Was mache ich jetzt?" | Screen 7 |

---

## Phasenplan

---

### Phase A: Fundament + Seitenarchitektur

**Ziel:** Die 5-Akt-Struktur steht. Jede Section hat exakt eine Rolle. Keine Diskussion mehr danach.

**Deliverable:**
- Finale 5-Akt-Zuordnung mit Rolle pro Section
- Finale Homepage vs /live-erleben Aufteilung
- Pain-Type-Integration (implizit über Prozessfluss, nicht als Karten)

| Verantwortung | Aufgaben |
|---------------|----------|
| **CC kann selbst** | Bestehende Seite analysieren, technische Constraints auflisten (Mobile Viewport, Performance), Component-Inventar erstellen, Machbarkeit jeder Section einschätzen |
| **Founder muss** | Finale 5-Akt-Struktur bestätigen, entscheiden ob Pricing auf Homepage als Section oder nur Teaser, entscheiden ob Social Proof/Referenzen auf Homepage oder nur /live-erleben |
| **ChatGPT kann** | Kaufpsychologische Reihenfolge challengen, Section-Rollen schärfen, alternative Akt-Strukturen vorschlagen |

**Offene Founder-Entscheidung:** Pricing auf Homepage — vollständig, Teaser oder gar nicht?

**Typische Fehler:** Zu viele Sections "weil wir sie schon haben". Section ohne klare Einzelrolle.

---

### Phase B: Hero-System

**Ziel:** Der oberste Mobile-Screen funktioniert. 5 Sekunden reichen um FlowSight einzuordnen.

**Deliverable:**
- Finale Hero-Copy (Headline + Subline + Proof-Dots + CTA)
- Visual-Konzept (Beschreibung, noch kein Code)
- Mobile-Wireframe (Text-Mengen auf 390px validiert)

| Verantwortung | Aufgaben |
|---------------|----------|
| **CC kann selbst** | Mobile-Viewport berechnen (wie viele Wörter passen above-the-fold auf iPhone SE/14/15), bestehende Hero-Komponenten inventarisieren, technische Motion-Optionen auflisten (CSS-Animation vs. Lottie vs. Video-Loop, je mit Pro/Con/Performance) |
| **Founder muss** | Headline final entscheiden (max 2 Runden), Visual-Richtung wählen (abstrakt vs. konkret), CTA-Text bestätigen |
| **ChatGPT kann** | 3 Headline-Varianten liefern, Subline schärfen, Proof-Dots texten, Hero-Dramaturgie challengen |

**Offene Founder-Entscheidung:** Hero-Visual — (a) abstrakt/ruhig (Gold-Pulse, Fluss-Andeutung), (b) konkret (SMS + Fall wie bisher, aber generisch), oder (c) Motion-Loop (animierter Prozessfluss)?

**Typische Fehler:** Endlos-Schleifen bei Headline. Visual-Diskussion bevor Copy steht. Zu viel Text above the fold.

**Regel:** Headline wird max 2× diskutiert, dann Founder-Entscheid. Final.

---

### Phase C: Copy für alle Sections

**Ziel:** Jede Section hat finalen, mobile-tauglichen Text. Max 2 kurze Sätze pro Section-Body.

**Deliverable:**
- Vollständige Copy für alle 5 Homepage-Akte
- Copy für /live-erleben
- Copy-Anpassungen für /pricing

| Verantwortung | Aufgaben |
|---------------|----------|
| **CC kann selbst** | Zeichenzählung pro Section (Mobile-Constraint), bestehende Copy inventarisieren und Recycling-Potenzial identifizieren, Copy auf Konsistenz mit Terminologie-Regeln prüfen (kein "Lisa", kein "5-Sterne", kein "Dashboard") |
| **Founder muss** | Copy pro Section abnehmen, Empathie-Satz aus echter Prospect-Brille validieren ("Würde ein Meister so reden?"), Pricing-Copy freigeben |
| **ChatGPT kann** | Copy-Entwürfe pro Section liefern, Tonalität challengen (Handwerker-Sprache vs. Marketing), Empathie-Moment texten, CTA-Varianten vorschlagen |

**Offene Founder-Entscheidung:** Empathie-Section — welcher konkrete Alltagsmoment wird benannt?

**Typische Fehler:** Copy zu lang für Mobile. Marketing-Sprache statt Handwerker-Sprache. Jede Section versucht "alles zu sagen".

---

### CHECKPOINT: Founder-Walkthrough

**Ziel:** Bevor Design und Motion starten, prüft der Founder den Seitenfluss auf seinem iPhone.

**Methode:** Einfaches Text-Dokument oder Wireframe mit der Copy in richtiger Reihenfolge. Kein Design nötig — nur Text + Struktur. Auf iPhone durchscrollen.

**Deliverable:** Go/No-Go. Max 3 konkrete Änderungen.

| Verantwortung | Aufgaben |
|---------------|----------|
| **CC kann selbst** | Wireframe/Textdokument erstellen das auf Mobile lesbar ist |
| **Founder muss** | Auf eigenem iPhone durchscrollen, ehrliches Urteil geben, max 3 Fixes benennen |
| **ChatGPT kann** | Nicht beteiligt. Rein Founder-Urteil. |

**Regel:** Keine "nochmal alles überdenken"-Runde. Max 3 Korrekturen, dann weiter.

---

### Phase D: Design-System

**Ziel:** Ein visuelles System das für alle Sections gilt. Keine Section sieht aus als käme sie aus einem anderen Projekt.

**Deliverable:**
- Section-Rhythmus (Dark/Light/Tinted Abfolge)
- Mobile-Typografie (H1/H2/Body/Small Grössen auf 390px)
- Abstands-System (Padding zwischen Sections)
- CTA-Pattern (Primary + Secondary)
- Proof-Dot-Pattern (Gold Dot + Text)

| Verantwortung | Aufgaben |
|---------------|----------|
| **CC kann selbst** | Design-Tokens definieren (basierend auf bestehendem Brand System), Tailwind-Klassen vorbereiten, Section-Template als Komponente skizzieren, Mobile-Typografie berechnen, bestehende globals.css + Brand System als Basis nutzen |
| **Founder muss** | Visuellen Rhythmus bestätigen ("Fühlt sich das hochwertig an?"), Gold-Einsatz validieren (zu viel? zu wenig?) |
| **ChatGPT kann** | Nicht beteiligt. Design-System = technisch + visuell, kein Text. |

**Typische Fehler:** Jede Section bekommt eigene Styles. Desktop-first denken. Zu viele visuelle Varianten.

---

### Phase E: Motion + Video

**Ziel:** Visueller Proof der das System spürbar macht, nicht nur beschreibt.

**Deliverable:**
- Hero-Motion (Loop oder animiertes Element)
- /live-erleben Video-Einbindung (Platzhalter oder echtes Video)
- Performance-Optimierung (prefers-reduced-motion, lazy load)

| Verantwortung | Aufgaben |
|---------------|----------|
| **CC kann selbst** | CSS/SVG-Animation für Hero-Loop bauen, Lottie-Integration evaluieren, Video-Embed-Komponente mit Lazy Loading, Performance-Tests auf Mobile, prefers-reduced-motion Fallback |
| **Founder muss** | Motion-Richtung final entscheiden (abstrakt vs. konkret), 2-Min-Video aufnehmen (wenn in dieser Phase gewünscht), Motion auf eigenem iPhone prüfen ("Wirkt das hochwertig?") |
| **ChatGPT kann** | Nicht beteiligt. Motion = visuell-technisch. |

**Offene Founder-Entscheidung:** Motion-Loop — CSS-Animation (realistisch, CC kann selbst) vs. Echtvideo-Loop (braucht Founder-Aufnahme)?

**Typische Fehler:** Motion als Selbstzweck. Loop zu komplex/lang. Performance-Probleme auf Mobile.

---

### Phase F: Umsetzung (Code)

**Ziel:** Alles aus Phase A-E wird live. Neue Homepage, neue /live-erleben, angepasste /pricing.

**Deliverable:**
- Homepage page.tsx (komplett neu, 5 Akte)
- HeroVisual.tsx (mit Motion-Slot)
- /live-erleben page.tsx (komplett neu)
- /pricing Anpassungen
- Layout + MobileNav Anpassungen
- Mobile QA
- Branch + PR + CI green

| Verantwortung | Aufgaben |
|---------------|----------|
| **CC kann selbst** | Gesamte Code-Umsetzung, Component-Architektur, Mobile-first CSS, Build + Deploy-Pipeline, PR-Erstellung |
| **Founder muss** | Nichts in dieser Phase — alles ist bereits entschieden |
| **ChatGPT kann** | Nicht beteiligt. Reine Umsetzung. |

**Regel:** Keine Copy-Änderungen während der Umsetzung. Keine neuen Sections. Alles was hier gebaut wird, wurde in Phase A-E entschieden.

**Typische Fehler:** "Noch schnell eine Section hinzufügen". Copy-Korrekturen die Layout brechen. Desktop-first coden.

---

### Phase G: Polish + Launch

**Ziel:** Founder prüft auf Prod-Preview. Letzte Feinschliffe. Deploy.

**Deliverable:**
- Founder-approved Prod-Preview
- Max 5 konkrete Fixes
- SEO-Check (Meta, OG, canonical)
- Brand-Compliance-Check
- Final Merge + Deploy
- SSOT Updates (STATUS.md, ticketlist.md, business_briefing.md)

| Verantwortung | Aufgaben |
|---------------|----------|
| **CC kann selbst** | Fixes umsetzen, SEO-Check, Brand-Check, Deploy, SSOT-Updates |
| **Founder muss** | Preview auf iPhone prüfen, max 5 Fixes benennen, Launch-Freigabe geben |
| **ChatGPT kann** | Nicht beteiligt. Rein Founder + CC. |

---

## Offene Founder-Entscheidungen (5 kritische)

| # | Entscheidung | Wann | Optionen | Warum kritisch |
|---|-------------|------|----------|---------------|
| **F1** | Pricing auf Homepage | Phase A | (a) Vollständige 3-Tier Section, (b) Teaser mit Link zu /pricing, (c) Kein Pricing auf Homepage | Bestimmt Seitenlänge + Conversion-Logik |
| **F2** | Hero-Headline final | Phase B | (a) "Das Leitsystem für Ihren Betrieb" (aktuell), (b) Neue Richtung via ChatGPT, (c) Komplett andere Tonalität | Bestimmt den Ersteindruck. Max 2 Runden. |
| **F3** | Hero-Visual Richtung | Phase B/E | (a) Abstrakt/ruhig (CSS-Pulse), (b) Konkret-generisch (Prozess-Illustration), (c) Motion-Loop (animierter Betriebsfluss) | Bestimmt 8h Motion-Arbeit |
| **F4** | Empathie-Moment Inhalt | Phase C | Welcher Alltagsmoment wird benannt? Muss authentisch sein — nur Founder kann das validieren. | Der emotionale Schlüsselmoment der ganzen Seite |
| **F5** | Launch-Datum | Phase A | Fixer Tag — auch wenn noch nicht perfekt. Perfekt wird es durch Iteration nach Launch. | Verhindert endlose Optimierung |

---

## Regeln damit das Projekt nicht verwässert

1. **Max 2 Diskussionsrunden pro Entscheidung.** Danach Founder-Entscheid. Final.
2. **Keine neuen Sections nach Phase A.** Was nicht in der 5-Akt-Struktur steht, kommt nicht rein.
3. **Keine Copy-Änderungen nach Phase C.** Ausnahme: Tippfehler.
4. **7 Thumb-Scrolls auf iPhone = Maximum.** Wenn die Homepage länger ist, muss etwas raus.
5. **Mobile-first immer.** Jede Section wird zuerst auf 390px designed, dann auf Desktop erweitert.
6. **Kein "wäre es nicht besser wenn..."** nach dem Checkpoint. Der Checkpoint ist Go/No-Go, nicht Neustart.
7. **Deploy gewinnt.** Live + iterieren > perfekt + nie deployen.

---

## No-Gos

- Modulhaftes Erzählen ("Feature 1, Feature 2, Feature 3")
- SaaS-Sprache ("Dashboard", "Onboarding", "Pipeline", "Agent")
- "Lisa" in kundengerichtetem Text (Prospect kennt sie nicht)
- "5-Sterne-Bewertung" (zu werblich)
- Konkreter Kundenname im Hero-Visual (Weinberger, Dörfler etc.)
- Embedded Video auf der Homepage (gehört auf /live-erleben)
- Desktop-first Design das auf Mobile gequetscht wird
- Mehr als 2 CTAs gleichzeitig sichtbar
- Stock-Fotos (Handshakes, Callcenter, Hochhäuser)
- "KI", "AI", "künstliche Intelligenz" in kundengerichtetem Text

---

## Timeboxing

| Phase | Stunden | Kumuliert | Wer führt |
|-------|---------|-----------|-----------|
| A: Fundament | 6h | 6h | Founder + ChatGPT + CC |
| B: Hero | 4h | 10h | Founder + ChatGPT, CC prüft |
| C: Copy | 8h | 18h | ChatGPT + Founder, CC prüft |
| Checkpoint | 2h | 20h | Founder allein |
| D: Design | 6h | 26h | CC, Founder bestätigt |
| E: Motion | 8h | 34h | CC, Founder entscheidet Richtung |
| F: Code | 10h | 44h | CC allein |
| G: Polish | 4h | 48h | Founder + CC |

---

## Abhängigkeiten

```
Phase A ──→ Phase B ──→ Phase C ──→ Checkpoint
                                        │
                                        ▼
                              Phase D ──→ Phase E ──→ Phase F ──→ Phase G
```

- B braucht A (Section-Rollen bestimmen Hero-Rolle)
- C braucht B (Hero-Copy steht, Rest folgt)
- Checkpoint braucht C (vollständige Copy zum Durchscrollen)
- D braucht Checkpoint (Go/No-Go bevor Design-Arbeit)
- E braucht D (Motion muss ins Design-System passen)
- F braucht E (alle Assets bereit)
- G braucht F (Deploy-fähiger Stand)

**Nichts ist parallelisierbar.** Jede Phase baut auf der vorherigen auf. Das ist beabsichtigt — es verhindert Rework.

---

## Referenzen

| Dokument | Rolle |
|----------|-------|
| `docs/redesign/redesign website/Redesign Website.md` | Analyse + Problembeschreibung (Arbeitsgrundlage) |
| `docs/brand/brand_system.md` | Farben, Typografie, Regeln (Design-Basis) |
| `docs/brand/website_playbook.md` | Website-Playbook (wenn vorhanden) |
| `docs/gtm/gold_contact.md` | Kaufpsychologie + Prospect Journey (Nordstern) |
| `docs/gtm/verkaufspsychologie.md` | Touchpoint-Architektur |
| `docs/redesign/identity_contract.md` | Branding-Regeln (R1-R7, E1-E5) |
| `src/web/src/lib/marketing/constants.ts` | Marketing-Konstanten |
| `src/web/app/(marketing)/page.tsx` | Aktuelle Homepage (Ausgangspunkt) |
