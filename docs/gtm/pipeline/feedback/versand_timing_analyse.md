# Versand-Timing Analyse — E-Mail Outreach Sanitär/Heizung Schweiz

**Datum:** 2026-04-19
**Kontext:** Optimaler Versandzeitpunkt für personalisierte Outreach-E-Mails mit 4 Video-Takes an Schweizer Sanitär-/Heizungsbetriebe (3-30 MA, inhabergeführt).

---

## Empfehlung

| Faktor | Empfehlung | Begründung |
|--------|-----------|------------|
| **Beste Tage** | **Dienstag, Mittwoch, Donnerstag** | Montag = Inbox-Überflutung, Freitag = Wochenend-Modus |
| **Primär-Zeitfenster** | **06:30–07:15** | Inhaber checkt Handy vor Abfahrt zur Baustelle. E-Mail ganz oben. |
| **Sekundär-Zeitfenster** | **12:00–12:45** | Mittagspause — Mobile-Check-Gewohnheit |
| **Tertiär-Zeitfenster** | **18:30–19:30** | Feierabend. Inhaber ist zuhause, hat Zeit für 4 Videos. **Bestes Fenster für Video-Content.** |
| **Vermeiden** | Montag morgens, Freitag nachmittags, Wochenende | Tiefe Öffnungsraten, wirkt wie Spam |
| **Saisonaler Peak** | **September–November** (Heizungssaison) | Inhaber planen Wartungsvolumen + Personal |
| **Saisonales Tief** | **20. Dez–6. Jan, Juli–August** | Betriebsferien, reduzierte Erreichbarkeit |

## Schweiz-/Handwerker-spezifisch

- **Frühmorgens schlägt 09:00.** Handwerker sind um 08:00 schon auf der Baustelle. Das Büro-B2B-Fenster (09-10 Uhr) funktioniert hier NICHT.
- **Feierabend = echte Chance.** Schweizer Handwerker trennen Arbeit und Privat physisch, checken aber die Business-E-Mail zuhause. Video-Content (4 Takes) wird hier am ehesten ANGESCHAUT.
- **Die Mittagspause ist heilig.** 30-60 Minuten, oft allein — perfekt für einen ersten Blick auf die E-Mail.

## Konkrete Versand-Strategie

| Schritt | Wann | Was |
|---------|------|-----|
| **Erstversand** | Di oder Mi, 06:45 | Personalisierte E-Mail mit Thumbnail + Video-Links |
| **Unopened-Resend** | Do 18:30 (gleiche Woche) | Gleiche E-Mail, neue Betreffzeile ("Nochmals: [Firma]...") |
| **Follow-Up** | Nächster Di, 12:15 | Kürzere E-Mail ("Kurze Rückfrage...") |
| **Saisonaler Push** | Sept–Nov | Volumen hochfahren (Heizungssaison) |
| **Vermeiden** | Dez + Sommer | Volumen reduzieren (Betriebsferien) |

## Pipeline-Integration

In `pipeline_run.mjs` → Outreach-Step:
- Default Versandzeit: **Dienstag 06:45** oder **Mittwoch 06:45**
- `--send-time=morning|lunch|evening` Flag für manuelles Override
- Automatischer Resend nach 48h wenn nicht geöffnet (tracking via Resend)
