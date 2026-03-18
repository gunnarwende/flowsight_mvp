# Plan Leitsystem — High-End Umsetzung

**Erstellt:** 2026-03-17
**Letztes Update:** 2026-03-18 (Phase 4 — Leitzentrale merged, 6 Systemfluss-Karten)
**Owner:** Founder + CC
**Nordstern:** `leitsystem_leitzentrale_super_high_end_plan.md`
**Referenz:** `leitstand.md` (Grundvertrag), `leitstand_renovation.md` (Implementierungs-Brücke)
**Prinzip:** 110% High-End. Kein Kompromiss bei Qualität, Design, Nutzererlebnis.

---

## Kern-Philosophie

Das Leitsystem bildet den **kompletten Auftragszyklus** ab:

```
Eingang → Sichtung → Termin → Einsatz → Erledigt → Bewertung ★
```

Jede Stufe ist sichtbar, steuerbar, abschliessbar. Die Bewertung (Google-Sterne) ist der **verdiente Lohn** — darauf läuft das ganze System hinaus. Das unterscheidet FlowSight von jeder Ticketing-Software: Wir schliessen den Kreis.

---

## Fixe Entscheidungen (Session 17.03.)

| # | Entscheidung | Begründung |
|---|-------------|------------|
| **E1** | Status "Abgeschlossen" eliminiert. Nur: Neu → Geplant → In Arbeit → Warten → Erledigt | Einfacher. Erledigt = Arbeit getan. Danach optional Bewertung anfragen. |
| **E2** | Leitzentrale + Fallübersicht = EINE Seite (nur 2 Nav-Punkte: Leitzentrale + Einstellungen) | Oben: Systemfluss-KPIs (klickbar). Unten: gefilterte Fallliste. Kein Hin-und-Her. |
| **E3** | Notfälle NICHT separat, sondern integriert in Gesamtliste mit roter Prioritäts-Markierung | Kein eigener Banner, keine eigene Seite. Höchste Priorität = oben in der Liste. |
| **E4** | Termin-Sende-Icon nur nach Edit-Save sichtbar (30s Timeout). Sendet an Kunde + Mitarbeiter. | Kein versehentliches Senden. Papierflieger-Icon inline neben Termin-Badge. |
| **E5** | SMS immer ≤ 160 Zeichen (eCall: ab 161 = doppelter Preis) | Kosten + Zustellbarkeit. Jedes Template wird auf 160 Zeichen geprüft. |
| **E6** | Kalender-Sync nötig (Read-Only: Outlook/Google) beim Zuweisen | Keine Termin-Überschneidungen. Skalierbar für 2–30 MA. |
| **E7** | "Zuständig" = Multi-Select-Dropdown aus Staff-Tabelle (nicht Freitext) | Grössere Projekte haben mehrere Mitarbeiter. |
| **E8** | Bewertungs-Button erst sichtbar wenn Status = Erledigt | Logischer Fluss: Erst Arbeit, dann Lohn. |
| **E9** | Layout aktuell 50/50 (Founder testet). Beschreibung/Verlauf links, Kontakt/Notizen rechts. | Feedback-Runde 2: 50/50 zum Testen deployed. Founder entscheidet ob final. |
| **E10** | Verlauf-Struktur bleibt: Schritt 1 → nächster Schritt → komprimiert → letzter Schritt → Zieleinlauf (Bewertung) | Bewährt, logisch, platzsparend. |
| **E11** | Übersicht-Bereich: weisser Hintergrund + Shadow + goldener Akzent-Balken links | Stärkste visuelle Präsenz für die wichtigste Area. Einheitliche Pill-Badges für alle 4 Werte. |

---

## Session 17.03. — Was wurde gemacht

### Vor Phase 1: Login + PWA Fixes (PRs #238–#245)
- **Login-Bug gefixt:** Session-Cookies server-side gesetzt (Re-Login nach Logout funktioniert)
- **Spam-Fix:** E-Mail-Sender auf `send.flowsight.ch` (verifizierte Resend-Domain)
- **Login High-End Redesign:** Brand-System-konform (warm-white, gold CTA, Signal Dot, Swiss Trust Footer)
- **PWA Icon:** Signal Dot (goldener Punkt auf Navy), responsiv pro Grösse
- **PWA Update-Prompt:** "Neue Version verfügbar" Banner für automatische Updates (kritisch für 50+ Betriebe)
- **PWA Titel:** Nur "Leitsystem" (kein doppeltes "Leitsystem - Weinberger Leitsystem")

### Phase 1: Der Fall — KOMPLETT (8/8 Tasks, PRs #246–#252)

| # | Task | PR | Highlights |
|---|------|----|------------|
| 1.1 | Status vereinfachen | #246 | "Abgeschlossen" entfernt. Kette: Neu → Geplant → In Arbeit → Warten → Erledigt. |
| 1.2 | Termin-Validierung | #248 | "Bis" frühestens "Von" + 15min. Ausgegraute Slots. Server-Validierung. |
| 1.3 | Multi-Select Staff | #252 | Chips-UI mit Suchfilter + Initialen-Avatar. Diff-basierte E-Mail-Benachrichtigung. |
| 1.4 | Termin-Benachrichtigung | #251 | 2 Buttons → 1 inline Papierflieger-Icon. -62 Zeilen netto. |
| 1.5 | Layout-Rebalance | #250 | Card-wrapped Sections. Mobile: wichtige Info zuerst. |
| 1.6 | Bewertungs-Flow | #251 | Nur bei Status=Erledigt. Labels: "Bewertung möglich", "Nicht anfragen". |
| 1.7 | Wording-Sweep | #246 | 17 Dateien, 30+ Edits. Meldende→Kunde, Dringlichkeit→Priorität, etc. |
| 1.8 | Mobile Overflow | #248 | overflow-x-hidden global, truncate, break-words, min-w-0. |

### Feedback-Runde 1 (PR #254) — nach Phase 1
- F1+F2: "Termin versenden" von Standalone-Button zu inline Papierflieger-Icon neben Termin-Badge
- F3: Layout getauscht (Beschreibung links gross, Kontakt rechts klein)
- F4: Übergang Übersicht → Content geglättet (kein harter Border mehr)
- F5: Einheitliche Pill-Badges für Status, Priorität, Zuständig, Termin
- F6: Mobile-Reihenfolge: Beschreibung vor Notizen

### Feedback-Runde 2 (PR #256) — Feinschliff
- F7: Termin-Icon NUR sichtbar nach Edit-Save (terminJustSaved Gate, 30s Timeout)
- F8: Übersicht visuell stärker (bg-white, shadow-sm, amber Akzent-Balken links)
- F9: Notizen-Overflow gefixt (break-words + overflowWrap: anywhere)
- F10: Trennlinien zwischen Right-Rail Cards entfernt
- F11: Layout auf 50/50 gesetzt (Founder testet)

---

### Feedback-Runde 3 (18.03.) — Layout + Übersicht + Termin + Benachrichtigungen

- F12: Layout 50/50 bestätigt. Beschreibung + Kontakt Cards gleiche Höhe (CSS Grid). **DONE** (PR #258)
- F13: Amber Akzent-Balken weg → subtiler stone-to-white Gradient. **DONE** (PR #258)
- F14→F15: Benachrichtigungs-Buttons NUR im Edit-Mode, sofort bei Änderung. Button = speichert + sendet. **DONE** (PRs #259, #260)
- Neue API: `POST /api/ops/cases/[id]/notify-assignees` — manueller Versand an neue Zuständige.
- PATCH Route: `_skip_assignee_notify` Flag für manuellen Flow.

---

### Phase 2: Kommunikation & SMS — KOMPLETT (18.03., PRs #261–#265)

| # | Task | Status | Evidence |
|---|------|--------|----------|
| 2.1 | **SMS-Audit** | **DONE** | Alle 4 Templates ≤ 160 Chars. Post-Call: 251→130, Review: 268→110. PRs #262, #263. |
| 2.2 | **Termin-SMS Fallback** | **DONE** | Voice-Fälle ohne E-Mail: SMS als Primärkanal. PR #262. |
| 2.3 | **Kanal-Hinweise Leitstand** | **DONE** | "per SMS", "per E-Mail + SMS", "Keine Kontaktdaten" unter Termin-Button. PR #264. |
| 2.4 | **E-Mail-Audit** | **DONE** | "Dashboard"→"Leitstand", ICS Sender-Fallback korrigiert. PR #264. |
| 2.5 | **160-Char Sentry Guard** | **DONE** | Warning bei >160 Chars (kein Reject). PR #265. |
| 2.6 | **Zustellberichte** | GEPARKT | eCall liefert message_id. Delivery-Status-Abfrage = Post-MVP. |
| 2.7 | **Anti-Spam** | **DONE** | Resend SPF/DKIM/DMARC verifiziert auf send.flowsight.ch. |

**Kommunikationsmatrix:** `docs/redesign/leitstand/Matrix_kommunikation.md` — SSOT für alle Benachrichtigungen (25+ Trigger, 5 Kanäle, 5 Akteure). K1–K5 Entscheidungen fixiert.

**SMS-Templates final:**

| Template | Chars | Text |
|----------|-------|------|
| Post-Call | ~130 | `{Firma}: Ihre Meldung {Kat} wurde erfasst. Bitte Name & Adresse prüfen und Fotos hochladen: {URL}` |
| Termin | ~81 | `{Firma}: Ihr Termin am {Tag} {Datum}, {Zeit}–{Ende}. Bei Fragen: {Tel}.` |
| Review | ~110 | `{Firma}: Vielen Dank für Ihr Vertrauen. Über eine kurze Bewertung freuen wir uns: {URL}` |
| 24h Reminder | ~100 | `{Firma}: Erinnerung — Ihr Termin morgen {Tag} {Datum}, {Zeit}–{Ende}. Bei Fragen: {Tel}.` |

---

## Next Steps

**Phase 4 DONE.** Leitzentrale + Fallübersicht auf einer Seite. 6 Systemfluss-Karten, Click-to-Filter, Suche, Pagination, Notfall-Markierung.

---

## Umsetzungs-Plan: Verbleibende Phasen

### Phase 3: Rollen & Einstellungen

| # | Task | Detail | Status |
|---|------|--------|--------|
| 3.1 | **Rollen-Beschreibung** | Admin + Techniker Beschreibungen verifiziert. Stimmen mit Code überein. | **DONE** (bestätigt 18.03.) |
| 3.2 | **Kalender-Konzept** | ICS-Einladungen + Appointments-Tabelle existieren. Google Calendar FreeBusy = Post-MVP (API-Integration). | GEPARKT |
| 3.3 | **Einstellungen-UX** | Neue Section "Termine": Kalender-E-Mail + Standard-Termindauer. 6 Benachrichtigungs-Toggles. Mobile-responsive. | **DONE** (PR #266) |
| 3.4 | **Techniker-Micro-Surface** | `/einsatz/[caseRef]?t=[hmac]` — Adresse + Maps-Navi, Problem, Kunde + Anruf-Link, "Bin vor Ort" + "Erledigt" Buttons. HMAC-gesichert, kein Login. Mobile-first. | **DONE** (PR #267) |

### Phase 4: Leitzentrale (merged) — KOMPLETT (18.03.)

| # | Task | Detail | Status |
|---|------|--------|--------|
| 4.1 | **Systemfluss-Karten** | 6 Karten: Eingang → Bei uns → Wartet → Heute → Erledigt → Bewertungen ★. Responsive Grid (2 cols mobile, 6 cols desktop). | **DONE** |
| 4.2 | **Click-to-Filter** | Klick auf Karte filtert Fallliste darunter. Nochmal klicken = deselect (alle zeigen). | **DONE** |
| 4.3 | **Notfälle integriert** | Rote border-l-4 + bg-red-50/30 auf Zeile, Notfälle zuoberst sortiert. | **DONE** |
| 4.4 | **Navigation reduzieren** | Nur 2 Nav-Punkte: Leitzentrale + Einstellungen. Fallübersicht eliminiert. | **DONE** |
| 4.5 | **Quiet High-End Ästhetik** | Ruhig, klar, hierarchisch. Suche + Tabelle + Pagination. Mobile-first (weniger Spalten). | **DONE** |

---

## Betriebsgrössen-Kompatibilität

| Feature | 2 MA | 5 MA | 10 MA | 30 MA |
|---------|------|------|-------|-------|
| Falldetail | Meister bearbeitet selbst | Disponent sichtet + weist zu | Disponent plant Woche | Büro-Team koordiniert |
| Zuständig | Meist "ich selbst" | 1 Techniker pro Fall | 1–2 pro Fall | Team-basiert |
| Termin-SMS | An sich selbst + Kunde | An Techniker + Kunde | An Techniker + Kunde | An Techniker + Kunde |
| Kalender-Check | Nicht nötig (nur 1 Person) | Hilfreich | Notwendig | Zwingend |
| Einsatzplan | Nicht nötig | Nice-to-have | Wichtig | Zwingend |
| Bewertungen | Meister fragt persönlich | Systematisch per System | Systematisch per System | Systematisch per System |

---

## SMS-Constraint (eCall)

| Regel | Detail |
|-------|--------|
| **Max 160 Zeichen** | Ab 161 = 2 SMS = doppelter Preis |
| **Sender** | Alphanumerisch (max 11 Zeichen) |
| **Kosten** | CHF 0.096–0.136 pro SMS |
| **API** | REST + HTTPS via `sendSmsEcall.ts` |
| **Vertrag** | Business Account Typ A, CHF 40/Monat Basis + Punkte |

---

## Nicht jetzt (bewusst geparkt)

| Idee | Warum geparkt |
|------|---------------|
| Tages-Briefing SMS (07:00) | Gute Idee, erst wenn Basis steht |
| Einsatz-SMS an Techniker | Abhängig von Micro-Surface (Phase 3.4) |
| Einsatzplan als 3. Nav-Punkt | Erst ab Kunde 5+ relevant |
| Offline-Cache für Falldaten | PWA-Shell steht, Daten-Cache = Phase 5 |
| Wochenübersicht (30 MA) | Erst nach Einsatzplan-Grundlage |

---

## Referenz-Dokumente

| Dokument | Rolle |
|----------|-------|
| `leitsystem_leitzentrale_super_high_end_plan.md` | Nordstern (Leitzentrale-Architektur, Modul-2-Branding, Ästhetik) |
| `leitstand.md` | Grundvertrag (Rollen, 5 Bereiche, Anti-Drift, Termin-Logik) |
| `leitstand_renovation.md` | Implementierungs-Brücke (7 E-Decisions, Puls-First, 3+2 Nav) |
| `identity_contract.md` | Branding-Regeln (R1–R7, FlowSight unsichtbar) |
| `brand_system.md` | Farben, Typografie, Logo (Signal Dot) |
| `case_contract.md` | Datenmodell (Pflichtfelder, Lifecycle) |
| `docs/gtm/gold_contact.md` | GTM Nordstern (5-Stufen-Kaufpsychologie, 7 WOW-Momente) |
| `docs/gtm/operating_model.md` | Trial-Lifecycle (14 Tage, 5 Phasen) |
