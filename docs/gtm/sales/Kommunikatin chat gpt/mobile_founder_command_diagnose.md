# Diagnosebericht: Mobile Founder Command

Erstellt: 2026-06-20 (Samstag) von Claude Code (Opus 4.8), lokal im Repo verifiziert.
Zweck: Gunnar und ChatGPT bewerten gemeinsam, wie weit FlowSight heute schon vom Handy steuerbar ist.

Alle Befunde unten sind real geprueft (git, gh, eslint, CI-Config), nicht aus dem Gedaechtnis.

---

## Vorab — Challenge am Auftrag

Drei Framings im urspruenglichen Auftrag wurden geschaerft:

1. "Cloud Code" gibt es nicht als Produkt. Relevant ist Claude Code mit zwei Entrypoints:
   lokal (Terminal, aktuell genutzt) und Web/Cloud (claude.ai/code, in Max enthalten).
   Die Mobile-Frage entscheidet sich an diesem Entrypoint, nicht an Infrastruktur.
2. "Macht die Session cloudfaehig" ist die falsche Frage. Diese lokale Session wird nicht
   remote — sie stirbt, wenn der Laptop schlaeft. Der Hebel ist, den Web-Entrypoint zur
   Gewohnheit zu machen.
3. "Nur 2-4 Hebel" ist im Kern richtig — aber es sind Konventionen, keine Infrastruktur.
   Die Infra (GitHub, Vercel-Preview, CI, Telegram) steht bereits.

---

## A) Kurzfazit

Eher 2-3 Hebel entfernt, und es sind Prozess-Hebel, keine Bau-Hebel. Die Cloud-
Ausfuehrungskette existiert heute: GitHub-Repo, Vercel-Auto-Previews pro Branch/PR, CI mit
Telegram-Rueckmeldung, gh-CLI authentifiziert. Was fehlt: (1) Web/Mobile-Entrypoint als
Gewohnheit, (2) Command-Inbox, (3) Standard-Rueckgabeformat. Alles in Stunden machbar.

Harte Grenze, fest einplanen: Die Video-Pipeline (ffmpeg, Playwright-Recordings,
ElevenLabs, Bunny-Upload) ist laptop-gebunden und wird nicht handy-tauglich. Mobile Command
ist realistisch fuer Docs, Sales-Skripte, Code/PRs, Status, Config — nicht fuer
Videoproduktion. Das ist eine bewusste Grenze, keine Luecke.

## B) Was heute schon funktioniert (verifiziert)

- Ausfuehrungsumgebung jetzt: lokal, Terminal, Windows-Laptop, Modell Opus 4.8. Schlaeft der
  Laptop / schliesst das Terminal -> Session endet. Keine Persistenz.
- GitHub: Remote github.com/gunnarwende/flowsight_mvp. gh v2.87 installiert + eingeloggt.
  Kann Branches, Commits, Push, PRs, Issues und Actions/CI-Status lesen (live geprueft:
  BigBen-Crons + Morning Report heute alle gruen).
- CI: .github/workflows/ci.yml (lint + build + Telegram-Notify mit Preview-Link) laeuft bei
  jedem PR gegen main. Ergebnis + Preview-URL kommen schon heute auf Telegram.
- Vercel: Auto-Preview pro Branch/PR (Root = src/web), Production nur von main.
- 8 GH-Action-Crons laufen autonom in der Cloud (Morning-Report, Lifecycle, BigBen-Sync,
  Outreach-Reminder ...) — bereits "Cloud fuehrt aus, ohne dass der Laptop an ist".
- Telegram ist der bestehende Rueckkanal (CI, Reports, Alerts).

## C) Was konkret fehlt

1. Web/Mobile-Entrypoint ungenutzt. claude.ai/code (Max-enthalten) wuerde Claude Code in
   einer Cloud-Sandbox gegen das GitHub-Repo laufen lassen, vom Handy steuerbar, erzeugt
   Branches + PRs. Heute haengt alles am lokalen Terminal. Das ist Hebel 1.
2. Keine Command-Inbox. Es gibt docs/ticketlist.md (Task-Tracker), aber keinen definierten
   Ort fuer Zuruf vom Handy.
3. Kein Standard-Rueckgabeformat. Kein "Decision Packet" fuer 30-Sekunden-Entscheidung.
4. Autonomie-Gates nicht als eigenes Dok. Sie stehen verstreut in CLAUDE.md, aber nicht als
   eine Liste, die ein Cloud-Agent als Leitplanken-SSOT liest.
5. Lokal-only-CLIs fuer Status: vercel und supabase CLI sind nicht installiert -> Deploy-
   Status/Migrations-Drift aktuell nicht direkt vom CLI pruefbar (nur ueber gh + Web). Fuer
   den Mobile-PR-Loop kein Blocker; fuer "pruef den Prod-Status" schon.

## D) Minimaler Handy-Workflow fuer morgen (real, ohne Bau)

1. Handy -> GitHub-App: Issue anlegen mit Label cc-command (Inbox, bis was Besseres steht).
2. Handy -> claude.ai/code: "Arbeite Issue #N ab" -> Cloud-Agent macht Branch + Aenderung +
   Commit + PR.
3. CI + Vercel bauen automatisch -> Telegram meldet Ergebnis + Preview-Link.
4. Handy -> Preview ansehen, PR-Diff in GitHub-App lesen, mergen oder kommentieren.

Real moeglich fuer: Docs, Sales-Skripte, Cold/Warm-Call-Texte, Config, Code-Fixes, Status.
Nicht fuer die Video-Pipeline.

## E) Empfohlene Zielarchitektur

- Entrypoint: claude.ai/code (Cloud-Sandbox) als Standard fuers Handy; lokales Terminal
  bleibt fuer Video-Pipeline + alles Schwere.
- Inbox: GitHub Issues mit Label cc-command (mobil-nativ, agent-lesbar, Verlauf). Optional
  spaeter docs/commands/INBOX.md.
- Rueckgabe: festes "Decision Packet" als PR-Body-Template (Was geaendert, Welche Dateien,
  Welche Checks, Preview-Link, Welche Entscheidung, Naechster Schritt).
- Gates: ein docs/runbooks/autonomy_gates.md als Leitplanken-SSOT (speist sich aus CLAUDE.md).
- Rueckkanal: Telegram bleibt (steht schon); CI-Notify ist die Vorlage.

## F) Risiken / Sicherheitsgrenzen

- Secrets: Vercel-Env = Runtime-SSOT, nie ins Repo. Cloud-Sandbox bekommt keine Prod-Secrets;
  CI/Vercel bauen mit eigenen Placeholder-Envs (in ci.yml verifiziert). Fuer den PR-Loop
  keine Secret-Weitergabe noetig -> niedrige Angriffsflaeche.
- Production: nur main deployt live. Cloud-Agent arbeitet auf Branch + PR -> Production
  unberuehrt bis zum Merge.
- Bestehende Gates passen 1:1: E-Mail/SMS an Kunden nur auf Founder-Wort, kein Prod-Deploy
  ohne Freigabe, keine Live-Migration, Preis-/Sales-Texte final nur mit Founder, keine
  Kundendaten loeschen. Ergaenzung: Merge bleibt der Founder-Handy-Klick, nicht der Agent.

## G) Konkreter naechster Schritt

Zwei kleine, getrennte Schritte, beide nicht-invasiv:

1. Lint-Schuld abraeumen (entblockt den Journey-Push, siehe unten). ~1 h, rein technisch.
   Danach Branch pushen -> PR -> CI + Preview gruen -> Journey-Tool vom Handy pruefbar. Das
   ist zugleich der erste echte Mobile-Command-Durchlauf.
2. Mobile-Loop einrichten (Hebel 1-3): cc-command-Issue-Template + Decision-Packet-PR-
   Template + autonomy_gates.md (kleine, additive Docs/Config). Den Web-Entrypoint
   claude.ai/code aktiviert Gunnar einmalig selbst am Handy.

---

## Anhang: Befund zum Journey-Push (Punkt 2 aus dem Tagesgespraech)

Die Memory-Notiz sagte "minimal CeoShell.tsx:97 fixen, dann pushen". Das stimmt nicht mehr.

- Lint-Lauf in src/web: 37 Errors / 45 Warnings, verteilt ueber bestehende Ops-Komponenten
  (neuer react-hooks-Regelsatz: purity / set-state-in-effect / immutability / prefer-const /
  unused-vars).
- Diese Dateien sind NICHT vom Journey-Branch angefasst -> vorbestehende repo-weite Schuld
  (gleicher Regelsatz auf main), nicht durch die Journey-Arbeit verursacht.
- next.config.ts setzt kein eslint.ignoreDuringBuilds -> Vercel-Build lintet mit und wird an
  diesen Errors rot.

Verdikt: Reiner Branch-Push ist produktiv risikoarm (CI laeuft nur bei PR gegen main, nicht
bei Push; Production deployt nur von main). Aber der Push loest einen Vercel-Preview-Build
aus, der an den 37 Lint-Errors rot wird -> kein funktionierender Preview, Ziel blockiert.

Latente Mine: Wenn main dieselben 37 Errors traegt, wuerde auch der naechste Production-Deploy
von main am Build scheitern. Vor einem dringenden Prod-Deploy verifizieren.
