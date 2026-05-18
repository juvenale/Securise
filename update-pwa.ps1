$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$swPath    = Join-Path $scriptDir "react-pwa\public\sw.js"
$distDir   = Join-Path $scriptDir "react-pwa\dist"

# --- Bump service worker cache version ---
$swContent = Get-Content $swPath -Raw
if ($swContent -match 'CACHE_NAME\s*=\s*"sy701-react-pwa-v(\d+)"') {
  $oldVersion = [int]$Matches[1]
  $newVersion = $oldVersion + 1
  $swContent  = $swContent -replace "sy701-react-pwa-v$oldVersion", "sy701-react-pwa-v$newVersion"
  Set-Content $swPath $swContent -NoNewline
  Write-Host "Service worker: v$oldVersion -> v$newVersion" -ForegroundColor Cyan
} else {
  Write-Host "Could not find cache version in sw.js — skipping version bump." -ForegroundColor Yellow
}

# --- Build ---
Write-Host ""
Write-Host "Building..." -ForegroundColor Cyan
Set-Location (Join-Path $scriptDir "react-pwa")
npm run build
if ($LASTEXITCODE -ne 0) {
  Write-Host "Build failed. Fix the errors above before deploying." -ForegroundColor Red
  exit 1
}

# --- Copy _redirects (Netlify SPA routing) ---
Copy-Item (Join-Path $scriptDir "react-pwa\public\_redirects") (Join-Path $distDir "_redirects") -Force

Write-Host ""
Write-Host "Build complete." -ForegroundColor Green
Write-Host "--------------------------------------"
Write-Host "To deploy on Netlify:"
Write-Host "  - Drag the folder below onto netlify.com" -ForegroundColor Yellow
Write-Host "    $distDir"
Write-Host ""
Write-Host "  - OR if connected to GitHub, just git push — Netlify redeploys automatiquement."
Write-Host ""
