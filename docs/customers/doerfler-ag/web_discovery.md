# Web Discovery Report: Dörfler AG

**Date:** 2026-02-18
**Owner:** Web Agent
**Phase:** Discovery only — no code changes

## Executive Summary
- The Dörfler AG customer folder exists but contains almost no usable content (inputs.md and links.md are empty headers).
- status.md mentions "Links zur alten Website" and "Notrufnummer: vorhanden" but neither URL nor number is present in-repo.
- No external website content has been analyzed — external access NOT confirmed.
- We have zero brand assets (logo, colors, photos, copy) in the repo.
- The website playbook (docs/architecture/website_playbook.md) and style DNA (docs/brand/style_dna.md) provide a complete structural and design framework — we can build the full IA skeleton once inputs arrive.
- A concrete input request checklist has been created (INPUTS_REQUIRED.md) to unblock delivery.
- **Blocker:** Cannot begin any visual or copy work until minimum inputs are provided.

## Access & Inputs Audit

| Artifact | Location | Accessible? | Notes |
|---|---|---|---|
| Customer status file | docs/customers/doerfler-ag/status.md | YES | Skeleton only, all items "pending" |
| Inputs file | docs/customers/doerfler-ag/inputs.md | YES | Empty — header only, no content |
| Links file | docs/customers/doerfler-ag/links.md | YES | Empty — header only, no URLs |
| Old website URL | Referenced in status.md ("Links zur alten Website") | NO | URL not present in repo; external access NOT confirmed |
| Notrufnummer | Referenced in status.md | NO | Value not in repo (correct per secrets policy); format/availability unconfirmed |
| Logo / brand assets | Not found | NO | No files under doerfler-ag/ or docs/brand/ |
| Team photos | Not found | NO | No image assets in repo |
| Service descriptions | Not found | NO | No copy or content drafts |
| Customer reviews | Not found | NO | No testimonials provided |
| Service area (PLZ/Region) | Not found | NO | No geographic data |
| Company description | Not found | NO | No about/team text |
| Email routing config | Not found | NO | No recipient address or routing rules |
| Website playbook | docs/architecture/website_playbook.md | YES | Complete IA standard for Sanitär/Heizung |
| Style DNA | docs/brand/style_dna.md | YES | Complete design policy |
| QA gates | docs/qa/high_end_gates.md | YES | 5 gate checklists ready |
| Case contract | docs/architecture/contracts/case_contract.md | YES | Field spec for wizard output |

## Proposed Information Architecture

Based on docs/architecture/website_playbook.md — single-page MVP:

```
Landing Page (/)
├── 1. Hero
│   ├── H1: Company promise (Sanitär/Heizung + region)
│   ├── Proof pills: "24h Notdienst" · "Lokaler Betrieb" · "XX Jahre Erfahrung"
│   └── CTA: "Jetzt Anfrage stellen" → Wizard
│
├── 2. Services
│   ├── Tile: Sanitär (Rohrbruch, Verstopfung, Armaturen, Boiler)
│   ├── Tile: Heizung (Ausfall, Brenner, Thermostat, Heizkörper)
│   ├── Tile: Notdienst (24h, Wasserschaden, Gasgeruch)
│   └── CTA repeat: "Jetzt Anfrage stellen"
│
├── 3. Notfall CTA
│   └── Standalone block: "Rohrbruch? Sofort-Hilfe." + phone + wizard link
│
├── 4. Process
│   ├── Step 1: Anfrage stellen (Wizard oder Anruf)
│   ├── Step 2: Bewertung durch Fachperson
│   ├── Step 3: Einsatz vor Ort
│   └── Step 4: Problem erledigt
│
├── 5. Reviews
│   ├── 2–3 real testimonials (name/initial + location)
│   └── CTA repeat: "Jetzt Anfrage stellen"
│
├── 6. Service Area
│   └── PLZ/Region list or map (e.g., "Zürich & Umgebung")
│
├── 7. About / Team
│   ├── Short company intro
│   ├── Team photo
│   └── Credentials / years of experience
│
└── 8. Contact / Wizard
    ├── Wizard form (inline)
    └── Phone fallback (Notrufnummer)
```

Post-MVP subpages (later):
- /notfall — dedicated emergency landing
- /leistungen — expanded service detail
- /ueber-uns — full team page

## Recommended Design Direction

### "Classic Premium" (recommended — ONE direction)

**Rationale:** Best fit for Swiss Sanitär/Heizung local business targeting homeowners who need trust + urgency handling.

- **Color palette:** Dark navy or charcoal base + warm accent (amber/copper) + white space. Max 3 colors.
- **Typography:** Strong sans-serif (e.g., Inter, DM Sans). Large H1, generous spacing.
- **Imagery:** Real work photos (team on-site, tools, finished work). Warm tones. No stock.
- **Layout:** Single-page, generous section padding (80–120px). Content max-width 1200px.
- **Tone:** Direct, professional, calm. "Sie haben einen Rohrbruch? Wir sind in 60 Minuten bei Ihnen."
- **CTA style:** Solid button, warm accent color, clear label. Repeated at natural scroll points.
- **Proof elements:** 3 pills max (24h Notdienst, Lokaler Betrieb, XX Jahre Erfahrung). No badge spam.

**Why this over alternatives:**
- Sanitär/Heizung customers are in stress situations (Rohrbruch, Heizung aus) — they need calm authority, not flashy design.
- Premium Swiss positioning requires restraint — fewer elements, more whitespace, real imagery.
- Aligns directly with style_dna.md decision rule: "prefer clarity + premium restraint."

No alternative directions proposed — confidence is high that Classic Premium is the correct fit given the playbook, style DNA, and Sanitär/Heizung context.

## QA Plan (Evidence Mapping)

How each gate from docs/qa/high_end_gates.md will be satisfied during delivery:

### IA Gate
| Item | Planned Evidence |
|---|---|
| 8 mandatory sections | `src/web/app/page.tsx` — each section as a component or section block |
| Correct order | Same file, top-to-bottom matches playbook order |
| CTA placements (4x) | Hero, post-Services, post-Reviews, Contact — filepath + line numbers |
| No orphan pages | Single-page MVP — nav links are anchor scrolls |
| Mobile CTA < 1.5 viewports | Screenshot of mobile viewport from Vercel preview |

### Visual Gate
| Item | Planned Evidence |
|---|---|
| Typography hierarchy | `src/web/app/globals.css` or Tailwind config — font sizes, weights |
| Section spacing >= 64px | Tailwind classes on section wrappers (py-16 or higher) |
| Max-width 1200px | Container class in layout or page |
| Max 3 accent colors | Tailwind config / CSS custom properties |
| No clutter | Visual review of Vercel preview screenshot |
| Real images | Filepath to images in public/ — confirmed real (provided by customer) |
| Consistent components | Component files for tiles/cards — same structure |

### Copy Gate
| Item | Planned Evidence |
|---|---|
| Sanitär/Heizung-specific headlines | H1/H2 text in page.tsx — domain terms used |
| No fluff words | Grep of src/web for banned words — zero results |
| Urgency vocabulary | "Notfall"/"Dringend"/"Normal" in wizard + CTA copy |
| Domain terms | Copy blocks referencing Rohrbruch, Warmwasser, etc. |
| "Sie" form | All customer-facing text uses formal address |

### UX Gate
| Item | Planned Evidence |
|---|---|
| Wizard < 2 min | Wizard step count + field count — manual test timing |
| Success state | Confirmation component filepath |
| Error states | Validation + network error handling filepath |
| Phone fallback | Visible in Contact section + Notfall CTA — screenshot |
| Mobile-first | Responsive classes + mobile screenshot from preview |

### Ops Gate
| Item | Planned Evidence |
|---|---|
| Sentry integrated | Existing sentry.*.config.ts files |
| P0 fail paths | try/catch in API routes with Sentry.captureException |
| Sentry tags | Tag assignment in API route code |
| Email-only | No SMS/WhatsApp imports or config — grep verified |
| Case contract match | Wizard submit payload shape matches case_contract.md |
| No secrets | `grep -r "SUPABASE_SERVICE_ROLE\|API_KEY" src/web` — zero results |
| Build passes | `npm run build` exit code 0 |

**Note:** All evidence is planned for delivery phase. Currently blocked on customer inputs.
