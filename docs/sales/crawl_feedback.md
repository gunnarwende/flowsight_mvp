# Crawl-Feedback für die nächste Liste

> Founder-Notizen aus echten Calls. **Vor dem Bau jeder neuen Region-Liste hier zuerst lesen.**

## Regeln (Founder 18.06.2026)
- **Wortwahl (19.06.): „Combox" NIE verwenden** (Swisscom-markenspezifisch, irreführend) → **„Anrufbeantworter"** (universell, Schweiz-tauglich).
- **SCHABLONE „nicht erreicht / keiner dran" = `docs/gtm/sales/templates/email_nicht_erreicht.md` (Founder-freigegeben 19.06.).** Für ALLE künftigen Betriebe ohne Telefon-Kontakt exakt diesen Textinhalt hernehmen (nur Anrede + Firma tauschen). „geht im Tagesgeschäft **unter**" (nicht „verloren").
- **Kein erfundenes Erlebnis (19.06., R.-Gerber-NoGo):** NIE Eindrücke behaupten, die ich nicht hatte — kein „sympathisches Team", kein „guter Support", keine Foto-/Website-Eindrücke als Erlebnis. Wenn ich NICHT durchgekommen bin, ehrlich genau das: „angerufen, niemand rangegangen, bei Ihnen ist sicher viel los — genau hier setzen wir an" (S13-Linie). Gilt für alle Nicht-erreicht-Betriebe.
- **Copy-NoGos (19.06.):** NIE „durchgespielt" (wirkt künstlich/wie Fake-Simulation, nicht echt/live). NIE eine **Video-Dauer** behaupten — v.a. NICHT „in zwei Minuten" (die Videos dauern ~10 Min). Nicht zu technisch. Stattdessen: ehrlich an „ich habe versucht Sie zu erreichen" anknüpfen → Anfragen über Telefon/Website/Gespräch-vor-Ort laufen zusammen → Erreichbarkeit, **Sichtbarkeit**, **Mobilität (unterwegs jederzeit den Stand)**.
- **E-Mail-Empfänger MUSS zur Betriebs-Domain passen (19.06., Künzi-NoGo):** Der Crawl wählte `info@myls.ch` (Web-Agentur aus dem Footer) statt `info@kuenzi-haustechnik.ch`. → `prospect.email` immer gegen die Website-Domain prüfen; fremde Domains (Agentur/Hoster) verwerfen, eigene Domain bevorzugen. **Vor jedem Live-Versand Empfänger gegen die Website-Domain gegenchecken.**
  - **AUTHORITATIVE QUELLE = die Kontaktliste im Cockpit (Stern 1), NICHT der Crawl (Founder 19.06.).** Der Founder pflegt die E-Mail dort selbst/geprüft. Crawl ist nur Notbehelf, weil das Cockpit (localStorage) noch nicht serverseitig lesbar ist → genau das löst der **Customer-Journey-Server-Bau (Wochenende)**: `prospect.email` kommt aus der Cockpit-Kontaktliste durch, „immer die gleiche Connection". Bis dahin: **vor Live-Versand die Empfängerliste dem Founder zum Abgleich gegen seine Kontaktliste vorlegen.**
- **Anrede IMMER „Grüezi Herr [Nachname]" — in Beweis-Seite UND E-Mail-Greeting gleich (19.06.):** Der Founder pflegt den Inhaber-Nachnamen im Cockpit (Stern 1). Diese Anrede gehört **dynamisch** in beide: `proof_pages.contact_salutation` + `email.json`-paragraphs[0]. Zwei GL → „Herr X und Herr Y" (z.B. „Herr Wattinger und Herr Schwendener"). **Wenn unsicher → neutral „Grüezi" lassen UND dem Founder aktiv melden** (er ergänzt). **Customer-Journey-Server-Bau (Wochenende): den im Cockpit gepflegten Inhaber automatisch in Anrede + Greeting durchreichen — „immer die gleiche Connection".**
- **Kundenseiten-Anrede NIE aus Crawl-Inhaber (19.06., „Friberg"-NoGo):** Die `/p/`-Beweis-Seite zeigte „Grüezi Herr Friberg" — ein gecrawlter Name, der NICHT der Inhaber ist (Rickenbach!). `build_proof_page` zieht den Crawl-Inhaber **nicht mehr automatisch** in die Anrede; Default = neutral „Grüezi". Name nur per explizitem `--salutation` (founder-bestätigt) oder DB-`contact_salutation`. Guard zusätzlich gegen Müll-Wörter (Handelsregister/Ansprechpartner/Sanitärmonteur → neutral). **Echter-aussehende-aber-falsche Namen sind algorithmisch NICHT erkennbar → daher: vor jedem Live-Versand die Anrede prüfen, im Zweifel neutral.**
- **GEWERK ↔ Demo-Szenario muss passen (19.06.):** Das T2-Video simuliert einen **Rohrbruch (Keller unter Wasser) = Sanitär-Notfall.** **Reine Heizungs-/Gebäudetechnik-Betriebe ohne Sanitär** (z.B. MS Gebäudetechnik „Heizung/Lüftung/Solar", Regiotherm „Heizung") dürfen diese Demo NICHT bekommen → Gewerk-Mismatch, wirkt „die haben uns nicht verstanden". Erkennen: `voice_agent.domain` / services ohne „sanit". → **zurückstellen bis Heizungs-Notfall-T2-Variante** existiert („Heizung ausgefallen / kein Warmwasser"). Produkt passt, nur das Demo-Szenario fehlt.
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
