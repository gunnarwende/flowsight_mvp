# scripts/env_to_gh_secrets.ps1 — Mirror .env.local into GitHub Actions Secrets (no drift)
#
# SSOT chain:  Vercel (truth) -> env_sync.ps1 -> src/web/.env.local -> THIS -> GitHub Secrets
#
# Run env_sync.ps1 FIRST so .env.local is a fresh mirror of Vercel production.
# This script then pushes every real business key into the repo's Actions Secrets,
# which is the "mobile path": anything triggered via workflow_dispatch then has full
# key access in the cloud, so phone == laptop.
#
# Never prints values. Skips Vercel/build system vars + empties. Flags forbidden names.
# Each set has a hard timeout so one bad key can never hang the whole run.
#
# Usage:
#   pwsh scripts/env_to_gh_secrets.ps1            # live: sets secrets
#   pwsh scripts/env_to_gh_secrets.ps1 -DryRun    # plan only, sets nothing

param(
    [string]$EnvFile  = "src/web/.env.local",
    [string]$Repo     = "gunnarwende/flowsight_mvp",
    [int]$TimeoutSec  = 20,
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not (Test-Path $EnvFile)) {
    Write-Error "Env file not found: $EnvFile  (run scripts/env_sync.ps1 first)"
    exit 1
}

# ── Vars that must NEVER be mirrored to GitHub Secrets ──────────────────────
$SkipExact  = @("VERCEL", "NX_DAEMON")
$SkipPrefix = @("VERCEL_", "TURBO_")

function Test-Forbidden([string]$name) { return $name -like "GITHUB_*" }  # GitHub rejects GITHUB_*
function Test-Skip([string]$name) {
    if ($SkipExact -contains $name) { return $true }
    foreach ($p in $SkipPrefix) { if ($name.StartsWith($p)) { return $true } }
    return $false
}

# ── First pass: parse names (file order) so we can show [i/total] progress ──
$entries = @()
foreach ($line in Get-Content $EnvFile) {
    if ($line -notmatch '^[A-Za-z_][A-Za-z0-9_]*=') { continue }
    $idx  = $line.IndexOf('=')
    $name = $line.Substring(0, $idx)
    $raw  = $line.Substring($idx + 1)
    $val  = $raw
    if ($val.Length -ge 2 -and $val.StartsWith('"') -and $val.EndsWith('"')) {
        $val = $val.Substring(1, $val.Length - 2)
        $val = $val -replace '\\n', "`n" -replace '\\"', '"'
    }
    $entries += [pscustomobject]@{ Name = $name; Value = $val }
}

$toSet     = @($entries | Where-Object { -not (Test-Skip $_.Name) -and -not (Test-Forbidden $_.Name) -and $_.Value -ne "" })
$skipped   = @($entries | Where-Object { Test-Skip $_.Name } | ForEach-Object Name)
$forbidden = @($entries | Where-Object { Test-Forbidden $_.Name } | ForEach-Object Name)
$empty     = @($entries | Where-Object { -not (Test-Skip $_.Name) -and -not (Test-Forbidden $_.Name) -and $_.Value -eq "" } | ForEach-Object Name)

$setOk = @(); $failed = @(); $timedOut = @()
$tmp = [System.IO.Path]::GetTempFileName()
$total = $toSet.Count
$i = 0

try {
    foreach ($e in $toSet) {
        $i++
        Write-Host ("[{0,2}/{1}] {2}" -f $i, $total, $e.Name) -NoNewline
        if ($DryRun) { Write-Host "  (dry-run)" -ForegroundColor DarkGray; $setOk += $e.Name; continue }

        # Exact bytes, no trailing newline -> fed to gh via stdin
        [System.IO.File]::WriteAllText($tmp, $e.Value)
        $err = [System.IO.Path]::GetTempFileName()
        $p = Start-Process -FilePath "gh" `
            -ArgumentList @("secret", "set", $e.Name, "--repo", $Repo) `
            -RedirectStandardInput $tmp -RedirectStandardError $err `
            -NoNewWindow -PassThru
        try {
            Wait-Process -Id $p.Id -Timeout $TimeoutSec -ErrorAction Stop
            if ($p.ExitCode -eq 0) { Write-Host "  ok" -ForegroundColor Green; $setOk += $e.Name }
            else { Write-Host "  FAIL" -ForegroundColor Red; $failed += $e.Name }
        } catch {
            try { Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue } catch {}
            Write-Host "  TIMEOUT" -ForegroundColor Yellow; $timedOut += $e.Name
        } finally {
            Remove-Item $err -ErrorAction SilentlyContinue
        }
    }
} finally {
    Remove-Item $tmp -ErrorAction SilentlyContinue
}

# ── Report (names only, never values) ───────────────────────────────────────
$verb = if ($DryRun) { "WOULD SET" } else { "SET ok" }
Write-Host "`n$verb : $(@($setOk).Count)" -ForegroundColor Green
if (@($empty).Count)     { Write-Host "EMPTY (skipped): $($empty -join ', ')" -ForegroundColor DarkYellow }
if (@($forbidden).Count) { Write-Host "FORBIDDEN GITHUB_* (rename in Vercel+code): $($forbidden -join ', ')" -ForegroundColor Yellow }
if (@($timedOut).Count)  { Write-Host "TIMED OUT: $($timedOut -join ', ')" -ForegroundColor Yellow }
if (@($failed).Count)    { Write-Host "FAILED: $($failed -join ', ')" -ForegroundColor Red }
Write-Host "SKIPPED system vars: $(@($skipped).Count)" -ForegroundColor DarkGray
Write-Host "Done $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')." -ForegroundColor Green
if (-not $DryRun -and (@($failed).Count -or @($timedOut).Count)) { exit 1 }
