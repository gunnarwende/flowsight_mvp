# Twilio SIP Setup for MicroSIP (10 Min)

> Dieses Setup muss einmal gemacht werden. Danach funktioniert MicroSIP dauerhaft.

## Voraussetzungen

- Twilio Account (bereits vorhanden)
- MicroSIP installiert (`winget install MicroSIP.MicroSIP`)

---

## Schritt 1: SIP Domain erstellen

1. Twilio Console > **Voice** > **SIP Domains** (oder direkt: `console.twilio.com/us1/develop/voice/manage/sip-domains`)
2. **Create SIP Domain**
3. Name: `flowsight-demo`
   - Ergibt: `flowsight-demo.sip.twilio.com`
4. **Voice Configuration:**
   - A CALL COMES IN: **TwiML Bin** (wird in Schritt 3 erstellt)
   - Erstmal leer lassen, wir kommen zurück

## Schritt 2: Credential List erstellen

1. Auf der SIP Domain Seite: **IP Access Control Lists & Credential Lists**
2. **Credential Lists** > **Create Credential List**
3. Name: `flowsight-demo-creds`
4. **Add Credential:**
   - Username: `flowsight-demo` (frei wählbar)
   - Password: sicheres Passwort generieren (min 12 Zeichen)
   - **Passwort notieren!** Wird in MicroSIP gebraucht.
5. Speichern

## Schritt 3: TwiML Bin erstellen

1. Twilio Console > **Develop** > **TwiML Bins** (oder direkt: `console.twilio.com/us1/develop/twiml-bins`)
2. **Create new TwiML Bin**
3. Name: `flowsight-demo-dial-brunner`
4. TwiML einfügen:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>
    <Number>+41445054818</Number>
  </Dial>
</Response>
```

5. Speichern → URL kopieren

## Schritt 4: TwiML Bin mit SIP Domain verbinden

1. Zurück zu **Voice** > **SIP Domains** > `flowsight-demo`
2. **Voice Configuration:**
   - A CALL COMES IN: **TwiML Bin**
   - Dropdown: `flowsight-demo-dial-brunner` auswählen
3. **Authentication:**
   - Credential Lists: `flowsight-demo-creds` hinzufügen
4. Speichern

## Schritt 5: MicroSIP konfigurieren

1. MicroSIP starten
2. **Menu** > **Add Account** (oder beim ersten Start automatisch)
3. Eingeben:
   - **Account Name:** FlowSight Demo
   - **SIP Server:** `flowsight-demo.sip.twilio.com`
   - **SIP Proxy:** (leer lassen)
   - **Username:** `flowsight-demo` (von Schritt 2)
   - **Domain:** `flowsight-demo.sip.twilio.com`
   - **Password:** (von Schritt 2)
4. **Speichern**
5. Status sollte "Online" zeigen

### Audio-Geräte in MicroSIP

1. **Menu** > **Settings**
2. **Audio:**
   - **Speaker:** System-Lautsprecher wählen (z.B. "Speakers (Realtek)")
     - **NICHT** das Headset wählen!
   - **Microphone:** Headset-Mikrofon wählen
   - **Ringer:** System-Lautsprecher (gleich wie Speaker)
3. Speichern

> **Warum Speaker ≠ Headset?** Teams "Include computer sound" teilt System-Audio, nicht Headset-Audio. Lisa muss über System-Speakers laufen, damit der Prospect sie hört.

## Schritt 6: Testanruf

1. In MicroSIP: `+41445053019` eintippen (Brunner Demo-Nummer, wie auf Website)
2. Anrufen → Lisa sollte sich melden
3. Wenn Lisa antwortet: **Setup erfolgreich!**
4. Weiter mit `AUDIO_PROOF.md` für den Teams-Audio-Test

---

## Troubleshooting

| Problem | Lösung |
|---------|--------|
| "403 Forbidden" bei Anruf | Credential List nicht mit SIP Domain verknüpft (Schritt 4) |
| "Registration failed" | Username/Passwort prüfen, SIP Domain prüfen |
| Kein Audio | Audio-Geräte in MicroSIP prüfen (Schritt 5, Audio) |
| Lisa meldet sich nicht | Brunner-Nummer prüfen: +41445054818 |
| TwiML Bin nicht im Dropdown | TwiML Bin muss gespeichert sein (Schritt 3) |
