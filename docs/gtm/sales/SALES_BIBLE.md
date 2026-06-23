# SALES BIBLE — FlowSight Akquise (Verkaufs-Abschnitt der Customer Journey)

> **SSOT für die Verkaufs-Sterne der Customer Journey** (1 Kontakt · 2 Cold Call · 4 Gesehen · 5 Verkaufsgespräch · 8 Referenz).
> Orchestrator über allem: [`../CUSTOMER_JOURNEY_BIBLE.md`](../CUSTOMER_JOURNEY_BIBLE.md). Schwester-Handbücher:
> [`../pipeline/PIPELINE_BIBLE.md`](../pipeline/PIPELINE_BIBLE.md) und [`../onboarding/ONBOARDING_BIBLE.md`](../onboarding/ONBOARDING_BIBLE.md).
> **Hier findet die tägliche Sales-Arbeit statt.**
>
> **Stand:** 2026-06-15 · **Owner:** Founder + CC · **Status:** v1 — ICP/Region/Preis gelockt, Abend-Ritual aktiv.
> **Nordstern über allem:** der Erfolg von FlowSight — *und* der wiederverwendbare Sales-Playbook für die
> 2027-Branchen (Elektriker, Coiffeur, Garage, Massage).

## Die Reise und ihre Nähte (Sales · Pipeline · Onboarding als Abschnitte)

```
SALES ──[Weg 1: "ja, schicken Sie"]──▶ PIPELINE ──[Beweis-Seite fertig+verschickt]──▶ (zurück: warmer Follow-up)
  │                                                                                            │
  └─[Weg 2: kein Interesse → parken, Re-Touch ~3 Mt]                              [Ja, ich baue/kaufe]
                                                                                              ▼
                                                                          ONBOARDING (Cockpit → Go-live → Validierung)
                                                                                              │
                                                                              [zufriedener Kunde → Referenz] ──▶ zurück zu SALES
```

- **SALES** (diese Bible): der menschliche Funnel — finden, qualifizieren, das Gespräch, Weg-1/Weg-2,
  Discovery bis zur Bau-/Kauf-Zusage. **Triggert** die Pipeline (nur für Ja-Sager).
- **PIPELINE**: die automatische Asset-Fabrik (Crawl → 4 Videos → Beweis-Seite). Läuft **auf Sales-Kommando**,
  nicht spekulativ. (Das alte „Phase 3 Kalt-Versand" ist Sales untergeordnet.)
- **ONBOARDING**: Lieferung ab der Zusage (Cockpit → Go-live → Validierung). Erfolg → Referenz → zurück zu Sales (**Schwungrad**).

> **Eine-SSOT-pro-Fakt-Regel (nicht verhandelbar — verhindert Drift über drei Bibles):** Jeder Fakt lebt an
> **einem** kanonischen Ort, alle anderen **verlinken** statt zu kopieren. Kanonisch hier: **ICP (§3)** + **Preis (§5)**.
> Die durchgehende Reise: [`FlowSight_Customer_Journey_SSOT.md`](FlowSight_Customer_Journey_SSOT.md).

---

## §0 · Das Problem, das diese Maschine löst

Die Pipeline baut ein **Geschenk** (personalisiertes Beweis-Video). Aber **der Betrieb öffnet die Box nicht**
(die Bunny-Views bei Walter/Leins war der Founder selbst). Drei Wurzeln: **(1) falscher Kanal** (Kalt-Mail
an Fremde = schwächster Kanal für misstrauischste Zielgruppe), **(2) rückwärtige Ökonomie** (teures Asset vor
jedem Lebenszeichen verbrannt) → *Mensch qualifiziert zuerst, Asset belohnt danach*, **(3) falscher Nordstern**
(„Videos geschaut?" statt „qualifizierte Gespräche/Woche"). Das Video ist Türöffner, nicht der Verkauf.

## §0a · Was darf nie passieren (sofortiger Abbruch)

Der Betrieb testet nicht zweimal. Jeder Punkt = verbrannte Chance.

**Vertrauensbrüche:** Lisa sagt falschen Firmennamen · Lisa gibt falsche Infos (Preise/Zeiten — lieber „das müsste ich prüfen") · SMS kommt nicht (stärkster WOW stirbt) · Website 404/fremde Firma/kaputtes Layout · SMS an falsche Nummer (Datenschutz). **Prävention: E2E-Test als Quality Gate vor JEDEM Kontakt.**

**Verkaufs-Fehler:** Preis/Vertrag im Erstkontakt (Wechsel von Staunen zu Verhandeln) · E-Mail sieht nach Template aus · technisches Setup nötig („ich bin Sanitär, nicht IT") · Founder meldet sich am Folgetermin nicht (High-Touch ohne Touch).

**System-Ausfälle:** System fällt während Test aus · Dashboard leer beim ersten Login · Review an unzufriedenen Kunden (1-Stern statt 5). *(Quelle: gold_contact.md §4)*

---

## §1 · „Sales-Maschine go" — das Abend-Ritual (das Herz)

**Der Founder bereitet am Abend den Folgetag vor und sagt „Sales-Maschine go". CC liefert die komplette
Tagesmunition — fertig zum Abarbeiten am nächsten Morgen.** Lean, sauber, founder-tauglich.

**Was CC bei „Sales-Maschine go" tut (in dieser Reihenfolge):**
1. **Stand lesen:** `../../sales/leads.csv` (offene Leads, Status, fällige Follow-ups), `lessons_learned_sales.md`
   (was zuletzt zündete), Tagesmodus (§10 Lernen/Push), welcher Motor morgen dran ist (Vor-Ort-Tag vs. Telefon-Tag).
2. **Tagesprogramm festlegen:** Motor (A Vor-Ort Ring 0 / B Telefon Ring 1) + die N Betriebe für **genau diesen
   einen Tag** — Reihenfolge: **fällige Follow-ups zuerst, dann warm (bekannter Entscheider) → ICP-Score.**
3. **Anreichern (frisch):** die N Betriebe crawlen/aktualisieren — Entscheider (Name·Rolle·Mail), Größe→Tarif,
   Painpoint-Signale, Rating/Reviews, Notdienst, Website-Eindruck. *(Automatik: Lead-Motor §14 + Crawl/Vision.)*
4. **Ausgeben:** pro Betrieb **ein Vorbereitungsblatt** (§11) + ein **Tages-Laufblatt** (Reihenfolge/Route).
   Liegt am Abend bereit → der Founder startet morgens ohne Rüstzeit.

**Der Tages-Kreislauf (Heartbeat):**
```
Abend: "Sales-Maschine go" → CC legt morgen bereit (Laufblatt + Vorbereitungsblätter)
Morgen: Founder arbeitet ab (Vor-Ort/Telefon)
Nach JEDEM Gespräch: Founder gibt CC 1:1-Feedback (Inhalt, Emotion, Aufbau, Ergebnis)
  → CC pflegt lessons_learned_sales.md + leads.csv-Status → re-priorisiert für den nächsten Abend
```

---

## §2 · Prinzipien

1. **Mensch qualifiziert. Asset belohnt.** Billiger Kontakt zuerst; Video nur für die mit Puls.
2. **Das Video ist der Abschluss von Kontakt #1, nicht die Bitte.** Verdiene 60–90 Sek + **einen Folgetermin.**
3. **Verbindlichkeit ersetzt Mitschauen.** Kein Watch-together am Telefon — der vereinbarte Folge-Anruf ist die
   Verbindlichkeit; First-View-Alert bestätigt. Mitschauen erst beim Vor-Ort-Termin.
4. **Geben entwaffnet, Prüfen verteidigt** (S1). Nie „Haben Sie die Mail angeschaut?" → das Geschenk voran.
5. **Lokal schlägt breit.** Eine glaubwürdige lokale Referenz (Dörfler) > 500 Kalt-Mails.
6. **Du bist *kein* glatter Verkäufer — das ist deine Waffe.** Skepsis ist Default (S5), schmilzt bei „kein Drücker" (S3).
7. **Spiegel-Effekt — Geschenk statt Demo.** Jeder Berührungspunkt zeigt dem Betrieb *sich selbst* in unerwarteter Qualität (sein Name in Lisa, sein Firmenname als SMS-Absender, seine Reviews auf der Seite). Wirkt in 30 Sek auf drei Ebenen: **Wiedererkennung** („das ist meine Firma") → **Aufwertung** („so gut sah mein Betrieb nie aus") → **Projektion** („wenn das mit echten Kunden so läuft…"). Die Demo sagt „kauf mich", das Geschenk sagt „ich habe an dich gedacht". *(Quelle: gold_contact.md §2)*

---

## §2a · Das 5-Stufen-Kaufmodell

Ein Betrieb sagt Ja, wenn fünf Dinge **gleichzeitig** stimmen — fehlt eine Stufe, kippt es.

1. **Schmerz** — „Ich verliere wirklich etwas." (selbst-entdeckt, nie präsentiert — das System hält den Spiegel)
2. **Beweis** — „Es funktioniert. Jetzt. Für mich." (sein Name, seine Daten — nicht generische Demo)
3. **Risiko-Null** — „Ich kann nichts verlieren." (muss spürbar sein, nicht erklärt — monatlich kündbar, zahlt am Go-live)
4. **Soziale Bestätigung** — „Frau / Kunde / Kollege findet das gut." (stärkste Form: sein eigener Endkunde)
5. **Handlungsdruck** — „Jetzt, nicht irgendwann." (nur ehrlich: Region exklusiv, persönliche Verfügbarkeit — nie „nur noch 3 Tage")

Fehlt **Schmerz** → „brauche ich nicht". Fehlt **Beweis** → „funktioniert das wirklich?". Fehlt **Risiko-Null** → „was wenn…?". Fehlt **Sozial** → „muss nochmal drüber nachdenken" (= mit Partner reden). Fehlt **Druck** → „ja, irgendwann" (= nie). *(Quelle: gold_contact.md §1)*

## §2b · Sechs Psychologie-Hebel + defensives Verkaufen

| Hebel | Prinzip | Einsatz |
|---|---|---|
| **Vorleistung** (Reciprocity) | wer zuerst gibt, dem will man zurückgeben | „Ich habe für Sie etwas ausprobiert" — Seite/Lisa/Nummer existieren schon |
| **Lokale Nähe** | „einer von uns" schlägt „bester Anbieter" | „aus Oberrieden", PLZ in Lisas Antwort, Ort im Gruss |
| **Proof-Staffelung** | einer = Zufall, drei = System, fünf = Überzeugung | visuell → auditiv → physisch (SMS) → strukturell → temporal |
| **Curiosity Gap** | offene Schleifen lassen das Hirn nicht los | E-Mail öffnet die Schleife, erklärt NICHT was Lisa tut — das Video schliesst sie |
| **Loss Aversion** | drohender Verlust > möglicher Gewinn | „Nummer ist für Sie reserviert — ein Betrieb, eine Region" |
| **Cognitive Ease** | je einfacher, desto vertrauenswürdiger | „kein Login, kein Vertrag — einfach anrufen" |

**Defensives Verkaufen (Schweizer Marktpsychologie):** Niemals Druck. Niedrige Erwartung rein („ich hätte gern Ihr ehrliches Feedback, auch kritisch") → Erlebnis übertrifft sie → Kinnlade fällt. „Feedback gesucht" entwaffnet den Skeptiker, bevor er überhaupt schaut. *(Quelle: schatztruhe_final.md §2)*

---

## §3 · ICP — **SSOT (kanonisch)** · zweistufig

> **Kanonische ICP-Definition. Andere Docs verlinken hierher, kopieren nicht.**

**Leitsignal (nicht die MA-Zahl):** *Klingelt das Telefon noch in der Hosentasche des Inhabers auf der
Baustelle — oder fängt es ein echtes Büro zuverlässig ab?* „Ja, Inhaber am Telefon" = alle Pains gestapelt.

| Stufe | Größe | Profil | Preis (§5) |
|---|---|---|---|
| **Solo-Leitsystem** | **1–3 MA** | Inhaber = alles, Telefon/Mobil einziger Kanal, Erreichbarkeits-Pain max | **CHF 950/Mo** |
| **Premium-Leitsystem** | **4–15 MA** (Bullseye **4–8**) | inhabergeführt, noch operativ, Budget da | **CHF 2'000/Mo** |

**Qualifizierende Signale:** inhabergeführt · Telefon/Mobil Hauptkontakt · kein Online-Formular/Booking ·
4.3–5.0★ aber **<30 Bewertungen** · moderne/brauchbare Website · linkes Zürichsee-Ufer.
**Disqualifikatoren:** >15 MA mit Disposition/CRM · kaputte/keine Website (Sonderfall) · >50 Rev + ≥4.8★.
**Größe = Preis- *und* Positionierungs-Schalter** → der Lead-Motor (§14) muss verlässlichen MA-Proxy
liefern (Crawl/Vision). Gleiches Produkt, **größen-differenzierter Painpoint**: Solo 1–3 = Erreichbarkeit
(Inhaber ist der Kanal), Premium 4–15 = Steuerbarkeit/operative Komplexität — Darstellung je Stufe (Haken §11).

## §3a · Segment-Lehre (Website-Stärke als Lead-Qualitätssignal)

Drei Segmente aus Scout-Daten — das Geld sitzt in **A**:

- **A — Website-stark** (gute Site, 20+ Reviews, 5–15 MA): höchste Zahlungsbereitschaft, geringste Delivery-Reibung, klarster Pain, bestes Referenzpotential. **Bestes Fit.**
- **B — Website-schwach** (keine/veraltete Site, 1–5 MA, <10 Reviews): grösster Pain, aber **geringste Zahlungsbereitschaft, höchste Delivery-Reibung, grösstes Churn-Risiko** (kann CHF 950/Mo schlecht tragen → kündigt nach 3 Mt), schwächster Social Proof.
- **C — gemischt** (brauchbare Site, 3–8 MA): mittlere Zahlungsbereitschaft, Website-Refresh ggf. späterer Upsell.

**Konsequenz für ICP-Scoring:** „keine Website" ist **kein Bonus**, sondern ein Warnsignal für höheren Aufwand + niedrigere Zahlungsbereitschaft. *(Quelle: _archive/gtm-website/analyse_modul1_vs_modul2.md §6)*

---

## §4 · Region — drei konzentrische Ringe

| Ring | Kanal | Gebiet | Universum | Rolle |
|---|---|---|---|---|
| **0** | Velo / Vor-Ort (Motor A) | **Oberrieden · Horgen · Thalwil · Rüschlikon** | ~25–40 | lernen jetzt + erste Referenzen |
| **1** | Telefon (lokale Glaubwürdigkeit) | restl. Bezirk Horgen + linkes Ufer (Adliswil, Kilchberg, Wädenswil, Richterswil, Au, Langnau a.A.) | ~60–100 | Hauptjagd (Motor B) |
| **2** | Telefon (Skalierung) | restl. Kanton ZH | ~300–400 ICP | später |

Ring 0 jetzt Hauptfokus; Ring 1 parallel klein (Telefon-Bewegung lernen); Ring 2 später.

## §4a · Markt & Sweetspot (Kontext)

- **Adressierbarer Markt** (Sanitär/Heizung 3–30 MA): **~970 Kanton Zürich · ~5'700 Deutschschweiz · ~15'000 CH**. Markt gross genug — nicht jeden nehmen.
- **Premium-Sweetspot = 5–15 MA** (optimal 8–15): hier entsteht die operative Komplexität (Termine, Zuweisung, Koordination), die das Leitsystem unverzichtbar macht. ~450 in Zürich. **Solo 1–3 MA = bewusste eigene Stufe** (Solo-Leitsystem, Erreichbarkeits-Pain max — der Inhaber IST der Kanal); nicht als Nicht-Kern abgetan, sondern größen-differenziert positioniert (§11). *(Founder-Entscheid 2026-06-23: ICP dauerhaft zweistufig 1–3 + 4–15.)*
- **Kategorie:** FlowSight ist ein **vertikales Field-Service-/Leitsystem** (Vergleich: ServiceTitan, Jobber, Housecall Pro — keines mit Voice-AI/CH-Dialekt), kein „AI-Telefonassistent". Diese Abgrenzung schützt den Preis.
- **Kostentreiber:** **SMS dominiert (57–84 % der variablen Kosten)**, nicht Voice. Jeder SMS→E-Mail-Shift verbessert direkt die Marge. *(Quelle: redesign/leitstand/pricing_und_marge.md §5–§6)*

---

## §5 · Preis — **SSOT (kanonisch)** · zwei Stufen, gegensätzliche Psychologie

> **Kanonische Preis-Zahlen. Andere Docs verlinken hierher.** Die *Gesprächs-Choreografie* (wie man den Preis
> im Gespräch setzt) lebt in [`FlowSight_Customer_Journey_SSOT.md`](FlowSight_Customer_Journey_SSOT.md) §9.

| Stufe | Monat | Aktivierung | Psychologie |
|---|---|---|---|
| **Solo (1–3 MA)** | **CHF 950** | ~CHF 1'000 | Schwellen-Effekt *nutzen* (<1'000) → Ja-Schwelle senken |
| **Premium (4–12 MA)** | **CHF 2'000** | ~CHF 2'500 | rund & gewichtig, *kein* 1'900-Trick → Substanz signalisieren |

**Regeln:** dem Kunden **eine runde Zahl mit Überzeugung — nie eine Spanne, nie gerechtfertigt** (intern Spanne,
erste 3–5 kalibrieren = kein Rabatt). **Solo ≠ Premium minus 1'000**, sondern schlanker Scope (self-service).
**Anker = verpasster Auftrag / Empfangskraft, nie andere Apps.** Monatlich kündbar = Risiko-Umkehr, kein Trial,
gezahlt am Go-live.

**„Können wir das mal testen?" (Kaufsignal — NICHT in Gratis-Trial einknicken):** Reframe — *er testet nicht an
einem Demo-Konto, sondern baut sein echtes Leitsystem auf, hört vor dem ersten echten Kunden seine eigene Lisa,
ich prüfe alles.* Die **monatliche Kündbarkeit ist der Test/die Risiko-Umkehr** (kein Provisorium). „Zahl nicht
vor dem echten Anruf" → „Sie zahlen erst am Go-live, kaufen nichts blind" (build-love-then-pay). Gratis-Trial
würde Premium + Modell untergraben + frisst pro Nicht-Käufer ein volles Setup — auch bei den ersten 3–5 nicht.

---

## §6 · Zwei Motoren

| Motor | Rolle | Lernziel | Phase |
|---|---|---|---|
| **A — Vor-Ort / Velo** | erste 5–10 Kunden, Ring 0 | tief lernen jetzt | Wochen 1–3 primär |
| **B — Telefon öffnet die Box** | wiederholbare Bewegung | lernen für Skalierung | parallel klein → Hauptmotor |

---

## §7 · Motor A — Vor-Ort (Ring 0, Velo)

Auf den echten Dörfler-Lessons (S1–S5): **(1) vorher anrufen (S4)** → eingeladen statt kalt; **(2) Beziehungs-
Brücke zuerst (S2)**; **(3) geben statt fragen (S1)** („Ich hab Ihnen ein kurzes Video gemacht"); **(4) Ziel =
Gesicht + Saat, nicht Abschluss (S4)**; **(5) Druck raus, Raum lesen (S3)**. Mitschauen *hier* okay.

---

## §8 · Motor B — Telefon öffnet die Box

Der Inhaber **hebt ab, weil es ein Auftrag sein könnte** — Hebel, den die Mail nie hat. **~8 Sek** bis „Verkäufer".
**Fenster:** 06:45–07:30 · 11:30–12:30 · 16:30–18:00.

**Vorgebaut vs. erst-bei-Signal (gelöst):** für **kaltes Ring-1/2-Scale = erst-bei-Signal bauen** (Weg-1-Ja
triggert die Pipeline — schützt die Ökonomie). Nur für die **warmen/lokalen wenigen** (Dörfler, Walter, Leins —
Beweis-Seiten existieren) referenzierst du das fertige Asset im Gespräch.

**Kalt-Einstieg:** *„Grüezi Herr [Name], Gunnar Wende — ich störe Sie sicher grad zwischen zwei Baustellen,
passt eine Minute? … Ich arbeite mit Sanitärbetrieben hier am Zürichsee, u.a. der Dörfler AG in Oberrieden. Ich
würde Ihnen gern in einem 90-Sek-Video zeigen, wie kein Anruf mehr verloren geht, wenn Sie auf dem Dach sind —
darf ich's Ihnen aufs Handy schicken, und ich ruf Sie [Donnerstag] kurz an, was Sie davon halten?"*
**Türsteher:** *„…ich hab dem Chef etwas Konkretes für den Betrieb — wann erwische ich ihn am besten?"*
**Nicht erreicht → Anruf, DANN SMS** mit Link. **Folge-Anruf** = Discovery (SSOT §5a): geschaut → warm <24h;
nicht geschaut → Nudge ohne Vorwurf.

---

## §9 · Die Rampe — wo du WANN ran musst

- **JETZT (Lernen, Wo 1–4):** Engpass = DU am Funnel-Anfang → **Menge echter Berührungen × Gesprächs-Skill +
  Nachbereitung nach JEDEM Kontakt.**
- **MITTE (Validieren, Wo 5–12):** Konstanz + Cockpit→Abschluss.
- **SPÄT (Drücken, Wo 13–28):** Engpass kippt zu **liefern** (ab Kunde ~10–15) → Cockpit echt self-service +
  Go-live templatisiert. **Dieser Hebel entscheidet über die 30.**

---

## §10 · Tagessystem — zwei Modi

**Modus LERNEN (jetzt, ~10 Tage):** Ziel = Erkenntnis, nicht Abschlüsse. **3–5 echte Gespräche/Tag**, Debrief =
Produkt. Nordstern: **„≥3 Gespräche + ≥3 Lessons + ≥1 Hypothese aufgelöst"**. Nachmittags: Cockpit selbst
durchgehen (OC6/OC7-Lücken finden). Lessons als **universell vs. Sanitär-spezifisch** markieren (2027-Playbook).
**Trainings-Tooling (vor den ersten Calls):** `lernblatt.txt` (12 Anker + Preis + 15 Einwände, auswendig) +
`roleplay_audio.mjs` → zwei Handy-MP3s pro Strang (`_voll` = beide Stimmen zum Anhören; `_pausen` = Betrieb
spricht, du füllst die Lücken). Pro Dialog-JSON unter `customers/<datum>/roleplay/`. Internalisieren, nicht rezitieren.
**Exit-Kriterien → Push:** Opener durch die 8-Sek-Wall · 3 zündende Fragen + 3 Einwände beherrscht · ≥1 volle
Discovery→Cockpit · ICP-Leitsignal bestätigt · ≥3–5 neue S-Regeln.

**Modus PUSH (nach Graduierung):** 3 Anruf-Fenster, Scoreboard (Wählversuche 20–30 · Gespräche 6–10 ·
Interesse+Fit 1–3 · Discoveries ≥1), Liefer-Blöcke dazwischen. Wochen-Ziel 1 → 1,5–2 Abschlüsse.

---

## §11 · Vorbereitungsblatt pro Betrieb (das Ritual-Output)

Eine Datei je Betrieb pro Tag unter `customers/<datum>/<slug>.md`. **Layout-Regel:** ruhig, ein Lesepfad von
oben nach unten, **keine Symbole/Emojis**, Fett nur für „Ziel" und „Anrufen". Inhaltlich **voll ausformuliert** —
der Founder liest die Sätze beim Telefonieren ab, keine Verweise wie „weiter zu 3". **Muster-Datei:**
`customers/2026-06-16/leins-ag.md`.

**Aufbau:**
- **Kopf:** „Firma — Entscheider" + eine Kontext-Zeile (Priorität · warm/kalt · Tarif · Ort · Telefon). Dann
  **Ziel** (ein Satz) und **Anrufen** (Zeitfenster mit Begründung).
- **Vier Stufen**, jede mit: Ziel der Stufe · Wortlaut (Sätze zum Ablesen) · *Warum* (eine Zeile Begründung) ·
  „Wie er reagieren könnte" (Verzweigungen voll ausgeschrieben):
  1. **Einstieg** — **Ort-Bezug schon im Gruss** („Gunnar Wende aus Oberrieden") = sofort Nachbar statt anonymer Anrufer (stärkster Effekt am Seeufer). Dann warm + respektvoll: **Zeit-Respekt vorweg** („ich weiss, Sie sind mitten im Tagesgeschäft, drum mach ich's kurz" — nimmt die „keine Zeit"-Abwehr), Anruf als **Höflichkeit** rahmen („persönlich melden, nicht anonym per Mail nachhaken"), kein Prüfungs-Frame (nie „Haben Sie's angeschaut?", S10). **Ruhige Professionalität statt aufgesetztem Humor** (ein Spruch kann danebengehen). **Keine Eröffnungs-Stille** — DU führst, der Einstieg endet mit einer leichten Frage (Ja-Tür).
  2. **Discovery in drei Ebenen** (Journey §5): **Realität** (erst Prozess neutral erzählen lassen — „wie läuft
     das heute, wenn eine Anfrage reinkommt?" — DANN weich zum Schmerz; nie sofort „woran hakt's?") → **Konsequenz**
     (was es kostet, „würden Sie's merken?" + Auftragswert = seine ROI-Erkenntnis) → **Commitment** (will er
     ändern? „woran würden Sie in 3 Monaten merken, dass es sich gelohnt hat?"). Gate: 2 von 3 (Problem · kostet · will ändern).
  3. **Brücke** — zusammenfassen → Outcome → „Wie klingt das?" → schweigen (nie die Technik nennen).
  4. **Abschluss** — ein **kleiner, niedrigschwelliger** Schritt mit Datum (meist nur das kurze Folgegespräch),
     kein grosses „Aufbau"-Commitment. Das Cockpit/„Sie bauen Ihr System" kommt erst, wenn er warm + es produktiv ist. Mehrere Verzweigungen (Ja / zögert / Nein).
- **Einwände** — nach 3A (s.u.). **Preisfrage** — Mechaniker-Reframe (s.u.).
- **Nach dem Anruf** — Erreicht? · Stimmung · was zündete/stockte · Einwand · nächster Schritt + Datum · Lesson.

**Haken wählen (CC aus den Signalen):**
| Signal | Haken | Frame |
|---|---|---|
| Solo/Klein, Inhaber-am-Telefon | A — verpasster Anruf / verlorenes Anliegen | „Wer fängt die Anfrage, wenn Sie grad im Schacht sind?" |
| Büro vorhanden / Mittel | B — Übersicht & Steuerbarkeit | „Was reinkommt, bleibt sichtbar, priorisiert, nachvollziehbar." |
| 24/7-Notdienst beworben | C — Notdienst-Versprechen vs. Realität | „7/24 versprochen — wer hebt um 22 Uhr wirklich ab?" |
| guter Ruf, <30 Bewertungen | D — Bewertungs-Lücke (oft sekundär) | „Ihr Ruf ist top — aber er wächst nicht von allein." |

Prinzip (S7): bei etablierten Betrieben Sichtbarkeit, keine Konkurrenz-Drohung. Spannung aus dem eigenen
hektischen Alltag, nicht aus Angst.

**Einwand-Standard — 3A (Hormozi; Lessons S11):**
- **Acknowledge:** das Gesagte zurückspiegeln (er fühlt sich gehört, du gewinnst Denkzeit).
- **Associate:** mit etwas Positivem verknüpfen + ihm ein Label geben. *Solange wir keine echten Referenzen
  haben:* mit einer Wahrheit + Label arbeiten, NICHT mit erfundener Social Proof („unsere besten Kunden…" wäre
  gelogen — verstößt gegen „State the facts").
- **Ask:** eine Frage, die zurück ins Gespräch führt. Die Frage des Prospects nie direkt beantworten — „be like
  smoke", eine Frage über seine Frage stellen (wer fragt, führt). Nie „Haben Sie Fragen?".
- **Preisfrage:** Preis ist **grössen-basiert + transparent**, NICHT aus seinen Antworten ableiten — „hängt von
  Ihrer Grösse ab, nicht von dem, was Sie erzählen; erst klären wir den Fit." Sonst stapelt er Menge/Wert tief, um
  zu drücken (fixe Tiers, nicht wert-basiert — Detail §5). Die **Mechaniker-Analogie** nur für „Antwort/Diagnose
  vor Verständnis" (z.B. technische Fragen), nicht für den Preis.
- **Tonalität:** die Struktur nutzen, nie den glatten Closer-Ton — es muss „echter Typ, kein Drücker" bleiben (S3/S5).

## §11a · Die drei harten Mom-Test-Fragen

**Regel:** Past behavior > future intent — nie „Würden Sie…", immer „Was haben Sie…". Vor jedem Call die 3 Fragen aufschreiben, nicht improvisieren. Nicht pitchen, bevor Frage 1+2 beantwortet sind.

1. **Past-Behavior-Anker:** „Wenn nächste Woche das Telefon klingelt, während Sie auf dem Dach stehen — was machen Sie genau?" (will: konkrete Handlung mit Reibung; „ich rufe abends zurück" = kein Schmerz → Lead schwach)
2. **Verlust-Quantifizierung:** „Wie viele Aufträge im letzten Monat sind Ihnen entgangen, weil Sie nicht ans Telefon konnten?" (Zahl ODER „weiss nicht" — **„weiss nicht" IST die Schmerzstelle**: „Wäre es wertvoll, das in 30 Tagen exakt zu wissen?")
3. **Commitment-Probe:** „Wenn ich Ihnen heute eine Lösung gebe und Sie merken in 30 Tagen, sie bringt nichts — was kostet Sie das?" (will bewusste Kalkulation; „nichts, ich teste ja" = nicht im Commitment)

**Verbote (Mom-Test):** keine „Würden Sie X zahlen?", kein „Glauben Sie, das wäre nützlich?", kein „Was halten Sie von unserer Lösung?" — Future-Intent + Höflichkeits-/Compliments-Falle. *(Quelle: discovery_questions.md)*

**Bonus-Closer (Referral als Vertrauens-Lackmus):** „Wenn das System Ihnen 3 verpasste Aufträge im Monat zurückholt — kennen Sie 2 andere Betriebe, denen das auch helfen würde?" Bricht die Höflichkeits-Falle: wer nicht referieren will, glaubt selbst nicht an die Lösung. **Bei jedem Nein die Referral-Tür öffnen** — ein echtes Nein, das einen anderen Betrieb nennt, ist wertvoller als ein höfliches Ja. *(Quelle: discovery_questions.md)*

## §11b · Einwand-One-Pager (Sanitär)

**Prinzip:** nicht rechtfertigen, nicht überreden. Jeden Einwand zuerst *würdigen*, dann mit Past-Behavior-/Verlust-Frage zurückgeben. Der Einwand ist fast nie der echte Grund — dahinter: Aufwand-Angst, Geld, oder „läuft das schon?".

| Einwand | Echte Angst | Antwort (würdigen → zurückgeben) |
|---|---|---|
| „Keine Zeit, kein IT-Mensch." | Aufwand/Pflege | „Genau dafür gebaut — Sie richten nichts ein, läuft erst wenn Sie Ja sagen; macht's mehr Arbeit als spart, hören wir auf." |
| „Was kostet das?" (zu früh) | Preis-Anker zu früh | **Nicht beziffern.** „Gern — aber erst wenn klar ist, ob's zu Ihnen passt. Sonst reden wir über Geld für etwas, das Sie vielleicht gar nicht brauchen." |
| „Meine Frau/Sekretärin nimmt ab." | „brauch ich nicht" | „Und wenn die auch grad nicht kann — Baustelle, Mittag, Ferien? Es geht nicht ums Ersetzen, sondern dass nichts durchfällt." |
| „Die rufen halt nochmal an." | Verlust-Blindheit | „Manche schon. Wissen Sie, wie viele NICHT nochmal anrufen, sondern gleich den Nächsten?" |
| „Hab schon einen 24/7-Notdienst." | (berechtigter Stolz) | **Würdigen:** „Stark, den haben wenige so sauber. Hier geht's nicht um Erreichbarkeit — sondern dass jeder Anruf als sauberer Fall landet statt im Kopf/auf dem Zettel." |
| „KI? Datenschutz?" | Misstrauen/Technik | „Schweizer Nummer, Server Frankfurt, DSGVO-konform, keine Gesprächsaufnahmen." |
| „Ersetzt das meine Leute?" | Loyalität/Identität | „Nein. Fängt nur auf, was sonst durchfällt. Ihre Leute machen die Arbeit." |
| „Bin schon bei einer Agentur reingefallen." | Web-Agentur-Trauma | „Verstehe ich. Kein Projekt, kein Vorab-Honorar, monatlich kündbar — Sie sehen's erst laufen." |
| „Läuft das jetzt schon bei mir?" | Kontrollverlust-Panik | „Nein, nichts ist scharf — das war eine Vorschau nur für Sie. Live geht es erst, wenn SIE das Wort geben." |
*(Quelle: discovery_questions.md)*

## §11c · Wedge-Beispiel: Betrieb mit echtem Notdienst (Dörfler)

Hat der Betrieb bereits einen echten 24/7-Notdienst → **nicht „Erreichbarkeit" verkaufen** (haben sie, würde herablassend wirken). Der Wedge ist:
- **(a) Struktur statt Zettel/Kopf:** Wenn beide auf dem Einsatz sind, wird der Anruf trotzdem ein sauberer Fall — nichts geht verloren.
- **(b) Bewertungen sichtbar machen:** gute Arbeit / 4,7★, aber zahlt nicht automatisch auf den Ruf ein.

Angepasste Discovery: „Wenn beide grad auf dem Einsatz sind und es klingelt — was passiert mit dem Anruf?" · „Wie viele Anliegen gehen im Monat unter, weil sie auf einem Zettel/im Kopf hängen?" · „Ihre Sterne — fragen Sie aktiv nach Bewertungen, oder ergeben die sich von allein?" **Anti:** Notdienst nicht kleinreden — würdigen. Kein Preis, kein „KI"-Buzzword. *(Quelle: discovery_questions.md)*

---

## §12 · Funnel & das 30-Kunden-Ziel (ehrlich)

`50 Wählversuche → ~12–18 Gespräche → ~2–4 Interesse+Fit → ~1 Opportunity/Tag` · Abschluss aus qual. Discovery
≈ 1 von 4–5 · erster Abschluss in 2–3 Wochen. 30 bis 31.12. = Moonshot (Ø ~1,1/Wo, Rampe: ~3 → ~13 → ~31).
**Boden:** 12–15 mit validierter Maschine = 2027 ausrollen. **Wand = Lieferung ab ~Kunde 15** (§9).

---

## §13 · Tracking-Disziplin

Nach Versand **Tracking auf null** (`proof_pages`) → First-View-Alert unverfälscht. Founder schaut danach nicht
selbst (S8). Beweis-Seiten **30 Tage** (`build_proof_page.mjs`, `extend_proof_pages.mjs`, `expire_proof_pages.mjs`).
Watch-Tiefe lesen (`proof_watch_report.mjs`).

## §13a · Versand-Timing (E-Mail-Outreach)

- **Tage:** Dienstag–Donnerstag. Montag = Inbox-Überflutung, Freitag = Wochenend-Modus, Wochenende = privat.
- **Fenster:** **06:30–07:15** (Handy-Check vor Abfahrt zur Baustelle, E-Mail ganz oben) · **12:00–12:45** (Mittagspause, Mobile-Check) · **18:30–19:30** (Feierabend zuhause — *bestes Fenster für Video-Content*). Frühmorgens schlägt 09:00; das Büro-B2B-Fenster greift bei Handwerkern nicht.
- **Saison:** Peak **September–November** (Heizungssaison — Volumen hochfahren). Tief **20. Dez–6. Jan + Juli–August** (Betriebsferien — Volumen runter).
- **Kadenz:** Erstversand Di/Mi 06:45 → Unopened-Resend Do 18:30 (neue Betreffzeile) → Follow-up nächster Di 12:15. **Follow-up-Anruf 48h nach Versand** (nicht 24h = gierig, nicht 72h = Momentum weg). *(Quelle: versand_timing_analyse.md; schatztruhe_final.md §11)*

## §13b · Founder-Release-Gate (vor jedem Versand)

Leitfrage: **„Würde ich diesen Prospect jetzt ohne Bauchweh kontaktieren — ja oder nein?"** Nicht Checklisten, nicht CI — das gefühlte Gold-Erlebnis entscheidet.

10 Berührungspunkte: 1) persönliche E-Mail (kein Template, Firmenname im Betreff) 2) prospect-spezifisches Asset/Video 3) Webfläche auf iPhone (sein Name, schnell) 4) Voice-Agent angerufen (Lisa sagt Firmennamen, PLZ ok) 5) SMS-Moment (richtiger Absender, Link/Upload) 6) Welcome/Magic Link (kein Passwort) 7) Dashboard mobil (sein Testfall, Demo-Cases nicht störend) 8) Trial-Journey-Mails (richtiger Ton) 9) Folge-Call-Script vorbereitet (Variante bei Skepsis) 10) Closing-Readiness (Preis klar, nächster Schritt).

Bewertung: **10/10** raus · **8–9/10** raus, Rest nachziehen (kein Kill-Punkt betroffen) · **<8** geht NICHT raus. **Mindestens 3 von 5 Prospects** müssen das Gate bestehen, sonst Start verschieben — das ist kein Scheitern, das ist Qualitätskontrolle. *(Quelle: redesign/plan.md §8)*

---

## §14 · Lead-Motor (Code in `scripts/_ops/`, Daten in `docs/sales/`)

- **`build_leads.mjs`** → `docs/sales/leads.csv` (SSOT) + `leads.md`. Ring + Tarif + Entscheider, **Merge-by-place_id,
  Founder-Status-Spalten unangetastet.** Quelle: `scout.mjs` (Discovery + ICP-Score) → `scout_raw.csv`.
- **`todays_list.mjs`** → Vor-Ort- + Telefon-Tagesblatt (`docs/sales/todays_list.md`).
- **`enrich_leads.mjs` (P12, GEBAUT 15.06.) — speist die Vorbereitungsblätter (§11):** robustes Link-Following
  (alle Nav-Links, jede Endung — **behebt den Leins-`/Ueber-uns.htm`-Fehler**) + Raw-HTML/mailto-Scan +
  **KI-Entscheider** (Claude Text-Modus über die Über-uns-Seite wählt den **GL des Kern-Bereichs**, S6 — nicht
  Gründer/Techniker) mit **Vision-Fallback** (Screenshot) für SPA/Bild-Teamseiten. Liefert **MA-Größe (=Preis-
  Schalter)**, Entscheider, Rolle, persönliche Mail, Gewerk-Flag. Schreibt Cache `docs/sales/leads_enriched.json`;
  `build_leads.mjs` merged ihn (**Priorität: Override > Anreicherung > Proxy**) → überschreibt nie. *Verifiziert:
  Leins → Michael Leins (GL Sanitär & Heizung), `michael.leins@`.* Lauf: `--url <u> --firma <f>` · `--ring 0` · `--all` (Flags `--no-vision`/`--dry-run`).

---

## §15 · Lessons-Loop

SSOT: [`lessons_learned_sales.md`](lessons_learned_sales.md) (S-Regeln + Gesprächs-Log — **hier landet dein
1:1-Feedback nach jedem Gespräch**). Ritual: nach jedem Kontakt (24h) → welcher ICP/Motor · welcher Satz zündete ·
wo stockte es · welcher Einwand · nächster Schritt. **Universell vs. Sanitär-spezifisch markieren** (2027).

---

## §16 · Offene Hypothesen (am echten Gespräch validieren)

Bester Kalt-Einstieg + Folge-Anruf-Eröffnung · Verbindlichkeit-über-Folgetermin ersetzt Mitschauen? · Vor-Ort vs.
Telefon Konversion/Kontakt · ICP-Obergrenze (10–12 MA „Büro-gepuffert"?) · Solo-900 zeit-rentabel? · Premium-2'000
Landepunkt · Dörfler-Referenz-Lift.

> **Grundgesetz:** Realität schlägt Dokument. Stark genug zum Testen, nicht endgültig zum Dogmatisieren.
