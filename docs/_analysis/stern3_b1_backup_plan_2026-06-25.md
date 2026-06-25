# Stern 3 — B1 Backup-Plan (Vorschlag, keine Ausführung)

Datum: 2026-06-25
Autor: Laptop-CC (Auftrag von Handy-CC). Gegenstück zum Audit `stern3_mobile_audit_2026-06-25.md` (PR #730).
Status: VORSCHLAG. Read-only an der Pipeline. Dieses Dokument ist der einzige Output; es wurde nichts gesichert, verschoben oder committet. Der Founder wählt das Speicher-Ziel.

Motiv (aus dem Audit): Wenn dieser Laptop heute ausfällt, sind ~6 Wochen nicht-reproduzierbare Arbeit weg. Dieser Plan macht das Backup so, dass es klein anfängt (null Risiko), das Unersetzliche zuerst sichert und am Ende verifiziert ist.

---

## 1. Gestaffeltes Inventar nach Wiederherstellbarkeit

Die Staffelung folgt NICHT der Größe, sondern dem Schmerz bei Verlust. Wichtigste Erkenntnis: **Ein Teil von Tier 0 ist klein genug, um direkt in git zu gehen** — dann braucht es dafür gar keinen Object-Store.

### Tier 0 — nur durch Neu-Aufnahme/Neu-Tuning ersetzbar (unersetzlich)

**0a — klein (→ gehört direkt in git, ~34 MB):**
| Was | Pfad | Größe |
|---|---|---|
| Locked-Audio-Master | `_locked/audio/take2_notruf.aac`, `take2_preis.aac`, `take3.m4a`, `take4.m4a`, `take4_PRE-PAUSE-098-057.m4a` | ~27 MB (5 Dateien) |
| take4-Phase-Maps | `_locked/take4_phase_map.json`, `take4_phase_map_v3.json` | klein |
| take4-Kalibrier-Anker | `phase_library_defs/_calibration_anchors/take4_sanitaer.json` | klein |
| Alle per-Betrieb Overrides | `phase_library_defs/_overrides/<slug>/take2_sanitaer.json` + `take4_sanitaer.json` (~21 Betriebe) | klein |
| Master-Spec | `specs/take4_master_spec.json` | klein |
| Locked Event-Logs / Maus-Timing | `_locked/take4_R24_lockedmaster_20260601/{take4_event_log,mouse_R21-timed}.json` u.a. (52 JSON gesamt) | klein |
| Animations-Quellframes | `_locked/animation/homescreen.png`, `_locked/animation/zoom_anim_{notruf,preis}/frame_0*.png` (14) | klein |
| Kompositions-Masken | `master_takes/take{2,3}/_mask_circle_*.png`, `screenflows/_shared/_mask_circle_*.png` | klein |
| Render-Font | `_assets/fonts/arialbd.ttf` | 0.9 MB |

**0b — groß (→ Object-Store nötig, ~3–5 GB Kern):**
| Was | Pfad | Größe |
|---|---|---|
| Loom-Footage (Founder-Gesicht) | `screenflows/_shared/loom_*.mp4` (inkl. `loom_t2_preis_final.mp4` 403 MB), `screenflows/<slug>/loom_avatar.mp4`, `_locked/loom/*.mp4`, `video_example/Video_default.mp4` | ~1.4 GB |
| Screenflow-`.webm`-Quellaufnahmen | `screenflows/<slug>/take{2,3,4}_*.webm` (234 Stück) | ~1.2 GB (Teil von 2.6 GB) |
| Locked Masters / Schablonen | `_locked/take4_R24_lockedmaster_*`, `_locked/schablonen/*.mp4`, `_locked/take4/canonical_stars_ref.mp4`, `_locked/take4_drift_state_*` | 286 MB |

**0c — regenerierbar, aber teuer/langsam neu zu bauen (→ optional in den Store):**
| Was | Pfad | Größe |
|---|---|---|
| 4 Liefersegmente × 17 Betriebe | `master_takes/_delivery/<slug>/0{1..4}_*.mp4` | 632 MB |
| 4 Master-Takes × Betriebe | `master_takes/take{1..4}/<slug>.mp4` | ~4.2 GB |
| Referenz-Goldmaster | `master_takes/_REFERENCE_doerfler-ag_approved_2026-04-30/` | ~50 MB |

### Tier 1 — Secrets (nur Pfad/Status, KEINE Werte)
| Was | Pfad | Status |
|---|---|---|
| Lokale Env-Datei | `src/web/.env.local` | gitignored. Werte für CI seit 23.06. in GitHub Secrets gespiegelt (`env_to_gh_secrets.ps1`). |
| Bunny-Zugangsdaten/IDs | `Bunny.txt` (Repo-Root) | untracked + gitignored. Vermutlich `BUNNY_STREAM_*` + Library-/GUID-Notizen. Single point of failure für die CDN-Verbindung. |

### Tier 2 — klein & sofort git-fähig, aber WEGWERF (→ ignorieren, nicht sichern)
| Was | Pfad | Größe | Aktion |
|---|---|---|---|
| QG-Frame-Vergleichs-Scratch | `master_takes/take4/_frame_analysis/**` (202 PNG) | ~75 MB | `.gitignore` — reproduzierbarer Debug-Output |
| Historische Founder-Feedback-Screenshots | `master_takes/feedback/FB*.png` (83 PNG) | ~klein | optional: archivieren oder ignorieren (kein Pipeline-Input) |

Hinweis zur Begriffsklärung: Die rohe `git ls-files --others --exclude-standard`-Menge unter `06_video_production/` = 349 Dateien / 90 MB, ist irreführend — 202 davon sind Tier-2-Wegwerf. Die echte „stille Lücke" (Tier 0a) ist ~34 MB und gehört in git, nicht in einen Store.

---

## 2. Speicher-Optionen (Founder wählt mit einem Tap)

**Für Tier 0a (klein, unersetzlich): kein Store nötig — direkt in git.** GitHub ist durabel, off-Laptop, versioniert und für CI (B3) nativ ziehbar. Kostenlos. Das ist die beste Heimat für die 34 MB Rezepte/Audio/Masken.

**Für Tier 0b/0c (große Medien): ein Object-Store.** Kriterien: durabel, off-Laptop, später per CI ziehbar (für B3-Cloud-Render), günstig. Kosten sind bei allen Optionen für 3–8 GB praktisch vernachlässigbar — der echte Unterschied ist *Egress für CI* und *wie viele neue Konten*.

| Option | Storage-Kosten | Egress (CI-Pull) | Neues Konto? | Hinweis |
|---|---|---|---|---|
| **Bunny Storage (Edge)** | ~$0.01/GB/Mo → 8 GB ≈ $0.08/Mo | günstig über Bunny-CDN | NEIN — Bunny zahlst du eh | Ein Konto, eine Rechnung. Einfachster Weg; S3-ähnliche API. |
| **Cloudflare R2** | $0.015/GB/Mo (10 GB frei) → meist $0 | **$0 Egress** | ja | S3-kompatibel. Bestes Profil für häufige CI-Pulls (B3). |
| **Backblaze B2** | $0.006/GB/Mo (günstigste) → 8 GB ≈ $0.05/Mo | frei bis 3× Storage/Tag | ja | S3-kompatibel. Billigste Lagerung. |
| **Git-LFS (GitHub)** | 1 GB frei, dann $5/Mo je 50-GB-Pack | im selben Pack, mit Bandbreiten-Cap | NEIN (GitHub) | Versioniert, git-nativ. Teurer; Bandbreiten-Cap kann CI-Pulls bremsen. |

Abwägung (Entscheidung bleibt beim Founder, ein Tap):
- Maximale Einfachheit, keine neuen Konten: **Bunny Storage**.
- Bestes Fundament für späteres CI-Render (B3), weil Egress-frei: **Cloudflare R2** (oder B2).
- Wenn alles git-nativ/versioniert sein soll und Kosten egal: **Git-LFS** (nur Tier 0b, nicht 0a — 0a ist klein genug für normales git).

**Für Tier 1 (Secrets):** GitHub Secrets (CI, teils schon gespiegelt) + ein Passwort-Tresor für die menschenlesbare Kopie. `env_vars.md` referenziert bereits **Bitwarden** als Tresor — `Bunny.txt`-Inhalte dort als Eintrag ablegen, dann ist die lokale Datei nur noch Bequemlichkeit.

---

## 3. Methode + Verifikation

**Hochladen (Tier 0b/0c):** `rclone` — spricht Bunny, R2, B2 und jeden S3-Store. Ein `rclone sync <lokaler-pfad> <remote>:<bucket>/stern3/` pro Asset-Gruppe. (Konkreter Remote-Name + Pfade kommen erst nach der Founder-Wahl; hier kein Befehl ausgeführt.)

**Checksummen-Manifest (das Herz der Verifikation):** Ein kleines Skript (Vorschlag, noch nicht gebaut) läuft über die Asset-Menge und schreibt
`docs/_analysis/stern3_asset_manifest.sha256` — je Zeile: `sha256␠␠size␠pfad`.
Diese Datei ist Text, winzig, und wird **in git eingecheckt**. Sie leistet zweierlei:
1. **Vollständigkeit:** nach dem Upload `rclone check`/`sha256sum -c` gegen das Manifest → beweist, dass jede gelistete Datei im Store angekommen und unverändert ist.
2. **Drift-Erkennung:** ein späterer Lauf vergleicht Platte/Store gegen das eingecheckte Manifest → zeigt, was sich seit der letzten Sicherung geändert hat oder fehlt.

**Restore-Test (Pflicht):** Stichprobe aus dem Store in ein temporäres Verzeichnis zurückladen (z. B. `loom_t2_preis_final.mp4` als größte Einzeldatei + 2–3 Rezept-JSONs), `sha256sum` neu berechnen, gegen das Manifest vergleichen. Erst wenn das grün ist, gilt das Backup als real. „Ein Backup, das man nicht verifiziert hat, ist kein Backup."

---

## 4. Reihenfolge (vom risikoärmsten zum aufwändigsten)

1. **Tier-2 entschärfen + Tier-0a sichern (sofort, null Risiko, kostenlos).**
   - `master_takes/take4/_frame_analysis/` (+ optional `feedback/FB*.png`) in `.gitignore` aufnehmen (Wegwerf raus).
   - Die ~34 MB Tier-0a (52 JSON + 5 Audio + Anim-Frames + Masken + Font) committen. Schließt sofort die stille Lücke und macht das Unersetzlich-Kleine durable.
2. **Tier-1 Secrets in den Tresor.** `Bunny.txt`-Werte als Bitwarden-Eintrag; prüfen, dass `BUNNY_STREAM_*` in GitHub Secrets + Vercel vollständig sind. Danach ist `Bunny.txt` ersetzbar.
3. **Tier-0b (+ optional 0c) in den gewählten Store.** `rclone sync` der großen Medien. Founder hat das Ziel gewählt (Abschnitt 2).
4. **Manifest + Restore-Test.** Manifest erzeugen, einchecken, Upload dagegen prüfen, Stichprobe zurückladen + Checksumme vergleichen.

Jeder Schritt ist für sich abgeschlossen und liefert sofort Schutz — Schritt 1 allein rettet schon das kleine Unersetzliche.

---

## 5. Bonus — Baseline-Tag (wartet auf Founder-OK)

Handy-CCs Tag-Push wird aus der Cloud vom Egress-Proxy geblockt (403); mein Laptop hat freies Netz. Auf Founder-Freigabe setze ich den einfrierenden GitHub-Tag:
```
git fetch origin && git tag -a baseline-journey-2026-06-25 origin/main -m "Baseline vor Stern-3-/Mobile-Umbau" && git push origin baseline-journey-2026-06-25
```
Wichtig: Der Tag friert nur den GitHub-*Code*-Stand ein — er ersetzt NICHT das Asset-Backup (Tier 0). Die echte Sicherung bleiben die Schritte 1–4. Ich pushe den Tag erst auf ausdrückliches OK.

---

## Was dieser Plan bewusst NICHT tut
Keine Ausführung: nichts hochgeladen, nichts committet (außer diesem Dokument), keine `.gitignore`/Pipeline geändert, keine Konten angefasst, keine Secret-Werte ausgegeben. Alle Schritte sind Vorschläge zur Founder-Freigabe.
