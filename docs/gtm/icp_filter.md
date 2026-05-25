# ICP-Filter v2 — Sanitärbetriebe Schweiz

**Stand:** 25.05.2026 (Post-Reise Founder-Entscheidung).
**Ziel:** Reduktion von 5'400 Marktanalyse-Betrieben auf **300–400 hungrige ICP-Treffer**.
**Quelle:** $100M Offers (Hormozi) Starving-Crowd-Prinzip + Mom-Test ICP-Härtung.

---

## Warum nicht 5'400

Founder-Entscheidung 25.05.: Premium-Pricing (1'500–2'500 CHF/Mo) + Max-10-Onboardings/Monat-Cap erfordern **hungrige Käufer**, nicht "vielleicht-interessierte" Käufer. Bei restriktivem Onboarding-Cap macht ein 5'400-Liste-Sweep mehr Schaden als Nutzen (Verwässerung, langsame Pipeline-Rückmeldung, falsche Lessons).

> **Hormozi-Regel:** "You don't want a better mousetrap — you want a starving crowd."

---

## 4 harte Filter (alle 4 müssen erfüllt sein)

### F1. Größe — ≥5 Mitarbeiter
- **Why:** Solo-Handwerker (1-MA) hat keine Sekretärin, keinen Einnahmen-Hebel für 2'500 CHF/Mo, und keine "verpasste-Anrufe"-Quantität die Investment rechtfertigt.
- **Datenquelle:** Crefo, Moneyhouse, Handelsregister-Mitarbeiterzahl (falls public).
- **Hart:** <5 MA = raus.

### F2. Digital-Reife — moderne Website vorhanden
- **Why:** Wer schon in Web investiert hat, versteht den Wert von Digital-Tools. Bei Web-Verweigerer-Betrieben (alte HTML-Seite ohne Mobile-View) brauchst du erst eine Computer-Schulung.
- **Indikator:** Mobile-responsive + HTTPS + Last-Update <2 Jahre (per `web.archive.org` checken oder Lighthouse-Quick-Score).
- **Hart:** Keine Website ODER Frame-Set-90er-Stil = raus.

### F3. Schmerz-Signal — Telefon-Beschwerden in Google-Reviews
- **Why:** Direkter Beweis dass das Problem real ist, gepostet von echten verlorenen Kunden. Hormozi-Starving-Indicator.
- **Indikator:** Mindestens 1 Google-Review mit Keywords:
  - "geht nicht ans Telefon"
  - "antwortet nicht"
  - "kein Rückruf"
  - "nie erreichbar"
  - "Telefon ständig besetzt"
- **Bonus:** Mehrere solche Reviews = sehr heiß.
- **Crawler:** Bestehender `scripts/_ops/crawl_google_reviews.mjs` erweitern um Keyword-Match.

### F4. Eigentümer-geführt (kein Konzern)
- **Why:** Schneller Entscheidungsweg. Premium-Pricing braucht Entscheider-Direkt-Kontakt. Konzerne haben Procurement-Hürden, monatelange Entscheidungen, Konditions-Verhandlungen.
- **Indikator:** Inhaber im Handelsregister gleich Geschäftsführer. Familien-Namen-Match (z.B. "Dörfler AG" gegründet von Dörfler-Familie).
- **Hart:** Konzern-Tochter (Coop, Migros, Implenia, etc.) = raus.

---

## Bonus-Trigger (kein Filter, aber Heißmacher)

Diese Signale heben einen F1-F4-Treffer von "ICP" zu "Top-50-Heiß":

- 🔥 **Job-Inserat für "Sekretärin/Telefondienst/Bürokraft"** auf Indeed/Anibis/JobScout24 (innerhalb letzten 90 Tage). Direkter Beweis, dass sie das Problem ERKANNT haben und Geld in den Topf werfen wollen.
- 🔥 **Mehrere F3-Reviews** (>2 Telefon-Beschwerden).
- 🔥 **Inhaber-Alter ~35-55** (digital-affin, eigentumsfähig, langfristig denkend — nicht kurz vor Übergabe).
- 🔥 **Wachstums-Phase** (mehrere neue Mitarbeiter im letzten Jahr, ICP-Datenpunkt aus LinkedIn).

---

## Filter-Workflow (Re-Scoring der 5'400er-Liste)

1. **F1-Filter aus Marktanalyse:** Crefo-Mitarbeiterzahl ≥5 → erwartet ~1'500-2'000 verbleibend.
2. **F4 manuell-light:** Konzern-Filter via Bonität-DB (Konzern-Verflechtung-Marker) → erwartet ~1'200 verbleibend.
3. **F2 + F3 automatisiert via Crawler:** Bestehende Tools (`crawl-website.mjs`, `crawl_google_reviews.mjs`) erweitern. → erwartet ~300-400 finale ICP-Liste.
4. **Bonus-Trigger separat tracken:** Top-50-Heiß-Sublist für Erst-Kontakt.

**Implementation:** Eigenes Ticket P12 in `docs/ticketlist.md`. Aufwand: ~1-2 Tage Scout-Erweiterung + 1 Tag manueller Review.

---

## Cross-Check: Warum nicht <300

Mathematik:
- Conversion-Erwartung (Hormozi-Premium-Floor): 1-3% von kalt zu zahlend.
- Bei 300 ICP × 2% = 6 zahlende Kunden.
- Bei 400 ICP × 2% = 8 zahlende Kunden.

Bei Max-10/Monat-Cap: 300-400 reicht für 4-6 Monate Pipeline-Material. **Genug, um schnell zu lernen, ohne Verschwendung.**

Wenn nach 4 Monaten <50% Conversion: ICP-Hypothese falsch → neu re-filtern, nicht Liste vergrößern.
