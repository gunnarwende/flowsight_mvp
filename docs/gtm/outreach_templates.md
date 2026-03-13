# Outreach-Templates — Gold Contact Standard

**Erstellt:** 2026-03-09 | **Aktualisiert:** 2026-03-13 | **Owner:** Founder (Versand) + CC (Templates)
**Referenz:** `gold_contact.md` (Nordstern), `schatztruhe_final.md` (Psychologie), `prospect_manifest.md` (Variablen)
**Regel:** Founder sendet IMMER aus eigener E-Mail. Kein Massenversand. Jede Mail personalisiert.

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
