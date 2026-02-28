# FlowSight Sales Pipeline

**Owner:** Founder
**Start:** 2026-03-01
**Rhythmus:** Täglich 4-5h Fokuszeit, 5 neue Prospects pro Woche
**Regel:** Jeder Prospect wird maximal 3× kontaktiert, dann ruhen lassen.

---

## Aktive Pipeline

| # | Firma | Ort | Kontakt | Website alt | Google ★ | Demo-URL | E-Mail gesendet | Anruf 1 | Anruf 2 | Status | Notizen |
|---|-------|-----|---------|-------------|----------|----------|-----------------|---------|---------|--------|---------|
| 1 | | | | | | | | | | OFFEN | |
| 2 | | | | | | | | | | OFFEN | |
| 3 | | | | | | | | | | OFFEN | |
| 4 | | | | | | | | | | OFFEN | |
| 5 | | | | | | | | | | OFFEN | |

**Status-Werte:** OFFEN → KONTAKTIERT → DEMO → VERHANDLUNG → GEWONNEN / VERLOREN / RUHT

---

## Wöchentliche Metriken

| KW | Prospects neu | E-Mails | Anrufe | Demos | Abschlüsse |
|----|---------------|---------|--------|-------|------------|
| KW 10 (03.03) | | | | | |
| KW 11 | | | | | |
| KW 12 | | | | | |
| KW 13 | | | | | |

---

## Gewonnene Kunden

| # | Firma | Ort | Module | MRR (CHF) | Go-Live |
|---|-------|-----|--------|-----------|---------|
| 1 | Dörfler AG | Oberrieden | Voice, Wizard, Ops, Reviews | — | PENDING |

---

## Ablauf pro Prospect (Checkliste)

### Phase 1: Research (5 Min)
- [ ] Google Maps: Firma finden, Adresse, Telefon, Rating, Reviews notieren
- [ ] Website prüfen: gut/schlecht/keine? Screenshot.
- [ ] Qualifiziert? (Sanitär/Heizung, 3-30 MA, Raum Zürichsee, schlechte/keine Website)

### Phase 2: Demo-Website bauen (20 Min)
- [ ] Customer Config erstellen: `src/web/src/lib/customers/<slug>.ts`
- [ ] Registry eintragen: `src/web/src/lib/customers/registry.ts`
- [ ] Build + Push → Vercel deployed automatisch
- [ ] URL testen: `flowsight.ch/kunden/<slug>`

### Phase 3: Outreach (5 Min)
- [ ] E-Mail senden (Vorlage unten)
- [ ] Datum in Pipeline eintragen

### Phase 4: Follow-up (nach 2 Tagen)
- [ ] Anrufen: "Haben Sie die Website gesehen?"
- [ ] Status in Pipeline aktualisieren

### Phase 5: Demo (wenn Interesse)
- [ ] 15-Min Demo zeigen (Runbook: docs/runbooks/demo_script.md)
- [ ] Module besprechen (Voice, Wizard, Ops, Reviews)
- [ ] Preis nennen, Testphase anbieten

---

## E-Mail-Vorlage

```
Betreff: Ihre Website, [Herr/Frau Nachname] — kurze Frage

Guten Tag [Herr/Frau Nachname],

ich bin Gunnar Wende von FlowSight in Thalwil.

Ich habe mir Ihre Website und Ihre Google-Bewertungen
angeschaut — Ihre Kunden sind offensichtlich zufrieden
([Rating] Sterne, [Anzahl] Bewertungen).

Aus Interesse habe ich einen Entwurf erstellt, wie Ihre
Online-Präsenz aussehen könnte:

→ flowsight.ch/kunden/[slug]

Das ist komplett unverbindlich. Mich würde einfach
interessieren, was Sie davon halten.

Falls Sie 10 Minuten Zeit hätten: Ich zeige Ihnen gerne,
was dahinter steckt — inkl. digitalem Telefonassistenten,
der Ihre Anrufe automatisch entgegennimmt und als Fall
erfasst.

Freundliche Grüsse
Gunnar Wende
FlowSight GmbH
044 552 09 19
flowsight.ch
```

---

## Anruf-Skript (Follow-up, 2 Tage nach E-Mail)

```
"Grüezi [Herr/Frau Nachname], Gunnar Wende von FlowSight
aus Thalwil. Ich hatte Ihnen vor zwei Tagen eine E-Mail
geschickt mit einem Website-Entwurf für [Firmenname].
Haben Sie kurz reingeschaut?

[Wenn ja:] Was ist Ihr erster Eindruck?
[Wenn nein:] Kein Problem — darf ich Ihnen den Link
nochmal per SMS schicken? Dauert 30 Sekunden zum Anschauen.
[Wenn kein Interesse:] Verstehe ich, danke für Ihre Zeit.
Falls sich was ändert — meine Nummer haben Sie."
```

---

## Notizen / Learnings

(Hier nach jeder Woche festhalten: Was hat funktioniert? Was nicht? Was anpassen?)

