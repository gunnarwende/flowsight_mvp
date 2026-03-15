# 11 — Screenshot-Anleitung (Track B)

> Anleitung für Owner: Welche Screenshots wo ablegen, um die Analyse-Basis zu vervollständigen.

---

## Zielordner

```
docs/redesign/leitstand/analyse/aktueller_stand/
```

---

## Benötigte Screenshots

### 1. Puls-Seite (Startseite)

| # | Screenshot | Dateiname | Zustand | Gerät |
|---|-----------|-----------|---------|-------|
| 1.1 | Puls mit Fällen | `puls_desktop.png` | 2-5 Fälle in verschiedenen Gruppen (Achtung, Heute, In Arbeit) | Desktop 1920×1080 |
| 1.2 | Puls komplett leer | `puls_leer_desktop.png` | 0 aktive Fälle ("Alles im Griff") | Desktop |
| 1.3 | Puls mit vielen Fällen | `puls_voll_desktop.png` | 10+ Fälle (scrollen nötig) | Desktop |
| 1.4 | Puls mobile | `puls_mobile.png` | 2-5 Fälle | Mobile (390px) |
| 1.5 | Filter aktiv (Tabelle sichtbar) | `puls_gefiltert_desktop.png` | Status-Filter gesetzt → KPIs + Tabelle | Desktop |

### 2. Fall-Detail

| # | Screenshot | Dateiname | Zustand | Gerät |
|---|-----------|-----------|---------|-------|
| 2.1 | Fall-Detail komplett | `fall_detail_desktop.png` | Fall mit Assignee, Termin, Beschreibung, Timeline | Desktop |
| 2.2 | Scan-Kopf Fokus | `fall_scankopf_desktop.png` | Oberer Bereich: Header + Scan-Kopf (Was/Wo/Wer/Wann) | Desktop |
| 2.3 | Fall ohne Assignee/Termin | `fall_leer_desktop.png` | "Nicht zugewiesen", "Kein Termin" | Desktop |
| 2.4 | Fall status "done" + Review | `fall_done_review_desktop.png` | Review Nachlauf sichtbar | Desktop |
| 2.5 | Fall mobile | `fall_detail_mobile.png` | Gleicher Fall | Mobile |
| 2.6 | Neuer Fall Modal | `neuer_fall_modal.png` | CreateCaseModal offen | Desktop |

### 3. Navigation

| # | Screenshot | Dateiname | Zustand | Gerät |
|---|-----------|-----------|---------|-------|
| 3.1 | Sidebar Desktop | `nav_desktop.png` | Mit Staff (5 Nav-Items sichtbar) | Desktop |
| 3.2 | Sidebar Desktop ohne Staff | `nav_ohne_staff_desktop.png` | Ohne Staff (4 Nav-Items, kein "Mitarbeiter") | Desktop |
| 3.3 | Mobile Header | `nav_mobile_header.png` | Geschlossenes Menü, Tenant-Branding sichtbar | Mobile |
| 3.4 | Mobile Sidebar offen | `nav_mobile_offen.png` | Overlay-Sidebar | Mobile |

### 4. Einsatzplan

| # | Screenshot | Dateiname | Zustand | Gerät |
|---|-----------|-----------|---------|-------|
| 4.1 | Einsatzplan mit Terminen | `einsatzplan_desktop.png` | 2-3 Mitarbeiter, je 2-3 Termine | Desktop |
| 4.2 | Einsatzplan leer | `einsatzplan_leer_desktop.png` | Empty State | Desktop |
| 4.3 | Einsatzplan Woche | `einsatzplan_woche_desktop.png` | Wochen-Toggle aktiv | Desktop |

### 5. Weitere Seiten

| # | Screenshot | Dateiname | Zustand | Gerät |
|---|-----------|-----------|---------|-------|
| 5.1 | Kennzahlen | `kennzahlen_desktop.png` | 8 MetricCards mit Daten | Desktop |
| 5.2 | Mitarbeiter | `mitarbeiter_desktop.png` | 3-5 Mitarbeiter in Tabelle | Desktop |
| 5.3 | Mitarbeiter leer | `mitarbeiter_leer_desktop.png` | Empty State | Desktop |
| 5.4 | Einstellungen | `einstellungen_desktop.png` | Alle Sections | Desktop |

### 6. Spezial-Zustände

| # | Screenshot | Dateiname | Zustand | Gerät |
|---|-----------|-----------|---------|-------|
| 6.1 | Speichern-Feedback | `speichern_feedback.png` | "Gespeichert" grün sichtbar | Desktop |
| 6.2 | Fehler-State | `fehler_state.png` | Rote Fehlermeldung (z.B. Save-Error) | Desktop |
| 6.3 | Review Nachlauf | `review_nachlauf.png` | Review-Badge + Buttons | Desktop |
| 6.4 | Quick-Time Buttons | `quick_time.png` | Termin-Bereich mit Heute/Morgen + Uhrzeiten | Desktop |

---

## Tipps

- **Browser:** Chrome, 1920×1080, Zoom 100%
- **Mobile:** Chrome DevTools → iPhone 14 Pro (393×852) oder echtes Gerät
- **Tenant:** Demo-Tenant mit 5-10 Fällen, verschiedene Status, mindestens 1 Notfall
- **Staff:** Mindestens 2-3 Mitarbeiter in Staff-Tabelle
- **Terminlation:** Mindestens 2-3 Termine für Einsatzplan
- **Format:** PNG, volle Seitenbreite
- **Benennung:** Exakt wie oben (ermöglicht automatische Zuordnung)

---

## Checkliste

- [ ] 1.1–1.5: Puls-Seite (5 Screenshots)
- [ ] 2.1–2.6: Fall-Detail (6 Screenshots)
- [ ] 3.1–3.4: Navigation (4 Screenshots)
- [ ] 4.1–4.3: Einsatzplan (3 Screenshots)
- [ ] 5.1–5.4: Weitere Seiten (4 Screenshots)
- [ ] 6.1–6.4: Spezial-Zustände (4 Screenshots)

**Total: 26 Screenshots**
