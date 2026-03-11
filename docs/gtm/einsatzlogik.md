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
| 8-10 | HOT | → Schritt 2 |
| 6-7 | WARM | → Schritt 2 |
| < 6 | COLD | **SKIP** — kein Provisioning |

### Schritt 2: Tier → Leckerli-Paket

| Tier | Leckerli-Paket | Assets |
|------|---------------|--------|
| HOT (8-10) | A+B-Full+C+D | Video + eigener Agent + E2E Proof + Website |
| WARM (6-7) | B-Full+D | Eigener Agent + Website |

### Schritt 2b: Website-Modus bestimmen

| Kriterium | Modus 1: Full | Modus 2: Extend |
|-----------|--------------|-----------------|
| Eigene Website? | Nein / nur Verzeichnis | Ja, funktional |
| Website-Qualität | ≤ 5/10 | 6+/10 |
| FlowSight liefert | Komplette Website + Voice + Ops | Wizard-CTA + Voice + Ops |
| Leckerli D | Volle Demo-Website | Landing/Demo mit Wizard + CTA-Vorschlag |
| Botschaft | "Wir digitalisieren deinen Betrieb" | "Wir erweitern dein System" |

**Schnelltest für Founder (5 Sekunden):**
1. Hat der Betrieb eine Website? → NEIN → Modus 1
2. Würdest du dort als Endkunde anfragen? → NEIN → Modus 1, JA → Modus 2

**Beispiele:** Dörfler AG = Modus 1 (keine Website). Weinberger AG = Modus 2 (Website ok, kein Wizard).

**Encoding:** `"modus": 1|2` im `prospect_card.json` → Einsatzlogik liest Modus → passt Leckerli-Paket an.

> **Modus 3 (Pure System):** Zurückgestellt. Betriebe mit perfekter Website (8+/10) sind aktuell kein Fokus-ICP. Falls relevant → später definieren.

### Schritt 3: Sonderfälle

| Bedingung | Override |
|-----------|---------|
| Website bereits live (Leuthold, Orlandini, Widmer) | D entfällt → nur fehlende Leckerli |
| Modus 2 (starke bestehende Website) | D = Wizard-Landing statt Full Website |
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

### B-Full+D (WARM, ~35 Min)

| # | Asset | Provisioning-Schritt | Zeit |
|---|-------|---------------------|------|
| 1 | `prospect_card.json` | Manuell oder aus Scout | 5 Min |
| 2 | Website (`/kunden/{slug}`) | `prospect_pipeline.mjs` oder manuell | 15 Min |
| 3 | Voice Agent DE + INTL | Template → retell_sync.mjs | 10 Min |
| 4 | Twilio-Nummer | Console oder API | 2 Min |
| 5 | Supabase Tenant | `onboard_tenant.mjs` | 3 Min |
| 6 | Outreach-E-Mail (Template 2) | Founder sendet | 3 Min |

**Pipeline-Update:** `status=DEMO`, `leckerli_paket=B-Full+D`

---

## Quick Wins: Bestehende Kunden-Websites

Diese Kunden haben bereits Leckerli D (Website). Nur B-Full + A fehlen:

| Kunde | Slug | Fehlend | Aufwand |
|-------|------|---------|---------|
| Walter Leuthold | walter-leuthold | B-Full + A (Video) | ~25 Min |
| Orlandini | orlandini | B-Full + A (Video) | ~25 Min |
| Widmer Sanitär | widmer-sanitaer | B-Full + A (Video) | ~25 Min |
| Dörfler AG | doerfler-ag | A (Video) + Trial Go-Live (Modus 1, persönlich) | ~15 Min |

**Hinweis:** Dörfler AG = erster Trial-Kunde. Persönlicher Start (Founder wohnt um die Ecke). Immer B-Full.

---

## Algorithmische Umsetzung

```
function bestimmeLeckerli(card: ProspectCard): LeckerliPaket {
  // Schritt 1: Score prüfen
  if (card.scoring.icp_score < 6) return { paket: "SKIP", assets: [] };

  // Schritt 2: Tier → Paket (immer B-Full, kein B-Quick)
  let paket: string;
  if (card.scoring.icp_score >= 8) {
    paket = "A+B-Full+C+D";  // HOT
  } else {
    paket = "B-Full+D";       // WARM (6-7)
  }

  // Schritt 3: Sonderfälle
  const hatWebsite = card.provisioning_status?.leckerli_d_website === "DONE";
  const hatVoice = card.provisioning_status?.leckerli_b_lisa === "DONE";

  if (hatWebsite) paket = paket.replace("+D", "");
  if (hatVoice) paket = paket.replace("+B-Full", "");

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
| G2 B-Quick Demo-Agent | **ELIMINIERT** — immer B-Full | — |
| G3 Provisioning Runbook | **DONE** ✅ | — |
| G4 Video-Template | **DONE** ✅ | — |
| G5 Outreach-Templates | **DONE** ✅ | — |
| G8 Quality Gates | **DONE** ✅ | — |
