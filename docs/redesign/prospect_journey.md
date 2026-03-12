# Prospect Journey — Zielbild (Gold)

**Typ:** SSOT-Zielbild (Gold)
**Stand:** 2026-03-12
**IST-Grundlage:** prospect_journey_ist.md (17 dokumentierte Luecken)
**Nordstern:** gold_contact.md (5 Kaufstufen, 7 WOW-Momente, 2 Profile)
**Referenziert:** identity_contract.md, voice.md, leitstand.md

---

## 1. Executive Summary

Die Prospect Journey ist das Produkt. FlowSight verkauft keine Software — FlowSight verkauft einen 14-Tage-Erlebnisbogen, der einen Sanitaer-/Heizungsbetrieb davon ueberzeugt, dass Lisa zu seinem Betrieb gehoert.

Dieses Dokument definiert:
- den vollstaendigen Tag-0-bis-Tag-14-Ablauf fuer beide Profile (Meister + Betrieb)
- jeden automatischen und manuellen Touchpoint
- den emotionalen Bogen mit Gestaltungsregeln
- die E-Mail-/SMS-/UI-Spezifikationen auf Identity-Contract-Niveau
- die Entscheidungen, die im IST offen oder inkonsistent waren

### Was dieses Dokument NICHT ist

- Kein Implementierungsplan (dafuer: plan.md Tasks)
- Kein Ersatz fuer gold_contact.md (bleibt Nordstern)
- Kein Ersatz fuer voice.md oder leitstand.md (bleiben autoritativ fuer ihre Domaene)

### Kernthese

> Zwischen dem WOW an Tag 0 und der Entscheidung an Tag 14 liegen 13 Tage.
> Wer in diesen 13 Tagen nichts tut, verliert. Wer zu viel tut, nervt.
> Die Kunst ist: wenige, praezise Momente — jeder spuerbar, keiner aufdringlich.

---

## 2. Die zwei Profile

Jede Designentscheidung in diesem Dokument wird fuer beide Profile getroffen. Wo das Erlebnis identisch ist, steht ein Eintrag. Wo es sich unterscheidet, stehen zwei.

### Profil "Meister" (2–8 Mann)

| Dimension | Wert |
|-----------|------|
| Entscheider | Inhaber allein |
| Beeinflusser | Frau / Partner (Kuechentisch-Moment) |
| Erreichbar via | Handy (Baustelle) |
| Primaeres Produkt | SMS-Benachrichtigung (Handy vibriert) |
| Sekundaeres Produkt | Dashboard als Vertiefung |
| Demo-Cases | 3 Kontext-Faelle (zeigen Bandbreite, nicht Volumen) |
| Erstkontakt-Kanal | Anruf → E-Mail |
| Welcome-CTA | "Rufen Sie Ihre Nummer an." |

### Profil "Betrieb" (8–30 Mann)

| Dimension | Wert |
|-----------|------|
| Entscheider | Inhaber / Betriebsleiter |
| Beeinflusser | Disponentin / Buerokraft (Gatekeeper) |
| Erreichbar via | Buero-Festnetz + Handy |
| Primaeres Produkt | Dashboard (Morgen-Uebersicht fuer Disponentin) |
| Sekundaeres Produkt | E-Mail-Notification als Alerting |
| Demo-Cases | 8 Kontext-Faelle (zeigen Morgen-Uebersicht) |
| Erstkontakt-Kanal | E-Mail → Anruf |
| Welcome-CTA | "Leiten Sie dies an Ihre Buerokraft weiter." |

### Routing-Entscheidung

Quelle: `team_size` auf der Prospect Card (gesetzt bei Provisioning).

| `team_size` | Profil | Automatische Folgen |
|-------------|--------|-------------------|
| `solo` oder `small` (≤8) | Meister | 3 Demo-Cases, Handy-first Welcome |
| `team` (>8) | Betrieb | 8 Demo-Cases, Dashboard-first Welcome |

**Entscheidung:** Demo-Case-Anzahl wird an `team_size` gekoppelt. Kein Default 15 mehr (IST-Luecke L5). `provision_trial.mjs` liest `team_size` und setzt `--seed-count` automatisch.

---

## 3. Touchpoint-Architektur

### 3.1 Touchpoint-Inventar

17 Touchpoints in 14 Tagen. 9 automatisch, 5 manuell (Founder), 3 systemgestuetzt (Founder + System).

| # | Tag | Touchpoint | Typ | Kanal | Profil |
|---|-----|-----------|-----|-------|--------|
| T1 | 0 | Erstkontakt (Opener) | Manuell | Anruf (M) / E-Mail (B) | Differenziert |
| T2 | 0 | Zusendung (Nummer + Website + Anleitung) | Manuell | E-Mail | Beide |
| T3 | 0 | Persoenliches Video | Manuell | E-Mail/Loom | Nur HOT |
| T4 | 0 | Welcome-Mail + Magic Link | Automatisch | E-Mail | Beide |
| T5 | 0 | Welcome Page | Automatisch | Web | Differenziert |
| T6 | 0 | Erster Lisa-Anruf | Prospect-Initiative | Telefon | Beide |
| T7 | 0 | Post-Call SMS | Automatisch | SMS | Beide |
| T8 | 0 | SMS-Korrekturseite | Prospect-Initiative | Web | Beide |
| T9 | 0–1 | Erster Dashboard-Besuch | Prospect-Initiative | Web | Differenziert |
| T10 | 2–5 | Abend-/Wochenend-Test | Prospect-Initiative | Telefon | Beide |
| T11 | 5 | Day-5-Nudge | Automatisch | E-Mail | Differenziert |
| T12 | 7 | Day-7-Engagement-Signal | Automatisch | Intern (kein Prospect-Kontakt) | — |
| T13 | 5–10 | Kontrollierter Echt-Moment | Systemgestuetzt | Telefon | Beide |
| T14 | 10 | Founder-Anruf | Manuell | Telefon | Differenziert |
| T15 | 10 | Weiterempfehlungs-Frage | Manuell | Telefon | Beide |
| T16 | 13 | Expiry-Reminder | Automatisch | E-Mail | Beide |
| T17 | 14 | Entscheidung | Systemgestuetzt | Telefon/E-Mail | Beide |

### 3.2 Automatisch vs. Manuell

```
Tag:  0──────1──────2──────3──────4──────5──────6──────7──────8──────9──────10─────11─────12─────13─────14
      │                                        │              │                    │                    │              │
AUTO: T4,T7  ─────────────────────────────── T11 ────────── T12 ─────────────────────────────────── T16 ──── T17
      │                                                                            │
FOUND:T1,T2  ─────────────────────────────────────────────────────────────────── T14,T15
      (T3)
      │
PROSP:T6,T8,T9 ──────────────────── T10 ──────────────── T13
```

**Designprinzip:** Automatische Touchpoints halten die Verbindung. Founder-Touchpoints schaffen Vertrauen. Prospect-Touchpoints erzeugen Beweis. Kein Tag hat mehr als einen automatischen Touchpoint an den Prospect.

---

## 4. Tag-fuer-Tag-Spezifikation

### Tag 0: Provisioning + Welcome

#### T4: Welcome-Mail

**Trigger:** `provision_trial.mjs` nach erfolgreichem Setup

**Spezifikation:**

| Feld | SOLL | IST-Luecke |
|------|------|-----------|
| Subject | `{display_name} — Ihr persoenlicher Test ist bereit` | L4: War "Willkommen — Ihr 14-Tage Trial bei FlowSight" |
| From (Name) | `{display_name} via FlowSight` | L3: War "FlowSight" |
| From (Adresse) | `noreply@send.flowsight.ch` | Bleibt (Domain-Constraint) |
| Reply-To | `{contact_email}` des Tenants | NEU |
| Greeting | `Guten Tag {prospect_salutation}` | L4: War "Guten Tag" generisch |

`prospect_salutation` Logik:
- Wenn `prospect_name` vorhanden: "Herr Weinberger" / "Frau Mueller"
- Sonst: Leer (nur "Guten Tag")

**Body-Struktur:**

```
[Logo: Tenant-Initialen in brand_color]

Guten Tag {prospect_salutation},

Ihr persoenlicher Test fuer {display_name} ist bereit.

━━━ Ihre Testnummer ━━━
{voice_number_formatted}
Rufen Sie an — Lisa meldet sich mit Ihrem Firmennamen.

━━━ Ihr Dashboard ━━━
[Button: "Dashboard oeffnen" → Magic Link]
Alle Meldungen, die Lisa aufnimmt, landen hier.

━━━ So starten Sie (30 Sekunden) ━━━
1. Rufen Sie {voice_number_formatted} an
2. Pruefen Sie die SMS auf Ihrem Handy
3. Oeffnen Sie Ihr Dashboard

Ihr Test laeuft bis {trial_end_formatted} (14 Tage).
Keine Kosten. Kein Vertrag. Kein Setup.

{founder_signature}
```

**Profil-Differenzierung:**

| Element | Meister | Betrieb |
|---------|---------|---------|
| Zusatz nach "Dashboard oeffnen" | — | "Tipp: Leiten Sie diese Mail an Ihre Buerokraft weiter." |
| Anleitung Schritt 3 | "Oeffnen Sie Ihr Dashboard" | "Ihre Disponentin sieht dort die Uebersicht" |

**Founder-Signature (alle E-Mails):**
```
Gunnar Wende
FlowSight — flowsight.ch
044 552 09 19
```

**Entscheidung:** Founder-Kontakt bleibt in der Signatur (nicht im Body, nicht als Footer-Banner). Der Prospect soll wissen, dass ein Mensch dahinter steht — aber der Betriebsname dominiert die Mail, nicht "FlowSight".

#### T5: Welcome Page

**SOLL-Spezifikation (Aenderungen gegenueber IST):**

| Element | IST | SOLL |
|---------|-----|------|
| Badge | "Trial aktiv" | "Ihr Test — noch {days_remaining} Tage" |
| Greeting | "Willkommen, {tenant.name}" | Bleibt (korrekt per Identity Contract) |
| Tagline | "Ihr FlowSight Trial ist bereit..." | "Testen Sie jetzt Lisa — Ihre persoenliche Assistentin." |
| Footer | "Gunnar Wende — 044 552 09 19 — flowsight.ch" | Founder-Signatur (kleiner, dezenter, nicht als Banner) |
| Disabled Nav | "Anrufe", "Reviews", "Einstellungen" mit "Bald" | Komplett ausblenden fuer Prospects |

**Profil-Differenzierung Welcome Page:**

| Element | Meister | Betrieb |
|---------|---------|---------|
| Primaerer CTA | "Jetzt anrufen" (gross, prominent) | "Dashboard oeffnen" (gross, prominent) |
| Sekundaerer CTA | "Dashboard oeffnen" (klein) | "Jetzt anrufen" (sekundaer) |
| Hinweis unter CTA | "Lisa nimmt ab, erkennt Ihr Anliegen und leitet alles weiter." | "Ihre Disponentin sieht alle Meldungen in der Uebersicht." |

**Trial-Countdown:**
- Berechnung: `days_remaining = ceil((trial_end - now) / 86400000)`
- Anzeige: "Ihr Test — noch 14 Tage" → "noch 7 Tage" → "noch 1 Tag" → "Letzter Tag"
- Farbe: Gruen (>7 Tage), Amber (3–7 Tage), Rot (≤2 Tage)

#### T9: Erster Dashboard-Besuch

**Demo-Case-Strategie (schliesst IST-Luecke L2):**

| Aspekt | IST | SOLL |
|--------|-----|------|
| Anzahl | 15 (alle) | Meister: 3, Betrieb: 8 |
| Sichtbarkeit | Alle in Default-View | Demo-Cases in eigenem Tab: "Beispiel-Faelle" |
| Kennzeichnung | `is_demo=true` (nur DB, nicht UI) | Visueller Marker: dezentes Badge "Beispiel" |
| Default-View | Alle Cases gemischt | "Ihre Faelle" (nur echte Cases, leer bei Start) |

**View-Tabs (neu):**

| Tab | Inhalt | Default? |
|-----|--------|---------|
| "Ihre Faelle" | Nur echte Cases (`is_demo=false`) | JA |
| "Beispiel-Faelle" | Nur Demo-Cases (`is_demo=true`) | Nein |

**Leerer-Zustand "Ihre Faelle":**
Wenn noch keine echten Cases existieren:
```
Noch keine Meldungen.
Rufen Sie {voice_number_formatted} an — Lisa nimmt Ihr erstes Anliegen auf.
[Button: "Jetzt anrufen" → tel:{voice_number}]
```

**Entscheidung:** Demo-Cases werden nicht gefiltert/versteckt, sondern in einen eigenen Tab verschoben. Der Prospect sieht sie bewusst als Beispiele — das ist ehrlich und zeigt Bandbreite. Aber sein Default-View zeigt nur seine echten Faelle.

---

### Tag 1–4: Organische Testphase

Keine automatischen Touchpoints an den Prospect. Das ist gewollt.

**Designprinzip:** Der Prospect soll testen, wann er will. Kein Nudging in den ersten 4 Tagen — das System muss fuer sich sprechen. Die WOW-Momente 2–5 passieren durch Eigeninitiative.

**Was im Hintergrund passiert:**
- Jeder Anruf → Case + SMS + Dashboard-Update (automatisch)
- Jeder Wizard-Submit → Case + ggf. SMS + Dashboard-Update (automatisch)
- Morning Report trackt: "Active Trial, 0 Cases created" (Founder sieht Engagement-Signal)
- Case-Notification-Mail an Founder bei jedem neuen Fall (Founder weiss, ob Prospect testet)

**Engagement-Signal (schliesst IST-Luecke L9):**
Morning Report erhaelt neuen KPI: `prospect_engagement` pro aktivem Trial.

| Signal | Wert | Berechnung |
|--------|------|-----------|
| Cases created | Anzahl | `count(cases WHERE tenant_id AND NOT is_demo AND created_at > trial_start)` |
| Last activity | Datum | `max(cases.created_at WHERE tenant_id AND NOT is_demo)` |
| Dashboard visits | — | Nicht trackbar ohne Analytics (bewusst verzichtet, DSGVO-minimal) |

Morning Report zeigt:
```
Trials:
  weinberger-ag: 14d left, 3 cases, last: gestern    ← aktiv
  doerfler-ag:   11d left, 0 cases, last: —           ← INAKTIV (YELLOW)
```

**YELLOW-Trigger:** `trial_active AND days_since_start >= 3 AND cases_created == 0`

---

### Tag 5: Engagement-Nudge (T11)

**Schliesst IST-Luecke L1 (Day-5-Email fehlt komplett).**

**Trigger:** Lifecycle Tick, `trial_age >= 5 days AND day5_nudge_sent_at IS NULL`

**Neues DB-Feld:** `day5_nudge_sent_at` (timestamptz, nullable, idempotent guard)

**E-Mail-Spezifikation:**

| Feld | Wert |
|------|------|
| Subject | `{short_name} — ein Tipp fuer Ihren Test` |
| From (Name) | `{display_name} via FlowSight` |
| To | `prospect_email` |

**Body — Meister:**
```
Guten Tag {prospect_salutation},

ein kurzer Tipp: Testen Sie Lisa am besten abends.

Rufen Sie {voice_number_formatted} um 20 Uhr an — und sehen Sie,
was passiert, wenn ein Kunde ausserhalb der Buerozeiten anruft.

Lisa nimmt ab. Die SMS kommt sofort. Der Fall steht im Dashboard.

Das ist der Moment, der den Unterschied macht.

{founder_signature}
```

**Body — Betrieb:**
```
Guten Tag {prospect_salutation},

ein kurzer Tipp: Zeigen Sie Ihrer Disponentin das Dashboard.

Oeffnen Sie {dashboard_url} und gehen Sie gemeinsam die Faelle durch.
Wenn Ihre Buerokraft sagt "Das will ich" — dann wissen Sie, dass es passt.

Tipp: Testen Sie Lisa auch nach Feierabend. Die Meldung erscheint
am naechsten Morgen in der Uebersicht — ohne Zettel, ohne Anrufbeantworter.

{founder_signature}
```

**Ton-Regeln:**
- Beilaeufig, nicht draengend ("ein kurzer Tipp", nicht "Haben Sie schon getestet?")
- Einzige Handlungsaufforderung: testen
- Kein Preis, kein Vertragshinweis, keine Feature-Liste
- Weniger als 100 Worte

**Bedingte Unterdrueckung:** Wenn `cases_created >= 3` zum Zeitpunkt des Nudge → Nudge NICHT senden (Prospect ist bereits aktiv, Nudge waere stoerend). Stattdessen: `day5_nudge_sent_at = now()` setzen mit Flag `skipped_active=true`.

---

### Tag 7: Engagement-Check (T12)

**Kein Prospect-Kontakt.** Rein interner Checkpoint.

**SOLL (erweitert gegenueber IST):**

Lifecycle Tick setzt `day7_checked_at = now()` UND speichert Engagement-Snapshot:

```json
{
  "day7_engagement": {
    "cases_total": 4,
    "cases_voice": 3,
    "cases_wizard": 1,
    "last_case_at": "2026-03-19T20:47:00Z",
    "active": true
  }
}
```

Gespeichert als JSONB in neuer Spalte `day7_snapshot` auf `tenants`.

**Morning Report Konsequenz:**
- Wenn `active=true`: Gruener Status, kein Alert
- Wenn `active=false` (0 Cases in 7 Tagen): **RED Alert** → Founder muss reagieren (Anruf oder E-Mail, nicht automatisiert)

**Entscheidung:** Day 7 bleibt bewusst ohne automatischen Prospect-Kontakt. Wenn der Prospect nach 7 Tagen nicht getestet hat, ist eine automatische E-Mail das falsche Mittel — das braucht den persoenlichen Founder-Touch. Der Morning Report ist der Trigger.

---

### Tag 10: Founder-Anruf (T14)

**Der wichtigste manuelle Touchpoint.** Nicht delegierbar, nicht automatisierbar.

**Trigger:** Morning Report YELLOW (`follow_up_at <= today`)

**Call-Script Meister:**
```
"Guten Tag Herr {prospect_name}, hier ist Gunnar Wende von FlowSight.
Ich wollte kurz fragen: Wie war Ihr Eindruck von Lisa?

[ZUHÖREN]

Hat Ihre Frau / Ihr Partner es auch gesehen?
Viele Meister zeigen die Website am Kuechentisch — das kommt immer gut an.

[Wenn positiv:]
Die Testnummer ist noch 4 Tage fuer Sie reserviert.
Wenn es passt: 299 im Monat, alles bleibt wie im Test.
Kein Vertrag, monatlich kuendbar.

[Wenn unsicher:]
Kein Problem. Testen Sie gerne noch weiter. Wenn Sie Fragen haben, rufen Sie an.

[Bei positivem Gespraech — Weiterempfehlung:]
Kennen Sie einen Kollegen in der Region, dem Lisa auch helfen koennte?
Ich baue gerne eine persoenliche Demo — Sie koennen ihm die Nummer direkt geben."
```

**Call-Script Betrieb:**
```
"Guten Tag Herr {prospect_name}, hier ist Gunnar Wende.
Wie war Ihr Eindruck von Lisa? Hat Ihre Buerokraft die Uebersicht gesehen?

[ZUHÖREN]

[Wenn Buerokraft eingebunden:]
Soll ich Ihrer Disponentin kurz zeigen, wie die Uebersicht funktioniert?

[Wenn positiv:]
299 im Monat, alles bleibt. Monatlich kuendbar.

[Weiterempfehlung:]
Kennen Sie einen Betrieb in der Region, der aehnliche Probleme hat?"
```

**Day-10-Call Logging (schliesst IST-Luecke L10):**
Nach dem Anruf: Founder aktualisiert `tenants` via Morning-Report-Antwort oder manuell:
- `follow_up_at = null` (Follow-up erledigt)
- `trial_status` bleibt `trial_active` (nicht aendern)

**Entscheidung:** Call-Scripts werden NICHT im System hinterlegt (kein Teleprompter-Gefuehl). Sie werden in gold_contact.md SS11 und in diesem Dokument dokumentiert. Founder liest sie vorher, internalisiert sie, spricht frei.

---

### Tag 13: Expiry-Reminder (T16)

**Schliesst IST-Luecken L3, L8.**

**E-Mail-Spezifikation:**

| Feld | IST | SOLL |
|------|-----|------|
| Subject | "Ihr FlowSight Trial endet bald" | `{short_name} — Ihr Test endet am {trial_end_short}` |
| From (Name) | "FlowSight" | `{display_name} via FlowSight` |
| CTA | Keiner | "Dashboard oeffnen" → Magic Link |

**Body:**
```
Guten Tag {prospect_salutation},

Ihr Test fuer {display_name} endet am {trial_end_formatted}.

Falls Sie Lisa behalten moechten — melden Sie sich.
Wir richten alles ein. 299 CHF/Monat, monatlich kuendbar.

[Button: "Dashboard oeffnen" → Magic Link]

Falls nicht: kein Problem. Ihre Daten werden sicher geloescht.
Und falls sich spaeter etwas aendert — Lisa laesst sich jederzeit wieder aufbauen.

{founder_signature}
```

**Ton:** Warm, nicht draengend. "Falls Sie moechten" — nicht "letzte Chance". Preis wird hier zum ersten Mal in einer automatischen E-Mail genannt (bewusst — der Founder hat am Tag 10 bereits persoenlich gesprochen).

---

### Tag 14: Entscheidung (T17)

**Lifecycle Tick:** `trial_status → 'decision_pending'`, `day14_marked_at = now()`

**Kein Auto-Offboard.** Founder entscheidet manuell:

| Entscheidung | Aktion | Script |
|-------------|--------|--------|
| Ja (Vertrag) | Status → `converted`, Peoplefone-Nummer, Demo-Cases loeschen, Review-Engine aktiv | Manuell |
| Noch nicht | Status → `live_dock`, `trial_end` verlaengern | Manuell |
| Nein | `offboard_tenant.mjs --slug=...` | Script |

**Grace Period:** Nach `decision_pending` bleibt der Zugang 7 Tage aktiv. Kein abrupter Abbruch. Der Prospect kann noch ins Dashboard, noch anrufen. Erst nach Offboard-Script wird der Zugang gesperrt.

---

## 5. E-Mail-Gesamtbild

### 5.1 Prospect-E-Mails (chronologisch)

| # | Tag | E-Mail | Subject | Profil-Diff? |
|---|-----|--------|---------|-------------|
| E1 | 0 | Welcome | `{display_name} — Ihr persoenlicher Test ist bereit` | Ja (Zusatzhinweis Betrieb) |
| E2 | 5 | Nudge | `{short_name} — ein Tipp fuer Ihren Test` | Ja (anderer Body) |
| E3 | 13 | Expiry | `{short_name} — Ihr Test endet am {date}` | Nein |
| E4 | 14+ | Offboarding | `{short_name} — Danke fuer Ihr Interesse` | Nein |

### 5.2 E-Mail-Design-Regeln (gilt fuer alle 4)

| Regel | Spezifikation | Referenz |
|-------|--------------|----------|
| Sender-Name | `{display_name} via FlowSight` | identity_contract.md E4 |
| From-Adresse | `noreply@send.flowsight.ch` | Domain-Constraint |
| Reply-To | `{contact_email}` des Tenants | identity_contract.md E4 |
| Logo | Tenant-Initialen in `brand_color` (kein FlowSight-Logo) | identity_contract.md R4 |
| Subject-Prefix | KEINER (kein "[FlowSight]") | Identity Contract: Tenant dominiert |
| Sprache | Du-Vermeidung, Sie-Form, Schweizer Ton | Konsistent mit Lisa-Greeting |
| Max Laenge | < 150 Worte Body-Text | Kuerze = Respekt |
| CTA-Buttons | Max 1 pro E-Mail | Klarheit |
| Signature | Founder-Name + Nummer + URL (3 Zeilen) | Persoenlich, nicht FlowSight-Banner |

### 5.3 Betrieb-E-Mails (laufend, nicht Trial-spezifisch)

| E-Mail | Trigger | Subject | An wen |
|--------|---------|---------|--------|
| Case Notification | Neuer Fall | `{short_name}: Neue Meldung — {category} in {city}` | Prospect (MAIL_REPLY_TO) |
| Reporter Confirmation | Fall + E-Mail vorhanden | `{short_name}: Ihre Meldung wurde erfasst` | Anrufer/Melder |
| Review Request | Manuell (Operator) | `{short_name}: Wie war unser Service?` | Endkunde |

**Aenderung:** Alle E-Mails verwenden `{short_name}` statt `[FlowSight]` als Subject-Prefix. Sender-Name wird `{display_name} via FlowSight`. Schliesst IST-Luecke L3.

---

## 6. Emotionaler Bogen

### 6.1 Der Bogen (SOLL)

```
Begeisterung ▲
             │
             │    [T6-T7] WOW 2+3: Lisa + SMS
             │   ╱ ╲
             │  ╱   ╲
             │ ╱     ╲  [T9] WOW 4: Dashboard
             │╱       ╲╱╲
             │         ╲  ╲   [T10] WOW 5: Abendtest
             │          ╲  ╲ ╱╲
             │           ╲  ╳  ╲    [T13] WOW 6: Echt-Moment
             │            ╲╱╲   ╲  ╱ ╲
             │        [T11]  ╲   ╲╱   ╲   [T14] Founder-Call
             │        Nudge   ╲   ╲    ╲ ╱ ╲
─────────────┼────────────────╲───╲────╳───╲────────────▶ Tage
             │   [T4-T5]       ╲       ╲    ╲
             │   Welcome        ╲       [T16] Expiry
             │   (hohe Erwartung)
             │
Desinteresse ▼
```

### 6.2 Vergleich IST vs SOLL

| Phase | IST | SOLL | Massnahme |
|-------|-----|------|----------|
| Tag 0 | WOW 1–4 konzentriert | WOW 1–4 konzentriert | Bleibt (staerkster Tag) |
| Tag 1–4 | **9-Tage-Stille** | Organische Testphase, kein Nudge | Bleibt (bewusst) |
| **Tag 5** | **NICHTS** | **Nudge-E-Mail** | **NEU: T11** |
| Tag 7 | Timestamp nur | Engagement-Snapshot + Alert | Erweitert: Day-7-Signal |
| Tag 8–9 | Stille | Kontrollierter Echt-Moment (Prospect-Initiative) | Unveraendert |
| **Tag 10** | **Follow-up ohne Script** | **Founder-Call mit Script** | **Call-Script dokumentiert** |
| Tag 13 | Generische E-Mail | Tenant-gebrandete E-Mail mit CTA + Preis | Ueberarbeitet |

**Gestaltungsprinzip:** Der emotionale Bogen hat 3 Wellen:
1. **Welle 1 (Tag 0):** Ueberraschung + Verblüffung (WOW 1–4)
2. **Welle 2 (Tag 5–10):** Vertiefung + Echt-Beweis (Nudge → Abendtest → Echt-Moment → Founder-Call)
3. **Welle 3 (Tag 13–14):** Entscheidungsfenster (Expiry-Reminder → Entscheidung)

**Zwischen den Wellen:** Stille. Das ist kein Bug, sondern Design. Der Prospect braucht Raum zum Testen und Verdauen.

---

## 7. Spiegel-Effekt: Umsetzungsregeln

Der Spiegel-Effekt (gold_contact.md SS2) muss auf jeder Oberflaeche spuerbar sein.

### 7.1 Oberflaechenregeln

| Oberflaeche | Was der Prospect sieht | Was er NICHT sehen darf |
|------------|----------------------|------------------------|
| Welcome-Mail | `{display_name}` im Subject + Body | "FlowSight Trial", "FlowSight Logo" |
| Welcome Page | "Willkommen, {display_name}" | "FlowSight OPS", "FlowSight Trial" |
| Dashboard Tab | `{short_name} OPS` | "FlowSight OPS" |
| Dashboard Sidebar | Tenant-Initialen + `{display_name}` | "FS"-Logo |
| SMS | `{short_name}` als Absender | FlowSight, Twilio-Nummer |
| Lisa Greeting | `{display_name}` gesprochen | "FlowSight", "Demo-System" |
| Case Notification | `{short_name}` im Subject | "[FlowSight]" |
| Expiry-Mail | `{short_name}` im Subject | "Ihr FlowSight Trial" |

### 7.2 Die drei Spiegel-Ebenen in der Journey

| Ebene | Moment | Was der Prospect erlebt |
|-------|--------|------------------------|
| **Wiedererkennung** | Website oeffnen (T1/T2) | "Das ist ja meine Firma." |
| **Aufwertung** | Lisa-Anruf (T6) + SMS (T7) | "So professionell hat mein Betrieb noch nie gewirkt." |
| **Projektion** | Echt-Moment (T13) | "Wenn das mit echten Kunden so laeuft..." |

Jede Ebene muss erlebt werden. Wenn der Prospect nur "Wiedererkennung" erreicht (Website gesehen, aber nie angerufen) → kein Kauf. Das System muss den Prospect zur zweiten Ebene fuehren — das ist die Aufgabe von T5 (Welcome Page CTA) und T11 (Day-5-Nudge).

---

## 8. Sonderfaelle

### 8.1 Prospect testet nicht (0 Cases nach 7 Tagen)

**Trigger:** Day-7-Engagement-Check → `active=false`

**Eskalation:**
1. Morning Report: RED Alert "Inaktiver Trial: {slug}"
2. Founder entscheidet: Anruf, E-Mail oder Abwarten
3. Kein automatisches Nachhaken (wirkt verzweifelt)
4. Wenn nach Tag 10 immer noch 0 Cases: Founder-Call nutzen, um direkt zu fragen

**Entscheidung:** Kein automatischer "Wir vermissen Sie"-Reminder. Das ist Spam-Territorium. Der Founder ruft persoenlich an — oder akzeptiert, dass dieser Prospect kein Fit ist.

### 8.2 Prospect will frueher entscheiden

**Trigger:** Prospect meldet sich vor Tag 10 mit "Ich will das haben."

**Ablauf:**
1. Founder bestaetigt Interesse
2. Vertrag + Preis kommunizieren (299 CHF/Monat, monatlich kuendbar)
3. `trial_status → converted`, `trial_end → null`
4. Demo-Cases loeschen, Peoplefone-Nummer zuweisen
5. Welcome-to-Production-Mail senden

**Kein kuenstliches Hinauszoegern.** Wenn der Prospect am Tag 3 Ja sagt, nehmen wir das Ja.

### 8.3 Prospect will Kollegin/Disponentin einbinden

**Trigger:** Betrieb-Profil, Prospect fragt nach zweitem Zugang.

**Ablauf:**
1. Founder/CC erstellt zweiten Auth-User mit `role='prospect'`, gleicher `tenant_id`
2. Neuer Magic Link per E-Mail an Disponentin
3. Disponentin sieht exakt dasselbe Dashboard (RLS-scoped)

**Entscheidung:** Maximal 2 Prospect-Zugaenge pro Trial. Kein Self-Service ("Benutzerkonto anlegen"). Founder/CC erstellt manuell.

### 8.4 Magic Link abgelaufen

**Trigger:** Prospect klickt Link nach >24h (Supabase-Default)

**Ablauf:**
1. Redirect zu `/ops/login` mit Fehlermeldung
2. Prospect gibt E-Mail ein → neuer Magic Link per Supabase OTP
3. Session wird erstellt → Redirect zu `/ops/welcome`

**Entscheidung:** Kein "Link abgelaufen, kontaktieren Sie uns"-Sackgasse. Die Login-Seite ist der Selbsthilfe-Fallback. Das ist bereits implementiert und funktioniert.

---

## 9. Offboarding-Erlebnis

Offboarding ist der letzte Eindruck. Wenn der letzte Eindruck schlecht ist, kommt der Prospect nie zurueck — und empfiehlt uns nie weiter.

### 9.1 Offboarding-Mail (ueberarbeitet)

**Subject:** `{short_name} — Danke fuer Ihr Interesse`

**Body:**
```
Guten Tag {prospect_salutation},

Ihr Test fuer {display_name} ist abgelaufen.
Vielen Dank, dass Sie Lisa getestet haben.

In den letzten 14 Tagen hatten Sie Zugang zu:
• Lisa — Ihrer persoenlichen KI-Assistentin
• Automatischen SMS-Bestaetigungen
• Einem Dashboard mit Falluebersicht
• Einem Bewertungssystem fuer Ihre Kunden

Ihre Daten werden sicher geloescht.
Falls sich spaeter etwas aendert — Lisa laesst sich jederzeit wieder aufbauen.
Rufen Sie mich einfach an.

{founder_signature}
```

**Ton:** Dankbar, nicht enttaeuscht. Tuer bleibt offen, aber kein Betteln.

---

## 10. Architekturfolgen

Implementierungskonsequenzen aus diesem Zielbild. Keine Tasks, sondern Anforderungen an das System.

### 10.1 Neue DB-Felder

| Feld | Tabelle | Typ | Zweck |
|------|---------|-----|-------|
| `day5_nudge_sent_at` | `tenants` | timestamptz | Idempotent guard fuer Day-5-Nudge |
| `day7_snapshot` | `tenants` | jsonb | Engagement-Metriken bei Day-7-Check |
| `prospect_name` | `tenants` | text | Fuer personalisierte Anrede |
| `prospect_salutation` | Abgeleitet | — | "Herr Weinberger" aus prospect_name |

### 10.2 Geaenderte Scripts

| Script | Aenderung |
|--------|----------|
| `provision_trial.mjs` | `--team-size` Parameter → steuert Demo-Case-Anzahl. `--prospect-name` fuer Anrede. Welcome-Mail-Template ueberarbeiten. |
| `seed_demo_data.mjs` | Count aus `team_size` ableiten: solo/small → 3, team → 8. |
| `lifecycle/tick` | Day-5-Nudge-Logik hinzufuegen. Day-7-Snapshot speichern. Day-13-Mail-Template ueberarbeiten. |
| `morning_report.mjs` | Engagement-Signal pro Trial anzeigen (Cases, letzte Aktivitaet). |
| `offboard_tenant.mjs` | Offboarding-Mail-Template ueberarbeiten. |

### 10.3 Geaenderte E-Mail-Templates

Alle 7 E-Mail-Templates muessen ueberarbeitet werden (IST-Luecke L3):
1. Welcome-Mail → Tenant-Branding, Personalisierung, Profil-Differenzierung
2. Day-5-Nudge → Komplett neu
3. Day-13-Expiry → Tenant-Branding, CTA, Preis
4. Offboarding-Mail → Tenant-Branding, waermerer Ton
5. Case Notification → `{short_name}` statt `[FlowSight]`
6. Reporter Confirmation → `{short_name}` statt `[FlowSight]`
7. Review Request → `{short_name}` statt `[FlowSight]`

### 10.4 UI-Aenderungen

| Komponente | Aenderung |
|-----------|----------|
| Welcome Page | Trial-Countdown, Tagline ohne "FlowSight", Profil-CTAs, Footer dezenter |
| Cases Page | Zwei Tabs ("Ihre Faelle" / "Beispiel-Faelle"), Leerer-Zustand mit CTA |
| Sidebar | Disabled Nav-Items fuer Prospects ausblenden |
| Browser Tab | `{short_name} OPS` statt "FlowSight OPS" |

---

## 11. Goldstandard-Kriterien

Woran wir erkennen, dass die Prospect Journey Gold-Contact-Niveau erreicht hat.

### 11.1 WOW-Moment-Pruefung

| WOW | Moment | Pruefung | Bestanden? |
|-----|--------|---------|------------|
| 1 | "Meine Firma" | Prospect oeffnet Website auf Handy → sieht seinen Betrieb, seine Farben, seine Reviews | [ ] |
| 2 | "Lisa kennt mich" | Prospect ruft an → Lisa sagt seinen Firmennamen, PLZ stimmt, Ton stimmt | [ ] |
| 3 | "Mein Handy vibriert" | Anruf beendet → SMS in <10s, richtiger Absendername, Korrekturlink funktioniert | [ ] |
| 4 | "Da steht alles" | Dashboard → Testfall da, Kategorie/PLZ/Beschreibung korrekt, Demo-Cases in eigenem Tab | [ ] |
| 5 | "Auch nachts" | Abendtest → Lisa nimmt ab, SMS kommt, Fall im Dashboard | [ ] |
| 6 | "Mein Kunde begeistert" | Echt-Moment → Endkunde bekommt SMS von "{short_name}", Fall korrekt im Dashboard | [ ] |

### 11.2 Spiegel-Test

| Pruefung | Bestanden? |
|---------|------------|
| Welcome-Mail: Subject + Body zeigen Tenant-Name, nicht FlowSight | [ ] |
| Welcome Page: Greeting zeigt Tenant-Name, kein "FlowSight Trial" | [ ] |
| Dashboard Tab: "{short_name} OPS", nicht "FlowSight OPS" | [ ] |
| Sidebar: Tenant-Initialen + Name, nicht "FS" | [ ] |
| Alle E-Mails: Sender-Name = "{display_name} via FlowSight" | [ ] |
| Day-5-Nudge: Subject zeigt Tenant-Name | [ ] |
| Day-13-Expiry: Subject zeigt Tenant-Name + Datum | [ ] |
| Case Notification: Subject zeigt `{short_name}`, nicht "[FlowSight]" | [ ] |

### 11.3 Journey-Vollstaendigkeits-Test

| Pruefung | Bestanden? |
|---------|------------|
| Tag 0: Provisioning < 15 Min + Welcome-Mail kommt an | [ ] |
| Tag 0: Magic Link funktioniert → Welcome Page | [ ] |
| Tag 0: Erster Anruf → SMS → Dashboard-Fall | [ ] |
| Tag 5: Nudge-Mail kommt an (oder: unterdrueckt weil aktiv) | [ ] |
| Tag 7: Engagement-Snapshot im Morning Report sichtbar | [ ] |
| Tag 10: Founder hat Call-Script gelesen und internalisiert | [ ] |
| Tag 13: Expiry-Mail kommt an, CTA funktioniert | [ ] |
| Tag 14: Status → decision_pending, Founder wird informiert | [ ] |
| Profil: Meister bekommt 3 Demo-Cases, Betrieb bekommt 8 | [ ] |
| Profil: Welcome-CTA differenziert (Anruf vs Dashboard) | [ ] |

---

## 12. Offene Entscheidungen

Bewusst nicht in diesem Dokument getroffen. Werden spaeter entschieden.

| # | Frage | Wo entscheiden | Warum nicht hier |
|---|-------|---------------|-----------------|
| O1 | Wizard-Erlebnis als alternativer Testkanal | wizard.md Zielbild | Wizard hat eigene UX-Logik, Journey referenziert ihn als Touchpoint |
| O2 | Review-Flow nach Case-Erledigung | review.md Zielbild | Review ist Post-Conversion-Schwerpunkt (WOW 7) |
| O3 | Zweiter Magic Link fuer Disponentin (UX) | Implementierung | Technisch trivial, UX-Detail |
| O4 | Welcome-to-Production-Mail (nach Conversion) | Implementierung | Post-Journey, nicht Teil der Trial-Journey |
| O5 | Analytics/Tracking im Dashboard | DSGVO-Pruefung | Bewusst nicht implementiert (Datensparsamkeit) |

---

## 13. Zusammenfassung

### Was dieser Strang loest

| IST-Luecke | Loesung | Sektion |
|-----------|---------|---------|
| L1: Day-5-Email fehlt | Day-5-Nudge mit Profil-Differenzierung | SS4 Tag 5 |
| L2: Demo-Case-Filtering fehlt | Zwei Tabs: "Ihre Faelle" / "Beispiel-Faelle" | SS4 Tag 0 (T9) |
| L3: E-Mails zeigen FlowSight | Alle 7 Templates auf Tenant-Branding umgestellt | SS5 |
| L4: Welcome-Mail nicht personalisiert | `{prospect_salutation}`, `{display_name}`, Profil-Diff | SS4 Tag 0 (T4) |
| L5: Kein Profil-Routing | Meister vs Betrieb durchgaengig differenziert | SS2, SS4, SS5 |
| L6: Tab-Titel falsch | `{short_name} OPS` | SS7.1 |
| L7: Founder-Footer | Dezente Signatur statt Banner | SS4 Tag 0 (T5) |
| L8: Day-13 ohne CTA | Magic-Link-Button + Preis | SS4 Tag 13 |
| L9: Kein Engagement-Tracking | Morning Report KPI + Day-7-Snapshot | SS4 Tag 1–4, Tag 7 |
| L10: Day-10-Call-Script fehlt | Dokumentiert fuer beide Profile | SS4 Tag 10 |
| L11: Disabled Nav sichtbar | Fuer Prospects ausblenden | SS10.4 |
| L13: Case-Notification an Founder | Prospect sieht Cases im Dashboard; Notification kuenftig auch an Prospect | SS5.3 |
