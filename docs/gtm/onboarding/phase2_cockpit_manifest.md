# Phase 2 — Cockpit · Integrations-Manifest (Anti-Ping-Pong-Vertrag)

> **Zweck:** Die vollständige Liste dessen, was das Cockpit **erfassen/bestätigen** muss, damit ein
> Betrieb mit **null Founder-Rückfragen** live geht. Rückwärts designt: nicht „welche Frage wäre
> nett", sondern „was braucht die Integration als Input". Geerdet am echten Dörfler-Schema
> (`docs/customers/doerfler-ag/tenant_config.json` + `founder_review.md`).
>
> Teil der **Onboarding-Bible** (Phase 2). Das ist die **Inhalts-Spec des Cockpits** — die Screens
> (nächster Schritt) bilden genau dieses Manifest ab.

## Legende
- ✅ **vorbefüllt** aus `tenant_config.json` (Crawl/Derive) → Cockpit = **bestätigen/feilen** (leicht, „confirm-not-create")
- 🆕 **neu im Cockpit** — kein Crawl weiß das → **der echte Erfassungs-Job**
- 📞 **Kunden-Aktion** (Next-Steps-Karte, kein Formularfeld)
- 🔧 **Founder/System** (Backend, unsichtbar)
- ⚠️ **Backend fehlt heute** → Bau nötig (Phase-2 #4)

---

## STRANG 1 — VOICE (Lisa) · der größte

### 1a · Identität & Eröffnung
| Feld | Quelle | Pflicht | Cockpit-Interaktion |
|---|:--:|:--:|---|
| `company_name` (Dörfler AG) | ✅ | ✓ | bestätigen |
| **Greeting-Wortlaut + KI-Hinweis** | 🆕 | ✓ | aus Vorschlag wählen + editieren; revDSG-Mindesthinweis menschlich daneben |
| `domain`/Scope (Sanitär + Heizung) | ✅ | ✓ | bestätigen |
| Stimme DE (Ela) + INTL (Juniper) / Sprachen | ✅ default | ✓ | Sprachen an/aus bestätigen |

### 1b · Wissen (Info-Antworten) — fast alles ✅ → **ein „Das sagt Ihre Lisa"-Bestätigungs-Screen** (= `founder_review` §4)
`opening_hours(_spoken)` · `service_area(_spoken)` · `address(_spoken)` · `services_list` · `memberships` · `emergency_policy` · `price_deflect` · `jobs_spoken` · `phone`/`email`/`website` · `google_rating` — **alle ✅ vorbefüllt**, er liest + korrigiert. (Das ist der Großteil des Strangs und reine Bestätigung.)

### 1c · Dispositionen (was Lisa TUT) — 🆕 der sensible Kern · ⚠️ Routing-Backend fehlt heute
> Heute: **jeder Call → Fall** (keine serverseitige Klassifikation außer BigBen). Für echte Trennung: Agent sendet `call_type` + Webhook verzweigt + `pub_callback_requests`→generisch `tenant_callbacks`.

| Disposition | heute | Cockpit (Szenario-Karte, er reagiert) |
|---|:--:|---|
| **D1 neuer Auftrag** (Notfall/dringend/normal) | ✅ funktioniert | Kategorien ✅ bestätigen; Urgency-Logik bestätigen |
| **D2 Info-Anfrage** | ⚠️ wird heute trotzdem Fall | „Info-Anrufe als Fall führen — ja/nein?" |
| **D3 Rückruf / Lieferant / „Chef sprechen"** | ⚠️ wird Fall | „Notiz + Rückruf-Flag" vs „normaler Fall"? |
| **D4 Nachfrage zu best. Auftrag** | ⚠️ wird Fall | „Nachricht aufnehmen + an wen?" |
| **D5 Reklamation** | ✅ Fall + Urgency hoch | „Wer wird sofort alarmiert?" 🆕 |
| **D6 privat / Familie / Spam** | ⚠️ evtl. Mini-Fall | „garantiert kein Fall" bestätigen |
| **D7 Live-Transfer an Mensch** | ❌ existiert nicht | **MVP raus** (Flow-Bau + `is_transfer_cf`-Risiko) |

### 1d · Erreichbarkeit & Notfall
| Feld | Quelle | Cockpit |
|---|:--:|---|
| **Pickup** (sofort / nach X Sek / nie) | 📞 | Wahl → **erzeugt Weiterleitungs-Anweisung** (Next-Step, kein Lisa-Setting!) |
| Notfall-Keywords | ✅ | bestätigen |
| **Notfall-Alarmierung** (wer, wie: Push/Anruf) | 🆕 | wählen |

---

## STRANG 2 — WEBSITE / WIZARD · leicht (idealer Quick-Win)
| Feld | Quelle | Pflicht | Cockpit |
|---|:--:|:--:|---|
| `wizard.categories[]` (3 custom + 3 fix) | ✅ | ✓ | bestätigen/editieren |
| `brand_color` (#2b6cb0) | ✅ | ✓ | bestätigen |
| **Verteilung** (GBP-Button / Link / Embed / Subdomain / Agentur-Mail) | 📞 | ✓ (1 Weg) | self-select Next-Step |
| altes Web-Formular ersetzen? | 🆕 | empfohlen | ja/nein (Fragmentierungs-Fix) |

---

## STRANG 3 — VOR-ORT / MANUELL · sehr dünn
| Manuelle Fall-Erfassung im Leitsystem aktiv | ✅ default | — | bestätigen (nichts weiter zu konfigurieren) |

---

## QUERSCHNITT A — Leitsystem & Team
| Feld | Quelle | Pflicht | Cockpit |
|---|:--:|:--:|---|
| `case_id_prefix` (DA) | ✅ | ✓ | bestätigen |
| `brand_color` | ✅ (= Wizard) | ✓ | — (Quick-Win-Strang) |
| **Echte Staff** (Name/Rolle/E-Mail) | 🆕 | ✓ | eingeben — ⚠️ die `seed.staff_names` (Max Mustermann…) sind **nur Video-Dummys**! |
| Rollen-Toggle (admin/techniker) | ✅ abgeleitet (>2 Staff) | — | automatisch |

## QUERSCHNITT B — Benachrichtigung & Bewertung
| Feld | Quelle | Pflicht | Cockpit |
|---|:--:|:--:|---|
| **`notification_email`** (echte Ops-Mail) | 🆕 | ✓ | eingeben (heute = Prospect-Mail, muss echt werden) |
| `sms_sender_name` (Doerfler AG) | ✅ | ✓ | bestätigen |
| SMS-Inhalt/Timing | ⚠️ getemplatet | optional | später konfigurierbar |
| **`google_review_url`** | 🆕 | ✓ (sonst kein Review-CTA) | eingeben/bestätigen |
| Review-Chips (4 Standard) | ✅ default | — | optional editieren ⚠️ |
| Kanal-Regeln KR-1..7 / Push | 🔧 default | — | unsichtbar |

## QUERSCHNITT C — Go-live & Recht (greift in Phase 3)
| Feld | Quelle | Pflicht | Cockpit/Aktion |
|---|:--:|:--:|---|
| **Echte Admin-E-Mail** (OTP-Login, B1-Pre-Provision) | 🆕 | ✓ | eingeben (sonst „LS Guidance"-Bug) |
| **Telefon-Weiterleitung** (Swisscom/Sunrise/Salt) | 📞 | ✓ (Stufe B) | Next-Step, provider-spezifisch |
| Twilio-Nummer | 🔧 | bei Zahlung | System kauft |
| **AVV/DPA-Zustimmung** | 🆕 | ✓ (Recht) | akzeptieren |

---

## 🎯 Synthese — was uns das sagt

1. **Pre-Fill-Quote ≈ 70 %.** Das gesamte Voice-Wissen (1b) + Wizard + Branding kommt aus dem Crawl → **das Cockpit fühlt sich überwiegend wie *Bestätigen* an** (leicht, IKEA-befriedigend, kein Dateneingabe-Frust). Genau das macht „1–2 Stunden" realistisch für deinen ICP.

2. **Der echte NEU-Erfassungs-Kern = das Anti-Ping-Pong-Herz** (was kein Crawl weiß, ~10 Punkte):
   Greeting/KI-Wahl · die **7 Dispositionen** · Notfall-Alarmierung · **echte Staff** · **`notification_email`** · **`google_review_url`** · **echte Admin-E-Mail** · Wizard-Verteilung · + Go-live-Aktionen (**Weiterleitung**, **AVV**).
   → **Greift das Cockpit DIESE Liste vollständig ab, gibt es null Rückfragen.** Das ist der Vertrag.

3. **Was Backend braucht (⚠️) → Phase-2-Bau #4:** Dispositions-Routing (`call_type` + `tenant_callbacks` + Info-Suppression), echte-Staff-Erfassung, konfigurierbarer SMS-Inhalt, Review-Chips-Feld. **Alles andere ist Prompt/Config + existiert schon.**

4. **Founder-Review-Gate (Phase 3) prüft genau die 🆕-Zeilen** — die ✅-Zeilen sind crawl-verifiziert, die 🆕-Zeilen sind die, wo ein Fehler durchrutschen könnte (v.a. Dispositionen + echte Staff/Mail).
