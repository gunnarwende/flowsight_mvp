# Style DNA — Binding Design Policy

**Superseded by:** `docs/brand/brand_system.md` for colors, typography, and logo.
**This file:** Component patterns, image style, copy tone, no-go list.

## Positioning
Premium, calm, trustworthy, Swiss craftsmanship. Werkzeug-Premium register (Hilti, not Apple).

## Color Authority
See `brand_system.md`. Key rules:
- **Gold** (`gold-500` / #c8965a) for actions and signals. Never body text.
- **Navy** (`navy-900` / #1a2744) for authority. Dark sections, headers.
- **No blue.** No slate. Use navy-* and gold-* exclusively on marketing pages.
- **Warm white** (#faf8f5) as page background. Not pure white.

## Typography Hierarchy
- **H1:** One per page. Bold, tight tracking, short (max ~8 words). Sets the promise.
- **H2:** Section headers. Bold, scannable.
- **Body:** 16–18px base. Line-height 1.5–1.6. Max ~70ch per line.
- **Spacing:** Generous whitespace between sections. Minimum 64px vertical section padding.

## Grid Discipline
- Content max-width: ~1200px (max-w-6xl), centered.
- Consistent horizontal padding (16–24px mobile, 32–64px desktop).
- Align elements to a visible rhythm — no random offsets.

## Component Patterns
- **Hero:** Full-width navy background, strong headline, single gold CTA, optional product screenshot.
- **Proof Indicators:** Gold dot (●) + text. Max 3–4. No badge spam.
- **Service Tiles:** Clean cards (white on light, navy-800 on dark), consistent sizing.
- **CTA:** Gold background, navy text. One primary action per viewport. Repeat at natural scroll points.
- **Logo:** Always use `<Logo>` component, never plain text for brand name.

## Image Style
- Real product screenshots (redacted), real team, real tools. Warm lighting preferred.
- No cheesy stock photos (no handshakes, no fake smiles, no suits).
- Icons: simple, consistent line style (current Heroicons approach is fine).

## Copy Tone
- Short sentences. Specific, not generic.
- No fluff words ("innovative", "revolutionär", "einzigartig") — say what you do.
- Use domain language: "Rohrbruch", "Warmwasser", "Heizung Ausfall", "Notfall".
- "Leitsystem" not "Platform". "Einsatzplanung" not "Scheduling Module".
- Address directly ("Sie haben ein Problem? Wir sind da.")

## No-Go List
- Blue accent colors (use gold)
- Slate greys (use navy palette)
- Cheap trust badges or certification logos crammed together
- Loud gradients or neon highlights
- Dense text blocks without whitespace
- Gimmicky animations, parallax overload, auto-playing video
- Generic hero images (city skylines, abstract shapes)
- "AI-powered" or tech buzzwords in customer-facing copy

## Decision Rule
When in doubt: prefer clarity + premium restraint over more content or more features.
