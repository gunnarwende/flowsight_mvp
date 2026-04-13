# Projekt "Vorstellung" — Skalierbare Kontaktmaschine

**Erstellt:** 2026-04-10 | **Updated:** 2026-04-13
**Owner:** Founder + CC
**Status:** **Speakflow Take 1+2 FINAL** (Founder-approved, nicht mehr ändern). Generisches Template: `docs/gtm/speakflow_template.md`. Seed v3 Page-1-Shaping LIVE. Nächst: Master-Aufnahmen + Take 3+4 finalisieren + Skalierungstest.
**Ziel:** Maximal persönliche, 100% skalierbare Betriebskontaktierung. 10+ Betriebe/Tag theoretisch möglich. Founder-Aufwand pro Betrieb: < 5 Minuten.
**Regel:** Stufe 3 von Tag 1. Keine Zwischenstufen. Kein Kompromiss.

---

## Vision

Für jeden neuen Betrieb wird eine **hochpersönliche Vorstellungsseite** generiert mit 4 Video-Modulen + persönlicher E-Mail — ohne dass der Founder mehr tun muss als:
1. Betrieb aus der Pipeline auswählen
2. Ergebnis prüfen
3. Senden

Alles andere — Voice, Video, Audio, Leitsystem, Demo-Daten, E-Mail — wird automatisch assembliert.

---

## Architektur: Was pro Betrieb identisch ist vs. individuell

### Vorstellungsseite (`/kunden/{slug}/vorstellung`)

| Element | Individuell | Wie automatisiert |
|---------|------------|-------------------|
| Firmenname im Text | Ja (1 Wort) | Template-Replace |
| Gunnar-Foto | Nein (identisch) | Statisch |
| 4 Video-Module | Mix (siehe unten) | Assembly-Pipeline |
| Abschlusstext | Minimal (Firmenname + Lokalbezug) | Template-Replace |
| Kontaktdaten | Nein (Gunnar = identisch) | Statisch |

### E-Mail (Outreach)

| Element | Individuell | Wie automatisiert |
|---------|------------|-------------------|
| Betreff | Firmenname | Template: "Etwas Persönliches für {company}" |
| Body-Text | Firmenname + Lokalbezug | Template mit 2-3 Platzhaltern |
| Foto | Nein (identisch) | Statisch |
| Link | Slug | Template: flowsight.ch/kunden/{slug}/vorstellung |

### Video Takes 1-4

| Take | Was ist individuell | Was ist generisch | Automatisierungsgrad |
|------|-------------------|-------------------|---------------------|
| **T1** (Face, Vorstellung) | Firmenname, persönliche Geschichte, Lokalbezug | Kernfrage, Struktur, Abschluss | 60% generisch |
| **T2** (Voice Call + Leitsystem) | Kontaktname, Greeting der Assistentin, SMS-Absender, Leitsystem-Daten, Brand-Color | Kontakt-Trust-Moment, Call-Ablauf, Screen-Flow, alle Erklärungen | **90% generisch** |
| **T3** (Website + Online-Meldung) | Website-Screenshots, Firmenname | Wizard-Flow, Erklärungen | 80% generisch |
| **T4** (Bewertung + Abschluss) | Firmenname, Google-Rating | Review-Flow, Abschlussworte | 85% generisch |

---

## Take 2 Deep-Dive: Segment-für-Segment Automatisierung

### S1: Intro + Kamera (FB83)
**Text:** "Nehmen wir an..." → "Ich rufe einmal kurz an."
**Screen:** Handy-Homescreen mit Leitsystem-App
**Kamera:** Gunnar im Kreis (PiP)

**Was sich pro Betrieb ändert:** NICHTS. Kein Firmenname in diesem Segment.
**Automatisierung:** 100% wiederverwendbar. EINMAL aufnehmen → für JEDEN Betrieb nutzen.

### S2a: Kontakt auswählen + Anruf starten (FB93 → FB84) — Trust-Moment

**Text:** "Ich rufe einmal kurz an." (Ende von S1, Übergang)
**Screen:** Kontakte-App → "{Firma} Test" suchen → Nummer sichtbar → Anruf-Button drücken → Anruf-Screen
**Kamera:** Gunnar im Kreis

**Warum dieser Zwischenschritt entscheidend ist:**
Dörfler sieht: (1) seinen Firmennamen im Kontakt, (2) eine echte Telefonnummer, (3) Founder drückt wirklich auf Anrufen. Das ist kein Fake, kein zusammengeschnittenes Audio — das ist ein echter Anruf.

**Was sich pro Betrieb ändert:** Kontaktname ("{Firma} Test") + Telefonnummer
**Automatisierung:** Kontaktname im Handy ändern → Screenshot/kurzes Screen-Recording (5 Sekunden). Pro Betrieb: 30 Sekunden.

**Master-Assets:**
- `Kontakt_master_screenshot.png` — Referenz-Screenshot (FB93)

### S2b: Der Anruf (FB84) — KRITISCH

**Text:** Voice Agent Call (Founder spricht + Agent antwortet)
**Screen:** Anruf-Screen "{Firma} Test — Wird angerufen..."
**Kamera:** Gunnar im Kreis

**Was sich pro Betrieb ändert:**
1. Kontaktname auf dem Anruf-Screen ("{Firma} Test")
2. Agent-Greeting ("Hier ist der Sanitär- und Heizungsdienst der {Firma}")
3. Founder spricht den typischen Fall der Branche

**Automatisierungsstrategie (0 Franken pro Betrieb):**

```
MASTER-AUFNAHME (einmalig, mit Dörfler):
1. Founder nimmt den perfekten Call auf (Rode Mikro)
2. Retell liefert Multi-Channel WAV (Agent = Clean TTS)
3. Founder-Stimme = Rode-Qualität (alle seine Sätze)
4. Agent-Stimme = Retell Clean TTS

PRO NEUER BETRIEB (automatisiert):
1. Agent-Greeting ersetzen:
   - Retell TTS API: "Hier ist der Sanitär- und Heizungsdienst der {Firma}"
   - Gleiche Ela-Stimme, gleiches Tempo, nur anderer Firmenname
   - Splice in den Master-Call an der Greeting-Position

2. Anruf-Screen:
   - Kontaktname im Handy ändern → 1 Screenshot
   - ODER: Screenshot automatisch generieren (Playwright Handy-Mockup)

3. Founder-Stimme — TYPISCHER FALL pro Branche:
   - Pro Branche wird EIN typischer Fall als Master aufgenommen:
     - Sanitär: "Ich habe einen Wasserschaden im Keller" (Rohrbruch)
     - Heizung: "Unsere Heizung ist komplett ausgefallen" (Heizungsausfall)
     - Elektro: "Bei uns ist der Strom ausgefallen" (Stromausfall)
     - Spengler: "Wasser kommt durchs Dach rein" (Dachschaden)
   - Pro Branche EINMAL aufnehmen → für alle Betriebe dieser Branche nutzen
   - Adresse: aus dem typischen Einzugsgebiet (generisch reicht)
   - Kein STS nötig für den Call-Teil — original Rode-Aufnahme

4. SMS-Absender:
   - Nur der Absendername ändert sich ("Doerfler AG" → "Weinberger AG")
   - SMS-Text ist identisch (Korrekturlink)
   - Screenshot pro Betrieb: Tenant wechseln → SMS triggern → Screenshot

ERGEBNIS: Identischer Call, nur Agent-Greeting + Anruf-Screen + SMS-Absender getauscht.
KOSTEN: 0 Franken (kein echter Anruf nötig).
FOUNDER-AUFWAND: 0 Minuten (alles automatisiert).
```

### S3: SMS (FB81/FB86)
**Text:** "Direkt nach dem Anruf..." → "...Anliegen verloren geht."
**Screen:** SMS-App zeigt Nachricht von "{Firma}"

**Automatisierung:**
- SMS-Screenshot pro Betrieb: Tenant-Switch → Test-SMS senden → Screenshot
- ODER: SMS-Mockup generieren (HTML → Screenshot)
- Founder-Voice: 100% identisch (kein Firmenname in diesem Segment)
- **100% automatisierbar**

### S4: App öffnen (FB83 → FB78)
**Text:** "Genau dafür habe ich Ihnen Ihre eigene {Firma}-App vorbereitet."
**Screen:** Homescreen → Leitsystem-App → Leitzentrale

**Was sich ändert:** Nur "{Firma}-App" im Text + Brand-Color + KPI-Zahlen im Leitsystem
**Automatisierung:**
- Voice: STS mit Firmennamen-Swap (1 Wort, PiP = Lippen unsichtbar)
- Screen: Tenant wechseln → Screenshot/Recording der Leitzentrale
- **95% automatisierbar**

### S5: Leitzentrale Übersicht (FB86)
**Text:** "Hier sehen Sie auf einen Blick..." → "...zeige ich Ihnen gleich."
**Screen:** FlowBar mit KPIs

**Was sich ändert:** Zahlen (aus Seed-Daten), Brand-Color, Google-Rating
**Automatisierung:**
- Voice: 100% identisch (kein Firmenname in diesem Segment)
- Screen: Automatisch anders (Seed-Daten + Brand-Color pro Tenant)
- **100% automatisierbar**

### S6: Scroll Falltabelle (FB87)
**Text:** *kurzes Scrollen, kein gesprochener Text*
**Screen:** Falltabelle mit Seiten-Pagination

**Automatisierung:** 100% automatisierbar (Playwright scroll-capture pro Tenant)

### S7: Falldetail (FB88-89)
**Text:** "Und wenn ich den Fall öffne..." → "...sauber zur Hand."
**Screen:** Fall öffnen → Scrollen durch Übersicht/Beschreibung/Verlauf

**Was sich ändert:** Fall-Inhalt (aus Seed-Daten oder echtem Call)
**Automatisierung:**
- Voice: 100% identisch (kein Firmenname)
- Screen: Fall aus Seed-Daten → automatisch anders pro Tenant
- **100% automatisierbar**

---

## Kosten-Analyse pro Betrieb (Stufe 3)

| Posten | Stufe 1 (heute) | Stufe 3 (Ziel) |
|--------|----------------|----------------|
| Voice Agent Call | CHF 1-4 (echte Calls) | **CHF 0** (kein Call, TTS-Splice) |
| SMS | CHF 0.10 | CHF 0.10 (1x Test-SMS für Screenshot) |
| Retell TTS (Greeting) | — | CHF 0.01 (1 Satz generieren) |
| Founder-Zeit | 30-60 Min | **< 5 Min** (prüfen + senden) |
| CC-Zeit | 30 Min | 15-20 Min (Assembly + QA) |
| **Total Kosten** | **CHF 5-10** | **CHF 0.11** |
| **Total Zeit** | **60-90 Min** | **~5 Min** (Pipeline vollautomatisch) |

### Audio-Standard (alle Takes)

| Parameter | Wert | Warum |
|-----------|------|-------|
| **Integrierte Lautstärke** | -14 LUFS | YouTube/Instagram/Mobile Standard |
| **True Peak** | -1.5 dB | Kein Clipping auf Handylautsprechern |
| **Loudness Range** | ~11 LU | Gleichmässig laut, keine Sprünge |
| **Founder↔Agent Balance** | dynaudnorm (maxgain=12, peak=0.6) | Founder +20% im Call |
| **Tool** | `loudnorm` in `assemble_take2_video.mjs` Step 3c | Automatisch pro Video |

---

## Master-Aufnahmen (einmalig, mit Dörfler AG)

Diese Aufnahmen werden EINMAL gemacht und für JEDEN Betrieb wiederverwendet:

### Master-Video (Kamera-PiP, EINMAL aufnehmen)
| # | Was | Wiederverwendbar für |
|---|-----|---------------------|
| V1 | Gunnar spricht S1 (Intro, kein Firmenname) | Alle Betriebe T2 S1 |
| V1b | Gunnar greift zum Handy, sucht Kontakt, drückt Anrufen | Alle Betriebe T2 S2a (Trust-Moment) |
| V2 | Gunnar während Call (Mimik, Gestik, PiP) | Alle Betriebe T2 S2b |
| V3 | Gunnar zeigt SMS (Blick aufs Handy) | Alle Betriebe T2 S3 |
| V4 | Gunnar öffnet App + zeigt Leitsystem | Alle Betriebe T2 S4-S7 |

### Master-Audio (Rode Mikro)
| # | Was | Wiederverwendbar für |
|---|-----|---------------------|
| A1 | S1 Text komplett | Alle Betriebe (100% identisch) |
| A2 | Founder-Seite des Calls — pro Branche 1 typischer Fall | Alle Betriebe derselben Branche (Sanitär/Heizung/Elektro/Spengler) |
| A3 | S3 Text (SMS-Erklärung) | Alle Betriebe (100% identisch) |
| A4 | S4 Text — NUR der Satz mit "{Firma}-App" | Pro Betrieb: STS-Swap des Firmennamens |
| A5 | S5-S7 Text komplett | Alle Betriebe (100% identisch) |

### Master Agent-Audio (aus Retell)
| # | Was | Pro Betrieb |
|---|-----|------------|
| AG1 | Agent-Greeting: "Hier ist der Sanitär- und Heizungsdienst der {Firma}" | TTS neu generieren (Ela-Stimme, 1 Satz) |
| AG2 | Restlicher Call (Fragen, Empathie, Farewell) | 100% identisch, aus Master-Call |

### Master-Screenshots (Referenz)
| # | Was | Datei | Pro Betrieb |
|---|-----|-------|------------|
| SC1 | Kontakt-Screen ("{Firma} Test" + Nummer) | `Kontakt_master_screenshot.png` | Kontaktname ändern → neuer Screenshot |
| SC2 | SMS ("{Firma}: Ihre Meldung wurde aufgenommen...") | `SMS_master_screenshot.png` | Test-SMS triggern → neuer Screenshot |

### Master Call-ID
- **call_8d24198e713f344bf4a1fcb1858** — Dörfler AG, 181s, perfekter Flow (DE→EN→DE, Keilriemen-Proof, Steuererklärung-Proof, sauberes Farewell)
- `production/call_8d24198e713f344bf4a1fcb1858/` — agent_clean.wav + segments.json

---

## Assembly-Pipeline pro Betrieb

```
Input:
  - slug (z.B. "weinberger-ag")
  - prospect_card.json (Firmendaten)
  - Master-Videos (V1, V1b, V2, V3, V4) — Kamera-PiP, einmalig
  - Master-Audio (A1-A5) — Rode Mikro, einmalig
  - Master Agent-Audio (AG2) — Retell TTS, einmalig

FOUNDER tut (2-3 Min, stumm, kein Sprechen, kein Kamera):
  1. Kontaktname im Handy ändern → "{Firma} Test" → Screenshot (FB93-Equivalent)
  2. Tenant im Leitsystem wechseln (Cookie/App)
  3. Screen-Recording starten (Handy)
  4. Leitsystem öffnen → Übersicht → Scrollen → Fall öffnen → Scrollen
  5. Screen-Recording stoppen
  6. Test-SMS triggern → SMS-Screenshot

CC ASSEMBLIERT (15-20 Min):
  1. TTS: Agent-Greeting generieren → "Hier ist [Lisa] von {Firma}" (Ela-Stimme, 1 Satz)
  2. Splice: Neues Greeting + Master Agent-Audio → agent_full.wav
  3. STS: A4 mit neuem Firmennamen → "{Firma}-App" statt "Dörfler-App"
  4. Video-Assembly:
     a) V1 (Intro) + Master-Audio A1
     b) Kontakt-Screenshot (Trust-Moment) + V1b
     c) Anruf-Screen + V2 + A2 (Founder) + agent_full.wav (Agent)
     d) SMS-Screenshot + V3 + A3
     e) Neues Leitsystem Screen-Recording + V4 + A4_neu + A5
  5. Alles zusammenfügen → Take2_final.mp4
  6. Audio normalisieren (konsistenter Pegel über alle Segmente)

Output:
  - docs/customers/{slug}/takes/Take2.mp4
  - docs/customers/{slug}/takes/Take3.mp4
  - docs/customers/{slug}/takes/Take4.mp4
```

---

## Take 1: Sonderstatus

Take 1 ist am MEISTEN individuell (persönliche Geschichte, Firmenname gross im Bild).

**Langfristige Lösung:**
- Generischer Master-Take mit universeller Kernfrage ("Wie sorgen wir dafür, dass im Alltag nichts verloren geht")
- Firmenname-Swap per STS (1 Wort, Founder schaut kurz weg beim Namen)
- Persönlicher Bezug per Template: "Nach Ihrem Einsatz bei uns" (nur bei Kunden die bei Founder waren) vs. "Ich habe mir Gedanken zu Ihrem Betrieb gemacht" (generisch)
- 2 Master-Versionen: "hatte Einsatz bei mir" + "kenne den Betrieb aus der Region"

**Nur Dörfler AG individuell.** Ab Betrieb 2 (Walter Leuthold): Master + STS-Swap.
- Founder nimmt 2 Master-Versionen auf (einmalig, je ~80s)
- Pro Betrieb: STS tauscht den Firmennamen (1 Wort)

---

## Offene Fragen (Founder-Entscheid nötig)

| # | Frage | Optionen | Empfehlung |
|---|-------|---------|-----------|
| F1 | Wann Telefonnummer kaufen? | Vor dem Video (echt im Video) vs. nach Interesse | **Nach Interesse.** Im Video zeigen wir die Demo-Nummer. Echte Nummer erst bei Trial-Start. |
| F2 | Wie geht Lisa mit Rückrufern um? | Lisa erkennt den Betrieb vs. generische Antwort | **Lisa erkennt den Betrieb** — aus der prospect_card.json: "Ah, Sie rufen wegen der Vorstellung an? Herr Wende freut sich auf Ihr Feedback. Soll ich ihm eine Nachricht hinterlegen?" |
| F3 | Testzeit-Ablauf? | 14 Tage ab Aktivierung vs. ab Erstkontakt | **14 Tage ab Aktivierung** (activate_prospect.mjs). Nicht ab Video-Versand. |
| F4 | Take 1 pro Betrieb oder Master? | Individuell vs. generisch + STS | **Nur Dörfler individuell.** Ab Betrieb 2 (Leuthold): 2 Master-Versionen ("Einsatz bei mir" + "kenne aus der Region") + STS Firmennamen-Swap. |
| F5 | Proofs (Mehrsprachigkeit, Kompetenzgrenzen) im Video? | Weglassen vs. drin lassen | **Drin lassen — beide.** (1) Mehrsprachigkeit: Deutschschweiz = FR/IT/EN real im Alltag. Handwerker mit älteren Kunden sehen sofortige Entlastung. Kostenargument: 5'000 CHF/Mo Assistentin vs. 299 CHF mit 5 Sprachen. (2) Kompetenzgrenzen: Nicht "Steuererklärung" (zu absurd) sondern ein realistischerer Proof — z.B. "Machen Sie auch Elektroarbeiten?" → "Nein, dafür sind wir nicht zuständig. Aber zurück zu Ihrem Anliegen." Zeigt: intelligent, ehrlich, fokussiert. |

---

## Zeitplan

| Tag | Was | Output |
|-----|-----|--------|
| 1 | Master-Aufnahmen T2 (Dörfler als Basis) | V1-V4, A1-A5, AG1-AG2 |
| 2 | Assembly-Pipeline bauen | `assemble_vorstellung.mjs` |
| 3 | Take 3+4 Master-Aufnahmen + Pipeline | Komplettes Template |
| 4 | Take 1 (2 Master-Versionen) | "Einsatz" + "Region" Version |
| 5 | Erster Test: Walter Leuthold komplett aus Template | Validierung der Skalierbarkeit |

---

## Erfolgskriterien

- [ ] Pro Betrieb: < 5 Min Founder-Aufwand
- [ ] Pro Betrieb: < CHF 0.50 variable Kosten
- [ ] Pro Betrieb: < 20 Min CC-Aufwand (Assembly + QA)
- [ ] Ergebnis: Nicht unterscheidbar von 100% individueller Produktion
- [ ] Dörfler AG: Identisch gut wie manuell produziert
- [ ] Walter Leuthold: Aus Template generiert, Founder bestätigt Qualität
