# Take 2 Screenflow — Founder Feedback Tracker

**Datum:** 20.04.2026
**Regel:** Jeder Punkt wird abgearbeitet. Nichts geht unter. Status pro Punkt.

---

## Samsung Screens (Block A)

### FB2 — Homescreen Uhr/PWA
- [ ] Uhr muss HÖHER positioniert sein (aktuell zu tief, überdeckt PWA-Icon)
- [ ] Uhrzeit-Font etwas KLEINER
- [ ] PWA-Icon darf nicht überdeckt werden
**Typ:** CSS-Fix in take2_samsung.html

### FB3 — Phone-Icon Tap
- [ ] Anruf-Button (Phone-Icon im Dock) muss HIGHLIGHTEN beim Tap
- [ ] Sieht aus als würde man wirklich drücken (Ripple + kurzes Dimmen)
**Typ:** CSS-Animation

### FB4 — Kontakt-Screen (GROSSE BAUSTELLE)
- [ ] NICHT "Häufig gesucht" — muss 100% real wirken
- [ ] Kontakt-Buttons (Anruf, SMS, 3. Button) sehen GRÄSSLICH aus → komplett neu
- [ ] Muss echte Samsung Phone App nachbilden (siehe B2 Referenzbild)
- [ ] Eigentlich: Samsung ANRUFLISTE (Tab "Letzte"), nicht Kontakt-Karte
- [ ] "Dörfler AG Test" als Kontaktname
- [ ] Anruf-Button kurz highlighten als würde man drücken
**Typ:** Komplett neues Template oder echtes Screenshot + Overlay

### FB5 — Anruf-Screen "Wird angerufen..." (GROSSE BAUSTELLE)
- [ ] Buttons unten sehen UNREAL aus — vergleiche mit FB5.1 (echtes Samsung)
- [ ] FB5.1 Referenz: Dunkler Hintergrund, transparente Button-Kreise, Samsung-typische Icons
- [ ] Aktuell: Buttons sind farbige Kreise mit Emoji → FAKE
- [ ] 4 Balken Netzempfang nicht 100% synchron mit Status-Bar
- [ ] Farbliches Spiel im Hintergrund geht zu sehr ins HELLE → leichte Bewegungen, dunkler bleiben
- [ ] Dieser Screen ist ~3 Min sichtbar → Viewer schaut INTENSIV hin → JEDES Detail zählt
**Typ:** Kompletter Rebuild des Call-Screens, Samsung-authentische Icons/Buttons

### FB6 — Anruf beendet
- [ ] Ähnlich wie FB4 — Buttons müssen realistisch sein
- [ ] "Anruf beendet" darf ruhig schön MITTIG, ZENTRAL, GROSS sein
- [ ] Aktueller Screen ist okay aber Buttons sind schwach
**Typ:** Template-Verbesserung

### FB7 — SMS Eingang
- [ ] SMS wird VON UNTEN reingezogen → POWERPOINT-Effekt → VERBOTEN
- [ ] So öffnet man KEINE SMS
- [ ] Stattdessen: SMS-Notification-Banner von OBEN → Tap → SMS-App öffnet
**Typ:** Animation-Fix in take2_samsung.html (Notification von oben, nicht Slide-Up)

### FB8 — Fehlender Homescreen nach SMS
- [ ] Nach SMS-Thread → MUSS zurück zum Homescreen kommen
- [ ] Im Script steht: ">B1< (wir springen kurz wieder zu Homescreen)"
- [ ] Aktuell: wird komplett übersprungen
**Typ:** Sequenz-Fix — Homescreen-Screen nach SMS einfügen

### FB9 — Fehlender PWA App-Highlight
- [ ] Weil FB8 fehlt, gibt es keinen Homescreen für App-Highlight
- [ ] Im Script: ">B4< (App highlighten mit echtem Effekt)"
- [ ] Roter Kreis/Pulse auf FlowSight App-Icon
**Typ:** Sequenz-Fix — erst FB8, dann B4 Highlight

---

## Leitsystem (Block A + B)

### FB10 — Einstiegsbild verschoben/komisch
- [ ] Kurze Sequenz mit verschobenen Elementen beim Laden
- [ ] Ist der Skeleton-Loading-State der nicht clean aussieht
- [ ] Muss sauber laden — entweder warten bis fertig oder Skeleton ausblenden
**Typ:** Playwright waitForTimeout länger, oder warten bis Skeleton weg

### FB11 — "Guten Abend, Admin" statt persönlich
- [ ] MUSS persönlich sein: "Guten Abend, Dörfler" (oder Firmenname)
- [ ] "Admin" = schwach und unpersönlich
- [ ] Problem: Prospect-User hat keinen display_name gesetzt
- [ ] Fix: Display-Name des Prospect-Users in Supabase setzen
**Typ:** Supabase User-Metadata fix + Pipeline-Fix (bei Provision display_name setzen)

### FB11b — Bewertungen fehlen
- [ ] Google-Bewertungen müssen im Leitsystem sichtbar sein (analog Google)
- [ ] Aktuell: "Noch keine BEWERTUNG" → stimmt nicht, Dörfler hat 4.7★/3 Reviews
- [ ] Die Seed-Daten haben review_rating auf einigen Cases → aber FlowBar zeigt "Noch keine"
- [ ] Problem: FlowBar liest review_received_at, aber die Seed-Daten setzen es nicht korrekt
**Typ:** Seed-Fix + Supabase-Datenqualität

### FB12 — Push-Notification-PopUp
- [ ] "Benachrichtigungen aktivieren?" PopUp erscheint im Video
- [ ] MUSS bei Video-Erstellung KOMPLETT WEG sein
- [ ] Fix: Playwright muss sofort "Später" klicken ODER Cookie setzen der PopUp unterdrückt
**Typ:** Playwright-Fix (Cookie oder sofortiger Dismiss)

### FB13 — Scrollen zu schnell + "3 Issues" Button
- [ ] Scroll-Geschwindigkeit VIEL ZU SCHNELL → langsamer, natürlicher
- [ ] "Seite 1 von 4" muss am Ende sichtbar sein
- [ ] Roter Button "3 Issues" (Next.js Dev-Mode Error Overlay) → MUSS WEG
- [ ] Fix: Dev-Server hat Error-Overlay → entweder Production-Build oder Overlay unterdrücken
**Typ:** Scroll-Speed anpassen + Production-Build ODER Error-Overlay hide

### FB14 — KPI-Highlights fehlen komplett
- [ ] KEIN EINZIGER KPI-Klick funktioniert (B7-B10)
- [ ] Wenn man auf "NEU" klickt → muss gefiltert werden + Farbe markiert
- [ ] Wenn man auf "BEI UNS" klickt → gefiltert + Farbe
- [ ] usw. für "ERLEDIGT" und "BEWERTUNG"
- [ ] Vergleiche mit Script-Referenzbildern B7-B10
- [ ] CSS-Selektoren matchen nicht → Text-basierte Selektoren fixen
**Typ:** Playwright-Selektoren fixen (KPI-Cards klicken)

### FB15 — Fehlendes Hinscrollen zum Rohrbruch-Fall
- [ ] Im Script: ">B12< (scrolling zum reingekommenen Fall und dann per Klick highlighten)"
- [ ] Aktuell: Spring direkt zum Fall per URL statt smooth hinzuscrollen
- [ ] Muss: In der Übersicht zum Rohrbruch-Fall scrollen → Case-Row highlighten → dann klicken
**Typ:** Playwright-Sequenz-Fix (erst scrollen, dann klicken, nicht per URL navigieren)

### FB16 — Falldetail katastrophal
- [ ] Sieht nicht aus wie in den Referenzbildern B13-B16
- [ ] DA-0001 → macht keinen Sinn für den Viewer (zu niedrige Nummer)
- [ ] Muss aussehen wie im Script: Übersicht mit Status, Priorität, Zuständig, Termin, Beschreibung, Kontakt
- [ ] Aktuell: Minimaldarstellung, Felder fehlen
**Typ:** Playwright muss die ECHTE Case-Detail-Seite aufnehmen (die sieht korrekt aus)

### FB17 — Daten stimmen nicht mit Pipeline-Definition
- [ ] Rohrbruch-Fall ist "Dringend" → im Seed korrekt ABER: es fehlt ein NOTFALL (rot markiert)
- [ ] Im Script/Plan: "1× Notfall (in_arbeit)" als erster Fall → Rohrbruch kommt an 2. Stelle
- [ ] Zeitstempel: "Heute 07:40" — aber Anruf war 19:45 → ABSOLUTES NO-GO
- [ ] Zeitstempel muss konsistent sein: Anruf-Ende → SMS → Fall-Erstellung = alles gleiche Zeit
- [ ] Seed muss created_at auf die VIDEO-UHRZEIT setzen, nicht auf seed_time
**Typ:** Seed-Fix (Zeitstempel konsistent) + Notfall-Case einfügen

### FB18 — Unterer Teil Falldetail + Scrollen fehlt
- [ ] Im Script: B14 (gescrollt), B15 (weiter gescrollt), B16 (zurück oben)
- [ ] Verlauf, Interne Notizen, Anhänge müssen sichtbar sein
- [ ] Smooth Scroll runter → Verlauf zeigen → wieder hoch
**Typ:** Playwright-Sequenz erweitern (mehr Scroll-Schritte im Falldetail)

---

## Zusammenfassung: Prioritäten

### KRITISCH (Video bricht ohne diese)
1. FB5 — Call-Screen Buttons (3 Min sichtbar, intensiv betrachtet)
2. FB10 — Einstiegsbild verschoben
3. FB11 — "Admin" statt persönlich
4. FB12 — Push-PopUp entfernen
5. FB13 — "3 Issues" Error-Overlay entfernen
6. FB14 — KPI-Klicks funktionieren nicht
7. FB17 — Zeitstempel-Inkonsistenz

### HOCH (Video wirkt unprofessionell)
8. FB4 — Kontakt-Screen komplett neu
9. FB6 — Anruf-beendet Buttons
10. FB7 — SMS von unten = Powerpoint
11. FB8+FB9 — Fehlender Homescreen + App-Highlight
12. FB15 — Hinscrollen zum Fall fehlt
13. FB16 — Falldetail-Darstellung
14. FB18 — Falldetail-Scrollen fehlt

### MITTEL (Feinschliff)
15. FB2 — Uhr Position/Grösse ✅
16. FB3 — Phone-Icon Tap Highlight ✅
17. FB11b — Bewertungen sichtbar machen

---

## RUNDE 2 — Feedback nach v2 Video (20.04. Abend)

### FB18 — Samsung Anrufliste (Kontakt-Suche statt Anrufliste)
- [ ] FB18: Aktueller Screen zeigt Anrufliste — sieht schon gut aus
- [ ] FB18.1: ORIGINAL zeigt die Samsung KONTAKTSUCHE mit Tastatur unten
- [ ] Soll aussehen als hätte man "Dörfler AG Test" eingetippt → Suchfeld oben, Ergebnis darunter, echte Samsung-Tastatur unten
- [ ] KEIN Datum nötig auf diesem Screen (kein "20. Apr.")
- [ ] Samsung-Tastatur muss EXAKT aussehen wie FB18.1 (QWERTZ, "Deutsch", Leertaste, Icons)
**Typ:** Komplett neuer Kontakt-Suche Screen mit Tastatur

### FB19 — Call-Screen Icons unauthentisch
- [ ] "Bluetooth" Icon = nur ein Punkt → muss echtes Bluetooth-Symbol sein
- [ ] Andere Icons (Anruf hinzu, Video, Lautsprecher, Stumm, Tastatur) sehen nicht authentisch aus
- [ ] Referenz FB19: Die Icons sind dezente WEISSE Linien-Icons in halbtransparenten Kreisen
- [ ] + Symbol für "Anruf hinzu" = okay
- [ ] ▶ für Video = FALSCH → muss Kamera-Symbol sein
- [ ] ◉ für Bluetooth = FALSCH → muss Bluetooth-B Symbol sein
- [ ] ◀)) für Lautsprecher = muss Lautsprecher-Symbol sein
- [ ] ⊘ für Stumm = muss durchgestrichenes Mikrofon sein
- [ ] ⊞ für Tastatur = muss Nummernblock-Grid sein
- [ ] End-Call Button: ✕ = muss aufgehängter Hörer sein (↙ Symbol)
**Typ:** SVG-Icons statt Unicode-Symbole. Samsung-authentisch.

### FB20 — "Anruf beendet" Screen
- [ ] FB20.1: Mein aktueller Screen — sieht grauenhaft aus
- [ ] FB20.2: ORIGINAL Samsung — "Anruf beendet" in blau oben, Firmenname GROSS, Telefonnummer, 3 grosse runde farbige Buttons (grün Anruf, blau SMS, grün Video), unten Samsung Nav-Bar (|||, O, <)
- [ ] Aktuell: Buttons sind klein, unreal, kein Samsung-Nav-Bar
- [ ] Muss: Grosser Firmenname zentriert, Telefonnummer darunter, 3 GROSSE farbige Buttons (wie FB20.2), echte Samsung-Navigation unten
**Typ:** Komplett neu nach FB20.2 Referenz

### FB21 — Homescreen nach Anruf: Uhrzeit stimmt nicht
- [ ] Rote Pfeile auf FB21 zeigen: Status-Bar links oben Uhrzeit ≠ Uhr-Widget Uhrzeit
- [ ] Status-Bar zeigt andere Zeit als die grosse Uhr
- [ ] MÜSSEN IDENTISCH sein: beide 19:41 (oder was auch immer die Video-Uhrzeit ist)
**Typ:** CSS-Fix — beide Uhren aus gleicher Variable

### FB22 — SMS Zeitstempel Chaos
- [ ] SMS zeigt 19:42 (korrekt)
- [ ] Homescreen danach zeigt 19:42 im Widget (korrekt)
- [ ] ABER: Status-Bar links oben zeigt 16:26 → ABSOLUTES CHAOS
- [ ] Alle Uhren auf ALLEN Screens müssen KONSISTENT sein
- [ ] Plan: Eine EINZIGE Uhrzeit-Variable die ÜBERALL verwendet wird
- [ ] Status-Bar Uhr = Widget Uhr = SMS Zeitstempel = Anruf-Timer-Start
**Typ:** Globaler Uhrzeit-Fix in take2_samsung.html

### FB23 — App-Highlight WEGLASSEN
- [ ] Mein roter pulsierender Ring war an der FALSCHEN Stelle
- [ ] Und: wirkt zu künstlich
- [ ] ENTSCHEIDUNG: Highlight komplett weglassen
**Typ:** Code entfernen aus Sequenz

### FB24 — App-Öffnung sieht nicht real aus
- [ ] Aktuelle Transition: Fade → lange weisse Sequenz → dann Leitsystem
- [ ] Muss: Wie eine ECHTE App-Öffnung aussehen
- [ ] Samsung App-Open: Zoom-Animation vom Icon zum Vollbild (300ms)
- [ ] Oder: Kurzer schwarzer Screen (wie App-Loading) → dann Content
- [ ] Möglichkeiten: CSS zoom-Animation ODER echten App-Open per Playwright aufnehmen
- [ ] Die weisse Ladezeit ist die echte App die im Browser lädt → MUSS ausgeblendet/verkürzt werden
**Typ:** Transition-Verbesserung + Ladezeit kaschieren

### FB25 — Leitsystem Datensatz KOMPLETT falsch (Wiederholung)
- [ ] NOCH IMMER: Kein Notfall-Case (rot markiert)
- [ ] NOCH IMMER: Keine Bewertungen (grüne Buttons/Umrandungen)
- [ ] NOCH IMMER: "3 Issues" Button sichtbar
- [ ] NOCH IMMER: "Admin" statt Firmenname
- [ ] NOCH IMMER: Push-PopUp sichtbar
- [ ] Bewertungen brauchen GRÜNE Buttons und grüne Umrandungen bei erledigten+bewerteten Cases
- [ ] Notfall-Case muss ROT markiert sein (wie im Script-Referenzbild)
- [ ] Diese Punkte MÜSSEN in der Pipeline selbst gefixt werden (nicht nur im Screenflow-Script)
**Typ:** Pipeline-Fixes: Seed (Notfall, Bewertungen), App (PopUp, display_name), Dev-Server (Error Overlay)

### FB26 — Rohrbruch-Fall Absprung
- [ ] Bei Sec 1:51 im Video: Der Rohrbruch-Fall öffnet sich → WEISSER SCREEN
- [ ] Muss: Sauber laden ohne weissen Flash
- [ ] Der Rohrbruch-Fall ist die BASIS für die App-Präsentation für ALLE Betriebe
- [ ] Muss ABSOLUT sitzen
**Typ:** Playwright waitForLoadState + Ladezeit kaschieren

### FB27 — Anruf-Button Highlight auf Homescreen entfernen
- [x] Tap-Highlight auf Phone-Icon war falsch positioniert + kaum sichtbar
- [x] Founder: "Bitte entfernen wenn du keine bessere Idee hast"
- [x] ENTFERNT — kein Highlight mehr, einfach Übergang Homescreen → Phone App
**Status:** ✅ DONE

---

## RUNDE 3 — Die 5 offenen Punkte aus Runde 2 (21.04.2026)

Alle Fixes unter dem Kontrakt: jedes Take-2-Modul liest NUR aus `tenant_config.json` → brancheagnostisch + skalierbar für Elektriker/Friseur/Garage.

### FB18.1 — Samsung Kontaktsuche mit QWERTZ-Tastatur ✅ DONE
- [x] Anrufliste komplett durch Kontaktsuche ersetzt
- [x] Suchfeld oben zeigt eingetippten Firmennamen (dynamisch aus `CONFIG.firma`), Cursor blinkt echt
- [x] "Häufig gesucht — 1 gefunden ∧" mit Avatar + Name (Samsung-Grün) + Telefonnummer
- [x] "Letzte — 1 gefunden ∧" mit Outgoing-Call-Icon + Name + Datum (Kurzform "20. Apr.")
- [x] Emoji-Bar (6 Icons) über Tastatur
- [x] Echte QWERTZ-Tastatur: 5 Reihen (10 Zahlen / q-ü / a-ä / Shift+y-m+⌫ / !#1-,-Deutsch-.-🔍)
- [x] Samsung Bottom-Nav: 🎤 + 3-Strich + Square + Chevron
- [x] Status-Bar Icons authentisch (Mute, WiFi, 2×Signal, Battery Pill)
**File:** `scripts/_ops/screen_templates/sequences/take2_samsung.html`

### FB21/FB22 — Eine globale Uhrzeit-Variable ✅ DONE
- [x] Alle `.clock-display` Elemente werden gesetzt aus EINER Variable (`CONFIG.uhrzeit`)
- [x] Status-Bar links + Widget + SMS-Zeitstempel + Call-Ende-Zeit = alles konsistent
- [x] Status-Bar Overlay auf 40px Höhe + `backdrop-filter: blur(22px) saturate(1.3)` + dunkler Gradient → eingebrannte "16:26" aus `homescreen_real.jpg` wird KOMPLETT unlesbar
- [x] Text-Shadow auf overlay clock für Lesbarkeit
- [x] `shortDate()` Helper: "Sonntag, 20. April" → "20. Apr." für Kontakt-Datum

### FB24 — Authentische Samsung App-Open Transition ✅ DONE
- [x] CSS-Circle expandiert von Leitsystem-Icon-Position (28% top, center) zu Fullscreen in Brand-Color (480ms cubic-bezier)
- [x] Gleichzeitig Icon-Tap-Ring als Feedback (260ms)
- [x] Brand-Color aus `tenant.brand_color` via CSS-Variable `--brand-color`
- [x] `window.openApp()` als Playwright-Trigger + auto-run für Standalone
- [x] Leitsystem-Recording startet mit `addInitScript` → `document.body.style.background = brand_color` VOR jeder Navigation → null weisser Flash
- [x] Samsung-Video endet in Brand-Color-Frame, Leitsystem-Video beginnt in Brand-Color-Frame → seamless Splice

### FB25 (Teil) — Datensatz-Qualität Pipeline-weit ✅ DONE
Komplett neues generisches Seed-Script: `scripts/_ops/seed_screenflow_from_config.mjs`
- [x] Liest NUR `tenant_config.json` (brancheagnostisch — Sanitär/Elektriker/Friseur/Garage = gleicher Code)
- [x] Kategorien aus `config.voice_agent.categories` oder `config.wizard.categories` (nicht hardcoded)
- [x] 1× Notfall (`urgency=notfall`, in_arbeit) → ROT markiert in Leitsystem via `c.urgency === "notfall"` (LeitzentraleView.tsx:639)
- [x] 1× Featured Phone-Case aus `seed.phone_demo_case` (urgency=dringend, created 3 min ago)
- [x] 1× Wizard-Case aus `seed.wizard_demo_case` (urgency=normal, created 1h ago)
- [x] 5× "Bei uns" cases (in_arbeit/scheduled/warten)
- [x] 21× Done cases — 17 mit `review_sent_at`, 10 mit `review_rating` (8×5★, 2×4★) + `review_received_at`
- [x] 20× Ältere 2025-Cases für Pagination
- [x] Staff-Upsert für Prospect-Email + `admin@flowsight.ch` mit `display_name = tenantShortName` → Greeting zeigt "Guten Abend, Dörfler" (kein Client-Side-Hack mehr)
- [x] `tenants.modules.google_review_avg` + `google_review_count` aus `seed.google_rating/count` → FlowBar zeigt Sterne + "10 erhalten / 17 angefragt"
- [x] `is_demo=false` auf allen Cases (RLS: Prospect-User sieht sie)
- [x] Zeitstempel konsistent mit Video-Uhrzeit (Phone-Case 3min, Notfall 2h, Wizard 1h)
- [x] KPI-Output: NEU=2 | BEI_UNS=6 (inkl. 1 Notfall) | ERLEDIGT=20 | Reviews=10 erhalten/17 angefragt

### FB25 (Teil) — Bewertungen grün markiert im Leitsystem ✅ DONE (via Seed)
- [x] Cases mit `review_rating >= 4` werden automatisch gold/grün markiert in Case-Row-Borders (bestehende LeitzentraleView-Logik, jetzt endlich Daten da)
- [x] FlowBar BEWERTUNG-KPI zeigt goldene Sterne (4.7★) statt "Noch keine" (via `tenants.modules.google_review_avg`)
- [x] Sub-Label "10 erhalten / 17 angefragt" aktiv

---

## Scalability-Kontrakt (Task 6 — für Take 3/4 + Branchen-Skalierung)

Alle Take-2-Module lesen NUR aus `tenant_config.json`:

| Modul | Liest aus | Kein Hardcode |
|-------|-----------|---------------|
| `take2_samsung.html` | URL-Params (aus `tenant_config.json` via `produce_screenflow.mjs`) | firma, telefon, sms_sender, case_ref, uhrzeit, datum, initial, **brand_color** (NEU) |
| `record_leitsystem_take2.mjs` | `tenant_config.json` direkt | tenant.name, prospect.email, brand_color für body init |
| `seed_screenflow_from_config.mjs` | `tenant_config.json` direkt | categories (voice_agent OR wizard), service_area_plz, phone_demo_case, wizard_demo_case, google_rating, staff_names |
| `produce_screenflow.mjs` | `tenant_config.json` direkt | orchestriert alles über tenant/va/seed/vid objects |

**Branchen-Wechsel (z.B. Sanitär → Elektriker):**
1. Neue `tenant_config.json` durch `pipeline_run.mjs --url X --slug Y` generieren
2. Founder reviewt `founder_review.md`
3. `seed_screenflow_from_config.mjs --slug Y` + `produce_screenflow.mjs --slug Y --take 2`
4. **Kein Code-Patch nötig.**

## Produktion v5 (21.04.2026)

- Samsung: `docs/customers/doerfler-ag/screens/take2_samsung.webm` (1.8 MB, ~36s)
- Leitsystem: `docs/customers/doerfler-ag/screens/take2_leitsystem.webm` (2.6 MB, ~91s)
- **Komplett: `docs/customers/doerfler-ag/screens/take2_complete.mp4` (2.1 MB, 2:06)**

---

## RUNDE 4 — FB28-FB34 + letzte 20% (21.04.2026 Nachmittag)

### FB28+FB28.1 — Status-Bar Icons pipeline-weit konsistent ✅ DONE
- [x] Call-Screen (dark): 5 SVG-Icons in Weiss (Mute-X, WiFi, 2× Signal, Battery-Pill "86") + pinker Phone-Icon links für aktiven Anruf
- [x] Call-Ended (light): gleiche 5 SVG-Icons in Schwarz
- [x] SMS (light): gleiche 5 SVG-Icons in Schwarz
- [x] Alle mit "⚡86" Battery-Pill, keine unterschiedlichen "5G"/"95%" Text-Versionen mehr

### FB29 — Call-Screen Feinschliff ✅ DONE
- [x] `.call-contact top: 160px → 200px` (Name tiefer positioniert, mehr Luft)
- [x] `.name font-size: 32px → 38px` (deutlich grösser)
- [x] `.name font-weight: 300 → 400` (solider)
- [x] Bluetooth-Icon ersetzt: Diamant `◊` → echtes Bluetooth-B-Symbol (zwei gekreuzte Striche als stilisiertes B)

### FB30 — Fiktive Telefonnummer pipeline-weit ✅ DONE
- [x] `tenant_config.json` neues Feld `video.display_phone` — Dörfler: `+41 44 505 74 20` (fiktiv, nicht vergeben)
- [x] `produce_screenflow.mjs` URL-Param `telefon` liest jetzt aus `video.display_phone` (fallback `telefon_display` → `va.phone`)
- [x] `seed_screenflow_from_config.mjs` setzt `contact_phone` aus `video.display_phone` für Phone-Case
- [x] `derive_config.mjs` hat neue Function `deriveDisplayPhone(slug)` — deterministischer Hash aus Slug → `+41 44 5XX XX XX` Format (Zürcher 5XX-Block, nicht offiziell vergeben)
- [x] `regenerate_review.mjs` zeigt jetzt "Telefon (ECHT, live)" + "Telefon (FIKTIV, für Video)" als zwei separate Prüfzeilen — Founder kann fiktive Nummer bestätigen

### FB31 — 1s Homescreen-Pause vor SMS ✅ DONE
- [x] `produce_screenflow.mjs` vor `showSmsNotification()` explizit `window.showScreen("homescreen")` + `waitForTimeout(1000)` eingefügt
- [x] Sequence: Call-Ended (3s) → Homescreen leer (1s) → SMS-Notification fliegt rein → SMS-Thread

### FB32 — Seamless App-Open Transition ✅ DONE
**Samsung-Seite (2 Phasen Animation):**
- [x] Phase 1 `.tapping` (500ms): Explizites Tap-Feedback am Leitsystem-Icon — Ring pulsiert sichtbar (opacity 0→0.85→0), Wallpaper dimmt kurz ab (brightness 0.92)
- [x] Phase 2 `.opening` (480ms): Brand-Color Circle expandiert von Icon-Position zu Fullscreen
- [x] Wartezeit vor Tap verkürzt: 1800ms → 500ms Homescreen

**Leitsystem-Seite (Reveal-Overlay):**
- [x] `record_leitsystem_take2.mjs` injiziert Fullscreen-Div in Brand-Color via `addInitScript`, z-index 99999, opacity 1
- [x] Nach 1000ms fade-out (400ms transition + scale 0.97) → App-Reveal aus der Mitte heraus
- [x] Samsung-Video endet mit Brand-Color Fullscreen, Leitsystem-Video startet mit Brand-Color Fullscreen → seamless Splice, kein weisser Flash
- [x] Total vom Icon-Tap bis App sichtbar: ~2.3s mit klarer Choreographie (statt vorher ~2.7s mit Lücke)

### FB33 — Phone-Case aus Call-Script + Notfall = Boiler ✅ DONE
**Notfall-Case (Position 1, rot):**
- [x] `tenant_config.json.seed.notfall_case` neu: `{ kategorie: "Boiler", beschreibung: "Boiler komplett defekt — kein Warmwasser. Kunde wartet auf Techniker." }`
- [x] `derive_config.mjs` hat neue Function `deriveNotfallCase(domain)` — Branchen-Map: Sanitär→Boiler, Heizung→Heizung, Elektrik→Stromausfall, Gastronomie→Notfall
- [x] `seed_screenflow_from_config.mjs` liest `seed.notfall_case` → Case #1 = DA-0001 Boiler (in_arbeit, rot) ✅ verifiziert im Video

**Phone-Case (Position 2, aus notruf.txt):**
- [x] `tenant_config.json.seed.phone_demo_case` erweitert: `reporter_name: "Gunnar Wende"`, `strasse: "Seestrasse"`, `hausnummer: "14"`, `source: "voice"`, `urgency: "dringend"` — alles 1:1 aus Call-Script abgeleitet
- [x] Beschreibung jetzt: "Anrufer steht im Keller knöcheltief im Wasser, vermutlich Rohrbruch. **Klingelschild: Wende.**"
- [x] `created_at: minutesAgo(1)` → Leitsystem zeigt "Heute HH:MM" passend zur Video-Zeit ✅ verifiziert (13:07)
- [x] `derive_config.mjs.derivePhoneDemoCase()` erweitert: Default-Werte aus Notruf-Script (gleich für alle Sanitär-Betriebe, da Audio Master-Aufnahme konstant ist)
- [x] `regenerate_review.mjs` hat neuen Abschnitt "3b. Telefon-Fall aus Call-Script" mit Prüftabelle (jedes Feld + Source-Zitat aus Call)

### FB34 — Review-Status-Mix auf Seite 1 sichtbar ✅ DONE
- [x] `seed_screenflow_from_config.mjs` Review-Reihenfolge umgekehrt: neueste 7 Done-Cases (i=0-6) NUR `review_sent_at` (amber-ring), nächste 10 (i=7-16) mit `review_rating` (gold), älteste 4 (i=17-20) ohne Review (plain grün)
- [x] Smart-Sort: neueste Done-Cases oben → Mix aus amber-ring + gold + grün auf Seite 1
- [x] UI-Code (`CaseListClient.tsx` + `statusColors.ts`) bereits korrekt implementiert — keine UI-Änderung nötig

### Letzte 20% — Phone-Case öffnen + scrollen ✅ DONE
- [x] Case-Click-Logik überarbeitet: text-locator mit `force: true` + Fallback auf direkte URL-Navigation via Supabase-Lookup (urgency=dringend, source=voice, status=new, ORDER BY created_at DESC)
- [x] Case-Detail-Scroll-Choreo angepasst auf CaseDetailForm-Struktur: 0px (Übersicht) → 300px (Beschreibung + Kontakt) → 550px (Verlauf) → 0px (zurück)
- [x] Timing ~2.5s pro Schritt passend zur scripting_flow.txt Voiceover-Länge
- [x] B17 Zurück via "Zurück"-Button oder goBack()

**Verifikation (Frames aus take2_complete.mp4 v6):**
- Kontaktsuche (0:05): fiktive `+41 44 505 74 20` sichtbar ✅
- Call-Screen (0:13): "Dörfler AG Test" gross + tief, Bluetooth-B, Icons konsistent ✅
- Leitsystem-Übersicht (0:47): "Guten Tag, Dörfler", KPIs 2/6/41/4.7★ mit "10 erhalten / 17 angefragt / Google:3" ✅
- DA-0001 Boiler In Arbeit mit roter Notfall-Linke ✅ (nicht mehr 2× Rohrbruch)
- DA-0002 Rohrbruch Neu, Gunnar Wende, Oberrieden, Heute 13:07 ✅
- Case-Detail (1:25): "Rohrbruch" Titel, DA-0002, "Anruf · 21.04.2026, 13:07", Status=Neu, Priorität=Dringend, Beschreibung "...Klingelschild: Wende." ✅

---

## Produktion v6 (21.04.2026 Nachmittag)

- Samsung: `docs/customers/doerfler-ag/screens/take2_samsung.webm` (~1.9 MB, ~36s)
- Leitsystem: `docs/customers/doerfler-ag/screens/take2_leitsystem.webm` (~1.6 MB, ~55s)
- **Komplett: `docs/customers/doerfler-ag/screens/take2_complete.mp4` (1.7 MB, 1:30)**

### Pipeline-Änderungen (8 Dateien)

| Datei | Änderung |
|-------|----------|
| `docs/customers/doerfler-ag/tenant_config.json` | `video.display_phone` + erweiterte `seed.phone_demo_case` (reporter_name, strasse, etc.) + neue `seed.notfall_case` |
| `scripts/_ops/screen_templates/sequences/take2_samsung.html` | 3× Status-Bar harmonisiert, Call-Contact grösser+tiefer, Bluetooth-SVG korrekt, 2-Phasen openApp (tapping→opening) |
| `scripts/_ops/produce_screenflow.mjs` | `display_phone` URL-Param, 1s Homescreen vor SMS, 500ms statt 1800ms vor App-Open, 1400ms statt 900ms nach openApp |
| `scripts/_ops/record_leitsystem_take2.mjs` | Reveal-Overlay injection mit fade-out, Phone-Case click via text-locator + Supabase-Fallback, Scroll-Choreo 0/300/550/0 |
| `scripts/_ops/seed_screenflow_from_config.mjs` | Notfall-Case aus config.seed.notfall_case, Phone-Case aus config.seed.phone_demo_case (alle Felder), Review-Reihenfolge umgekehrt |
| `scripts/_ops/derive_config.mjs` | `deriveDisplayPhone(slug)` + `deriveNotfallCase(domain)` neu, `derivePhoneDemoCase` erweitert mit Call-Script-Feldern |
| `scripts/_ops/regenerate_review.mjs` | Neuer Abschnitt "3b. Telefon-Fall aus Call-Script", Telefon-ECHT vs FIKTIV als separate Zeilen |
