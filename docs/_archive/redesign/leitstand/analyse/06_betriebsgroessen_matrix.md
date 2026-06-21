# 06 — Betriebsgrössen-Matrix

> Was ein 2-Mann, 5-10-Mann, 20-30-Mann-Betrieb sieht, braucht und was fehlt.
> Referenz: leitstand.md §2 "Progressive Nutzungstiefe"

---

## Profil-Definitionen

| Profil | Beispiel | Team | Disponentin? | Fälle/Woche | Hauptnutzer |
|--------|---------|------|-------------|-------------|-------------|
| **2-Mann-Meister** | Solo-Sanitär mit Lernender | 1-2 | Nein (Meister = alles) | 3-8 | Meister selbst, Mobile |
| **5-10-Mann** | Dörfler AG, Weinberger AG | 4-8 Techniker + 1-2 Büro | Ja | 10-25 | Disponentin Desktop |
| **20-30-Mann** | Mittlerer Betrieb | 15-25 Techniker + 3-5 Büro | Ja (mehrere) | 30-80 | Disponentin(nen) Desktop |

---

## 1. Navigation (OpsShell)

| Element | 2-Mann | 5-10-Mann | 20-30-Mann |
|---------|--------|-----------|------------|
| **Puls** | ✅ Primär (einzige tägliche Seite) | ✅ Primär (50×/Tag) | ✅ Primär (100×/Tag) |
| **Einsatzplan** | ⚠️ Sichtbar, aber leer (kein Staff) | ✅ Kernfunktion (3-5×/Tag) | ✅ Kernfunktion (10×/Tag) |
| **Einstellungen** | ✅ Initial 1× | ✅ Gelegentlich | ✅ Regelmässig |
| **Kennzahlen** | ⚠️ Irrelevant bei 3-5 Fällen | ⚠️ Ab Monat 2 nützlich | ✅ Wöchentlich relevant |
| **Mitarbeiter** | 🚫 Nicht sichtbar (staffCount=0) | ✅ Sichtbar (Staff vorhanden) | ✅ Sichtbar |

### Analyse

**2-Mann-Meister sieht:** 3 primäre Nav-Items (Puls, Einsatzplan, Einstellungen) + 1 sekundäres (Kennzahlen). Kein "Mitarbeiter".

**Problem:** Einsatzplan ist für 2-Mann-Meister sichtbar aber funktional leer ("Termine erscheinen hier, sobald..."). Das ist kein schwerwiegendes Problem (Empty State ist freundlich), aber 2 von 3 primären Nav-Items sind kaum relevant (Einsatzplan = leer, Einstellungen = einmalig).

**Mögliche Verbesserung:** Einsatzplan nur in Primary Nav wenn `staffCount > 0` (analog Mitarbeiter). Für 2-Mann = nur "Puls" + "Einstellungen" in Primary.

---

## 2. Puls-Ansicht

| Aspekt | 2-Mann | 5-10-Mann | 20-30-Mann |
|--------|--------|-----------|------------|
| **Fälle sichtbar** | 3-8 aktive | 10-25 aktive | 30-80 aktive |
| **Achtung-Gruppe** | 0-1 (selten Notfälle) | 1-3 | 3-8 |
| **Heute-Gruppe** | 1-3 | 3-8 | 5-15 |
| **In Arbeit** | 1-3 | 3-8 | 10-30 |
| **Abschluss** | 0-2 | 2-5 | 5-15 |
| **Scrollen nötig?** | Nein (alles above-fold) | Wahrscheinlich | Ja, definitiv |

### Analyse

**2-Mann:** Puls funktioniert perfekt. 3-8 Fälle = alles auf einen Blick. "Alles im Griff" bei leerem Achtung ist genau die richtige Rückmeldung.

**5-10-Mann:** Puls funktioniert gut. Bei 10-25 aktiven Fällen muss man scrollen, aber die Priorisierung (Achtung zuerst) stellt sicher, dass das Wichtigste sofort sichtbar ist.

**20-30-Mann:** Puls wird lang. 30+ Case-Cards = viel Scrollen. **Hier fehlt:**
- Filterung nach Mitarbeiter ("Zeig mir nur die Fälle von Ramon")
- Collapse/Expand für Gruppen
- Oder: Kapazitäts-Limit pro Gruppe (z.B. max 5 + "3 weitere anzeigen")

### Lücke: Kein Mitarbeiter-Filter im Puls

leitstand.md §2: "15-30 Personen: + Filterlogik nach Mitarbeiter". Im aktuellen Puls gibt es keinen Mitarbeiter-Filter. Die Filter-Bar bietet Status, Dringlichkeit, Quelle — aber nicht Mitarbeiter.

---

## 3. Fall-Detail

| Aspekt | 2-Mann | 5-10-Mann | 20-30-Mann |
|--------|--------|-----------|------------|
| **Scan-Kopf** | ✅ Reicht (Was/Wo/Wann) | ✅ Essential (+ Wer) | ✅ Essential (+ Wer) |
| **Assignee-Dropdown** | ❌ Irrelevant (kein Staff) → Freitext | ✅ Dropdown aus Staff | ✅ Dropdown aus Staff |
| **Quick-Time Buttons** | ✅ Praktisch | ✅ Kernfunktion | ✅ Kernfunktion |
| **"Termin senden"** | ⚠️ Senden an wen? (nur an sich selbst) | ✅ An Techniker + Melder | ✅ An Techniker + Melder |
| **Interne Notizen** | ⚠️ Nur für sich selbst | ✅ Übergabe an Team | ✅ Übergabe an Team |
| **Review Nachlauf** | ✅ Direkt nach Einsatz | ✅ Via Disponentin | ✅ Via Disponentin |

### Analyse

**2-Mann:** Fall-Detail ist fast zu mächtig. Meister braucht: Status ändern, Termin setzen, Erledigt, Review. Die 4-spaltige Form (PLZ/Ort/Strasse/Nr) wirkt überladen wenn man schnell agieren will.

**5-10-Mann:** Fall-Detail ist ideal dimensioniert. Disponentin hat alles was sie braucht.

**20-30-Mann:** Fall-Detail funktioniert, aber **Übergabe-Informationen fehlen:**
- Wer hat diesen Fall zuletzt bearbeitet?
- Welche Notizen hat der vorherige Bearbeiter hinterlassen?
- Timeline zeigt Events, aber nicht "bearbeitet von X"

---

## 4. Einsatzplan

| Aspekt | 2-Mann | 5-10-Mann | 20-30-Mann |
|--------|--------|-----------|------------|
| **Relevanz** | 🚫 Irrelevant (nur 1 Techniker) | ✅ Kern (3-5 Techniker) | ✅ Kern (10-20 Techniker) |
| **Heute-Ansicht** | — | ✅ Morgen-Check | ✅ Morgen-Check |
| **Wochen-Ansicht** | — | ✅ Wochenplanung | ✅ Wochenplanung |
| **Kapazitäts-Check** | — | ⚠️ Visuell (zähle Termine) | ❌ Fehlt (keine Kapazitätsanzeige) |
| **"Wer hat morgen Kapazität?"** | — | ⚠️ Mental (wenige Leute) | ❌ Nicht beantwortbar (keine freien Slots) |

### Lücke: Keine Kapazitätsanzeige

leitstand.md §5.3: "Wer hat morgen noch Kapazität?" ist ein Kernjob. Das aktuelle UI zeigt nur gebuchte Termine, nicht freie Slots. Für 5-10-Mann reicht visuelles Abzählen. Für 20-30-Mann nicht.

---

## 5. Kennzahlen

| Aspekt | 2-Mann | 5-10-Mann | 20-30-Mann |
|--------|--------|-----------|------------|
| **Relevanz** | 🚫 Irrelevant (zu wenig Daten) | ⚠️ Ab Monat 2 | ✅ Wöchentlich |
| **"Total Fälle"** | Bedeutungslos (5) | Nützlich (150+) | Essential |
| **"Ø Bearbeitungszeit"** | Unzuverlässig | Trend-Indikator | Steuerungsinstrument |
| **"Fälle pro Mitarbeiter"** | n/a | ⚠️ Fehlt | ❌ Fehlt |

### Lücke: Keine Mitarbeiter-Aufschlüsselung

leitstand.md §7: "Fälle pro Mitarbeiter (Balken)" — ab 3+ Techniker relevant. Nicht implementiert.

---

## 6. CreateCaseModal (Neuer Fall)

| Aspekt | 2-Mann | 5-10-Mann | 20-30-Mann |
|--------|--------|-----------|------------|
| **Nutzung** | Oft (Meister nimmt Anruf, erfasst selbst) | Mittel (Disponentin erfasst) | Selten (meistens Voice/Wizard) |
| **Kategorien** | ⚠️ Hardcoded 5 Kategorien | ⚠️ Passt evtl. nicht zum Betrieb | ⚠️ Passt evtl. nicht |
| **Pflichtfelder** | OK | OK | OK |

---

## Zusammenfassung: Was fehlt pro Betriebsgrösse

### 2-Mann-Meister
| Was fehlt | Priorität | Schwere |
|-----------|-----------|---------|
| Nichts Kritisches | — | — |
| Nice-to-have: Vereinfachte Ansicht (weniger Felder im Fall-Detail) | Low | Low |
| Nice-to-have: Mobile-First Quick-Actions (Swipe to Done?) | Low | Low |

→ **Fazit: MVP ist gut genug für 2-Mann.**

### 5-10-Mann-Betrieb
| Was fehlt | Priorität | Schwere |
|-----------|-----------|---------|
| Tenant-spezifische Kategorien im CreateCaseModal | Medium | Low |
| Kennzahlen mit Trends (nicht nur Snapshots) | Medium | Medium |
| "Fälle pro Mitarbeiter" in Kennzahlen | Low | Low |

→ **Fazit: MVP funktioniert, Kennzahlen-Trends sind die grösste Lücke.**

### 20-30-Mann-Betrieb
| Was fehlt | Priorität | Schwere |
|-----------|-----------|---------|
| Mitarbeiter-Filter im Puls | High | High |
| Kapazitätsanzeige im Einsatzplan | Medium | Medium |
| Kennzahlen mit Trends + Mitarbeiter-Aufschlüsselung | Medium | Medium |
| Collapse/Expand oder Paginierung im Puls | Medium | Medium |
| Prospect-Nav-Filterung (sieht zu viel) | Medium | Low |

→ **Fazit: Für 20-30-Mann noch nicht Production-Ready. Mitarbeiter-Filter ist der grösste Blocker.**

---

## Progressive Disclosure Status

| Feature | Bedingung | Implementiert? |
|---------|-----------|---------------|
| Mitarbeiter-Nav ausblenden | staffCount === 0 | ✅ |
| Einsatzplan-Nav ausblenden | staffCount === 0 | ❌ (immer sichtbar) |
| Assignee = Dropdown vs Freitext | staffMembers > 0 | ✅ |
| Einsatzplan Empty State | keine Appointments | ✅ |
| Kennzahlen in Sekundär-Nav | immer | ✅ |
| KPIs ausblenden bei Puls | showPuls | ✅ |
| Puls-Gruppen collapsieren wenn leer | immer (ausser Achtung) | ✅ |
