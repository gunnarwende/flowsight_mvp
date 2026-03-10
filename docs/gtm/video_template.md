# Video-Produktions-Template (Leckerli A)

**Erstellt:** 2026-03-09 | **Owner:** Founder (Aufnahme) + CC (Skript)
**Referenz:** `docs/gtm/operating_model.md`
**Ziel:** 45-60 Sekunden personalisiertes Video pro Prospect. Wiederholbar dank fixem Template.

---

## 5-Szenen-Dramaturgie

Jedes Video folgt exakt derselben Struktur. Nur die Variablen ändern sich.

### Szene 1: Persönlicher Einstieg (5s)

**Voice-Over:**
> "{FIRMA} — {TAGLINE}."

**Visual:** Screenshot der aktuellen Website des Prospect (oder Google Maps Eintrag)

**Beispiel Weinberger:**
> "Jul. Weinberger AG — Haustechnik seit 1912 in Thalwil."

---

### Szene 2: Typischer Fall (10s)

**Voice-Over:**
> "Samstag Abend. {TYPISCHER_FALL}. Wer nimmt den Anruf an?"

**Visual:** Handy klingelt, verpasster Anruf (generisches Asset, wiederverwendbar)

**Varianten nach Gewerk:**

| Gewerk | Typischer Fall |
|--------|---------------|
| Sanitär (24h) | "Ein Kunde ruft an: Wasserleck im Keller. Es ist dringend." |
| Sanitär (ohne 24h) | "Ein Kunde braucht einen Termin für den tropfenden Wasserhahn." |
| Heizung (24h) | "Ein Mieter meldet: Heizung komplett ausgefallen. Minus 2 Grad draussen." |
| Heizung (ohne 24h) | "Ein Hauseigentümer will seine Heizung vor dem Winter warten lassen." |
| Sanitär+Heizung | "Ein Kunde ruft an: Wasserleck im Keller. Es ist dringend." |
| Spenglerei | "Ein Sturm hat das Dach beschädigt. Wasser tropft in die Wohnung." |

---

### Szene 3: Lisa-Moment (15s)

**Voice-Over:**
> "Mit FlowSight nimmt Ihre persönliche Lisa den Anruf an.
> Sie erkennt den {URGENCY_TYPE}, sammelt Adresse und Situation — rund um die Uhr."

**Visual:** Screen Recording eines Lisa-Anrufs (live oder vorbereitet)

**Aufnahme-Anleitung:**
1. Anruf auf Testnummer starten (Handy oder SIP-Client)
2. Lisa begrüsst mit Firmenname
3. Testfall durchspielen (z.B. "Wasserleck im Keller, PLZ 8800")
4. Lisa sammelt Daten → sauber verabschieden
5. OBS/Loom: Bildschirm-Aufnahme des Anrufs

---

### Szene 4: Proof-Moment (15s)

**Voice-Over:**
> "Der Kunde bekommt eine SMS-Bestätigung.
> Der Fall landet sofort in Ihrem Dashboard — mit allen Details."

**Visual:** Split-Screen oder Sequenz:
- Links/oben: SMS-Bestätigung auf Handy
- Rechts/unten: Ops-Dashboard mit dem Fall (Kategorie, Dringlichkeit, Adresse)

**Aufnahme-Anleitung:**
1. Nach Lisa-Anruf: SMS-Screenshot vom Handy
2. Ops-Dashboard öffnen: `/ops` → Fall anklicken → Detail-Ansicht
3. Beide Screenshots als Sequenz oder Split-Screen

---

### Szene 5: CTA (10s)

**Voice-Over:**
> "Testen Sie Ihre eigene Lisa: {TESTNUMMER}.
> Oder schauen Sie sich Ihre neue Website an: {WEBSITE_URL}."

**Visual:** Screenshot der Prospect-Website auf FlowSight (`/kunden/{slug}`)

**Beispiel Weinberger:**
> "Testen Sie Ihre eigene Lisa: 044 552 XX XX.
> Oder schauen Sie sich Ihre neue Website an: flowsight.ch/kunden/weinberger-ag."

---

## Variablen-Referenz

| Variable | Quelle | Beispiel |
|----------|--------|---------|
| `{FIRMA}` | prospect_card.json → name | "Jul. Weinberger AG" |
| `{TAGLINE}` | customer config → tagline | "Haustechnik seit 1912 in Thalwil" |
| `{TYPISCHER_FALL}` | Tabelle oben (nach Gewerk) | "Wasserleck im Keller" |
| `{URGENCY_TYPE}` | "Notfall" oder "Anliegen" | "Notfall" |
| `{TESTNUMMER}` | Twilio-Nummer des Agents | "044 552 09 XX" |
| `{WEBSITE_URL}` | flowsight.ch/kunden/{slug} | "flowsight.ch/kunden/weinberger-ag" |
| `{SLUG}` | prospect_card.json → slug | "weinberger-ag" |

---

## Technische Setup-Anleitung

### Option A: Loom (einfacher)

1. Loom Desktop App öffnen
2. "Screen + Camera" wählen (Founder-Kamera unten rechts)
3. Szenen 1-5 nacheinander aufnehmen (Pause zwischen Szenen OK)
4. In Loom trimmen → Export als MP4
5. Max 60s, 1080p

### Option B: OBS Studio (professioneller)

1. OBS installieren + Szenen-Profil "FlowSight GTM" laden
2. 5 Szenen vorbereiten (Screenshots + Browser-Fenster)
3. Voice-Over live oder als Audio-Track
4. Szenen-Wechsel per Hotkey
5. Export: MP4, 1080p, 30fps, max 60s

### Szenen-Assets (wiederverwendbar)

| Asset | Beschreibung | Pfad |
|-------|-------------|------|
| Handy-Klingeln | Generic Smartphone mit eingehendem Anruf | `docs/gtm/assets/phone-ringing.png` |
| SMS-Template | SMS-Bestätigung Screenshot | Live Screenshot pro Prospect |
| Ops-Dashboard | Fall-Detail-Ansicht | Live Screenshot pro Prospect |
| Prospect-Website | FlowSight-Website des Prospect | Live Screenshot pro Prospect |

---

## Quality Gate 4 Checkliste

Vor Versand an Prospect — alle Punkte müssen PASS sein:

- [ ] Persönlicher Einstieg mit korrektem Firmennamen
- [ ] Glaubwürdiger, branchenspezifischer Use Case
- [ ] Lisa-Anruf klingt natürlich (kein Stottern, kein Abbruch)
- [ ] Ops-Dashboard zeigt sauberen Fall
- [ ] CTA mit funktionierender Testnummer + URL
- [ ] Max 60 Sekunden
- [ ] Kein "äh", keine technischen Fehler sichtbar
- [ ] Keine PII anderer Kunden im Bild
