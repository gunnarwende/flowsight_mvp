# Review IST-Audit — Nachlauf und Bewertungs-Engine

> **Strang:** Review · **Phase:** IST-Audit
> **Datum:** 2026-03-12
> **Methode:** Code-Audit aller beteiligten Dateien, kein Hoerensagen
> **Scope:** Review Surface + Review Request API + E-Mail/SMS + Website-Bewertungen + Case Lifecycle + Leitstand-Integration
> **Bezugsdokumente:** identity_contract.md, prospect_journey.md, wizard.md, gold_contact.md (WOW 7)

---

## 1. System-Ueberblick

Die Review-Engine ist der **Nachlauf** — das letzte Glied in der Kette:
Annahme (Voice/Wizard) → Leitstand → Arbeit → Abschluss → **Bewertung**

Sie besteht aus fuenf Code-Einheiten:

| Einheit | Datei | Zeilen | Verantwortung |
|---------|-------|--------|---------------|
| Review Surface | `app/review/[caseId]/page.tsx` | 198 | Google-Style Bewertungskarte, HMAC-gesichert |
| Review Request API | `app/api/ops/cases/[id]/request-review/route.ts` | 163 | Gate-Logik, E-Mail/SMS-Versand, Audit-Trail |
| Review E-Mail | `src/lib/email/resend.ts` (sendReviewRequest) | ~80 | Plain-Text Review-Anfrage |
| SMS Fallback | `src/lib/sms/sendSms.ts` | shared | SMS mit Review-Link |
| Leitstand-Button | `app/ops/(dashboard)/cases/[id]/CaseDetailForm.tsx` | ~20 | "Review anfragen"-Button im Falldetail |

**Zusaetzlich relevant:**
- `src/lib/customers/types.ts` → `ReviewsConfig` Interface (Website-Bewertungen)
- `app/kunden/[slug]/page.tsx` → Google-Bewertungen auf Kunden-Websites
- Case Contract → `review_sent_at` Feld, Status-Lifecycle

---

## 2. Case Lifecycle — Voraussetzung fuer Reviews

### 2.1 Status-Kette

```
new → contacted → scheduled → done → [Review moeglich]
                                        ↓
                                   review_sent_at gesetzt
```

**Status-Werte:** `new`, `contacted`, `scheduled`, `done` (+ `archived` fuer Ausblenden)

**Review-Gate:** `status === "done"` UND (`contact_email` ODER `contact_phone`) UND `review_sent_at === null`

**Beobachtungen:**
- **Kein "closed"-Status.** Der Case bleibt nach `done` einfach stehen. Es gibt kein formales Ende.
- **Kein Zeitfenster.** Review kann sofort nach "done" oder 6 Monate spaeter angefragt werden. Kein Ablauf.
- **Kein automatischer Trigger.** Status → done erzeugt keinen Review-Impuls. Rein manuell.
- **Status-Aenderung ist Freitext:** Ops kann von `new` direkt auf `done` springen (kein erzwungener Fluss).

### 2.2 Review-relevante DB-Felder

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| `status` | text, default "new" | Ops-managed |
| `review_sent_at` | timestamptz, nullable | Gesetzt durch Review Request API |

**Was NICHT existiert:**
- `review_clicked_at` — kein Click-Tracking
- `review_posted_at` — keine Bestaetigung von Google-Seite
- `review_text` — kein lokaler Review-Text
- `review_status` — keine State-Machine (sent → clicked → posted)
- `closed_at` — kein formaler Abschluss-Timestamp

---

## 3. Review Request — Ablauf

### 3.1 Trigger

**Einziger Trigger:** Manueller Klick auf "Review anfragen" im Leitstand (`CaseDetailForm.tsx`).

**Wer kann triggern:**
- Admin (sieht alle Cases)
- Tenant (sieht eigene Cases)
- Prospect (sieht eigene Cases im Trial — kann auch triggern)

### 3.2 Gate-Pruefungen

```
1. Auth: resolveTenantScope() → admin | tenant | prospect
2. Case laden: cases.select(id, status, contact_email, contact_phone, review_sent_at)
3. Tenant-Isolation: scope.tenantId === case.tenant_id (ausser Admin)
4. Status-Gate: status === "done" (sonst 400)
5. Kontakt-Gate: contact_email || contact_phone (sonst 400)
6. Duplikat-Gate: review_sent_at === null (sonst 409)
```

### 3.3 Versand-Logik

```
Hat contact_email?
  → Ja: E-Mail senden (sendReviewRequest)
        Erfolgreich? → DONE
        Fehlgeschlagen? → SMS-Fallback
  → Nein: Direkt SMS
Hat contact_phone?
  → Ja: SMS senden
  → Nein: 502 (sollte nicht passieren, Gate 5 faengt ab)
```

### 3.4 E-Mail-Inhalt

**Subject:** `[FlowSight] Wie war unser Service?`
**From:** `noreply@send.flowsight.ch`
**Text (Plain Text, kein HTML):**

```
Guten Tag

Wir hoffen, dass Sie mit unserem Service zufrieden waren.
Über eine kurze Bewertung würden wir uns sehr freuen:

{reviewSurfaceUrl}

Vielen Dank für Ihr Vertrauen.

Freundliche Grüsse
Ihr Service-Team

Sie erhalten diese Nachricht, weil wir einen Auftrag für Sie erledigt haben.
```

**Beobachtungen:**
- **Subject zeigt "[FlowSight]"** — verletzt Identity Contract R4.
- **"Wir" ohne Namen** — wer ist "wir"? Der Betrieb oder FlowSight?
- **"Ihr Service-Team"** — generisch, kein Betriebsname.
- **Kein `display_name`** irgendwo in der E-Mail.
- **Plain Text only** — kein HTML, kein Branding, keine Brand Color.
- **Kein Bezug zum Fall** — keine Kategorie, kein Ort, keine Erinnerung an den konkreten Service.

### 3.5 SMS-Fallback-Inhalt

```
{senderName}: Wie war unser Service?

Wir hoffen, Sie waren zufrieden. Über eine kurze Bewertung würden wir uns sehr freuen:
{reviewSurfaceUrl}

Vielen Dank für Ihr Vertrauen — Ihr Service-Team
```

**Beobachtungen:**
- **SMS-Absender = `sms_sender_name`** (korrekt, Identity Contract R5).
- **Fallback zu "FlowSight"** wenn kein `sms_sender_name` konfiguriert (Zeile 115: `?? "FlowSight"`).
- **"Ihr Service-Team"** — gleiche Anonymitaet wie E-Mail.

### 3.6 Audit-Trail

- `case_events` → `review_requested` mit Metadata `{ channel: "email" | "sms" }`
- `cases.review_sent_at` → Timestamp gesetzt

---

## 4. Review Surface — Was der Endkunde sieht

### 4.1 Zugang

URL: `/review/{caseId}?token={hmacToken}`
Zugang via: Link in Review-E-Mail oder Review-SMS.
Schutz: HMAC-Token-Validierung (gleicher Mechanismus wie Verify/Korrektur-Seite).

### 4.2 Layout

Google-Style Bewertungskarte auf grauem Hintergrund (`#e8eaed`):

```
┌─────────────────────────────────────┐
│          {companyName}               │
│                                      │
│         [M] Max Mustermann           │
│    Beitrag wird Google-weit          │
│         veröffentlicht               │
│                                      │
│       ★ ★ ★ ★ ★ (5 gold)           │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ Sehr kompetenter und         │   │
│  │ zuverlässiger Service.       │   │
│  │ Schnelle Reaktion, saubere   │   │
│  │ Arbeit, faire Preise.        │   │
│  │ Jederzeit wieder — klare     │   │
│  │ Empfehlung!                  │   │
│  └──────────────────────────────┘   │
│                                      │
│  [■ Fotos und Videos hinzufügen]    │
│                                      │
│  Abbrechen              [Posten]     │
│                                      │
└─────────────────────────────────────┘
```

### 4.3 Verhalten

| Element | IST-Verhalten |
|---------|---------------|
| `companyName` | Dynamisch aus `tenants.name` (Supabase) |
| Benutzer-Avatar | Hardcoded "M" in Magenta-Kreis |
| Benutzername | Hardcoded "Max Mustermann" |
| Sterne | 5 goldene Sterne, nicht aenderbar, rein dekorativ |
| Review-Text | 3-Zeiler vorausgefuellt, `readOnly` — kann nicht geaendert werden |
| "Fotos hinzufuegen" | Button existiert, **keine Funktionalitaet** |
| "Abbrechen" | Button existiert, **keine Aktion** (kein onClick, kein href) |
| "Posten" | Wenn `google_review_url` konfiguriert → Link zu Google. Sonst: toter Button. |

### 4.4 Kritische Beobachtungen

1. **"Max Mustermann" ist hardcoded.** Zeile 67: `const displayName = "Max Mustermann"`. Der echte Endkundenname (`reporter_name`) wird zwar aus der DB geladen (Zeile 37), aber nie verwendet.

2. **Sterne sind dekorativ.** Der Endkunde kann die Sternebewertung nicht aendern. Immer 5 Sterne. Kein Klick-Handler.

3. **Review-Text ist read-only.** `readOnly` auf dem Textarea (Zeile 144). Der Endkunde kann den vorausgefuellten Text nicht anpassen.

4. **"Fotos hinzufuegen" ist Attrappe.** Button existiert visuell, hat keinen Handler. Klick tut nichts.

5. **"Abbrechen" ist Attrappe.** Kein onClick, kein href. Klick tut nichts.

6. **"Posten" fuehrt zu Google — oder nirgendwohin.** Wenn `google_review_url` in `tenants.modules` gesetzt: externer Link zu Google. Wenn nicht: toter `<button>` ohne Handler.

7. **Kein Branding.** Hintergrund ist Google-Grau (#e8eaed), Karte ist weiss. Keine Brand Color, kein Logo, kein Bezug zum Betrieb ausser dem Namen im Header.

8. **Kein Tracking.** Kein Event bei Page-View, kein Event bei "Posten"-Klick. Kein Wissen, ob der Endkunde die Seite je gesehen hat.

---

## 5. Website-Bewertungen — Statische Anzeige

### 5.1 Datenquelle

Jede Kunden-Website (`/kunden/{slug}`) hat eine `reviews`-Sektion:

```typescript
interface ReviewsConfig {
  averageRating: number;    // z.B. 4.7
  totalReviews: number;     // z.B. 3
  googleUrl?: string;       // Google Maps URL
  highlights: ReviewHighlight[];  // Ausgewaehlte Zitate
}
```

**Quelle:** Hardcoded in TypeScript Customer Registry (`doerfler-ag.ts`, etc.).
**Aktualisierung:** Manuell. Keine API, kein Scraping, kein Sync.

### 5.2 Anzeige-Regeln

| Regel | Wert |
|-------|------|
| Rating anzeigen | Nur wenn `averageRating >= 4.0` (SHOW_RATING_THRESHOLD) |
| Anzahl anzeigen | Nur wenn `totalReviews >= 5` |
| Highlights anzeigen | Immer (wenn vorhanden) |

### 5.3 IST-Daten pro Tenant

| Tenant | Rating | Reviews | Highlights | googleUrl |
|--------|--------|---------|------------|-----------|
| Doerfler AG | 4.7 | 3 | 2 (Martin B., Markus W.) | Ja |
| Brunner HT | 4.8 | 52 | 3 | Ja |
| Walter Leuthold | 4.9 | 44 | 3 | Ja |
| Widmer Sanitaer | 5.0 | 1 | 1 | Ja |
| Orlandini | 3.8 | 28 | 3 | Ja |
| Weinberger AG | 4.4 | 20 | 3 | Ja |

**Beobachtung:** Orlandini hat 3.8 → Rating wird NICHT angezeigt (< 4.0 Threshold). Alle anderen zeigen Rating.

### 5.4 Beziehung zum Review-Nachlauf

**Keine.** Die Website-Bewertungen und die Review-Engine sind zwei vollstaendig getrennte Systeme:

- Website: Statische Daten in TypeScript, manuell gepflegt, zeigt historische Google-Bewertungen
- Review-Engine: Dynamisch pro Case, sendet Endkunde zu Google, hofft auf neue Bewertung

Es gibt keinen Feedback-Loop: Wenn ein Endkunde ueber die Review-Engine eine Google-Bewertung abgibt, aendert sich die Website-Anzeige **nicht automatisch**. Jemand muss manuell die `reviews`-Daten in der Registry aktualisieren.

---

## 6. Perspektive Endkunde — Erlebnis-Audit

### 6.1 Touchpoint-Kette

```
Fall erledigt → [Betrieb setzt status=done] → [Betrieb klickt "Review anfragen"]
→ E-Mail/SMS an Endkunde → Endkunde klickt Link → Review Surface
→ Endkunde klickt "Posten" → Google Review Seite (extern) → Bewertung abgeben
```

### 6.2 Emotionale Temperatur

| Moment | Temperatur | Begruendung |
|--------|-----------|------------|
| E-Mail/SMS erhalten | Neutral | Generisch, kein Bezug zum konkreten Fall |
| Review Surface oeffnen | Verwirrung | "Max Mustermann"? Sterne nicht klickbar? Text nicht aenderbar? |
| "Posten" klicken | Frustration | Leitet auf Google weiter — dort muss alles nochmal gemacht werden |
| Google Review schreiben | Aufwand | Vorausgefuellter Text ist nicht uebertragbar (readonly, kein Copy) |

### 6.3 Vertrauenskiller

1. **"Max Mustermann" statt echtem Namen.** Der Endkunde sieht einen fremden Namen. Sofort: "Das bin ich nicht. Was ist das?"

2. **Sterne und Text sind dekorativ.** Der Endkunde denkt, er bewertet — tut es aber nicht. Die Sterne sind nicht klickbar, der Text nicht aenderbar. Es ist eine Attrappe, die wie Google aussieht, aber keinen Zweck hat.

3. **Doppelte Arbeit.** "Posten" fuehrt zu Google. Dort muss der Endkunde sich einloggen, nochmal Sterne waehlen, nochmal Text schreiben. Die Review Surface hat nichts vorbereitet, was uebertragbar waere.

4. **"Abbrechen" und "Fotos" tun nichts.** Klickbare Elemente ohne Funktion zerstoeren Vertrauen.

5. **Kein Bezug zum erlebten Service.** E-Mail sagt "Wie war unser Service?" — aber welcher? Kein Datum, keine Kategorie, kein Ort. Bei mehreren Auftraegen unklar.

---

## 7. Perspektive Betrieb/Prospect — Leitstand-Integration

### 7.1 Review-Button im Leitstand

**Position:** Action-Bar unterhalb des Falldetails, neben "Speichern" und "Erledigt".

**States:**
- `idle`: "Review anfragen" (gruen, klickbar)
- `sending`: "Sende…" (disabled)
- `sent`: "Review gesendet" (gruen, disabled, mit Timestamp)
- `error`: Fehlermeldung rot

**Gate-Logik (Frontend):**
```typescript
const canRequestReview =
  status === "done" &&
  hasContactInfo &&
  reviewState !== "sent" &&
  reviewState !== "sending";
```

**Beobachtungen:**
- **Button ist neben Status-Speichern.** Nicht hervorgehoben, gleiche Groesse, gleiche Farbe. Leicht zu uebersehen.
- **Kein visueller Hinweis** wenn Case "done" ist und Review noch nicht gesendet. Keine Erinnerung, kein Badge.
- **Prospect kann Review triggern.** Zeile 320: Prospect-View hat denselben Review-Button. Prospect testet seinen eigenen Case und kann Review an sich selbst senden. Funktional korrekt, aber: kein Kontexthilfe.
- **Einmal gesendet = nie wieder.** Kein Resend. Wenn E-Mail/SMS nicht ankam → kein Retry.

### 7.2 Was der Betrieb NICHT sieht

- **Review-Ergebnis:** Ob der Endkunde die Review-Seite geoeffnet hat: unbekannt.
- **Google-Bewertung:** Ob eine Bewertung auf Google erschienen ist: unbekannt.
- **Conversion-Rate:** Wie viele der gesendeten Reviews zu Bewertungen fuehrten: unbekannt.
- **Review-Qualitaet:** Welchen Text der Endkunde geschrieben hat: unbekannt.

---

## 8. Gold Contact Positionierung

### 8.1 WOW 7: "Eine Google-Bewertung"

Aus gold_contact.md:
> **Ausloeser:** Betrieb hat sich entschieden. Erster echter Fall geloest. Review-Engine sendet Anfrage.
> **Was passiert:** Endkunde bekommt Bewertungsseite (Google-Review-Style). Klickt 5 Sterne. Bewertung geht rein.
> **Was der Betrieb fuehlt:** "FlowSight bringt mir nicht nur Ordnung — sondern auch Sterne."
> **Funktion:** Retention + Weiterempfehlung.

### 8.2 IST vs. Gold-Contact-Anspruch

| Gold Contact sagt | IST | Delta |
|-------------------|-----|-------|
| "Review-Engine sendet Anfrage" | Manueller Button-Klick im Leitstand | Kein automatischer Trigger |
| "Klickt 5 Sterne" | Sterne sind dekorativ, nicht klickbar | Reine Attrappe |
| "Bewertung geht rein" | Weiterleitung auf Google, dort nochmal alles machen | Doppelte Arbeit |
| "bringt mir Sterne" | Kein Feedback ob Bewertung erschienen ist | Keine Sichtbarkeit |
| Google-Review-Style | Ja, optisch Google-nah | Optik stimmt, Funktion nicht |

### 8.3 Operating Model Referenz

Aus operating_model.md:
> **Trial Success Signal:** "Review-Flow ausgeloest"

Der Review-Flow ist ein **Signal**, kein **Gate**. Er muss funktionieren, muss aber nicht waehrend des Trials ausgeloest werden. Er wird relevant nach Conversion.

---

## 9. Identity Contract Drift-Analyse

| Regel | IST-Status | Verstoss |
|-------|-----------|----------|
| R1 (display_name sync) | Review Surface: `companyName` aus `tenants.name` ✓. E-Mail: kein Name. SMS: `sms_sender_name`. | **Verstoss in E-Mail** |
| R2 (Kategorien identisch) | Nicht relevant fuer Review | OK |
| R3 (PLZ-Einheit) | Nicht relevant fuer Review | OK |
| R4 (FlowSight unsichtbar) | E-Mail Subject: "[FlowSight]". E-Mail Body: "Ihr Service-Team" statt Betriebsname. | **2× Verstoss** |
| R5 (short_name Scope) | SMS: `sms_sender_name` korrekt. Fallback "FlowSight" ist Verstoss. | **Verstoss bei Fallback** |
| R6 (Keine Halluzination) | "Max Mustermann" ist Halluzination eines Benutzernamens | **Verstoss** |
| R7 (Slug-Eindeutigkeit) | Nicht relevant | OK |

**Bilanz:** 4 von 7 relevanten Regeln verletzt. Gleiche Verstoss-Quote wie der Wizard vor dem Zielbild.

---

## 10. Beziehung zu anderen Straengen

### 10.1 Wizard → Review

Der Wizard-Fall hat typisch `contact_email` (optional, aber oft vorhanden). Das ist der primaere Review-Kanal. Voice-Faelle haben typisch nur `contact_phone` (Caller-ID). Der Wizard ist damit der **staerkere Review-Zulieferer**.

### 10.2 Prospect Journey → Review

Prospect Journey Tag 5-10 (kontrollierter Echt-Moment, T13): Ein echter Endkunde meldet via Voice oder Wizard. Wenn der Prospect den Fall bearbeitet und auf "done" setzt, kann er den Review-Button testen. Das ist ein **Proof of Value**: "So funktioniert Ihr Bewertungs-System."

### 10.3 Leitstand → Review

Der Review-Button lebt im Leitstand. Aber:
- Kein eigener Review-Bereich (kein Tab, keine Uebersicht "offene Reviews")
- Kein Filter "done ohne Review"
- Keine Review-KPIs

### 10.4 Voice → Review

Voice-Faelle haben `contact_phone` (immer) aber kein `contact_email` (nie). Review-Anfrage geht per SMS. Das funktioniert, aber SMS → Review Surface → Google ist eine **lange Kette mit viel Abbruch-Risiko**.

---

## 11. Dokumentierte Luecken (L1–L15)

### Kritisch (blockiert Gold-Contact WOW 7)

| # | Luecke | Wo | Impact |
|---|--------|-----|--------|
| L1 | "Max Mustermann" hardcoded statt echtem Namen | Review Surface Z.67 | Endkunde sieht fremden Namen → Vertrauensbruch |
| L2 | Sterne sind dekorativ, nicht interaktiv | Review Surface Z.123-135 | Endkunde denkt er bewertet, tut es aber nicht |
| L3 | Review-Text ist read-only | Review Surface Z.144 | Endkunde kann nicht personalisieren |
| L4 | "Abbrechen" und "Fotos" sind Attrappen | Review Surface Z.149-169 | Klickbare Elemente ohne Funktion = Vertrauenskiller |
| L5 | Review-E-Mail zeigt "[FlowSight]" im Subject | resend.ts Z.483 | Identity Contract R4 verletzt |

### Major (deutlich unter Gold-Niveau)

| # | Luecke | Wo | Impact |
|---|--------|-----|--------|
| L6 | Kein Fall-Bezug in Review-Anfrage | E-Mail + SMS | "Wie war unser Service?" — welcher? |
| L7 | Kein automatischer Trigger bei status=done | API-Design | Review-Anfrage wird vergessen |
| L8 | Kein Tracking (Surface-View, Posten-Klick) | Review Surface | Betrieb weiss nicht ob Endkunde Seite je gesehen hat |
| L9 | Kein Resend moeglich | API Z.56-61 | Wenn E-Mail/SMS nicht ankam → Game Over |
| L10 | Website-Bewertungen ≠ Review-Engine | Architektur | Zwei getrennte Systeme, kein Feedback-Loop |

### Design-Schwaechen

| # | Luecke | Wo | Impact |
|---|--------|-----|--------|
| L11 | Review-Button nicht hervorgehoben im Leitstand | CaseDetailForm | Leicht zu uebersehen, kein Reminder |
| L12 | Kein "done ohne Review"-Filter | Leitstand | Betrieb kann nicht sehen welche Cases Review brauchen |
| L13 | SMS-Fallback zu "FlowSight" bei fehlendem sms_sender_name | request-review Z.115 | Identity Contract R5 Verstoss |
| L14 | Plain-Text E-Mail ohne Branding | resend.ts Z.484-498 | Kein HTML, keine Brand Color, keine Wiedererkennung |
| L15 | Kein formaler Case-Abschluss (closed-Status) | Case Lifecycle | Case bleibt nach done + review ewig offen |

---

## 12. Zusammenfassung

### Was funktioniert

- **Happy Path existiert.** Case → done → Button → E-Mail/SMS → Surface → Google-Link. Die Kette ist da.
- **Gate-Logik ist sauber.** Nur status=done, nur mit Kontakt, nur einmal. Audit-Trail vorhanden.
- **Review Surface sieht optisch nach Google aus.** Visuell ueberzeugend als Ersteindruck.
- **HMAC-Schutz.** Kein Zugang ohne gueltigen Token. Sicherheit stimmt.
- **Website-Bewertungen live.** Alle 6 Tenants haben Reviews auf ihrer Website, mit Threshold-Logik.

### Was fehlt fuer Gold-Contact-Niveau

Die Review-Engine ist eine **Attrappe mit funktionalem Backend**. Die Kette Trigger → Versand → Surface funktioniert technisch, aber das Endkunden-Erlebnis ist eine Taeuschung: dekorative Sterne, nicht aenderbarer Text, Attrappen-Buttons, falscher Name.

**Die drei groessten Luecken:**

1. **Die Review Surface ist eine Mogelpackung.** Sie sieht aus wie Google, verhalt sich aber wie ein Screenshot. Nichts ist interaktiv. "Max Mustermann", 5 Sterne fix, Text readonly, Buttons ohne Funktion. Der Endkunde wird getaeuscht und dann auf Google weitergeleitet, wo er alles nochmal machen muss.

2. **Kein Betriebsbezug in der Kommunikation.** E-Mail, SMS und Surface zeigen weder den Betriebsnamen (ausser Surface-Header) noch den konkreten Fall. "Wie war unser Service?" — von wem, wann, fuer was?

3. **Kein Nachlauf-System.** Der Review ist ein One-Shot: manueller Trigger, eine E-Mail, keine Nachverfolgung. Kein Wissen ob geoeffnet, kein Wissen ob bewertet, kein Resend, kein Reminder. Fuer den Betrieb ist Review ein Knopfdruck ins Nichts.
