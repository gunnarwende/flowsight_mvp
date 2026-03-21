# FlowSight — Pricing, Marge & Sweetspot

**Version:** 2.0 | **Datum:** 2026-03-21
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

---

## Kostenbasis für Pricing und Margenmodell

### 1. Fixkosten pro Betrieb (monatlich, skaliert mit Anzahl Tenants)

| Cost Item | Warum fix pro Betrieb | Betrag | Confidence |
|-----------|----------------------|--------|------------|
| **Twilio Telefonnummer** | Jeder Tenant bekommt eine dedizierte CH-Nummer für Voice-Routing (SIP Trunk → Retell) | ~$1.00/Mo | **Known** (Twilio CH number pricing) |
| **Retell Agent-Paar (DE + INTL)** | 2 Agents pro Tenant, aber keine Storage-Gebühr | $0/Mo | **Known** (Retell = pay-per-minute only) |
| **Supabase Tenant-Daten** | tenant-Row, staff-Rows, tenant_numbers | $0 (Free Tier) | **Known** (vernachlässigbar) |
| **Kundenwebsite** | SSG unter `/kunden/[slug]`, kein separates Hosting | $0 | **Known** (Same Vercel deploy) |

**Sicher fix pro Betrieb: ~CHF 1/Mo** (nur Twilio-Nummer).
Alles andere ist entweder plattformweit oder variabel.

**Challenge:** Peoplefone ist NICHT "pro Betrieb". Die Brand-Nummer gehört dem Kunden (z.B. Weinberger besitzt seine eigene Geschäftsnummer). FlowSight hat nur EINE Peoplefone-Nummer (044 552 09 19) für den eigenen Sales-Agent. Peoplefone-Kosten der Kunden sind DEREN Kosten, nicht unsere.

### 2. Plattformweite Fixkosten (monatlich, unabhängig von Tenant-Anzahl)

| Cost Item | Warum plattformweit | Betrag/Mo | Umlage bei 10 Tenants | Umlage bei 50 Tenants | Confidence |
|-----------|--------------------|-----------|-----------------------|-----------------------|------------|
| **eCall Grundgebühr** | Ein Account für alle Tenants, alle SMS laufen darüber | **CHF 40?** | CHF 4/Tenant | CHF 0.80/Tenant | **UNKNOWN — Founder muss verifizieren** |
| **Twilio SIP Trunk** | Ein Trunk, alle Nummern routen darüber | ~$3-5 | $0.40/Tenant | $0.08/Tenant | Assumption (±50%) |
| **Peoplefone FlowSight-Nr** | Nur unsere eigene Sales-Nummer, nicht kundenbezogen | ~CHF 8 | CHF 0.80/Tenant | CHF 0.16/Tenant | Assumption |
| **Vercel** | Aktuell Hobby (Free). Upgrade bei ≥80% Usage | $0 (jetzt) → $20 (Pro) | $0–2/Tenant | $0–0.40/Tenant | **Known** (Upgrade-Trigger dokumentiert) |
| **Supabase** | Aktuell Free. Upgrade bei ≥80% Storage/API | $0 (jetzt) → $25 (Pro) | $0–2.50/Tenant | $0–0.50/Tenant | **Known** |
| **Resend** | Free Tier (3'000 E-Mails/Mo). Upgrade bei ~100 Tenants | $0 (jetzt) → ~$20 | $0 | $0–0.40/Tenant | **Known** |
| **Sentry** | Free Tier (5k Events/Mo) | $0 | $0 | $0 | **Known** |
| **GitHub Actions** | CI + Cron (Morning Report, Lifecycle Tick) | $0 | $0 | $0 | **Known** |
| **AI Keys (CEO-App)** | Anthropic + OpenAI für Pulse-Comment, Tenant-Insight | ~$10 | $1/Tenant | $0.20/Tenant | Assumption |

**Plattform-Fixkosten HEUTE: ~CHF 55-65/Mo** (inkl. eCall-Annahme)
**Plattform-Fixkosten bei 50 Tenants: ~CHF 120-150/Mo** (nach Upgrades)

**Challenge: Die eCall-Grundgebühr ist die grösste Unbekannte.** "CHF 40/Mo" steht in der Matrix_kommunikation.md als "Business Account Typ A, CHF 40/Mo + Punkte". Aber es ist unklar ob das eine Grundgebühr oder ein Guthaben ist. Dieser Punkt ist **pricing-kritisch** weil er die Fixkosten-Basis um ±CHF 40 verschiebt.

### 3. Variable Kosten pro Fall / Nutzung

| Cost Item | Trigger | Preislogik | Status | Confidence |
|-----------|---------|-----------|--------|------------|
| **Retell Voice (IST)** | Jeder Voice-Call | $0.15/min (gemessen: $0.50/3.34min) | LIVE | **KNOWN** (gemessen) |
| **Retell Voice (optimiert)** | Jeder Voice-Call nach LLM-Downgrade | ~$0.10/min (geschätzt: $0.33/3.34min) | GEPLANT | Assumption (±20%) |
| **eCall Post-Call SMS** | Automatisch nach jedem Voice-Case | CHF 0.12/SMS (1 Segment, 137-148 Chars) | LIVE | Assumption (±30%, eCall-Preis nicht vertraglich belegt) |
| **eCall Termin-SMS** | Manuell, Button "Termin versenden", NUR wenn kein E-Mail | CHF 0.12/SMS | LIVE | Assumption |
| **eCall Reminder-SMS** | Automatisch 24h vor Termin, wenn Modul aktiv | CHF 0.12/SMS | LIVE | Assumption |
| **eCall Review-SMS** | Manuell, "Bewertung anfragen", NUR Voice-Fälle (kein E-Mail) | CHF 0.12/SMS | LIVE | Assumption |
| **Twilio SIP-Routing** | Pro Minute eingehender Call (Peoplefone → Twilio → Retell) | ~$0.002/min | LIVE | Assumption (vernachlässigbar) |
| **Resend E-Mails** | Ops-Notification, Melder-Bestätigung, Termin-ICS, Review | $0 (Free Tier) | LIVE | **KNOWN** |

**Wichtigste variable Kosten pro Fall:**

| Fall-Typ | Voice | SMS (sicher) | SMS (conditional) | E-Mail | Total (sicher) | Total (typisch) |
|----------|-------|-------------|-------------------|--------|---------------|-----------------|
| **Voice-Fall (IST)** | CHF 0.46 | CHF 0.12 | CHF 0.12-0.36 | CHF 0 | **CHF 0.58** | **CHF 0.82** |
| **Voice-Fall (optimiert)** | CHF 0.31 | CHF 0.12 | CHF 0.12-0.36 | CHF 0 | **CHF 0.43** | **CHF 0.67** |
| **Wizard-Fall** | CHF 0 | CHF 0.12 | CHF 0 | CHF 0 | **CHF 0.12** | **CHF 0.12** |

### 4. Optional / Conditional Costs

| Feature | Bedingung | Kosten | Wer trägt die Kosten |
|---------|-----------|--------|---------------------|
| **Peoplefone Brand-Nummer des Kunden** | Kunde will eigene Geschäftsnummer behalten | CHF 50-100/Jahr + Minutentarif | **Kunde** (nicht FlowSight) |
| **Separate Domain** | Kunde will eigene Domain statt `/kunden/[slug]` | CHF 15-30/Jahr | Optional, heute nicht angeboten |
| **24h-Notdienst Voice-Volumen** | Betrieb hat Pikett → 2-3× mehr Voice-Calls | Skaliert variabel (kein Zuschlag, aber höhere Kosten) | FlowSight (über Overage ab 200 Fälle) |
| **AI CEO-App Features** | Founder aktiviert Anthropic/OpenAI | ~$10/Mo | FlowSight (plattformweit) |
| **Outlook Kalender-Integration** | Tenant verbindet Outlook | $0 (Microsoft Free Tier) | $0 |
| **Zusätzliche Twilio-Nummer** | Tenant braucht 2. Nummer (z.B. Notdienst-Linie) | +$1/Mo | FlowSight |

### 5. Offene Punkte (pricing-kritisch)

| Offener Punkt | Impact auf Rechnung | Pricing-kritisch? | Schnellster Klärungsweg |
|---------------|--------------------|--------------------|------------------------|
| **eCall exakter SMS-Preis pro SMS** | ±30% auf alle SMS-Kosten → bei 1'000 SMS/Mo = ±CHF 36 | **JA** | eCall-Portal → Preisliste oder letzte Rechnung |
| **eCall Grundgebühr vs. Guthaben** | ±CHF 40 auf Fixkosten-Basis | **JA** | eCall-Portal → Rechnungen prüfen: steht da "Grundgebühr" oder "Guthaben"? |
| **Retell GPT-4o-mini Real-World-Kosten** | ±20% auf Voice-Kosten nach Optimierung | **JA** (für "optimiert"-Szenarien) | LLM umstellen, 1 Woche messen, Dashboard prüfen |
| **Retell Enterprise Volume Pricing** | -20-50% Platform-Fee ab 50k Min/Mo | Nein (erst bei Scale relevant) | sales@retellai.com |
| **Twilio SIP exakte Rate** | ±$2/Mo gesamt (vernachlässigbar) | Nein | Twilio Dashboard → Billing |

**Die 3 pricing-kritischen Lücken sind alle innerhalb einer Woche klärbar.** Danach haben wir eine 95%+ belastbare Kostenbasis.

### 6. Founder Summary

1. **Die sicher bekannten Fixkosten pro Betrieb sind minimal: ~CHF 1/Mo** (eine Twilio-Nummer). Alles andere ist plattformweit (~CHF 55-65/Mo total) oder variabel.

2. **Der wichtigste variable Kostentreiber ist Retell Voice: CHF 0.46/Call (IST) bzw. CHF 0.31/Call (optimiert).** Das ist 79% der sicheren Kosten pro Voice-Fall.

3. **SMS ist der zweitwichtigste Treiber: CHF 0.12/SMS.** Bei einem typischen Voice-Fall fallen 1 sichere + 1-3 optionale SMS an = CHF 0.12-0.48.

4. **E-Mail kostet nichts** — Resend Free Tier reicht bis ~100 Tenants. Das ist ein massiver struktureller Vorteil: jeder Kommunikationspfad, den wir auf E-Mail statt SMS legen, spart CHF 0.12.

5. **Vermutlich unterschätzt: die eCall-Grundgebühr.** Falls CHF 40/Mo real ist (nicht Guthaben), verschiebt das die Fixkosten-Basis signifikant — besonders bei wenigen Tenants (CHF 4/Tenant bei 10 vs. CHF 0.80 bei 50).

6. **Vermutlich unterschätzt: Notdienst-Multiplikator.** Ein Betrieb mit 24h-Pikett kann 2-3× so viele Voice-Calls haben wie einer ohne. Das ist im aktuellen Flat-Pricing nicht reflektiert, wird aber durch das Overage-Modell (200 Fälle inkl.) aufgefangen.

7. **Für die 10er-Betriebsprofilmatrix ist die sinnvollste Klassifikation:** Fixkosten pro Betrieb (CHF 1) + Plattform-Umlage (CHF 5-6 bei 10 Tenants) + Variable pro Fall (CHF 0.43-0.82 je nach Voice/Wizard und Optimierungsstufe).

8. **Die Marge ist bei unserem ICP-Kern (4-20 MA) sehr gesund: 80-95%.** Das Risiko liegt ausschliesslich bei grossen Betrieben (30+ MA) mit hohem Voice-Volumen — und das löst das Overage-Modell.
