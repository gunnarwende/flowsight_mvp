# Outreach-Templates — Gold Contact Standard

**Erstellt:** 2026-03-09 | **Aktualisiert:** 2026-03-13 | **Owner:** Founder (Versand) + CC (Templates)
**Referenz:** `gold_contact.md` (Nordstern), `schatztruhe_final.md` (Psychologie), `prospect_manifest.md` (Variablen)
**Regel:** Founder sendet IMMER aus eigener E-Mail. Kein Massenversand. Jede Mail personalisiert.

---

## ⚠️ MODELL-UPDATE 03.06.2026 — Umsetzung 04.06. (überschreibt Teile der März-Templates unten)

Die März-Templates basieren auf einem überholten Modell (Test-Telefonnummer + Website-Link als Beweis, weicher „Feedback"-CTA). **Neues Modell, gelockt 03.06.** (Details: Memory `project_email_phase_kickoff`, STATUS-EOD-Block):

- **Ein Link statt drei:** keine Test-Nummer (Twilio erst nach Ja), kein kalter Website-Link. Der Beweis = eine **private Beweis-Seite `/p/[token]`** pro Betrieb (mobil-first, noindex) mit den **4 personalisierten Video-Takes** + Tracking. „Mail = Deckel, Seite = Schatz."
- **CTA = Variante A** (`loom_cta_v2.md`): Termin-Window + Founder-Follow-up („Ich bin Donnerstag 10-12 Uhr 15 Min erreichbar … sonst schreibe ich Ihnen Freitag nochmal."). NICHT das weiche „schreiben Sie zurück".
- **Copy-Leitprinzip: „echter Mensch schlägt glatte Maschine".** Menschlichkeit im TON + ehrlicher CTA („sagen Sie's mir, wenn's nichts ist") — NICHT Selbst-Entschuldigung/„Fehler" (untergräbt Kompetenz). Desktop-Format der Videos als **Echtheits-Beweis** umdeuten („kein Mockup — Ihr echtes System, live"). Querformat-Hinweis gehört auf die SEITE, nicht in die Mail.
- **Ansprechpartner:** Inhaber **mit Namen** (Anreicherung Impressum/Zefix/LinkedIn), nicht `info@`.
- **Kadenz (tracking-gesteuert):** Tag 0 Mail → Tag 3 Reminder (geschaut-aber-still vs. nicht-geöffnet unterschiedlich) → Tag 6-7 Anruf (priorisiert nach Watch-Signal, mit den 3 Discovery-Fragen aus `discovery_questions.md`) → Pause (max 3 Touches) → Video löschen nach 14 Tagen ohne Engagement.

### Template NEU (Tag 0) — Ein-Link-Modell (gilt ab 04.06., ersetzt Template 1/2 für die Video-Pipeline-Betriebe)

> **⚠️ COPY-STAND 11.06.:** Die **live versandte** Copy pro Betrieb ist die **B-Vorlage** in `docs/customers/<slug>/outreach/email.<slug>.json` (Versand via `send_outreach.mjs --file …`). Sie ist diesem Muster gegenüber **verfeinert** (Founder-Lehren 11.06., → `lessons_learned.md` S6/S7):
> - **„durchgespielt" raus** → „**sichtbar gemacht**" (klang nach Spielwiese/Demo).
> - **Kein Konkurrenz-Drohsatz** bei etablierten Betrieben (Over-Claim) → reiner **Sichtbarkeits-Haken** + „im **hektischsten Alltag** geht nichts unter".
> - **Anrede „Grüezi {Herr Nachname}"** (CH-warm), Link-Label signalisiert **Video** („Ihr persönlicher Video-Einblick").
> - **Empfänger = eine Person, GL des Kern-Bereichs** (nie `info@`/CC, S6).
> Das Muster unten bleibt als Struktur-Referenz (4 Beats + Ein-Link + Variante-A-CTA) gültig.

**Voraussetzung:** Beweis-Seite `/p/<token>` steht (via `build_proof_page.mjs --slug <slug>`), Takes auf Bunny encodiert (status=4). Founder sendet aus eigener E-Mail an den **Inhaber mit Namen**.

**Betreff:** `{salutation} — ich habe etwas für {company_name} ausprobiert`
_(z.B. „Herr Leuthold — ich habe etwas für Walter Leuthold ausprobiert")_

**Body (≤ ~600 Zeichen, ein einziger Link):**

> Guten Tag {salutation},
>
> ich bin Gunnar Wende aus Oberrieden. Ich baue ein Leitsystem für Sanitärbetriebe in der Region — damit kein Anruf und keine Anfrage mehr verloren geht.
>
> Ich habe {company_name} einmal sichtbar gemacht — vom Anruf bis zur Bewertung — und auf eine kurze, private Seite gelegt:
>
> 👉 **Ihr persönlicher Einblick:** {proof_url}
>
> Das ist kein Werbe-Mockup, sondern Ihr echtes System, live.
>
> Ich bin am **{follow_up_day} zwischen 10 und 12 Uhr** für 15 Minuten am Telefon — wenn Sie eine Frage haben, melden Sie sich kurz. Sonst schreibe ich Ihnen am {next_touch_day} nochmal.
>
> Und wenn Sie finden, das ist nichts für Sie — sagen Sie mir das bitte ehrlich. Das hilft mir genauso.
>
> Herzliche Grüsse
> Gunnar Wende
> {founder_phone}

**Warum so (Leitprinzip „echter Mensch schlägt glatte Maschine"):**
- **Ein Link** = die Beweis-Seite. Keine Test-Nummer (Twilio erst nach Ja), kein kalter Website-Link, kein eingebettetes Video.
- **CTA = Variante A** (`loom_cta_v2.md`): konkretes Telefon-Window + Founder-getriebenes Follow-up → Daten kommen unabhängig von Empfänger-Initiative.
- **Ehrlicher Schluss statt Entschuldigung:** „sagen Sie's mir, wenn's nichts ist" — NICHT „ich hab einen Fehler gemacht" (würde Kompetenz untergraben + auf Fehlersuche im stärksten Asset primen).
- **Querformat-Hinweis steht auf der SEITE, nicht in der Mail** (klaut sonst den Haken).
- **Desktop-Format = Echtheits-Beweis** („Ihr echtes System, live"), nicht als Mangel framen.

**Variablen:** `{salutation}` (proof_pages.contact_salutation, „Herr Nachname") · `{company_name}` · `{proof_url}` (`https://flowsight.ch/p/<token>`) · `{follow_up_day}`/`{next_touch_day}` (Versandtag-abhängig, z.B. Mo→„Donnerstag"/„Freitag") · `{founder_phone}`.

### Tag 3 — Reminder (tracking-gesteuert)

- **Geschaut, aber still** (`view_count ≥ 1`): „Guten Tag {salutation}, ich sehe, Sie hatten kurz reingeschaut — was war Ihr erster Eindruck? Eine Zeile genügt." (warm, kein Druck)
- **Nicht geöffnet** (`view_count = 0`): kurzer Bump, gleicher Link: „Falls die Mail untergegangen ist — hier nochmal Ihr Einblick: {proof_url}. 2 Minuten genügen."

### Tag 6-7 — Anruf (priorisiert nach Watch-Signal)

Wer geschaut hat zuerst. Script + die 3 Discovery-Fragen: `docs/sales/discovery_questions.md`. Max 3 Touches, dann Pause. Video-Löschung nach 14 Tagen ohne Engagement (Bunny-Lifecycle, `proof_pages.expires_at`).

### 🎯 ERSTER ECHTER VERSAND — Dörfler AG (paste-fertig, 04.06.)

**Empfänger:** beide Brüder Dörfler (Ramon + Luzian), Oberrieden · **Variante A** (echter Bezug: Founder war Kunde — Dichtung am Wasserhahn; dabei Anruf-Pain + Bewertungs-Hürde selbst erlebt). **Versand aus eigenem Postfach** (paste). Foto = `docs/customers/doerfler-ag/outreach/gunnar_face_circle.png` (rundes Lächel-Porträt, 1080p, einfügen + auf den Link verlinken). CTA-Logik: siehe `CTA.md`.

**Betreff (Empfehlung):** `Grüezi mitenand – erinnern Sie sich an die Dichtung bei uns?`
_(Alt: „Herr Dörfler – bei Ihrem Einsatz bei uns sind mir zwei Dinge aufgefallen")_

**Body (v2 — Founder-Feedback 04.06. eingearbeitet):**

> Grüezi mitenand
>
> erinnern Sie sich – vor einiger Zeit war einer von Ihnen bei uns an der Eglistrasse 7A hier in Oberrieden und hat die Dichtung am Wasserhahn gewechselt. Solide, zielgerichtet, schnell erledigt.
>
> Zwei Dinge sind mir an dem Tag geblieben. **Erstens:** Mitten in der Arbeit kam ein Anruf rein, an den Sie nicht rangehen konnten. **Zweitens:** Ich hatte mir fest vorgenommen, Ihnen fünf Sterne zu geben – und hab's im Alltag dann schlicht vergessen. Gute Arbeit, die niemand sieht.
>
> Beides hat mich nicht mehr losgelassen. Ich habe der Dörfler AG daraufhin eine eigene App gebaut und einmal sichtbar gemacht – vom ersten Anruf bis zur Bewertung. Schauen Sie's an, wenn Sie ein paar Minuten haben:
>
> [FOTO – klickbar] 👉 Ihr persönlicher Einblick: https://flowsight.ch/p/8f1b4a4859e667341ddda95b
>
> Schauen Sie's in Ruhe an. Ich melde mich in ein paar Tagen kurz telefonisch – und wenn Sie sagen, das ist nichts für Sie, ist ein ehrliches Nein für mich genauso viel wert wie ein Ja.
>
> Freundliche Grüsse
> Gunnar Wende, Oberrieden
> +41 44 552 09 19

**Was sich gegenüber v1 geändert hat (Founder-Feedback):** Adresse rein (Echtheits-Beweis) · Bewertungs-Pain auf „vorgenommen + vergessen" gedreht (impliziert den fehlenden Anstoss = T4) · „Ihren Fällen" raus (Live-Daten-Suggestion/Panik) · „100-Jahr" raus aus Mail → in den Call-Opener · „läuft noch nicht / erste Minute genügt" raus (deflationiert + untersellt) · CTA = founder-getrieben + No-oriented (kein „schreiben Sie zurück").

**Status:** Seite + Takes founder-abgenommen, Link live. Versand nach finalem Founder-Phone-Test.

> **Stellvertreter-Referenz (Bau-Test):** Walter Leuthold `/p/dff8fd60c97fa22b94a0db24` — diente nur zum Maschinen-Aufbau; echter Erst-Versand = Dörfler.

---

## Grundregeln

1. **Kein Template-Gefuehl.** Jede E-Mail liest sich wie ein persoenlicher Brief.
2. **Spiegel-Effekt.** Firmenname + Region + Gewerk muessen im Text vorkommen.
3. **CTA = Testen, nicht Kaufen.** "Testen Sie Ihre eigene Lisa: {test_phone}" — nicht "Buchen Sie eine Demo".
4. **Genau 3 Links.** Nicht mehr (Entscheidungsparalyse). Nicht weniger (zu wenig Beweis).
5. **Max 400 Zeichen Body.** Scanbar in 5 Sekunden. E-Mail ist Deckel der Schatztruhe, nicht die Schatztruhe.
6. **Keine PII** anderer Kunden im Outreach.
7. **Max 3 Touches** pro Prospect vor Trial, dann Ruhe.
8. **Defensives Verkaufen.** "Feedback gesucht" — nicht "ich habe die Loesung fuer Sie".

---

## Modus-Routing

| Element | Modus 1 (Full) | Modus 2 (Extend) |
|---------|---------------|------------------|
| Link 1 | {loom_url} (Video) | {loom_url} (Video) |
| Link 2 | {test_phone} (tel:-Link) | {test_phone} (tel:-Link) |
| Link 3 | {kunden_url} (/kunden/{slug}) | {start_url} (/start/{slug}) |
| Website-Beschreibung | "eine Website fuer {legal_name}" | "einen persoenlichen Einstieg fuer {legal_name}" |
| Video-Hook | "Ich habe fuer {legal_name} eine Website gebaut" | "{video_hook}" |

---

## Template 1: HOT (A+B-Full+C+D, ICP >= 8)

**Trigger:** QA bestanden (qa.ready_to_send === true), Founder sendet persoenlich.
**Betreff:** {legal_name} — ich habe etwas fuer Sie ausprobiert

**Body:**

> {anrede},
>
> ich bin Gunnar Wende aus Oberrieden. Ich entwickle ein Leitsystem fuer {gewerke_text} {region_reference} — damit kein Anruf mehr verloren geht.
>
> Ich habe fuer {legal_name} etwas ausprobiert und wuerde gerne Ihre Meinung hoeren:
>
> 1. **Kurzvideo (2 Min):** {loom_url}
> 2. **Ihre Testnummer:** {test_phone} — rufen Sie an, Lisa nimmt ab
> 3. **{link_3_label}:** {link_3_url}
>
> Kein Abo, kein Vertrag. Nur Feedback.
>
> Herzliche Gruesse
> Gunnar Wende
> {founder_phone}

**Thumbnail:** {loom_thumbnail} (extern gehosted via Loom CDN, nie eingebettet)

### Modus-1-Variante (Link 3)

```
3. **Ihre Website:** {kunden_url}
```

### Modus-2-Variante (Link 3)

```
3. **Ihr persoenlicher Einstieg:** {start_url}
```

---

## Template 2: WARM (B-Full+D, ICP 6-7, kein Video)

**Trigger:** Provisioning abgeschlossen, Founder sendet persoenlich.
**Betreff:** {legal_name} — Ihre eigene Lisa wartet

**Body:**

> {anrede},
>
> ich bin Gunnar Wende von FlowSight. Wir helfen {gewerke_text} {region_reference}, keinen Anruf mehr zu verpassen.
>
> Ich habe fuer {legal_name} eine Demo eingerichtet:
>
> 1. **Testen Sie Lisa:** {test_phone} — Ihre KI-Assistentin nimmt ab und sammelt alle Details
> 2. **{link_3_label}:** {link_3_url}
>
> Dauert 30 Sekunden. Kein Termin noetig.
>
> Herzliche Gruesse
> Gunnar Wende

**Hinweis:** Kein Video-Link (WARM-Prospects bekommen kein Leckerli A).

---

## Anruf-Script (Follow-up, 2 Tage nach E-Mail)

**Timing:** Mo-Fr, 08:00-11:00 oder 14:00-16:00
**Dauer:** Max 2 Min. Kein Pitch. Kurz, respektvoll.

```
"Gruezi {anrede}, hier ist Gunnar Wende aus Oberrieden.

Ich hatte Ihnen vor ein paar Tagen eine E-Mail geschickt —
ich habe fuer {legal_name} etwas ausprobiert.

[PAUSE — Reaktion abwarten]

Falls noch nicht getestet:
"Haben Sie die Nummer schon angerufen? {test_phone}.
Lisa nimmt ab — dauert 30 Sekunden."

Falls ja:
"Wie war Ihr Eindruck? Was hat Sie ueberrascht?"

Falls kein Interesse:
"Kein Problem. Die Nummer funktioniert weiterhin, falls
sich etwas aendert. Schoenen Tag."
```

---

## Variablen-Referenz (Prospect Manifest v2.0)

| Variable | Manifest-Pfad | Template |
|----------|--------------|----------|
| `{legal_name}` | company.legal_name | 1, 2, Anruf |
| `{anrede}` | outreach.anrede | 1, 2, Anruf |
| `{gewerke_text}` | outreach.gewerke_text | 1, 2 |
| `{region_reference}` | outreach.region_reference | 1, 2 |
| `{test_phone}` | provisioning.twilio_number_display | 1, 2, Anruf |
| `{loom_url}` | assets.loom_url | 1 |
| `{loom_thumbnail}` | assets.loom_thumbnail | 1 |
| `{kunden_url}` | provisioning.kunden_url | 1 (M1) |
| `{start_url}` | provisioning.start_url | 1 (M2), 2 |
| `{video_hook}` | outreach.video_hook | (Video, nicht E-Mail) |
| `{prospect_email}` | outreach.prospect_email | Empfaenger |
| `{founder_phone}` | Statisch: Founder-Mobilnummer | 1 |

---

## Versand-Checkliste (pro Prospect)

```
□ qa.ready_to_send === true (fuer Template 1)
□ Firmenname korrekt geschrieben
□ Region/Gewerk stimmen
□ Testnummer JETZT angerufen → Lisa antwortet korrekt
□ Link 3 URL getestet → laedt, kein 404
□ Video-URL getestet (nur Template 1) → spielt ab, richtiger Prospect
□ Kein Template-Gefuehl — liest sich persoenlich
□ Keine PII anderer Kunden
□ Absender: Founder persoenliche E-Mail (nicht info@)
□ Betreff enthaelt Firmenname
□ Regionale Staffelung: Max 2 im selben PLZ-Cluster diese Woche
```

---

## Touch-Kadenz (Outreach-Phase)

| Touch | Kanal | Timing | Template |
|-------|-------|--------|----------|
| 1 | E-Mail | Tag 0 | Template 1 (HOT) oder Template 2 (WARM) |
| 2 | Anruf | Tag 2-3 | Anruf-Script |
| 3 | E-Mail | Tag 5-7 | Kurzer Follow-up: "Hatten Sie Zeit zum Testen?" |
| — | Pause | Danach | Kein weiterer Kontakt bis Signal |

**Lifecycle-E-Mails** (Welcome, Day-5-Nudge, Day-13-Erinnerung, Offboarding) sind KEIN Outreach.
Sie laufen automatisch nach Trial-Start via `lifecycle/tick`. Dokumentation: `docs/redesign/prospect_journey.md`.

---

## Was dieses Dokument NICHT abdeckt

| Thema | Wo dokumentiert |
|-------|----------------|
| Trial-Einladung / Welcome-Mail | `prospect_journey.md` (Tag 0, automatisch) |
| Day-5-Nudge | `prospect_journey.md` (profilabhaengig) |
| Day-13-Erinnerung | `prospect_journey.md` (automatisch) |
| Offboarding-Mail | `prospect_journey.md` (manuell ausgeloest) |
| Follow-up Call (Tag 10) | `operating_model.md` (Phase 3) |
| Video-Inhalt | `schatztruhe_final.md`, `video_manifest.md` |
| QA vor Versand | `qa_gate.md` |
