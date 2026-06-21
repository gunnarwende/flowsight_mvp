# RESUME HERE — Pipeline Recovery State (29.04.2026 ~16:00)

> **Lies dieses Doc ZUERST** beim nächsten Login. Es enthält den exakten Pipeline-Stand,
> was kaputt gemacht wurde, was abgenommen ist, was verifizierst werden muss,
> und was die nächsten Schritte sind.

---

## TL;DR (30 Sekunden)

- **Mausphase (29.04. nachts) hat alles zerstört.** 4-6 Stunden Pipeline-Arbeit verloren.
- **Apr-27-Backup** in `docs/gtm/pipeline/_backup_27_04_evening_pre_skalability_v2/` hat T1-T4 Anchors für **Dörfler + Leins** gerettet (10/10 abgenommen Apr 27 abend).
- **5 Takes APPROVED + master_takes/ Backup gesichert:** Dörfler T1, T1 Leins, T2 Preis Leins, T4 Dörfler, T4 Leins.
- **6 Takes PENDING Founder-Verifikation:** Dörfler T2 Notruf, Dörfler T3, Leins T3 + Stark/Wälti T1+T4 (wurden nicht überschrieben Apr 27 oder später).
- **Loom-during-active-call** ist KNOWN-MISSING in T2-Anchors. Surgical FFmpeg-Overlay viel zu langsam (1h+ pro Anchor). Nächster Approach: HTML-Layer in `take2_samsung.html`.
- **Stark + Wälti T2 + T3 müssen NEU gebaut werden** (Apr 27 Backup hatte sie nicht).

---

## 🟢 APPROVED — bereits in master_takes/ gesichert (NEVER lose again)

| Take | Tenant | Datei | Approved | Status |
|------|--------|-------|----------|--------|
| T1 | Dörfler AG | `master_takes/take1/doerfler-ag.mp4` | ✓ Apr 28 | **Generic für alle Tenants** (Take 1 Architektur §46) |
| T1 | Leins AG | `master_takes/take1/leins-ag.mp4` | ✓ Apr 28 | Same as Dörfler T1 (generisch) |
| T2 Preis | Leins AG | `master_takes/take2/leins-ag_preis.mp4` | ✓ Apr 27 | **Schablone-Master für T2 Preis (medium-name)** — Loom-during-call MISSING (zu fixen) |
| T4 | Dörfler AG | `master_takes/take4/doerfler-ag.mp4` | ✓ Apr 27 | 10/10 |
| T4 | Leins AG | `master_takes/take4/leins-ag.mp4` | ✓ Apr 27 | 10/10 |

---

## 🟡 PENDING FOUNDER-VERIFIKATION — Aktuell in `previews/`

Diese Files sind aus Apr 27 Backup oder regeneriert. Founder muss bestätigen ob das Mapping noch dem entspricht was er als "hervorragend" abgenommen hatte:

```
Dörfler T2 Notruf (Apr 27 Backup, Loom-during-call FEHLT noch):
file:///c:/flowsight_mvp/docs/gtm/pipeline/06_video_production/_generated/previews/doerfler-ag/take2_notruf_anchor.mp4

Dörfler T3 (Apr 27 Source + corrected Phase Library wizard1_intro [6, 6.5]):
file:///c:/flowsight_mvp/docs/gtm/pipeline/06_video_production/_generated/previews/doerfler-ag/take3_anchor.mp4

Leins T2 Preis (Master-copy, Loom-during-call FEHLT):
file:///c:/flowsight_mvp/docs/gtm/pipeline/06_video_production/_generated/previews/leins-ag/take2_preis_anchor.mp4

Leins T3 (Apr 27 Source + apply_loom_take3 §43-Position):
file:///c:/flowsight_mvp/docs/gtm/pipeline/06_video_production/_generated/previews/leins-ag/take3_anchor.mp4
```

**Was Founder beim Verifizieren prüfen muss:**
1. **Audio↔Screenflow-Mapping** — passen Cue-Punkte (z.B. "Sie sehen den neuen Eintrag" mit Visual-Wechsel)?
2. **Loom-during-call** für T2 (bekanntes Manko, separat zu fixen — siehe nächste Schritte)
3. **Sonst alles** — Bild, Animationen, Branding, Datum, Akku, Timer-Continuity

---

## 🔴 NOT YET BUILT — Stark + Wälti

Apr 27 Backup hatte NUR Dörfler + Leins. Stark + Wälti müssen komplett neu gebaut werden:

| Take | Tenant | Status |
|------|--------|--------|
| T1 | Stark, Wälti | preserved Apr 28 ANCHORS — verify only |
| T2 Notruf | Stark | NEW BUILD (kein Apr-27-Backup) |
| T2 Preis | Wälti | NEW BUILD |
| T3 | Stark, Wälti | NEW BUILD (heutige Apr-29 Files sind Mouse-broken) |
| T4 | Stark, Wälti | preserved Apr 28 — verify only |

→ **Approach:** Leins T2 Preis Master als **Schablone**. Pipeline mit Stark/Wälti tenant_config.json triggern → swap die 8 tenant-specific Differenzen.

---

## ❌ WAS WIR KAPUTT GEMACHT HABEN (Lessons Learned)

### Phase 1 — Mausphase (29.04. nachts ~01:00-01:30)

**Was passiert:**
- §51 Maus-Antizipation in `record_wizard_take3.mjs`, `record_leitsystem_take3.mjs`, `record_take4.mjs` integriert (Bezier-Pfade, Hover-Emphasize, clickWithCursor)
- Pipeline für Dörfler T3+T4 mit Maus laufen lassen
- Hat alle Source-Recordings (`take3_complete.mp4`, `take3_with_loom.mp4`, `take4_*.webm`) **überschrieben**
- Auto-Calibration v2 hat dabei das `phase_library_defs/_overrides/doerfler-ag/take3_sanitaer.json` Override **regeneriert** (jetzt mit kaputten Anchor-Detections, nur 4/5 statt 5/5)
- Founder: "Die Maus ist Spielwiese. Audio↔Screen passt überhaupt nicht. Internal Server Error im T4 ab 0:11."

### Phase 2 — Lisa-Greeting-Anchor §52 (29.04. vormittag)

**Was passiert:**
- 3-Bucket Greeting (SHORT/MEDIUM/LONG/ULTRA) implementiert
- Dynamic Ring-Gap eingebaut (Greeting-End fix bei 14.30s Anchor)
- T2 Anchors für alle 4 Tenants neu gebaut
- Founder: "Mapping ist absolut falsch gemappt. Beim Anruf ranspringt sehe ich gerade ein Handy-Screen wo ich noch nicht mal gewählt habe."
- Phase 2 Audio-Änderungen brachen das Mapping zwischen Audio-Anchor und phone_call_active Phase im Schedule

### Recovery-Versuche

1. **`git stash push`** + **`git checkout HEAD --`** für die 3 Recording-Scripts → entfernte Maus-Code aus Working Tree, restaurierte committed-state Scripts
2. **Phase-Library-Override aus `.bak_v1` restored** → Override wieder im Apr-28-Stand
3. **Apr-27-Source-Files restored** (`take3_complete_v2.mp4` → `take3_complete.mp4`, `take3_with_loom_old.mp4` → `take3_with_loom.mp4`)
4. **Apr-27-Backup-Anchors copied** — `_backup_27_04_evening_pre_skalability_v2/previews/doerfler-ag/take{1,2_notruf,2_preis,3,4}_anchor.mp4` + Leins → `_generated/previews/`
5. **5 abgenommene Takes nach `master_takes/`** kopiert (Backup für nie wieder verlieren)

### Loom-Surgical-Overlay-Versuch (29.04. nachmittag — gescheitert)

- Idee: Master `master_takes/take2/leins-ag_preis.mp4` mit FFmpeg overlay+enable filter erweitern um Loom-Face top-right (805,20) während call_active+ended Phase (45.1-209.8s)
- **Problem:** FFmpeg auf 1440×900 H.264 mit overlay+enable Filter ist EXTREM langsam. 1h+ Encoding, Files >300MB.
- **Root-Cause unbekannt:** Vermutlich Kombination aus 22-Thread-Output + Filter-Komplexität + langsame Hardware-Decoder-Pipeline
- **Versucht:** medium preset, ultrafast preset, ultrafast+22 threads, h264_amf hardware encoder (failed -22), split-and-concat (steht bei 300MB nach 15min)
- **Aktuell:** Master direkt zu Previews kopiert (KEIN Loom-Fix yet)

---

## 🔧 NÄCHSTE SCHRITTE — sortiert nach Priorität

### (1) Founder-Verifikation der 4 PENDING Anchors (~15 min)

Founder schaut sich die 4 PENDING-Files an (siehe oben) und sagt:
- Mapping OK / nicht OK (außer Loom)
- Falls OK → mark als approved, kopiere zu `master_takes/`
- Falls nicht OK → spezifisches Feedback

### (2) Loom-during-call Fix (Architektur-Lösung statt FFmpeg-Workaround)

**Option C — HTML-Layer in `take2_samsung.html`** (mein bevorzugter Approach, noch nicht umgesetzt):

- Idee: Loom-Face wird BEIM RECORDING als HTML-Element overlayed (Position 805,20, 260×260, circle-mask via CSS clip-path)
- Vorteile:
  - Kein nachträgliches FFmpeg-Re-Encode nötig
  - Loom ist Teil der Source-Recording → wirkt "echt" (gleiche Animation/Bewegung wie Founder gestern aufgenommen)
  - Skaliert automatisch für alle Tenants ohne weitere Änderungen
  - Loom-Source: `_shared/_loom_fallback.mp4` (Video_default.mp4 = Founder-Face 80s)
- Implementation:
  - `take2_samsung.html` bekommt einen `<video>` Element mit position:fixed top:20px right:[viewport-805] (calc relative to canvas), 260×260, border-radius:50%, autoplay loop, muted
  - Aktiv NUR während `phone_call_active` und `phone_call_ended` Phasen (CSS class trigger)
  - `record_phone_call_visual.mjs` setzt das CSS class beim Recording
- Aufwand: 30-60 min Implementierung + 15 min Test
- Bonus: Loom dann auch in T2 Preis (Wälti) UND T2 Notruf (Stark/Dörfler) gleich gefixt

### (3) Build Stark + Wälti T2 + T3 (~2-4 Std nach Founder-Bestätigung der Schablone)

Nach Loom-Fix:
- Re-Build Leins T2 Preis MIT Loom (mit HTML-Layer-Approach) → neue Schablone-Master
- Build Dörfler T2 Notruf mit gleicher Pipeline
- Build Stark T2 Notruf mit gleicher Pipeline
- Build Wälti T2 Preis mit gleicher Pipeline
- Build Stark T3 + Wälti T3 (Apr 27 Source-Files für Dörfler/Leins als Reference, dann §43 Master-Source-Brand-Overlay für Stark/Wälti)

### (4) QG-Spec gemeinsam definieren (~1-2 Std)

Founder: "Wenn unsere Quality-Gate-Maschine steht, dann jagen wir die anderen beiden Betriebe parallel durch die Pipeline."

Per Take spezifische QGs definieren:
- T2: Loom-during-call PRESENT, Akku-konstant, Timer-continuity, Lisa-greeting-anchor, Notruf 2:47 / Preis 2:45
- T3: wizard1_intro CLEAN bis 0:54, Click-Cue-Sync, Loom-Movement, Audio↔Screen
- T4: Status-Dropdown-Visuals, Bewertung-Anfragen-Click, App-Lifecycle korrekt

### (5) Stark + Wälti T1 + T4 verifizieren (preserved Apr 28)

Schnell-Check, sind sie noch wie abgenommen.

---

## 📁 KRITISCHE DATEIEN — wo was liegt

| Was | Pfad |
|-----|------|
| Approved master files | `docs/gtm/pipeline/06_video_production/master_takes/take{1,2,3,4}/` |
| Apr 27 Backup (502MB) | `docs/gtm/pipeline/_backup_27_04_evening_pre_skalability_v2/` |
| Loom-Source (universal fallback) | `docs/gtm/pipeline/06_video_production/screenflows/_shared/_loom_fallback.mp4` (= `video_example/Video_default.mp4`) |
| Phase Library (master) | `docs/gtm/pipeline/06_video_production/phase_library_defs/take{2,3}_sanitaer.json` |
| Phase Override (per tenant) | `docs/gtm/pipeline/06_video_production/phase_library_defs/_overrides/<slug>/` |
| Schedule (per tenant) | `docs/gtm/pipeline/06_video_production/_generated/transcripts/<slug>/take{1,2,3,4}*.schedule` |
| Generated previews | `docs/gtm/pipeline/06_video_production/_generated/previews/<slug>/` |
| TTS audio | `docs/gtm/pipeline/06_video_production/_generated/lisa_tts/` |
| Build scripts | `scripts/_ops/audio/` + `scripts/_ops/record_*.mjs` + `scripts/_ops/pipeline_screenflow.mjs` |

---

## 🎯 Pipeline-Mission Reminder (Founder-Vision)

> "Wir wollen 10 unterschiedliche Betriebe pro Tag bei höchster Qualität durch die Pipeline jagen.
> Höchstens minimaler Founder-Touch. Quality über alles. Niemals Vertrauensverlust."

**Schablone-Approach (etabliert Founder 29.04.):**
- Leins T2 Preis = Master-Schablone für ALLE T2 Preis (Medium-Name-Tenants)
- Dörfler T2 Notruf wird gebaut indem Pipeline mit Dörfler-Config gegen gleiche Schablone läuft
- Nur 8 tenant-specific Differenzen swappen: Name, Brand-Color, Initial, Lisa-Greeting, Lisa Turn 9, Call-Dauer, Schedule-Shifts, Leitsystem-Daten

---

## 💾 Was wir GEMERKT haben

1. **NIEMALS** TaskStop auf wrapper allein verlassen — `Stop-Process` für ffmpeg subprocesses nötig
2. **NIEMALS** ffmpeg-Re-Encode auf 1440×900 H.264 mit overlay+enable filter starten ohne sehr starken Hardware-Encoder
3. **`master_takes/`** Backup-Konvention: jeder approved Take SOFORT nach Approval kopiert (mark_take_approved.mjs Script TODO)
4. **Phase-Library `wizard1_intro range [6, 6.5]`** ist der CLEAN-Frame-Bereich — bei 6.6+ beginnt Leck-Hover-Vorstufe
5. **Apr-27-Backup ist Gold** — strenge Disziplin beim Erweitern (z.B. nach Stark/Wälti Approval ein neues `_backup_29_04_*` anlegen)
6. **Loom-during-call** muss in JEDEM T2 Anchor sein (Notruf + Preis) — sonst nicht abgenommen
7. **`_shared/_loom_fallback.mp4`** als universal Loom-Source funktioniert und ist Apr 29 deployt
8. **Schablone-Approach** ist Founder-genehmigt: Leins T2 Preis = Master für alle Preis-Tenants

