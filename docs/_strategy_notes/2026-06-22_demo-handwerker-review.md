# Demo-Vorschau — Handwerker-Review (1–3-Mann-Sanitär) + Architektur-Check

> **STATUS: REVIEW (2026-06-22)** — autonom erstellt, während Founder am See.
> Brille: Vertriebsleiter, der den CH-Handwerksmarkt 1–3 Mann jahrelang durchgespielt hat.
> Frage: Ist es **Handwerkersprache**, **unmissverständlich**, **stimmig** — und trägt die **Architektur**?
> Betrifft: `src/web/app/demo-vorschau/` (`/demo-vorschau`, noindex Review-Route).

## Verifikation (was technisch geprüft ist)
- **ESLint** (wie CI, `--max-warnings 0`): sauber ✅
- **TypeScript** (`tsc --noEmit`): fehlerfrei ✅
- **Laufzeit**: `next dev` → `/demo-vorschau` liefert **HTTP 200**, alle Dauertexte im HTML ✅
- **Screenshots: NICHT möglich** in dieser Sandbox — der Browser-Download (`cdn.playwright.dev`)
  ist per Netzwerk-Allowlist geblockt (403). Ehrlich statt gefakt. Visuelle Abnahme bitte direkt
  auf `https://flowsight.ch/demo-vorschau` (Handy + Monitor).

---

## A) Was ich direkt verbessert habe (angewandt)
Sichere Klarheits-/High-End-Fixes — keine Founder-Entscheidung nötig:

1. **„Fall/Fälle" → „Auftrag/Anfrage".** „Fall" ist Versicherungs-/Behörden-Sprech und kalt.
   Ein Sanitär hat **Aufträge** und **Anfragen**. (Vor-Ort-Karte, Lisa-Notfall-Notiz.)
2. **„aufnehmen" entschärft, wo es nach Tonaufnahme klingt.** „Lisa nimmt den Anruf … auf"
   → „Lisa geht ans Telefon … **hält das Anliegen sauber fest**". Recording ist OFF — die Sprache
   darf das nicht andeuten. („einen Auftrag aufnehmen" bleibt — das ist sauberes Handwerk-Deutsch.)
3. **Emoji-Icons → eigene Linien-SVG-Icons** (Telefon · Globus · Klemmbrett) in Gold.
   Emoji sehen je nach Gerät unterschiedlich/billig aus; eigene Icons = konsistent, high-end,
   gleiche Bildsprache wie LeitsystemIcon/LisaAvatar. Das **Klemmbrett** für „Vor Ort" trifft
   den Punkt besser als die Tür 🚪 (= das digitale Pendant zum Zettel).
4. **„Kanäle" → „Eingänge"** (durchgehend konsistent; die Überschrift sagte schon „Eingänge").
   „Eingang" = da, wo Arbeit reinkommt. Konkreter als das Marketing-Wort „Kanal".
5. **„kein IT-Projekt" zurückgeholt** (als **Beruhigung**, nicht als Last):
   „Eingerichtet ist es schnell — kein IT-Projekt, alles läuft auf Ihrem Handy."
   Beim letzten Wording-Fix war diese wichtige Angst-Nahme verloren gegangen.
6. **Lisa-Intro entschärft:** „reagiert auf fünf **Feldern**" → „in fünf **Situationen**";
   „So sieht der **Start-Zustand** aus" → „So ist sie **von Anfang an eingestellt**".
7. **Kleinkram:** „strukturiert" → „ordentlich aufgelistet"; „Wochen-Rapport, der den Wert zeigt"
   → „ein Wochen-Rückblick: was reinkam und was Sie geschafft haben"; „tippen Sie für Details"
   (nur Handy) → „öffnen Sie jeden Eingang" (geräteneutral); „nach Ihrer Wunsch-Zeit" →
   „erst nach der Zeit, die Sie festlegen"; ✋-Emoji aus dem Badge raus (cleaner/premium).

---

## B) Step-by-step durch die Seite (Handwerker-Brille)
Bewertung je Element: ✅ klar · ⚠️ verbessert (oben) · ❓ Founder-Entscheidung (unten).

**Hero**
- „Grüezi Herr Muster — bei Ihnen geht kein Auftrag mehr verloren." ✅ Stark, Schmerz sofort, Schweizer Ton.
- Unterzeile (jetzt): „… jede Anfrage wird sauber festgehalten, und Sie sehen jederzeit, was noch offen ist." ⚠️ klarer als „läuft sichtbar weiter".
- „In 90 Sekunden sehen Sie …" ✅ (echtes 90-s-Video fehlt noch — Platzhalter).

**Karte (3 Eingänge → Leitsystem)**
- „Drei Eingänge, ein Überblick" ✅ Konkret, merkbar.
- Lisa-Karte: „Geht ans Telefon, wenn Sie nicht können" ⚠️ konkreter Schmerz statt „Telefon-Assistentin".
- Website-Karte: „Anfragen über Ihre Website — rund um die Uhr" ✅.
- Vor-Ort-Karte: „Aufträge, die Sie unterwegs aufnehmen" + Klemmbrett-Icon ⚠️.
- „Sie steuern das"-Badge: ✅ Aussage klar — aber 4× auf der Seite (siehe ❓2).
- Hub „Ihr Leitsystem / auf Handy und Computer — alles sichtbar an einem Ort" + Gold-Glow ✅ visuell,
  ❓1 zum Wort „Leitsystem".

**Lisa-Tiefe (Konstellation)**
- „Lisa ist kein starrer Anrufbeantworter." ✅ Genialer Anker — jeder kennt den Anrufbeantworter.
- Die 5 Sterne + Klartext-Notizen ✅ konkret, beweisen „sie reagiert kontrolliert".
- „stellt nicht blind durch, sondern hält die Anfrage fest" ✅ — wichtig, nimmt die Angst.

**Schluss-Beat**
- „Sie bestimmen selbst … kein IT-Projekt, alles läuft auf Ihrem Handy. Falsch machen können Sie
  dabei nichts. Es bleibt Ihr System, nach Ihren Regeln." ✅ Kontrolle **ohne** Aufbau-Last.

---

## C) Founder-Entscheidungen (NICHT eigenmächtig geändert)

**❓1 — Das Wort „Leitsystem".** Kernbegriff (CLAUDE.md), aber: Ein 1-Mann-Sanitär hört „Leitsystem"
evtl. als *Wegweiser-/Elektro-Begriff* — nicht als „mein Überblick". Aktuell durch den Untertitel
(„alles sichtbar an einem Ort") abgefedert. **Optionen:** (a) lassen + immer demystifizieren,
(b) im Kundentext weicher („Ihre Übersicht", „Ihr Posteingang für Aufträge") und „Leitsystem"
nur als Marke im Hintergrund. **Meine Empfehlung: (a)** — aber prüfen, ob es beim echten Anruf zündet.

**❓2 — „Sie steuern das" (4×).** „Steuern/konfigurieren" kann beim 1-Mann die **Angst „noch ein
Tool, das ich bedienen muss"** auslösen — genau das, was du beim Schluss-Beat zu Recht abgelehnt hast.
**Optionen:** Wort lassen / auf „Sie bestimmen" wechseln (wärmer) / Badge auf 1–2 Stellen reduzieren
statt 4×. **Empfehlung: auf 2× reduzieren** (Hub + Lisa) und ggf. „Sie bestimmen das".

**❓3 — Gewicht von „Vor Ort".** Für einen **1-Mann** ist der verpasste **Anruf** der Hauptschmerz
(er ist ja den ganzen Tag vor Ort). „Vor Ort aufnehmen" ist nett, aber zweitrangig — der Zettel-Schmerz
ist real, aber kleiner. Aktuell stehen die 3 Eingänge **gleichwertig**. **Empfehlung:** Lisa visuell
**führen** lassen (sie ist die Erlösung), Website/Vor-Ort als Unterstützung. → siehe Architektur-Punkt.

**❓4 — Lead-Fall im Hero.** Noch offen: Rohrbruch/Notruf (emotional, dein Favorit) vs. neutraler
Brot-und-Butter-Auftrag. Empfehlung: **Notruf als Default**, „wo es passt" (config pro Betriebstyp, M5).

---

## D) Architektur — trägt die Idee? (einen Schritt zurück)

**Verdict: Ja, im Kern stimmig — mit einer Schärfung.**

Trägt:
- Cold-Call-first → personalisierte Seite → 90-s-Beweis → **erkundbare** Karte (kein Video-Stapel).
  Respektiert den Handwerker (er klickt, was ihn interessiert) und bereitet Stern 5 vor (M1).
- Eine visuelle Sprache für Demo **und** Cockpit (Konstellation, M2) = Wiedererkennen „mein System".
- „Sie steuern das" + Lisas Sterne entschärfen Einwände **vorab** (M3).

Schärfung (die wichtigste Erkenntnis):
- **Emphase nach Betriebsgröße flexen (M5-Winkel).** Die *gleiche* Architektur, aber:
  - **1-Mann:** Lisa-forward. Wert = „**jeder Anruf erreicht mich**, nichts vergessen." Der „System/
    Überblick"-Teil ist Nebensache — nicht überbetonen, sonst klingt es nach Overhead.
  - **2–3-Mann:** Überblick/Koordination wird wertvoller (wer macht was). Da darf der Leitsystem-Hub
    stärker nach vorn.
  - → Das ist **Config, kein neuer Code** (passt zur Matrix-Strategie). Konkreter Vorschlag:
    `tenant_config` bekommt ein Feld `groesse` → steuert Reihenfolge/Gewicht der Eingänge + Hero-Fall.

Risiko, das ich sehe:
- **Über-Systematisierung.** „Leitsystem / System / steuern / konfigurieren" — in Summe kann das einen
  reinen 1-Mann abschrecken („ich will nur, dass mein Telefon abgenommen wird"). Gegenmittel ist schon
  drin (kein IT-Projekt, läuft auf dem Handy, Lisa-Anker) — aber im Blick behalten beim echten Anruf.

---

## E) Offen / nächste Schritte (Vorschlag, Reihenfolge)
1. **Founder-Calls ❓1–❓4** (oben) — kurze Antworten, dann ziehe ich's nach.
2. **Größen-Flex (D)** als `tenant_config.groesse` — Lisa-forward für 1-Mann.
3. Schicht-2-Karte optional von Cards → radiales 3-Eingänge-Sternbild (wie die Lisa-Konstellation).
4. Echte Clips (alle neu aufgenommen) pro Eingang verdrahten; Hero-Video.
5. Klick-Tracking pro Eingang (M1) → Morning-Report-Signal vor dem warmen Anruf.
6. Cockpit später auf dieselbe `Constellation.tsx` zeigen (M2-Dedup) — **mit Founder**, BigBen-Verify.
