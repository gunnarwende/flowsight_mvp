# Onboarding: Review Engine Only

**Scope:** Google Review Anfrage nach erledigtem Auftrag
**Dauer:** ~5 Min
**Voraussetzung:** Kunde hat bereits Cases im System (Voice oder Wizard)

---

## 1. Google Review URL ermitteln

- Google Maps → Kundenname suchen → "Rezension schreiben" klicken → URL kopieren
- Oder: Google Places API → Place ID → Review-Link generieren

## 2. Vercel Env setzen

| Variable | Wert |
|----------|------|
| `GOOGLE_REVIEW_URL` | Die URL aus Schritt 1 |

Re-deploy auslösen (oder nächster Push).

## 3. Smoke Test

1. Öffne `/ops/cases` → einen Case öffnen
2. Status auf "done" setzen → Speichern
3. "Melder E-Mail" eintragen (falls nicht vorhanden) → Speichern
4. "Review anfragen" Button klicken
5. Prüfe: Review-Email an die Melder-Email angekommen
6. Prüfe: Google Review Link in der Email funktioniert
7. Prüfe: Button zeigt "Review angefragt" (kein Doppel-Send möglich)

---

## Checkliste

- [ ] `GOOGLE_REVIEW_URL` in Vercel Env gesetzt
- [ ] Test-Case auf "done" + Email vorhanden
- [ ] Review-Email gesendet + Link funktioniert
- [ ] Doppel-Send-Schutz verifiziert (Button disabled nach Send)
