# Website Playbook — Sanitär/Heizung Standard

Reference: docs/brand/style_dna.md (binding design policy)

## Standard Information Architecture

### Landing Page (Single-Page MVP)
Sections in order:
1. **Hero** — Headline + Notfall CTA + trust proof pills
2. **Services** — Sanitär, Heizung, Notdienst tiles (expandable later)
3. **Notfall CTA** — Standalone emergency call-to-action block
4. **Process** — 3–4 steps: Anfrage → Bewertung → Einsatz → Erledigt
5. **Reviews** — 2–3 real customer testimonials
6. **Service Area** — PLZ/Region map or list (e.g., "Zürich & Umgebung")
7. **About / Team** — Short company intro, team photo, credentials
8. **Contact / Wizard** — Wizard form entry point + phone fallback

### Optional Subpages (post-MVP)
- /notfall (dedicated emergency page)
- /leistungen (expanded service descriptions)
- /ueber-uns (full team/company page)
- /kontakt (standalone contact/wizard page)

## Mandatory Sections
Every deployed site MUST include all 8 landing sections above. Missing any = QA gate fail.

## Wizard CTA Placement Rules
- **Hero:** Always include primary CTA linking to Wizard.
- **After Services section:** Repeat CTA ("Jetzt Anfrage stellen").
- **After Reviews:** Repeat CTA.
- **Contact section:** Wizard is the section itself.
- Rule: visitor should never scroll more than 1.5 viewports without seeing a CTA.

## Sanitär/Heizung Copy Prompts
Use these domain-specific terms in copy and wizard options:

### Sanitär
- Rohrbruch / Leitungsbruch
- Verstopfung (Abfluss, WC, Leitung)
- Wasserschaden / Wasser läuft
- Armatur / Wasserhahn defekt
- WC / Spülung defekt
- Boiler / Warmwasser Ausfall

### Heizung
- Heizung Ausfall / kein Warmwasser
- Heizkörper kalt / ungleichmässig
- Thermostat defekt
- Heizung macht Geräusche
- Brenner Störung

### Notfall-Sprache
- "24h Notdienst" — prominent in hero + Notfall CTA
- "Sofort-Hilfe bei Wasserschaden"
- "Rohrbruch? Rufen Sie uns an."

## High-End Heuristics
Tied to style_dna.md decision rule — when building or reviewing:
- Does each section have breathing room (generous spacing)?
- Is the hierarchy clear (one H1, clear H2s, scannable)?
- Are images real (no stock)?
- Is copy specific to Sanitär/Heizung (no generic "wir bieten Dienstleistungen")?
- Is the CTA visible without scrolling on mobile?
- Would a premium Swiss customer trust this page within 3 seconds?
