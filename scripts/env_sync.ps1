# scripts/env_sync.ps1 — Sync Vercel env vars to local .env.local (no drift)
#
# Usage:   pwsh scripts/env_sync.ps1
# Prereq:  npx vercel login (once, per machine)
#
# How it works:
#   1. Uses a fixed temp dir (no .vercel in repo)
#   2. Runs vercel link + vercel pull in temp dir
#   3. Copies the production env file to src/web/.env.local
#   4. Creates a timestamped backup of the previous .env.local
#   5. Prints key count + required key presence (NEVER values)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ── Paths ─────────────────────────────────────────────────────────────────
$RepoRoot   = (Resolve-Path "$PSScriptRoot\..").Path
$TargetEnv  = Join-Path $RepoRoot "src\web\.env.local"
$TempDir    = "C:\tmp\vercel_envsync_flowsight"

# ── Required keys (presence check, never print values) ────────────────────
$RequiredKeys = @(
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "RESEND_API_KEY",
    "SENTRY_DSN",
    "GOOGLE_REVIEW_URL"
)

# ── Ensure temp dir ───────────────────────────────────────────────────────
if (-not (Test-Path $TempDir)) {
    New-Item -ItemType Directory -Path $TempDir -Force | Out-Null
}

# ── Guard: no .vercel in repo ─────────────────────────────────────────────
$RepoVercel = Join-Path $RepoRoot ".vercel"
if (Test-Path $RepoVercel) {
    Write-Warning "Deleting stale .vercel/ in repo root (CLAUDE.md: never in repo)"
    Remove-Item -Recurse -Force $RepoVercel
}

# ── Step 1: vercel link (idempotent) ──────────────────────────────────────
Write-Host "`n[1/4] Linking Vercel project in temp dir..." -ForegroundColor Cyan
Push-Location $TempDir
try {
    npx vercel link --yes --project flowsight-mvp 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Error "vercel link failed. Run 'npx vercel login' first."
        exit 1
    }
    Write-Host "      Linked." -ForegroundColor Green
} finally {
    Pop-Location
}

# ── Step 2: vercel pull (production) ──────────────────────────────────────
Write-Host "[2/4] Pulling production env..." -ForegroundColor Cyan
Push-Location $TempDir
try {
    npx vercel pull --yes --environment production 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Error "vercel pull failed. Check auth: npx vercel login"
        exit 1
    }
    Write-Host "      Pulled." -ForegroundColor Green
} finally {
    Pop-Location
}

# ── Locate pulled env file ────────────────────────────────────────────────
$PulledEnv = Join-Path $TempDir ".vercel\.env.production.local"
if (-not (Test-Path $PulledEnv)) {
    # Fallback: some versions use .env.local directly
    $PulledEnv = Join-Path $TempDir ".vercel\.env.local"
}
if (-not (Test-Path $PulledEnv)) {
    Write-Error "No env file found in $TempDir\.vercel\. Check vercel pull output."
    exit 1
}

# ── Step 3: Backup existing .env.local ────────────────────────────────────
Write-Host "[3/4] Backing up + copying..." -ForegroundColor Cyan
if (Test-Path $TargetEnv) {
    $ts = Get-Date -Format "yyyyMMdd_HHmmss"
    $BackupPath = "$TargetEnv.bak.$ts"
    Copy-Item $TargetEnv $BackupPath
    Write-Host "      Backup: $BackupPath" -ForegroundColor DarkGray
}

# ── Copy to target ────────────────────────────────────────────────────────
Copy-Item $PulledEnv $TargetEnv -Force
Write-Host "      Updated: $TargetEnv" -ForegroundColor Green

# ── Step 4: Verify keys ──────────────────────────────────────────────────
Write-Host "[4/4] Verifying keys..." -ForegroundColor Cyan
$EnvContent = Get-Content $TargetEnv
$KeysFound = ($EnvContent | Where-Object { $_ -match "^\w+=" }) |
    ForEach-Object { ($_ -split "=", 2)[0] }

$TotalKeys = $KeysFound.Count
Write-Host "      Total keys: $TotalKeys" -ForegroundColor White

foreach ($rk in $RequiredKeys) {
    $present = $KeysFound -contains $rk
    $status = if ($present) { "YES" } else { "MISSING" }
    $color = if ($present) { "Green" } else { "Red" }
    Write-Host "      $rk : $status" -ForegroundColor $color
}

# ── Guard: confirm no .vercel in repo ─────────────────────────────────────
if (Test-Path $RepoVercel) {
    Remove-Item -Recurse -Force $RepoVercel
    Write-Warning "Cleaned up stale .vercel/ in repo root."
}

Write-Host "`nDone. Env synced at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')." -ForegroundColor Green
