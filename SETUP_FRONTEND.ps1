# ============================================================
#  Setup Frontend Next.js - CNDD-FDD Maroc
# ============================================================

Write-Host "=== Setup Frontend Next.js ===" -ForegroundColor Cyan

Set-Location "$PSScriptRoot\frontend"

# ─── Installation packages npm ────────────────────────────────────────────────
Write-Host "`n[1/2] Installation des packages npm..." -ForegroundColor Yellow
npm install
Write-Host "  Packages installes." -ForegroundColor Green

# ─── Fichier .env.local ───────────────────────────────────────────────────────
Write-Host "`n[2/2] Creation du .env.local frontend..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Set-Content -Path ".env.local" -Value "NEXT_PUBLIC_API_URL=http://localhost:8000/api"
    Write-Host "  .env.local cree." -ForegroundColor Green
} else {
    Write-Host "  .env.local existe deja." -ForegroundColor Gray
}

Write-Host "`n=== Frontend pret ! ===" -ForegroundColor Cyan
Write-Host "Lancez le serveur avec:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor White
Write-Host "Puis ouvrez: http://localhost:3000" -ForegroundColor White
