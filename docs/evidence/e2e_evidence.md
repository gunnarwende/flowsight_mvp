# End-to-End Evidence Pack — FlowSight MVP

> Compiled: 2026-02-26 | All flows verified with case IDs + commit hashes.

---

## Summary: All Flows PASS

| Flow | Case/Call ID | Status | Verified By |
|------|-------------|--------|-------------|
| **Voice E2E (Peoplefone)** | 255136a3 | PASS | Founder call test |
| **Voice E2E (Direct)** | 9d89cf6b | PASS | Email received |
| **Wizard E2E** | 5fb36e99 | PASS | Email received |
| **Ops Dashboard** | — | LIVE | Login verified |
| **Email Delivery** | — | PASS | SPF/DKIM/DMARC pass |
| **Review Engine** | — | LIVE | W10-W14 commit |
| **Morning Report** | — | LIVE | YELLOW verified |
| **Peoplefone Front Door** | 255136a3 | LIVE | Founder verified |
| **Demo Booking** | — | LIVE | Email received (Founder Samsung S23) |
| **Customer Website** | — | LIVE | /kunden/doerfler-ag (12 sections) |
| **Entitlements** | — | LIVE | hasModule() gating |
| **Voice Smoke** | — | PASS | health:ok, webhook:ok, numbers:3 |

---

## 1. Voice Flow (Peoplefone → Retell → Case → Email)

**Architecture:**
```
Caller → Peoplefone +41 44 552 09 19
       → Twilio Entry +41 44 505 30 19 (SIP)
       → Retell DE Agent "Susi"
       → POST /api/retell/webhook
       → Supabase case insert
       → Resend email (ops + reporter)
```

**Proof:**
- Call ID: `call_b2feefb1160bf8cb4d1ccb870e0`
- Case ID: `255136a3-c842-49d8-9362-e6a3e7b00389`
- Created: 2026-02-25T11:46:36 UTC+1
- Details: Leck (leak), notfall, PLZ 8942
- Evidence: `docs/runbooks/peoplefone_front_door.md`

**Regression (Direct):**
- Call ID: `call_cb50d6fd...`
- Case ID: `9d89cf6b`
- Status: PASS (case + email)

**Voice Smoke (2026-02-26):**
```json
{"pass":true,"health":"ok","webhook":"ok","numbers":3,"last_voice_case_age_h":22}
```

**Agent Config:**
- DE: "Susi" (v3V1d2rk6528UrLKRuy8), de-DE
- INTL: "Juniper" (aMSt68OGf4xUZAnLpTU8), en-US
- Recording: OFF | PII Redaction: ON | Storage: everything_except_pii

---

## 2. Wizard Flow (Form → Case → Email)

**Proof:**
- Case ID: `5fb36e99`
- Source: wizard (/doerfler-ag/meldung)
- Status: new → notification emails sent
- Evidence: `docs/customers/doerfler-ag/status.md`

**Route:** POST /api/cases
**Entitlement:** hasModule(tenant_id, "website_wizard")

---

## 3. Email Delivery

**Domain:** flowsight.ch (Resend)
- SPF: PASS
- DKIM: PASS
- DMARC: PASS (p=none)

**5 Email Types:**
1. Case Notification → Ops (urgency prefix)
2. Reporter Confirmation → Customer
3. Review Request → Ops (Google link)
4. ICS Calendar Invite → Ops
5. Demo Booking → Founder

---

## 4. Ops Dashboard

**Live at:** /ops (auth required)
- Cases list + detail + status workflow
- Contact email editing
- Attachments upload/download (signed URLs)
- ICS invite generation
- Review request dispatch
- Filtering: status, urgency, category, date

---

## 5. Morning Report

**Script:** `scripts/_ops/morning_report.mjs`
- 10 KPIs, severity ampel (GREEN/YELLOW/RED)
- WhatsApp send via `--send` flag
- Before cleanup: RED (20/17). After: YELLOW (2/0).

---

## 6. Demo Booking

**Route:** POST /api/demo → Resend email to Founder
**Mobile:** Verified Samsung S23 (Founder, 2026-02-26)

---

## 7. Customer Website

**Template:** /kunden/[slug] (SSG, 12 sections)
**Instance:** /kunden/doerfler-ag
- Brand: #2b6cb0 (from old site)
- Reviews: 2 real Google (Martin B. 5★, Markus Widmer 5★)
- Wizard CTA: Nav + Hero + Contact
- Gallery: Horizontal scroll + lightbox
- All content verified (no fabrication)

---

## 8. Entitlements

**Function:** hasModule(tenantId, moduleName)
**Enforcement:** webhook (voice), /api/cases (wizard), ops routes
**Fallback:** true if module missing (backward compatible)

---

## Go-Live Readiness

| Gate | Status |
|------|--------|
| Voice E2E | PASS |
| Wizard E2E | PASS |
| Ops Dashboard | PASS |
| Email Deliverability | PASS |
| Peoplefone Front Door | PASS |
| Billing Guards | PASS (Twilio triggers + Peoplefone auto top-up) |
| 2FA Audit | PASS (6/8, gaps: Retell + Peoplefone — no 2FA available) |
| Mobile QA | PASS (Samsung S23, demo + email confirmed) |
| Voice Smoke | PASS (2026-02-26) |
| Reviews (F9) | DEFERRED (not Go-Live critical) |

**Verdict:** Ready for Go-Live. F9 (Google Review Link) wird nachgerüstet.
