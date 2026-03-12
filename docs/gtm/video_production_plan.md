# Video Production Plan — Gold Contact Standard

**Erstellt:** 2026-03-13 | **Owner:** Founder
**Referenz:** `gold_contact.md`, `video_template.md`, `outreach_templates.md`, `einsatzlogik.md`
**Budget:** 30h Founder-Fokuszeit
**Standard:** Gold Contact — kein Kompromiss

---

## Kern-Prinzip

Jedes Video ist ein **persönliches Geschenk an genau einen Betrieb**.

Nicht Content. Nicht Marketing. Nicht Demo-Clip.
Der Prospect sieht SEIN System, SEINE Lisa, SEINE SMS, SEINE Website.
Das Video ist Teil der WOW-Kette (Phase 1, Schritt 3) — nicht isolierte Produktion.

Gold Contact, Abschnitt 2:
> "Alles, was der Betrieb sieht, muss auf seinen Betrieb personalisiert sein.
> Kein generisches Element. Kein Platzhalter."

Gold Contact, Abschnitt 1, Stufe 2:
> "Was NICHT als Beweis zählt: Ein Video, in dem jemand anderes das System benutzt."

**Konsequenz:** Kein Generic Intro Video. Kein Referenzvideo, das an andere gesendet wird. Jedes Video = 1 Prospect.

---

## Video-Readiness Matrix

Ein Prospect-Video braucht als Voraussetzung:
- Voice Agent LIVE (Lisa sagt seinen Firmennamen)
- Website LIVE (/kunden/{slug})
- SMS funktioniert (Absender = sein Firmenname)
- Testnummer zugewiesen

| Prospect | ICP | Tier | Profil | Modus | Video-Ready | Video? |
|----------|-----|------|--------|-------|-------------|--------|
| **Weinberger AG** | 9 | HOT | Betrieb | 2 | JA | **Video #1** (Referenz-Qualität) |
| **Dörfler AG** | 6 | WARM+ | Meister | 1 | JA | **Video #2** (Modus 1, persönlich, erster Kunde) |
| **Walter Leuthold** | 8 | HOT | Meister | 2 | NEIN (braucht Voice) | **Video #3** (nach Provisioning) |
| Orlandini | 6 | WARM | Meister | 2 | NEIN | Kein Video (WARM = B-Full+D, kein A) |
| Widmer | 5 | COLD | Meister | 2 | NEIN | Kein Video (ICP < 6 = SKIP) |

**Warum Dörfler trotz ICP 6 ein Video bekommt:**
Dörfler ist der erste Pilotkunde, Modus 1 (kein Web), Founder wohnt um die Ecke.
Gold Contact: "Bei Modus 1: Persönlich / vor Ort wenn möglich."
Das Video ist hier ein persönlicher Eisbrecher, kein Skalierungs-Tool.

**Warum Walter Leuthold Video #3 ist:**
ICP 8 = HOT. Bekommt A+B-Full+C+D. Aber Voice Agent muss erst provisioniert werden.
Provisioning (~25 Min via provision_trial.mjs) ist Voraussetzung vor Videoaufnahme.

---

## Pflicht-Output

Am Ende stehen:

- 3x versandfähige Prospect-Videos (Weinberger, Dörfler, Leuthold)
- 1x reproduzierbares Aufnahme-Setup (Loom + Mikrofon + Ordnerstruktur)
- 3x 10-Zeilen-Skripte (je Prospect)
- 1x interne Checkliste für künftige Videos

Optional (bei Reserve-Zeit):
- 4. Prospect-Video (nächster HOT aus Pipeline)
- Retakes für bestehende Videos

---

## Zeitplan

### Block 1 — Setup & Entscheide (3h)

**Ziel:** Aufnahme-Umgebung steht, alle Entscheide gefallen.

**Entscheide (sofort, nicht verschieben):**

| Entscheid | Standard | Begründung |
|-----------|----------|------------|
| **Aufnahme-Tool** | Loom Desktop (Screen + Camera) | Founder-Bubble + Prospect-Screen. Einfachster Weg. Analytics zeigen ob Prospect schaut. |
| **Mikrofon** | Externes USB-Mikrofon (Rode NT-USB Mini o.ä.) ODER gutes Headset | Laptop-Mikrofon = nie Gold-Contact-würdig. Kein Kompromiss. |
| **Kamera** | Laptop-Webcam (1080p) oder externe Webcam | Loom-Bubble ist klein — Laptop reicht wenn Licht stimmt. |
| **Licht** | Fenster frontal ODER Ringlicht/Schreibtischlampe | Kein Gegenlicht. Gesicht muss erkennbar sein. |
| **Format** | Loom-Style: Camera-Bubble unten rechts + Bildschirm | Kein separates Talking Head. Durchgehende Aufnahme. |
| **Hosting** | Loom (Free: 25 Videos, Analytics) | Für Skalierung (>25): YouTube unlisted. |
| **Ordnerstruktur** | `docs/gtm/videos/{slug}/` pro Prospect | Skript + Notizen + Export-Link |
| **Länge** | 45-60 Sekunden, hart | Länger = wird nicht geschaut. Kürzer = kein Spiegel. |

**Aufgaben:**

1. Loom Desktop installieren + Account einrichten
2. Mikrofon anschliessen + Loom-Audio auf externes Mikrofon stellen
3. Kamera-Position + Licht testen (Fenster frontal)
4. Browser vorbereiten: Bookmarks für alle Prospect-URLs
5. **1 Testaufnahme:** 30 Sekunden Loom mit Screen + Camera
   - Audio in Kopfhörern prüfen (Rauschen? Echo? Plosive?)
   - Bild prüfen (Licht? Schärfe? Hintergrund?)
   - Wenn Audio nicht gut → anderes Mikrofon / Raum wechseln
6. Ordnerstruktur anlegen

**Done-Kriterium:**
- Testaufnahme ist sauber (Audio + Bild)
- Loom funktioniert ohne Basteln
- Alle Entscheide gefallen, kein Nachdenken mehr nötig

---

### Block 2 — Skripte schreiben (2h)

**Ziel:** 3 fertige 10-Zeilen-Skripte. Kein Improvisieren bei der Aufnahme.

**Methode:**
1. `video_template.md` einmal komplett durchgehen (5-Szenen-Dramaturgie)
2. Pro Prospect: Variablen ausfüllen + einen konkreten Fall wählen
3. Skript = Stichpunkte, keine Prosa. Exakte Sätze für Anfang und Ende.

**Skript-Template (10 Zeilen):**

```
{SLUG} — Video-Skript
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. [EINSTIEG]  "{FIRMA} — {TAGLINE}."
2. [FALL]      "{WOCHENTAG}, {UHRZEIT}. {TYPISCHER_FALL}. Wer nimmt den Anruf an?"
3. [ÜBERLEITUNG] "Mit FlowSight nimmt Ihre persönliche Lisa den Anruf an."
4. [LISA LIVE]  → Browser: Testnummer anrufen, Lisa-Greeting zeigen
5. [SMS]        → Handy-Screenshot: SMS von "{ABSENDER}" mit Zusammenfassung
6. [DASHBOARD]  → Browser: Ops-Dashboard, Fall-Detail (3 Sek, nicht länger)
7. [WEBSITE]    → Browser: /kunden/{slug} auf Handy-Viewport zeigen
8. [CTA]       "Testen Sie Ihre Lisa: {TESTNUMMER}."
9. [CTA2]      "Ihre Website: flowsight.ch/kunden/{slug}."
10. [ENDE]     Lächeln. Kein "äh". Sauber beenden.
```

**Skript #1: Weinberger AG**

```
weinberger-ag — Video-Skript
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. "Jul. Weinberger AG — Haustechnik seit 1912 in Thalwil."
2. "Dienstagabend, 19 Uhr. Eine Mieterin meldet: Heizung komplett ausgefallen.
    Minus 2 Grad draussen. Wer nimmt den Anruf an?"
3. "Mit FlowSight nimmt Ihre persönliche Lisa den Anruf an."
4. → Testnummer 043 505 11 01 anrufen. Lisa: "Grüezi, hier ist Lisa
    von der Weinberger AG..." (Greeting + PLZ-Frage zeigen, ~8 Sek)
5. → Handy: SMS von "Weinberger" — Zusammenfassung + Korrekturlink
6. → Browser: /ops → Weinberger-Fall → Kategorie "Heizung", Dringlichkeit, PLZ
7. → Browser: flowsight.ch/kunden/weinberger-ag (Mobile-Viewport)
8. "Testen Sie Ihre Lisa: 043 505 11 01."
9. "Ihre Website: flowsight.ch/kunden/weinberger-ag."
10. [Ende — sauber, kein Nachsatz]
```

**Skript #2: Dörfler AG**

```
doerfler-ag — Video-Skript
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. "Dörfler AG — Sanitär, Heizung und Spenglerei in Oberrieden. Seit 1926."
2. "Samstagabend, 21 Uhr. Ein Kunde ruft an: Wasserleck im Keller.
    Es ist dringend. Wer nimmt den Anruf an?"
3. "Mit FlowSight nimmt Ihre persönliche Lisa den Anruf an."
4. → Dörfler-Testnummer anrufen. Lisa: "Guten Tag, hier ist der Sanitär-
    und Heizungsdienst der Dörfler AG..." (~8 Sek)
5. → Handy: SMS von "DörflerAG" — Zusammenfassung + Link
6. → Browser: /ops → Dörfler-Fall → Kategorie "Leck", Dringlichkeit "notfall"
7. → Browser: flowsight.ch/kunden/doerfler-ag (Mobile-Viewport)
8. "Testen Sie Ihre Lisa: [Dörfler-Testnummer]."
9. "Ihre Website: flowsight.ch/kunden/doerfler-ag."
10. [Ende]
```

**Skript #3: Walter Leuthold**

```
walter-leuthold — Video-Skript
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. "Walter Leuthold — Ihr Sanitär und Spengler am linken Zürichseeufer."
2. "Freitagabend, 20 Uhr. Ein Hauseigentümer meldet: überflutete
    Waschmaschine, Wasser steht im Keller. Wer nimmt den Anruf an?"
3. "Mit FlowSight nimmt Ihre persönliche Lisa den Anruf an."
4. → Leuthold-Testnummer anrufen. Lisa: Greeting + PLZ-Frage (~8 Sek)
5. → Handy: SMS von "Leuthold" — Zusammenfassung + Link
6. → Browser: /ops → Leuthold-Fall → Kategorie "Leck", Dringlichkeit
7. → Browser: flowsight.ch/kunden/walter-leuthold (Mobile-Viewport)
8. "Testen Sie Ihre Lisa: [Leuthold-Testnummer]."
9. "Ihre Website: flowsight.ch/kunden/walter-leuthold."
10. [Ende]
```

**Hinweis zu Skript #3:** Walter Leuthold braucht zuerst Voice-Provisioning (Block 4).

**Done-Kriterium:**
- 3 Skripte fertig, ausgedruckt oder am zweiten Bildschirm
- Du kannst jedes Video führen ohne nachzudenken
- Keine Prosa, keine Theorie — nur Produktionsnotizen

---

### Block 3 — Video #1: Weinberger AG (4h)

**Ziel:** Referenz-Qualität. Dieses Video setzt den Maßstab für alle weiteren.

**Vorbereitung (30 Min):**
- Browser-Tabs vorbereiten: Weinberger Website, Ops Dashboard, Loom
- Handy bereit für SMS-Screenshot (nach Testanruf)
- Skript #1 sichtbar (zweiter Bildschirm oder Ausdruck)
- Browser-Tabs aufräumen: keine fremden Tabs, keine PII anderer Kunden
- Ops-Dashboard: nur Weinberger-Fälle sichtbar (Tenant-Filter)

**Aufnahme (2h):**
1. **Take 1:** Komplett durchspielen. Nicht stoppen bei kleinen Fehlern.
2. Anschauen. Audio prüfen. Timing prüfen. Notizen machen.
3. **Take 2:** Korrekturen aus Take 1 umsetzen.
4. **Take 3:** Nur wenn nötig. Nicht aus Perfektionismus.
5. Handy-SMS-Screenshot machen (real, nicht simuliert)

**Szenen-Reihenfolge in der Aufnahme:**

| Szene | Was zeigen | Dauer | Tipp |
|-------|-----------|-------|------|
| 1. Einstieg | Weinberger Website (Desktop oder Mobile-Viewport) | 5s | Tagline sprechen während Website sichtbar |
| 2. Fall | Handy-Animation oder schwarzer Screen | 10s | Emotionalen Moment schaffen: "Wer nimmt an?" |
| 3. Lisa | LIVE: Testnummer anrufen, Lisa-Greeting | 15s | Echten Anruf zeigen. Lisa sagt "Weinberger AG". |
| 4. Proof | SMS-Screenshot (Handy) + Ops-Dashboard (Browser) | 15s | SMS = Hauptbeweis (Handy-First!). Dashboard = 3 Sek Bonus. |
| 5. CTA | Weinberger Website (Mobile-Viewport) | 10s | Testnummer + URL klar sprechen. Lächeln. |

**Mobile-First-Regel:** Szene 4 zeigt ZUERST die SMS auf dem Handy, DANN (kurz) das Dashboard.
Der Meister/Betrieb identifiziert sich mit dem Handy-Moment, nicht mit dem Dashboard.

**Schnitt (1h):**
- In Loom trimmen (Anfang/Ende sauber)
- Pausen kürzen, aber nicht hektisch schneiden
- Gesamtlänge: 45-60 Sekunden HART. Wenn >60s: kürzen, nicht rechtfertigen.

**Quality Gate (30 Min):**
- [ ] Persönlicher Einstieg mit "Jul. Weinberger AG"
- [ ] Glaubwürdiger Fall (Heizungsausfall im Winter)
- [ ] Lisa sagt "Weinberger AG" im Anruf (klar hörbar)
- [ ] SMS von "Weinberger" sichtbar auf Handy
- [ ] Dashboard zeigt sauberen Weinberger-Fall
- [ ] CTA mit funktionierender Testnummer + URL
- [ ] 45-60 Sekunden
- [ ] Kein "äh", keine technischen Fehler sichtbar
- [ ] Keine PII anderer Kunden im Bild
- [ ] Audio sauber (kein Rauschen, kein Echo)
- [ ] Founder-Gesicht erkennbar in Camera-Bubble
- [ ] Würdest du das Christian Weinberger mit gutem Gewissen schicken?

**Done-Kriterium:**
- Video ist versandfähig
- Video ist Gold-Contact-würdig
- Loom-URL ist bereit für Outreach-Template 1

---

### Block 4 — Provisioning Walter Leuthold + Video #2: Dörfler (5h)

Dieser Block hat zwei parallele Aufgaben:

**Teil A: Provisioning Walter Leuthold (1.5h)**

Walter Leuthold ist ICP 8 (HOT) aber hat noch keinen Voice Agent.
Provisioning-Schritte (CC kann vorbereiten, Founder muss Testnummer bestätigen):

1. Voice Agent erstellen (Template → retell_sync.mjs) — ~10 Min
2. Twilio-Nummer zuweisen — ~5 Min
3. Supabase Tenant anlegen (provision_trial.mjs) — ~5 Min
4. SMS-Config (Sender: "Leuthold") — ~5 Min
5. E2E-Test: Anruf → Lisa → SMS → Dashboard — ~10 Min
6. Skript #3 finalisieren (Testnummer eintragen)

**Hinweis:** CC kann Voice Agent + Tenant vorbereiten. Founder muss nur E2E-Test machen und Testnummer verifizieren.

**Teil B: Video #2 Dörfler AG (3.5h)**

Gleiche Methode wie Block 3, aber Dörfler-spezifisch.

**Besonderheit Dörfler (Modus 1 + persönlich):**
- Founder wohnt um die Ecke → Video kann als Eisbrecher VOR dem persönlichen Besuch dienen
- Oder: Video NACH dem persönlichen Gespräch, als "hier nochmal zusammengefasst"
- Entscheid: Wann im Outreach-Flow setze ich das Video ein?

**Empfehlung:** Video ZUERST per E-Mail, dann persönlicher Besuch 2 Tage später.
"Herr Dörfler, ich hatte Ihnen das Video geschickt — darf ich Ihnen Lisa kurz live zeigen?"

**Aufnahme:** Gleiche 5-Szenen-Struktur. Take 1-3. Trimmen in Loom.

**Quality Gate:** Identisch zu Weinberger, aber mit Dörfler-Daten.

---

### Block 5 — Video #3: Walter Leuthold (3h)

**Voraussetzung:** Provisioning aus Block 4 Teil A ist abgeschlossen.

Gleiche Methode. Leuthold-spezifisch:
- Profil: Meister (Solo-Betrieb, 4.9★, 44 Reviews — stärkste Bewertungen aller Prospects)
- Fall: "Freitagabend, überflutete Waschmaschine" (sein Notdienst = sein USP)
- CTA: Seine neue Testnummer + flowsight.ch/kunden/walter-leuthold

**Besonderheit:** Walter Leuthold hat die besten Google Reviews (4.9★, 44 Stück).
→ Im Video kurz die Review-Section seiner Website zeigen (2 Sek) als Vertrauens-Signal.

---

### Block 6 — Quality Gate + Export (2h)

**Ziel:** Alle 3 Videos final gegen harte Gold-Kriterien prüfen.

**Für jedes Video prüfen:**

| Kriterium | Beschreibung | Kill? |
|-----------|-------------|-------|
| Firmennamen korrekt | Lisa sagt den richtigen Namen, Website zeigt den richtigen Namen | JA — sofortiger Retake |
| Ton sauber | Kein Rauschen, kein Echo, kein Hall, Stimme klar | JA |
| Bild sauber | Kein unscharfes Founder-Bild, kein Gegenlicht | JA |
| 45-60 Sekunden | Hart. Nicht 61s. Nicht 44s. | JA |
| Klarer Betriebsbezug | Firma, Fall, Region — alles spezifisch | JA |
| Klare CTA | Testnummer + URL hörbar + sichtbar | JA |
| Keine PII-Leaks | Keine fremden Kunden, keine E-Mails, keine Tabs | JA |
| Keine Platzhalter | Keine {VARIABLE}, keine "Demo", keine "Beispiel" | JA |
| Keine generische AI-Sprache | Kein "innovative Lösung", kein "digitale Transformation" | JA |
| Kein Demo-Gefühl | Alles real: echter Anruf, echte SMS, echte Website | JA |
| Mobile-First Proof | SMS auf Handy ist sichtbar, nicht nur Desktop-Dashboard | JA |
| Würde-Test | Würdest du das einem Top-Prospect mit gutem Gewissen schicken? | JA |

**Export-Checkliste:**
- [ ] Loom-URL kopiert und funktioniert (incognito testen!)
- [ ] Video-Titel in Loom: "{Firma} — FlowSight" (kein "Test" oder "Draft")
- [ ] Loom-Thumbnail sieht professionell aus (kein schwarzer Frame)
- [ ] Ordner `docs/gtm/videos/{slug}/` enthält: Skript + Loom-URL + Notizen
- [ ] Outreach-Template 1 mit {VIDEO_URL} befüllt und bereit

**Benennungssystem:**

```
docs/gtm/videos/
├── weinberger-ag/
│   ├── skript.md
│   ├── loom_url.txt         → https://loom.com/share/xxxxx
│   └── notizen.md           → Takes, Learnings, Retake-Gründe
├── doerfler-ag/
│   ├── skript.md
│   ├── loom_url.txt
│   └── notizen.md
└── walter-leuthold/
    ├── skript.md
    ├── loom_url.txt
    └── notizen.md
```

---

### Block 7 — Reserve (4h)

**Nutzen NUR für:**
- Retakes (Audio-Problem, Lisa-Fehler, PII im Bild)
- Provisioning-Verzögerungen (Twilio-Nummer, Agent-Setup)
- Ein 4. Prospect-Video (wenn nächster HOT-Prospect bereit)
- Feinschliff an CTAs oder Szenen-Timing

**NICHT nutzen für:**
- Neue Theorie oder Strategie
- Generic Intro Video (gestrichen — widerspricht Gold Contact)
- Perfektionismus ohne Hebel ("noch 2% besser")
- Neue Video-Formate oder Varianten

---

### Block 8 — Outreach-Integration (2h)

**Ziel:** Die 3 Videos in die Outreach-Sequenz einbauen.

**Pro Prospect:**

| Schritt | Aktion | Template |
|---------|--------|----------|
| 1 | Outreach-E-Mail mit Video-URL | Template 1 (HOT: A+B-Full+C+D) |
| 2 | Follow-up Anruf (2 Tage später) | Anruf-Script aus outreach_templates.md |
| 3 | Warten auf Signal | — |

**Weinberger AG:**
- E-Mail an Christian Weinberger mit Video-URL + Testnummer + Website-Link
- Betreff: "Jul. Weinberger AG — ich habe etwas für Sie gebaut"
- Video-URL = Loom-Link aus Block 3

**Dörfler AG:**
- Video per E-Mail → 2 Tage warten → Persönlicher Besuch (Founder wohnt um die Ecke)
- "Herr Dörfler, ich hatte Ihnen ein kurzes Video geschickt..."
- Sonderfall Modus 1: Persönlicher Kontakt IST der Hauptkanal, Video ist Türöffner

**Walter Leuthold:**
- Anruf ZUERST (Meister = Telefon-Mensch), dann E-Mail mit Video nachfassen
- "Herr Leuthold, ich habe für Ihren Betrieb etwas gebaut — ich schicke Ihnen ein kurzes Video."

**Versand-Checkliste (vor JEDEM Versand):**
- [ ] Richtige Video-Version für richtigen Prospect?
- [ ] Richtige Testnummer im Video und in der E-Mail?
- [ ] Richtige Website-URL?
- [ ] Lisa antwortet auf Testnummer korrekt? (JETZT testen, nicht gestern)
- [ ] Video wirkt würdig?
- [ ] Würdest du das mit gutem Gewissen schicken?

Wenn eine Frage NEIN → nicht senden, nachschärfen.

---

## Zeitübersicht

| Block | Inhalt | Zeit | Kumulativ |
|-------|--------|------|-----------|
| 1 | Setup & Entscheide | 3h | 3h |
| 2 | 3 Skripte schreiben | 2h | 5h |
| 3 | Video #1: Weinberger AG | 4h | 9h |
| 4 | Provisioning Leuthold + Video #2: Dörfler | 5h | 14h |
| 5 | Video #3: Walter Leuthold | 3h | 17h |
| 6 | Quality Gate + Export | 2h | 19h |
| 7 | Reserve | 4h | 23h |
| 8 | Outreach-Integration | 2h | 25h |
| — | **Unverplant** | **5h** | **30h** |

5h unverplante Reserve für: zusätzliche Retakes, 4. Prospect, Unvorhergesehenes.

---

## Prioritätenreihenfolge

Wenn Zeit knapp wird:

1. **Weinberger Video** (Referenz-Qualität, HOT ICP 9)
2. **Dörfler Video** (erster Pilotkunde, persönlicher Kontakt)
3. **Leuthold Video** (HOT ICP 8, stärkste Reviews)
4. Reserve / 4. Prospect
5. Outreach-Integration (kann auch ohne Block 8 passieren)

Nicht andersrum. Kein Video < 3 = kein Outreach.

---

## Was nie tun

| # | Regel | Warum |
|---|-------|-------|
| 1 | Kein generisches Video an individuellen Prospect | Bricht den Spiegel. Gold Contact verbietet es explizit. |
| 2 | Kein Weinberger-Video an Dörfler senden | "Ein Video, in dem jemand anderes das System benutzt" = kein Beweis. |
| 3 | Kein Laptop-Mikrofon | Audio-Qualität = Vertrauens-Signal. Schlechter Ton = "unprofessionell". |
| 4 | Kein Video >60 Sekunden | Wird nicht fertig geschaut. Der Prospect hat 60 Sekunden Geduld, nicht 90. |
| 5 | Kein Video ohne vorherige Quality Gate | Ein Fehler (falscher Name, PII, kaputte URL) = Vertrauensbruch #1 oder #4. |
| 6 | Keine Feature-Liste im Video | Gold Contact: "Kein Produktfeature-Stapel." Zeigen, nicht erklären. |
| 7 | Kein "äh" oder "also" | Lieber Pause als Füllwort. Kürzen statt vollstopfen. |
| 8 | Kein Video für WARM-Prospects | Einsatzlogik: WARM = B-Full+D. Kein A. Kein Video. |
| 9 | Kein Video vor E2E-Test | Lisa muss funktionieren BEVOR du sie filmst. |
| 10 | Kein Video ohne konkreten Versand-Plan | Produziere nichts, was keinen Empfänger hat. |

---

## Aufnahme-Checkliste (vor JEDER Aufnahme)

```
□ Prospect klar? (Name, Slug, Testnummer, Website-URL)
□ Skript liegt bereit? (ausgedruckt oder zweiter Bildschirm)
□ Loom bereit? (Screen + Camera, Audio = externes Mikrofon)
□ Browser-Tabs sauber? (nur Prospect-relevante Tabs offen)
□ Ops-Dashboard gefiltert? (nur Fälle dieses Prospects sichtbar)
□ Handy bereit für SMS-Screenshot?
□ Kein anderer Prospect / keine PII sichtbar?
□ Licht ok? (Gesicht sichtbar, kein Gegenlicht)
□ Ruhe? (kein Baulärm, kein Telefon, Türe zu)
□ Testnummer funktioniert? (JETZT kurz anrufen und prüfen)
```

---

## Erfolgskriterium

Der Plan ist erfolgreich, wenn:

1. **3 versandfähige Videos** existieren — Gold-Contact-würdig
2. **Jedes Video zeigt dem Prospect SEIN System** — nicht ein fremdes
3. **Der Founder kann reproduzierbar neue Videos bauen** — Setup steht, Prozess klar
4. **Die Videos sind in die Outreach-Sequenz integriert** — nicht isolierte Produktion
5. **Kein einziges Video bricht den Spiegel-Effekt** — kein generisches Element

Der ultimative Test: Wenn Christian Weinberger das Video öffnet und innerhalb von 10 Sekunden denkt "Das ist ja MEINE Firma" — dann ist es Gold.
