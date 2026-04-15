# Plan: Bewertungen Abschluss — High-End Review-System

> Stand: 2026-04-15 | Owner: CC + Founder
> Ziel: Bewertungen-System produktionsreif machen — von Anfrage bis KPI lückenlos.

---

## Kontext

Founder hat den kompletten Review-Flow getestet (FB27–FB44). Zusätzlich: Deep-Audit
aller beteiligten Dateien hat 7 weitere Probleme aufgedeckt. Dieses Dokument ist der
vollständige, priorisierte Abschlussplan.

---

## Alle Punkte — priorisiert

### Runde 1: "Nichts darf kaputt sein" (Blocker)

| ID | Problem | Root Cause | Dateien | Aufwand |
|----|---------|-----------|---------|---------|
| **FB36** | Manuell erstellter Fall erscheint nicht | `CreateCaseModal` sendet keine `tenant_id` → fällt auf `FALLBACK_TENANT_ID` → falscher Tenant → RLS versteckt Fall | `CreateCaseModal.tsx`, `api/cases/route.ts` | M |
| **FB27/39** | SMS geht nicht raus bei `076...` Format | `toEcallNumber()` konvertiert nur `+41→0041`, nicht `0xx→+41xx` | `sendSmsEcall.ts`, `CaseDetailForm.tsx` (Placeholder) | S |
| **X1** | Stammkunden-Check matcht `076` nicht mit `+41 76` | Normalisierung fehlt vor Vergleich | `request-review/route.ts` | S (Teil von FB27) |
| **FB41** | "Bewertung bereits gespeichert" — Lüge | Text erscheint bei 4+ Sternen, aber Save passiert erst bei Button-Klick | `ReviewSurfaceClient.tsx:265-267` | S |
| **SEC-1** | `/api/review/[caseId]/rate` hat ZERO Auth | Kein Token-Check, kein Rate-Limit. Jeder kann Bewertungen spammen | `rate/route.ts` | M |
| **SEC-2** | Review-Link läuft nie ab | HMAC basiert nur auf caseId+created_at, kein Timestamp | `verifySmsToken.ts`, `review/[caseId]/page.tsx` | S |
| **BUG-1** | `deriveReviewStatus` kennt kein "bewertet" | Nach Kundenrating zeigt UI weiterhin "Geöffnet" statt "Bewertet" | `deriveReviewStatus.ts`, `CaseDetailForm.tsx` | M |

### Runde 2: "Sieht professionell aus" (UX)

| ID | Problem | Root Cause | Dateien | Aufwand |
|----|---------|-----------|---------|---------|
| **FB40** | SMS sieht grauenhaft aus | Volle Token-URL (~100 Zeichen) statt Short-Token. Sprengt 160-Zeichen-Limit | `request-review/route.ts:227`, `verifySmsToken.ts` | S |
| **FB34** | Erledigt-Button: Bewertungs-Rand-Logik | Kein visuelles Feedback zu Bewertungsstatus auf Button | `SystemCard.tsx`, `FlowBar.tsx` | M |
| **FB35** | Kategorien = Freitext statt Tenant-Dropdown | Wizard hat dynamische Kategorien, Leitstand hat `<input type="text">` | `CaseDetailForm.tsx`, `CreateCaseModal.tsx` | M |
| **FB38** | E-Mail "Fall öffnen" → Login → Ziel-URL verloren | Auth-Guard leitet auf `/ops/login` ohne `?next=` Parameter | `layout.tsx`, `middleware.ts` | M |
| **FB44** | Fehlermeldungen auf Englisch | `review_skipped`, `review_send_failed` nicht im deutschen Mapping | `CaseDetailForm.tsx:537-543` | S |
| **X2** | `faelle` Seite filtert `is_deleted` nicht | Gelöschte Fälle bleiben sichtbar | `faelle/page.tsx` | S |
| **X3** | "Voice Agent" in E-Mail = Englisch | SOURCE_LABELS hat englischen String | `resend.ts:52` | S |
| **PUSH-1** | Negativ-Push: eigener Event-Type `negative_review` (immer aktiv, kein Opt-out) | `rate/route.ts:81`, `sendOpsPush.ts` | S |
| **PUSH-2** | Push-Preferences UI in Einstellungen (Betrieb konfiguriert welche Pushes) | `settings/page.tsx`, `subscribe/route.ts` | M |
| **PUSH-3** | Zuweisung-Push nur an zugewiesene Person (nicht broadcast) | `notify-assignees/route.ts` | S |
| **BUG-3** | Double-Submit: Rating wird überschrieben | Zwei Klicks → zwei Events + zweite Push + Überschreibung | `rate/route.ts` | S |
| **BUG-4** | `review_surface_opened` Event: keine Deduplizierung | Jeder Seitenaufruf = neues Event, verfälscht Analytics | `review/[caseId]/page.tsx` | S |
| **BUG-5** | `review_sent_count` DB-Spalte wird nie inkrementiert | Totes Feld, Zählung nur über Events | `request-review/route.ts` | S |

### Runde 3: "Nice to have" (Feature, nicht Go-Live-kritisch)

| ID | Problem | Dateien | Aufwand |
|----|---------|---------|---------|
| **FB35b** | Foto-Upload bei manueller Fall-Erstellung | `CreateCaseModal.tsx` | L |
| **FB34b** | KPI Bewertungen in SystemCard (Ø + n) | `SystemCard.tsx` | M |

---

## Detaillierte Lösungen

### FB36 — CreateCaseModal: tenant_id fehlt

**Problem:** Modal sendet keinen Tenant an API. Fällt auf `FALLBACK_TENANT_ID` zurück.

**Lösung:**
1. In `CreateCaseModal.tsx`: Active Tenant aus Cookie `fs_active_tenant` lesen
2. Alternativ: Neuen API-Endpunkt `POST /api/ops/cases` (mit Auth-Scope) statt generischen `/api/cases`
3. Empfehlung: `tenant_id` aus `resolveTenantScope()` Server-seitig ableiten — nicht vom Client senden (Sicherheit)

**Ansatz:** CreateCaseModal ruft `/api/ops/cases` auf (neuer Endpunkt). Dieser nutzt `resolveTenantScope()` → garantiert korrekte tenant_id.

### FB27/39/X1 — Telefon-Normalisierung

**Problem:** `076 123 45 67` → wird 1:1 an eCall geschickt → scheitert.

**Lösung:** Zentrale Normalisierungsfunktion:
```
normalizeSwissPhone(input: string): string | null
  - Leerzeichen/Bindestriche entfernen
  - 07x... → +417x...
  - 004x... → +4x...
  - +41... → unverändert
  - Alles andere → null (ungültig)
```

**Anwenden an 3 Stellen:**
1. `CaseDetailForm.tsx` — beim Speichern (`contactPhone.trim()` → `normalizeSwissPhone()`)
2. `sendSmsEcall.ts` — `toEcallNumber()` erweitern als Safety Net
3. `request-review/route.ts` — Stammkunden-Check: beide Nummern normalisieren vor Vergleich

**Placeholder:** `076 123 45 67` statt `+41 79...`

### FB41 — "Gespeichert"-Lüge

**Problem:** Text "✓ Ihre Bewertung wurde bereits gespeichert" erscheint sofort bei 4+ Sternen, obwohl noch nichts gespeichert ist. Kunde könnte Seite verlassen.

**Lösung:** Text ändern + Auto-Save einbauen:
1. Text ersetzen: "Wählen Sie eine Option, um abzuschliessen"
2. ODER: Bewertung (nur Sterne, ohne Text) sofort bei Phasenwechsel speichern, dann stimmt die Aussage
3. Empfehlung: Option 2 — Sterne sofort speichern (fire-and-forget), Text erst bei Button. Dann stimmt "bereits gespeichert" und kein Rating geht verloren.

### SEC-1 — Rate-Endpoint ohne Auth

**Problem:** `/api/review/[caseId]/rate` hat keine Authentifizierung. Jeder mit einer UUID kann Bewertungen abgeben.

**Lösung:**
1. Token als `authorization` Header oder Query-Parameter mitsenden
2. `validateVerifyToken(caseId, createdAt, token)` im Rate-Endpoint prüfen
3. ReviewSurfaceClient: Token aus URL auslesen, bei jedem `saveReview()` mitsenden

### SEC-2 — Review-Link läuft nie ab

**Problem:** HMAC hat keinen Timestamp → Link ist ewig gültig.

**Lösung:** 90-Tage-Ablauf:
1. `generateVerifyToken()` bekommt optionalen `maxAgeDays` Parameter
2. Server-Side: Prüfe `review_sent_at` + 90 Tage > jetzt
3. Abgelaufener Link → freundliche Meldung "Dieser Link ist leider abgelaufen"

### BUG-1 — deriveReviewStatus: "bewertet" fehlt

**Problem:** Nach Rating zeigt UI "Geöffnet" statt "Bewertet". Es gibt keinen Status `bewertet`.

**Lösung:**
1. Neuen Status `bewertet` hinzufügen (höchste Priorität in der Logik)
2. Check: `review_rating IS NOT NULL` → Status = `bewertet`
3. Sub-Status: `bewertet_positiv` (≥4★) vs `bewertet_negativ` (≤3★)
4. UI: Grüner Haken + Sterne-Anzeige im BewertungEndCap

### FB40 — SMS zu lang / hässlich

**Problem:** Volle Token-URL sprengt 160 Zeichen.

**Lösung:** Short-Token wie bei postCallSms.ts:
1. `generateShortVerifyToken()` statt `generateVerifyToken()` verwenden
2. Kurze URL: `flowsight.ch/r/{caseRef}?t={shortToken}` (ca. 45 Zeichen statt ~100)
3. Neuer Route-Handler: `/r/[caseRef]` → Redirect auf `/review/[caseId]?token=...`

### FB34 — Erledigt-Button Rand-Logik

**Problem:** Erledigt-Button zeigt keinen Bewertungsstatus.

**Lösung (Founder-Design):**

| Zustand | Füllung | Rand |
|---------|---------|------|
| Erledigt, keine Anfrage | Grün | Grün |
| Erledigt, Bewertung angefragt | Grün | Gold |
| Erledigt, Bewertung ≥4★ | Gold | Gold |
| Erledigt, Bewertung ≤3★ | Grün | Rot |

Implementierung: In SystemCard den "Erledigt"-Node um `review_status` erweitern. Rand = `border-2` mit dynamischer Farbe.

### FB35 — Kategorien-Dropdown (Tenant-dynamisch)

**Problem:** Wizard hat dynamische Kategorien pro Tenant, Leitstand hat Freitext-Input.

**Lösung:**
1. `getCustomer(tenantSlug)` im CaseDetailForm → `.categories` Array laden
2. `<select>` Dropdown statt `<input type="text">`
3. Fallback: Freitext-Option "Andere" am Ende der Liste
4. Gleiche Lösung für CreateCaseModal
5. **Voraussetzung:** Tenant-Slug muss im Case-Detail-Context verfügbar sein (über tenant_id → slug Lookup)

### FB38 — Login-Redirect: Ziel-URL bewahren

**Problem:** Auth-Guard leitet auf `/ops/login` ohne `?next=` Parameter.

**Lösung:**
1. `middleware.ts` erweitern: Wenn User nicht eingeloggt + Pfad beginnt mit `/ops` (nicht `/ops/login`) → Redirect auf `/ops/login?next={currentPath}`
2. `LoginForm.tsx` liest `next` Parameter bereits (Zeile 39) → funktioniert sofort
3. Kein Umbau nötig, nur Middleware-Erweiterung

### FB44 — Fehlermeldungen deutsch

**Lösung:** Fehlendes Mapping ergänzen:
```typescript
const MSG: Record<string, string> = {
  case_not_done: "Der Fall muss zuerst als \"Erledigt\" gespeichert werden.",
  no_contact_info: "Keine E-Mail oder Telefonnummer beim Kunden hinterlegt.",
  max_reviews_reached: "Maximale Anzahl Bewertungsanfragen erreicht (2).",
  cooldown_active: "Bitte 7 Tage warten bis zur nächsten Anfrage.",
  review_skipped: "Für diesen Fall wurde keine Bewertung angefragt.",
  review_send_failed: "Bewertungsanfrage konnte nicht gesendet werden.",
};
```

### PUSH-1 — Negativ-Push: eigener Event-Type

**Problem:** `notfall` Event-Type für negative Reviews → Staff mit deaktiviertem Notfall-Push bekommt kein Alert.

**Lösung:** Eigenen Event-Type `negative_review` einführen:
1. In `sendOpsPush.ts` Filter-Logik: `negative_review` → IMMER senden (kein Opt-out, bypass Preferences)
2. In `rate/route.ts`: `eventType: rating <= 3 ? "negative_review" : "review"`
3. Push-Kategorie "Negatives Kundenfeedback" = nicht abschaltbar (business-critical)

### PUSH-2 — Push-Preferences UI

**Problem:** PATCH-Endpoint existiert, aber keine UI. Betrieb kann Preferences nicht ändern.

**Lösung:** Neuer Abschnitt auf Settings-Seite:
```
Benachrichtigungen
─────────────────
🔔 Push-Benachrichtigungen          [Aktiviert ✓]

  Immer aktiv (nicht deaktivierbar):
  • Notfälle
  • Negatives Kundenfeedback
  • Ihnen zugewiesene Fälle

  Optional:
  ○ Positives Kundenfeedback         [An / Aus]
  ○ Alle neuen Fälle                 [An / Aus]
```
Liest/schreibt über PATCH `/api/ops/push/subscribe`.

### PUSH-3 — Zuweisung-Push: nur zugewiesene Person

**Problem:** `notify-assignees` sendet an ALLE Staff mit `notify_assignment=true`, nicht nur an die zugewiesene Person.

**Lösung:** `targetUserId` Parameter in `sendOpsPush()` bereits vorgesehen. Nutzen: nur Subscriptions mit matchendem `user_id` filtern.

### BUG-3 — Double-Submit

**Lösung:** Conditional Update: `WHERE review_rating IS NULL` (nur erstes Rating zählt). Rate-Endpoint: Bei zweitem Submit → `{ ok: true, already_rated: true }` statt Überschreibung.

### BUG-4 — review_surface_opened Deduplizierung

**Lösung:** Vor Insert prüfen: Gibt es bereits ein `review_surface_opened` Event für diesen Case? Wenn ja → kein neues Event.

### BUG-5 — review_sent_count nie inkrementiert

**Lösung:** In `request-review/route.ts` nach erfolgreichem Send:
```sql
UPDATE cases SET review_sent_count = review_sent_count + 1 WHERE id = ?
```

### X2 — faelle Seite: is_deleted Filter

**Lösung:** `.eq("is_deleted", false)` zur Query hinzufügen (wie in cases/page.tsx).

### X3 — "Voice Agent" englisch in E-Mail

**Lösung:** `SOURCE_LABELS` in `resend.ts`: `voice: "Sprachassistent"` statt `"Voice Agent"`.

---

## Implementierungsreihenfolge

### Runde 1 — Blocker (1 PR)

1. `normalizeSwissPhone()` Utility erstellen (`src/lib/phone/normalizeSwissPhone.ts`)
2. FB27: Normalisierung einbauen (CaseDetailForm, sendSmsEcall, request-review)
3. FB36: Neuer Endpunkt `POST /api/ops/cases` mit `resolveTenantScope()`
4. FB41: Stars bei Phasenwechsel auto-speichern (fire-and-forget)
5. SEC-1: Token-Validierung im Rate-Endpoint
6. SEC-2: 90-Tage-Ablauf auf Review-Links
7. BUG-1: `bewertet` / `bewertet_positiv` / `bewertet_negativ` in deriveReviewStatus
8. FB44: Fehlermeldungen deutsch + X3 Voice Agent Label

### Runde 2 — UX (1 PR)

1. FB40: Short-Token SMS-URL + `/r/[caseRef]` Redirect-Route
2. FB34: Erledigt-Button Rand-Logik (SystemCard + FlowBar)
3. FB35: Kategorien-Dropdown (CaseDetailForm + CreateCaseModal)
4. FB38: Middleware Login-Redirect mit `?next=`
5. PUSH-1: Negativ-Push eigener Event-Type `negative_review` (immer aktiv)
6. PUSH-2: Push-Preferences UI auf Settings-Seite
7. PUSH-3: Zuweisung-Push nur an zugewiesene Person
8. BUG-3: Double-Submit Guard (conditional update)
9. BUG-4: review_surface_opened Deduplizierung
10. BUG-5: review_sent_count Inkrement
9. X2: is_deleted Filter auf faelle-Seite

### Runde 3 — Nice to have (optional, separater PR)

1. FB35b: Foto-Upload in CreateCaseModal
2. FB34b: KPI Bewertungen Ø + n in SystemCard

---

## Verification Checklist

### Runde 1 — nach Merge testen:

- [ ] Fall manuell erstellen → erscheint sofort in Fallliste
- [ ] Telefon `076 123 45 67` eingeben → wird zu `+41 76 123 45 67` normalisiert
- [ ] SMS-Bewertungsanfrage mit `076`-Nummer → SMS kommt an
- [ ] Stammkunden-Check: `076...` matcht mit `+41 76...`
- [ ] Review Surface: 4★ klicken → Text sagt NICHT "bereits gespeichert" (oder Sterne sind tatsächlich gespeichert)
- [ ] Rate-Endpoint: Request ohne Token → 401
- [ ] Review-Link nach 90 Tagen → "Link abgelaufen" Meldung
- [ ] Fall bewerten → Status in Leitstand zeigt "Bewertet" (nicht "Geöffnet")
- [ ] Fehlermeldung bei "Nicht anfragen" → deutsch

### Runde 2 — nach Merge testen:

- [ ] SMS-Link kurz und tippbar (< 160 Zeichen gesamt)
- [ ] Erledigt-Button: grün → gold-Rand (angefragt) → gold-voll (positiv) → rot-Rand (negativ)
- [ ] Kategorie-Dropdown zeigt Tenant-spezifische Kategorien
- [ ] E-Mail "Fall öffnen" → Login → landet auf richtigem Fall
- [ ] Negatives Rating → Push kommt auch bei deaktiviertem Notfall-Push
- [ ] Doppelklick auf "Feedback senden" → nur 1 Event im Verlauf
- [ ] Gelöschte Fälle nicht mehr in faelle-Tabelle
