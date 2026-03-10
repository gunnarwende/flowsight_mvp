# Einsatzlogik-Engine (G6)

**Erstellt:** 2026-03-09 | **Owner:** CC
**Referenz:** `docs/gtm/operating_model.md`
**Input:** Prospect Card (`prospect_card.json`)
**Output:** Leckerli-Paket + Asset-Liste + Provisioning-Steps

---

## Entscheidungstabelle

### Schritt 1: ICP Score → Tier

| ICP Score (0-10) | Tier | Aktion |
|-------------------|------|--------|
| 9-10 | HOT | → Schritt 2 |
| 7-8 | WARM-HOT | → Schritt 2 |
| 6 | WARM | → Schritt 2 |
| < 6 | COLD | **SKIP** — kein Provisioning |

### Schritt 2: Tier → Leckerli-Paket

| Tier | Leckerli-Paket | Assets |
|------|---------------|--------|
| HOT (9-10) | A+B-Full+C+D | Video + eigener Agent + E2E Proof + Website |
| WARM-HOT (7-8) | A+B-Quick+D | Video + parametrisierte Lisa + Website |
| WARM (6) | B-Quick+D | Parametrisierte Lisa + Website |

### Schritt 2b: Website-Modus bestimmen (NEU seit 10.03.)

| Kriterium | Modus 1: Full | Modus 2: Extend | Modus 3: Pure System |
|-----------|--------------|-----------------|---------------------|
| Eigene Website? | Nein / nur Verzeichnis | Ja, funktional | Ja, stark + gepflegt |
| Website-Qualität | ≤ 3/10 | 4–7/10 | 8+/10 |
| FlowSight liefert | Komplette Website + Voice + Ops | Wizard-CTA + Voice + Ops | Nur Voice + Ops |
| Leckerli D | Volle Demo-Website | Landing/Demo mit Wizard + CTA-Vorschlag | Kein D nötig |
| Botschaft | "Wir digitalisieren deinen Betrieb" | "Wir erweitern dein System" | "Dein unsichtbares Leitsystem" |

**Schnelltest für Founder (5 Sekunden):**
1. Hat der Betrieb eine Website? → NEIN → Modus 1
2. Würdest du dort als Endkunde anfragen? → NEIN → Modus 1, JA aber umständlich → Modus 2, JA → Modus 3

**Beispiele:** Dörfler AG = Modus 1 (keine Website). Weinberger AG = Modus 2 (Website ok, kein Wizard). Betrieb mit perfekter Website + Kontaktformular = Modus 3.

**Encoding:** `"modus": 1|2|3` im `prospect_card.json` → Einsatzlogik liest Modus → passt Leckerli-Paket an.

### Schritt 3: Sonderfälle

| Bedingung | Override |
|-----------|---------|
| Website bereits live (Leuthold, Orlandini, Widmer) | D entfällt → nur fehlende Leckerli |
| Modus 2/3 (starke bestehende Website) | D = Wizard-Landing statt Full Website |
| Kein Notdienst | Demo-Fall = "Anfrage" statt "Notfall" |
| Nur 1 Gewerk (z.B. nur Heizung) | Vereinfachte Lisa (weniger Kategorien) |
| Bestehender Kunde mit Voice | B entfällt → nur fehlende Leckerli |

---

## Asset-Liste pro Paket

### A+B-Full+C+D (Top, ~45 Min)

| # | Asset | Provisioning-Schritt | Zeit |
|---|-------|---------------------|------|
| 1 | `prospect_card.json` | Manuell oder aus Scout | 5 Min |
| 2 | Website (`/kunden/{slug}`) | `prospect_pipeline.mjs` oder manuell | 15 Min |
| 3 | Voice Agent DE + INTL | Template → retell_sync.mjs | 10 Min |
| 4 | Twilio-Nummer | Console oder API | 2 Min |
| 5 | Supabase Tenant | `onboard_tenant.mjs` | 3 Min |
| 6 | E2E Test (Anruf → SMS → Ops) | Manuell | 5 Min |
| 7 | Video (Szenen 1-5) | Founder aufnimmt nach Template | 15 Min |
| 8 | Outreach-E-Mail (Template 1) | Founder sendet | 5 Min |

**Pipeline-Update:** `status=DEMO`, `leckerli_paket=A+B-Full+C+D`, alle Status-Felder

### A+B-Quick+D (Gut, ~20 Min)

| # | Asset | Provisioning-Schritt | Zeit |
|---|-------|---------------------|------|
| 1 | `prospect_card.json` | Manuell oder aus Scout | 5 Min |
| 2 | Website (`/kunden/{slug}`) | `prospect_pipeline.mjs` oder manuell | 15 Min |
| 3 | B-Quick Agent-Variablen | Dynamic Variables setzen | 2 Min |
| 4 | Video (Szenen 1-5) | Founder aufnimmt nach Template | 15 Min |
| 5 | Outreach-E-Mail (Template 2) | Founder sendet | 3 Min |

**Pipeline-Update:** `status=DEMO`, `leckerli_paket=A+B-Quick+D`

### B-Quick+D (Solide, ~12 Min)

| # | Asset | Provisioning-Schritt | Zeit |
|---|-------|---------------------|------|
| 1 | `prospect_card.json` | Manuell oder aus Scout | 3 Min |
| 2 | Website (`/kunden/{slug}`) | `prospect_pipeline.mjs` oder manuell | 15 Min |
| 3 | B-Quick Agent-Variablen | Dynamic Variables setzen | 2 Min |
| 4 | Outreach-E-Mail (Template 3) | Founder sendet | 2 Min |

**Pipeline-Update:** `status=DEMO`, `leckerli_paket=B-Quick+D`

---

## Quick Wins: Bestehende Kunden-Websites

Diese Kunden haben bereits Leckerli D (Website). Nur B + A fehlen:

| Kunde | Slug | Fehlend | Aufwand |
|-------|------|---------|---------|
| Walter Leuthold | walter-leuthold | B-Quick + A (Video) | ~20 Min |
| Orlandini | orlandini | B-Quick + A (Video) | ~20 Min |
| Widmer Sanitär | widmer-sanitaer | B-Quick + A (Video) | ~20 Min |
| Dörfler AG | doerfler-ag | A (Video) + Go-Live | ~15 Min |

**Nach G2 (B-Quick Demo-Agent):** Alle 4 in <2h ergänzbar.

---

## Algorithmische Umsetzung

```
function bestimmeLeckerli(card: ProspectCard): LeckerliPaket {
  // Schritt 1: Score prüfen
  if (card.scoring.icp_score < 6) return { paket: "SKIP", assets: [] };

  // Schritt 2: Tier → Paket
  let paket: string;
  if (card.scoring.icp_score >= 9) {
    paket = "A+B-Full+C+D";
  } else if (card.scoring.icp_score >= 7) {
    paket = "A+B-Quick+D";
  } else {
    paket = "B-Quick+D";
  }

  // Schritt 3: Sonderfälle
  const hatWebsite = card.provisioning_status?.leckerli_d_website === "DONE";
  const hatVoice = card.provisioning_status?.leckerli_b_lisa === "DONE";

  if (hatWebsite) paket = paket.replace("+D", "");
  if (hatVoice) paket = paket.replace("+B-Full", "").replace("+B-Quick", "");

  // Schritt 4: Asset-Liste
  const assets = paketZuAssets(paket);

  // Schritt 5: Demo-Fall
  const demoFall = besteDemoFall(card);

  return { paket, assets, demoFall };
}

function besteDemoFall(card: ProspectCard): string {
  const hatNotdienst = card.emergency?.enabled;
  const hauptGewerk = card.company.gewerke[0];

  if (hauptGewerk === "Sanitär" && hatNotdienst)
    return "Samstag-Nacht-Notfall: Rohrbruch → Lisa → SMS → Ops";
  if (hauptGewerk === "Heizung" && hatNotdienst)
    return "Winter-Notfall: Heizung ausgefallen → Lisa → Sofort-Pikett";
  if (hauptGewerk === "Sanitär")
    return "Montag-Morgen: Tropfender Wasserhahn → Lisa → Termin";
  if (hauptGewerk === "Heizung")
    return "Herbst-Anfrage: Heizungswartung → Lisa → Terminplanung";
  return "Kundenanfrage → Lisa → Strukturierte Aufnahme → Ops";
}
```

> **Hinweis:** Die Einsatzlogik ist aktuell eine Entscheidungstabelle (manuell angewendet). Automatisierung als Script in `scripts/_ops/` erfolgt bei Bedarf (>10 Prospects/Woche). Bis dahin reicht die Tabelle + Provisioning Runbook.

---

## Abhängigkeiten

| Baustein | Status | Blockiert |
|----------|--------|-----------|
| G1 Prospect Card | **DONE** ✅ | — |
| G2 B-Quick Demo-Agent | OFFEN | B-Quick Varianten |
| G3 Provisioning Runbook | **DONE** ✅ | — |
| G4 Video-Template | **DONE** ✅ | — |
| G5 Outreach-Templates | **DONE** ✅ | — |
| G8 Quality Gates | **DONE** ✅ | — |
