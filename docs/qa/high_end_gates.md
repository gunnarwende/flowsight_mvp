# QA Gates — Objective Acceptance Criteria

Every deliverable must pass ALL applicable gates before merge. The delivering agent must cite evidence (filepaths + brief notes) for each item.

## 1. IA Gate (Information Architecture)
- [ ] All 8 mandatory landing sections present (per website_playbook.md)
- [ ] Sections in correct order
- [ ] Wizard CTA appears in Hero, after Services, after Reviews, and in Contact
- [ ] No orphan pages (every page reachable from nav or CTA)
- [ ] Mobile: CTA visible without scrolling past 1.5 viewports

## 2. Visual Gate
- [ ] Typography hierarchy correct: single H1/page, consistent H2s, body 16–18px
- [ ] Section spacing >= 64px vertical padding
- [ ] Content max-width ~1200px, centered
- [ ] Max 3 accent colors used
- [ ] No clutter: no badge spam, no dense text blocks, no gimmicky animations
- [ ] Images are real (no stock photos) or appropriate icons (consistent line style)
- [ ] Consistent component sizing (service tiles, cards)

## 3. Copy Gate
- [ ] Headlines are specific to Sanitär/Heizung (not generic)
- [ ] No fluff words ("innovativ", "einzigartig", "revolutionär")
- [ ] Urgency vocabulary matches contract: "Notfall" / "Dringend" / "Normal"
- [ ] Domain terms used correctly (Rohrbruch, Warmwasser, Heizung Ausfall)
- [ ] No contradictions between sections
- [ ] Customer-facing: "Sie" form, direct address

## 4. UX Gate
- [ ] Wizard completion target: < 2 minutes
- [ ] Clear success state after wizard submit (confirmation message)
- [ ] Clear error states (validation, network failure)
- [ ] Phone fallback visible alongside wizard
- [ ] Mobile-first: all interactions work on phone

## 5. Ops Gate
- [ ] Sentry integrated: unhandled errors captured
- [ ] P0 fail paths identified (case creation failure, email dispatch failure)
- [ ] Sentry tags planned: tenant_id, source, case_id
- [ ] Output is email-only (no SMS/WhatsApp)
- [ ] Case shape matches docs/architecture/contracts/case_contract.md
- [ ] No secrets in source code (grep verified)
- [ ] Vercel build succeeds (npm run build passes)

## Evidence Requirement
The delivering agent MUST provide a checklist response citing:
- **Filepath** for each satisfied gate item (e.g., `src/web/app/page.tsx:L45 — Hero section with CTA`)
- **Brief note** explaining how the gate is met
- If a gate cannot be verified yet (e.g., no deploy), note it as "Deferred: [reason]"

Incomplete evidence = gate not passed. Do not merge without full checklist.
