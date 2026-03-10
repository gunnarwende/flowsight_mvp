# Quality Gates — GTM Prospect Delivery

**Erstellt:** 2026-03-11 | **Owner:** CC + Founder
**Referenz:** `docs/gtm/gtm_pipeline_plan_v2.md` (Abschnitt 10)
**Regel:** KEIN Outreach ohne alle Gates PASS für das gewählte Leckerli-Paket.

---

## Gate-Matrix pro Leckerli-Paket

| Gate | B-Full+D | A+B-Full+D | A+B-Full+C+D |
|------|----------|------------|--------------|
| G1: Prospect Card | REQUIRED | REQUIRED | REQUIRED |
| G2: Website | REQUIRED | REQUIRED | REQUIRED |
| G3: Lisa | REQUIRED | REQUIRED | REQUIRED |
| G4: Video | — | REQUIRED | REQUIRED |
| G5: Outreach | REQUIRED | REQUIRED | REQUIRED |

---

## Gate 1: Prospect Card

**Prüfer:** CC (automatisch + manuell)

| # | Check | PASS-Kriterium |
|---|-------|----------------|
| 1.1 | ICP Score | ≥ 6 (60 auf 100er-Skala) |
| 1.2 | Telefon | Mindestens 1 E.164-Nummer |
| 1.3 | Website | URL erreichbar ODER bewusst als "keine" dokumentiert |
| 1.4 | Gewerk | Mindestens 1 aus: Sanitär, Heizung, Lüftung, Spenglerei, Badsanierung |
| 1.5 | Services | Mindestens 1 Service mit `verified: true` |
| 1.6 | Leckerli-Empfehlung | Gesetzt und konsistent mit ICP Score |
| 1.7 | Datenquellen | `data_sources` nicht leer |

**FAIL → STOP.** Prospect nicht weiter bearbeiten oder zurück an Scout.

---

## Gate 2: Website (Leckerli D)

**Prüfer:** CC (Build) + Founder (visuell)

| # | Check | PASS-Kriterium |
|---|-------|----------------|
| 2.1 | Goldene Regel #1 | Keine erfundenen Fakten. Jeder Service, jede Person, jede Zahl aus verifizierter Quelle. |
| 2.2 | Services | Alle Services aus Prospect Card vorhanden, mit Beschreibung + Bullets |
| 2.3 | Bilder | Echte Bilder (gecrawlt oder Stock). Pfade korrekt, kein 404. |
| 2.4 | Brand Color | Korrekte Firmenfarbe (aus Meta-Tag oder Website) |
| 2.5 | Kontakt | Telefon, E-Mail, Adresse korrekt |
| 2.6 | Notdienst | Wenn Emergency=true: Banner + Nummer sichtbar |
| 2.7 | Mobile | Website auf iPhone + Android getestet (Founder) |
| 2.8 | Wizard | `/kunden/<slug>/meldung` → Formular funktioniert, Kategorien passen |
| 2.9 | Links Page | `/kunden/<slug>/links` existiert |
| 2.10 | Build | `next build` ohne Fehler |

**FAIL → Fix vor Outreach.** Häufige Fehler: falsche Bild-Extensions, fehlende Services, Brand Color falsch.

---

## Gate 3: Lisa (Leckerli B)

**Prüfer:** CC (technisch) + Founder (glaubwürdig?)

| # | Check | PASS-Kriterium |
|---|-------|----------------|
| 3.1 | Greeting | Firmenname korrekt, KI-Disclosure vorhanden |
| 3.2 | Gewerk-Triage | Kategorien matchen Services aus Prospect Card |
| 3.3 | Notfall-Erkennung | "Rohrbruch" / "Wasser läuft" → urgency=notfall |
| 3.4 | Closing | Sauberer Abschluss, keine Wiederholungs-Loops |
| 3.5 | Language Gate | INTL Agent erreichbar, Sprachweiterleitung funktioniert |
| 3.6 | Published | `is_published: true` für DE + INTL |
| 3.7 | Agent IDs | In `retell/agent_ids.json` eingetragen |
| 3.8 | Kein Brunner | 0 Treffer bei grep nach "Brunner" in Agent JSONs |

**FAIL → Fix Agent JSON + re-sync.** Häufige Fehler: alte Firmennamen im Template, fehlende INTL-Verlinkung.

---

## Gate 4: Video (Leckerli A)

**Prüfer:** Founder (Aufnahme) + CC (Review)

| # | Check | PASS-Kriterium |
|---|-------|----------------|
| 4.1 | Persönlicher Einstieg | Firmenname + "ich habe etwas für Sie gebaut" |
| 4.2 | Glaubwürdiger Use Case | Realistisches Szenario (z.B. Samstag-Nacht-Rohrbruch) |
| 4.3 | Operativer Beweis | Mindestens 1 Szene: Lisa nimmt Anruf → Fall erscheint |
| 4.4 | CTA | "Testen Sie Ihre eigene Lisa: [Nummer]" |
| 4.5 | Länge | Max 60 Sekunden |

**FAIL → Neu aufnehmen.** Video ist Founder-Task, CC liefert Skript-Template.

---

## Gate 5: Outreach

**Prüfer:** Founder (sendet) + CC (Review)

| # | Check | PASS-Kriterium |
|---|-------|----------------|
| 5.1 | Personalisiert | Firmenname, Region, konkretes Gewerk im Text |
| 5.2 | Kein Template-Gefühl | Klingt wie persönlicher Brief, nicht Massen-Mail |
| 5.3 | CTA klar | "Testen Sie Ihre eigene Lisa: [Nummer]" + Website-URL |
| 5.4 | Testnummer funktioniert | Anruf auf Testnummer → Lisa antwortet korrekt |
| 5.5 | URL funktioniert | Website-URL → Seite lädt, kein 404 |
| 5.6 | Keine PII | Keine Kundendaten anderer Firmen im Outreach |
| 5.7 | Absender | Founder-E-Mail (persönlich, nicht info@) |

**FAIL → Nicht senden.** Häufige Fehler: generische Anrede, toter Link, falsche Testnummer.

---

## Zusammenfassung: Prospect Delivery Checklist

```
Prospect: _________________ | ICP: ___ | Paket: ___________

[ ] Gate 1: Prospect Card    — CC
[ ] Gate 2: Website          — CC + Founder (Mobile)
[ ] Gate 3: Lisa             — CC + Founder (Glaubwürdigkeit)
[ ] Gate 4: Video            — Founder + CC (nur wenn A im Paket)
[ ] Gate 5: Outreach         — Founder + CC

Status: [ ] READY FOR OUTREACH  /  [ ] BLOCKED: ___________
```

---

## Entscheidungslog

| Datum | Entscheidung |
|-------|-------------|
| 2026-03-09 | Quality Gates als eigenständiges Dokument (nicht inline in gtm_tracker) |
| 2026-03-09 | Kein Outreach ohne alle Gates PASS — ausnahmslos |
| 2026-03-09 | Founder prüft Mobile + Glaubwürdigkeit, CC prüft technische Gates |
