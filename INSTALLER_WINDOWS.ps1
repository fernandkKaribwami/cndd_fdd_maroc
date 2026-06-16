# ============================================================
#  Script d'installation automatique - CNDD-FDD Maroc
#  Exécuter en tant qu'Administrateur
# ============================================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Installation CNDD-FDD Maroc - Windows" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Vérifier si winget est disponible
$hasWinget = $null -ne (Get-Command winget -ErrorAction SilentlyContinue)
if (-not $hasWinget) {
    Write-Host "[ERREUR] winget non disponible. Mettez a jour Windows depuis le Microsoft Store." -ForegroundColor Red
    exit 1
}

# ─── 1. Python 3.12 ───────────────────────────────────────────────────────────
Write-Host "`n[1/4] Installation de Python 3.12..." -ForegroundColor Yellow
winget install Python.Python.3.12 --accept-package-agreements --accept-source-agreements
if ($?) { Write-Host "  Python installe avec succes." -ForegroundColor Green }

# Recharger le PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# ─── 2. Node.js LTS ───────────────────────────────────────────────────────────
Write-Host "`n[2/4] Installation de Node.js LTS..." -ForegroundColor Yellow
winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
if ($?) { Write-Host "  Node.js installe avec succes." -ForegroundColor Green }

# Recharger le PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# ─── 3. Git ───────────────────────────────────────────────────────────────────
Write-Host "`n[3/4] Installation de Git..." -ForegroundColor Yellow
winget install Git.Git --accept-package-agreements --accept-source-agreements
if ($?) { Write-Host "  Git installe avec succes." -ForegroundColor Green }

# ─── 4. PostgreSQL ────────────────────────────────────────────────────────────
Write-Host "`n[4/4] Installation de PostgreSQL 16..." -ForegroundColor Yellow
winget install PostgreSQL.PostgreSQL.16 --accept-package-agreements --accept-source-agreements
if ($?) { Write-Host "  PostgreSQL installe avec succes." -ForegroundColor Green }

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  Installation terminee !" -ForegroundColor Cyan
Write-Host "  IMPORTANT: Redemarrez votre terminal PowerShell" -ForegroundColor Yellow
Write-Host "  puis suivez le fichier GUIDE_DEMARRAGE.md" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
