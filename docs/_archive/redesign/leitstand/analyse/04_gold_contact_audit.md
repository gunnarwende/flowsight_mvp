# 04 — Gold-Contact Audit

> leitstand.md (Zielbild) §-für-§ gegen Code-Realität.
> ✅ = erfüllt, ⚠️ = teilweise, ❌ = nicht erfüllt, 🔜 = bewusst vertagt

---

## §1 Executive Summary

| Anforderung | Status | Evidenz |
|-------------|--------|---------|
| "Fallzentrierte Betriebssteuerung" | ✅ | Cases als zentrales Atom, alle Seiten referenzieren Cases |
| "Kein CRM, kein Kalender, kein ERP" | ✅ | Keine dieser Funktionen implementiert |
| "OPS ist die Oberfläche, in der der Wert sichtbar wird" | ✅ | 6 funktionale Seiten, keine Platzhalter |

---

## §2 Produktthese

### Fallzentrierung
| Anforderung | Status | Evidenz |
|-------------|--------|---------|
| "Zentrales Atom = der Fall" | ✅ | `cases` Tabelle, Case ID überall, alle Seiten referenzieren Cases |
| Lebenszyklus: Eingang → Triage → Termin → Einsatz → Abschluss → Review | ✅ | Status: new → contacted → scheduled → done + Review Nachlauf |

### Progressive Nutzungstiefe
| Anforderung | Status | Evidenz |
|-------------|--------|---------|
| "2-3 Personen: Puls, Fall, Basistermine, Review" | ✅ | Alles funktional, Puls als Startseite |
| "5-8 Personen: + Mitarbeiterzuweisung, + Einsatzplan" | ✅ | Staff-Tabelle, Assignee-Dropdown, ScheduleView |
| "15-30 Personen: + Zahlen/Trends, + Filterlogik" | ⚠️ | MetricsView vorhanden, aber nur Snapshot-Zahlen, keine Trends |
| "Ein 2-Mann-Betrieb ohne Staff sieht keinen Einsatzplan" | ⚠️ | Einsatzplan sichtbar in Nav, aber leer. Mitarbeiter-Nav nur wenn staffCount > 0. Einsatzplan-Nav bleibt immer. |

---

## §3 Goldstandard-Anspruch

| Anforderung | Status | Evidenz |
|-------------|--------|---------|
| "OPS denkt vor" — überfällige steigen nach oben | ✅ | Puls "Achtung": Notfälle + stuck >48h |
| "OPS fühlt sich an wie meins" — Tenant-Branding | ✅ | Sidebar: Tenant-Initialen + Name + brandColor. Tab-Titel: "{shortName} Leitstand" |
| "Keine Bald-Platzhalter" | ✅ | Alle 6 Seiten funktional |
| "10 Sekunden, weiss was ihr Tag ist" | ✅ | Puls ist First-View, 4 priorisierte Gruppen |
| "Dashboard das zählt statt steuert = nicht akzeptabel" | ✅ | KPI-Karten bei Puls-View ausgeblendet, Puls = Handlungsimpulse |
| "FlowSight im Tab = nicht akzeptabel" | ✅ | Tab = "{shortName} Leitstand" via title.absolute |

---

## §4 Rollenmodell

| Rolle | Anforderung | Status | Evidenz |
|-------|-------------|--------|---------|
| Disponentin | "Voll: Puls, Fall, Einsatzplan, Einstellungen" | ✅ | Alle Bereiche zugänglich |
| Meister/Inhaber | "Voll: + Zahlen" | ✅ | MetricsView vorhanden |
| Techniker | "Kein OPS-Login, Micro-Surface via SMS-Link" | 🔜 | `/einsatz/[token]` nicht implementiert — bewusst vertagt |
| Prospect | "Reduziert: Puls read-only, Fall nur Status" | ✅ | `isProspect` check in CaseDetailForm + CaseDetailPage |
| Prospect | "Einsatzplan nicht sichtbar" | ❌ | Nav zeigt Einsatzplan auch für Prospects (kein isProspect-Check in Nav) |
| Prospect | "Zahlen nicht sichtbar" | ❌ | Nav zeigt Kennzahlen auch für Prospects |
| Prospect | "Einstellungen nicht sichtbar" | ❌ | Nav zeigt Einstellungen auch für Prospects |
| Melder | "Kein Login, Micro-Surface via SMS-Link" | 🔜 | `/meldung/[token]` nicht implementiert |

---

## §5 Bereichsmodell

### §5.1 Der Puls

| Anforderung | Status | Evidenz |
|-------------|--------|---------|
| "Priorisierte Handlungsliste" | ✅ | 4 Gruppen: Achtung, Heute, In Arbeit, Abschluss |
| "Morgens: Was über Nacht reingekommen?" | ✅ | "Heute" zeigt neue Fälle von heute + status "new" |
| "Abends: Ist alles versorgt?" | ✅ | "Achtung" leer = "Alles im Griff" |
| Informationshierarchie: Achtung → Heute → In Arbeit → Abschluss | ✅ | Exakt diese Reihenfolge in groupCases() |
| "Achtung: Notfälle + Überfällige > 24h" | ⚠️ | Code: > 48h (nicht 24h wie im Zielbild). Bewusste Abweichung (Renovation) |
| "Abschluss: Erledigte ohne Review-Anfrage" | ⚠️ | Code: Erledigte < 7 Tage. Review-Status wird als "R" Badge gezeigt, aber Abschluss-Filter ist zeitbasiert, nicht review-basiert |
| "Nicht: Charts, Trends" | ✅ | Keine Charts im Puls |
| KPI-Karten ersetzen → Puls-Header-Badges | ✅ | KPIs hidden bei Puls-View. Counts in Puls-Group-Headers |

### §5.2 Der Fall

| Anforderung | Status | Evidenz |
|-------------|--------|---------|
| "Alles zu einem Fall an einem Ort" | ✅ | Two-Column Layout: Form + Kontakt + Timeline + Anhänge |
| Scan-Kopf: Was? Wo? Wie dringend? Wer? Wann? | ✅ | Scan-Kopf Block mit Was/Wo/Wer/Wann (Urgency im Header-Dot) |
| "Mitte: Termin-Abschnitt als eigener Block" | ⚠️ | Termin ist Formularfeld (datetime-local) mit Quick-Buttons, nicht eigenständiger Block |
| "Timeline/Verlauf" | ✅ | CaseTimeline mit Events + Next-Step Hint |
| "Kontaktdaten rollenbasiert (nicht für Prospects)" | ✅ | `{!isProspect && <Contact>}` |
| "Anhänge rollenbasiert" | ✅ | `{!isProspect && <AttachmentsSection>}` |

### §5.3 Der Einsatzplan

| Anforderung | Status | Evidenz |
|-------------|--------|---------|
| "Cross-Case Tages-/Wochenansicht, gruppiert nach Mitarbeiter" | ✅ | byStaff Map, today/week Toggle |
| "Liste, kein Kalender-Widget" | ✅ | Listenform |
| Zeilen: "Name, Adresse, Problemkategorie" | ✅ | category, reporter_name, street/PLZ/city via JOIN |
| "● bestätigt, ○ vorgeschlagen" | ❌ | Nur Status-Badges (Geplant/Bestätigt/Erledigt/Abgesagt), keine ●/○ Notation |
| "Tap auf Eintrag → öffnet den Fall" | ✅ | "Fall →" Link pro Zeile |
| "Kein Drag-and-Drop" | ✅ | Nicht implementiert (korrekt) |
| "Voraussetzung: staff + appointments Tabellen" | ✅ | Beide existieren |
| "Ohne Staff: Bereich leer/unsichtbar" | ⚠️ | Bereich in Nav immer sichtbar, zeigt Empty-State. Nicht unsichtbar. |

### §5.4 Die Zahlen

| Anforderung | Status | Evidenz |
|-------------|--------|---------|
| "Wochen-/Monatstrends, Reflexion" | ⚠️ | 8 MetricCards als Snapshots, KEINE Trends/Pfeile/Charts |
| "Max 8 Kennzahlen, eine Seite" | ✅ | Exakt 8 Karten |
| "Fälle pro Woche (Balken, 8 Wochen)" | ❌ | Nur Total-Zahl, kein Wochen-Chart |
| "Reaktionszeit (Median)" | ⚠️ | "Ø Bearbeitungszeit" (Durchschnitt, nicht Median) |
| "Review-Quote + Durchschnittsbewertung" | ❌ | Nicht in MetricsView |
| "Nicht: Echtzeit-Zähler" | ✅ | Client-Fetch, kein Realtime |
| "Sekundär, nicht Day-1-Pflicht" | ✅ | In Sekundär-Nav |

### §5.5 Einstellungen

| Anforderung | Status | Evidenz |
|-------------|--------|---------|
| "Mitarbeiter anlegen/bearbeiten/deaktivieren" | ✅ | StaffManager (eigene Seite) |
| "Standard-Termindauern pro Typ" | ⚠️ | Ein Wert (default_appointment_duration_min), nicht pro Typ |
| "Melder-Benachrichtigungen (an/aus, Kanal)" | ✅ | Zwei Toggles (E-Mail, SMS) |
| "Business-Kalender-E-Mail" | ✅ | Input vorhanden |
| "Google-Review-Link" | ✅ | Input vorhanden |
| "Firmendaten (für Branding)" | ⚠️ | Read-only Anzeige (Name, Prefix), nicht editierbar |

### §5.6 Micro-Surfaces

| Anforderung | Status | Evidenz |
|-------------|--------|---------|
| "Techniker-Surface `/einsatz/[token]`" | 🔜 | Nicht implementiert (bewusst vertagt) |
| "Melder-Surface `/meldung/[token]`" | 🔜 | Nicht implementiert (bewusst vertagt) |

---

## §6 Termin-/Kalenderlogik

| Anforderung | Status | Evidenz |
|-------------|--------|---------|
| "Appointments = eigene Tabelle" | ✅ | `appointments` Table existiert |
| "Termin-Statusmodell: vorgeschlagen → bestätigt → durchgeführt / abgesagt" | ⚠️ | Feld `status` existiert, aber UI zeigt nur scheduled/confirmed/completed/cancelled (andere Begriffe) |
| "ICS mit stabiler UID + SEQUENCE + CANCEL" | ⚠️ | ICS wird versendet, aber UID-Stabilität + SEQUENCE + CANCEL nicht im Code verifiziert |
| "SUMMARY: [Firma] Einsatz - Adresse" | ❌ | Nicht im Frontend prüfbar (Backend ICS-Builder) |
| "Empfängermatrix: Techniker + Büro + Melder" | ⚠️ | "Termin senden" Button existiert, Empfängerlogik im Backend |
| "24h Reminder an Melder" | ❌ | Keine Reminder-Logik im Frontend sichtbar |
| "Case-Status-Kopplung" | ⚠️ | Manuell (User setzt Status), nicht automatisch bei Appointment-Status-Wechsel |

---

## §7 KPIs / Zahlen / Steuerung

| Anforderung | Status | Evidenz |
|-------------|--------|---------|
| "Operativ: Keine Zähler, sondern Handlungsimpulse" | ✅ | Puls = Gruppen mit Fällen, keine Zähler als Hauptelement |
| "Reflektiv: Trends, nicht Snapshots" | ❌ | MetricsView = 8 Snapshot-Zahlen ohne Trends/Pfeile |
| "Max 8 Kennzahlen" | ✅ | Exakt 8 |
| "Anti-BI-Drift: keine Drill-Downs" | ✅ | Keine Drill-Downs, keine Pivots |

---

## §8 Branding / Identität / Spiegel-Effekt

| Anforderung | Status | Evidenz |
|-------------|--------|---------|
| "FlowSight unsichtbare Infrastruktur" | ✅ | Kein "FlowSight" in sichtbaren UI-Elementen |
| "Sidebar-Logo: Tenant-Initialen + Name" | ✅ | `initials + displayName` |
| "Case-IDs: [Prefix]-0001" | ✅ | `formatCaseId(seq_number, caseIdPrefix)` |
| "Browser-Tab: [Firma] OPS" | ✅ | `{shortName} Leitstand` (via generateMetadata) |
| "ICS-Betreff: [Firma] Einsatz - Adresse" | ❌ | Nicht im Frontend prüfbar |
| "E-Mail-Absender: [Firma] via FlowSight" | ✅ | Im Email-System (E4) |
| "Footer-Kontakt: Weg" | ✅ | Kein Founder-Kontakt sichtbar |
| "Sprache: Fall statt Ticket, Puls statt Dashboard" | ✅ | Konsistent durchgezogen |

---

## §9 Produktgrenzen / Anti-Drift

| Test | Status | Evidenz |
|------|--------|---------|
| "Feature-Test: Unterstützt es Fall-Lebenszyklus?" | ✅ | Alle Features dienen dem Lebenszyklus |
| "Keine CRM-Funktionen" | ✅ | Kein Kundenstamm |
| "Keine Buchhaltung" | ✅ | Keine Finanzdaten |
| "Kein Chat / Messaging" | ✅ | Nicht implementiert |
| "Keine Native App" | ✅ | PWA-basiert (Web only) |

---

## §10 Architektur- und Umsetzungsfolgen

| Entscheidung | Status | Evidenz |
|-------------|--------|---------|
| "Appointments = eigene Tabelle" | ✅ | Migration vorhanden |
| "Staff = eigene Tabelle" | ✅ | Migration vorhanden |
| "ICS = Integrationslayer" | ✅ | ICS-Versand funktional |
| "Tenant-Branding maschinell" | ✅ | resolveTenantIdentity() |
| "Tenant-Isolation" | ✅ | resolveTenantScope() |
| "Rollenbasierte Sichtbarkeit" | ⚠️ | CaseDetailForm ja, Nav nein |
| "Puls ersetzt KPI+Tabelle" | ✅ | hiddenByPuls Pattern |
| "Keine Bald-Nav-Punkte" | ✅ | Alle Nav-Ziele funktional |

---

## Zusammenfassung

| Bewertung | Anzahl |
|-----------|--------|
| ✅ Erfüllt | 38 |
| ⚠️ Teilweise | 14 |
| ❌ Nicht erfüllt | 7 |
| 🔜 Bewusst vertagt | 3 |

**Top-Lücken:**
1. Prospect-Sichtbarkeit in Nav (sieht Einsatzplan, Kennzahlen, Einstellungen)
2. Kennzahlen ohne Trends (nur Snapshots)
3. Überfällig-Schwelle 48h statt 24h
4. Termin-Statusmodell nicht komplett durchgekoppelt
5. Micro-Surfaces nicht implementiert (vertagt)
