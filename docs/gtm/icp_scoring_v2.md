# ICP Scoring v2.0 — Aktualisiert für das heutige FlowSight

**Erstellt:** 2026-04-10
**Kontext:** Der ICP-Crawl von Februar 2026 war auf Website-Qualität fokussiert. FlowSight ist heute ein Leitsystem mit Voice Agent, Leitzentrale und Bewertungs-Engine. Das Scoring muss den echten Pain abbilden.

---

## Was FlowSight heute löst (in Reihenfolge der Zahlungsbereitschaft)

| # | Pain | Warum zahlt der Betrieb? | Modul |
|---|------|--------------------------|-------|
| 1 | **Verpasste Anrufe** | Verlorene Aufträge = verlorenes Geld | Voice Agent (24/7) |
| 2 | **Kein Überblick** | Zettelwirtschaft, Kopf-System, Dinge gehen verloren | Leitzentrale |
| 3 | **Bewertungen stagnieren** | Gute Arbeit wird nicht sichtbar, Konkurrenz überholt | Review Engine |
| 4 | **Kein Online-Kanal** | Kunden die lieber schreiben statt anrufen gehen verloren | Wizard/Website |

**Entscheidend:** Pain 1+2 brennen (zahlt sofort). Pain 3+4 jucken (braucht Überzeugung).

---

## Neues ICP Scoring (10 Punkte)

### Dimension A: Erreichbarkeits-Pain (0-4 Punkte) — WICHTIGSTE Dimension

| Punkte | Kriterium | Erkennbar durch |
|--------|-----------|----------------|
| 4 | **Kein Empfang, kein Büro, Inhaber auf Baustelle** | 1-5 MA, kein "Team"-/Büro-Seite, nur Handynummer |
| 3 | **Teilzeit-Büro oder Anrufbeantworter** | "Bürozeiten Mo-Fr 8-12", AB erwähnt |
| 2 | **Büro besetzt, aber kein System** | >5 MA, Büro vorhanden, aber kein CRM/Dispatch erkennbar |
| 1 | **Büro + Dispatch vorhanden** | Grösserer Betrieb, hat bereits Organisation |
| 0 | **Professionelles System vorhanden** | Online-Buchung, Chat, professionelles CRM |

**Wie crawlbar?**
- Teamgrösse (Website Team-Seite, local.ch, LinkedIn)
- Kontaktseite: Nur Handy-Nr? Oder Zentrale + Büro?
- Öffnungszeiten: Eingeschränkt? Durchgehend?
- Kein Online-Formular = höherer Erreichbarkeits-Pain

### Dimension B: Organisations-Pain (0-3 Punkte)

| Punkte | Kriterium | Erkennbar durch |
|--------|-----------|----------------|
| 3 | **Keine digitale Spur** | Kein Formular, kein CRM, reine Telefon-Firma |
| 2 | **Website ohne Interaktion** | Website ist Visitenkarte, kein Formular, kein Buchungs-Tool |
| 1 | **Formular vorhanden, aber kein System** | Kontaktformular → E-Mail, kein Tracking |
| 0 | **Online-Buchung oder CRM erkennbar** | Calendly, Microsoft Bookings, etc. |

**Wie crawlbar?**
- Website: Kontaktformular ja/nein?
- Online-Buchung ja/nein?
- "Powered by" Footer (zeigt CRM/Tooling)

### Dimension C: Bewertungs-Pain (0-2 Punkte)

| Punkte | Kriterium | Erkennbar durch |
|--------|-----------|----------------|
| 2 | **<10 Google-Bewertungen ODER letzte >6 Monate alt** | Google Maps API |
| 1 | **10-30 Bewertungen, unregelmässig** | Bewertungen vorhanden aber nicht aktiv gepflegt |
| 0 | **>30 Bewertungen, regelmässig** | Aktive Bewertungs-Strategie erkennbar |

**Wie crawlbar?**
- Google Places API: Rating + Count + Datum der letzten Bewertung
- Zeigt der Betrieb Bewertungen auf seiner Website?

### Dimension D: Betriebsprofil-Bonus (0-1 Punkt)

| Punkte | Kriterium |
|--------|-----------|
| 1 | Inhabergeführt + Notdienst angeboten + >10 Jahre Betrieb |
| 0 | Eins oder mehr fehlt |

**Warum:** Traditionsreiche, inhabergeführte Betriebe mit Notdienst = höchste Zahlungsbereitschaft. Sie verstehen den Wert von Erreichbarkeit.

---

## ICP Score = A + B + C + D (0-10)

| Score | Tier | Bedeutung | Aktion |
|-------|------|-----------|--------|
| 8-10 | **HOT** | Brennender Pain, hohe Zahlungsbereitschaft | Sofort kontaktieren |
| 6-7 | **WARM** | Deutlicher Pain, braucht Überzeugung | Kontaktieren wenn Kapazität |
| 4-5 | **PARKED** | Pain vorhanden, aber nicht dringend | Merken, später |
| 0-3 | **SKIP** | Kein Pain oder bereits versorgt | Nicht kontaktieren |

---

## Scoring-Beispiele (verifiziert)

### Dörfler AG → ICP 9 (HOT)
- A=4 (2-Mann-Betrieb, Inhaber auf Baustelle, nur Telefon)
- B=3 (Website ist Visitenkarte, kein Formular, kein System)
- C=1 (3 Google-Bewertungen, selten)
- D=1 (Inhabergeführt, Notdienst, seit 1926)

### Walter Leuthold → ICP 9 (HOT)
- A=4 (Ein-Mann-Betrieb, immer auf Baustelle)
- B=3 (Keine Online-Interaktion)
- C=1 (44 Bewertungen, 4.9★ — gut, aber passiv)
- D=1 (Inhabergeführt, 24h Notdienst, seit 2001)

### Jul. Weinberger AG → ICP 7 (WARM)
- A=2 (Grösserer Betrieb ~30 MA, Büro besetzt, aber kein Dispatch)
- B=2 (Website ohne Interaktion)
- C=2 (20 Bewertungen bei 4.4★ — wenig für die Grösse)
- D=1 (Inhabergeführt, Notdienst, seit 1912)

### Hypothetisch: Grosser Betrieb mit CRM → ICP 3 (SKIP)
- A=0 (Professionelle Telefonzentrale)
- B=1 (Hat Formular, kein echtes CRM)
- C=1 (15 Bewertungen, unregelmässig)
- D=1 (Inhabergeführt, Notdienst)

---

## Crawl-Checkliste pro Betrieb (für Scout)

### Automatisch crawlbar (scout.mjs + Google Places API)
- [ ] Firmenname, Adresse, Telefon, E-Mail
- [ ] Website vorhanden? Qualität? (Alter, CMS, Mobile?)
- [ ] Kontaktformular ja/nein?
- [ ] Online-Buchung ja/nein?
- [ ] Google Rating + Anzahl Bewertungen + Datum letzte Bewertung
- [ ] Team-Seite vorhanden? Anzahl sichtbare Mitarbeiter?
- [ ] Notdienst erwähnt?
- [ ] Gründungsjahr erkennbar?
- [ ] Services/Leistungen aufgelistet?

### Manuell prüfbar (Analyse, 2 Min)
- [ ] Inhabergeführt? (Impressum, Team-Seite)
- [ ] Geschätzte Teamgrösse (Website + local.ch + LinkedIn)
- [ ] Büro/Empfang erkennbar? Oder nur Handy?
- [ ] Branche passend? (Sanitär, Heizung, Elektro, Spengler)

### Daraus abgeleitet (Score berechnen)
- [ ] A-Score (Erreichbarkeits-Pain): 0-4
- [ ] B-Score (Organisations-Pain): 0-3
- [ ] C-Score (Bewertungs-Pain): 0-2
- [ ] D-Score (Betriebsprofil-Bonus): 0-1
- [ ] **ICP Total: A+B+C+D**
- [ ] Tier: HOT / WARM / PARKED / SKIP

---

## Vergleich: ICP v1 (Februar) vs. ICP v2 (April)

| Aspekt | v1 (Februar) | v2 (April) |
|--------|-------------|-----------|
| **Fokus** | Website-Qualität | Erreichbarkeits-Pain |
| **Scoring** | Trust (Reviews) + Gap (Website-Lücke) | Erreichbarkeit + Organisation + Bewertungen + Profil |
| **Gewichtung** | Website = 50% | Erreichbarkeit = 40%, Organisation = 30%, Bewertungen = 20%, Profil = 10% |
| **Höchster Score für** | Betrieb mit schlechter Website + vielen Reviews | Betrieb der Anrufe verpasst + kein System hat |
| **Niedrigster Score für** | Betrieb mit guter Website | Betrieb mit professionellem CRM/Dispatch |
| **Modus-Entscheid** | "Hat er eine Website?" → Modus 1 oder 2 | "Wie stark brennt der Pain?" → sofort oder später |
| **Ideal-ICP** | Betrieb ohne Website mit guten Reviews | Inhabergeführter 5-Mann-Betrieb ohne Bürokraft |

---

## Marktgrösse (aktualisiert)

### Kanton Zürich

| Branche | Geschätzte Betriebe | Davon ICP 7+ | Quelle |
|---------|-------------------|-------------|--------|
| Sanitär/Heizung | ~970 | ~300-400 | ICP-Crawl Feb 2026 + Branchenverzeichnisse |
| Elektriker | ~800 | ~250-350 | Schätzung (ähnliche Struktur) |
| Spengler/Dachdecker | ~200 | ~80-120 | Schätzung |
| Schreiner (klein) | ~400 | ~100-150 | Schätzung |
| **Total Kanton ZH** | **~2'370** | **~730-1'020** | |

### Deutschschweiz

| Branche | Geschätzte Betriebe | Davon ICP 7+ |
|---------|-------------------|-------------|
| Sanitär/Heizung | ~5'700 | ~1'700-2'300 |
| Elektriker | ~4'000 | ~1'200-1'600 |
| Spengler/Dachdecker | ~1'200 | ~400-600 |
| Schreiner (klein) | ~2'500 | ~600-900 |
| **Total Deutschschweiz** | **~13'400** | **~3'900-5'400** |

### Schweiz Gesamt (inkl. FR/IT mit mehrsprachigem Agent)
~20'000 Betriebe total, davon ~6'000-8'000 ICP 7+.

---

## Nächster Schritt

1. **scout.mjs aktualisieren** mit den neuen Scoring-Dimensionen (A/B/C/D)
2. **10 Betriebe Region Zimmerberg** als Pilot-Crawl mit neuem Scoring durchführen
3. **Ergebnis reviewen** — stimmen die Scores mit der Founder-Intuition überein?
4. **Dann:** Machine Manifest Pipeline starten mit den Top-Scored Prospects
