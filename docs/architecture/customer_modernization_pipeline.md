# Customer Modernization Pipeline (SSOT)

## Phases

### Phase A — Demo Modernisierung
- Goal: Show the customer a working high-end demo within hours, not weeks.
- Sources: Existing website (primary) + Google Maps/GBP (primary) + founder inputs.
- Images: Stock via URL for demo. Tiny footer note on demo: "Bilder exemplarisch (Demo)".
- Output: Vercel preview URL with real content, stock images, wizard placeholder.
- Decision point: Founder sees demo → confirms direction → Phase B.

### Phase B — Production
- Goal: Ship real site with real photos, verified copy, live wizard + email.
- Sources: Founder-confirmed facts + real photos + real reviews.
- Images: Real only (per style_dna.md). Remove all stock.
- Output: Production deploy on custom domain.

## Evidence Model

Every fact used in a customer build must be labeled:

| Label | Meaning | Rule |
|---|---|---|
| **Verified** | Confirmed from fetched HTML or founder-provided artifact | Can use directly |
| **Assumption** | Inferred from context but not explicitly confirmed | Must be flagged for founder review |
| **TBD** | Unknown, not findable from any source | Must be resolved before Phase B |

## Source Priority
1. **Existing website HTML** (fetched, parsed) — strongest evidence
2. **Google Maps / GBP** (founder screenshots or API) — strong for address, hours, reviews
3. **Founder direct input** (questionnaire, message) — strong, but may need formatting
4. **Inference from context** — mark as Assumption, always

## Theme Extraction Rule
- Derive color palette and logo cues from existing website when available.
- If existing site has no clear palette or is outdated: default to "Classic Premium" (dark base + warm accent + white, per style_dna.md).
- Logo: extract from existing site if possible (inspect HTML for logo image). Request SVG/PNG from founder for production.

## Demo Images Mode (Phase A only)
- Use stock photos via URL (Unsplash/Pexels) as placeholders for hero, service tiles, team.
- Every page with stock images must show a small footer note: "Bilder exemplarisch (Demo)".
- Phase B replaces all stock with real photos from founder.

## Required Outputs Per Customer
1. `FACTS_VERIFIED.md` — all facts with Verified/Assumption/TBD labels
2. `ONBOARDING_QUESTIONNAIRE.autofill.md` — pre-filled questionnaire from evidence
3. `INPUTS_REQUIRED.md` — updated with "TBD ONLY" section showing remaining gaps
4. Demo URL (Phase A) — Vercel preview link
5. `status.md` — updated with each pipeline step

## Stop Criteria
- If existing website is unreachable → fall back to GBP-only one-pager (minimal content, all TBD).
- If GBP is also missing → website-only extraction with note "No GBP data available".
- If neither source exists → cannot proceed without founder questionnaire (full manual).
