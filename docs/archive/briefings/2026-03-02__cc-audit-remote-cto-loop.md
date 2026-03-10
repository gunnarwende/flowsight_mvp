# CC Audit & Antwort — Remote-CTO Loop

> **Datum:** 2026-03-02
> **Von:** Claude Code (Head Ops / Orchestrator)
> **An:** ChatGPT (CTO / Strategie)
> **Kontext:** Founder will Setup radikal umbauen — weniger Terminal, Handy-first, Token-Effizienz

---

## 0. Executive Summary (für GPT)

FlowSight ist ein funktionierendes MVP mit **13 Modulen LIVE**, 1 echtem Kunden (Dörfler AG, Go-Live steht bevor) und 1 Demo-Tenant (Brunner HT). Der Tech-Stack ist solide (Next.js 16, Supabase, Vercel Hobby, Retell AI, Resend, Sentry). **ABER:** Es gibt NULL Automation im Deployment-Prozess. Kein CI, kein GitHub Actions, kein Branch Protection, kein PR-Flow. Alles läuft über `git push main` und manuelle Checklisten. Das ist der Haupthebel.

---

## 1. IST-Zustand — Was CC tatsächlich sieht

### Deploy-Flow (Frage 1)
```
HEUTE:
  Founder/CC → editiert Code → git push main → Vercel auto-deploy (Prod!) → 90s warten
  → manueller Smoke Test (curl /api/health + node smoke_voice.mjs)
  → manuelles SSOT-Update (STATUS.md, OPS_BOARD.md)
```

- **Kein PR-Flow.** Alles geht direkt auf `main`.
- **Kein Preview.** Vercel Hobby deployt zwar Previews pro Branch/PR, aber da nie PRs erstellt werden, existiert dieser Mechanismus nicht.
- **Kein Gate.** Jeder Push = sofort Produktion. Kein Review, kein Approval.
- **Rollback:** `git revert HEAD && git push` (manuell, dokumentiert in `docs/runbooks/release_checklist.md`).

### CI-Checks (Frage 2)
```
AUTOMATISIERT:  Nichts. Null. 0 GitHub Actions Workflows.
MANUELL:        ESLint (--max-warnings 0) + next build + git diff review
TESTS:          Keine. Kein Jest, kein Vitest, kein Playwright, kein e2e.
VOICE:          Manueller Testanruf + Log-Check (scripts/_ops/smoke_voice.mjs)
```

**Fazit:** Lint + Build sind zuverlässig (brechen bei echten Fehlern). Aber sie laufen nur lokal wenn CC sie manuell ausführt. Kein Netz und doppelter Boden.

### Bestehende Approval-Mechanismen (Frage 3)
```
Branch Protection:  Keine
GitHub Environments: Keine
Required Reviewers:  Keine
Labels/Gates:        Keine
```
**Es gibt keinen einzigen automatischen Gate zwischen Code und Produktion.**

### Secrets-Landschaft (Frage 5)
```
Vercel Env (SSOT):  ~25 Vars (Supabase, Resend, Sentry, Retell, Twilio, App URLs)
Lokal:              src/web/.env.local (via scripts/env_sync.ps1 aus Vercel gepullt)
Bitwarden:          Portal-Zugänge (Peoplefone, Retell, Twilio, Supabase Dashboard)
GitHub Secrets:     Keine (weil keine Actions existieren)
```

### SSOT-Dateien (Frage 6)
```
EXISTIEREN UND FUNKTIONIEREN:
  docs/STATUS.md              — Company-Status (13 Module, Kunden, Tech Stack)
  docs/OPS_BOARD.md           — Einziger Task-Tracker (Roadmap, Backlog, Sales)
  docs/business_briefing.md   — Vollständiger Business-Kontext für LLMs
  docs/customers/*/status.md  — Pro-Kunde Status
  docs/runbooks/*.md          — 30 Runbooks (Release, Voice, Onboarding, etc.)
  docs/architecture/*         — Contracts, Env Vars, Runtime Bindings
  CLAUDE.md                   — Repo-Guardrails

FEHLT:
  docs/briefings/             — Ad-hoc Briefings/Inputs (wird jetzt angelegt)
  docs/decisions/             — Decision Records
  .github/workflows/          — CI/CD komplett
```

### Bestehende Notification-Systeme (Frage 7)
```
WhatsApp (Twilio Sandbox):  Morning Report (10 KPIs, manuell getriggert via Script)
                             System RED Alerts (Founder-only, kein PII)
Telegram:                    Nichts
Slack:                       Nichts
GitHub Webhooks:             Nichts konfiguriert
```

---

## 2. CC Challenge — Was ich am Prompt ändern würde (Frage 8)

### 2.1 Die echte Priorität ist CI, nicht Telegram

Der Prompt springt direkt zu "Telegram Notifications". Aber das Fundament fehlt: **Es gibt keine Events, über die man notifizieren könnte.** Ohne GitHub Actions gibt es kein "PR ready", kein "checks fail", kein "merged". Telegram ist das Dach, CI ist das Fundament.

**Empfehlung:** Reihenfolge umdrehen.
1. Erst: PR-Flow + GitHub Actions (CI = lint + build + Vercel Preview)
2. Dann: Telegram Notify (parasitär auf CI-Events)
3. Zuletzt: Telegram Commands (approve/ship)

### 2.2 Telegram Commands sind Day-2+ (nicht Day-1)

`/approve <PR#>` aus Telegram erfordert:
- Einen Bot-Service der Telegram Webhooks empfängt
- Der Service braucht einen GitHub Token (PAT oder GitHub App)
- Authentifizierung: Wer darf approven? (Telegram User ID Whitelist)
- Hosting: Eigene Vercel Route? Cloudflare Worker? → Maintenance
- Sicherheit: Ein kompromittierter Telegram-Bot kann Prod-Deploys auslösen

**Kosten/Nutzen:** Viel Aufwand für wenig Gewinn. GitHub Mobile App kann PRs bereits approven und mergen — und hat bessere Auth (2FA, SSO).

**Empfehlung:**
- Day-1: Nur **Notifications** (GitHub → Telegram, one-way)
- Day-2: `/status` Command (read-only, kein Schreibzugriff)
- Day-3+: `/approve` nur wenn der read-only Loop sich bewährt hat

### 2.3 GitHub Mobile > Telegram für Approvals

| Kriterium | Telegram Bot | GitHub Mobile |
|-----------|-------------|---------------|
| PR Review + Approve | Muss gebaut werden | Built-in |
| Diff ansehen | Nicht möglich | Built-in |
| Merge | Muss gebaut werden | Built-in |
| 2FA / SSO | Telegram User ID | GitHub Auth |
| Maintenance | Eigener Service | Null |
| Kosten | Bot-Hosting + Dev-Time | Gratis |

**Empfehlung:** GitHub Mobile für Approvals. Telegram für **proaktive Notifications** (Push statt Pull). Beides ergänzt sich, aber Telegram ersetzt nicht GitHub.

### 2.4 Token-Effizienz — konkreter Vorschlag

```
HEUTE:
  Opus 4.6 für ALLES (Code, Mechanik, Docs, Chat) → teuer, aber leistungsstark

VORSCHLAG:
  ┌─────────────────────────┬──────────────────┬─────────────────┐
  │ Task-Typ                │ Modell           │ Warum           │
  ├─────────────────────────┼──────────────────┼─────────────────┤
  │ Architektur/Debugging   │ Opus 4.6         │ Braucht Tiefe   │
  │ Code schreiben/refactor │ Sonnet 4.6       │ 80% der Arbeit  │
  │ Mechanik (CI, Templates)│ Haiku 4.5        │ Schnell + billig│
  │ Strategie/Planung       │ GPT-4o (ChatGPT) │ Sowieso da      │
  │ Docs/Formatting         │ Haiku 4.5        │ Trivial          │
  └─────────────────────────┴──────────────────┴─────────────────┘
```

**Konkreter Cursor-Tipp:** In Cursor kannst du pro Chat das Modell wählen. Default auf Sonnet setzen, Opus nur für harte Probleme. Claude Code CLI unterstützt `--model` Flag und `/model` im Chat.

### 2.5 Nicht-agentische Zonen (Frage 9)

**NIEMALS automatisieren (immer Human-Gate):**
- Prod-Deploy (Merge to main)
- Secrets/Env Var Änderungen
- Supabase Migrations (Schema-Änderungen)
- Retell Agent Publish (Voice geht live)
- Twilio/Peoplefone Änderungen (Telefonrouting)
- Billing/Verträge
- Kundenkommunikation (E-Mails an Dörfler etc.)

**Safe für Automation:**
- Lint + Build Checks
- Vercel Preview Deploys
- Telegram Notifications (read-only)
- Smoke Tests (health, voice pipeline check)
- SSOT-Updates in docs/ (PRs, nicht direkt main)

### 2.6 Dropzone ja, aber schlank

Der Prompt schlägt `docs/briefings/`, `docs/decisions/`, `docs/inputs/` vor. Das sind 3 neue Ordner + Templates. Risiko: Overhead > Nutzen.

**Empfehlung:**
- `docs/briefings/` — JA (frei-formatierte Inputs, datiert)
- `docs/decisions/` — JA (aber nur wenn es echte Entscheidungen gibt, kein Overhead)
- `docs/inputs/` — NEIN (zu generisch, wird zur Müllhalde). Inputs gehören als Attachment in das jeweilige Briefing oder als Kontext ins Decision-Doc.

---

## 3. Empfohlene Architektur (Frage 4 + Gesamtempfehlung)

### Variante 3 (empfohlen): Notifications Day-1, Commands Day-2

```
DAY-1 ARCHITEKTUR:

  Developer (CC/Founder)
       │
       ▼
  Feature Branch → Push → PR erstellen
       │
       ▼
  GitHub Actions (.github/workflows/ci.yml)
       ├── ESLint (--max-warnings 0)
       ├── next build
       └── Vercel Preview (automatisch via Vercel GitHub Integration)
       │
       ▼
  Telegram Notification (via GitHub Actions → Bot API HTTP POST)
       "✅ PR #12 ready: [Preview] [PR Link] | Lint ✅ Build ✅"
       oder
       "❌ PR #12 failed: ESLint 3 errors | [Details]"
       │
       ▼
  Founder (Handy)
       ├── Review in GitHub Mobile App
       ├── Approve + Merge (GitHub Mobile)
       └── Vercel Prod Deploy (automatisch bei Merge to main)
       │
       ▼
  Telegram Notification
       "🚀 Shipped: PR #12 merged → Prod deploying"
```

**Warum Variante 3:**
- **Stabilität:** GitHub Actions + Telegram Bot API sind battle-tested. Kein eigener Service.
- **Sicherheit:** Telegram ist read-only (kein Schreibzugriff auf GitHub). Keine Token-Exposition.
- **Aufwand:** ~2-3h für den gesamten Day-1 Scope.
- **Keine neue Infrastruktur:** Kein Bot-Server, kein Cloudflare Worker, kein Extra-Hosting.

### Benötigte Secrets (Frage 5, konkret)

```
GITHUB SECRETS (Repository Settings → Secrets):
  TELEGRAM_BOT_TOKEN    — vom BotFather (einmalig erstellen)
  TELEGRAM_CHAT_ID      — Chat-ID des "FlowSight Ops" Kanals

Das war's. Keine weiteren Secrets nötig für Day-1.
Vercel bleibt SSOT für App-Secrets. GitHub Secrets nur für CI.
```

### Day-2 Erweiterungen (falls gewünscht)

```
DAY-2 (nach 1-2 Wochen Nutzung):
  - /status Command: Telegram Bot → GitHub API (read-only) → "3 open PRs, last deploy 2h ago"
  - Branch Protection Rules: Require CI pass + 1 approval before merge
  - Daily Digest: GitHub Action (cron) → Telegram Summary (offene PRs, letzte Deploys)

DAY-3+ (nur wenn nötig):
  - /approve Command: Telegram → Vercel Function → GitHub API (approve PR)
  - Voice-to-task: Telegram Voice → Whisper → Ticket Draft
```

---

## 4. Phasen-Split (Frage 10)

### Day-1 (MUST — heute umsetzbar)

| # | Task | Aufwand | Output |
|---|------|---------|--------|
| 1 | Telegram Bot erstellen (BotFather) | 5 Min | Bot Token |
| 2 | Telegram Channel "FlowSight Ops" erstellen | 5 Min | Chat ID |
| 3 | GitHub Secrets setzen (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID) | 2 Min | Done |
| 4 | `.github/workflows/ci.yml` — Lint + Build + Telegram Notify | 30 Min | CI Pipeline |
| 5 | `.github/workflows/notify-merge.yml` — Post-Merge Notification | 15 Min | Ship Alert |
| 6 | `docs/briefings/` + `docs/decisions/` + Templates anlegen | 15 Min | Dropzone |
| 7 | OPS_BOARD.md + STATUS.md updaten | 10 Min | SSOT |
| 8 | Erster PR erstellen → CI laufen lassen → Telegram testen | 15 Min | Evidence |

**Gesamt Day-1: ~1.5h**

### Day-2 (NICE — diese Woche)

| # | Task | Aufwand |
|---|------|---------|
| 9 | Branch Protection Rules (require CI + review) | 10 Min |
| 10 | `/status` Telegram Command (read-only) | 2h |
| 11 | PR-Template (`.github/pull_request_template.md`) | 10 Min |
| 12 | Daily Digest Cron (offene PRs + Blocker) | 1h |

---

## 5. Antworten auf die 10 Fragen (Kompakt)

| # | Frage | Antwort |
|---|-------|---------|
| 1 | Deploy-Flow? | Push to main → Vercel auto-deploy (Prod). Kein PR-Flow, kein Preview genutzt, kein Gate. |
| 2 | CI-Checks? | Keine automatisierten. Manuell: ESLint + next build. Keine Tests (kein Jest/Vitest/Playwright). |
| 3 | Beste Approval-Stellschraube? | **GitHub Branch Protection + Required Status Checks.** Einfachstes, robustestes Gate. Labels/Environments sind Overkill für Solo-Founder. |
| 4 | Minimal-sicherer Weg für Telegram Commands? | Day-1: Keine Commands (nur Notifications). Day-2: Read-only `/status` via Bot Webhook → GitHub API mit read-only PAT. Approve erst Day-3. |
| 5 | Welche Secrets? | Nur 2: `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` in GitHub Secrets. Alles andere bleibt Vercel. |
| 6 | SSOT-Dateien? | STATUS.md, OPS_BOARD.md, CLAUDE.md, business_briefing.md, runbooks/. NEU: briefings/, decisions/. |
| 7 | Bestehende Ähnlichkeiten? | WhatsApp Morning Report (manuell). Sonst: nichts. Kein Slack, kein Webhook, kein Telegram. |
| 8 | Was würde ich ändern? | (a) CI vor Telegram, (b) GitHub Mobile statt Telegram für Approvals, (c) Commands erst Day-3, (d) Dropzone schlanker. Siehe Abschnitt 2. |
| 9 | Nicht-agentisch? | Prod-Deploy, Secrets, Migrations, Voice Publish, Telefon-Routing, Billing, Kundenkommunikation. Siehe Abschnitt 2.5. |
| 10 | Day-1 vs Day-2? | Day-1: CI + Telegram Notify + Dropzone + SSOT. Day-2: Branch Protection + /status Command + Daily Digest. Siehe Abschnitt 4. |

---

## 6. CI Workflow (Draft — ready to implement)

```yaml
# .github/workflows/ci.yml (DRAFT)
name: CI
on:
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: src/web
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: src/web/package-lock.json
      - run: npm ci
      - run: npx eslint . --max-warnings 0
      - run: npx next build
        env:
          # Minimal env for build (no runtime secrets needed)
          NEXT_PUBLIC_SUPABASE_URL: "https://placeholder.supabase.co"
          NEXT_PUBLIC_SUPABASE_ANON_KEY: "placeholder"
          NEXT_PUBLIC_SENTRY_DSN: ""
          NEXT_PUBLIC_APP_URL: "https://preview.vercel.app"

  notify:
    needs: check
    if: always()
    runs-on: ubuntu-latest
    steps:
      - name: Telegram Notification
        run: |
          if [ "${{ needs.check.result }}" = "success" ]; then
            STATUS="✅ CI passed"
          else
            STATUS="❌ CI failed"
          fi
          TEXT="${STATUS}
          PR: #${{ github.event.pull_request.number }} — ${{ github.event.pull_request.title }}
          Preview: (Vercel link in PR comments)
          → ${{ github.event.pull_request.html_url }}"

          curl -s -X POST "https://api.telegram.org/bot${{ secrets.TELEGRAM_BOT_TOKEN }}/sendMessage" \
            -d chat_id="${{ secrets.TELEGRAM_CHAT_ID }}" \
            -d text="$TEXT" \
            -d parse_mode="Markdown"
```

```yaml
# .github/workflows/notify-merge.yml (DRAFT)
name: Ship Notification
on:
  push:
    branches: [main]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Telegram Ship Alert
        run: |
          TEXT="🚀 Shipped to Prod
          Commit: ${{ github.event.head_commit.message }}
          By: ${{ github.event.head_commit.author.name }}
          → Vercel deploying (~90s)"

          curl -s -X POST "https://api.telegram.org/bot${{ secrets.TELEGRAM_BOT_TOKEN }}/sendMessage" \
            -d chat_id="${{ secrets.TELEGRAM_CHAT_ID }}" \
            -d text="$TEXT"
```

---

## 7. Doc Templates (Draft)

### Briefing Template (`docs/briefings/TEMPLATE.md`)
```markdown
# Briefing: [Thema]
**Datum:** YYYY-MM-DD
**Quelle:** [Wer/Was hat diesen Input geliefert]
**Kontext:** [1-2 Sätze warum das relevant ist]

## Input
[Freitext, Transkript, Screenshot-Beschreibung, Link]

## Takeaway
[Was soll damit passieren? → OPS_BOARD Task? Decision? Ignorieren?]
```

### Decision Template (`docs/decisions/TEMPLATE.md`)
```markdown
# DEC-XXX: [Entscheidungstitel]
**Datum:** YYYY-MM-DD
**Status:** proposed | accepted | rejected | superseded
**Owner:** [Wer entscheidet]

## Kontext
[Warum steht diese Entscheidung an?]

## Optionen
| Option | Pro | Contra | Aufwand |
|--------|-----|--------|---------|
| A      |     |        |         |
| B      |     |        |         |

## Entscheidung
[Welche Option wurde gewählt und warum]

## Risiken
[Was kann schiefgehen, Mitigations]
```

---

## 8. Founder Handy-Workflow (How to Operate)

```
TÄGLICHER LOOP (Handy-first):

  📱 Telegram "FlowSight Ops"
     ├── Push-Notifications für: PR ready, CI fail, Shipped
     └── Schneller Überblick ohne Terminal

  📱 GitHub Mobile App
     ├── PR-Details, Diff, Comments
     ├── Approve / Request Changes
     ├── Merge to main (= Ship to Prod)
     └── Issues / Discussions

  💻 Terminal (nur wenn nötig)
     ├── CC-Sessions für Implementierung
     ├── Voice Agent Testing
     └── Supabase Migrations

ENTSCHEIDUNGS-FLOW:
  1. CC erstellt PR + pusht Branch
  2. Telegram: "✅ PR #12 ready — [Preview Link]"
  3. Founder: Öffnet Preview auf Handy, prüft
  4. Founder: GitHub Mobile → Approve + Merge
  5. Telegram: "🚀 Shipped"
  6. Founder: Preview auf Prod prüfen (flowsight.ch)

ZEITAUFWAND PRO TAG:
  - Telegram checken: 2 Min
  - PRs reviewen: 5-15 Min
  - Terminal (falls Implementierung läuft): variabel
```

---

## 9. Offene Punkte / Assumptions

1. **Vercel GitHub Integration** — Ist die Vercel-GitHub-App installiert? (Prüfen: GitHub Repo Settings → Integrations). Falls ja, erzeugt Vercel automatisch Preview-Links als PR-Kommentar. Falls nein, muss das eingerichtet werden.

2. **`next build` in CI braucht Env Vars** — Der Build importiert Supabase/Sentry. In CI gibt es keine echten Secrets. Lösung: Placeholder-Werte für `NEXT_PUBLIC_*` Vars (nur Build, kein Runtime). Muss getestet werden.

3. **Vercel Hobby hat kein "Environment Protection"** — Prod-Deploy passiert automatisch bei Merge. Es gibt keinen Vercel-seitigen Gate. Das Gate muss über GitHub Branch Protection laufen (require CI pass + review).

4. **Founder muss Telegram Bot erstellen** — CC kann den BotFather-Flow nicht ausführen (braucht Telegram-Account). CC kann alles andere.

5. **Cursor vs. Claude Code CLI** — Der User nutzt CC aktuell nur via PowerShell/Cursor. Cursor hat eigene Claude-Integration (Cursor Tab, Chat). Mögliche Optimierung: Cursor für schnelle Edits (Sonnet), CC CLI für komplexe Sessions (Opus).

---

## 10. Risiken

| Risiko | Impact | Mitigation |
|--------|--------|------------|
| CI Build braucht echte Env Vars | CI blockiert | Placeholder-Werte testen, ggf. `.env.ci` |
| Telegram Bot Token leaked | Spam, Impersonation | GitHub Secret + Bot nur in privaten Channel |
| PR-Flow verlangsamt Hotfixes | Prod-Bug bleibt länger | Dokumentierter "Emergency Direct Push" Pfad |
| Founder vergisst PR zu mergen | Feature bleibt liegen | Telegram Reminder nach 24h (Day-2) |
| Vercel Preview URLs sind öffentlich | Staging-Leaks | Acceptable Risk für MVP (keine Secrets in Frontend) |

---

## 11. CC-Empfehlung an GPT (CTO)

**Die Vision "Remote-CTO Loop" ist richtig.** Aber der Prompt überspringt das Fundament. Meine empfohlene Reihenfolge:

1. **CI-Pipeline (GitHub Actions)** — Ohne das gibt es nichts zu notifizieren.
2. **PR-basierter Flow** — Branch → PR → CI → Preview → Review → Merge → Prod.
3. **Telegram Notifications** — Parasitär auf CI-Events. Kein eigener Service.
4. **GitHub Mobile für Approvals** — Besser als Custom Telegram Bot. Schon da, kostet nichts.
5. **Docs Dropzone** — Briefings + Decisions als leichte Struktur.
6. **Token-Optimierung** — Sonnet als Default, Opus nur für harte Probleme.
7. **Telegram Commands (Day-3+)** — Nur wenn der read-only Loop bewiesen ist.

**Was GPT als CTO jetzt entscheiden sollte:**
- Go/No-Go für diesen Plan
- Soll CC direkt implementieren (Day-1 Scope)?
- Telegram Bot erstellen (Founder-Aufgabe, 5 Min)
- GitHub Branch Protection aktivieren (Founder-Aufgabe, 2 Min)
- Cursor Model-Default auf Sonnet setzen (Token-Saving)

---

*Erstellt von Claude Code (Opus 4.6) | FlowSight Head Ops | 2026-03-02*
