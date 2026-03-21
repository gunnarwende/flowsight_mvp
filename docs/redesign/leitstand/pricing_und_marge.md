# FlowSight — Pricing, Marge & Sweetspot

**Version:** 1.0 | **Datum:** 2026-03-21
**Status:** Analyse fertig. Founder-Entscheidung nötig.
**Abhängigkeit:** `ceo_voice_decision.md` (Kostenbasis, korrigiert 21.03.)

---

## 1. Executive Summary

**Die wichtigste Korrektur an unserem aktuellen Denken:**
Das Flat-Pricing von CHF 299 ist für 80% unseres ICP (3-15 MA) **extrem profitabel** — die variablen Kosten pro Fall sind so niedrig (CHF 0.40-0.71), dass selbst ein 15-MA-Betrieb mit 176 Fällen/Monat noch 80% Marge hat. Das Problem ist nicht der Preis, sondern das **Tail-Risiko bei grossen Betrieben (25+ MA)** wo die Marge unter 70% fällt.

Die vorgeschlagene Staffelung nach Mitarbeiterzahl ist **unnötig und sogar schädlich** für unseren ICP-Kern. Stattdessen brauchen wir ein einfaches Modell: **Ein Preis für den Kern-ICP + Custom für Grosse.**

---

## 2. Kosten- und Margenlogik pro Segment

### Annahmen (challenged + begründet)

| Annahme | Wert | Confidence | Begründung |
|---------|------|------------|------------|
| Voice-Kosten pro Call (IST) | CHF 0.46 | **KNOWN** (gemessen: $0.50/3.34min) |
| Voice-Kosten optimiert (GPT-4o-mini) | CHF 0.31 | Assumption (±20%) | LLM-Preisdifferenz |
| SMS-Kosten pro Segment | CHF 0.12 | Assumption (±30%) | eCall-Vertrag unbestätigt |
| Voice/Wizard-Ratio | 40-70% Voice | **Assumption** | Keine echten Daten, abhängig von Betrieb |
| Fälle/Tag nach MA-Grösse | 1.5-18 | **Assumption** | Heuristik: ~0.5-0.6 Fälle/MA/Tag bei Sanitär |
| Post-Call SMS immer bei Voice | Ja | **KNOWN** (Code: automatisch) |
| Termin-SMS bei 50% der Fälle | 50% | Assumption | Manuell ausgelöst, nicht alle Fälle bekommen Termin |
| Review-SMS bei 30% der Voice-Fälle | 30% | Assumption | Manuell, nur erledigte, nur Voice (kein E-Mail) |

**Challenge: "5-15 Fälle/Tag" war überhöht.**
Weinberger (12-15 MA, Goldstandard) hat 75 Cases über ~4 Wochen = ~4 Fälle/Tag. Ein 2-Mann-Betrieb eher 1-2. Die Rechnung hier nutzt konservativere, MA-proportionale Werte.

### Segment-Analyse (Retell optimiert = GPT-4o-mini)

| Segment | Fälle/Mo | Variable Kosten | Bei CHF 299 | Marge | Deckungsbeitrag | Risiko |
|---------|----------|----------------|-------------|-------|-----------------|--------|
| **1-3 MA** | ~33 | CHF 14 | CHF 299 | **95%** | CHF 285 | Kein Risiko. Traumkunde. |
| **4-5 MA** | ~66 | CHF 26 | CHF 299 | **91%** | CHF 273 | Kein Risiko. ICP-Kern. |
| **6-10 MA** | ~110 | CHF 40 | CHF 299 | **87%** | CHF 259 | Kein Risiko. ICP-Kern. |
| **11-20 MA** | ~176 | CHF 60 | CHF 299 | **80%** | CHF 239 | Gesund. Grenzbereich beginnt bei 20 MA. |
| **21-30 MA** | ~264 | CHF 84 | CHF 299 | **72%** | CHF 215 | **Aufpassen.** Marge sinkt, aber noch ok. |
| **30+ MA** | ~396 | CHF 117 | CHF 299 | **61%** | CHF 182 | **Gefährlich bei CHF 299.** Braucht höheren Preis. |

---

## 3. Bewertung des vorgeschlagenen Stufenmodells

### Vorschlag war:
- bis 5 MA: CHF 299
- 6-10 MA: CHF 499
- 11-20 MA: CHF 899
- 21-30 MA: CHF 1'290
- 30+ MA: custom

### Mein Challenge:

**Problem 1: CHF 499 für 6-10 MA ist Overpricing.**
Bei CHF 299 haben wir 87% Marge für dieses Segment. CHF 499 bringt 92% Marge — ein Sprung von 5 Prozentpunkten für CHF 200 mehr. Das Risiko: wir verlieren Kunden die bei CHF 299 sofort zuschlagen würden. Ein 8-MA-Betrieb hat oft den gleichen Inhaber-Entscheider wie ein 4-MA-Betrieb — derselbe Mensch mit demselben Preisempfinden.

**Problem 2: Die Sprünge sind zu aggressiv.**
Von CHF 299 auf CHF 499 (+67%) und dann CHF 899 (+80%) — das fühlt sich nach "Enterprise Tax" an, nicht nach fairem Pricing. Schweizer Handwerker reden miteinander. Wenn der 5-MA-Betrieb nebenan CHF 299 zahlt und ich mit 8 MA CHF 499, bin ich sauer.

**Problem 3: Mitarbeiterzahl allein ist kein guter Anker.**
Ein 15-MA-Betrieb ohne Notdienst hat vielleicht 4 Calls/Tag. Derselbe Betrieb mit 24h-Notdienst hat 10 Calls/Tag — 2.5× mehr Kosten. Die MA-Zahl korreliert, aber Notdienst ist der echte Multiplikator.

**Was passt:**
- CHF 299 für den ICP-Kern (bis ~20 MA) ist richtig positioniert
- CHF 1'290 für 21-30 MA ist angemessen (Marge dann 93%)
- Custom für 30+ ist korrekt

**Was zu grob ist:**
- 6-10 MA für CHF 499 bestraft unsere besten Kunden
- Kein Mechanismus für hohe Voice-Volumina bei kleinen Betrieben (z.B. 5 MA mit Notdienst)

---

## 4. Empfohlenes Pricing-Modell

### Empfehlung: **Modell C — Hybrid aus Betriebsgrösse + inkludiertem Volumen**

| Tier | Betriebsgrösse | Preis/Monat | Inkludierte Fälle | Overage |
|------|---------------|-------------|-------------------|---------|
| **Standard** | bis 20 MA | **CHF 299** | 200 Fälle/Mo | CHF 1.50/Fall |
| **Professional** | 21-30 MA | **CHF 799** | 400 Fälle/Mo | CHF 1.50/Fall |
| **Enterprise** | 30+ MA | **Custom** | Custom | Custom |

### Warum dieses Modell?

**1. Ein Preis für 80% des Marktes.**
Bis 20 MA (unser ICP-Kern) zahlt jeder CHF 299. Kein Handwerker muss erklären, warum er mehr zahlt als sein Nachbar. Das ist der Gold-Contact-Moment: "Ein System, ein Preis, alles drin."

**2. Inkludierte Fälle als Sicherheitsnetz.**
200 Fälle/Monat reicht für 95% aller Betriebe bis 20 MA (die haben typisch 33-176 Fälle). Nur Ausreisser (extremes Voice-Volumen, 24h-Notdienst) gehen darüber. Das Overage von CHF 1.50/Fall ist bewusst hoch genug um profitabel zu sein (unsere Kosten: ~CHF 0.70/Fall), aber niedrig genug um nicht abzuschrecken.

**3. Professional für grosse Betriebe.**
CHF 799 für 21-30 MA mit 400 Fällen = Marge 89%. Der Sprung von CHF 299 auf CHF 799 ist gerechtfertigt weil diese Betriebe real mehr Fälle haben UND mehr Features nutzen (Einsatzplanung, Multi-Techniker, Kalender-Integration).

**4. Kein CHF 499-Tier.**
Das vermeidet die "Bestrafung der Mitte". Ein 10-MA-Betrieb zahlt CHF 299 wie ein 5-MA-Betrieb. Erst ab 21 MA springt der Preis — und da ist der Wert auch klar höher.

### Warum NICHT rein Mitarbeiterzahl (Modell A)?
Weil ein 8-MA-Betrieb mit 2 Calls/Tag und ein 8-MA-Betrieb mit 8 Calls/Tag dieselbe Mitarbeiterzahl haben aber 4× unterschiedliche Kosten verursachen. Mitarbeiterzahl allein ist blind für das Volumen.

### Warum NICHT rein Volumen (Modell B)?
Weil "Wie viele Fälle habt ihr?" im Sales-Gespräch eine Frage ist, die kein Handwerker beantworten kann. "Keine Ahnung, vielleicht 5 am Tag?" ist keine Pricing-Grundlage. Mitarbeiterzahl + inkludiertes Volumen ist die pragmatische Kombination.

---

## 5. Sweetspot

### Am attraktivsten: 4-10 MA
- **Warum:** CHF 299 bei ~CHF 26-40 variablen Kosten = 87-91% Marge
- **Typisch:** Inhabergeführt, 1-2 Techniker, kein grosses Büro
- **Sales:** Inhaber entscheidet sofort, kein Beschaffungsprozess
- **Churn-Risiko:** Niedrig (System wird schnell unverzichtbar)

### Am gefährlichsten: 30+ MA
- **Warum:** CHF 299 wäre 61% Marge — knapp. CHF 117 variable Kosten/Monat.
- **Typisch:** Büro-Team, Disponent, Einsatzplanung, viele Techniker
- **Sales:** Längerer Entscheidungsprozess, höhere Erwartungen
- **Risiko:** Hohe Voice-Volumina, mehr Support, Custom-Wünsche
- **Empfehlung:** Nur Custom, mit individuellem Volumen-Commitment.

### Bewusst vermeiden (für jetzt): 1-2 MA
- **Warum:** Niedrigstes Volumen (CHF 14 Kosten/Mo), aber auch niedrigstes Engagement
- **Risiko:** Hohe Churn-Rate (Meister hat keine Zeit für Software)
- **Empfehlung:** Nicht aktiv ansprechen, aber nicht ablehnen. Kommt der Betrieb von selbst = ok.

---

## 6. Sales-Operationalisierung

### Die 5 Fragen im Sales-Call / Intake

| # | Frage | Warum | Pricing-Impact |
|---|-------|-------|----------------|
| 1 | **Wie viele Mitarbeiter hat Ihr Betrieb?** | Tier-Zuordnung (≤20 = Standard, 21-30 = Professional) | Bestimmt Basis-Tier |
| 2 | **Haben Sie einen 24h-Notdienst?** | Multipliziert Voice-Volumen um 2-3× | Flag für Volumen-Warnung |
| 3 | **Wie viele Kundenanrufe bekommen Sie ungefähr pro Tag?** | Volumen-Abschätzung | Prüft ob 200 Fälle/Mo reichen |
| 4 | **Haben Sie eine eigene Website mit Kontaktformular?** | Wizard/Voice-Ratio (mehr Wizard = billiger für uns) | Kosten-Prognose |
| 5 | **Wer bearbeitet heute die Anfragen?** | Entscheider-Identifikation + Rollenbedarf | Feature-Scope |

### Zuordnungslogik

```
WENN MA ≤ 20 → Standard (CHF 299)
WENN MA 21-30 → Professional (CHF 799)
WENN MA > 30 → Custom (Gespräch)

WENN Notdienst = ja UND MA > 10:
  → Hinweis: "Bei Notdienst-Betrieben kann das Anrufvolumen höher sein.
     Wir schauen nach dem ersten Monat gemeinsam, ob das Volumen passt."
```

---

## 7. Konkrete Empfehlung

### Jetzt entscheiden:

**Pricing-Modell:** 2 Tiers + Custom.
- **Standard CHF 299** (bis 20 MA, 200 Fälle inkl.)
- **Professional CHF 799** (21-30 MA, 400 Fälle inkl.)
- **Enterprise Custom** (30+ MA)

**Sofort umsetzen:**
1. LLM auf GPT-4o-mini umstellen (spart 34% Voice-Kosten, ~CHF 0.15/Call)
2. Website-Pricing-Page mit 2 Tiers aktualisieren
3. Sales-Fragebogen mit den 5 Fragen in den Pipeline-Prozess einbauen

### In 2-4 Wochen validieren:

1. **eCall exakten SMS-Preis bestätigen** (Portal/Vertrag) → kalibriert die Kostenrechnung
2. **Weinberger Volumen nach 4 Wochen auswerten** → erste echte Fallzahlen für einen 12-15 MA Betrieb
3. **Retell Dashboard Usage prüfen** → exakte Kosten pro Call (nicht nur Testanruf)
4. **Overage-Logik evaluieren** → Brauchen wir sie sofort oder erst ab Betrieb #10?

### Was NICHT tun:
- Kein 4-stufiges Pricing (zu komplex, bestraft die Mitte)
- Kein reines Volumen-Pricing (Handwerker können ihr Volumen nicht einschätzen)
- Keine Preiserhöhung für den ICP-Kern (3-15 MA) — CHF 299 ist perfekt positioniert

---

## Offene Fragen (Founder)

| Frage | Impact | Empfehlung |
|-------|--------|------------|
| Overage ab wann einführen? | Betrifft <5% der Standard-Kunden | Ab Betrieb #5 implementieren, vorher irrelevant |
| Notdienst-Zuschlag? | Könnte 30-50% mehr Fälle bedeuten | Nein — erst messen, dann reagieren. Overage fängt das ab. |
| Professional-Tier ab wann aktiv? | Erst relevant wenn 21+ MA Betriebe in Pipeline | Pricing-Page vorbereiten, aber erst aktivieren bei Bedarf |
| Jährliche Zahlung mit Rabatt? | Senkt Churn, verbessert Cash Flow | Ja — CHF 249/Mo bei Jahreszahlung (CHF 2'988/Jahr vs. CHF 3'588) |
