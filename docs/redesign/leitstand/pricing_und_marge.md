# FlowSight — Pricing, Marge & Sweetspot

**Version:** FINAL | **Datum:** 2026-03-21
**Status:** Entscheidungsreif. Letzte Iteration nach 10er-Margenmatrix + Marktanalyse.
**Basis:** `ceo_voice_decision.md` (korrigierte Kostenbasis), 10 Realitätsprofile, Schweizer Marktdaten.

---

## 1. Executive Decision

**Unser Pricing soll sich primär am Fallvolumen orientieren, nicht an der Mitarbeiterzahl.**

Mitarbeiterzahl ist ein schlechter Proxy für unsere Kosten. Ein 5-MA-Betrieb mit 24h-Notdienst kann 140 Fälle/Mo generieren und unsere Marge auf 70% drücken, während ein 8-MA-Betrieb ohne Notdienst bei 80 Fällen bleibt und 85% Marge hat. Der Kostentreiber ist die Kommunikationsintensität (Fälle × SMS pro Fall), nicht die Teamgrösse.

**Wichtigste Korrektur an unserem bisherigen Denken:**
SMS ist der dominante Kostentreiber (57-84% der variablen Kosten über alle Profile), nicht Voice. Die frühere Fixierung auf "Voice ist zu teuer" war falsch. Jeder Fall löst 1-4 SMS aus (Bestätigung, Termin, Reminder, Review) — das summiert sich schneller als die Voice-Kosten.

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
| **Standard** | 1-5 MA, normaler Betrieb | **CHF 299** | **120 Fälle** | CHF 1.50/Fall | 82-97% |
| **Professional** | 6-15 MA oder serviceintensiv | **CHF 499** | **250 Fälle** | CHF 1.00/Fall | 75-90% |
| **Enterprise** | 16+ MA oder 250+ Fälle | **ab CHF 799** | Custom | Custom | Custom |

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

### Wirtschaftlich attraktivster Bereich: 3-8 MA Betriebe

| Kriterium | Warum 3-8 MA? |
|-----------|---------------|
| **Marge** | 85-95% bei CHF 299 (CHF 10-55 variable Kosten) |
| **Marktgrösse** | ~630 in Zürich, ~3'700 in Deutschschweiz |
| **Sales-Komplexität** | Gering — Inhaber entscheidet, kein Beschaffungsprozess |
| **Churn-Risiko** | Niedrig — Voice = 24/7 Erreichbarkeit wird unverzichtbar |
| **Schmerz** | Maximal — "Auf Baustelle, kann nicht ans Telefon" |
| **Zahlungsfähigkeit** | CHF 299 = halber Techniker-Tag |

### Priorisierung

| Segment | Empfehlung |
|---------|------------|
| **3-8 MA** | **KERN-FOKUS.** Hier verdienen wir am meisten pro Aufwand. |
| 1-2 MA | Mitnehmen, nicht aktiv jagen. Hohe Churn-Gefahr. |
| 8-15 MA | Aktiv ansprechen mit Professional (CHF 499). |
| 15-30 MA | Nur auf Anfrage. Custom-Gespräch. |
| 30+ MA | Vermeiden. Zu komplex, Marge unsicher. |

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

1. **Unser Sweetspot sind 3-8 MA Sanitär-/Heizungsbetriebe** — 85-95% Marge bei CHF 299, ~630 Betriebe allein in Zürich, Inhaber entscheidet sofort.

2. **SMS ist der grösste Kostentreiber, nicht Voice.** Jeder SMS→E-Mail-Shift verbessert die Marge direkt. Das ist der grösste operative Hebel — wichtiger als LLM-Downgrade.

3. **CHF 299 ist der richtige Preis für den Kern-ICP.** Nicht zu billig (Marge >80%), nicht zu teuer (halber Techniker-Tag). Jede Preiserhöhung für kleine Betriebe schadet dem Gold-Contact-Versprechen.

4. **120 inkludierte Fälle bei Standard** geben 20% Headroom über dem typischen 5-MA-Betrieb. Das vermeidet Sales-Reibung bei 80% des Marktes.

5. **CHF 499 Professional für 6-15 MA / serviceintensive Betriebe** fängt die Grenzfälle auf. Bei 250 Fällen inkl. bleibt die Marge bei 75-90%.

6. **Die pricing-kritischste Lücke ist der eCall SMS-Preis.** ±30% auf den dominanten Kostentreiber. Ein Blick ins eCall-Portal reicht — das muss heute passieren.

7. **Bei 5% Penetration in der Deutschschweiz = CHF 114'000 MRR.** Der Markt ist gross genug für selektives Wachstum.

8. **Sofort-Aktion: LLM auf GPT-4o-mini umstellen** (spart ~34% Voice-Kosten, kein Risiko). Dann eCall-Preis klären. Dann Pricing-Page aktualisieren.

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
