# Website-Entscheidung FINAL (14.04.2026)

**Status:** ENTSCHIEDEN. Keine weitere Diskussion.

---

## Produktgrenze (intern)

FlowSight = Voice + Wizard + Leitzentrale + Reviews + SMS.

Website ist KEIN Bestandteil des Produkts.
Website ist KEIN Bestandteil des Machine Manifests.
Website ist KEIN Bestandteil der Provisioning-Pipeline.

Wizard-Einstieg fuer alle Betriebe: `/start/[slug]`

## Fallback-Kriterien (wann DOCH eine Basis-Website)

NUR wenn ALLE folgenden Bedingungen zutreffen:
1. Betrieb hat KEINE Website ODER Website ist kaputt (SSL, mobil unbrauchbar)
2. Kein sinnvoller Kontakt-/CTA-Pfad vorhanden
3. Vertrauen wird durch aktuelle Web-Praesenz aktiv beschaedigt
4. Betrieb FRAGT danach (FlowSight bietet NICHT an)

Fallback = Legacy-Template (page.tsx ohne Profil-System). 1 Template, minimal angepasst. Kein High-End-Versprechen. Kein Differenzierungsanspruch. Pragmatisch.

## Kommunikation (extern / GTM)

"FlowSight ist das Leitsystem fuer Ihren Betrieb. Wir sorgen dafuer, dass kein Anruf verloren geht, jeder Fall strukturiert erfasst wird, und gute Arbeit in Bewertungen muendet. Ihre bestehende Website bleibt wie sie ist — wir integrieren uns nahtlos."

## Was archiviert wird

- `app/kunden/[slug]/layouts/` → ARCHIVIERT (LayoutEditorial, LayoutKompakt, LayoutSystematisch bleiben im Code, werden nicht mehr weiterentwickelt)
- `docs/gtm/website/` → Alle Analyse-Dokumente bleiben als Entscheidungshistorie
- `generate_hero_images.mjs` → ARCHIVIERT
- Theme-System in types.ts → BLEIBT (backwards-compatible, bestehende Sites nutzen es)
- Bestehende 7 CustomerSite-Configs → BLEIBEN als Legacy

## Was NICHT mehr passiert

- Keine neuen Website-Layouts
- Keine neuen Theme-Profile
- Keine Banana-Hero-Generierung fuer Kunden-Websites
- Keine CSS-Handschrift-Differenzierung
- Keine Website-Proof-Iterationen
- Keine Modul-1 vs. Modul-2 Diskussion (Modul 2 = 100%)

## Datengrundlage

ICP-Analyse 42 Betriebe Kanton Zuerich:
- 71% brauchen keine Website (Modul 2)
- 12% Grenzfall (schwache Website, /start reicht)
- 12% Fallback (kaputt/fehlend)
- 5% disqualifiziert

Details: `docs/gtm/website/icp_analyse_42_betriebe.md`
