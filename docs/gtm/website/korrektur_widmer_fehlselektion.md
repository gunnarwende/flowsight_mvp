# Korrektur: Widmer Fehlselektion + Praeventionslogik

**Datum:** 2026-04-14
**Anlass:** Founder war persoenlich vor Ort in Horgen. Kein reales Unternehmen an der Scout-Adresse vorgefunden. Die echte Firma sitzt unter widmer-heizung.ch — ein voellig anderer Betrieb (Widmer + Co. AG, Hauptsitz Kilchberg, Heizungsspezialist, ~20 MA, professionelle WordPress-Site).

---

## 1. Was bei Widmer konkret falsch eingeschaetzt wurde

### Die Verwechslung

| | Was wir hatten | Was real ist |
|---|---------------|-------------|
| **Firmenname** | Widmer H. & Co. AG | Widmer + Co. AG |
| **Website** | widmer-sanitaer.ch (SSL-Zertifikat abgelaufen, nicht erreichbar) | widmer-heizung.ch (professionell, WordPress, 20+ Seiten) |
| **Adresse im Scout** | Seestrasse 203, 8810 Horgen | Dorfstrasse 141, 8802 Kilchberg ZH |
| **Tatsaechlich vor Ort** | Kein realer Betrieb vorgefunden | Standort Kilchberg (nicht Horgen) |
| **Branche** | "Sanitaer, Blitzschutz, Spenglerei" | Heizung + Kuehlung (kein Sanitaer) |
| **Team** | 1 Person (Michael Widmer) | ~20 MA, Team-Seite auf Website |
| **Gruendung** | 1898 (aus Scout, nicht verifiziert) | ~60 Jahre (aus Website) |
| **Google Reviews** | 5.0 Sterne, 1 Review | Nicht geprueft (anderer Google-Eintrag) |

### Das Kernproblem

Wir haben einen Google-Maps-Eintrag ("Widmer H. & Co. AG, Seestrasse 203, 8810 Horgen") als realen Betrieb behandelt, ohne zu verifizieren:
- Ob an dieser Adresse tatsaechlich ein Betrieb existiert
- Ob die zugeordnete Website (widmer-sanitaer.ch) funktioniert (tut sie nicht — SSL abgelaufen)
- Ob die Firmendaten (Gruendungsjahr 1898, Sanitaer/Spenglerei) aus dem Google-Eintrag stimmen
- Ob es eine Verwechslung mit einem anderen Widmer-Betrieb gibt

### Die Kette der Fehler

```
1. scout.mjs findet "Widmer H. & Co. AG" auf Google Maps
2. Google-Eintrag zeigt: Seestrasse 203, Horgen, 5.0★, 1 Review
3. Website widmer-sanitaer.ch wird zugeordnet (aus Maps-Daten)
4. CC erstellt prospect_card + CustomerSite Config basierend auf Maps-Daten
5. Website widmer-sanitaer.ch hat abgelaufenes SSL → wird trotzdem als "hat Website" gewertet
6. Niemand prueft physisch ob der Betrieb existiert
7. Widmer landet in der Pipeline, wird provisioniert, bekommt FlowSight-Website
8. Widmer wird als Proof-Kandidat vorgeschlagen
9. Founder faehrt persoenlich hin → kein Betrieb da
```

**Fehler in JEDEM Schritt: Kein einziger Validierungs-Check hat gegriffen.**

---

## 2. Welche Signale wir uebersehen haben

### Signal 1: SSL-Zertifikat abgelaufen
widmer-sanitaer.ch hat ein abgelaufenes/falsches SSL-Zertifikat. Die Seite laedt nicht. Das ist ein STARKES Signal, dass der Betrieb nicht mehr aktiv digital praesent ist — oder die Website aufgegeben wurde. **Dieses Signal stand sogar in der Scout-Notiz ("website zu modern" → falsch, die Site war kaputt) und in der Pipeline ("genau das suchen wir" → ohne die Website ueberhaupt oeffnen zu koennen).**

### Signal 2: Nur 1 Google-Review
Ein Betrieb, der angeblich seit 1898 existiert (126 Jahre!) und nur 1 einzige Google-Bewertung hat, ist extrem unplausibel. Das haette ein Red Flag sein muessen.

### Signal 3: Keine verifizierten Kontaktdaten
Keine E-Mail auf der Website verifiziert. Telefonnummer aus Google Maps, nicht von einer funktionierenden Website.

### Signal 4: Diskrepanz Maps-Eintrag vs. Website
Der Google-Maps-Eintrag sagt "Sanitaer, Blitzschutz, Spenglerei". Die (kaputte) Website heisst widmer-sanitaer.ch. Aber die ECHTE Firma (widmer-heizung.ch) macht Heizung/Kuehlung, nicht Sanitaer. Das sind zwei verschiedene Eintraege, moeglicherweise ein historischer Maps-Eintrag einer nicht mehr existierenden Firma.

### Signal 5: Kein Handelsregister-Check
Wir haben nie geprueft, ob "Widmer H. & Co. AG" im Handelsregister aktiv ist, wer der aktuelle Inhaber ist, und ob die Adresse stimmt. Das Handelsregister ist oeffentlich und kostenlos.

---

## 3. Zusaetzliche Validierungs-Gates (ab sofort Pflicht)

### Gate V1: Website-Erreichbarkeit (automatisierbar)

**Wann:** SOFORT nach Scout, bevor der Betrieb in die Pipeline kommt.
**Was:** HTTP HEAD-Request auf die Scout-Website. Prueft: Status 200, kein SSL-Fehler, kein Redirect auf Parking-Page.
**Ergebnis:** PASS / FAIL. Bei FAIL → Betrieb wird als "Website kaputt" markiert, NICHT als "hat Website (Gap 2)".
**Aufwand:** Automatisierbar in scout.mjs (5 Zeilen Code).

### Gate V2: Google-Review-Plausibilitaet (manuell, 30 Sek)

**Wann:** Bei der Analyse (Schritt 2 im Machine Manifest).
**Was:** Betrieb > 20 Jahre alt + < 5 Google Reviews = RED FLAG. Entweder der Betrieb ist nicht mehr aktiv, oder die Maps-Daten sind veraltet.
**Regel:** Gruendungsjahr > 20 Jahre UND Reviews < 5 → "Existence Check" Pflicht (Gate V3).

### Gate V3: Existenz-Check (manuell, 5 Min)

**Wann:** Bei JEDEM Modul-1-Kandidaten. Bei Modul 2 nur wenn Gate V2 Red Flag zeigt.
**Was:**
1. **Handelsregister-Check** (zefix.ch): Firma aktiv? Sitz stimmt? Inhaber stimmt?
2. **Google Street View:** Gibt es an der Adresse ein sichtbares Geschaeft/Schild?
3. **Telefon-Test:** Kurzer Anruf, prueft ob jemand rangeht (nicht Voice Agent, sondern realer Mensch)
**Ergebnis:** PASS (Firma existiert, Adresse stimmt, erreichbar) / FAIL (Firma nicht auffindbar).
**Bei FAIL:** Betrieb sofort aus Pipeline entfernen. Keine weitere Energie.

### Gate V4: Vor-Ort-Validierung (nur Modul 1, nur Erstbetrieb pro Region)

**Wann:** Bevor der ERSTE Modul-1-Betrieb in einer neuen Gemeinde provisioniert wird.
**Was:** Founder faehrt kurz vorbei (Velo/Auto). Prueft: Firmenschild vorhanden? Betrieb wirkt aktiv? Fahrzeuge mit Firmenlogo?
**Aufwand:** 5-15 Min (Region ist nah). Nur 1x pro Gemeinde, danach reicht Gate V3.
**Wichtig:** Dieser Check hat den Widmer-Fehler ENTDECKT. Er muss Standard werden.

---

## 4. Wie der Scout-/ICP-/Proof-Prozess angepasst werden muss

### Aenderung 1: scout.mjs → Website-Health-Check einbauen

```
Aktuell:
  scout.mjs → Google Places API → prospect_card.json (Adresse, Reviews, Website-URL)

Neu:
  scout.mjs → Google Places API → HTTP HEAD auf Website-URL → prospect_card.json
  Neues Feld: website_health: "online" | "ssl_error" | "offline" | "parking" | "none"
  Bei ssl_error/offline/parking: Gap wird NICHT auf 2 gesetzt, sondern auf 4 oder 5
```

### Aenderung 2: Pipeline-CSV → Validierungs-Spalte hinzufuegen

```
Neue Spalte: existence_verified: "yes" | "no" | "failed"
Regel: Kein Betrieb darf status=TRIAL_PREP haben ohne existence_verified=yes
```

### Aenderung 3: Machine Manifest → Gate V1-V3 als Pflichtschritte

```
Schritt 1: Scout
  → Neu: Gate V1 (Website-Erreichbarkeit) automatisch
  → Neu: Gate V2 (Review-Plausibilitaet) automatisch

Schritt 2: Analyse
  → Neu: Gate V3 (Existenz-Check) manuell, bei Red Flags aus V1/V2
  → Bestehend: prospect_card.json ausfuellen

Schritt 3: Modul-Entscheid
  → Neu: Modul-1-Freigabe NUR wenn Gate V3 PASS
  → Neu: Gate V4 (Vor-Ort) bei erstem Modul-1-Betrieb pro Gemeinde
```

### Aenderung 4: Lessons Learned aktualisieren

Neue Regel M7 in `docs/customers/lessons-learned.md`:

```
M7: Existenz-Check vor Provisioning.
    Kein Betrieb wird provisioniert ohne: (a) funktionierende Website ODER
    (b) Handelsregister-Pruefung + Telefon-Test. Google-Maps-Eintraege allein
    sind NICHT zuverlaessig. Grund: Widmer-Fehlselektion April 2026.
```

---

## 5. Drei Pflicht-Checks vor jeder Modul-1-Freigabe

| # | Check | Methode | Dauer | Wer |
|---|-------|---------|-------|-----|
| **M1-CHECK-1** | **Website laeuft** | HTTP HEAD + manuell oeffnen. Kein SSL-Fehler, kein Parking. | 30 Sek | CC |
| **M1-CHECK-2** | **Handelsregister aktiv** | zefix.ch: Firma aktiv, Sitz stimmt, Inhaber bekannt. | 2 Min | CC |
| **M1-CHECK-3** | **Vor-Ort oder Telefon** | Kurzer Anruf ODER Vorbeifahrt. Betrieb existiert physisch. | 5 Min | Founder |

**Alle drei muessen PASS sein. Ein einziges FAIL → kein Modul 1.**

---

## 6. Neuer Vorschlag fuer den zweiten realen Proof-Betrieb

### Analyse der verbleibenden Kandidaten

Nach Ausschluss von Widmer (nicht real) und Brunner (Demo):

| Betrieb | Ort | ICP | Website real? | Modul-1-Fit | Existenz verifiziert? |
|---------|-----|-----|--------------|-------------|----------------------|
| **Orlandini** | Horgen | 6 | Ja (orlandini.ch, laeuft) | Bedingt (3.8★) | Ja (FlowSight-Website LIVE) |
| Walter Leuthold | Oberrieden | 8 | Ja (walter-leuthold.ch) | Ja — aber gleicher Ort wie Doerfler | FlowSight-Website LIVE |
| Leins AG | Horgen | 7 | Ja (leinsag.ch, modern) | **Modus 2** (Website zu gut) | Nicht geprueft |
| Beeler | Thalwil | 5 | SSL kaputt | Unklar | **NICHT VERIFIZIERT** → Gate V3 noetig |
| Benzenhofer | Horgen | 5 | Digitalone-Baukasten | Bedingt (nur Heizung) | **NICHT VERIFIZIERT** → Gate V3 noetig |
| Schaub | Horgen | 6 | Ja (schaub-haustechnik.ch) | Ja | **NICHT VERIFIZIERT** → Gate V3 noetig |

### Empfehlung: Orlandini Sanitaer Heizung GmbH (Horgen)

**Warum Orlandini:**

1. **Real und verifiziert.** FlowSight-Website bereits LIVE unter flowsight.ch/kunden/orlandini. Founder-Notiz: "super. Alte website, viele reviews."

2. **Maximaler Kontrast zu Doerfler:**

| Achse | Doerfler AG | Orlandini |
|-------|-------------|-----------|
| Gruendung | 1926 (98 Jahre) | 1972 (52 Jahre) |
| Team | 2 Geschaeftsfuehrer | 0 verifizierte (bewusst leer) |
| Reviews | 4.7★, 3 Reviews | 3.8★, 28 Reviews |
| Content | 10/10 Sections | 7/10 Sections |
| Markenpartner | 7 | **17 (groesstes Netzwerk!)** |
| Farbe | #2b6cb0 (Blau) | #1a5276 (Navy) |
| Staerke | Geschichte + Familie | Partnernetzwerk + Breite |
| Schwaeche | Wenig Reviews | Schlechte Bewertung (3.8★) |

3. **Testet den schwierigen Fall:** 3.8 Sterne bedeutet, dass der Hero NICHT mit Bewertungen fuehren kann (Schwelle 4.0). Das zwingt die Pipeline, eine andere Staerke zu betonen (Partnernetzwerk, 17 Marken, 52 Jahre Erfahrung). Das ist ein haerterer Test als ein 4.7-Sterne-Betrieb.

4. **Anderer Profil-Typ:** Doerfler = TRADITION (Generationenbetrieb). Orlandini = KOMPETENZ (breites Netzwerk, viele Partner, professionelle Breite trotz schwacher Reviews).

5. **Andere Gemeinde:** Oberrieden vs. Horgen → realistischer Stammtisch-Test.

### ABER: Ehrliche Warnung

Orlandini hat ICP 6 und 3.8 Sterne. Das ist KEIN Premium-Modul-1-Kandidat. Wenn wir Orlandini nehmen, testen wir: "Kann die Pipeline auch aus einem mittelmaessigen Betrieb eine ueberzeugende Website machen?" Das ist ein haerterer Test als noetig — aber genau deshalb wertvoll.

**Alternative falls Orlandini zu schwach:** Walter Leuthold (ICP 8, verifiziert, LIVE). Nachteil: gleicher Ort wie Doerfler (beide Oberrieden). Aber er ist real, stark, und der Profil-Kontrast (Solo-Betrieb vs. Familien-AG) ist gut.

**Founder-Entscheid:** Orlandini (haerterer Test, anderer Ort) oder Leuthold (staerkerer Betrieb, gleicher Ort)?
