# Gold-Contact-Pipeline — Ein Befehl, Ein JSON, Alles fliesst

> **Ziel:** 10 Betriebe / Tag, maximal persönlich, high-end, skalierbar.
> **Referenz:** Dörfler AG = Gold-Standard (vollständig provisioniert).
> **SSOT:** `tenant_config.json` = EINZIGER Input für alles downstream.
> **Stand:** Phase 1 DONE (18.04.2026). 3 Betriebe getestet.

## 3 Goldene Regeln

1. **Niemals herleiten.** Nur verwenden was schwarz auf weiss auf der Website steht.
2. **Ein JSON pro Betrieb = Single Source of Truth.** `tenant_config.json` steuert alles.
3. **Founder-Aufwand pro Betrieb: ~2 Min.** Video-Hook + Betriebsfrage bestätigen. Kein Text schreiben.

## 3 Phasen

```
Phase 1: EXTRACT + DECIDE          Phase 2: VIDEO                    Phase 3: OUTREACH
┌────────────────────────┐         ┌────────────────────────┐        ┌────────────────────┐
│ Crawl (Playwright)     │         │ Samsung-Screens (HTML)  │        │ E-Mail-Template    │
│ + Zefix Verifizierung  │         │ Leitsystem-Recording   │        │ + 4 Video-Links    │
│ + Google Places API    │         │ STS Audio-Swap         │        │ + Founder-Freigabe │
│ → crawl_extract.json   │         │ Take 1-4 Assembly      │        │ → Versand          │
│                        │         │ → 4 MP4s               │        │                    │
│ Derive Config          │         │                        │        │ Follow-Up          │
│ → tenant_config.json   │         │ 3 Schichten synchron:  │        │ → Day 3, 7, 14     │
│ → founder_review.md    │         │ Audio + Screen + PiP   │        │                    │
│                        │         │ (feste Zeitfenster!)   │        │                    │
│ ── STOP: Founder ──    │         │                        │        │                    │
│ 2 Min: Hook + Frage    │         │ ── STOP: Founder ──    │        │ ── STOP: Founder ──│
│ bestätigen             │         │ Audio aufnehmen        │        │ E-Mail freigeben   │
│                        │         │ (Rode + Audacity)      │        │                    │
│ Provision              │         │                        │        │                    │
│ → Tenant + Voice Agent │         │                        │        │                    │
│ → Seed + Auth          │         │                        │        │                    │
└────────────────────────┘         └────────────────────────┘        └────────────────────┘
         ✅ DONE                          🔨 IN ARBEIT                      📋 OFFEN
```

## Orchestrator

```bash
# Phase 1: URL → Config → STOP für Founder Review
node --env-file=src/web/.env.local scripts/_ops/pipeline_run.mjs \
  --url https://www.betrieb.ch --slug betrieb-ag

# Nach Founder Review: Provision
node --env-file=src/web/.env.local scripts/_ops/pipeline_run.mjs \
  --slug betrieb-ag --from provision

# Einzelne Schritte
node --env-file=src/web/.env.local scripts/_ops/pipeline_run.mjs \
  --slug betrieb-ag --step crawl|derive|provision|video|outreach
```

## Scripts (Phase 1 — DONE)

| Script | Funktion | Input | Output |
|--------|----------|-------|--------|
| `pipeline_run.mjs` | Orchestrator (alle Schritte) | --url + --slug | Steuert alles |
| `crawl_extract.mjs` | Website crawlen + Zefix + Google | URL | `crawl_extract.json` |
| `derive_config.mjs` | Entscheidungsmatrix | crawl_extract.json | `tenant_config.json` + `founder_review.md` |
| `generate_voice_agent.mjs` | Voice Agent aus Template | tenant_config.json | `voice_agent_de.json` |
| `provision_from_config.mjs` | Supabase Tenant + Seed + Auth | tenant_config.json | DB Records |

## Scripts (Phase 2 — IN ARBEIT)

| Script | Funktion | Status |
|--------|----------|--------|
| `render_samsung_screens.mjs` | Samsung UI Screens | Existiert (braucht Config-Input) |
| `build_take2_screens.mjs` | Leitsystem Screenshots | Existiert (braucht Config-Input) |
| `assemble_take2_video.mjs` | Video Assembly (ffmpeg) | Existiert (nur Take 2) |
| `produce_videos.mjs` | Video-Orchestrator (4 Takes) | OFFEN |
| STS Audio-Pipeline | ElevenLabs Firmenname-Swap | OFFEN |

## Ordnerstruktur

### Pro Betrieb (generiert)
```
docs/customers/{slug}/
├── crawl_extract.json          ← Phase 1: Gecrawlte Website-Daten + Zefix + Google
├── tenant_config.json          ← Phase 1: SSOT für ALLES downstream
├── founder_review.md           ← Phase 1: PFLICHT-Items für Founder
├── voice_agent_de.json         ← Phase 1: Generierter Voice Agent (DE)
├── status.md                   ← Manueller Milestone-Tracker
├── links.md                    ← URLs
├── screens/                    ← Phase 2: Screenshots (Samsung + Leitsystem)
├── video/                      ← Phase 2: 4 Takes (MP4)
└── outreach/                   ← Phase 3: E-Mail-Preview
```

### Pipeline (generisch)
```
docs/gtm/pipeline/
├── README.md                               ← Diese Übersicht
├── 02_crawl_extract/spec.md                ← Crawl-Spezifikation (20 Felder)
├── 03_derive_config/spec.md                ← Entscheidungsmatrix (23 Voice-Platzhalter)
├── 05_provision/
│   └── voice_agent_template_de.json        ← Gold-Standard Template (Dörfler-basiert)
├── 06_video_production/
│   └── master_takes/                       ← Founder Audio + PiP (WAV/MP4)
│       ├── take1/
│       ├── take2/segments/
│       ├── take3/segments/
│       ├── take4/segments/
│       └── pip/
└── _templates/
    ├── crawl_extract_template.json
    └── tenant_config_template.json
```

## Getestete Betriebe

| Betrieb | Zefix | Google | Video-Hook | Betriebsfrage |
|---------|-------|--------|------------|---------------|
| Wälti & Sohn AG | CHE-190.443.228 ✓ | 5.0★ / 11 | "Seit 1952 für Sie da." | "Wie lange gibt es Wälti & Sohn AG schon?" |
| Stark Haustechnik GmbH | CHE-339.375.820 ✓ | 4.8★ / 18 | "zuverlässig und zu fairen Preisen..." | "Macht ihr auch Lüftung/Klima?" |
| Leins AG | CHE-109.893.569 ✓ | 5.0★ / 9 | "5 Sterne bei 9 Google-Bewertungen." | "Macht ihr auch Spenglerei?" |

## Video-Architektur (Phase 2)

**3 Schichten — millisekundengenau synchron:**
- **Schicht 1 (Audio):** Founder-Segmente (Audacity/Rode) + Lisa TTS (ElevenLabs) + STS Firmenname-Swap
- **Schicht 2 (Screen):** Samsung HTML Templates + Playwright Leitsystem-Recording — dynamisch pro Betrieb
- **Schicht 3 (PiP):** Founder via Loom im Kreis — EINMAL aufgenommen, für ALLE Betriebe wiederverwendet

**Timing-Constraint:** Weil PiP für alle Betriebe gleich ist, MÜSSEN alle variablen Audio-Elemente (Frage, Antwort, Hook, Öffnungszeiten) EXAKT gleich lang sein. Feste Zeitfenster pro Element, Silbenzahl normiert.

## Templates

- [crawl_extract_template.json](_templates/crawl_extract_template.json)
- [tenant_config_template.json](_templates/tenant_config_template.json)
- [voice_agent_template_de.json](05_provision/voice_agent_template_de.json)
