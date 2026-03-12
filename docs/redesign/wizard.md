# Wizard — Zielbild (Gold)

**Typ:** SSOT-Zielbild (Gold)
**Stand:** 2026-03-12
**IST-Grundlage:** wizard_ist.md (20 dokumentierte Luecken, L1–L20)
**Nordstern:** gold_contact.md (5 Kaufstufen, 7 WOW-Momente, 2 Profile)
**Referenziert:** identity_contract.md (R1–R7, E1–E6), prospect_journey.md, voice.md

---

## 1. Executive Summary

Der Wizard ist der schriftliche Eingang in das Leitsystem.
Er ist nicht das Kontaktformular einer Website — er ist die schriftliche Version von Lisa.

Lisa nimmt am Telefon entgegen: empathisch, strukturiert, professionell.
Der Wizard tut dasselbe schriftlich: klar, schnell, sicher.

Beide Kanaele produzieren denselben Fall im selben Leitstand. Beide tragen den Betriebsnamen, dieselben Kategorien, dieselbe Vertrauenshandschrift. Der Endkunde merkt keinen Systembruch — nur einen anderen Kanal.

### Was dieses Dokument definiert

- Den vollstaendigen Erlebnisbogen von Einstieg bis Bestaetigung
- Die Notfall-Logik (wann wird auf Anruf gelenkt, wann Schnellweg)
- Die Post-Submit-Kette als durchgaengiges Betriebserlebnis
- Die bewusste Gleichheit und bewusste Differenz zu Voice
- Die Uebergabequalitaet an den Leitstand
- Das Erwartungsmanagement an jedem Punkt

### Was dieses Dokument NICHT ist

- Kein Formular-Optimierungsdokument (keine Feldbreiten, keine Spacing-Specs)
- Kein Architektur-Dokument (keine DB-Schemas, keine API-Specs)
- Kein Parallelprodukt-Entwurf (ein Produkt, ein Leitsystem, zwei Kanaele)

### Kernthese

> Der Wizard ersetzt kein Gespraech. Er ersetzt die Zettelwirtschaft.
> Sein Versprechen: "Sie muessen uns nicht anrufen — aber wir kuemmern uns genauso."
> Sein Beweis: dieselbe Fall-Nr., dieselbe Bestaetigung, dasselbe Leitstand-Ergebnis.

---

## 2. Grundprinzipien

6 verbindliche Prinzipien. Jede Designentscheidung in diesem Dokument muss gegen sie bestehen.

### P1: Fuehrung statt Befragung

Der Wizard fuehrt den Endkunden. Er fragt nicht ab.
Jeder Schritt hat einen klaren Kontext ("Warum brauchen wir das"), einen naechsten Schritt ("Was passiert danach"), und reduziert Unsicherheit statt sie zu erzeugen.

**IST-Verstoss:** Schritt 2 (Adresse) ist ein blankes Formular ohne Kontext.
**Ziel:** Jeder Schritt beginnt mit einem Satz, der den Zweck erklaert — nicht als Prosa, sondern als Orientierungshilfe.

### P2: Ein Produkt, zwei Kanaele

Wizard und Voice sind zwei Eingaenge in dasselbe Leitsystem.
Gleiche Kategorien, gleiche PLZ-Logik, gleiche Fall-Struktur, gleiche Bestaetigung.
Wo sie sich unterscheiden, ist das eine bewusste Entscheidung — kein historischer Zufall.

**IST-Verstoss:** Kategorie-Listen divergieren. PLZ-Korrektur nur in Voice.

### P3: Mobile-first unter Druck

80% der Wizard-Nutzer haben ein Problem. Viele stehen vor dem kaputten Rohr.
Der Wizard muss auf einem Handy, mit einer Hand, in unter 90 Sekunden bedienbar sein.
Kein Scrolling-Marathon, keine versteckten Buttons, kein Desktop-first-Denken.

**IST-Verstoss:** Kein `capture="environment"` fuer Fotos (Verify hat es, Wizard nicht).

### P4: Notfall-Bewusstsein

Der Wizard erkennt Dringlichkeit und reagiert darauf.
"Notfall" ist keine Formular-Auswahl — es ist ein Trigger, der den Ablauf veraendert.
Wenn Lisa bei einem Notfall sofort reagiert, darf der Wizard nicht einfach weiterfragen.

**IST-Verstoss:** Notfall = gleicher 3-Schritte-Ablauf wie Normal. Kein Shortcut, kein Sofort-Hinweis.

### P5: Betrieb sichtbar, FlowSight unsichtbar

Jede Oberflaeche, die der Endkunde sieht, traegt den Betriebsnamen und die Brand Color.
Kein FlowSight-Logo, kein FlowSight-Name, kein FlowSight-Teal.
Ausnahme: Footer "powered by FlowSight" (klein, dezent, R4-konform).

**IST-Verstoss:** Korrektur-Seite komplett in FlowSight-Teal, ohne Betriebsname.

### P6: Vollstaendige Uebergabe

Ein Wizard-Fall, der im Leitstand landet, muss arbeitsfaehig sein.
Das heisst: Der Betrieb kann den Techniker losschicken, ohne Rueckfragen.
Mindestens: Kategorie, Dringlichkeit, vollstaendige Adresse, Kontakt, Beschreibung.

**IST-Verstoss:** Grundsaetzlich erfuellt (Wizard hat mehr Pflichtfelder als Voice), aber: keine PLZ-Validation, kein Service-Area-Check, keine Phone-Validation.

---

## 3. Notfall-Logik

Die haerteste Entscheidung dieses Zielbilds. Kein Kompromiss.

### 3.1 Grundregel

> Ein Notfall im Wizard fuehrt IMMER zuerst zum Telefon.
> Der Wizard bleibt als Rueckfall-Option, nicht als Primaerweg.

**Begruendung:** Ein echtes Notfall-Problem (Rohrbruch, Heizungsausfall im Winter, Wasserschaden) braucht sofortige Reaktion. Ein Formular kann keine Rueckfrage stellen, keine Beruhigung bieten, keine Sofort-Disposition ausloesen.

### 3.2 Ablauf

```
Endkunde waehlt Kategorie + Dringlichkeit "Notfall"
    │
    ▼
┌─────────────────────────────────────────────────────┐
│  NOTFALL-SCREEN                                      │
│                                                      │
│  "Bei einem Notfall erreichen Sie uns am schnellsten │
│   telefonisch."                                      │
│                                                      │
│  ┌───────────────────────────────────────┐           │
│  │  ☎ {display_name} anrufen            │           │
│  │  {emergency_phone_formatted}          │           │
│  └───────────────────────────────────────┘           │
│                                                      │
│  Lisa ist rund um die Uhr erreichbar und leitet      │
│  Ihren Notfall sofort weiter.                        │
│                                                      │
│  ─────────────────────────────────────               │
│  Sie koennen gerade nicht telefonieren?              │
│  [Schriftlich melden →]                              │
│                                                      │
│  Hinweis: Schriftliche Meldungen werden              │
│  schnellstmoeglich bearbeitet, aber eine             │
│  telefonische Meldung erreicht uns schneller.        │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 3.3 Regeln

| Regel | Beschreibung |
|-------|-------------|
| N1 | Notfall-Screen erscheint sofort nach Auswahl "Notfall" — kein Weiter-Button |
| N2 | Primaer-CTA ist IMMER der Anruf (Telefon-Link, groesster Button) |
| N3 | "Schriftlich melden" ist Sekundaer-Option (kleiner, unterer Link) |
| N4 | Klick auf "Schriftlich melden" → weiter zu Schritt 2 (Adresse) mit Notfall vorausgewaehlt |
| N5 | Wenn `emergency.enabled === false` → Notfall-Screen wird uebersprungen, normaler Ablauf |
| N6 | Notfall-CTA nutzt `emergency.phone` / `emergency.phoneRaw`, NICHT `contact.phone` |
| N7 | Notfall-Wording: `{display_name}`, nicht "uns" oder "FlowSight" |

### 3.4 Voice-Klammer

Wenn der Endkunde den Anruf-CTA nutzt, landet er bei Lisa.
Lisa erkennt den Notfall im Gespraech und eskaliert.
→ Der Wizard hat seinen Job getan: Kanal gewechselt, wo der bessere Kanal greift.

### 3.5 Kein Notfall-Dienst = andere Logik

Wenn `emergency.enabled === false`: Der Notfall-Screen entfaellt. Stattdessen erscheint bei Auswahl "Notfall" ein Warnhinweis inline:

> "Notfall-Meldungen werden mit hoechster Prioritaet bearbeitet.
> Fuer sofortige Hilfe: {contact_phone}"

Kein Screen-Wechsel, kein Ablauf-Unterbruch. Nur ein Hinweis.

---

## 4. Erlebnisbogen

### 4.1 Phasen-Uebersicht

```
Einstieg ──▶ Anliegen ──▶ [Notfall?] ──▶ Adresse ──▶ Kontakt + Beschreibung ──▶ Submit
                                                                                    │
                                                                                    ▼
                               Bestaetigt ◀── [SMS] ◀── [E-Mail] ◀── Success-Screen
                                    │
                                    ▼
                              [Korrektur-Seite]
```

### 4.2 Schritt 1 — Anliegen

**Ueberschrift:** "Was ist passiert?"
**Erklaerung:** "Waehlen Sie die passende Kategorie. Wir leiten Ihre Meldung direkt an das richtige Team weiter."

**Kategorien:**
- Obere Reihe: 3 problem-spezifische Kategorien (dynamisch, pro Tenant, aus `categories[]`)
- Untere Reihe: 3 fixe Kategorien (Allgemein, Angebot, Kontakt)
- **Quelle: identisch mit Voice** (siehe §7, Entscheidung E1)

**Dringlichkeit:** 3 Stufen — Notfall / Dringend / Normal.
Bei "Notfall" → Notfall-Screen (§3). Bei Dringend/Normal → weiter zu Schritt 2.

**Fuehrungssatz am Ende:**
- Bei Dringend: "Wir melden uns heute oder morgen bei Ihnen."
- Bei Normal: "Wir melden uns innert 1–2 Werktagen."

**Entscheidung:** Diese Saetze sind Orientierung, keine SLA-Garantie. Sie setzen Erwartung, ohne rechtlich zu binden. Kein SLA-Wording ("garantiert"), kein Zeitfenster ("innert 4h").

### 4.3 Schritt 2 — Adresse

**Ueberschrift:** "Wo ist der Einsatzort?"
**Erklaerung:** "Damit wir den richtigen Techniker schicken koennen."

**Felder:** Strasse + Nr. (required), PLZ (required), Ort (auto-filled).

**PLZ-Logik:**
- Endkunde tippt PLZ (4-stellig, numerisch, validiert).
- System loest PLZ gegen `PLZ_CITY_MAP` auf → Ort wird automatisch ausgefuellt.
- Falls PLZ nicht in Map: Ort-Feld bleibt editierbar, Endkunde tippt selbst.
- `PLZ_CITY_MAP` ist dieselbe Map wie in Voice (shared module).

**Service-Area-Hinweis:**
- Falls `service_area_plz[]` konfiguriert UND eingegebene PLZ nicht enthalten:
  - Gelber Hinweis: "Diese PLZ liegt ausserhalb unseres ueblichen Einzugsgebiets. Ihre Meldung wird trotzdem aufgenommen."
  - Kein Block. Kein Abbruch. Nur Transparenz.
- Falls `service_area_plz[]` nicht konfiguriert: kein Hinweis (Defaultverhalten).

**Fuehrungssatz:** "Naechster Schritt: Ihre Kontaktdaten."

### 4.4 Schritt 3 — Kontakt + Beschreibung + Fotos

**Ueberschrift:** "Wie erreichen wir Sie?"
**Erklaerung:** "Name und mindestens Telefon oder E-Mail — damit der Techniker Sie vor Ort erreichen kann."

**Kontaktdaten:**
- Name (required)
- Telefon (optional, aber empfohlen — Format-Validierung: `+41` oder `0xx`-Prefix, min 10 Ziffern)
- E-Mail (optional — Format-Validierung: `@` + Domain)
- Mindestens eines von Telefon/E-Mail required

**Beschreibung:**
- Freitext (required, min 10 Zeichen)
- Placeholder: "Beschreiben Sie kurz, was passiert ist…"
- Unter dem Feld: "Je genauer Sie beschreiben, desto besser kann sich der Techniker vorbereiten."

**Fotos:**
- Optional, max 5 Dateien a 10 MB
- `accept="image/*,video/*"` + `capture="environment"` (Kamera-Direktzugriff auf Handy)
- Framing: "Foto vom Schaden? Hilft bei der Einschaetzung." (nicht: "optional", nicht: "laden Sie hoch")

**Submit-Button:** "Meldung absenden"
**Darunter:** `{display_name}` meldet sich {erwartungs_text}.
- Notfall: "so schnell wie moeglich"
- Dringend: "heute oder morgen"
- Normal: "innert 1–2 Werktagen"

---

## 5. Post-Submit-Kette

Die Post-Submit-Kette ist EIN zusammenhaengendes Betriebserlebnis.
Nicht drei getrennte Systeme, sondern eine Bestaetigung in drei Stufen.

### 5.1 Identitaets-Klammer

Jede Stufe traegt:
- `display_name` (Firmenname des Betriebs)
- `brand_color` (Akzentfarbe)
- `FS-{seq_number}` (lesbare Fall-Nr., nicht UUID-Fragment)
- Keine FlowSight-Referenz ausser Footer "powered by"

### 5.2 Stufe 1: Success-Screen (sofort)

```
┌─────────────────────────────────────────────────────┐
│  ✓  Ihre Meldung wurde aufgenommen.                 │
│                                                      │
│  Fall-Nr:        FS-0029                             │
│  Kategorie:      Verstopfung                         │
│  Dringlichkeit:  Dringend                            │
│  Einsatzort:     Seestrasse 15, 8942 Oberrieden     │
│                                                      │
│  ━━━ Was passiert jetzt? ━━━                         │
│                                                      │
│  1. {display_name} wurde soeben benachrichtigt.      │
│  2. Sie erhalten gleich eine SMS-Bestaetigung.       │
│  3. {erwartungs_text}                                │
│                                                      │
│  [Upload-Fortschritt: Foto 1/2 ✓, Foto 2/2 ⏳]     │
│                                                      │
│  [Zurueck zur Website]    [Neue Meldung]             │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Regeln:**
- S1: Fall-Nr. = `FS-{seq_number}` (4-stellig, gepadded). Nie UUID.
- S2: "Was passiert jetzt?" ist Pflichtblock. Nie weglassen.
- S3: Punkt 1 nennt `{display_name}`, nicht "wir", nicht "das Team".
- S4: Punkt 2 nur wenn `contact_phone` vorhanden (SMS wird ja nur mit Telefon gesendet).
- S5: Punkt 3 = Erwartungssatz aus §4.4, konsistent mit Dringlichkeit.
- S6: Notfall + emergency.enabled → zusaetzlicher Hinweis: "Fuer sofortige Hilfe: {emergency.phone}"

### 5.3 Stufe 2: SMS (30 Sekunden nach Submit)

**Absender:** `{short_name}` (Identity Contract R5 — SMS hat Laengenlimit)

**Text:**
```
{short_name}: Ihre Meldung (FS-{seq_number}, {category}) wurde aufgenommen.

Erfasste Adresse:
{street} {house_number}, {plz} {city}

Stimmt alles? Haben Sie Fotos vom Schaden?
{correction_url}

{display_name} meldet sich {erwartungs_text}.
```

**Regeln:**
- SMS1: Fall-Referenz = `FS-{seq_number}` (gleich wie Success-Screen).
- SMS2: Letzter Satz = Erwartungsmanagement, konsistent mit Screen.
- SMS3: Wenn Adresse fehlt (Voice-Case ohne Street): CTA wechselt zu "Bitte ergaenzen Sie Ihre Adresse."
- SMS4: `{display_name}` im Schluss-Satz, nicht "Wir" oder "Ihr Team".

### 5.4 Stufe 3: Korrektur-Seite (via SMS-Link)

Die Korrektur-Seite MUSS sich anfuehlen wie eine Fortsetzung der Meldung, nicht wie eine fremde Seite.

**Design-Regeln:**
- K1: Header zeigt `{display_name}` in `{brand_color}` (identisch mit Wizard-TopBar)
- K2: Akzentfarbe = `{brand_color}`, nicht Teal, nicht FlowSight-Palette
- K3: Ueberschrift: "Ihre Meldung FS-{seq_number} pruefen"
- K4: Gleiche Fall-Nr. wie Success-Screen und SMS
- K5: Vorausgefuellte Felder: Name, Strasse, Nr., PLZ, Ort
- K6: Foto-Upload mit `capture="environment"` (Handy-Kamera-Direktzugriff)
- K7: Erfolg: "Danke — Ihre Angaben wurden aktualisiert. {display_name} hat alles, was noetig ist."
- K8: Case-Event bei Korrektur: `address_corrected` oder `photos_added` (Betrieb sieht im Leitstand, dass korrigiert wurde)
- K9: Footer: "powered by FlowSight" (klein, dezent — wie Wizard)

---

## 6. Erwartungsmanagement

Jeder Moment im Wizard beantwortet drei Fragen:
1. Was passiert gerade?
2. Was kommt als Naechstes?
3. Wann meldet sich jemand?

### 6.1 Matrix

| Moment | Was passiert | Was kommt | Wann jemand |
|--------|-------------|-----------|------------|
| Einstieg | "Meldung erfassen" | "3 kurze Schritte" | — |
| Schritt 1 (Kategorie gewaehlt) | Kategorie + Dringlichkeit erfasst | "Adresse" | Fuehrungssatz: Zeitrahmen nach Dringlichkeit |
| Schritt 2 (Adresse) | Einsatzort erfasst | "Kontakt + Beschreibung" | — |
| Schritt 3 (vor Submit) | Alle Daten vollstaendig | "Meldung absenden" | Erwartungssatz: "{display_name} meldet sich…" |
| Submit | "Wird gesendet…" | — | — |
| Success-Screen | Meldung aufgenommen | "SMS kommt gleich" | "1. Betrieb benachrichtigt. 2. SMS. 3. Zeitrahmen." |
| SMS | Bestaetigung | Korrektur-Link | "{display_name} meldet sich…" |
| Korrektur-Seite | Daten pruefen/ergaenzen | — | "…hat alles, was noetig ist." |

### 6.2 Erwartungssaetze (canonical, Dringlichkeits-abhaengig)

| Dringlichkeit | Satz |
|---------------|------|
| Notfall | "{display_name} meldet sich so schnell wie moeglich bei Ihnen." |
| Dringend | "{display_name} meldet sich heute oder morgen bei Ihnen." |
| Normal | "{display_name} meldet sich innert 1–2 Werktagen bei Ihnen." |

**Regel E-MGT-1:** Dieser Satz erscheint identisch auf Success-Screen, SMS und Korrektur-Seite. Keine Varianten, keine Umformulierungen. Eine Stimme.

---

## 7. Wizard ↔ Voice: Bewusste Gleichheit, bewusste Differenz

### 7.1 MUSS gleich sein (non-negotiable)

| Dimension | Regel | Begruendung |
|-----------|-------|-------------|
| Kategorien | Gleiche Quelle, gleiche Labels | Identity Contract R2. Leitstand sieht sonst Chaos. |
| Dringlichkeitsstufen | Gleiche 3 Stufen (notfall/dringend/normal) | Case Contract. Keine Sonder-Stufen pro Kanal. |
| PLZ-Korrektur | Gleiche `PLZ_CITY_MAP` | Identity Contract R3. Datenqualitaet darf nicht kanalabhaengig sein. |
| Fall-Struktur | Gleiche DB-Spalten, gleicher Case-Event-Flow | Ein Leitsystem, nicht zwei. |
| Bestaetigung (SMS) | Gleicher SMS-Text, gleiche Fall-Nr. | Endkunde soll denselben Beleg bekommen, egal wie gemeldet. |
| Ops-E-Mail | Gleiches Template, anderes Source-Label | Betrieb sieht konsistente Benachrichtigungen. |
| `display_name` auf allen Flaechen | Gleiche Quelle (Identity Contract R1) | Ein Betrieb, ein Name. |

### 7.2 DARF anders sein (bewusste Differenz)

| Dimension | Voice | Wizard | Begruendung |
|-----------|-------|--------|-------------|
| Adresse | PLZ + Ort required, Strasse optional | Alle 4 Felder required | Schriftlich kann man mehr eingeben. Muendlich ist Strassenname fehleranfaellig (STT). |
| E-Mail | Nicht erfasst | Optional | Wizard-Vorteil: schriftlicher Kanal = E-Mail natuerlich. |
| Fotos | Nicht moeglich (nachgelagert via SMS) | Direkt im Formular | Wizard-Vorteil: visuelles Medium. |
| Beschreibung | Transkript oder AI-Summary (lang, manchmal unstrukturiert) | Freitext (kuerzer, strukturierter) | Verschiedene Eingabe-Modalitaeten, gleichwertiges Ergebnis. |
| Notfall-Reaktion | Lisa erkennt, beruhigt, eskaliert in Echtzeit | Notfall-Screen → Anruf-CTA (§3) | Schriftlich kann man nicht beruhigen. Also: zum besseren Kanal lenken. |
| KI-Disclosure | Pflicht im Greeting ("Ich bin Lisa, eine KI-Assistentin") | Nicht noetig (Formular, nicht KI) | Keine Taeuschung, also kein Disclosure noetig. |
| Kontaktdaten | Automatisch (Caller-ID) | Manuell (Name + Phone/Email) | Voice hat Phone geschenkt. Wizard nicht. |

### 7.3 DARF NICHT mehr existieren (historische Differenzen, die abgebaut werden)

| Differenz | IST | SOLL |
|-----------|-----|------|
| Kategorie-Labels divergieren | Voice: 6 hardcoded. Wizard: 3+3 dynamisch. | Eine Quelle: `categories[]` im Tenant-Config (Identity Contract R2). |
| PLZ-Korrektur nur in Voice | Voice: PLZ_CITY_MAP. Wizard: nichts. | Shared `PLZ_CITY_MAP`-Modul, genutzt von beiden. |
| Fall-Nr. verschieden dargestellt | Voice-SMS: FS-XXXX. Wizard-Success: UUID-Fragment. | Ueberall: FS-{seq_number}. |
| Korrektur-Seite ohne Branding | Teal, kein Firmenname. | Brand Color + display_name (§5.4). |
| Ops-E-Mail-Absender "FlowSight Ops" | Heute. | `{email_sender_name}` = `{display_name} via FlowSight` (Identity Contract E4). |

---

## 8. Kategorie-Vereinheitlichung

### 8.1 Entscheidung E1: Eine Quelle fuer Kategorien

**Quelle:** `categories[]` in der Tenant-Konfiguration (Supabase Zielbild, CustomerSite Registry Uebergang).

**Struktur pro Kategorie:**
```
{
  value: "verstopfung",          // Systemname (snake_case, stabil)
  label: "Verstopfung",          // Anzeigename (deutsch, fuer UI + Voice)
  hint: "Abfluss, WC, Leitung",  // Kurzerklaerung
  iconKey: "drain",              // Wizard-Icon (nur Wizard)
  problem: true                   // true = Problem, false = Anfrage (Angebot, Kontakt)
}
```

**Wizard-Rendering:**
- Obere Reihe: Top 3 Kategorien mit `problem: true` (Reihenfolge: Konfig-Reihenfolge)
- Untere Reihe: Kategorien mit `problem: false` + "Allgemein" (immer vorhanden)

**Voice-Rendering:**
- `retell_sync.mjs` liest `categories[]` und schreibt sie in den Agent-Prompt
- Labels identisch, keine Uebersetzung, kein Mapping

**Regel:** Wenn ein Betrieb eine Kategorie hat, haben Wizard UND Voice sie. Wenn eine Kategorie entfernt wird, verschwindet sie auf beiden Kanaelen. Kein eigenstaendiges Pflegen.

### 8.2 PLZ_CITY_MAP als Shared Module

**Entscheidung:** `PLZ_CITY_MAP` wird ein shared Modul in `src/lib/geo/plzCityMap.ts`.
- Voice-Webhook importiert es
- Wizard-Frontend nutzt es (client-seitig fuer Autofill)
- Beide validieren PLZ-Format (genau 4 Ziffern)

**Erweiterung:** `service_area_plz[]` (Identity Contract) ergaenzt die Map um die Einzugsgebiet-Pruefung. Wizard zeigt Hinweis (§4.3), Voice kann kuenftig dasselbe tun.

---

## 9. Leitstand-wuerdige Uebergabe

### 9.1 Was im Fall vorliegen muss

Ein Wizard-Fall ist arbeitsfaehig, wenn der Betrieb den Techniker losschicken kann.

| Feld | Pflicht | Validierung |
|------|---------|-------------|
| `category` | Ja | Aus `categories[]` (Auswahl, nicht Freitext) |
| `urgency` | Ja | Aus ["notfall", "dringend", "normal"] |
| `street` | Ja | Min 1 Zeichen |
| `house_number` | Ja | Min 1 Zeichen |
| `plz` | Ja | Genau 4 Ziffern |
| `city` | Ja | Min 1 Zeichen (auto-filled via PLZ-Map wenn moeglich) |
| `reporter_name` | Ja | Min 2 Zeichen |
| `contact_phone` oder `contact_email` | Mind. 1 | Phone: Format-Check. Email: Format-Check. |
| `description` | Ja | Min 10 Zeichen |
| Fotos | Nein | Max 5, je 10 MB |

### 9.2 Case-Events

Jeder relevante Schritt erzeugt ein Case-Event im Leitstand:

| Event | Trigger | Titel |
|-------|---------|-------|
| `case_created` | DB-Insert | "Fall erstellt via Website-Formular" |
| `email_notification_sent` | Ops-Email versandt | "Benachrichtigung an Betrieb gesendet" |
| `reporter_confirmation_sent` | Reporter-Email versandt | "Bestaetigung an Melder gesendet" |
| `sms_sent` | SMS versandt | "SMS-Bestaetigung an Melder gesendet" |
| `address_corrected` | **NEU:** Verify-Seite submitted | "Adresse vom Melder korrigiert" |
| `photos_added` | **NEU:** Fotos via Verify hochgeladen | "Fotos vom Melder ergaenzt" |

**Regel:** Jede Aenderung am Fall nach Erstellung MUSS ein Event erzeugen. Der Betrieb sieht im Leitstand die vollstaendige Fall-Historie, nicht nur den Anfangszustand.

### 9.3 Foto-Sichtbarkeit im Leitstand

**Entscheidung:** Fotos, die via Wizard oder Korrektur-Seite hochgeladen werden, muessen im Leitstand-Falldetail sichtbar sein. Implementierung ist Leitstand-Strang, aber die Wizard-Seite muss die Daten liefern (Storage-Path in case_events oder eigene Tabelle).

---

## 10. Prospect-Modus

Der Wizard dient nicht nur dem Endkunden — er ist auch das erste Produkt-Erlebnis des Prospects.

### 10.1 Prospect testet den Wizard

Prospect Journey Tag 0–3: Prospect besucht "seine" Website und testet den Wizard mit einer eigenen Meldung.

**Problem:** Im IST gibt es keinen Unterschied zwischen einer Test-Meldung des Prospects und einer echten Endkunden-Meldung. Beides landet gleichwertig im Leitstand.

**Entscheidung:** Der Wizard hat keinen eigenen Trial-Modus. Stattdessen:
- Die Welcome-Mail (prospect_journey.md T4) erklaert dem Prospect: "Testen Sie Ihr Formular mit einer eigenen Meldung."
- Der Prospect weiss, dass seine Test-Meldung wie eine echte Meldung behandelt wird — genau das ist der Beweis.
- Im Leitstand koennen Demo-Cases und Test-Cases nebeneinander existieren (Tab-Konzept aus prospect_journey.md §4 T9).

**Keine separate Wizard-Logik fuer Prospects.** Der Beweis ist: "So sieht eine echte Meldung aus." Nicht: "Das war nur ein Test."

### 10.2 Wizard als Proof of Value

Der Wizard-Test ist einer der staerksten Proof-of-Value-Momente in der Trial:
- Prospect fuellt das Formular aus → sieht sofort die Success-Bestaetigung
- SMS kommt auf sein Handy → spuert: "Das System funktioniert"
- Korrektur-Seite → versteht: "Mein Endkunde kann selbst korrigieren"
- Leitstand → sieht seinen eigenen Fall im Dashboard

Dieser Bogen funktioniert NUR wenn alle Stufen gebranded sind und sich anfuehlen wie sein System, nicht wie eine Demo.

---

## 11. Identity Contract Compliance

Pruefung jeder Konsistenzregel gegen das Wizard-Zielbild:

| Regel | Zielbild-Status | Massnahme |
|-------|-----------------|-----------|
| R1 (display_name sync) | Konform | TopBar, Success, SMS, Korrektur — ueberall `display_name` |
| R2 (Kategorien identisch) | Konform | Eine Quelle: `categories[]` in Tenant-Config (§8.1) |
| R3 (PLZ-Einheit) | Konform | Shared `PLZ_CITY_MAP` + `service_area_plz[]` (§8.2) |
| R4 (FlowSight unsichtbar) | Konform | Footer "powered by" einzige Ausnahme. Korrektur-Seite gebranded. |
| R5 (short_name Scope) | Konform | Nur SMS-Absender. Sonst display_name. |
| R6 (Keine Halluzination) | Konform | Alle Daten aus Config oder User-Eingabe. |
| R7 (Slug-Eindeutigkeit) | Konform | SSG pro Slug, keine Aenderung. |

**Bilanz:** 7/7 Regeln konform (IST: 4/7 verletzt). Der Wizard-Zielstrang hebt alle Identity-Verstoesse auf.

---

## 12. Kill-Liste

10 Dinge, die Gold zerstoeren. Jedes einzelne ist ein No-Go.

| # | Kill-Moment | Warum toedlich |
|---|------------|---------------|
| K1 | Notfall ohne Telefon-CTA | Endkunde mit Rohrbruch fuellt 3 Schritte aus statt anzurufen. Vertrauensverlust. |
| K2 | "Wir" statt `{display_name}` | Endkunde weiss nicht, wer sich kuemmert. FlowSight oder der Betrieb? |
| K3 | UUID als Fall-Nr. | "a7c2e3f1…" ist keine Referenz. FS-0029 ist eine. |
| K4 | Korrektur-Seite in FlowSight-Teal | Endkunde denkt: Phishing, fremde Seite, nicht mein Betrieb. |
| K5 | Verschiedene Kategorien auf Wizard und Voice | Leitstand zeigt "Sanitaeranlage" (Voice) und "Verstopfung" (Wizard) fuer denselben Betrieb. Chaos. |
| K6 | PLZ 3000 akzeptiert ohne Hinweis | Betrieb in 8942 bekommt Fall aus Bern. Keine Warnung, keine Transparenz. |
| K7 | "abc" als Telefonnummer | SMS bounced, Techniker kann nicht zurueckrufen. Toter Fall. |
| K8 | Success ohne "Was passiert jetzt" | Endkunde schliesst Tab, wartet, weiss nicht ob Meldung angekommen ist. |
| K9 | Verify-Korrektur ohne Case-Event | Betrieb sieht alte Adresse, Endkunde hat laengst korrigiert. Techniker faehrt zum falschen Ort. |
| K10 | Notfall-Meldung mit Normal-Geschwindigkeit | System erkennt Notfall, tut aber nichts anders. Dringlichkeit ist Dekoration. |

---

## 13. Goldstandard-Kriterien

10 pruefbare Kriterien. Ein Wizard auf Gold-Niveau erfuellt alle 10.

| # | Kriterium | Pruefung |
|---|----------|---------|
| G1 | Notfall-Screen bei "Notfall" mit Anruf-CTA | Manuell: Notfall waehlen → Screen mit Telefon-Link sichtbar? |
| G2 | `display_name` auf allen 4 Flaechen (TopBar, Success, SMS, Korrektur) | String-Suche pro Tenant: "FlowSight" darf nicht auf Endkunden-Flaechen erscheinen |
| G3 | FS-{seq_number} auf Success, SMS und Korrektur identisch | Test-Case erstellen → alle 3 Flaechen vergleichen |
| G4 | PLZ-Eingabe → Ort auto-filled | PLZ "8800" eingeben → "Thalwil" erscheint automatisch |
| G5 | PLZ ausserhalb Service-Area → Hinweis (kein Block) | PLZ "3000" eingeben → gelber Hinweis sichtbar, Submit moeglich |
| G6 | Telefon-Feld akzeptiert nur valides Format | "abc" eingeben → Fehlermeldung. "+41791234567" → akzeptiert. |
| G7 | "Was passiert jetzt"-Block auf Success-Screen | Manuell: Submit → 3-Punkte-Block sichtbar? |
| G8 | Korrektur-Seite in Brand Color mit display_name | SMS-Link klicken → Header in brand_color mit Firmenname? |
| G9 | Verify-Korrektur erzeugt Case-Event | Adresse korrigieren → Leitstand zeigt "Adresse korrigiert"-Event? |
| G10 | Wizard-Kategorien = Voice-Kategorien pro Tenant | Diff: Wizard-Options vs Voice-Agent-Kategorien → leer |

---

## 14. Offene Entscheidungen

Entscheidungen, die ausserhalb dieses Zielbilds getroffen werden muessen:

| # | Entscheidung | Abhaengigkeit | Wer entscheidet |
|---|-------------|--------------|----------------|
| O1 | `categories[]` physische Migration: wann Supabase, wann CustomerSite Registry? | Identity Contract O1 (Dual-SSOT-Transition) | Architektur |
| O2 | Erwartungssaetze ("heute oder morgen") — koennen Tenants das anpassen? | Tenant-Config vs. globaler Default | Founder |
| O3 | `service_area_plz[]` — welche Tenants haben das konfiguriert, welche nicht? | Onboarding-Checkliste | Founder |
| O4 | Foto-Sichtbarkeit im Leitstand — eigene Tabelle oder case_events Metadata? | Leitstand-Strang | Architektur |
| O5 | Soll die Korrektur-Seite einen Ablauf-Timer zeigen? ("Dieser Link ist 24h gueltig") | Security vs. UX | Produkt |
| O6 | Soll "Angebot" und "Kontakt" im Wizard eigene Flows bekommen? (kein Adress-Schritt noetig) | UX-Vereinfachung vs. Konsistenz | Produkt + Founder |

---

## 15. Zusammenfassung

```
IST:     Webformular → Submit → generischer Dank → SMS → fremde Korrektur-Seite
         3 Schritte, kein Notfall-Bewusstsein, kein Branding-Bogen, divergente Kategorien

GOLD:    Schriftlicher Eingang → Notfall-Abfang → Fuehrung → Submit
         → Betriebsbestaetigung → SMS → gebrandete Korrektur
         Ein Produkt, zwei Kanaele, gleiche Uebergabequalitaet, gleiche Vertrauenshandschrift
```

Der Wizard auf Gold-Niveau ist kein besseres Formular. Er ist die schriftliche Seite einer professionellen Annahme. Derselbe Betrieb, derselbe Leitstand, derselbe Standard — nur ein anderer Eingang.
