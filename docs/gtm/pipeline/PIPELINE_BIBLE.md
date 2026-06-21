# PIPELINE_BIBLE — Die Gold-Contact-Video-Pipeline

> **Abschnitt der Customer Journey: die Simulation (Stern 3)** (Sales → **Pipeline** → Onboarding). Die Pipeline produziert das Asset (Beweis-Seite) und
> läuft **auf Sales-Kommando** (für Weg-1-Ja-Sager), nicht spekulativ kalt. Orchestrator: [`../CUSTOMER_JOURNEY_BIBLE.md`](../CUSTOMER_JOURNEY_BIBLE.md) ·
> vorgelagert: [`../sales/SALES_BIBLE.md`](../sales/SALES_BIBLE.md) · nachgelagert: [`../onboarding/ONBOARDING_BIBLE.md`](../onboarding/ONBOARDING_BIBLE.md).

> **Schlüsseldokument.** Beschreibt, wie die Pipeline **JETZT funktioniert** (Stand 03.06.2026):
> wie man sie steuert, antriggert, worauf zu achten ist — und wie man sie auf eine **neue
> Branche** (Elektriker, Garage, …) repliziert. Autoritativ + tief. Vollständige Entstehungs-
> Historie (§1–§69, alle FB-Punkte + Session-Logs) liegt 1:1 in
> [`docs/archive/PIPELINE_BIBLE_historie_bis_20260603.md`](../../archive/PIPELINE_BIBLE_historie_bis_20260603.md).

> **Liefer-Weg + Ein-Kommando (Stand 18.06.2026 — Runbook: [`NEUER_BETRIEB_VIDEO_RUNBOOK.md`](NEUER_BETRIEB_VIDEO_RUNBOOK.md)):**
> Für einen NEUEN Betrieb ist der **kanonische** Weg `build_take2/3/4_final` → `collect_delivery` →
> Staging nach `07_stresstest/abgenommen/<slug>/` (T1 canonical + T2/T3/T4) → `build_proof_page` →
> **Hochkant** (`make_t2_portrait` + `proof_add_variants` — **PFLICHT**, sonst zeigt das Handy die kleine
> Querformat-T2 = Mobile-Drift). **`produce_videos.mjs`** zieht das in EINEM Kommando durch.
> **NICHT `run_pipeline_multi`** (älter, falsches Ablage-Format → speist `collect_delivery`/`build_proof_page` nicht).
> `send_outreach --live` schaltet das Beweis-Seiten-Tracking automatisch scharf (S8). Siehe Zielarchitektur **D104**.

---

## 0. Zweck & Nutzung

Die Pipeline erzeugt pro Sanitär-/Heizungsbetrieb **4 hoch-personalisierte Demo-Videos** („Takes"),
die zeigen, wie der Betrieb mit FlowSight aussähe (Voice-Agent Lisa, Leitsystem, Wizard, Bewertungs-
Workflow). Aus EINER Config (`tenant_config.json`) entsteht ein vollständiger, gate-geprüfter
Video-Satz — ohne pro-Betrieb-Handarbeit. Ziel: **~10 Betriebe/Tag** durch die Maschine, als
Basis für E-Mail-Outreach.

**Status 03.06.2026:** funktional + steuerbar. 7 Betriebe vollständig produziert + founder-abgenommen
(Weinberger, Obrist, Wälti, Walter, Schaub, Marti, Stark). Quality-Gates live + scharf
(fail-on-broken / pass-on-good). Pipeline-Vollständigkeit ~95 %; der bekannte 5 %-Rest ist in
§9 dokumentiert.

**So nutzt man dieses Dokument:**
- **Betrieb produzieren** → §5 (End-to-End-Build, exakte Befehle) + §8 (Build-Disziplin).
- **Verstehen, warum etwas so ist** → §4 (Video-Architektur) + §7 (Gates).
- **Neue Branche aufsetzen** → §11 (Replikation: was universell, was tenant-spezifisch).

---

## 1. Vision & 3-Phasen-Modell

Pro Prospect läuft ein **Gold-Contact**: maximal personalisierte Berührung statt Massen-Mail.
Drei Phasen:

```
PHASE 1 — EXTRACT + DECIDE        PHASE 2 — VIDEO (diese Bible)     PHASE 3 — OUTREACH
Website crawlen (Playwright)      4 Takes pro Betrieb produzieren    E-Mail mit den Takes
+ Zefix + Google Places           (Screenflow + Audio + Maus)        (Öffnung, Tracking)
→ crawl_extract.json              gate-geprüft → 07_stresstest/      → Versand
derive_config → tenant_config     → Founder-Abnahme → abgenommen/
+ founder_review.md
── STOP: Founder-Review ──         ── STOP: Founder-Abnahme ──        ── STOP: Founder-Freigabe ──
```

Diese Bible deckt **Phase 2** (Video) ab; Phase 1 (Crawl/Derive) liefert die `tenant_config.json` (§3).
**Phase 3 (Verpackung & Versand) ist jetzt gebaut → §12** (Beweis-Seite `/p/[token]`, Canonical T1,
automatisierter Outreach-Versand). **Was NACH dem Versand kommt** — Engagement → das Gespräch →
das Onboarding-Cockpit — liegt in der **Onboarding-Bible** (`docs/gtm/onboarding/ONBOARDING_BIBLE.md`);
die Naht zwischen den Maschinen ist der Moment, in dem ein Mensch antwortet/anruft (Pipeline =
automatisiert/ohne Founder; Onboarding = hochtouch/Founder im Loop).

> **Phase-1-Crawl-Härtung (11.06., #608):** `crawl_extract.mjs` ist jetzt TLS-tolerant (`ignoreHTTPSErrors` — Cert-Mismatch-Sites crawlten sonst KOMPLETT leer, z.B. Leins), scannt die „Über uns/Team"-Seite auf Personen-Mails und überspringt SPA-Shells (nimmt die inhaltsreichste Kandidatenseite). **Bekannte Grenze:** reine JS-SPAs rendern Sub-Seiten als Shell → Personen-Mails nur im Raw-HTML. **Geplant: Vision-Discovery** (Screenshot + Vision statt nur `innerText`) für Entscheider-Kontakte **und** ein Gefühl für die Unternehmensgrösse → ticketlist **P12** (Beleg `docs/gtm/onboarding/Feedback/FB9.png`). **Entscheider-Regel:** eine Person, GL des Kern-Bereichs, nie `info@`/CC (`lessons_learned.md` S6).

---

## 2. `tenant_config.json` — Das Herz

**Prinzip:** Ein einziges JSON pro Betrieb steuert ALLES downstream. Kein Script liest CLI-Args
für Betriebsdaten, keines hat hardcoded Firmennamen. Liegt unter `docs/customers/<slug>/tenant_config.json`.

### Die für die Video-Takes relevanten Felder

| Feld | Nutzung | Herkunft / Regel |
|------|---------|------------------|
| `tenant.name` | Firmenname überall | Website-`<title>` + Zefix-verifiziert |
| `tenant.brand_color` | Leitsystem + Wizard + Review-Farbe | Crawl (CSS) → **`sanitizeBrandColor`** (s.u.) |
| `tenant.case_id_prefix` | Fall-IDs (z.B. „SH-0050") | Initialen erste 2 Wörter, keine Umlaute/Zahlen |
| `tenant.sms_sender_name` | SMS-Absender | „Firma Rechtsform" ≤11 Zeichen, sonst Kurzname |
| `voice_agent.company_name` | Lisa-Greeting-Text | = tenant.name (Rechtsform wird beim Sprechen gestrippt) |
| `wizard.categories[]` | Wizard-Kacheln (T3) | aus Leistungen abgeleitet; muss „Leck" enthalten (Demo-Narrativ) |
| `video.call_proof_variante` | **C = notruf / B = preis** | `deriveCallProofVariante` (s.u.) — steuert T2-Variante |
| `seed.*` | Demo-Cases, KPIs, PLZ | Seed-Generierung (§6) |
| `video.video_hook` | optional E-Mail/Subtitle | Auto-Vorschlag |

> **Voice-only-Felder** (`opening_hours`, `owner_names`, `emergency_policy`, `price_*`, `service_area`-Text …)
> erscheinen in KEINEM Take + KEINER E-Mail. Sie sind erst vor der Telefon-Schaltung relevant
> und müssen für die Video-Produktion NICHT geprüft werden. → Der ~30-Sek-Founder-Review
> konzentriert sich auf das einzige schwer-extrahierbare sim-relevante Feld: **`brand_color`**.

### Zwei kritische Ableitungs-Regeln (in `derive_config.mjs`)

**`deriveCallProofVariante(notdienst)` → C oder B.** C (notruf) NUR bei starkem 24/7-Beweis:
Patterns u.a. `24h`, **`24/7`** (Slash-Variante — Obrist-Fix 03.06.), `rund um die uhr`, `7 tage`,
`pikett`, `auch an Sonn-/Feiertagen`, `jederzeit`, `Tag und Nacht`. Bloßes „Notfall" reicht NICHT
(könnte „Bei Notfall Feuerwehr rufen" sein). Default = B (preis). **notruf ≈ 60 %, preis ≈ 40 %.**

> **OFFEN — Gewerk ↔ Demo-Szenario (19.06.):** Die T2-Notruf-Variante simuliert einen **Rohrbruch (Keller unter Wasser) = Sanitär-Notfall.** **Reine Heizungs-/Gebäudetechnik-Betriebe ohne Sanitär** (z. B. MS Gebäudetechnik, Regiotherm) dürfen diese Demo NICHT bekommen → Gewerk-Mismatch („die haben uns nicht verstanden"). Erkennen über `voice_agent.domain`/services ohne „sanit". Bis eine **Heizungs-Notfall-T2-Variante** existiert („Heizung ausgefallen / kein Warmwasser"), solche Betriebe zurückstellen. Welle 1: MS + Regiotherm deshalb geparkt.

**`sanitizeBrandColor(hex)` → nur sanitär-taugliches Blau/Türkis** (Founder 03.06.). Rote/gelbe/
schwarze/grüne/blasse Farben wirken im Video falsch (Rot = Fehler/Alarm — Schaub-Bug `#e73744`).
Regel: nur hue 175–260 mit genug Sättigung+Helligkeit behalten; sonst Fallback **`#2b6cb0`**
(natürliches Sanitär-Blau). Der Crawler verwechselt oft Accent/CTA mit der Marken-Farbe → dieser
Filter ist die Absicherung. **Wichtig:** Das Leitsystem rendert die Farbe aus der DB-Spalte
`tenants.modules.primary_color` — der Seed synct `tenant.brand_color → primary_color` (§6); ohne
das bleibt eine alte Onboard-Farbe stehen.

### Runtime-Felder (vom Seed/Build geschrieben, NICHT manuell)

`_seed_time`, `_wizard_time`, `_wizard_case_id`, `_wizard_case_label`, `_appointment_*`,
`_review_*`, `_demo_now` — demo_time-SSoT-Werte, regenerieren bei jedem Run (nicht committen nötig).

---

## 3. Die 4 Takes — was sie zeigen + was personalisiert ist

| Take | Inhalt | Dauer (SOLL) | Datei (final) |
|------|--------|--------------|---------------|
| **T1 Intro** | Hero/Website-Bezug + Einstieg | ~63,2 s | `T1_intro.mp4` |
| **T2 Anruf** | Telefon (Samsung) + Lisa-Anruf + SMS-Thread + Leitsystem | ~377 s (preis) / ~380 s (notruf) | `T2_anruf_<variante>.mp4` |
| **T3 Wizard** | Online-Meldeformular (Tippen) → Fall im Leitsystem | ~149 s | `T3_wizard.mp4` |
| **T4 Bewertung** | Leitsystem: Caseopen → Status → Termin → Erledigt → Bewertung anfragen → Mobile-Review (5 Sterne) | ~176,8 s | `T4_bewertung.mp4` |

**Personalisiert (automatisch, pro Betrieb):** Firmenname (überall), Brand-Farbe (Leitsystem/Wizard/
Review), Lisa-Greeting (TTS mit Firmenname), Variante C/B (T2-Call-Kern), Wizard-Kategorien,
Fall-Daten/KPIs (Seed), Fall-ID-Prefix, SMS-Absender, Datum/Uhrzeit (tagesfrisch via demo_time).

**Universell (EINMAL erstellt, für ALLE Betriebe):** Founder-Audio-Spuren (locked), Lisa-Dialog
(locked), Loom-Gesicht (locked Overlay), Maus-Bewegung (Dörfler-Aufnahme als Layer), die Schablonen
(T3/T4 Timing-Referenz), die canonical-Stern-Region (T4).

> **🏆 T1 = canonical (Auslieferung):** Das face-only Founder-Intro auf der Beweis-Seite ist
> betriebsübergreifend **bit-identisch** (md5-bewiesen: `take1.wav` + `take1_face.mp4` gleich über
> alle Tenants) → **EINE** Bunny-GUID + **EIN** Poster für ALLE (`CANONICAL_T1_GUID`, §12). Wird
> **nicht pro Betrieb erzeugt/hochgeladen**; der per-Betrieb-`T1_intro` (Screenflow-Intro mit Text)
> wird für die Beweis-Seite **nicht mehr verwendet**. → **Re-Runs müssen nur T2/T3/T4 frisch erzeugen.**

---

## 4. Video-Architektur — 3 Schichten, millisekundengenau

Jeder Take = drei übereinandergelegte Schichten. Die universellen Schichten haben FIXE Zeitstempel
→ die per-Betrieb-Schicht (Screenflow) MUSS exakt darauf landen.

```
Schicht 3: Maus + Loom   ── UNIVERSELL (Dörfler-Maus-JSON + locked Loom-Gesicht), fixe Zeiten
Schicht 2: Screenflow     ── PRO BETRIEB (Playwright-Recording: Samsung-Phone + Leitsystem-App)
Schicht 1: Audio          ── UNIVERSELL locked Master + PER-BETRIEB Greeting-Swap (nur T2)
```

**Wichtigste Konsequenz:** Weil Audio + Maus universell + fix sind, muss das per-Betrieb-Recording
(Schicht 2) auf die Zehntelsekunde dieselben Zustände zur selben Master-Zeit zeigen. Aufnahme-
Jitter (Playwright `recordVideo`-Start-Latenz, ±0,5–2 s) ist der Hauptfeind.

### Die Anker-Architektur (`holdUntilMaster`) — gegen Aufnahme-Jitter

In den Recording-Scripts (`record_take4.mjs`, `record_leitsystem_take*`) werden Interaktionen NICHT
an blinde `waitForTimeout` gehängt, sondern an **Master-Zeiten** geankert:

```
master(jetzt) = rt() − dashboardVisibleRt + 0.3       // rt() = recording_t seit Part-Start
holdUntilMaster(M) wartet, bis rt() = dashboardVisibleRt + (M − 0.3)   // wartet NUR vorwärts
```

Beispiel T4 Part 1: `holdUntilMaster(8.0)` (Freeze Liste) → `holdUntilMaster(11.0)` (Case-Detail
Reveal = `CASE_REVEAL_T`) → 13.55 (Bearbeiten) → 16.99 (Status) → 19.2 (Termin) → 24.01 (Übernehmen).
Dadurch trifft die universelle Maus bei jedem Betrieb dieselben Elemente. (Grenze: Part 5 ist noch
NICHT geankert → §9.)

### Deterministische Overlays statt Aufnahme-Lotterie

Wo Aufnahme-Jitter nicht vollständig ankerbar ist, wird die kritische Region durch ein **farb-
neutrales Overlay aus der Gold-Referenz** ersetzt:

- **T4 Stern-Fill** (`apply_canonical_stars.mjs`): die Stern-Innenregion (`crop 350×340 @775,362`)
  der Gold-Referenz **Jul. Weinberger** (Fill-Onset @ master 74,13 s) wird im Fenster **[72, 76,3]**
  über jeden Betriebs-Master gelegt → Stern-Timing millisekunde-gleich, Maus trifft immer, kein
  Doppelstern. Header/Name/Brand-Farbe bleiben per-Tenant (ausserhalb der Region). Referenz-Clip:
  `_locked/take4/canonical_stars_ref.mp4` (regenerierbar aus Weinberger-T4, gitignored).
- **T2 SMS-Thread** (`build_take2_final` STEP 2c-4): der Thread-Frame wird per Helligkeits-Detektion
  aus der samsung.webm extrahiert (letzte anhaltende Weiß-Region) und für die Thread-Phase gehalten.

---

## 5. End-to-End-Build — Schritt für Schritt

**Voraussetzungen:** Dev-Server läuft (`http://localhost:3000`), `tenant_config.json` existiert,
`--env-file=src/web/.env.local` (Supabase + OpenAI für QG-STT). **Strikt sequenziell** (§8).

### Pro Betrieb (Reihenfolge)

```bash
# 0) Daten in die DB (heute-relativ) + primary_color-Sync
APP_URL=http://localhost:3000 node --env-file=src/web/.env.local \
  scripts/_ops/seed_screenflow_from_config.mjs --slug <slug>

# 1) Wizard-Demo-Fall (für T3/T4) + Daten-Gate G_T3_KPI_NEU (=2 offene Fälle)
APP_URL=http://localhost:3000 node --env-file=src/web/.env.local \
  scripts/_ops/insert_take3_wizard_case.mjs --slug <slug>

# 2) (Optional bei neuem Betrieb) Greeting-TTS frisch erzeugen (gegen stale/zu-lang)
#    rm _generated/lisa_tts/tenants/<slug>/agent_01.wav ; generate_lisa_tts --tenant <slug>

# 3) Takes (jeweils mit QG)
node scripts/_ops/compose_take1_hero.mjs --slug <slug>                                  # T1
APP_URL=... node --env-file=... scripts/_ops/build_take2_final.mjs --slug <slug>         # T2 (Variante auto)
node scripts/_ops/build_take3_final.mjs --slug <slug>                                    # T3
node scripts/_ops/build_take4_final.mjs --slug <slug> --with-mouse                       # T4 (IMMER --with-mouse)

# 4) QG je Take + platzieren (siehe §7/§8)
node scripts/_ops/qg_video.mjs --slug <slug> --take <2|4> --video <pfad>
```

### Was jeder Build-Schritt tut + die SOLL-Anker

**T1 (`compose_take1_hero`)** — Hero-Intro-Compose (kein Recording). ~63,2 s. Schnell (~11 s).

**T2 (`build_take2_final`)** — liest `call_proof_variante` (C→notruf/B→preis), dann:
- STEP 0.5: Phone-Extended generieren falls fehlt (`record_phone_call_visual`, notruf 165 s/preis 162 s).
- **STEP 0.6: Greeting-Swap (IMMER, `swap_tenant_greeting`)** — nimmt den locked Master
  `_locked/audio/take2_<variant>.wav` (mit der korrekten **8,55 s Verbindungs-Pause @33,04 s**) und
  ersetzt NUR das Greeting im fixen **Slot [44,0 s, +7,0 s]** durch den per-Tenant-Greeting (auf 7,0 s
  gepaddet). „Always-regenerate" verhindert, dass stale/kaputtes Audio durchgereicht wird. Greeting
  muss ≤7,0 s sein.
- STEP 1: `pipeline_screenflow --take 2` (Samsung + Leitsystem-Recording, heute-relativ).
- STEP 2/2b: Anchor + per-Tenant-Audio.
- **STEP 2c-4: SMS-Thread-Frame** deterministisch detektieren (letzte Weiß-Region Y>200) + halten.
- STEP 3: V26-Dashboard-Composite (Mask r46, Bezel, Animation).
- **SOLL T2:** Pause 8,55 s @33,04 · Verbindungs-Ton @41,7–42,6 s hörbar · Greeting-Slot [44,7.0] ·
  SMS-Thread weiß sichtbar @3:33–3:44 · Tail-Stille nur letzte ≤2,5 s.

**T3 (`build_take3_final`)** — Schablone `_locked/schablonen/take3_schablone.mp4` (Leins, 149,46 s).
`pipeline_screenflow --take 3` nimmt Wizard + Leitsystem auf (es ruft `record_wizard_take3` +
`record_leitsystem_take3` SELBST — daher KEIN separates Pre-Recording, das wäre Doppel-Aufnahme).
Dann: phase-library-Override aus Event-Log → `build_from_phase_schedule` → locked Audio
`_locked/audio/take3.m4a` (1 ms-genau) → Loom → Maus-Layer → `qg_take3_vs_schablone` (5 Anchors;
A4/A5 sind tolerante Schablonen-Vergleiche, die auch abgenommene Betriebe „failen" — kein Blocker)
→ **`qg_t3_modal_timing` (G_T3_MODAL_NOT_EARLY)**.
- **Modal-vor-Cursor-Fix (FB 09.06.):** Die „+ Neuer Fall"-Modal darf NICHT öffnen, bevor die
  universelle Maus den Button erreicht hat. Wurzel: `record_leitsystem_take3` klickte den Button
  OHNE Dashboard-Dwell (`list_visible`→Klick ≈0s) → keine Footage zum Halten → Modal „blutete"
  durch (öffnete @~2:03, Cursor erst @~2:07). **Fix:** 6,7 s Dwell zwischen `back_to_list` und
  `list_visible` (Dashboard sichtbar, während der Cursor reist) → Modal öffnet @~2:08,5 beim
  Cursor-Eintreffen. Gate `G_T3_MODAL_NOT_EARLY` (s. §7) sichert das nachhaltig.

**T4 (`build_take4_final --with-mouse`)** — `record_take4` (6 Parts) → Compose → locked Audio
`_locked/audio/take4.m4a` → Loom → **Maus-Layer (universelles Dörfler `take4.json`)** → Toast
„Bewertung erhalten" → Dev-Badge-Cover → **`apply_canonical_stars`** → `qg_t4_compare`.
- **SOLL T4:** Caseopen @11,0 s (`CASE_REVEAL_T`) · Stern-Fill 1 Gold-Region @~74,1 s im Fenster
  [72, 76,3] · Dauer ~176,8 s.
- ⚠️ **`--with-mouse` ist Pflicht für Delivery.** Ohne (Default zum schnellen Iterieren) werden
  Maus + Toast + Badge-Cover + canonical-stars ALLE übersprungen → G_T4_STARSYNC failt.

---

## 6. Seed & Daten

**`seed_screenflow_from_config.mjs`** (branchen-agnostisch, liest nur die Config):
- Löscht alle Cases des Tenants, erzeugt: 1× Phone-Case (status `new`), 1× Notfall (in_arbeit, rot,
  T-1), Andreas-Gerber-Fall (in_arbeit, deterministisch 07:12), 5× „bei uns", 21× erledigt
  (Review-Verteilung), 2025-Altfälle (Pagination). KPIs: NEU/BEI_UNS/ERLEDIGT.
- Synct `tenants.modules`: `google_review_avg/count` + **`primary_color` aus `tenant.brand_color`**
  (config = SSOT; Leitsystem liest von dort via `resolveTenantIdentity`).
- Setzt Greeting-Anrede „Guten Abend, <Kurzname>" (Staff-Upsert).

**`insert_take3_wizard_case.mjs`** — fügt den Wizard-Demo-Fall hinzu (status `new`, Reporter immer
„Gunnar Wende", Bahnhofstrasse 15, demo_time `wizardSubmitTime`). Löscht zuvor **alle** `source=wizard,
status=new` (verhindert stale-Wizard-Altlasten). Enthält das **Daten-Gate G_T3_KPI_NEU**: genau 2
offene Fälle (Phone + Wizard) → exit 2 bei Abweichung (blockt T4-Build).

**Zeit-SSoT (`_lib/demo_time.mjs`):** Zürich-deterministisch relativ zu „heute". Alle Takes nutzen
dieselben Zeiten (Phone 08:08, Wizard 08:56 etc.) → Datum/Uhrzeit konsistent über alle 4 Takes.

---

## 7. Quality Gates — der vollständige Katalog

**Disziplin (nicht verhandelbar):** Kein Video wird platziert/ausgeliefert, solange ein Gate rot ist.
Jeder Gate ist validiert als **fail-on-broken / pass-on-good** (an echten kaputten + Gold-Artefakten).
Jede vom Founder gefundene Fehlerklasse wird zu einem Gate → fängt sich beim nächsten Build selbst.

### `qg_video.mjs --slug <slug> --take <2|4> --video <pfad>`

| Gate | Take | Prüft | Schwelle |
|------|:--:|------|----------|
| `G_START0` | alle | Frame@0:00 nicht schwarz/leer | YAVG 15–250 |
| `G_HOMESCREEN0` | T2 | Phone@0:00 = Homescreen (nicht Suche/Dialing) | Crop-YAVG 90–180 |
| `G_T2_PAUSE` | T2 | Verbindungs-Pause | 8,55 s @33,04 (±0,35/0,3) |
| `G_T2_BEEP` | T2 | Verbindungs-Ton vorhanden (Fehlen=Alarm) | mean_vol @41,7–42,6 > −45 dB |
| `G_T2_TAIL` | T2 | nur letzte ≤2,5 s still | keine frühe Schluss-Stille |
| `G_T2_SMS_OPEN` | T2 | SMS-Thread offen @3:33–3:44 (weiß) | Phone-Interior YAVG > 185 |
| `G_GREETING` | T2 | Firmenname in Lisa-Greeting (STT, Fuzzy ±1 für CH-Namen) | distinktives Wort gefunden |
| `G_T4_STARSYNC` | T4 | Stern+Maus = Weinberger-Referenz (SSIM @74,0/74,2/74,4) | ≥0,94 |
| `G_T4_CASEOPEN` | T4 | Case-Detail @11,0 s (SSIM-Bracket @10/@12 vs Dashboard) | @10>0,90 & @12<0,86 |
| `G_T4_DOUBLESTAR` | T4 | genau 1 Gold-Fill-Region in [73,80] | =1 (≥2 = Doppelstern) |
| `G_T3_KPI_NEU` | (Daten) | 2 offene Fälle (in `insert_take3_wizard_case`) | =2 |
| `G_T3_MODAL_NOT_EARLY` | T3 | „+ Neuer Fall"-Modal öffnet NICHT vor dem Cursor (Dashboard @126 s sichtbar) | Listen-Region YAVG ≥200 (Dashboard ≈225 / Modal-Backdrop ≈178) |

**Referenz-Auflösung** (G_T4_STARSYNC): sucht die Gold-Ref (Weinberger) in `07_stresstest/abgenommen/<slug>/`
→ `07_stresstest/<slug>/` → `master_takes/take4/<slug>_with_mouse.mp4`. So überlebt der Gate, wenn
abgenommene Betriebe verschoben werden.

**SOLL-Anker-Herkunft:** Gemessen an Gold (Walter notruf + Weinberger preis + locked-Master), 03.06.
T2-Pause 8,554 s @33,045 · T4-Caseopen SSIM-Drop 0,98→0,77 @11,0 · T4-Stern-Onset 74,13 s.

---

## 8. Build-Disziplin & Betrieb

| Regel | Warum |
|------|-------|
| **Nur sequenziell** (1 Betrieb / 1 Take zur Zeit) | Parallele Recordings auf demselben Dev-Server → Auth-Jitter/Server-Überlast/Stale-Reuse (§65-Historie). Cross-Tenant-Outputs sind isoliert, aber der Recording-Server ist der Flaschenhals. |
| **T4 IMMER `--with-mouse`** für Delivery | Default skippt Maus+Toast+Badge+canonical-stars → G_T4_STARSYNC failt. |
| **T4 nie zweimal bauen** | Direkt `--with-mouse`; der No-Mouse-Vorlauf ist verschwendete Zeit. Re-Run nur Post-Process: `--with-mouse --skip-record`. |
| **Abgebrochene Builds: `_tmp_take{3,4}/` löschen** | sonst `rmdir ENOTEMPTY` beim Maus-Layer-Render. Pfad: `_generated/mouse_recordings/<slug>/_tmp_take*`. |
| **Nach jedem Platzieren: `ffprobe`-Dauer-Check** | Kopie kann den Master mid-write erwischen → truncated (Stark-T4 1,8 MB statt 14,9 MB, „kann nicht öffnen"). Dauer>0 + Größe plausibel prüfen. |
| **Verify visuell am echten Frame** (`-ss` NACH `-i`, accurate-seek) | Metriken können trügen; Gold-Vergleich am Frame ist Wahrheit. |
| Greeting-TTS bei neuem Betrieb frisch erzeugen | Stale TTS (alter Name/Länge) sprengt sonst den Slot. |

### Platzierung & Abnahme-Workflow

- Builds landen in `07_stresstest/<slug>/` (T1_intro, T2_anruf_<variante>, T3_wizard, T4_bewertung).
  Alte Versionen → `<slug>/Archiv/pre_<batch>_<datum>/`. **Videos sind gitignored** (Größe).
- Founder reviewt pro Betrieb. **Persönlich abgenommene Betriebe** verschiebt der Founder nach
  `07_stresstest/abgenommen/<slug>/`. Gates + Referenz-Auflösung berücksichtigen beide Orte.

---

## 9. Bekannte Grenzen — der offene 5 %-Rest

**T4-Recording-Timing-Jitter (Determinismus-Kern).** Trotz `holdUntilMaster`-Anker jittert das
T4-Recording pro Build:
- **Caseopen** kann ±1 s um 11,0 driften (Anker basiert auf `nowRt()`-Zeitmessung von
  `dashboardVisibleRt`, nicht auf einem State-Event). → `G_T4_CASEOPEN` fängt den Ausreißer
  (Rebuild nötig = Lotterie).
- **Part 5 (Erledigt + Bewertung anfragen, sec 39–50) ist GAR NICHT geankert** (blinde
  `waitForTimeout`) → Maus/Audio-Desync („Maus hängt hinterher", Marti-Befund). **Echter Fix
  (nächste Wochen):** Part-5-`holdUntilMaster`-Anker (wie Part 1) + caseopen-Anker state-basiert
  (`waitForSelector` statt Zeit). Optionaler Wächter: `G_T4_ERLEDIGT`-Sync-Gate.

**Effizienz-Hebel (offen) — Messdaten + verifizierter Ausführungsplan (04.06.2026 Dörfler-Run):**

Gemessen am Dörfler-Regressions-Lauf 04.06.: Seed 3s · T1 13s · **T2 5:23** · **T3 6:15** · **T4 8:00** ≈ 22 Min/Betrieb (strikt sequenziell). Die Zeit steckt fast vollständig in (a) Echtzeit-Recordings und (b) den T4-Finishing-Re-Encodes.

- **T4 = FÜNF sequenzielle Voll-Re-Encodes** eines 176,8s-Videos: Loom (STEP 6) → Maus (7) → Toast (9) → Badge-Cover (10) → Canonical-Stars (11). Jeder Schritt liest das vorherige mp4 und schreibt ein neues (H.264 1440×900). **Sicherer Teilgewinn:** STEP 9+10+11 (Toast-PNG-Overlay + Badge-drawbox + Stern-Region-Overlay) sind drei reine Filter-Ops auf demselben Base → in **einen** ffmpeg-Filtergraph mergebar (`overlay enable='between(...)'` + `drawbox` + `overlay enable='between(72,76.3)'`) → ~−70–100s, **und qualitativ besser** (weniger Generationsverlust). Loom (6, iris-xfade) + Maus (7, Cursor-Render) bleiben separat (komplex).
- **T2/T3 Echtzeit-Recording:** NICHT trivial beschleunigbar — die `holdUntilMaster`-Anker hängen an echtzeit-synchroner Wiedergabe gegen das locked Audio. Schneller-als-Echtzeit = hohes Sync-Risiko. **Kein sicherer Hebel.** (Phone-Extended wird bereits gecacht: STEP 0.5 skippt bei Vorhandensein.)

> **⚠ Disziplin (Founder 04.06., „100 % keine Nebeneffekte, Qualität high-end"):** Re-Encode-Chaining ändert Pixel zwangsläufig (1× statt 5× Generationsverlust → besser, aber NICHT bit-identisch). Daher **nur hinter einem Flag** (`--fast-finish`, Default AUS → Default-Pfad bleibt unangetastet) und erst zum Default machen nach **Dual-Build-Beweis**: alten + neuen Build auf demselben Betrieb, NEU muss (1) `qg_t4_compare` + `qg_video --take 4` voll bestehen, (2) frame-SSIM ≥0,99 vs. abgenommenem Master an allen Anchors, (3) Founder-Visual-Sign-off. **Zeitpunkt: unmittelbar vor dem Skalieren auf ~10/Tag** — bei Einzel-Versand (heute) ist der Nutzen ≈0, das Risiko an gold-abgenommener Pipeline >0.

---

## 10. Replikation auf eine neue Branche (Elektriker, Garage, …)

Die Pipeline ist branchen-agnostisch gebaut. Was sich pro Branche ändert vs. was bleibt:

**Branchen-/tenant-spezifisch (pro Betrieb/Branche anpassen):**
- `tenant_config.json`: `wizard.categories` (Branchen-Kundenprobleme — muss eine Demo-Kategorie wie
  „Leck"/Äquivalent enthalten), `voice_agent.categories`, `seed.categories_weighted`,
  `seed.phone_demo_case`/`wizard_demo_case` (Branchen-Narrativ), Domain-Text.
- Call-Scripts (notruf/preis) falls die Branchen-Sprache abweicht.
- `derive_config`-Entscheidungsmatrix (Kategorie-Ableitung) ggf. branchen-tunen.

**Universell wiederverwendbar (NICHT pro Branche neu):**
- Die gesamte 3-Schichten-Architektur (§4), alle Build-Scripts (`build_take*_final`,
  `pipeline_screenflow`, `apply_canonical_stars`, `swap_tenant_greeting`).
- Locked Audio-Master, Loom-Gesicht, Maus-Layer, T3/T4-Schablonen, canonical-Stern-Region.
- Alle Quality-Gates (§7) + die Build-Disziplin (§8).
- Seed-Mechanik + demo_time-SSoT.

**Rezept für neue Branche:** (1) Eine Gold-Referenz-Branche/-Betrieb sauber durchproduzieren +
founder-abnehmen (wird die neue Timing-/Stern-Referenz, analog Weinberger/Leins). (2) Branchen-
Call-Scripts + Wizard-Kategorien definieren. (3) Restliche Betriebe der Branche durch dieselbe
Pipeline (§5) jagen, gate-gated. Die Schablonen/Anker bleiben — nur Inhalt + Sprache wechseln.

---

## 11. Ordnerstruktur & Scripts

```
docs/customers/<slug>/                         ← pro Betrieb: config + review
  ├── crawl_extract.json  tenant_config.json  founder_review.md  voice_agent_de.json  status.md  links.md

docs/gtm/pipeline/
  ├── PIPELINE_BIBLE.md                         ← DIESES DOKUMENT
  ├── 06_video_production/
  │   ├── _locked/                              ← UNIVERSELL (eingefroren)
  │   │   ├── audio/take2_notruf.wav take2_preis.wav take3.m4a take4.m4a
  │   │   ├── schablonen/take3_schablone.mp4
  │   │   └── take4/canonical_stars_ref.mp4     ← Weinberger Stern-Region (gitignored, regenerierbar)
  │   ├── master_takes/take{1,3,4}/<slug>[_with_mouse].mp4   ← Build-Outputs (Zwischenstand)
  │   ├── screenflows/<slug>/                   ← per-Betrieb Recordings (take2_samsung.webm, …)
  │   └── _generated/                           ← previews, takes, lisa_tts, mouse_recordings, calls
  └── 07_stresstest/
      ├── <slug>/T1_intro.mp4 T2_anruf_<v>.mp4 T3_wizard.mp4 T4_bewertung.mp4   ← platziert (gitignored)
      └── abgenommen/<slug>/                     ← founder-abgenommen

scripts/_ops/
  ├── seed_screenflow_from_config.mjs  insert_take3_wizard_case.mjs            ← Daten
  ├── compose_take1_hero.mjs  build_take2_final.mjs  build_take3_final.mjs  build_take4_final.mjs
  ├── pipeline_screenflow.mjs  record_take4.mjs  record_phone_call_visual.mjs  ← Recording
  ├── swap_tenant_greeting.mjs  apply_canonical_stars.mjs  apply_toast_overlay.mjs  apply_devbadge_cover.mjs
  ├── audio/generate_lisa_tts.mjs  generate_take2_schedule.mjs  build_from_phase_schedule.mjs
  ├── qg_video.mjs  qg_t4_compare.mjs  qg_take3_vs_schablone.mjs  derive_config.mjs
  ├── build_proof_page.mjs  proof_add_variants.mjs  make_t2_portrait.mjs  upload_canonical_t1.mjs   ← Phase 3: Beweis-Seite
  └── send_outreach.mjs  expire_proof_pages.mjs  proof_watch_report.mjs  _lib/bunny.mjs (CANONICAL_T1_GUID)   ← Phase 3: Versand/Analytics

src/web/app/p/[token]/                          ← Beweis-Seite (noindex) + api/p/[token]/track (View-Tracking)
src/web/public/proof-posters/_canonical-t1.jpg  ← canonical T1-Poster (alle Betriebe)
Supabase: proof_pages                           ← token-privat, RLS service-only; videos{t1,t2,t2_portrait,t3,t4}, view_count, expires_at(+14d)
docs/customers/<slug>/outreach/email.json gunnar_face_circle.png   ← Phase 3: Mail-Inhalt + Foto
```

---

## 12. Phase 3 — Verpackung & Versand (Beweis-Seite + Outreach)

> **Nähte-Reframe (15.06., 3-Säulen-Modell):** Der Versand ist **Sales untergeordnet** — er passiert auf
> Kommando der Sales-Säule (nach Weg-1-„ja, schicken Sie"), **nicht spekulativ kalt**. Für kaltes Scale baut
> die Pipeline **erst bei Signal**; vorgebaut nur für warme/lokale wenige. Steuerung + ICP: [`../sales/SALES_BIBLE.md`](../sales/SALES_BIBLE.md).

„**Mail = Deckel, Seite = Schatz.**" Die 4 abgenommenen Takes werden NICHT als Anhang verschickt,
sondern auf eine private Seite gelegt; die Mail trägt **EINEN** Link dorthin.

### Beweis-Seite `/p/[token]`
- `build_proof_page.mjs --slug <slug>` → lädt die Takes (aus `07_stresstest/abgenommen/<slug>/`) zu
  **Bunny Stream** (EU/Frankfurt, adaptiver Mobil-Vollbild-Player + Watch-Analytics gratis), erzeugt
  einen privaten Token + `proof_pages`-Row, gibt `flowsight.ch/p/<token>` aus. Gültig 14 Tage.
- Seite `app/p/[token]/` (mobil-first, **noindex**, navy/gold): T1 als Lead, T2/T3/T4 als Schritte.
  **Geräteweiche T2:** Desktop = Querformat, Handy = Hochformat (`take2_portrait.mp4`, via
  `make_t2_portrait.mjs` aus der abgenommenen Landscape-T2 — universelle Layout-Koordinaten).
- `proof_add_variants.mjs --slug <slug> --token <token>` → setzt **T1 = canonical** + lädt das
  Handy-Hochformat. Tabelle `proof_pages` (Supabase, token-privat, RLS service-only):
  `videos{t1,t2,t2_portrait,t3,t4}`, `view_count`/`first`/`last_viewed`, `status`, `expires_at`.
  View-Tracking via `api/p/[token]/track`.
- `expire_proof_pages.mjs` (Cron): 14 Tage OHNE Engagement → Bunny-Videos löschen + `status='expired'`.
  **Canonical T1 wird NIE gelöscht** (geteiltes Asset).

### 🏆 Canonical T1 — EIN Founder-Intro für ALLE Betriebe
T1 (face-only, kein Text) ist betriebsübergreifend **bit-identisch** (md5-bewiesen: `take1.wav` +
`take1_face.mp4` gleich über alle Tenants). Darum: **eine** Bunny-GUID (`CANONICAL_T1_GUID` in
`scripts/_ops/_lib/bunny.mjs`) + **ein** canonical Poster (`public/proof-posters/_canonical-t1.jpg`),
von jeder Beweis-Seite referenziert. `build_proof_page` + `proof_add_variants` **erzeugen/laden T1 nie
pro Betrieb**. **Konsequenz: Re-Runs müssen nur T2/T3/T4 frisch erzeugen.** Neu hochladen nur via
`upload_canonical_t1.mjs` (dann GUID in `_lib/bunny.mjs` ersetzen). Spart Zeit/Token/Speicher + senkt
Komplexität dauerhaft (DRY-Prinzip auf die Pipeline).

### Versand `send_outreach.mjs --slug <slug>`
High-End-HTML-Mail aus **„Gunnar Wende <gunnar.wende@flowsight.ch>"** (Resend, Reply-To Founder →
Antworten in Outlook), **Foto inline (cid)**, `/p/`-Link automatisch aus `proof_pages`, **NULL
Copy-Paste / keine Formatbrüche**. `--preview <pfad>` (Selbst-Render-Check vor dem Senden),
`--file <json>` (Varianten). 🔒 **Default = an den Founder (Test); echter Versand nur mit `--live`**
(Betriebs-Kontakt aus `tenant_config.prospect.email` — bewusst nur auf Founder-Wort, pro Betrieb).
Inhalt: `docs/customers/<slug>/outreach/email.json` (`subject`, `paragraphs[]`, `linkLabel`,
`closing[]`, `signature[]`; `**fett**` erlaubt). Mail = **Hell-Premium-Standard** (Sanitär = Hell-
Modus; Windows-Outlook erzwingt Dark-Invertierung, nicht steuerbar → bewusst auf Hell optimiert,
Empfänger-Realität). **Kein M365-Graph** (Resend bleibt Mail-Provider; Graph nur Kalender).

### Kalt-Outreach: Struktur fix, Haken variabel (B-Vorlage, 99 % der Kunden)
Fixe **4-Beat-Struktur** (Haken → unsichtbarer Preis → Beweis → No-oriented-Schluss); der **Haken**
wird per Profil-Signal gewählt: Archetyp **A** Erreichbarkeit („wer nimmt ab, wenn Sie … sind?",
klein/inhabergeführt) · **B** Notdienst („7/24-Versprechen vs. Realität") · **C** Bewertungs-Lücke
(schwaches Rating) + Slot-Variablen **Geo** (Nachbar/Region) & **Gewerk-Bild**. Prinzipien:
*Bedrohung senken vor Spannung* (defensive Zielgruppe), *Spezifik schlägt Hochglanz*,
*Hypothese → messen* (A/B via Watch-Funnel). Detail/CTA-Forschung: `CTA.md`, `outreach_templates.md`.

### OFFEN (Montags-Paket 08.06. — noch NICHT verankert, ohne Qualitätsverlust einzubauen)
1. **Outreach-Copy-Schritt:** Signale aus `tenant_config` (Größe/Erreichbarkeit, Notdienst C/B,
   Rating+Anzahl, Geo, Gewerk) → Archetyp wählen → Slots füllen → `email.json` schreiben
   (deterministisch, founder-gated, A/B-gelernt).
2. **Inhaber-E-Mail-Anreicherung:** Impressum/Zefix/LinkedIn statt `info@`.

---

## Anhang — Historie

Die vollständige Entstehungs-Geschichte (§1–§69: alle FB-Punkte, datierte Session-Logs, abgelöste
Ansätze wie V102→V103, Round-3/4-Learnings, Crash-Recoverys) ist 1:1 erhalten in
[`docs/archive/PIPELINE_BIBLE_historie_bis_20260603.md`](../../archive/PIPELINE_BIBLE_historie_bis_20260603.md).
Bei Bedarf an historischer Detailtiefe (warum eine Entscheidung getroffen wurde) dort nachschlagen.
