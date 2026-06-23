# revDSG — Entwürfe (Bearbeitungsverzeichnis · TOMs · Betroffenenrechte)

> **ENTWURF, kein Rechtsrat.** Arbeitsgrundlage für das Modul Compliance.
> Vor Produktiv-Roll-out durch Schweizer Datenschutz-Anwalt prüfen lassen.
> Teil von [Modul Compliance](_index.md) · Recht-Bezug: [Modul Recht](../recht.md).

## 1. Bearbeitungsverzeichnis (Verzeichnis der Bearbeitungstätigkeiten)

| Tätigkeit | Zweck | Betroffene | Datenkategorien | Empfänger (Subprozessor) | Aufbewahrung |
|-----------|-------|-----------|-----------------|--------------------------|--------------|
| **Telefon-Intake (Lisa)** | Anfrage aufnehmen | Endkunden des Betriebs | Name, Telefon, Anliegen, Adresse | Retell (US), Supabase (EU) | siehe data_processing §2 |
| **Web-Intake (Wizard)** | Anfrage aufnehmen | Endkunden | Name, Kontakt, Anliegen, Fotos | Supabase (EU) | 24 Mt / Fotos 12 Mt |
| **Fall-Führung (Leitzentrale)** | Auftrag steuern | Endkunden | Falldaten, Status | Supabase (EU) | 24 Mt |
| **Mail-Versand** | Bestätigung an Kunden | Endkunden | E-Mail, Inhalt | Resend (US) | per Resend |
| **SMS-Versand** | Bestätigung/Termin/Review | Endkunden | Telefon, SMS-Text | eCall.ch (CH) | transactional |
| **Fehler-Monitoring** | Betrieb sicherstellen | — (nur IDs) | tenant_id, case_id, source — **keine PII** | Sentry (US) | 90 Tage |

*Verantwortlicher: FlowSight GmbH. Pro Betrieb ist der Betrieb der Verantwortliche, FlowSight Auftragsbearbeiter — im AVV zu fixieren.*

## 2. TOMs (technisch-organisatorische Massnahmen) — Ist-Stand

- **Zugriff:** Supabase RLS aktiv; Service-Role-Key nur server-seitig; Auth via Magic-Link.
- **Übertragung:** HTTPS überall; keine PII in Logs (Vercel-Logs = strukturierte IDs, 1 h).
- **Aufnahmen:** Recording OFF bei Lisa; keine Audio-Speicherung.
- **PII-Minimierung:** Sentry-Tags nur IDs; WhatsApp-Ops-Alerts ohne PII.
- **Secrets:** Vercel-Env als SSOT; nie im Repo (`99-secrets-policy.md`).
- **Lücke:** Auto-Löschjob (Aufbewahrungsfristen) noch nicht gebaut; Zugriffs-Audit-Log TBD.

## 3. Betroffenenrechte — Verfahren (Endkunden des Betriebs)

Anfrage eines Endkunden (Auskunft / Berichtigung / Löschung) läuft **über den Betrieb** (Verantwortlicher), FlowSight unterstützt als Auftragsbearbeiter.

| Recht | Vorgehen |
|-------|----------|
| **Auskunft** | Fälle des Endkunden via Telefon/Name aus `cases` zusammenstellen (read-only Export). |
| **Berichtigung** | Falsche Felder im Fall korrigieren (Leitzentrale). |
| **Löschung** | Fall(e) + Anhänge des Endkunden löschen — analog Löschverfahren `data_processing.md` §3, aber auf **Endkunden-Ebene** (nicht ganzer Tenant). |
| **Frist** | Ohne Verzug, i. d. R. ≤ 30 Tage. |

**Offen:** Endkunden-Löschung als Self-Service/Script (heute manuell); Identitätsprüfung des Anfragenden definieren.
