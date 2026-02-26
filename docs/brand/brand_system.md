# FlowSight Brand System

**Owner:** Founder + CC
**Last updated:** 2026-02-25
**Rule:** Every visual element on flowsight.ch must trace back to this document.

## Brand Essence

**Positioning:** Werkzeug-Premium. FlowSight is a serious tool for serious businesses.
**Register:** Think Hilti, not Apple. Think Festool, not Figma.
**Tone:** Swiss craftsmanship language, not SaaS jargon.

## Logo: The Signal Dot

The FlowSight logo is the wordmark "FlowSight" with a signal dot — a gold circle positioned after the "t", elevated like a notification badge.

**The dot = the brand promise:** Every signal gets captured. Every call becomes a case. Nothing gets lost.

### Variants

| Variant | Text | Dot | Use on |
|---------|------|-----|--------|
| `logo-on-dark.svg` | Gold (#c8965a) | Gold (#c8965a) | Navy backgrounds (hero, footer, dark sections) |
| `logo-on-light.svg` | Navy (#1a2744) | Gold (#c8965a) | White/light backgrounds (nav, cards) |

### Favicon

Gold dot on navy rounded square. Works at 16px. The dot IS the brand mark.

### Clear Space

Minimum clear space around the logo = height of the signal dot on all sides.

### Don'ts

- Never use the wave/swoosh from v1 (archived)
- Never change the dot color (it's always gold)
- Never add a tagline to the logo mark (tagline goes separately)
- Never put the logo on busy/patterned backgrounds
- Never stretch or distort

## Color Palette

### Primary Colors (from logo)

| Token | Hex | Usage |
|-------|-----|-------|
| `navy-950` | #0f1a2e | Darkest backgrounds (footer, hero gradient end) |
| `navy-900` | #1a2744 | Primary dark surface (hero, dark sections) |
| `navy-800` | #243352 | Cards on dark, elevated surfaces |
| `navy-700` | #2e4066 | Borders on dark surfaces |
| `navy-400` | #7b8fb3 | Muted text on dark backgrounds |
| `navy-200` | #c4cfdf | Light borders, dividers |
| `navy-100` | #e2e8f0 | Subtle backgrounds |
| `navy-50` | #f0f3f7 | Alternating section backgrounds |

| Token | Hex | Usage |
|-------|-----|-------|
| `gold-600` | #9c7340 | Active/pressed state |
| `gold-500` | #c8965a | **PRIMARY ACCENT** — CTAs, logo, highlights, links |
| `gold-400` | #d4a96e | Hover state |
| `gold-300` | #e0be8a | Light highlights, decorative |
| `gold-100` | #f5eadb | Tinted backgrounds, badges |

### Neutrals

| Token | Hex | Usage |
|-------|-----|-------|
| `warm-white` | #faf8f5 | Page background (NOT pure white — warmer) |
| `text-primary` | #1a1a1a | Body text on light |
| `text-secondary` | #64645f | Secondary text, captions |

### Semantic Colors (minimal)

| Token | Hex | Usage |
|-------|-----|-------|
| `status-success` | #4a9d6e | Check marks, positive indicators |
| `status-error` | #c45c4a | Error states, problem indicators |
| `status-warning` | `gold-500` | Warnings use the brand gold |

### Color Rules

1. **Maximum 3 colors per viewport:** Navy + Gold + one neutral (white or warm-white)
2. **Gold is for actions and signals:** CTAs, links, the dot, active states. Never for body text.
3. **Navy is for authority:** Dark sections, headers on light. Never mid-grey — commit to dark or light.
4. **No blue.** The current `blue-600` CTA must become `gold-500`. Blue = generic SaaS. Gold = FlowSight.
5. **No gradients** except the dark hero (navy-900 → navy-950). Everything else is solid.

## Typography

### Font: Geist (already loaded)

| Style | Weight | Size | Use |
|-------|--------|------|-----|
| H1 | 700 (Bold) | 48-60px (`text-5xl`/`text-6xl`) | Hero headline, one per page |
| H2 | 700 (Bold) | 30-36px (`text-3xl`/`text-4xl`) | Section headers |
| H3 | 600 (Semibold) | 20-24px (`text-xl`/`text-2xl`) | Card titles, sub-sections |
| Body | 400 (Regular) | 16-18px (`text-base`/`text-lg`) | Paragraphs, descriptions |
| Small | 500 (Medium) | 14px (`text-sm`) | Labels, nav links, meta |
| Mono | Geist Mono | 14px | Code, technical references (ops only) |

### Typography Rules

1. **Letter spacing:** Tight for headlines (`tracking-tight`), normal for body
2. **Line height:** 1.5-1.6 for body (`leading-relaxed`), 1.1-1.2 for headlines
3. **Max line width:** ~70ch for body text
4. **All caps:** Only for labels/tags (`text-sm uppercase tracking-wider`)

## Component Patterns

### CTAs

| Type | Style | Example |
|------|-------|---------|
| Primary | Gold bg, navy text, rounded-lg | `bg-gold-500 text-navy-950 hover:bg-gold-400` |
| Secondary (on dark) | Transparent, gold border, gold text | `border border-gold-500/40 text-gold-300 hover:bg-gold-500/10` |
| Secondary (on light) | Transparent, navy border, navy text | `border border-navy-200 text-navy-900 hover:bg-navy-50` |

### Cards

- Light mode: `bg-white border border-navy-200 rounded-2xl shadow-sm`
- Dark mode: `bg-navy-800 border border-navy-700 rounded-2xl`

### Section Rhythm

Alternating: dark (navy-900) → light (warm-white) → tinted (navy-50) → light (warm-white) → dark

### Proof Indicators

Gold dot + text. Not badge spam. Max 3-4 per section.
```
● 24/7 erreichbar   ● 4 Sprachen   ● Keine Aufnahmen
```

## Asset Locations

| Asset | Path |
|-------|------|
| Logo (dark bg) | `docs/brand/assets/logo-on-dark.svg` |
| Logo (light bg) | `docs/brand/assets/logo-on-light.svg` |
| Favicon | `src/web/public/favicon.svg` |
| Logo v1 (archived) | `docs/brand/assets/logo_variants_v1.pdf` |
| Logo component | `src/web/src/components/Logo.tsx` |
| CSS tokens | `src/web/app/globals.css` (`:root` + `@theme`) |

## Anti-Drift Checklist

When touching any marketing page, verify:
- [ ] No `blue-*` classes (should be `gold-*` or `navy-*`)
- [ ] No `slate-*` classes (should be `navy-*` or neutral)
- [ ] CTAs use gold, not blue
- [ ] Logo component used (not plain text)
- [ ] Max 3 colors per viewport
- [ ] Gold only for actions/signals, never body text
