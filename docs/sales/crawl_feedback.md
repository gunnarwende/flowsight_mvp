# Crawl-Feedback für die nächste Liste

> Founder-Notizen aus echten Calls. **Vor dem Bau jeder neuen Region-Liste hier zuerst lesen.**

## Regeln (Founder 18.06.2026)
- **Ziel = immer den direkten Inhaber ansprechen.** Kein Inhaber-Name findbar (Website + Zefix-Handelsregister) → **NICHT auf die Liste.**
- **Website nicht aufrufbar / „im Aufbau"** → kein Kontakt. Ggf. mit Datum zum Wiedervorlegen parken.
- **Crawl muss Inhaber + Größe + E-Mail + Leistungen mitziehen** (90 Min Handarbeit pro 20er-Liste sind nicht akzeptabel). Delta löst der Founder manuell.
  - Inhaber: Website (Über-uns/Team/Impressum) + **Zefix** (eingetragene Personen/GL) als zweite Quelle.
  - Größe: Text/Vision (Team-Seite, „X Mitarbeiter") → Ein-Mann vs. Büro.
  - E-Mail: mailto/Impressum, Entscheider-Mail vor `info@`.
  - Leistungen: Services-/Leistungen-Seite (Sanitär, Heizung, Energietechnik, Gebäudetechnik, Spenglerei, …) — damit der Call die echten Leistungen nennt, nicht nur „Sanitär & Heizung".

## Daten-Verlässlichkeit (Founder 18.06. — nach Fehlern in der ersten Thurgau-Liste)
- **NIE eine Vermutung als Fakt ausgeben (S13).** „?" ist harmlos, ein falscher Name/eine falsche Zahl ist katastrophal (Vertrauensbruch).
- **Inhaber:** nur wenn die KI selbst sicher ist (confidence „hoch/mittel"). Confidence „niedrig" → „?". **Kein Regex-Raten** als eigenständige Antwort (war der „musa → Albert Wagner statt Rico Musa"-Fehler; Regex nur als Hinweis an die KI).
- **Größe:** **nur aus expliziter Textangabe** der Website („10 Mitarbeiter", „Team von 12"). **Foto-Köpfe-Zählen per Vision ist unzuverlässig** (Schäfli 4 statt 10; Eugster >35 als null; MB/Strässle >20 als null) → sonst „?", der Founder zählt (Sekunden, genau). Viele Reviews (>40) + Größe unbekannt = „Größe prüfen"-Flag.
- **Liste nicht auf eine runde Zahl auffüllen** mit „?"-Inhaber-Betrieben (war der Strässle-Fehler). Ohne Inhaber = nicht auf die Liste.
- Werkzeug: `scripts/_ops/thurgau_list.mjs` (Crawl+Anreicherung) + `assemble_thurgau.mjs` (20er bauen, patcht `customer_journey.html` LEADS_TG). Fixes oben sind eingebaut.

## Konkrete Betriebe — Thurgau-Liste (17.06.)
- **Pierre Sanitär Design GmbH** (Frauenfeld): Website „Die Seite wird in den nächsten Wochen aktualisiert." → **kein Kontakt jetzt**; nächste Woche erneut prüfen, ob die Website geladen ist.
- **MB Haustechnik** (`mb-haustechnik.ch/index.html`): kein Ansprechpartner/Inhaber findbar → **raus.**
- **M. Rellstab GmbH** (Frauenfeld): kein Inhabername findbar → **raus.**
