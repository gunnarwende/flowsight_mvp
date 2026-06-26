# Hero-Demo — Produktions-Spec (Beweis-Seite neu, Stern 3)

> **STATUS: IN DEFINITION (Stand 2026-06-26).** Das **WAS** der neuen Beweis-Seite — das exakte
> Script + Screenflow, das die (neu zu bauende) Pipeline produzieren muss. Schwester-Doc:
> das **WARUM** = [`_strategy_notes/2026-06-22_demo-architektur.md`](../../_strategy_notes/2026-06-22_demo-architektur.md)
> (3 Schichten, M1–M5). Das **WIE** = [`PIPELINE_BIBLE.md`](PIPELINE_BIBLE.md) (wird darauf neu gebaut).
> Einstieg: [Stern-3-Karte](../../modules/customer_journey/stern_3_simulation.md).
>
> **Live unangetastet:** Die laufende 4-Video-Pipeline (T1–T4) bleibt, bis der Neubau bewusst startet.

## Worum es geht (Funktion)
Weg von 4 gestapelten Videos (~13 Min) → **Hero (90s) + klickbare Knoten**. Der **Hero** hat
**eine** Aufgabe: den **warmen Anruf verdienen** — dem 1–3-Mann-Inhaber zeigen, dass **ein
Auftrag, den er sonst verliert, sauber gefangen wird.** Kein Abschluss (Preis/Garantie = warmes
Gespräch / Knoten). Aus Inhaber-Sicht erzählt.

## Ton & Haltung (gelockt)
**Hormozi-Rückgrat, Schweizer Haut:** Geld-Problem direkt benennen · volle Risiko-Umkehr ·
Wert zuerst (die Seite IST das Geschenk) — aber **ruhig, respektvoll, kein Drücker** (eure
Live-Call-Lessons: Druck kostet den Abschluss).

## Kamera (gelockt): „Bookend"
Dein **Gesicht groß** am **Hook (0–10)** und am **Schluss (~75–90, morgen)**. Dazwischen
**führt der Screen**, deine **Stimme (VO)** drüber. Du nimmst **nur Gesicht + Stimme** auf —
**keinen Live-Anruf.** Der Anruf (Lisa + Kunde) ist vorproduziertes Audio.

## Zwei Stränge (nur der Opener verzweigt)
- **(a) COLD** — telefonisch nicht erreicht. **Hier vollständig definiert (0–49).**
- **(b) WARM** — erreicht, bat um die Mail. **Opener offen (morgen).** Körper + Schluss identisch.

---

## COLD-Strang · Transkript + Screenflow 0–49 (GELOCKT)

| Zeit | Bild | Sprecher | Wortlaut |
|---|---|---|---|
| 0–4 | DU, bildfüllend | **DU** | „Wissen Sie, wie viele Aufträge Sie diesen Monat verloren haben?" |
| 4–6 | DU | **DU** | „Sie nicht." |
| 6–10 | DU | **DU** | „Und was Sie nicht sehen, geht lautlos zum Nächsten." |
| 10–13 | Handy erscheint | **DU (VO)** | „Genau das hört jetzt auf." |
| 13–15 | Anruf klingelt | **DU (VO)** | „Ein neuer Kunde ruft an." |
| 15–20 🔵 | „[Betrieb] · angenommen", Lisa zuerst | **LISA** | „Guten Tag, hier ist Lisa, die digitale Assistentin von [Betrieb] — was kann ich für Sie tun?" |
| 20–26 🟢 | Kunde sagt Anliegen | **BRUNNER** | `{Anliegen}` *(s. u.)* |
| 26–28 | Lisa nimmt an | **LISA** | „Sehr gerne, da sind Sie genau richtig. Ich nehme das gleich auf." |
| 28–31.5 | Adresse | **LISA / BRUNNER** | „Herr Brunner, wie lautet Ihre Adresse?" — „Bahnhofstrasse 14, 8500 Frauenfeld." |
| 31.5–36 | Abschluss | **LISA** | „Alles aufgenommen, Herr Brunner — ich gebe das direkt an unseren Techniker weiter. Sie erhalten gleich eine SMS. Auf Wiederhören!" |
| 36–37.5 | Auflegen (Kunde legt auf) | **BRUNNER** | „Danke, auf Wiederhören." → **Anruf beendet** |
| 37.5–38.5 | „Anruf beendet" (kurz) | — | *— still —* |
| 38.5–43 | **Dashboard** · Tipp **NEU** (echte Interaktion: blauer Ring + Filter auf den einen Fall) | **DU (VO)** | „Ein vollständiger Auftrag — angenommen, während Sie weitergearbeitet haben." |
| 43–49 | **Fall-Detail** · sanfter Scroll zum **VERLAUF** („Anruf eingegangen — Fall erstellt → Team informiert") | **DU (VO)** | „Eingegangen, erfasst, schon beim Team — bevor Sie überhaupt davon wussten." |

**Regie:** 15–37.5 = **Beweis-Fenster**, DU schweigst (der Anruf trägt). Kunde + Lisa klingen
„durchs Handy" (komprimiert), dein VO warm & nah → nie verwechselbar.

### 🟢 `{Anliegen}` — fixer Slot 20–26 (6,0 s, beide darauf gepaddet)
- **Sanitär:** „Hallo, hier ist Herr Brunner. Ich bräuchte jemanden für ein neues Bad, und es eilt ein bisschen."
- **Heizung / Gebäudetechnik (Wärme-Cluster):** „Hallo, hier ist Herr Brunner. Wir möchten auf eine Wärmepumpe umstellen, und holen grad Offerten ein."

### Swap-Inventar (driftfrei)
- 🔵 **Swap A — Greeting [Betrieb]** (15–20, fix 5,0 s): Firmenname pro Tenant, in den Slot gepaddet (wie heute `swap_tenant_greeting`).
- 🟢 **Swap B — {Anliegen}** (20–26, fix 6,0 s): pro Gewerk, exakt auf Slot-Länge geschnitten/gepaddet.
- **Demo-Adresse „Bahnhofstrasse 14, 8500 Frauenfeld"** = **kanton-gebunden** (Thurgau, gut sprechbar). **Bei Kantonswechsel neue Demo-Stadt setzen!**
- Demo-Kunde „Herr Brunner" + alle Lisa-Zeilen = **universell** (einmal aufgenommen).

### Screenflow 37.5–49 (alles ECHTE App-Interaktion)
Dashboard: **NEU = 1** (Fokus), **BEI UNS / ERLEDIGT voll** (wirkt etabliert). Tipp NEU → echtes
Highlight (blauer Ring + Fill) + Filter auf den einen Fall → Tipp Fall → echte Navigation ins
Detail → echter sanfter Scroll zum VERLAUF. **Kaum Postproduktion** — der Zuschauer sieht das
echte System arbeiten.

---

## Gelockte Entscheidungen (Begründung kurz)
- **Hook = der „Flip"** (Geld + Unsichtbarkeit): „…Sie nicht. Was Sie nicht sehen, geht lautlos zum Nächsten."
- **Output Hochdeutsch** (Mundart geparkt, V8); **kein „Grüezi"** (TTS verhunzt CH-Wörter).
- **revDSG-Disclosure** im Greeting („die digitale Assistentin von …") — ehrlich + gute Außenwirkung.
- **Kunde = Herr Brunner (männlich)** — klare Stimm-Trennung zu Lisa (weiblich). Demo darf wärmer sein als der Live-Agent (der sagt heute keine Namen).
- **2 Anliegen-Varianten** (Sani „Bad" / Wärme-Cluster „Wärmepumpe"). **GT fällt in den Wärme-Cluster** — Daten-belegt (MS Gebäudetechnik + Regiotherm = beide Wärmepumpe-dominiert). Bei Kombi-Betrieb (Sani+Heizung): **Wärmepumpe führt** (größerer Verlust-Stich).
- **„Karte danach" (Variante B)**, nicht Live-Fill — ehrlicher zum Produkt (Fall entsteht nach dem Anruf).
- **„Auftrag" (nicht „Anfrage")** — spiegelt den Hook („Aufträge verloren" → „ein Auftrag, angenommen"). Bewusst, trotz leichter Unschärfe.

## Offen / nächste Schritte
1. **Schluss ~49–90** (morgen): Steuern/Risikofreiheit · Gesicht zurück · CTA runter in die Knoten.
2. **WARM-Opener** (Strang b) final.
3. **Knoten-Set** (Anruf · Wizard · Leitzentrale · Bewertung + Notfall-Gewerk-Variante) + Inhalte.
4. **Seed-Demo-Fall umstellen:** heute noch alt (Rohrbruch · Wende · Seestrasse 14 Oberrieden) → neu: neues Bad / Wärmepumpe · Herr Brunner · Bahnhofstrasse 14, 8500 Frauenfeld.
5. **Text IM Fall** (Beschreibung etc.) = Job des Pipeline-Crawlings / der neuen PIPELINE_BIBLE.
6. **Demo-Adresse pro Kanton** pflegen (Vermerk bei Kantonswechsel).
7. *(optional)* Live-Agent Namen-Nutzung an die Demo angleichen.
