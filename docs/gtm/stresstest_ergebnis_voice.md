# Stresstest Ergebnis: Voice Agent (Lisa) — 12 ICP-Betriebe

> **Datum:** 2026-04-15
> **Methode:** Systematische Analyse der gesamten Voice Pipeline (Retell Agent → Webhook → Supabase → SMS → Push → Email) gegen 12 reale ICP-Betriebe und deren typische Anrufer-Szenarien.
> **Quellen:** `stresstest_icp_profile.md`, `global_prompt_de.txt`, `doerfler_agent.json`, `route.ts` (webhook), `postCallSms.ts`, `sendSms.ts`, `sendSmsEcall.ts`, `resend.ts`, `resolveTenant.ts`, `sendOpsPush.ts`, `plzCityMap.ts`, `voice.md`, `voice_ist.md`, `lessons-learned.md`
> **Scope:** Nur Analyse + Findings. Kein Code geaendert.

---

## Zusammenfassung

| Severity | Anzahl | Highlights |
|----------|--------|------------|
| **CRITICAL** | 4 | Info-Calls erzeugen Phantom-Faelle, kein Retell-Fallback, PLZ-Map lueckenhaft, SMS 160-Char-Limit ueberschritten |
| **HIGH** | 7 | Kategorien zu schmal, kein call_type Gate, Reklamation nicht priorisiert, Solo-Betrieb-Push-Problem, INTL Agent-ID leer in Export, Hangup-mid-call erzeugt defekte Faelle, Concurrent-Call-Limit unbekannt |
| **MEDIUM** | 9 | Name-STT-Qualitaet, Hausnummer-Normalisierung limitiert, Info-Call SMS nicht unterdrueckt, Elderly-Anrufer-Zeitdruck, Callback-Anrufer-Luecke, kein Duplicate-Call-Schutz, Schweizerdeutsch-ASR-Risiko, Nacht-Anruf UX, Angebots-Kategorie fehlt |
| **LOW** | 5 | Reminder nur 1x, max_call_duration 7min knapp, PLZ-Vorlese-Verbot schwer pruefbar, Competitor-Fishing harmlos, Werbeanruf-Kosten |

**Gesamturteil:** Das System ist fuer den Gold-Standard-Anspruch bemerkenswert robust gebaut. Die kritischen Findings (besonders F-01 und F-03) muessen VOR dem ersten zahlenden Kunden gefixt werden. Die meisten HIGH-Findings sind bei <5 Betrieben tragbar, werden aber bei Skalierung zu echten Problemen.

---

## CRITICAL Findings

### F-01: Info-Calls erzeugen Phantom-Faelle im Leitsystem

**Problem:** Der Webhook (`route.ts`) liest `call_type` aus den Retell-Extraction-Daten NICHT aus. Jeder Anruf, der laenger als 25 Sekunden dauert und ein `call_analyzed` Event erzeugt, wird als Case in Supabase gespeichert — egal ob Intake oder Info-Call. Ein Anrufer, der nur nach Oeffnungszeiten fragt (Info-Modus, ~45 Sekunden), erzeugt einen Fall mit:
- `category: "Allgemein"` (Default, weil bei Info leer)
- `urgency: "normal"` (Default)
- `description:` die Info-Frage
- `plz/city:` leer

**Betroffene Betriebe:** ALLE, besonders Betriebe mit hohem Anrufvolumen:
- Weinberger AG (25-30 Kontakte/Tag) → 5-8 Info-Calls/Tag → 5-8 Phantom-Faelle/Tag
- Waelti & Sohn (20+ Einsaetze/Tag) → aehnliches Volumen
- Orlandini (12-15 Kontakte/Tag) → Anastasia sieht morgens Faelle die keine Faelle sind

**Impact:** Sandra bei Weinberger oeffnet Montag morgen den Leitstand: 8 neue Faelle. 3 davon sind Oeffnungszeiten-Anfragen. Sie muss jeden einzeln oeffnen, lesen, schliessen. Vertrauensverlust in das System.

**Severity:** CRITICAL

**Fix:** Im Webhook `call_type` aus `extractedData` lesen. Wenn `call_type === "info"`, Case-Erstellung ueberspringen oder als separaten Typ (`source: "voice_info"`) speichern, der im Leitsystem ausgefiltert wird.

**CC kann autonom fixen:** Ja — reine Code-Aenderung, kein Founder-Entscheid noetig. Empfehlung: `call_type === "info"` → kein Case, nur Log. `call_type === "mixed"` → Case (Anrufer hatte auch ein Problem).

---

### F-02: Kein Fallback wenn Retell ausfaellt

**Problem:** Wenn Retell als Service nicht erreichbar ist (SIP 503, Maintenance, Outage), hoert der Anrufer: nichts. Kein Besetztzeichen, keine Bandansage, keinen Anrufbeantworter. Der Anruf scheitert lautlos. Der Betrieb erfaehrt davon erst beim naechsten Morning Report.

**Betroffene Betriebe:** ALLE, aber besonders:
- Walter Leuthold (Solo) — sein EINZIGER Telefonkanal ist Lisa. Kein Fallback = 100% Erreichbarkeitsausfall.
- Doerfler AG — bei Notfall-Rohrbruch: Anrufer hoert nichts, ruft Konkurrenz an.
- MPM Haustechnik — hat keine Website, kein Formular. Telefon ist alles.

**Impact:** Voice-Ausfall bei einem Solo-Betrieb = Totalausfall. Gold Contact §4: "Der Betrieb testet nicht zweimal." Ein einziger Ausfall waehrend der Trial-Phase kann den Deal toeten.

**Severity:** CRITICAL

**Fix:** Twilio SIP Trunk mit Failover konfigurieren: Primary = Retell SIP, Secondary = Twilio Voicemail oder Twilio Studio Flow mit einfacher Bandansage ("Wir sind gerade nicht erreichbar, bitte hinterlassen Sie eine Nachricht"). Technisch machbar ueber Twilio Dashboard.

**CC kann autonom fixen:** Nein — Twilio Konfiguration erfordert Dashboard-Zugriff + Founder-Entscheid (Bandansage-Text, Voicemail-Setup, Kosten).

---

### F-03: PLZ-City-Map hat kritische Luecken

**Problem:** `plzCityMap.ts` enthaelt nur 21 PLZ-Eintraege. Das Einzugsgebiet der 12 ICP-Betriebe umfasst aber mindestens 10 weitere Orte, die NICHT in der Map sind:

| PLZ | Ort | Fehlend? | Relevanz |
|-----|-----|----------|----------|
| 8712 | Staefa | Ja | Weinberger Einzugsgebiet |
| 8712 | Staefa | Ja | Waelti Einzugsgebiet |
| 8136 | Gattikon | Ja | Adliswil-Naehe (Stark) |
| 8143 | Stallikon | Ja | Birmensdorf-Naehe |
| 8816 | Hirzel | Ja | Horgen-Naehe |
| 8824 | Schoenenberg | Ja | Doerfler Einzugsgebiet (explizit gelistet!) |
| 8825 | Huetten | Ja | Doerfler Einzugsgebiet (explizit gelistet!) |
| 8833 | Samstagern | Ja | Geiger AG Heimatort! |
| 8806 | Baech | Ja | Richterswil-Naehe |
| 8815 | Horgenberg | Ja | Horgen-Naehe |

**Impact:** Wenn Retell die PLZ korrekt extrahiert aber der Ort fehlt oder die STT den Ortsnamen falsch transkribiert, kann die PLZ-Map den Ort NICHT korrigieren. Ergebnis: Case mit PLZ aber ohne (oder falschem) Ortsnamen. Der Techniker sieht "8833" aber keinen Ort.

**Besonders kritisch fuer Geiger AG:** Ihr eigener Heimatort Samstagern (8833) ist NICHT in der Map. Jeder Anrufer aus Samstagern bekommt keinen Auto-Correct.

**Severity:** CRITICAL

**Fix:** PLZ-Map auf alle Gemeinden im Einzugsgebiet aller 12 ICP-Betriebe erweitern (ca. 30-40 Eintraege). Idealerweise aus offizieller Post-CH-Datenquelle.

**CC kann autonom fixen:** Ja — reine Datenerweiterung, kein Founder-Entscheid.

---

### F-04: SMS ueberschreitet 160-Zeichen-Limit systematisch

**Problem:** Die Post-Call-SMS wird zusammengebaut aus:
```
{smsSenderName}: Ihre Meldung wurde aufgenommen. Hier koennen Sie Angaben ergaenzen oder Fotos anfuegen:
{correctionUrl}
```

Die URL allein hat ca. 55-65 Zeichen (`https://flowsight.ch/v/WB-0029?t=a1b2c3d4e5f6g7h8`). Der Textkoerper hat ~100 Zeichen. Total: ~160-175 Zeichen — REGELMÄSSIG ueber dem 160-Char-Limit.

Bei laengeren Firmennamen wird es schlimmer:
- "Doerfler AG" (11 Chars) → ~165 Chars → 2 SMS-Segmente
- "Weinberger AG" (13 Chars) → ~167 Chars → 2 SMS-Segmente
- "Orlandini" (9 Chars) → ~163 Chars → grenzwertig
- "Stark Haustechnik" wuerde nicht passen (>11 Chars, Alphanumeric Sender Max)

**Impact:** eCall berechnet doppelt fuer >160 Chars. Bei 10 Calls/Tag x CHF 0.24 statt 0.12 = CHF 2.40/Tag x 20 Arbeitstage = CHF 48/Monat Mehrkosten pro Betrieb. Ausserdem: 2-Segment-SMS kommen manchmal als 2 separate Nachrichten an — verwirrend fuer den Endkunden.

**Severity:** CRITICAL (Kosten + UX)

**Fix:** SMS-Text kuerzen. Vorschlag: `{sender}: Meldung aufgenommen. Fotos & Korrektur: {url}` (~120 Chars). Oder: URL-Shortener nutzen (aber Vertrauensproblem bei Endkunden).

**CC kann autonom fixen:** Ja — Textaenderung in `postCallSms.ts`.

---

## HIGH Findings

### F-05: Kategorien sind zu schmal fuer Heizungsspezialisten

**Problem:** Die Kategorien im Agent sind fix: `Verstopfung | Leck | Heizung | Boiler | Rohrbruch | Sanitaer allgemein`. Diese decken Sanitaer gut ab, aber:

- **Benzenhofer Heizungen AG** (reiner Heizungsspezialist): Fuer ihn sind 4 von 6 Kategorien irrelevant. Alles landet in "Heizung" — ob Waermepumpe, Fussbodenheizung, Heizkesselersatz oder Thermostatproblem.
- **Doerfler AG** (6 Gewerke): Spenglerei, Solartechnik, Blitzschutz haben KEINE Kategorie. "Meine Dachrinne ist kaputt" → "Sanitaer allgemein"? Falsch.
- **Weinberger AG** (Lueftung): "Die Lueftung macht Geraeusche" → keine passende Kategorie.

**Impact:** Der Techniker sieht "Heizung" und weiss nicht ob es eine Notfall-Reparatur oder eine Beratung fuer Heizungsersatz ist. Bei Doerfler sieht Ramon "Sanitaer allgemein" und muss erst den Fall oeffnen um zu verstehen dass es eigentlich Spenglerei ist.

**Severity:** HIGH

**Fix:** `{{categories}}` Platzhalter im Template ist bereits tenant-spezifisch. Fuer jeden Betrieb muessen die Kategorien aus den realen Leistungen abgeleitet werden. Beispiel Doerfler: `Verstopfung | Leck | Heizung | Boiler | Rohrbruch | Spenglerei | Solartechnik | Sanitaer allgemein`. Template-System unterstuetzt das bereits.

**CC kann autonom fixen:** Ja, pro Betrieb bei Onboarding.

---

### F-06: Reklamationen werden nicht als solche markiert

**Problem:** Lisa erkennt Reklamationen ("wieder kaputt", "nochmal dasselbe") und sagt korrekt "Das tut mir leid, ich nehme das sofort auf." ABER: Das Retell Extraction Schema hat KEIN Feld fuer Reklamation. Der Webhook speichert den Fall als normalen Case. Im Leitsystem sieht er genauso aus wie ein Erstanruf.

**Betroffene Betriebe:** Besonders kritisch fuer:
- Orlandini (3.8 Sterne, 28 Reviews) — jede unbehandelte Reklamation kann eine negative Review werden
- Weinberger (4.4 Sterne) — Reklamation eines Heizungsausfalls in MFH = hoher Imageschaden
- Waelti & Sohn (237 Reviews) — bei dem Volumen passieren Reklamationen regelmaessig

**Impact:** Sandra bei Weinberger sieht einen neuen Fall "Heizung, normal, Thalwil". Sie weiss nicht, dass das eine Reklamation ist, bei der der Kunde schon sauer ist. Kein Priority-Boost, kein "sofort zurueckrufen"-Flag.

**Severity:** HIGH

**Fix:** Neues Extraction-Feld `is_reklamation: boolean` im Retell Agent Schema. Im Webhook: wenn `is_reklamation === true`, automatisch `urgency` auf "dringend" hochstufen und `category` um "[Reklamation]" ergaenzen. Oder: eigenes DB-Feld `is_complaint`.

**CC kann autonom fixen:** Ja — Agent Schema + Webhook-Logik.

---

### F-07: Solo-Betrieb bekommt Push nur bei Notfall — verpasst dringende Faelle

**Problem:** `sendOpsPush` wird NUR bei `urgency === "notfall"` getriggert (Zeile 547-558 in webhook route.ts). Ein "dringender" Fall (Boiler tropft, muss heute noch repariert werden) erzeugt KEINEN Push. Walter Leuthold liegt unter einem Waschbecken, sein Handy vibriert nicht, er schaut erst um 18:00 in den Leitstand.

**Betroffene Betriebe:**
- Walter Leuthold (Solo) — er IST der Betrieb, jede Stunde Verzoegerung = verlorener Kunde
- MPM Haustechnik (2-3 MA) — kein Buero, Chef auf Baustelle
- Benzenhofer (2-4 MA) — nur Handynummer als Kontakt
- Stark Haustechnik — Mobilnummer als Hauptkanal

**Impact:** "Dringend" heisst fuer den Anrufer "heute bitte". Fuer Walter heisst es "ich schau um 18:00". 8 Stunden Verzoegerung. Der Anrufer ruft um 15:00 jemand anderen an.

**Severity:** HIGH

**Fix:** Push-Optionen erweitern: `notify_all_cases` existiert bereits als DB-Feld in `ops_push_subscriptions`. Solo-Betriebe sollten bei Onboarding `notify_all_cases: true` bekommen. Alternativ: Push auch bei "dringend" senden (tenant-konfigurierbar).

**CC kann autonom fixen:** Teilweise — Code-Aenderung ja, aber ob Standard-Push bei "dringend" gewuenscht ist = Founder-Entscheid.

---

### F-08: INTL Agent-ID ist leer im Export-JSON

**Problem:** In `doerfler_agent.json` Zeile 415-416 steht:
```json
"agent_id": "",
"name": "swap_to_intl_agent",
```
Die Agent-ID fuer den Language Transfer Node ist leer. Das INTL-Agent-Swap auf dem Language Transfer Node hat eine leere `agent_id`.

**Klaerung:** Die Exports haben IDs absichtlich leer (Privacy/Portability). `retell_sync.mjs` setzt die echten IDs beim Import. ABER: Wenn jemand den JSON direkt importiert ohne retell_sync, bricht der Sprachwechsel.

**Impact:** Gering im Normalbetrieb (retell_sync ist Standard-Workflow). Risiko bei manuellem Import oder neuem Team-Mitglied.

**Severity:** HIGH (weil ein Fehler = 100% Sprachwechsel-Ausfall)

**Fix:** Dokumentation in Export-README. Alternativ: retell_sync.mjs validieren, dass nach Import alle agent_ids gesetzt sind.

**CC kann autonom fixen:** Ja.

---

### F-09: Hangup mid-call erzeugt defekte Faelle

**Problem:** Wenn ein Anrufer mitten im Gespraech auflegt (nach 30 Sekunden, waehrend Lisa nach der Adresse fragt), passiert folgendes:
1. Retell beendet den Call
2. Retell fuehrt Post-Call-Analysis durch (GPT-4.1-mini)
3. Webhook empfaengt `call_analyzed` mit Partial Data
4. Case wird erstellt mit dem was da ist

Beispiel: Anrufer sagt "Mein WC ist verstopft" → Lisa: "Wie lautet die Adresse?" → *Anrufer legt auf*
→ Case: category="Verstopfung", plz="", city="", street="", urgency="normal" (Default), description="WC verstopft"

Dieser Fall ist nutzlos — kein Ort, keine Kontaktmoeglichkeit (Anrufer hat aufgelegt bevor SMS-Hinweis kam).

**Impact:** Der Leitstand zeigt Faelle ohne Adresse. Sandra muss sie manuell schliessen oder ignorieren. Bei 5% Hangup-Rate (branchenueblich) und 20 Calls/Tag bei Weinberger = 1 defekter Fall/Tag.

**Hinweis:** Der `hasRealContent`-Check (Zeile 617: `defaulted.length < 3`) faengt das TEILWEISE ab. Wenn 3+ Felder defaults sind, wird keine SMS gesendet. Der Case wird aber trotzdem erstellt.

**Severity:** HIGH

**Fix:** Zusaetzlicher Quality Gate: Wenn KEIN PLZ UND KEIN City UND KEIN Street vorhanden, den Case als `status: "unvollstaendig"` markieren oder gar nicht erstellen. Der Anrufer hat seine Telefonnummer (from_number) — ein Rueckruf waere moeglich, aber ohne Kontext schwierig.

**CC kann autonom fixen:** Teilweise — Logik im Webhook. Ob unvollstaendige Faelle trotzdem erstellt werden sollen = Founder-Entscheid.

---

### F-10: Concurrent-Call-Limit bei Retell ist unbekannt/undokumentiert

**Problem:** Es ist nirgends dokumentiert, wie viele gleichzeitige Calls der Retell-Plan unterstuetzt. Der Voice Debug Runbook erwaehnt `SIP 486 Busy` als moeglichen Fehler (Zeile 48), aber der aktuelle Plan-Limit ist unbekannt.

**Betroffene Betriebe:**
- Weinberger AG — Montagmorgen 07:30: 5 Anrufe gleichzeitig nach Wochenend-Pikett
- Waelti & Sohn — hohes Volumen, 20+ Einsaetze/Tag
- Jeder Betrieb nach einem Feiertags-Wochenende (Stau-Effekt)

**Impact:** Wenn 3 Anrufer gleichzeitig bei Weinberger anrufen und das Retell-Limit bei 2 liegt, hoert der 3. Anrufer: Besetztzeichen. Kein Fallback (siehe F-02). Der Anrufer mit dem Rohrbruch ruft die Konkurrenz an.

**Severity:** HIGH

**Fix:** 1) Retell Dashboard pruefen: aktuelles Concurrency Limit. 2) Cost Triggers in `cost_triggers.md` ergaenzen. 3) Bei >5 Betrieben: Retell Plan Upgrade auf hoehere Concurrency.

**CC kann autonom fixen:** Nein — Retell Dashboard + Plan-Entscheid = Founder.

---

### F-11: Kein Duplicate-Call-Schutz

**Problem:** Wenn ein Anrufer 2x hintereinander anruft (z.B. weil er vergessen hat, die Hausnummer zu nennen), entstehen 2 separate Faelle im Leitsystem. Es gibt keinen Mechanismus, der erkennt: "Gleiche Telefonnummer, gleiches Problem, innerhalb von 5 Minuten."

**Betroffene Betriebe:** ALLE, besonders:
- Solo-Betriebe (Leuthold, MPM) — wenige Faelle, jeder Duplikat faellt auf
- Grosse Betriebe (Weinberger, Waelti) — bei hohem Volumen werden Duplikate leicht uebersehen

**Impact:** Die Disponentin sieht 2 Faelle fuer dasselbe Problem. Schlimmstenfalls werden 2 Techniker geschickt.

**Severity:** MEDIUM-HIGH

**Fix:** Deduplication-Logik im Webhook: Wenn `from_number` + `to_number` innerhalb der letzten 5 Minuten bereits einen Case erzeugt hat, den neuen Case als "Nachtrag" an den bestehenden anhaengen (oder als Event loggen).

**CC kann autonom fixen:** Ja — Webhook-Logik + DB-Query.

---

## MEDIUM Findings

### F-12: Name-STT-Qualitaet bei Schweizer Namen

**Problem:** Die Namen-Regel im Prompt ist vorbildlich ("NIEMALS den Namen wiederholen"). Aber Retell/ElevenLabs transkribieren ueber `de-DE`, nicht `de-CH`. Typische Schweizer Namen werden systematisch falsch erfasst:
- "Metzger" → "Metzke" oder "Metzger" (ok)
- "Buehlmann" → "Bühlmann" (ß/ss Problem, wird von `deCH()` gefixt)
- "Rueegsegger" → unklar
- "Glaettli" → "Glättli" (wird gefixt)

**Impact:** Reporter-Name im Fall ist fuer den Techniker unbrauchbar wenn stark verzerrt. Aber: Name ist best-effort, kein Blocker. Die SMS-Korrekturseite erlaubt Korrektur.

**Severity:** MEDIUM

**Fix:** Kein direkter Fix moeglich (STT-Limitation). Langfristig: Custom Vocabulary bei Retell/Deepgram fuer haeufige Schweizer Nachnamen.

---

### F-13: Hausnummer-Normalisierung ist limitiert

**Problem:** `normalizeHouseNumber()` konvertiert nur deutsche Zahlwoerter 1-20. Schweizer Hausnummern koennen aber sein:
- "12a" → funktioniert (pass-through)
- "einunddreissig" → NICHT konvertiert (nur 1-20 abgedeckt)
- "zweihundertsieben" → NICHT konvertiert

**Impact:** Gering — die meisten Anrufer sagen die Zahl direkt, nicht als Wort. Und STT transkribiert Zahlen meist korrekt.

**Severity:** MEDIUM

**Fix:** Erweitern auf 1-200 oder Regex-basiertes Parsing.

---

### F-14: Elderly Anrufer unter Zeitdruck (Reminder nur 1x nach 10s)

**Problem:** `reminder_trigger_ms: 10000` + `reminder_max_count: 1` bedeutet: Wenn der Anrufer 10 Sekunden schweigt, fragt Lisa einmal nach. Danach: Stille. Bei aelteren Anrufern, die laenger zum Formulieren brauchen, kann das dazu fuehren dass Lisa "wartet" und der Anrufer denkt, die Leitung sei tot.

**Betroffene Betriebe:** Besonders Traditionsbetriebe mit aelterer Stammkundschaft:
- Doerfler AG (100 Jahre, Stammkunden seit Generationen)
- Weinberger AG (114 Jahre)
- Orlandini (seit 1972)

**Impact:** Aeltere Person ruft an, beschreibt langsam das Problem, Pause zum Nachdenken, Lisa fragt einmal "Sind Sie noch da?", dann Stille. Person legt verwirrt auf.

**Severity:** MEDIUM

**Fix:** `reminder_max_count: 2` und zweiten Reminder freundlicher: "Nehmen Sie sich ruhig Zeit, ich bin noch da." Oder `reminder_trigger_ms: 15000` fuer mehr Geduld.

**CC kann autonom fixen:** Ja — Agent-Konfiguration.

---

### F-15: Callback-Anrufer haben keine Referenz auf den alten Fall

**Problem:** Lisa erkennt Rueckruf-Wuensche ("Kann mich jemand zurueckrufen?") und nimmt sie auf. Aber wenn jemand zurueckruft weil der erste Fix nicht funktioniert hat, gibt es keinen Mechanismus, den neuen Fall mit dem alten zu verknuepfen.

"Ihr Techniker war gestern bei mir wegen der Heizung, aber jetzt ist es wieder kalt" → Neuer Case, ohne Bezug zum gestrigen.

**Betroffene Betriebe:** Alle mit Reparaturservice, besonders:
- Doerfler (Reparaturservice explizit gelistet)
- Orlandini (3.8 Sterne — Reklamationen erfordern Kontext)

**Severity:** MEDIUM

**Fix:** Langfristig: "Bestehender Auftrag"-Erkennung mit Caller-ID-basiertem Lookup. Kurzfristig: Lisa koennte fragen "Haben Sie eine Fallnummer erhalten?" und diese in der Description speichern.

---

### F-16: Schweizerdeutsch-ASR-Risiko bei PLZ und Ortsnamen

**Problem:** Retell nutzt `de-DE` ASR. Schweizerdeutsche Aussprache weicht ab:
- "Oberriede" (Zuerituetuetsch) statt "Oberrieden"
- "Taalwil" statt "Thalwil"
- "Achttusigachthundert" (8800) → wird meist korrekt als Zahl erkannt

Die PLZ-Map (`plzCityMap.ts`) korrigiert den Ortsnamen WENN die PLZ korrekt extrahiert wurde. Aber wenn nur der Ortsname ohne PLZ gesagt wird, gibt es keinen Fallback.

**Impact:** In den meisten Faellen gutartig — PLZ + Map-Korrektur funktioniert. Aber bei starkem Dialekt (Walliserdeutsch, Berndeutsch) kann auch die PLZ falsch transkribiert werden.

**Severity:** MEDIUM

**Fix:** Prompt-Instruktion ist bereits gut ("NICHT bestätigen", "NICHT vorlesen"). Langfristig: Fuzzy-Matching auf Ortsnamen im Webhook.

---

### F-17: Nacht-Anrufer-UX bei Betrieben ohne 24h-Notdienst

**Problem:** Die Oeffnungszeiten sind tenant-spezifisch konfiguriert. Lisa sagt korrekt "Unser Buero ist geschlossen, aber der Notdienst ist erreichbar." ABER: Lisa kann nicht unterscheiden zwischen einem echten Notfall um 23:00 und einer Routineanfrage. Sie nimmt beides auf.

**Betroffene Betriebe:**
- Beeler Haustechnik — keine Notdienst-Info bekannt
- Benzenhofer — keine Notdienst-Info bekannt
- Schaub — unklar

Wenn diese Betriebe KEINEN Notdienst haben: Lisa nimmt trotzdem den "Notfall" auf, Endkunde bekommt SMS "Ihre Meldung wurde aufgenommen" und erwartet Reaktion. Niemand kommt.

**Severity:** MEDIUM

**Fix:** `{{emergency_policy}}` Platzhalter muss pro Betrieb KORREKT ausgefuellt sein. Bei Betrieben ohne Notdienst: Lisa sagt "Unser Buero ist geschlossen. Bitte rufen Sie morgen ab [Uhrzeit] wieder an. Bei einem echten Notfall rufen Sie bitte die Feuerwehr (118) oder einen Notdienst-Installateur."

**CC kann autonom fixen:** Teilweise — Template ist da, aber Betriebsdaten muessen vom Founder verifiziert werden.

---

### F-18: Angebots-Kategorie fehlt im System

**Problem:** Lisa erkennt Angebotsanfragen ("Badsanierung", "Offerte", "Kostenvoranschlag") korrekt und behandelt sie speziell. Aber die Extraction-Kategorien haben kein "Angebot/Offerte". Das Angebot wird als z.B. "Sanitaer allgemein" kategorisiert.

**Betroffene Betriebe:** Besonders Betriebe mit Sanierungs-Geschaeft:
- Weinberger AG (Badsanierung als Kernleistung)
- Doerfler AG (Badezimmer-Renovationen)
- Orlandini (Beratung & Planung)

**Impact:** Der Disponent sieht "Sanitaer allgemein, normal, Thalwil" und weiss nicht, dass das eine potenzielle CHF 30'000 Badsanierung ist, die einen Beratungstermin braucht — kein Techniker-Einsatz.

**Severity:** MEDIUM

**Fix:** Kategorie "Offerte/Beratung" zum Category-Set hinzufuegen. Template unterstuetzt das bereits ueber `{{categories}}`.

---

### F-19: Werbeanrufe und Bots erzeugen Kosten

**Problem:** Werbeanrufe (Telefonmarketing, Robocalls) die laenger als 25 Sekunden dauern, passieren den Duration-Gate und erzeugen einen Case. Lisa fuehrt hoeflich ein Gespraech, versucht den "Schaden" aufzunehmen. Retell-Kosten: ~$0.10-0.15/Minute. Bei 1-2 Werbeanrufen/Tag × 2 Minuten = $0.20-0.60/Tag.

**Impact:** Gering bei einzelnen Betrieben. Bei 50 Betrieben: $10-30/Tag nur fuer Werbeanrufe.

**Severity:** MEDIUM

**Fix:** `out_of_scope` Detection ist bereits implementiert. Zuverlaessigkeit pruefen. Langfristig: Caller-ID-basierte Blockliste.

---

### F-20: Info-Call sendet SMS (wenn genug "Real Content" vorhanden)

**Problem:** Ein Info-Call, bei dem der Anrufer zufaellig seine PLZ nennt ("Liefern Sie auch nach 8800 Thalwil?"), hat 2+ "reale" Felder (PLZ, City) und passiert den `hasRealContent`-Check. Ergebnis: Der Anrufer bekommt eine SMS "Ihre Meldung wurde aufgenommen" — obwohl er nur eine Frage gestellt hat.

**Severity:** MEDIUM

**Fix:** Korrigiert sich mit F-01 Fix (call_type Gate).

---

## LOW Findings

### F-21: max_call_duration 7 Minuten kann knapp werden

**Problem:** `max_call_duration_ms: 420000` (7 Min). Ein aelterer Anrufer mit komplexem Problem (Reklamation + neues Problem + Oeffnungszeiten-Frage) kann laenger brauchen. Lisa wird nach 7 Minuten einfach abgeschnitten.

**Impact:** Selten (<1% der Calls). Aber wenn es passiert, ist es maximal aergerlich fuer den Anrufer.

**Severity:** LOW

**Fix:** Auf 10 Minuten erhoehen (600000ms). Retell-Kosten sind per-Minute, kein Unterschied ob Limit 7 oder 10 ist.

---

### F-22: Competitor-Fishing ist harmlos aber erzeugt Faelle

**Problem:** Ein Konkurrent ruft an und fragt systematisch nach Preisen, Kapazitaeten, Teamgroesse. Lisa antwortet korrekt aus dem FIRMEN-WISSEN (das sind oeffentliche Daten). Der Call erzeugt einen Info-Case (siehe F-01).

**Impact:** Vernachlaessigbar. Die Informationen sind ohnehin oeffentlich.

**Severity:** LOW

---

### F-23: Kind ruft an — System funktioniert, aber UX ist komisch

**Problem:** "Papa ist nicht da und es laeuft Wasser aus dem Hahn!" Lisa reagiert korrekt: "Das klingt dringend. Drehen Sie als Erstes den Haupthahn zu." Aber Lisa fragt dann nach PLZ, Adresse, Name — ein Kind kann das oft nicht beantworten.

**Impact:** Lisa faengt das ab ("Kein Problem, dann machen wir ohne weiter"). Der Fall wird mit Partial Data erstellt. Die Telefonnummer des Kindes (Eltern-Handy?) ermoeglicht Rueckruf.

**Severity:** LOW — System ist robust genug.

---

### F-24: Falsche Firma angerufen

**Problem:** "Sind Sie der Gartenbauer?" → Lisa: "Nein, dafuer sind wir leider nicht zustaendig." → `out_of_scope = true` → Freundliche Verabschiedung. Funktioniert korrekt.

**Impact:** Keiner — korrekt behandelt.

**Severity:** LOW

---

### F-25: Hintergrundlaerm / Anrufer im Auto

**Problem:** ASR-Qualitaet sinkt bei Hintergrundlaerm. "Seestrasse 12" wird vielleicht "Seestrasse zwölf" oder "Seeschrasse". PLZ-Erkennung (4 Ziffern) ist robuster als Strassennamen.

**Impact:** Partial Data. SMS-Korrekturseite faengt das auf.

**Severity:** LOW

---

## Szenario-Durchspielung: Stress-Montag pro Groessenklasse

### Solo-Betrieb: Walter Leuthold (1 MA)

**Montag 06:45 — Walter checkt Handy:**
3 Anrufe in Abwesenheit vom Wochenende. Lisa hat alle 3 beantwortet.
- Call 1 (Sa 14:00): Routineanfrage Boilerentkalkung → Case erstellt mit PLZ+Beschreibung ✓
- Call 2 (Sa 19:00): Notfall Rohrbruch → Case + Push auf Walters Handy ✓ ...aber Walter war wandern, hat Push erst So morgens gesehen. **Problem: 14h Verzoegerung bei Notfall.** Der Anrufer hat laengst jemand anderen gerufen.
- Call 3 (So 08:00): Oeffnungszeiten-Frage → **Phantom-Fall im Leitsystem (F-01)**

**08:30 — Notfall auf Baustelle:**
Walters Handy klingelt — neuer Anrufer. Lisa nimmt an. "Wasser laeuft im Keller!" → Case wird erstellt, urgency=notfall, Push geht raus. Walter sieht Push sofort (Handy in der Tasche). **Problem: Walter ist auf einer Baustelle, kann nicht weg.** Keine Stellvertretung.

→ **System funktioniert technisch, aber loest Walters Grundproblem nicht:** Er ist eine Person. Das System macht ihn erreichbar, aber nicht verfuegbar.

### Klein-Betrieb: Doerfler AG (4-5 MA)

**Montag 07:30 — Ramon und Luzian fahren los:**
Lisa ist aktiv. 3 Anrufe kommen zwischen 07:30-09:00.
- Call 1: "Boiler tropft" → Case, dringend, Oberrieden. ✓ Email an info@doerflerag.ch ✓
- Call 2: "Sprechen Sie Italienisch?" → Agent Swap zu INTL Agent ✓. Case wird vom INTL Agent analysiert (`post_call_analysis_setting: only_destination_agent`). ✓
- Call 3: "Meine Dachrinne ist undicht" → Kategorie "Sanitaer allgemein" **FALSCH (F-05)** — muesste "Spenglerei" sein. Luzian sieht den Fall, versteht aber nicht sofort, dass es fuer ihn ist.

**12:00 — Mittagspause:**
Ramon checkt Leitstand auf Handy: 5 Faelle, davon 1 Phantom (F-01). 4 echte. Davon 1 ohne PLZ weil Anrufer aufgelegt hat (F-09). Brauchbar: 3 von 5 Faellen.

### Mittel-Betrieb: Orlandini (6-10 MA)

**07:30 — Anastasia oeffnet Buero:**
6 neue Faelle seit gestern Abend (Anastasia-Vertretung durch Lisa).
- 2 Info-Calls → 2 Phantom-Faelle (F-01)
- 1 Reklamation "Heizung funktioniert immer noch nicht" → Als normaler Fall markiert, KEINE Reklamations-Kennzeichnung (F-06). Anastasia muss jeden Fall einzeln lesen.
- 1 Notfall um 22:00 → Case + Push. Aber Anastasia hat nachts kein Push aktiviert. Erster Kontakt mit dem Kunden: 07:30 am naechsten Tag. **9.5h Verzoegerung.**
- 2 Standard-Faelle → korrekt

**10:00 — Telefon-Stau:**
3 Anrufe gleichzeitig. Retell Concurrency: unbekannt (F-10). Wenn Limit = 2: 1 Anrufer hoert Besetzt.

### Gross-Betrieb: Weinberger AG (15-25 MA)

**07:00 — Morgen-Briefing:**
Sandra oeffnet Leitstand: 12 neue Faelle vom Wochenende.
- 4 Info-Calls → 4 Phantom-Faelle (F-01) — Sandra muss alle 12 durchgehen um die echten 8 zu finden
- 1 Angebots-Anfrage Badsanierung (CHF 40'000 Potenzial) → kategorisiert als "Sanitaer allgemein, normal" (F-18). Sandra priorisiert den Fall NICHT.
- 1 Reklamation → als normaler Fall (F-06)
- 2 Duplicate Calls (selber Anrufer, 2x angerufen) → 2 Faelle (F-11)
- 4 echte Faelle → korrekt

**Ergebnis:** Von 12 Faellen im Leitsystem sind 8 relevant, davon 2 Duplikate. Sandra muss effektiv 6 echte Faelle aus 12 Eintraegen herausfischen. **Triage-Aufwand: 15-20 Minuten statt 5 Minuten.** Bei 25-30 Kontakten/Tag wird das zum taeglichen Frust.

---

## Technische Pipeline: End-to-End Failure Points

```
Anrufer → Twilio SIP → Retell Agent → [Gespraech] → call_analyzed → Webhook
                                                                       ↓
                                                          ┌─── Supabase Case INSERT
                                                          ├─── Email (Resend)
                                                          ├─── SMS (eCall)
                                                          └─── Push (Web Push)
```

| Failure Point | Was passiert | Erkennung | Recovery |
|--------------|-------------|-----------|----------|
| **Twilio SIP down** | Kein Klingeln. Anrufer hoert Fehler-Ton. | Morning Report (kein Case = kein Signal) | Manuell. Kein Auto-Failover. |
| **Retell down** | SIP 503. Anrufer hoert Besetzt/Fehler. | voice_debug Runbook, Retell Status Page | Manuell. Kein Fallback (F-02). |
| **Retell busy** | SIP 486. Anrufer hoert Besetzt. | Sentry (nicht konfiguriert fuer SIP 486) | Kein Retry. Anrufer muss nochmal anrufen. |
| **Webhook Timeout** | Vercel 30s Timeout. Case nicht erstellt. | Sentry `UNEXPECTED` Error | RED Alert via Notify. Fall verloren. |
| **Supabase slow/down** | DB Insert failed. | Sentry + RED Alert `CASE_CREATE_FAILED` | Founder muss manuell eingreifen. Case VERLOREN. |
| **Resend down** | Case erstellt, keine Email. | Sentry + RED Alert `EMAIL_DISPATCH_FAILED` | Case existiert im Leitstand, Email fehlt. |
| **eCall SMS down** | Case erstellt, Email geht, SMS fehlt. | Sentry `post_call_sms_failed` | Kein RED Alert fuer SMS-Fail! Nur Sentry Warning. |
| **Push Service down** | Case erstellt, Push fehlt. | Kein Alert (best-effort) | Stiller Ausfall. Betrieb merkt es nicht. |

**Kritischster Punkt:** Supabase-Ausfall. Kein Case, kein SMS, kein Push. Der Anrufer bekommt die Verabschiedung "Sie erhalten gleich eine SMS" — aber die SMS kommt nie. Der Betrieb erfaehrt davon erst ueber den RED Alert. Der Anrufer denkt, sein Anliegen wurde aufgenommen.

---

## Recommendations: Top 5 Fixes (Prioritaetsreihenfolge)

| # | Finding | Aufwand | Impact | Empfehlung |
|---|---------|---------|--------|------------|
| 1 | **F-01: Info-Call Gate** | 2h | Eliminiert Phantom-Faelle fuer ALLE Betriebe | CC autonom, sofort |
| 2 | **F-04: SMS kuerzen** | 30min | Halbiert SMS-Kosten, bessere UX | CC autonom, sofort |
| 3 | **F-03: PLZ-Map erweitern** | 1h | Korrekte Ortszuordnung fuer alle ICP-Betriebe | CC autonom, sofort |
| 4 | **F-06: Reklamation markieren** | 3h | Kritisch fuer Betriebe mit Reviews-Problem | CC autonom, sofort |
| 5 | **F-02: Retell Fallback** | 4h+ | Versicherung gegen Totalausfall | Founder-Entscheid noetig |

---

## Appendix: ICP-spezifische Risikomatrix

| Betrieb | Groesse | Top-Risiken | Schlimmster Montag |
|---------|---------|-------------|-------------------|
| Walter Leuthold | Solo | F-02 (kein Fallback), F-07 (nur Notfall-Push) | Lisa nimmt 3 Calls an, Walter sieht sie erst abends. 2 Kunden bereits bei Konkurrenz. |
| MPM Haustechnik | Micro | F-02, F-07, keine Website → Voice ist ALLES | Jeder verpasste Call = 100% Lost. Kein Backup-Kanal. |
| Doerfler AG | Klein | F-05 (Spenglerei fehlt), F-01 (Phantom-Faelle) | Luzian sieht "Sanitaer allgemein" und ignoriert seinen Spenglerei-Fall. |
| Beeler | Klein | F-17 (kein Notdienst?) | Nachts-Notfall: SMS geht raus, niemand kommt. Kunde wartet bis morgen. |
| Benzenhofer | Klein | F-05 (nur "Heizung"), F-17 | Alle Faelle heissen "Heizung". Kein Differenzierung. |
| Orlandini | Mittel | F-01 (Phantom bei 12-15 Calls/Tag), F-06 (Reklamation bei 3.8★) | Anastasia oeffnet Leitstand: 8 Faelle, davon 3 Phantom. 1 uebersehene Reklamation → negative Google Review. |
| Schaub | Mittel | F-01, F-10 (Concurrency bei 15+ Kontakten) | 3 gleichzeitige Anrufe → 1 hoert Besetzt. |
| Leins AG | Mittel | F-01, F-18 (Offerten als "allgemein") | Potenzielle Badsanierung wird als Routine-Fall triagiert. |
| Stark | Mittel | F-07 (Mobil = Hauptkanal), F-10 | Inhaber auf Baustelle, Push nur bei Notfall, dringende Faelle warten 6h. |
| Weinberger AG | Gross | F-01 (bei 25-30 Calls = 5-8 Phantom/Tag), F-06, F-10, F-11 | Sandra braucht 20 Min fuer Triage statt 5. 1 versteckte Reklamation. 2 Duplikate. |
| Waelti & Sohn | Gross | F-01, F-10, F-11 | 20+ Faelle, davon 4-5 Phantom. Bei 237 Reviews: jede Reklamation zaehlt. |
| Geiger AG | Gross | F-03 (Samstagern fehlt in PLZ-Map!), F-01 | Anrufer aus dem Heimatort des Betriebs hat keinen Auto-Correct. |

---

*Erstellt: 2026-04-15 | Methode: Code-Review + ICP-Profil-Durchspielung | Naechster Schritt: Top 5 Fixes umsetzen*
