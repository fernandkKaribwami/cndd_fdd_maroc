@echo off
echo ============================================================
echo   CNDD-FDD Section Maroc - Configuration Base de Donnees
echo ============================================================
echo.
echo IMPORTANT: PostgreSQL doit etre installe et en cours d'execution
echo.

REM ── Creer la base de donnees et l'utilisateur ───────────────
echo [1/4] Creation de la base de donnees PostgreSQL...
psql -U postgres -c "CREATE DATABASE cndd_fdd_maroc;" 2>nul || echo Base deja existante
psql -U postgres -c "CREATE USER cndd_fdd WITH PASSWORD 'CnddFdd2026';" 2>nul || echo Utilisateur deja existant
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE cndd_fdd_maroc TO cndd_fdd;"
psql -U postgres -c "ALTER USER cndd_fdd CREATEDB;"

echo.
echo [2/4] Application des migrations Django...
cd /d %~dp0backend
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)
python manage.py migrate

echo.
echo [3/4] Chargement des donnees initiales (cycles, filieres, niveaux)...
python manage.py loaddata core/fixtures/initial_data.json

echo.
echo [4/4] Creation du superutilisateur admin...
echo Entrez les informations pour le compte administrateur:
python manage.py createsuperuser

echo.
echo ============================================================
echo   Configuration terminee!
echo   Lancez DEMARRER.bat pour demarrer l'application
echo ============================================================
pause
