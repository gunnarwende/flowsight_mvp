# Premium Outreach-Templates (Leckerli-Varianten)

**Erstellt:** 2026-03-09 | **Owner:** Founder (Versand) + CC (Templates)
**Referenz:** `docs/gtm/operating_model.md`
**Regel:** Founder sendet IMMER aus eigener E-Mail. Kein Massenversand. Jede Mail personalisiert.

---

## Grundregeln

1. **Kein Template-Gefühl.** Jede E-Mail liest sich wie ein persönlicher Brief.
2. **Firmenname + Region + Gewerk** müssen im Text vorkommen.
3. **CTA immer konkret:** "Testen Sie Ihre eigene Lisa: [Nummer]" — nicht "Buchen Sie eine Demo".
4. **Keine PII** anderer Kunden im Outreach.
5. **Max 3 Touches** pro Prospect, dann Ruhe.

---

## Template 1: A+B-Full+C+D (ICP 90+, Top-Prospects)

**Betreff:** {FIRMA} — ich habe etwas für Sie gebaut

**Body:**

> Guten Tag {ANREDE} {NACHNAME},
>
> ich bin Gunnar Wende, Gründer von FlowSight. Wir entwickeln ein Leitsystem für Handwerksbetriebe wie die {FIRMA} — damit kein Anruf mehr verloren geht.
>
> Ich habe mir Ihren Betrieb angeschaut und eine persönliche Demo vorbereitet:
>
> **Ihre Test-Lisa:** Rufen Sie {TESTNUMMER} an — Ihre eigene KI-Assistentin nimmt ab, erkennt ob es ein Notfall ist, und sammelt alle Details.
>
> **Ihre Website-Vorschau:** {WEBSITE_URL} — so könnte Ihre Präsenz mit FlowSight aussehen. Mit Ihren echten Services, Bewertungen und 24h-Notdienst.
>
> **Kurzvideo (60s):** {VIDEO_URL} — ich zeige Ihnen den ganzen Ablauf: Anruf → Lisa → SMS-Bestätigung → Fall im Dashboard.
>
> Darf ich Ihnen in einem kurzen Gespräch (10 Min) zeigen, wie das für die {FIRMA} funktionieren könnte?
>
> Herzliche Grüsse
> Gunnar Wende
> FlowSight — flowsight.ch
> {FOUNDER_PHONE}

---

## Template 2: A+B-Quick+D (ICP 75-89, gute Prospects)

**Betreff:** {FIRMA} — Ihre eigene Lisa wartet

**Body:**

> Guten Tag {ANREDE} {NACHNAME},
>
> ich bin Gunnar Wende von FlowSight. Wir helfen {GEWERK}-Betrieben in der Region {REGION}, keinen Anruf mehr zu verpassen — mit einer persönlichen KI-Assistentin.
>
> Ich habe für die {FIRMA} eine Demo vorbereitet:
>
> **Testen Sie Lisa:** Rufen Sie {TESTNUMMER} an — Ihre KI-Assistentin nimmt ab, erkennt {NOTFALL_ODER_ANFRAGE}, und leitet alles strukturiert weiter.
>
> **Ihre Website-Vorschau:** {WEBSITE_URL}
>
> Das Ganze dauert 30 Sekunden. Kein Termin nötig, einfach anrufen.
>
> Herzliche Grüsse
> Gunnar Wende
> FlowSight — flowsight.ch

---

## Template 3: B-Quick+D (ICP 60-74, solide Prospects)

**Betreff:** Kein verpasster Anruf mehr — Demo für {FIRMA}

**Body:**

> Guten Tag,
>
> ich bin Gunnar Wende von FlowSight. Wir haben eine KI-Assistentin gebaut, die Anrufe für {GEWERK}-Betriebe entgegennimmt — rund um die Uhr.
>
> Ich habe eine kurze Demo für Sie vorbereitet:
>
> **Testen Sie es selbst:** Rufen Sie {TESTNUMMER} an.
> **Website-Vorschau:** {WEBSITE_URL}
>
> Kein Abo, kein Termin. Einfach anrufen und testen.
>
> Grüsse
> Gunnar Wende
> FlowSight — flowsight.ch

---

## Anruf-Script (Follow-up, 2 Tage nach E-Mail)

**Timing:** Mo-Fr, 08:00-11:00 oder 14:00-16:00

```
"Guten Tag {ANREDE} {NACHNAME}, hier ist Gunnar Wende von FlowSight.

Ich hatte Ihnen vor ein paar Tagen eine E-Mail geschickt —
ich habe eine persönliche Demo für die {FIRMA} vorbereitet.

[PAUSE — Reaktion abwarten]

Falls noch nicht getestet:
"Haben Sie schon die Nummer angerufen? Sie können jederzeit testen:
{TESTNUMMER}. Lisa nimmt ab und zeigt Ihnen, wie das funktioniert."

Falls ja:
"Super, wie war Ihr Eindruck? Darf ich Ihnen in 10 Minuten zeigen,
wie das im Alltag für Ihren Betrieb funktioniert?"

Falls kein Interesse:
"Kein Problem, ich wünsche Ihnen einen guten Tag.
Falls sich etwas ändert — die Nummer funktioniert weiterhin."
```

---

## Variablen-Referenz

| Variable | Quelle | Pflicht |
|----------|--------|---------|
| `{FIRMA}` | prospect_card.json → name | Ja |
| `{ANREDE}` | "Herr" / "Frau" (aus Kontaktperson) | Template 1+2 |
| `{NACHNAME}` | Kontaktperson Nachname | Template 1+2 |
| `{GEWERK}` | "Sanitär" / "Heizung" / "Haustechnik" | Ja |
| `{REGION}` | "Thalwil" / "Horgen" / "Zimmerberg" | Template 2 |
| `{TESTNUMMER}` | Twilio-Nummer des Agents | Ja |
| `{WEBSITE_URL}` | flowsight.ch/kunden/{slug} | Ja |
| `{VIDEO_URL}` | Loom/YouTube Link | Nur Template 1 |
| `{NOTFALL_ODER_ANFRAGE}` | "Notfälle" oder "Anfragen" | Template 2 |
| `{FOUNDER_PHONE}` | Founder Mobilnummer | Nur Template 1 |

---

## Versand-Checkliste (Quality Gate 5)

Vor jedem Versand:

- [ ] Firmenname korrekt geschrieben
- [ ] Region/Gewerk stimmen
- [ ] Testnummer angerufen → Lisa antwortet korrekt
- [ ] Website-URL getestet → lädt, kein 404
- [ ] Video-URL getestet (nur Template 1) → spielt ab
- [ ] Kein Template-Gefühl — liest sich persönlich
- [ ] Keine PII anderer Kunden
- [ ] Absender: Founder persönliche E-Mail (nicht info@)
- [ ] Betreff enthält Firmenname

---

## Touch-Kadenz

| Touch | Kanal | Timing | Template |
|-------|-------|--------|----------|
| 1 | E-Mail | Tag 0 | Template 1/2/3 (nach ICP) |
| 2 | Anruf | Tag 2 | Anruf-Script |
| 3 | E-Mail | Tag 7 | Kurzer Follow-up ("Hatten Sie Zeit zum Testen?") |
| — | Pause | Danach | Kein weiterer Kontakt. Prospect ruht. |
