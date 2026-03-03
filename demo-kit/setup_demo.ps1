# =============================================================================
# FlowSight Demo Kit — One-Click Setup
# Run: powershell -ExecutionPolicy Bypass -File demo-kit\setup_demo.ps1
# =============================================================================
$ErrorActionPreference = "Stop"
$DemoKit = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "  ========================================" -ForegroundColor Cyan
Write-Host "    FlowSight Demo Kit Setup" -ForegroundColor Cyan
Write-Host "  ========================================" -ForegroundColor Cyan
Write-Host ""

# ---------------------------------------------------------------------------
# Step 1: Install MicroSIP via winget
# ---------------------------------------------------------------------------
Write-Host "[1/5] MicroSIP installieren..." -ForegroundColor Yellow

$microsipExe = Get-Command microsip -ErrorAction SilentlyContinue
if ($microsipExe) {
    Write-Host "  PASS: MicroSIP bereits installiert ($($microsipExe.Source))" -ForegroundColor Green
} else {
    Write-Host "  Installiere MicroSIP via winget..." -ForegroundColor White
    winget install --id MicroSIP.MicroSIP --accept-package-agreements --accept-source-agreements
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  PASS: MicroSIP installiert" -ForegroundColor Green
    } else {
        Write-Host "  FAIL: winget install fehlgeschlagen." -ForegroundColor Red
        Write-Host "  Manuell: https://www.microsip.org/downloads" -ForegroundColor Yellow
    }
}

# ---------------------------------------------------------------------------
# Step 2: Windows Audio — Exclusive Mode deaktivieren
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host "[2/5] Windows Audio Exclusive Mode pruefen..." -ForegroundColor Yellow
Write-Host "  ACHTUNG: Dieser Schritt muss manuell gemacht werden:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Rechtsklick auf Lautsprecher-Icon (Taskbar) > Sound-Einstellungen" -ForegroundColor White
Write-Host "  2. 'Weitere Soundeinstellungen' (ganz unten)" -ForegroundColor White
Write-Host "  3. Tab 'Wiedergabe' > Speakers/Lautsprecher > Eigenschaften" -ForegroundColor White
Write-Host "  4. Tab 'Erweitert'" -ForegroundColor White
Write-Host "  5. DEAKTIVIEREN: 'Anwendungen die alleinige Kontrolle ueber dieses" -ForegroundColor Red
Write-Host "     Geraet erlauben' (Exclusive Mode)" -ForegroundColor Red
Write-Host "  6. OK > OK" -ForegroundColor White
Write-Host ""
Write-Host "  Warum: Verhindert, dass MicroSIP Audio aufs Headset lockt" -ForegroundColor Gray
Write-Host "         statt auf System-Speakers (die Teams teilt)." -ForegroundColor Gray

# Open Sound settings for convenience
Write-Host ""
$openSound = Read-Host "  Sound-Einstellungen jetzt oeffnen? (j/n)"
if ($openSound -eq "j") {
    Start-Process "ms-settings:sound"
    Write-Host "  Sound-Einstellungen geoeffnet." -ForegroundColor Green
}

# ---------------------------------------------------------------------------
# Step 3: Audio Devices auflisten
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host "[3/5] Audio-Geraete:" -ForegroundColor Yellow

Write-Host ""
Write-Host "  Wiedergabe-Geraete:" -ForegroundColor White
Get-CimInstance Win32_SoundDevice | Where-Object { $_.Status -eq "OK" } |
    ForEach-Object { Write-Host "    - $($_.Name)" -ForegroundColor Gray }

Write-Host ""
Write-Host "  WICHTIG fuer MicroSIP Konfiguration:" -ForegroundColor Yellow
Write-Host "  - Audio Output: Auf 'Speakers' setzen (NICHT Headset)" -ForegroundColor White
Write-Host "  - Audio Input:  Auf 'Headset-Mikro' setzen" -ForegroundColor White
Write-Host "  - So geht Lisa-Audio auf System-Speakers > Teams teilt es" -ForegroundColor White
Write-Host "  - Founder-Stimme geht uebers Headset-Mikro > Teams Mikrofon" -ForegroundColor White

# ---------------------------------------------------------------------------
# Step 4: Twilio SIP Setup Hinweis
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host "[4/5] Twilio SIP Setup (fuer Founder + ChatGPT):" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Detaillierte Anleitung: demo-kit\TWILIO_SIP_SETUP.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Kurzfassung (3 Schritte in Twilio Console):" -ForegroundColor White
Write-Host "  1. SIP Domain erstellen: flowsight-demo.sip.twilio.com" -ForegroundColor White
Write-Host "  2. Credential List: Username + Passwort anlegen" -ForegroundColor White
Write-Host "  3. TwiML Bin: Voice URL auf Brunner-Nummer +41445054818" -ForegroundColor White
Write-Host ""
Write-Host "  Dann in MicroSIP:" -ForegroundColor White
Write-Host "  Account > SIP Server: flowsight-demo.sip.twilio.com" -ForegroundColor White
Write-Host "  Account > Username/Password: von Schritt 2" -ForegroundColor White

# ---------------------------------------------------------------------------
# Step 5: Zusammenfassung
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host "  ========================================" -ForegroundColor Cyan
Write-Host "    Setup abgeschlossen!" -ForegroundColor Cyan
Write-Host "  ========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Naechste Schritte:" -ForegroundColor Yellow
Write-Host "  1. Exclusive Mode deaktivieren (falls noch nicht gemacht)" -ForegroundColor White
Write-Host "  2. Twilio SIP Setup: demo-kit\TWILIO_SIP_SETUP.md" -ForegroundColor White
Write-Host "  3. MicroSIP konfigurieren (SIP-Credentials + Audio Devices)" -ForegroundColor White
Write-Host "  4. Audio-Proof durchfuehren: demo-kit\AUDIO_PROOF.md" -ForegroundColor White
Write-Host "  5. Demo-Cheat-Sheet lesen: demo-kit\CHEAT_SHEET.md" -ForegroundColor White
Write-Host ""
