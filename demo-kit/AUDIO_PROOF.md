# Audio Proof Harness — 5 Min PASS/FAIL Test

> Diesen Test VOR JEDER Demo durchführen. Dauer: 5 Minuten.
> Braucht: 1 Kontrollperson (z.B. auf dem Handy in einem Teams-Call).

---

## Voraussetzungen

- [ ] MicroSIP installiert + SIP Account konfiguriert (siehe `TWILIO_SIP_SETUP.md`)
- [ ] Windows Exclusive Mode deaktiviert (siehe `setup_demo.ps1`)
- [ ] MicroSIP Audio Output = System-Speakers (NICHT Headset)
- [ ] Kontrollperson bereit (Teams/Telefon)

---

## Test-Protokoll

### Test 1: MicroSIP → Lisa (Grundfunktion)

1. MicroSIP öffnen
2. `+41445053019` eintippen → Anrufen (Brunner Demo-Nummer, wie auf Website)
3. Lisa meldet sich?

| Ergebnis | Aktion |
|----------|--------|
| PASS: Lisa meldet sich | Weiter zu Test 2 |
| FAIL: "Registration failed" | → Troubleshoot A |
| FAIL: "403 Forbidden" | → Troubleshoot B |
| FAIL: Kein Klingeln | → Troubleshoot C |

### Test 2: Audio kommt aus System-Speakers

1. Lisa spricht → Wo kommt der Ton raus?

| Ergebnis | Aktion |
|----------|--------|
| PASS: System-Speakers (Laptop/Monitor) | Weiter zu Test 3 |
| FAIL: Headset | → Troubleshoot D |
| FAIL: Kein Audio | → Troubleshoot E |

### Test 3: Teams teilt Audio (der entscheidende Test)

1. Teams-Call mit Kontrollperson starten
2. **Screen-Share starten:**
   - "Teilen" klicken → **"Gesamter Bildschirm"** wählen (NICHT "Fenster"!)
   - **Checkbox "Computersound einschliessen" AKTIVIEREN** (unten links)
3. MicroSIP: `+41445053019` anrufen
4. Kontrollperson fragen: **"Hörst du Lisa?"**

| Ergebnis | Aktion |
|----------|--------|
| PASS: Kontrollperson hört Lisa klar | **AUDIO PROOF BESTANDEN** |
| FAIL: Kontrollperson hört nichts | → Troubleshoot F |
| FAIL: Kontrollperson hört leise/verzerrt | → Troubleshoot G |

### Test 4: Founder-Stimme + Lisa gleichzeitig

1. Während Lisa spricht: Founder redet ins Headset-Mikro
2. Kontrollperson fragen: **"Hörst du mich UND Lisa?"**

| Ergebnis | Aktion |
|----------|--------|
| PASS: Beides hörbar | **FULL AUDIO PROOF BESTANDEN** |
| FAIL: Nur Lisa, kein Founder | → Troubleshoot H |
| FAIL: Nur Founder, kein Lisa | → Troubleshoot F |

---

## PASS-Protokoll

Wenn alle 4 Tests bestanden:

```
AUDIO PROOF: PASS
Datum: ___________
Devices:
  Teams Mikro:    ___________  (z.B. "Headset (Jabra)")
  Teams Speaker:  ___________  (z.B. "Headset (Jabra)")
  MicroSIP Out:   ___________  (z.B. "Speakers (Realtek)")
  MicroSIP In:    ___________  (z.B. "Headset (Jabra)")
  Teams Share:    Entire Screen + "Include computer sound" ON
Notizen: ___________
```

---

## Troubleshoot Decision Tree

### A: "Registration failed"
```
MicroSIP zeigt "Registration failed"
  ├─ SIP Server richtig? → flowsight-demo.sip.twilio.com
  ├─ Username/Password korrekt? → Twilio Console > SIP > Credential List prüfen
  ├─ Domain = SIP Server? → Muss identisch sein
  └─ Firewall? → UDP 5060 + RTP Ports 10000-20000 freigeben
```

### B: "403 Forbidden" / "Ablehnen"
```
Anruf wird abgelehnt
  ├─ Credential List mit SIP Domain verknüpft? → Twilio Console prüfen
  ├─ Voice URL korrekt? → Muss sein: https://flowsight-mvp.vercel.app/api/demo/sip-twiml
  ├─ callerId fehlt? → Error 13214 = TwiML braucht callerId Attribut auf <Dial>
  └─ Fix: node --env-file=src/web/.env.local demo-kit/twilio_diagnose.mjs --fix
```

### C: Kein Klingeln
```
Anruf geht raus, aber kein Klingeln
  ├─ TwiML Bin korrekt? → Muss <Dial><Number>+41445054818</Number></Dial> enthalten
  ├─ Brunner Voice Agent aktiv? → Retell Dashboard prüfen
  └─ Twilio Balance? → Console > Billing prüfen
```

### D: Audio kommt aus Headset statt Speakers
```
Lisa spricht, aber Audio kommt aus Headset
  ├─ MicroSIP > Settings > Audio > Speaker → "Speakers (Realtek)" wählen (NICHT Headset)
  ├─ Windows Exclusive Mode deaktiviert? → setup_demo.ps1 nochmal prüfen
  └─ MicroSIP neustarten nach Änderung
```

### E: Kein Audio (Stille)
```
Lisa antwortet, aber kein Ton
  ├─ Windows Lautstärke auf? → Volume Mixer prüfen, MicroSIP nicht gemutet
  ├─ MicroSIP Audio Device gesetzt? → Settings > Audio > Speaker prüfen
  └─ Anruf überhaupt verbunden? → MicroSIP zeigt "Connected"?
```

### F: Teams teilt kein Audio
```
Kontrollperson hört Lisa nicht
  ├─ "Computersound einschliessen" aktiviert? → Checkbox beim Screen-Share
  ├─ "Gesamter Bildschirm" geteilt? → "Fenster" teilen hat KEINE Audio-Option!
  ├─ MicroSIP Audio geht auf System-Speakers? → Test 2 wiederholen
  ├─ Teams neu starten und Screen-Share erneut starten
  └─ Fallback: VoiceMeeter Banana installieren (Option A aus dem Briefing)
```

### G: Audio leise/verzerrt
```
Kontrollperson hört Lisa, aber schlecht
  ├─ MicroSIP Lautstärke erhöhen → Volume Mixer > MicroSIP
  ├─ Windows Lautstärke erhöhen → System-Speakers lauter
  ├─ Teams Compression? → Normalerweise OK, aber bei schlechtem Internet schlechter
  └─ Headset-Mikro nimmt Speaker-Audio auf (Echo) → Headset lauter, Speakers etwas leiser
```

### H: Founder-Stimme fehlt
```
Kontrollperson hört Lisa aber nicht den Founder
  ├─ Teams Mikro = Headset? → Teams > Settings > Devices > Microphone prüfen
  ├─ Headset-Mikro gemutet? → Hardware-Mute-Schalter prüfen
  └─ Teams gemutet? → Mute-Button in Teams prüfen
```

---

## Quick-Reference: Audio-Routing Schema

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  MicroSIP ──► System-Speakers ──► Teams "Include     │
│  (Lisa)       (Realtek o.ä.)      computer sound"    │
│                                       │              │
│                                       ▼              │
│  Headset-Mikro ──────────────► Teams Mikrofon        │
│  (Founder)                         │                 │
│                                    ▼                 │
│                              PROSPECT HÖRT:          │
│                              ✅ Lisa-Audio            │
│                              ✅ Founder-Stimme        │
│                                                      │
└──────────────────────────────────────────────────────┘
```
