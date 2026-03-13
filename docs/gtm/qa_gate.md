# QA Gate — Proof-Capture-Maschine

**Erstellt:** 2026-03-13 | **Owner:** CC + Founder
**Version:** 1.0
**Referenz:** `machine_manifest.md` (Schritt 9), `prospect_manifest.md` (QA-Block), `quality_gates.md` (bestehende Gates)

---

## Zweck

Dieses Dokument definiert die **9 automatischen + 3 manuellen Checks** die jedes Prospect-Video und -Paket bestehen muss, bevor es versendet wird.

**Goldene Regel:** `ready_to_send = true` nur wenn ALLE 12 Checks PASS.
Kein Prospect geht raus, der das QA-Gate nicht bestanden hat.

### Beziehung zu quality_gates.md

`quality_gates.md` definiert die bestehenden 5 Gates (Prospect Card, Website, Lisa, Video, Outreach) fuer die manuelle Delivery. Dieses Dokument ergaenzt sie um die **automatisierte QA-Pipeline** der Proof-Capture-Maschine. Beide gelten.

---

## Auto-Checks (9 Checks, CC/Automation)

### A1: Firmenname im Video korrekt

| Aspekt | Detail |
|--------|--------|
| **Was** | Lisa sagt den korrekten Firmennamen im Audio |
| **Wie** | Audio-Transkription (Whisper) → String-Match gegen company.legal_name + company.short_name |
| **PASS** | Mindestens 1 Match (legal_name ODER short_name) |
| **FAIL** | Kein Match → Video STOP, Agent pruefen |
| **Prio** | KILL — falscher Firmenname = Vertrauensbruch #1 |

---

### A2: Video-Laenge im Rahmen

| Aspekt | Detail |
|--------|--------|
| **Was** | Gesamtlaenge des assemblierten Videos |
| **Wie** | FFprobe → Dauer in Sekunden |
| **PASS** | Modus 1: 140-170s. Modus 2: 120-150s. (10s Toleranz) |
| **FAIL** | Ausserhalb Toleranz → Assembly-Parameter pruefen |
| **Prio** | BLOCK — zu lang wird nicht geschaut, zu kurz fehlt Beweis |

---

### A3: Alle Assets vorhanden

| Aspekt | Detail |
|--------|--------|
| **Was** | Alle Required-Assets im Prospect Manifest sind befuellt |
| **Wie** | JSON-Validierung gegen Asset-Schema |
| **PASS** | Alle folgenden nicht-null: website_capture, lisa_call_audio, sms_proof, leitstand_capture, start_page_capture, video_raw |
| **FAIL** | Mindestens 1 Required-Asset fehlt → Pipeline-Schritt wiederholen |
| **Prio** | BLOCK — fehlendes Asset = fehlendes Beweis-Element |

---

### A4: Testnummer funktioniert

| Aspekt | Detail |
|--------|--------|
| **Was** | Anruf auf provisioning.twilio_number → Lisa antwortet |
| **Wie** | Retell API: Create Call → Warte auf Greeting → Verify |
| **PASS** | Call Status = "ended" (nicht "error"), Dauer > 5s |
| **FAIL** | Anruf fehlgeschlagen → Routing/Agent pruefen |
| **Prio** | KILL — wenn die Testnummer im Video nicht funktioniert, ist alles kaputt |

---

### A5: SMS-Zustellung verifiziert

| Aspekt | Detail |
|--------|--------|
| **Was** | Nach Testanruf kommt SMS an |
| **Wie** | Twilio Message Log: Filter by twilio_number, letzte 5 Min |
| **PASS** | Mindestens 1 SMS mit status "delivered" |
| **FAIL** | Keine SMS oder status "failed" → SMS-Config pruefen |
| **Prio** | BLOCK — SMS ist zentrales Beweis-Element |

---

### A6: Website/Start-Seite erreichbar

| Aspekt | Detail |
|--------|--------|
| **Was** | Die im Video gezeigte URL ist erreichbar |
| **Wie** | HTTP GET auf start_url (M2) oder kunden_url (M1) → Status 200 |
| **PASS** | HTTP 200, Response < 3s |
| **FAIL** | HTTP != 200 oder Timeout → Deploy pruefen |
| **Prio** | BLOCK — toter Link = sofortiger Vertrauensverlust |

---

### A7: Leitstand zeigt Case

| Aspekt | Detail |
|--------|--------|
| **Was** | Nach Testanruf erscheint ein Case im Leitstand |
| **Wie** | Supabase Query: cases WHERE tenant_id = X, created_at > (jetzt - 5 Min) |
| **PASS** | Mindestens 1 Case mit korrekter Kategorie und PLZ |
| **FAIL** | Kein Case → Webhook/DB pruefen |
| **Prio** | BLOCK — Leitstand-Beweis ist Kernszene im Video |

---

### A8: Outreach-Felder vollstaendig

| Aspekt | Detail |
|--------|--------|
| **Was** | Alle Required-Felder im Outreach-Block sind gesetzt |
| **Wie** | JSON-Validierung gegen prospect_manifest Gate 2 |
| **PASS** | anrede, prospect_email (nicht info@), region_reference, video_hook, demo_scenario komplett |
| **FAIL** | Feld fehlt oder invalid → Analyse-Schritt wiederholen |
| **Prio** | BLOCK — ohne Outreach-Felder kann E-Mail nicht personalisiert werden |

---

### A9: Keine PII-Leaks

| Aspekt | Detail |
|--------|--------|
| **Was** | Kein fremder Firmenname in Video-Assets sichtbar |
| **Wie** | OCR auf alle Screenshots → String-Match gegen ALLE anderen Prospect-Namen |
| **PASS** | 0 Treffer fuer fremde Firmennamen |
| **FAIL** | Fremder Name sichtbar → Screenshot neu erstellen (Browser-Tabs pruefen!) |
| **Prio** | KILL — PII-Leak = Vertrauensbruch #4 (Datenschutz) |

**Hinweis:** A9 ist der teuerste Check (OCR). Kann initial manuell geprueft werden, Automation als S5.6-Ziel.

---

## Manual-Checks (3 Checks, Founder)

### M1: Founder-Wuerde-Test

| Aspekt | Detail |
|--------|--------|
| **Was** | "Wuerde ich das diesem Prospect mit gutem Gewissen schicken?" |
| **Wie** | Founder schaut Video komplett, auf Handy (nicht Desktop) |
| **PASS** | Ja, ohne Zoegern |
| **FAIL** | Jedes Zoegern = FAIL → konkret benennen was stoert |
| **Prio** | KILL — das wichtigste Gate ueberhaupt |

### M2: Audio-Qualitaet

| Aspekt | Detail |
|--------|--------|
| **Was** | Founder-Narration und Lisa-Audio sind klar und professionell |
| **Wie** | Founder hoert mit Kopfhoerern |
| **PASS** | Kein Rauschen, kein Echo, kein Hall, kein "aeh", Stimme klar |
| **FAIL** | Audio-Problem → Narration oder Anruf wiederholen |
| **Prio** | KILL — schlechter Ton = "unprofessionell" |

### M3: Spiegel-Effekt

| Aspekt | Detail |
|--------|--------|
| **Was** | Der Prospect wuerde innerhalb von 10 Sekunden denken: "Das ist ja MEIN Betrieb" |
| **Wie** | Founder versetzt sich in den Prospect und prueft |
| **PASS** | Firmenname, Region, Gewerk, Farben — alles stimmt |
| **FAIL** | Generisches Element sichtbar → Asset ersetzen |
| **Prio** | KILL — ohne Spiegel-Effekt kein Gold Contact |

---

## QA-Ablauf

### Reihenfolge

```
1. Auto-Checks laufen (A1-A9)                        ~5 Min
   ├→ Alle PASS → weiter zu Manual
   └→ FAIL → Pipeline-Schritt wiederholen, dann erneut
2. Founder Manual-Checks (M1-M3)                      ~3 Min
   ├→ Alle PASS → ready_to_send = true
   └→ FAIL → Konkretes Problem benennen → CC fixt → erneut ab 1.
```

### Batch-QA (10 Prospects)

| Phase | Dauer | Wer |
|-------|-------|-----|
| Auto-Checks (alle 10) | ~15 Min (parallel) | CC/Automation |
| Founder-Review (alle 10) | ~30 Min (3 Min/Video) | Founder |
| Fixes (durchschnittlich 2 Retakes) | ~20 Min | CC |
| Re-QA Fixes | ~10 Min | CC + Founder |
| **Total** | **~75 Min** | |

---

## Prospect Manifest QA-Block

Nach QA wird der QA-Block im Prospect Manifest befuellt:

```json
{
  "qa": {
    "smoke_test": "PASS",
    "auto_checks_passed": 9,
    "auto_checks_total": 9,
    "manual_checks_passed": 3,
    "manual_checks_total": 3,
    "ready_to_send": true,
    "qa_completed_at": "2026-04-11T08:00:00Z",
    "notes": null
  }
}
```

### Fehlschlag-Dokumentation

Bei FAIL wird `notes` befuellt:

```json
{
  "qa": {
    "smoke_test": "FAIL",
    "auto_checks_passed": 7,
    "auto_checks_total": 9,
    "manual_checks_passed": 0,
    "manual_checks_total": 3,
    "ready_to_send": false,
    "qa_completed_at": null,
    "notes": "A4 FAIL: Testnummer +41435051101 keine Antwort (Agent unpublished). A9 SKIP: OCR nicht gelaufen."
  }
}
```

---

## Automatisierungs-Roadmap

| Check | Phase 1 (Maschinenstart) | Phase 2 (Skalierung) |
|-------|------------------------|---------------------|
| A1: Firmenname | Manuell (Founder hoert) | Whisper + String-Match |
| A2: Video-Laenge | FFprobe (sofort) | FFprobe (sofort) |
| A3: Assets vorhanden | JSON-Check (sofort) | JSON-Check (sofort) |
| A4: Testnummer | Manueller Anruf | Retell API Call |
| A5: SMS-Zustellung | Twilio Log Check | Twilio API (sofort) |
| A6: URL erreichbar | curl/fetch (sofort) | curl/fetch (sofort) |
| A7: Case im Leitstand | Supabase Query (sofort) | Supabase Query (sofort) |
| A8: Outreach-Felder | JSON-Check (sofort) | JSON-Check (sofort) |
| A9: PII-Leaks | Manuell (Founder prueft) | OCR + String-Match |
| M1: Wuerde-Test | Founder (immer) | Founder (immer, nicht delegierbar) |
| M2: Audio-Qualitaet | Founder (immer) | Founder (immer) |
| M3: Spiegel-Effekt | Founder (immer) | Founder (immer) |

**Phase 1:** 5 von 9 Auto-Checks sofort automatisierbar (A2, A3, A6, A7, A8).
Restliche 4 (A1, A4, A5, A9) werden manuell geprueft.

**Phase 2 (ab ~Prospect 20):** Alle 9 Auto-Checks automatisiert. Manual-Checks bleiben Founder-Aufgabe.

---

## Referenzen

- **Machine Manifest:** `docs/gtm/machine_manifest.md` (Schritt 9)
- **Prospect Manifest:** `docs/architecture/contracts/prospect_manifest.md` (QA-Block Schema)
- **Quality Gates (bestehend):** `docs/gtm/quality_gates.md` (Gate 1-5, gelten weiterhin)
- **Gold Contact:** `docs/gtm/gold_contact.md` (Nordstern, Abbruchkriterium)
- **Plan S5:** `docs/redesign/plan.md` (§ S5.6)
