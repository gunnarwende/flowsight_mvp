# QA Gates Evidence: Dörfler AG — Phase A Demo

**Date:** 2026-02-18
**Owner:** Web Agent
**Build:** `npm run build` PASS | `npm run lint` PASS
**Route:** `/doerfler-ag` (static prerender)

---

## 1. IA Gate

| Item | Status | Evidence |
|---|---|---|
| All 8 mandatory sections present | PASS | `page.tsx` — Hero, Services (id=leistungen), Notfall CTA, Process, Proof/Reviews (id=referenzen), Gallery (id=galerie), About (id=ueber-uns), Service Area (id=einzugsgebiet), Contact (id=kontakt) |
| Sections in correct order | PASS | `page.tsx` — matches website_playbook.md order exactly |
| CTA in Hero | PASS | `page.tsx` — "Anfrage senden" → #kontakt |
| CTA after Services | PASS | `page.tsx` — "Jetzt Anfrage stellen" → #kontakt |
| CTA after Proof | PASS | `page.tsx` — "Jetzt Anfrage stellen" → #kontakt |
| CTA in Contact | PASS | `page.tsx` — "Anfrage per E-Mail senden" + "Anrufen" |
| No orphan pages | PASS | Single-page landing, all nav links are anchor scrolls |
| Mobile CTA < 1.5 viewports | Deferred | Requires Vercel preview screenshot (visual check) |

## 2. Visual Gate

| Item | Status | Evidence |
|---|---|---|
| Single H1/page | PASS | `page.tsx` — one `<h1>` in Hero only |
| Consistent H2s | PASS | `page.tsx` — 8 `<h2>` elements, all styled identically (`text-3xl lg:text-4xl font-bold`) |
| Body 16-18px | PASS | `page.tsx` — `text-lg` (18px) for body text |
| Section spacing >= 64px | PASS | `page.tsx` — `py-24 lg:py-32` (96px/128px) on all sections |
| Max-width ~1200px | PASS | `page.tsx` — `max-w-6xl` (1152px) on all content containers |
| Max 3 accent colors | PASS | `doerfler_ag.ts` — primary #1a2e44, accent #c8965a, light #f8f7f4 (3 colors) |
| No clutter | PASS | No badge spam, no animations, generous whitespace |
| Images real (not stock) | Phase A: DEMO | Stock images via Unsplash URL; footer note "Bilder exemplarisch (Demo)" |
| Consistent components | PASS | Service cards, proof cards, gallery items — all use identical structure |

## 3. Copy Gate

| Item | Status | Evidence |
|---|---|---|
| Headlines specific to Sanitär/Heizung | PASS | H1: "Sanitär & Heizung in Oberrieden"; H2s: domain-specific |
| No fluff words | PASS | No "innovativ", "einzigartig", "revolutionär" anywhere in copy |
| Urgency vocabulary | PASS | "Notfall" section uses "Rohrbruch, Wasserschaden, Heizungsausfall" |
| Domain terms used correctly | PASS | Rohrbruch, Wasserschaden, Heizungsausfall, Sanitär, Spenglerei etc. |
| No contradictions | PASS | Consistent messaging across all sections |
| "Sie" form | PASS | All customer-facing text uses formal "Sie" address |

## 4. UX Gate

| Item | Status | Evidence |
|---|---|---|
| Wizard < 2 min | Deferred | Wizard not yet implemented (Phase A uses mailto CTA) |
| Success state | Deferred | Wizard not yet implemented |
| Error states | Deferred | Wizard not yet implemented |
| Phone fallback visible | PASS | Phone CTA in Hero, Notfall section, Contact section, nav |
| Mobile-first | PASS | Responsive classes throughout: `flex-col sm:flex-row`, `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` |

## 5. Ops Gate

| Item | Status | Evidence |
|---|---|---|
| Sentry integrated | PASS (existing) | `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `global-error.tsx` |
| P0 fail paths | Deferred | No API routes yet (Phase A is static) |
| Sentry tags | Deferred | No case creation yet |
| Email-only output | PASS | No SMS/WhatsApp anywhere |
| Case contract | Deferred | No wizard/case creation yet |
| No secrets in code | PASS | No API keys, tokens, or credentials in any source file |
| Build passes | PASS | `npm run build` exit 0; `npm run lint` exit 0 |

## Summary

- **Passed:** 25 items
- **Deferred:** 7 items (wizard, case creation, mobile screenshot — all Phase B / post-demo)
- **Phase A exceptions:** Stock images with demo label (per pipeline SSOT)
- **Assumptions used:** Brand palette (Classic Premium), service area (Bezirk Horgen), slogan — all labeled in footer

## Files Created/Modified

- `src/web/src/lib/demo_theme/doerfler_ag.ts` — theme config
- `src/web/app/(demos)/doerfler-ag/page.tsx` — landing page
