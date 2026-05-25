# Loom-CTA v2 — Verschärfung des Closing-Satzes

**Status:** Vorschlag (25.05.2026, Post-Reise).
**Aktueller Stand:** `speakflow_template.md` Z497-512 enthält die weiche v1.
**Cascade:** Audio-Take 4 (= Closing-Audio) wurde mit v1-Text aufgenommen. Re-Recording bei Founder-Approve.

---

## Problem v1 (Mom-Test-Verletzung)

> "Wenn Sie sich dabei an ein, zwei Stellen gedacht haben: ja, das würde bei uns wirklich helfen — dann schreiben Sie mir einfach kurz zurück. Und wenn Sie sagen, das ist nichts für uns, ist das natürlich auch völlig okay. Dann wäre ich Ihnen für eine ehrliche Rückmeldung genauso dankbar."

**Was nicht funktioniert:**
1. **Initiativlast beim Empfänger:** "Schreiben Sie mir zurück" — niemand antwortet auf solche offenen Einladungen.
2. **Doppelte Höflichkeits-Schleife:** "wenn Sie sagen, das ist nichts für uns, völlig okay" — entwertet das Angebot.
3. **Compliments-Falle:** Bittet implizit um Feedback, nicht um Commitment. → Höfliche "ist interessant!"-Antworten ohne Action.

---

## 3 Varianten (in Reihenfolge der Schärfe)

### Variante A — Termin-Window (empfohlen für erste 10 Versuche)

> "Ich bin morgen Vormittag zwischen 10 und 12 Uhr für 15 Minuten am Telefon erreichbar — wenn Sie eine konkrete Frage haben, melden Sie sich kurz. Sonst schreibe ich Ihnen am Donnerstag nochmal."

**Warum besser:**
- Konkretes Zeit-Window → klar, was er tun soll.
- Founder-getriebenes Follow-up am Donnerstag explizit angekündigt → er muss nicht antworten, um in Pipeline zu bleiben.
- Schließt das Angebot nicht aus.

**Cast für TTS:** Tag/Uhrzeit sollte dynamisch sein (heute=Mo → "morgen Vormittag 10-12 Uhr" + "Donnerstag"). In Speakflow: Platzhalter `{slot_window}` + `{follow_up_day}`.

### Variante B — Referral-anchored (für Founder-Höflichkeits-Stil)

> "Falls Sie jemanden im Betrieb kennen, der mit verpassten Anrufen ringt — leiten Sie das gerne weiter. Wenn es für Sie selbst nichts ist, sagen Sie mir bitte ehrlich: Wer sollte das stattdessen sehen?"

**Warum stärker als v1:**
- Macht das No zur Tür zum nächsten Ja.
- Echtes Mom-Test-Pattern (Commitment-Ladder Schritt: Referral).
- Erkennt explizit Möglichkeit des Nicht-Fits → keine Über-Verkaufer-Stimmung.

### Variante C — Skin-in-the-Game (höchste Conversion, ungewöhnlicher Stil)

> "Wenn das für Sie interessant klingt — antworten Sie mir mit einem einzigen Wort: 'Telefonieren'. Dann buche ich automatisch einen 20-Minuten-Slot bei Ihnen."

**Warum gewagter:**
- Niedrigste Hürde zum Commitment-Signal.
- Maschinen-Feeling ("ein-Wort-Antwort") kann bei Sanitär unsympathisch wirken — passt eher zu Tech-Käufern.
- Kein A/B-Test verfügbar in Schweizer-Handwerk-Kontext.

---

## Empfehlung

**A für erste 10 Recordings.** Dann datenbasiert anpassen:
- Wenn >2 Termine aus den 10 → A behalten.
- Wenn 0 Termine → B testen (10 weitere).
- C bewusst nicht jetzt — Schweizer Handwerker-Empfindung wahrscheinlich gegen "1-Wort-Antwort".

---

## Implementation

1. **Speakflow-Template aktualisieren:** `docs/gtm/speakflow_template.md` Z497-512 → Variante-A-Text. Platzhalter `{slot_window}` einbauen.
2. **Audio-Take 4 re-record:** Founder nimmt Closing-Sequenz neu auf mit Variante-A-Text.
3. **Pipeline:** Take-4-Audio-Replacement-Step erweitern um dynamisches `slot_window` (basierend auf send_date).
4. **Pipeline-Bible §63:** Loom-CTA als verbindlicher Closing-Standard.

**Aufwand:** ~1h Re-Recording + ~30 Min Script-Anpassung Pipeline.

---

## Mom-Test-Beleg für die Verschärfung

Aus Fitzpatrick: *"Bad data is worse than no data."* Wenn der CTA nur "schreiben Sie zurück" sagt und niemand antwortet, weiß der Founder nicht ob (a) der Loom schlecht war, (b) der CTA schlecht war, oder (c) der Prospect grundsätzlich nicht passt. Mit Variante A ist das Founder-Donnerstag-Follow-up das Test-Signal → Daten kommen unabhängig von Empfänger-Initiative.
