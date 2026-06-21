# FlowSight — Pricing, Marge & Sweetspot

**Version:** FINAL | **Datum:** 2026-03-21
**Status:** Entscheidungsreif. Letzte Iteration nach 10er-Margenmatrix + Marktanalyse.
**Basis:** `ceo_voice_decision.md` (korrigierte Kostenbasis), 10 Realitätsprofile, Schweizer Marktdaten.

---

## 1. Executive Decision

### Strategische Positionierung: Leitsystem, nicht Voice-Tool

**FlowSight ist kein AI-Telefonassistent.** FlowSight ist ein **vertikales Einsatz- und Leitsystem für Gebäudetechnik-Betriebe** — mit Voice-AI als einem Eingangskanal unter mehreren. Das Produkt umfasst:

- **Voice-Intake** (Lisa) — KI-Telefonassistentin, 24/7, branchenspezifisch
- **Leitzentrale** — operative Fallsteuerung, Terminplanung, Bewertungs-Engine
- **Persönliche PWA pro Mitarbeiter** — jeder Techniker hat seine eigene Arbeitsoberfläche auf der Baustelle (Fälle, Termine, Navigation, Dokumentation)
- **Automatisierte Kommunikationskette** — SMS, E-Mail, ICS-Einladungen, Review-Anfragen
- **Branded Website** — pro Betrieb, mit Wizard-Intake

**Warum diese Abgrenzung entscheidend ist:**
Wenn wir als "KI-Telefonassistent" wahrgenommen werden, konkurrieren wir gegen $29/Mo-AI-Receptionists (smith.ai, Ruby, Dialpad). Diese werden bald $19/Mo kosten. Dort können wir nicht gewinnen.

Unsere echte Vergleichskategorie ist **Field Service Management**: ServiceTitan ($200-500/Mo), Jobber ($69-249/Mo), Housecall Pro ($49-199/Mo). **Keines** davon hat Voice-AI-Intake. **Keines** hat eine branded PWA pro Mitarbeiter. **Keines** spricht Schweizerdeutsch.

**CHF 299 für ein vertikales Leitsystem mit AI-Intake ist nicht teuer — es ist aggressiv günstig in dieser Kategorie.**

### Pricing-Logik: Fallvolumen als Hauptanker

Mitarbeiterzahl ist ein schlechter Proxy für unsere Kosten. Der echte Kostentreiber ist die Kommunikationsintensität (Fälle × SMS pro Fall). Pricing richtet sich daher primär am Fallvolumen aus, mit Mitarbeiterzahl als Sekundärsignal.

### Wichtigste Korrekturen an unserem bisherigen Denken:
1. **Wir sind kein Voice-Tool.** Voice ist 1 von 5 Modulen. Die Produktidentität ist das Leitsystem.
2. **SMS ist der dominante Kostentreiber** (57-84%), nicht Voice. Jeder SMS→E-Mail-Shift verbessert die Marge.
3. **1-2 MA Betriebe sind NICHT unser Kern-ICP.** Sie brauchen keinen Leitstand — sie brauchen einen Anrufbeantworter. Unser Produkt wird wertvoll ab 3-5 MA (operative Komplexität).
4. **Unser Preis ist strategisch niedrig** relativ zur Kategorie (FSM), nicht hoch relativ zu Voice-Tools.

---

## 2. Kostenlogik

### Was treibt unsere Kosten wirklich?

| Kostentreiber | Anteil an variablen Kosten | Hebel |
|---------------|---------------------------|-------|
| **SMS (eCall)** | 57-84% (steigt mit Fallvolumen) | E-Mail statt SMS wo möglich |
| **Voice (Retell)** | 16-43% (sinkt relativ mit Fallvolumen) | LLM auf GPT-4o-mini (-34%) |
| **Fixkosten** | <10% bei 5+ Tenants | Vernachlässigbar bei Scale |

### Warum Kommunikationsintensität wichtiger ist als Mitarbeiterzahl

- SMS geht an **alle** Fälle (Voice + Wizard), nicht nur Voice-Fälle
- Bei 3-4 SMS pro Fall: 100 Fälle × 3 SMS × CHF 0.12 = **CHF 36/Mo** nur SMS
- Voice trifft nur 20-35% der Fälle: 25 Voice-Calls × CHF 0.46 = **CHF 12/Mo**
- **SMS ist 3× teurer als Voice** bei einem 100-Fall-Betrieb

### Bekannte Kosten (KNOWN vs. ASSUMPTION)

| Baustein | Betrag | Confidence |
|----------|--------|------------|
| Retell Voice (IST, gemessen) | CHF 0.46/Call | **KNOWN** |
| Retell Voice (GPT-4o-mini) | CHF 0.31/Call | Assumption ±20% |
| eCall SMS | CHF 0.12/SMS | **Assumption ±30% — pricing-kritisch, Founder muss verifizieren** |
| E-Mail (Resend) | CHF 0.00 | **KNOWN** (Free Tier bis ~100 Tenants) |
| Fix pro Betrieb | CHF 1/Mo | **KNOWN** (Twilio-Nummer) |
| Plattform-Fix | CHF 55-65/Mo total | Assumption |

---

## 3. Pricing-Modell (Final)

### Struktur: 2 Tiers + Custom

| Tier | Zielgruppe | Preis/Mo | Inkl. Fälle | Overage | Marge (Base) |
|------|-----------|----------|-------------|---------|--------------|
| **Standard** | 1-5 MA, normaler Betrieb | **CHF 299** | **100 Fälle** | Intern: CHF 1.50/Fall (nicht auf Website) | 82-97% |
| **Professional** | 6-15 MA oder serviceintensiv | **CHF 499** | **200 Fälle** | Intern: CHF 1.00/Fall (nicht auf Website) | 75-90% |
| **Enterprise** | 16+ MA oder 200+ Fälle | **ab CHF 799** | Custom | Custom | Custom |

**Website-Logik:** Overage wird NICHT auf der Website kommuniziert. Intern bleibt die Logik bestehen, aber der Prospect sieht nur die inkludierten Fälle. Grund: Einfachheit, kein Rechenmodell-Gefühl, Leitsystem-Positionierung.

### Warum 120 Fälle statt 100 oder 200?

**100 war zu knapp:** 60% des Marktes sind 3-10 MA Betriebe mit 50-120 Fällen/Mo. Bei 100 inkludierten Fällen stösst jeder fünfte Kern-ICP-Kunde ans Limit → Reibung im Sales. 120 gibt 20% Headroom für den Sweetspot.

**200 war zu grosszügig:** Bei 200 Fällen × 3 SMS × CHF 0.12 = CHF 72 SMS-Kosten → nur 76% Marge. Das ist zu knapp für unser Zielbild.

**120 trifft den Sweetspot:** Bei 120 Fällen × 3 SMS × CHF 0.12 = CHF 43 SMS + ~CHF 14 Voice = CHF 57 variable Kosten → **81% Marge** bei CHF 299.

### Overage-Logik

- **CHF 1.50/Fall (Standard):** Unsere Kosten ~CHF 0.50-0.80/Fall → 100-200% Markup. Fair für Handwerker, profitabel für uns.
- **CHF 1.00/Fall (Professional):** Niedrigerer Markup weil höheres Volumen. Immer noch >30% Marge pro Overage-Fall.
- Overage wird **monatlich abgerechnet**, transparent im Leitstand sichtbar.

### Zusatz-Guardrails

- **Notdienst-Flag im Sales:** Wenn der Betrieb 24h-Pikett hat → automatisch Professional-Empfehlung (höheres Fallvolumen wahrscheinlich).
- **Kein SMS-Budget-Cap:** SMS ist unser Haupttreiber, aber ein separates SMS-Limit wäre zu komplex. Das Fälle-Limit fängt es implizit ab.
- **Monatlich kündbar:** Kein Lock-in. Wenn der Kunde merkt, dass Professional passt → Upgrade jederzeit.

---

## 4. 10 Realitätsprofile — Margenmatrix

### Base Case (Retell IST CHF 0.46/Voice, SMS CHF 0.12, 10 Tenants)

| # | Profil | MA | Fälle/Mo | Voice | SMS gesamt | Kosten CHF | Preis CHF | DB CHF | Marge | 70%? |
|---|--------|-----|----------|-------|-----------|------------|-----------|--------|-------|------|
| 1 | 1-Mann, ruhig | 1 | 15 | 3 | 15 | 10 | 299 | 289 | 97% | JA |
| 2 | 1-Mann, Baustelle | 1 | 30 | 10 | 60 | 19 | 299 | 280 | 94% | JA |
| 3 | 2-Mann, normal | 2 | 45 | 12 | 90 | 23 | 299 | 276 | 92% | JA |
| 4 | 2-3 Mann, Notfall | 3 | 70 | 20 | 210 | 41 | 299 | 258 | 86% | JA |
| 5 | 4-5 Mann, Standard | 5 | 100 | 25 | 300 | 55 | 299 | 245 | 82% | JA |
| 6 | 4-5 Mann, serviceintensiv | 5 | 140 | 35 | 560 | 90 | 299 | 209 | 70% | GRENZE |
| 7 | 6-8 Mann, organisiert | 7 | 180 | 40 | 540 | 90 | 499 | 409 | 82% | JA |
| 8 | 6-10 Mann, Notdienst | 8 | 220 | 60 | 880 | 140 | 499 | 359 | 72% | JA |
| 9 | 10-15 Mann, Service | 12 | 300 | 70 | 1200 | 183 | 499 | 316 | 63% | NEIN |
| 10 | 20+ Mann, Durchsatz | 22 | 450 | 90 | 1800 | 264 | 799 | 535 | 67% | NEIN |

**Profil 6 (140 Fälle) ist die Kipplinie bei CHF 299.** Profile 7-8 funktionieren bei CHF 499. Profile 9-10 brauchen Custom.

### Hard Reality Case (SMS CHF 0.18, Voice CHF 0.55, eCall Grundgebühr CHF 40)

| # | Profil | Kosten CHF | Preis CHF | DB CHF | Marge | 70%? |
|---|--------|------------|-----------|--------|-------|------|
| 1 | 1-Mann, ruhig | 15 | 299 | 284 | 95% | JA |
| 2 | 1-Mann, Baustelle | 27 | 299 | 272 | 91% | JA |
| 3 | 2-Mann, normal | 34 | 299 | 265 | 89% | JA |
| 4 | 2-3 Mann, Notfall | 60 | 299 | 239 | 80% | JA |
| 5 | 4-5 Mann, Standard | 79 | 299 | 220 | 74% | JA |
| 6 | 4-5 Mann, serviceintensiv | 131 | 299 | 168 | 56% | NEIN |
| 7 | 6-8 Mann, organisiert | 130 | 499 | 369 | 74% | JA |
| 8 | 6-10 Mann, Notdienst | 202 | 499 | 297 | 60% | NEIN |
| 9 | 10-15 Mann, Service | 266 | 499 | 233 | 47% | NEIN |
| 10 | 20+ Mann, Durchsatz | 385 | 799 | 414 | 52% | NEIN |

**Im Hard Case kippt Profil 6 schon bei 56% — unterstreicht: 120 Fälle inkl. bei Standard ist richtig, nicht 200.**

### Wo kippt das Pricing?

| Fälle/Mo | SMS-Kosten (3 SMS/Fall) | Voice-Kosten (25% Voice) | Total | Marge bei 299 | Marge bei 499 |
|----------|------------------------|-------------------------|-------|---------------|---------------|
| 80 | CHF 29 | CHF 9 | CHF 45 | **85%** | — |
| 100 | CHF 36 | CHF 12 | CHF 55 | **82%** | — |
| **120** | CHF 43 | CHF 14 | **CHF 64** | **79%** | — |
| **140** | CHF 50 | CHF 16 | **CHF 73** | **76%** | — |
| 180 | CHF 65 | CHF 18 | CHF 90 | 70% | **82%** |
| 220 | CHF 79 | CHF 28 | CHF 114 | 62% | **77%** |
| **250** | CHF 90 | CHF 29 | **CHF 126** | 58% | **75%** |
| 300 | CHF 108 | CHF 32 | CHF 147 | 51% | **71%** |
| 450 | CHF 162 | CHF 41 | CHF 210 | 30% | 58% |

**Kipppunkt CHF 299:** ~130-140 Fälle/Mo (Marge fällt unter 75%).
**Kipppunkt CHF 499:** ~300 Fälle/Mo (Marge fällt unter 70%).

---

## 5. Marktsegmentierung

### Adressierbarer Markt (harte Zahlen)

| Scope | Sanitär/Heizung (3-30 MA) | Quelle |
|-------|---------------------------|--------|
| **Kanton Zürich** | **~970** | sanitaervergleich.ch + BFS SME-Filter |
| **Deutschschweiz** | **~5'700** | business-monitor.ch (NOGA 43.22) |
| **Gesamtschweiz** | **~15'000** | Suissetec + BFS |

### Verteilung auf Tiers (Kanton Zürich, ~970 Betriebe)

| Tier | Betriebsgrösse | Anteil | Betriebe | Typische Fälle/Mo |
|------|---------------|--------|----------|--------------------|
| **Standard** (CHF 299) | 1-5 MA | ~65% | **~630** | 15-120 |
| **Professional** (CHF 499) | 6-15 MA | ~25% | **~240** | 120-300 |
| **Enterprise** (Custom) | 16-30 MA | ~8% | **~80** | 250-500 |
| Nicht ICP | 30+ MA | ~2% | ~20 | >500 |

### MRR-Potenzial (Deutschschweiz, 5% Penetration)

| Tier | Kunden | MRR | Marge |
|------|--------|-----|-------|
| Standard | 185 | CHF 55'000 | 82-97% |
| Professional | 70 | CHF 35'000 | 75-90% |
| Enterprise | 30 | CHF 24'000 | Custom |
| **Total** | **285** | **CHF 114'000/Mo** | — |

---

## 6. Sweetspot

### Wirtschaftlich attraktivster Bereich: 5-15 MA Betriebe

| Kriterium | Warum 5-15 MA? |
|-----------|----------------|
| **Operative Komplexität** | Mehrere Techniker, Terminplanung, Fallzuweisung — hier wird das Leitsystem unverzichtbar |
| **Marge** | 75-90% bei CHF 299-499 (je nach Volumen) |
| **Marktgrösse** | ~450 in Zürich (5-15 MA), ~2'700 in Deutschschweiz |
| **Produkt-Fit** | Leitstand + Techniker-PWA + Voice = voller Stack, nicht nur "Anrufbeantworter" |
| **Sales-Komplexität** | Moderat — Inhaber oder Disponent entscheidet, oft nach Live-Demo |
| **Schmerz** | Maximal — "Wir verwalten Anfragen auf Zetteln und vergessen Rückrufe" |
| **Zahlungsfähigkeit** | CHF 299-499 = Kosten von 1-2 verpassten Aufträgen pro Monat |
| **Churn-Risiko** | Niedrig — je mehr Techniker das System nutzen, desto schwerer der Ausstieg |

### Warum NICHT 1-3 MA als Kern?

Ein 1-2 Mann-Betrieb braucht **kein Leitsystem**. Der Meister IST der Disponent, der Techniker und das Büro in einer Person. Er braucht einen Anrufbeantworter — keinen Leitstand mit Rollen, Terminplanung und Techniker-PWA.

Wenn wir 1-2 MA-Betriebe als Kern-ICP definieren, positionieren wir uns als "günstiger AI-Telefonassistent". Das ist die falsche Kategorie. Dort werden wir von $29/Mo-Lösungen unterboten.

Unser Produkt wird wertvoll wo **operative Komplexität** entsteht:
- Mehrere Techniker, die koordiniert werden müssen
- Terminüberschneidungen, die vermieden werden müssen
- Fälle, die zugewiesen und nachverfolgt werden müssen
- Kunden, die strukturiert informiert werden müssen (SMS, E-Mail, Review)

Das beginnt bei **5 MA** und ist optimal bei **8-15 MA**.

### Priorisierung (korrigiert nach Leitsystem-Positionierung)

| Segment | Empfehlung | Begründung |
|---------|------------|------------|
| **5-15 MA** | **KERN-FOKUS.** Höchster Produkt-Fit, beste Marge pro Wert. | Leitsystem + PWA + Voice = voller Nutzen |
| **3-5 MA** | **Aktiv ansprechen** mit Standard (CHF 299). Einstieg ins System. | Wachstum: heute 3, morgen 6 MA → bleibt Kunde |
| 1-2 MA | Mitnehmen wenn sie kommen, nicht aktiv jagen. | Zu wenig operative Komplexität für Leitsystem-Wert |
| 15-30 MA | Aktiv mit Professional/Enterprise. Höherer Wert pro Deal. | Mehr Features, längerer Sales-Cycle, aber höherer LTV |
| 30+ MA | Nur Custom. | Zu komplex für standardisiertes Onboarding |

---

## 7. Risiken und offene Punkte

### Pricing-kritisch (Founder-Action SOFORT)

| Lücke | Impact | Klärung |
|-------|--------|---------|
| **eCall SMS-Preis exakt** | ±30% auf grössten Kostentreiber | eCall-Portal → Rechnungen |
| **eCall Grundgebühr** | CHF 0 oder CHF 40 Fixkosten? | eCall-Portal → Vertragsdetails |
| **Retell GPT-4o-mini Kosten** | ±20% auf Voice nach Optimierung | Umstellen → 1 Woche messen |

### Strukturelle Risiken

| Risiko | Mitigation |
|--------|------------|
| Notdienst-Betrieb bei Standard-Tier | Notdienst-Flag → Professional empfehlen |
| SMS teurer als angenommen | E-Mail-Substitution maximieren |
| Kunde beschwert sich über Overage | Transparent im Leitstand, monatlich kündbar |

---

## 8. Founder-Fazit

1. **FlowSight ist ein vertikales Leitsystem, kein Voice-Tool.** Voice ist ein Modul. Das Produkt ist das Gesamtsystem: Leitstand + Techniker-PWA + Voice + Kommunikationskette + Review-Engine. Wir konkurrieren mit ServiceTitan und Jobber, nicht mit AI-Receptionists. CHF 299 ist in dieser Kategorie aggressiv günstig.

2. **Unser Sweetspot sind 5-15 MA Betriebe** — hier entsteht die operative Komplexität (Termine, Zuweisung, Koordination), die unser Leitsystem unverzichtbar macht. ~450 Betriebe in Zürich, ~2'700 in Deutschschweiz.

3. **1-2 MA Betriebe sind NICHT unser Kern.** Sie brauchen einen Anrufbeantworter, kein Leitsystem. Wenn wir dort fokussieren, werden wir als "billiger AI-Telefonassistent" wahrgenommen — und gegen $29/Mo-Tools verglichen.

4. **SMS ist der grösste Kostentreiber (57-84%), nicht Voice.** Jeder SMS→E-Mail-Shift verbessert die Marge direkt. Das ist operativ der wichtigste Hebel.

5. **CHF 299 Standard / CHF 499 Professional** ist das richtige Pricing — nicht weil wir billig sein wollen, sondern weil es den Einstieg für den ICP-Kern senkt. Der wahre Wert (Leitsystem + PWA pro Mitarbeiter) rechtfertigt langfristig höhere Preise.

6. **Die persönliche PWA pro Techniker ist der nächste strategische Differentiator.** Kein Wettbewerber bietet das. Sobald live: erhöht den Lock-in, rechtfertigt Professional-Tier, macht das Produkt zur operativen Infrastruktur statt zum "Nice-to-have".

7. **Pricing-kritisch: eCall SMS-Preis verifizieren** (±30% auf dominanten Kostentreiber). Und: **LLM auf GPT-4o-mini umstellen** (spart ~34% Voice-Kosten).

8. **Bei 5% Penetration Deutschschweiz = CHF 114'000 MRR.** Der Markt ist gross genug. Wir müssen nicht jeden nehmen — wir fokussieren auf Betriebe die vom Leitsystem profitieren, nicht auf Solo-Handwerker die nur einen Anrufbeantworter suchen.

---

## Sales-Operationalisierung

### 5 Fragen im Sales-Call

| # | Frage | Pricing-Impact |
|---|-------|----------------|
| 1 | **Wie viele Mitarbeiter hat Ihr Betrieb?** | ≤5 → Standard, 6-15 → Professional |
| 2 | **Haben Sie einen 24h-Notdienst?** | Ja → Professional empfehlen |
| 3 | **Wie viele Kundenanfragen pro Woche ungefähr?** | <30 → Standard, 30+ → Professional |
| 4 | **Haben Sie eine Website mit Kontaktformular?** | Ja → mehr Wizard, weniger SMS-Kosten |
| 5 | **Wer bearbeitet die Anfragen heute?** | Entscheider-Identifikation |

### Zuordnungslogik

```
WENN MA ≤ 5 UND kein Notdienst → Standard (CHF 299, 120 Fälle inkl.)
WENN MA 6-15 ODER Notdienst → Professional (CHF 499, 250 Fälle inkl.)
WENN MA > 15 ODER >250 Fälle erwartet → Custom-Gespräch
```
