# Dörfler AG — Onboarding-Mail (Phase 2: Einladung ins Cockpit)

> **Was das ist:** Die Mail, die nach dem **„Ja" im Phase-1-Gespräch** rausgeht (vom Founder per
> One-Tap ausgelöst). Sie ist eine **Einladung, keine Rechnung** — der Preis ist im Gespräch schon
> gesetzt. Ziel: EIN Klick → ins Cockpit, wo der Betrieb sein System in ~1 Stunde selbst aufbaut.
> Prinzip: „**Sie bauen Ihr System, wir führen Sie.**" Premium, Navy + Gold, Founder-persönlich.
>
> **Status:** Inhalt fertig zum Lesen/Abnehmen. Für den echten Versand an dich → siehe Render-Notiz unten.

---

## Betreff (A — Empfehlung)
**Herr Dörfler – bauen wir Ihr Leitsystem auf**

*Betreff B (wärmer):* „Schön, dass Sie dabei sind, Herr Dörfler"
*Vorschautext (Preheader):* „Das Meiste ist vorbereitet – es fehlen nur die Dinge, die nur Sie kennen."

---

## E-Mail-Text

Grüezi Herr Dörfler

schön, dass wir gesprochen haben – und dass Sie dabei sind.

Wie besprochen habe ich das Meiste für die **Dörfler AG** schon vorbereitet. Was jetzt noch fehlt, sind die **20 %, die nur Sie kennen** – wie Ihre Lisa ans Telefon gehen soll, was sie bei welcher Anfrage tut, wie Ihre Fälle bei Ihnen reinkommen. Genau das macht aus dem System **Ihr** System.

Über den Link unten richten Sie das in **rund einer Stunde** selbst ein – Schritt für Schritt, ohne IT-Kenntnisse. Sie klicken sich durch drei Bereiche:

- **Ihre Lisa** – wie sie grüsst, wie sie reagiert, wann sie an Sie durchstellt
- **Ihr Leitsystem** – Ihr Look, Ihre Fälle auf einen Blick
- **Ihr Meldeformular** – wie Anfragen von Ihrer Website sauber bei Ihnen landen

Wenn Sie irgendwo nicht weiterkommen, hilft Ihnen Lisa direkt weiter – oder Sie speichern und machen später fertig.

**Wichtig:** Es geht nichts scharf, solange Sie nichts freigeben. Sie bauen in Ruhe auf, **ich schaue am Ende drüber**, und dann schalten wir **gemeinsam** live. Sie behalten jederzeit die Kontrolle.

👉 **[Ihr Leitsystem aufbauen]** → https://flowsight.ch/aufbau/[token]

Ich freue mich darauf, Ihr System mit Ihnen scharf zu schalten – ein schöner Moment, gerade im **100. Jahr** der Dörfler AG.

Herzliche Grüsse
**Gunnar Wende**
FlowSight
[Direktnummer] · gunnar.wende@flowsight.ch

*PS: Antworten Sie einfach auf diese Mail, wenn unterwegs eine Frage aufkommt – die landet direkt bei mir.*

---

## Render- & Versand-Notiz (für den echten Test)

**Optik (Hell-Premium-Standard, wie der Outreach-Versand):** weisse Karte, **Navy-Verlauf** im
Header, **EIN knalliger Navy-Button mit Gold-Akzent** („Ihr Leitsystem aufbauen"), grosszügiger
Weissraum, kein Footer-Jargon. Absender **„Gunnar Wende <gunnar.wende@flowsight.ch>"**, Reply-To
Founder (Antworten → Outlook).

**Struktur (mappt auf das `email.json`-Schema von `send_outreach.mjs`):**
`subject` · `paragraphs[]` · `linkLabel` = „Ihr Leitsystem aufbauen" · `closing[]` · `signature[]`
(`**fett**` erlaubt). Foto-inline optional (das runde Lächel-Foto wie im Outreach).

**Um es dir HEUTE in den Posteingang zu schicken** (gunnar.wende@flowsight.ch): zwei kleine Dinge
fehlen noch, beide schnell —
1. **Ziel-Link:** `https://flowsight.ch/aufbau/[token]` zeigt auf das **Cockpit (Phase 2)**, das noch
   gebaut wird. Für einen reinen **Feel-Test** der Mail setzen wir einen Platzhalter-Link (oder
   `/aufbau`-Landeplatz) — du testest Optik, Ton, Button, Zustellbarkeit, nicht das Cockpit.
2. **Send-Pfad:** `send_outreach.mjs` ist für die **kalte** Outreach-Mail gebaut (Proof-Link + Foto).
   Diese hier ist ein anderer Mail-Typ. Sauberste Lösung: ein kleiner `send_onboarding.mjs`
   (gleiche Resend-/Absender-/`--preview`-Mechanik, anderes Template) **oder** einmalig diesen Text
   als `email.json`-Variante durch `send_outreach --file … --preview` rendern.

→ Sag „**schick's mir**", dann baue ich den schnellsten sauberen Weg (Variante 2 = wenige Minuten) und
du hast die Mail zum Durchklicken im Postfach.
