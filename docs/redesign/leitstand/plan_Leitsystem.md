# Plan Leitsystem — High-End Umsetzung

**Erstellt:** 2026-03-17
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
| **E4** | Termin-Benachrichtigungen: EIN Button "Termin versenden" (an Kunde + Mitarbeiter). Erst sichtbar nach "Übernehmen". | Kein versehentliches Senden. Keine getrennten Buttons für Kunde/Mitarbeiter. |
| **E5** | SMS immer ≤ 160 Zeichen (eCall: ab 161 = doppelter Preis) | Kosten + Zustellbarkeit. Jedes Template wird auf 160 Zeichen geprüft. |
| **E6** | Kalender-Sync nötig (Read-Only: Outlook/Google) beim Zuweisen | Keine Termin-Überschneidungen. Skalierbar für 2–30 MA. |
| **E7** | "Zuständig" = Multi-Select-Dropdown aus Staff-Tabelle (nicht Freitext) | Grössere Projekte haben mehrere Mitarbeiter. |
| **E8** | Bewertungs-Button erst sichtbar wenn Status = Erledigt | Logischer Fluss: Erst Arbeit, dann Lohn. |
| **E9** | Beschreibung/Verlauf schmaler (ca. 1/3), Kontakt/Notizen/Anhänge breiter (ca. 2/3) | Übersicht zuerst, Details bei Bedarf. Klare Abgrenzung zum Scan-Kopf oben. |
| **E10** | Verlauf-Struktur bleibt: Schritt 1 → nächster Schritt → komprimiert → letzter Schritt → Zieleinlauf (Bewertung) | Bewährt, logisch, platzsparend. |

---

## Umsetzungs-Plan: Bottom-Up in 4 Phasen

### Phase 1: Der Fall (Basis)

> Ohne sauberes Falldetail macht die Leitzentrale keinen Sinn.

| # | Task | Detail | Priorität |
|---|------|--------|-----------|
| 1.1 | **Status vereinfachen** | "Abgeschlossen" entfernen. Status-Kette: Neu → Geplant → In Arbeit → Warten → Erledigt. Dropdown + Badges + Farben anpassen. | **DONE** (PR #246) |
| 1.2 | **Termin-Validierung** | Ende muss nach Start liegen. Client-side + Server-side Validierung. | hoch |
| 1.3 | **"Zuständig" = Multi-Select aus Staff** | Freitext-Feld ersetzen durch Dropdown der aktiven Mitarbeiter (aus staff-Tabelle). Mehrfachauswahl möglich (Chips-UI). Bei Zuweisung: optionale E-Mail an zugewiesene(n) Mitarbeiter (gesteuert via Einstellungen). | hoch |
| 1.4 | **Termin-Benachrichtigung neu** | Buttons "Meldenden benachrichtigen" + "Termin an Mitarbeiter senden" ELIMINIEREN. Stattdessen: Nach Termin-Eingabe → "Übernehmen" klicken → dann erscheint EIN Button "Termin versenden" → sendet an BEIDE (Kunde + zugewiesene Mitarbeiter). Bestätigung im Verlauf sichtbar, nicht als separater Status. | hoch |
| 1.5 | **Layout-Rebalance Falldetail** | Links (Beschreibung + Verlauf): ca. 1/3 Breite. Rechts (Übersicht/Kontakt/Notizen/Anhänge): ca. 2/3 Breite. Beschreibung + Verlauf visuell aufwerten auf Niveau der rechten Sektionen (gleiche Card-Qualität, gleiche Typografie-Hierarchie). | mittel |
| 1.6 | **Bewertungs-Flow** | "Bewertung anfragen"-Button nur sichtbar wenn Status = Erledigt. Verlauf zeigt den Fluss: Erstellt → ... → Erledigt → Bewertung angefragt → ★ Bewertung erhalten. Wenn Kunde nicht reagiert = egal, Fall bleibt "Erledigt". Kein Nachhaken-Zwang. | hoch |
| 1.7 | **Wording-Sweep Falldetail** | Durchgehend Handwerkersprache: "Meldende/n" → "Kunde", "Dringlichkeit" → "Priorität", "Einsatz abgeschlossen" → "Arbeit erledigt", "Zuweisung" → "Vergabe", "Quelle" → "Herkunft". | **DONE** (PR #246, 17 Dateien, 30+ Edits) |
| 1.8 | **Mobile Overflow fixen** | M8-Bug: Zahlen/Text gehen rechts aus dem Viewport raus. Responsive Checks auf allen Sektionen (Einstellungen, Falldetail, Termine). Truncation + Wrapping sicherstellen. | hoch |

**Definition of Done Phase 1:** Falldetail ist auf Desktop UND Mobile High-End. Jeder Handwerker versteht sofort: Was ist das Problem? Wo? Wer kümmert sich? Wann? Was ist der nächste Schritt?

---

### Phase 2: Kommunikation & SMS

> Jede Nachricht hat einen Zweck. Keine Informationsflut. ≤ 160 Zeichen.

| # | Task | Detail | Priorität |
|---|------|--------|-----------|
| 2.1 | **SMS-Audit** | Alle bestehenden SMS-Templates inventarisieren. Jedes auf ≤ 160 Zeichen prüfen + kürzen. Zeichenzähler als Dev-Tool. | hoch |
| 2.2 | **Benachrichtigungs-Matrix** | Tabelle: Trigger × Kanal × Empfänger × Inhalt × Zeichenlimit. Für jede Betriebsgrösse (2/5/10/30 MA) durchdenken. Ziel: Kein Spam, kein Informationsverlust. | hoch |
| 2.3 | **Anti-Spam Massnahmen** | E-Mail: SPF/DKIM/DMARC via Resend (bereits aktiv). Sender-Domain = `send.flowsight.ch` (verifiziert). SMS: eCall alphanumerischer Sender (Firmenname, nicht Nummer). Regelmässig Zustellbarkeit prüfen. | mittel |
| 2.4 | **eCall-Integration härten** | API-Anbindung verifizieren: Alphanumerischer Sender, Zeichenlimit-Enforcement (reject > 160), Zustellberichte auswerten. Kosten-Monitoring (1.2–1.7 Punkte pro SMS). | mittel |
| 2.5 | **E-Mail-Templates audit** | Alle E-Mail-Templates auf Identity Contract prüfen: Sender = "{Firma} via FlowSight", kein FlowSight im Body, Handwerker-Wording, Responsive HTML. | mittel |

**Definition of Done Phase 2:** Jede ausgehende Nachricht (SMS + E-Mail) hat einen klar definierten Trigger, Empfänger, Inhalt. Alles ≤ 160 Zeichen (SMS). Kein Spam. Matrix dokumentiert.

---

### Phase 3: Rollen & Einstellungen

> Admin und Techniker haben klar getrennte Welten.

| # | Task | Detail | Priorität |
|---|------|--------|-----------|
| 3.1 | **Rollen-Beschreibung verifizieren** | Info-Button-Text in Einstellungen auf Korrektheit prüfen. Stimmt die Beschreibung mit der tatsächlichen Implementierung überein? Abgleich Code ↔ Text. | hoch |
| 3.2 | **Kalender-Konzept** | Read-Only Abfrage: Beim Termin-Setzen zeigen, ob Mitarbeiter frei/belegt ist. MVP: Google Calendar API (FreeBusy). Später: Outlook/Exchange. Skalierbar für 2–30 MA. Kein Schreib-Zugriff nötig (nur Lesen). | hoch |
| 3.3 | **Einstellungen-UX aufwerten** | Toggles mit kontextbezogener Empfehlung ("Empfohlen für Betriebe ab 5 MA"). Mobile Overflow fixen (M8-Bug). Sections klar trennen mit visueller Hierarchie. | mittel |
| 3.4 | **Techniker-Micro-Surface** | SMS-Link post-Zuweisung: `/einsatz/[token]` — Adresse, Problem, Navigation (1-Tap Maps), Status-Button ("Erledigt"), Foto-Upload. Kein Login, kein Account. HMAC-gesichert. | hoch (Post-Phase-1) |

**Definition of Done Phase 3:** Jede Rolle hat genau die Rechte und Informationen, die sie braucht. Kalender-Konflikte werden beim Zuweisen sichtbar. Techniker brauchen keinen Login.

---

### Phase 4: Leitzentrale (merged)

> Eine Seite zeigt den ganzen Systemfluss — von Eingang bis Bewertung.

| # | Task | Detail | Priorität |
|---|------|--------|-----------|
| 4.1 | **Systemfluss-Karten** | ~6 Karten in logischer Reihenfolge: Eingang (Neu) → Bei uns (In Arbeit/Geplant) → Wartet (auf Rückmeldung) → Heute (Termine) → Erledigt → Bewertungen ★. Jede Karte = KPI-Zahl + Kurzinfo. | hoch |
| 4.2 | **Click-to-Filter** | Klick auf Karte filtert die Fallliste darunter. Aktive Karte visuell hervorgehoben. "Alle" als Reset. | hoch |
| 4.3 | **Notfälle integriert** | Rote Markierung in der Gesamtliste (Priorität = Notfall → rote Zeile/Badge). Kein separater Banner. Notfälle immer zuoberst sortiert. | hoch |
| 4.4 | **Navigation reduzieren** | Nur 2 Punkte: Leitzentrale (Systemfluss + Fallliste) + Einstellungen. Sidebar vereinfachen. | mittel |
| 4.5 | **Quiet High-End Ästhetik** | Nicht "Dashboard". Nicht "viele bunte Karten". Ruhig, klar, hierarchisch. Handlungsorientiert, nicht analytisch. Nordstern: `leitsystem_leitzentrale_super_high_end_plan.md` §11. | hoch |

**Definition of Done Phase 4:** Ein Handwerker öffnet morgens die App und sieht in 3 Sekunden: Was ist neu? Was muss ich heute tun? Wo stehe ich insgesamt? Der Systemfluss von Eingang bis Bewertung ist auf einen Blick sichtbar.

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

**Design-Regel:** Alles muss für 2 MA funktionieren (einfachster Fall). Features für 10+ MA dürfen die UX für 2 MA nicht verkomplizieren (progressive disclosure).

---

## SMS-Constraint (eCall)

| Regel | Detail |
|-------|--------|
| **Max 160 Zeichen** | Ab 161 = 2 SMS = doppelter Preis (2.4–3.4 Punkte statt 1.2–1.7) |
| **Sender** | Alphanumerisch (max 11 Zeichen): z.B. "Weinberger", "BrunnerHT" |
| **Fallback** | Wenn Firmenname > 11 Zeichen → eCall-Servicenummer als Sender |
| **Kosten** | CHF 0.096–0.136 pro SMS (Swisscom/Sunrise vs. Salt) |
| **API** | REST + HTTPS, bereits integriert via `sendSmsEcall.ts` |

---

## Nicht jetzt (bewusst geparkt)

| Idee | Warum geparkt |
|------|---------------|
| Tages-Briefing SMS (07:00) | Gute Idee, aber erst wenn Basis steht |
| Einsatz-SMS an Techniker | Abhängig von Micro-Surface (Phase 3.4) |
| Einsatzplan als 3. Nav-Punkt | Erst ab Kunde 5+ relevant |
| Offline-Cache für Falldaten | PWA-Shell steht, Daten-Cache = Phase 5 |
| Wochenübersicht (30 MA) | Erst nach Einsatzplan-Grundlage |

---

## Reihenfolge der Umsetzung

```
Phase 1: Der Fall ← JETZT
  └── 1.1 Status vereinfachen
  └── 1.2 Termin-Validierung
  └── 1.3 Zuständig = Multi-Select Staff
  └── 1.4 Termin-Benachrichtigung (1 Button)
  └── 1.5 Layout-Rebalance (1/3 : 2/3)
  └── 1.6 Bewertungs-Flow
  └── 1.7 Wording-Sweep
  └── 1.8 Mobile Overflow fixen

Phase 2: Kommunikation ← nach Phase 1
  └── 2.1–2.5

Phase 3: Rollen & Einstellungen ← parallel möglich
  └── 3.1–3.4

Phase 4: Leitzentrale ← wenn Basis steht
  └── 4.1–4.5
```

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
