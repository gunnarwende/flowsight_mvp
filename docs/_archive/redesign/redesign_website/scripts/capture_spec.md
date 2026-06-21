# Playwright Capture-Spec

**Zweck:** Exakte Definition aller UI-Screenshots für Hero + Live-erleben Videos.
**Tool:** Playwright Headless Chromium, gesteuert durch CC.
**Voraussetzung:** Demo-Case im Weinberger-Tenant durch Lifecycle führen (CC macht das vor Capture-Start).

---

## Daten-Vorbereitung (CC, vor Captures)

1. **Demo-Case erstellen** im Weinberger-Tenant via API:
   - Melder: "Max Müller" (fiktiv, kein echter Kunde)
   - Telefon: "+41 79 123 45 67" (fiktiv)
   - Adresse: "Seestrasse 42, 8800 Thalwil"
   - Kategorie: "Sanitär"
   - Dringlichkeit: "Dringend"
   - Beschreibung: "Wasserhahn in der Küche tropft seit gestern, Wasser sammelt sich unter dem Spülbecken."
   - Source: "phone" (damit es wie ein Lisa-Anruf aussieht)
   - is_demo: true

2. **Case durch Lifecycle führen:**
   - Status: Neu → Geplant (Termin: morgen 09:00, Techniker: Sebastian) → Erledigt
   - case_events: "Fall erstellt", "Termin geplant", "Erledigt"
   - Review angefragt → review_rating: 5, review_received_at: jetzt → Gold-Status

3. **Sicherstellen:** FlowBar zeigt mindestens 5 Cases in verschiedenen Status (Neu, Geplant, In Arbeit, Erledigt, Gold).

---

## Captures

### C1 — Leitstand Admin (Desktop)

| Feld | Wert |
|------|------|
| **URL** | `/ops/cases` |
| **Auth** | OTP-Login als Admin, Weinberger-Tenant |
| **Viewport** | 1920x1080, deviceScaleFactor: 2 |
| **Erwarteter Inhalt** | FlowBar (4 KPIs: Eingang, Bei uns, Erledigt, Bewertung) + Case-Liste mit 5+ Fällen |
| **Warten auf** | FlowBar vollständig geladen, Cases sichtbar |
| **Verwendet in** | Hero Sz. 3, Live-erleben Sz. 4, Sz. 8 |
| **Dateiname** | `captures/leitstand_admin_desktop.png` |

### C2 — Leitstand Admin (Mobile)

| Feld | Wert |
|------|------|
| **URL** | `/ops/cases` |
| **Viewport** | 390x844, deviceScaleFactor: 2 |
| **Erwarteter Inhalt** | FlowBar 2x2 Grid, Case-Liste kompakt |
| **Verwendet in** | Ggf. alternative Szene, Social Cutdowns |
| **Dateiname** | `captures/leitstand_admin_mobile.png` |

### C3 — Case-Detail (Termin + Techniker)

| Feld | Wert |
|------|------|
| **URL** | `/ops/cases/[demo-case-id]` |
| **Viewport** | 1920x1080, deviceScaleFactor: 2 |
| **Erwarteter Inhalt** | Case-Header (Kategorie, Dringlichkeit, Melder), Terminpicker mit Datum, Staff-Dropdown mit "Sebastian", Status "Geplant" (violett) |
| **Verwendet in** | Live-erleben Sz. 5 |
| **Dateiname** | `captures/case_detail_planned.png` |

### C4 — Case-Detail (Erledigt + Timeline)

| Feld | Wert |
|------|------|
| **URL** | `/ops/cases/[demo-case-id]` (nach Status → Erledigt) |
| **Viewport** | 1920x1080, deviceScaleFactor: 2 |
| **Erwarteter Inhalt** | Status "Erledigt" (grün), Timeline mit Events (erstellt → geplant → erledigt), Gold-Badge wenn Review vorhanden |
| **Verwendet in** | Live-erleben Sz. 6, ggf. Hero Sz. 4 |
| **Dateiname** | `captures/case_detail_done.png` |

### C5 — SMS-Verify (Mobile)

| Feld | Wert |
|------|------|
| **URL** | `/v/[demo-case-id]?t=[token]` |
| **Auth** | Kein Login nötig (HMAC-Token im URL) |
| **Viewport** | 390x844, deviceScaleFactor: 2 |
| **Erwarteter Inhalt** | Korrekturseite mit Falldetails, Foto-Upload-Option, Weinberger-Branding |
| **Verwendet in** | Hero Sz. 2, Live-erleben Sz. 3 |
| **Dateiname** | `captures/sms_verify_mobile.png` |

### C6 — Review-Surface (5 Sterne, Gold)

| Feld | Wert |
|------|------|
| **URL** | `/review/[demo-case-id]` |
| **Auth** | HMAC-Token im URL |
| **Viewport** | 1920x1080, deviceScaleFactor: 2 |
| **Erwarteter Inhalt** | 5 goldene Sterne ausgewählt, "Vielen Dank für Ihre tolle Bewertung!", Google-CTA sichtbar, Weinberger-Branding |
| **Vorbereitung** | Playwright muss Sterne anklicken (5. Stern), dann Screenshot nach Phase-Übergang |
| **Verwendet in** | Live-erleben Sz. 7, ggf. Hero Sz. 4 |
| **Dateiname** | `captures/review_surface_gold.png` |

### C7 — Wizard Step 1 (Kategorie)

| Feld | Wert |
|------|------|
| **URL** | `/kunden/weinberger-ag/meldung` |
| **Auth** | Kein Login |
| **Viewport** | 1920x1080, deviceScaleFactor: 2 |
| **Erwarteter Inhalt** | Kategorie-Auswahl (Weinberger-Services: Sanitär, Heizung, etc.), Dringlichkeits-Auswahl |
| **Verwendet in** | Optional für Live-erleben (alternative Szene) |
| **Dateiname** | `captures/wizard_step1.png` |

### C8 — FlowBar Bewertungs-KPI (Close-up)

| Feld | Wert |
|------|------|
| **URL** | `/ops/cases` |
| **Viewport** | 1920x1080, deviceScaleFactor: 2 |
| **Vorbereitung** | Playwright scrollt NICHT, fokussiert nur auf FlowBar. CSS clip/crop auf Bewertungs-Spalte. |
| **Erwarteter Inhalt** | Bewertungs-KPI mit goldenen Sternen, "4.4★", "X erhalten / Y angefragt" |
| **Verwendet in** | Hero Sz. 4 (Alternative), Live-erleben Sz. 7 |
| **Dateiname** | `captures/flowbar_reviews_closeup.png` |

---

## PII-Regeln

- **NIEMALS** echte Melder-Daten (Namen, Telefon, Adresse) in Captures
- **NUR** Demo-Cases (is_demo=true) mit fiktiven Schweizer Testdaten
- **FlowBar-KPIs** (aggregiert) sind ok — keine PII in Summen
- **Google-Rating** (4.4★) ist ok — öffentliche Information
- **Firmenname "Weinberger AG"** ist ok — mit Erlaubnis als Goldstandard

---

## Technische Anforderungen

- Chromium Headless, `--disable-gpu` (Windows-Kompatibilität)
- `deviceScaleFactor: 2` für Retina-Qualität
- `waitForLoadState('networkidle')` vor jedem Screenshot
- PNG-Format, keine Kompression
- Alle Captures in `production/captures/` (lokal, .gitignore'd)
