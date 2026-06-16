# ============================================================
#  Setup Backend Django - CNDD-FDD Maroc
#  Lancer depuis le dossier cndd_fdd_maroc/
# ============================================================

Write-Host "=== Setup Backend Django ===" -ForegroundColor Cyan

Set-Location "$PSScriptRoot\backend"

# ─── Environnement virtuel ────────────────────────────────────────────────────
Write-Host "`n[1/5] Creation de l'environnement virtuel..." -ForegroundColor Yellow
python -m venv venv
Write-Host "  OK" -ForegroundColor Green

# ─── Activation venv ─────────────────────────────────────────────────────────
Write-Host "`n[2/5] Activation du venv et installation des packages..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# ─── Installation packages ────────────────────────────────────────────────────
pip install --upgrade pip
pip install -r requirements.txt
Write-Host "  Packages installes." -ForegroundColor Green

# ─── Fichier .env ────────────────────────────────────────────────────────────
Write-Host "`n[3/5] Creation du fichier .env..." -ForegroundColor Yellow
Set-Location $PSScriptRoot

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "  .env cree depuis .env.example" -ForegroundColor Green
    Write-Host "  IMPORTANT: Editez .env avec vos vrais mots de passe !" -ForegroundColor Red
} else {
    Write-Host "  .env existe deja." -ForegroundColor Gray
}

# ─── Migrations ───────────────────────────────────────────────────────────────
Write-Host "`n[4/5] Migrations de la base de donnees..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\backend"
& ".\venv\Scripts\Activate.ps1"
python manage.py makemigrations
python manage.py migrate
Write-Host "  Migrations appliquees." -ForegroundColor Green

# ─── Chargement des données de référence ─────────────────────────────────────
Write-Host "`n[5/5] Chargement des donnees de reference..." -ForegroundColor Yellow
python manage.py shell -c @"
from core.models import Cycle, Domaine, Filiere, Niveau

# Cycles
cycles = [
    ('Licence (Bac+3)', 1), ('Master (Bac+5)', 2),
    ('Doctorat (Bac+8)', 3), ('Classes preparatoires', 0),
    ('BTS/DUT', 0), ('Formation professionnelle', 0),
    ('Ingenieur', 2),
]
for nom, ordre in cycles:
    Cycle.objects.get_or_create(nom=nom, defaults={'ordre': ordre})

# Domaines
domaines_data = [
    'Ingenierie & Sciences', 'Medecine & Sante', 'Economie & Gestion',
    'Droit & Sciences Politiques', 'Sciences Humaines & Sociales',
    'Langues & Litterature', 'Agriculture & Agronomie',
    'Architecture & Urbanisme', 'Arts & Design', 'Informatique',
]
for nom in domaines_data:
    Domaine.objects.get_or_create(nom=nom)

# Niveaux
niveaux = [
    ('1ere annee', 1), ('2eme annee', 2), ('3eme annee', 3),
    ('4eme annee', 4), ('5eme annee', 5), ('These / Doctorat', 6),
]
for nom, ordre in niveaux:
    Niveau.objects.get_or_create(nom=nom, defaults={'ordre': ordre})

print('Donnees de reference chargees !')
"@
Write-Host "  Donnees de reference creees." -ForegroundColor Green

Write-Host "`n=== Backend pret ! ===" -ForegroundColor Cyan
Write-Host "Creez un superuser avec:" -ForegroundColor Yellow
Write-Host "  cd backend && venv\Scripts\activate && python manage.py createsuperuser" -ForegroundColor White
Write-Host "Lancez le serveur avec:" -ForegroundColor Yellow
Write-Host "  python manage.py runserver" -ForegroundColor White
