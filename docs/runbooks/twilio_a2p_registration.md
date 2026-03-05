# Twilio A2P Registration — Step-by-Step

**Ziel:** Alle SMS (Schadensbestätigung, Demo-Booking, Reminder) spam-sicher machen.
**Dauer:** ~30 Min Setup, 1-5 Werktage Genehmigung durch Twilio/Carrier.
**Ergebnis:** Alphanumerische Sender ("BrunnerHT", "Doerfler" etc.) werden als verifizierter Business-Traffic zugestellt.

---

## Voraussetzungen

- Twilio Account (haben wir: TWILIO_ACCOUNT_SID in Vercel Env)
- Firmenadresse (FlowSight, deine Adresse oder GmbH/AG-Adresse)
- CH-Handynummer als Kontakt

---

## Schritt 1: Messaging Service erstellen

1. Twilio Console > **Messaging** > **Services** > **Create Messaging Service**
2. Werte eintragen:

| Feld | Wert |
|------|------|
| **Friendly Name** | `FlowSight SMS` |
| **Use case** | "Notifications" (nicht Marketing!) |

3. **Sender Pool** > "Add Senders":
   - Typ: **Alpha Sender** > Add: `FlowSight` (max 11 Zeichen)
   - Zusätzlich die bestehende Twilio-Nummer (+41 44 505 48 18) als Fallback hinzufügen
4. **Integration** > Incoming Messages: "Drop the message" (wir empfangen keine SMS)
5. **Compliance Info** > ausfüllen (siehe Schritt 2)
6. **Save** > Messaging Service SID notieren (Format: `MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

---

## Schritt 2: Brand Registration (Trust Hub)

1. Twilio Console > **Trust Hub** > **Customer Profiles** > **Create new Customer Profile**
2. **Business Profile** ausfüllen:

| Feld | Wert |
|------|------|
| **Business Name** | FlowSight (oder dein eingetragener Firmenname) |
| **Business Type** | Sole Proprietorship / Private Company (je nach Rechtsform) |
| **Business Registration Number** | CHE-Nummer falls vorhanden, sonst leer |
| **Business Industry** | Technology |
| **Website** | https://flowsight.ch |
| **Region of Operation** | Europe > Switzerland |
| **Business Address** | Deine Geschäftsadresse |

3. **Authorized Representative** (= du):

| Feld | Wert |
|------|------|
| **First Name** | Gunnar |
| **Last Name** | Wende |
| **Email** | deine Business-E-Mail |
| **Phone** | deine Handynummer (+41...) |
| **Title** | Founder / CEO |

4. **Submit** > Status wird "Pending Review"

---

## Schritt 3: A2P Campaign Registration

> Erst möglich nachdem Brand genehmigt ist (1-3 Werktage).

1. Twilio Console > **Messaging** > **Services** > **FlowSight SMS** > **Compliance**
2. Oder: **Trust Hub** > **A2P Messaging** > **Register a Campaign**
3. Campaign ausfüllen:

| Feld | Wert |
|------|------|
| **Campaign Use Case** | **Customer Care** (nicht Marketing!) |
| **Description** | "Transactional SMS for Swiss plumbing/heating businesses: damage report confirmations, appointment reminders, and service notifications." |
| **Sample Message 1** | "BrunnerHT: Ihre Meldung (Heizung defekt) wurde aufgenommen. Erfasster Ort: 8800 Thalwil. Ihr Service-Team meldet sich schnellstmöglich." |
| **Sample Message 2** | "FlowSight: Ihre Demo am 10.03. um 14:00 ist bestätigt. Microsoft Teams-Link: [URL]. Bei Fragen: +41 44 552 09 19" |
| **Sample Message 3** | "FlowSight: Erinnerung — Ihre Demo ist morgen um 14:00. Link: [URL]. Verschieben? Antworten Sie auf diese Nachricht." |
| **Message Flow** | "Users initiate contact by submitting a damage report via phone (voice agent) or web form, or by booking a demo. SMS is sent as transactional confirmation only." |
| **Opt-in** | "Opt-in is collected when the user provides their phone number during damage reporting (voice call or web form) or demo booking." |
| **Opt-in Keywords** | n/a (transactional, kein Opt-in nötig) |
| **Opt-out Keywords** | STOP |
| **Help Keywords** | HELP |
| **Subscriber Opt-in** | Yes |
| **Subscriber Opt-out** | Yes |
| **Embedded Links** | Yes (correction link + Teams link) |
| **Age-gated Content** | No |

4. **Submit** > Genehmigung dauert 1-5 Werktage

---

## Schritt 4: Alphanumerische Sender pro Tenant registrieren

Nachdem die Campaign genehmigt ist:

1. **Messaging Service** > **Sender Pool** > **Add Alpha Sender**
2. Pro Tenant einen Sender hinzufügen:

| Tenant | Alpha Sender | Max 11 Zeichen |
|--------|-------------|----------------|
| Brunner HT | `BrunnerHT` | 9 Zeichen |
| Dörfler AG | `Doerfler` | 8 Zeichen |
| FlowSight | `FlowSight` | 9 Zeichen |

> Wichtig: In der Schweiz sind alphanumerische Sender erlaubt. Kein separates Carrier-Approval nötig — die A2P-Campaign-Genehmigung reicht.

---

## Schritt 5: Code-Änderung (nach Genehmigung)

Aktuell sendet `sendSms()` direkt über die Twilio Messages API mit `From: <alphanumericName>`.

**Änderung:** Statt `From` den `MessagingServiceSid` verwenden. Twilio wählt dann automatisch den richtigen Sender aus dem Pool.

```
// vorher
body: new URLSearchParams({ From: from, To: to, Body: body })

// nachher
body: new URLSearchParams({ MessagingServiceSid: sid, To: to, Body: body })
```

Neue Env Var: `TWILIO_MESSAGING_SERVICE_SID` (der MG... Wert aus Schritt 1)

Ich mache diese Code-Änderung sobald du die Genehmigung hast.

---

## Schritt 6: Verifizierung

Nach Genehmigung testen:

```bash
# Twilio CLI oder Console > SMS Log prüfen
# Status muss "delivered" sein, nicht "undelivered"
```

Test-SMS an dein Handy senden (Swisscom + Sunrise testen falls möglich).

---

## Zeitplan

| Tag | Aktion |
|-----|--------|
| Heute | Schritt 1-2 (Messaging Service + Brand Registration) |
| Tag 2-4 | Warten auf Brand-Genehmigung |
| Nach Genehmigung | Schritt 3 (Campaign Registration) |
| Tag 3-7 | Warten auf Campaign-Genehmigung |
| Nach Genehmigung | Schritt 4-6 (Sender + Code + Test) |

---

## FAQ

**Was passiert mit bestehenden SMS während der Wartezeit?**
Nichts ändert sich. Bestehende SMS laufen weiter wie bisher (alphanumerisch, ohne Registration). Das Spam-Risiko bleibt bis zur Genehmigung bestehen, aber bei unserem geringen Volumen (< 10/Tag) ist das vertretbar.

**Brauche ich das pro Tenant neu?**
Nein. Ein Messaging Service + eine Campaign reicht. Neue Tenants brauchen nur einen neuen Alpha Sender im Pool (30 Sekunden in der Console).

**Was kostet das?**
$0 extra für die Registration. SMS-Preise bleiben gleich (~CHF 0.07/SMS CH).

**Kann ich den Status prüfen?**
Trust Hub > Customer Profiles zeigt den aktuellen Status (Pending/Approved/Rejected).
