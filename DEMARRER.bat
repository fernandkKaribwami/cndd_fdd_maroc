@echo off
echo ============================================================
echo   CNDD-FDD Section Maroc - Demarrage de l'application
echo ============================================================
echo.

REM ── Demarrer le Backend Django ──────────────────────────────
echo [1/2] Demarrage du Backend Django (port 8000)...
start "Backend CNDD-FDD" cmd /k "cd /d %~dp0backend && (if exist venv\Scripts\activate.bat (call venv\Scripts\activate.bat) else (echo Venv non trouve, utilisation Python systeme)) && python manage.py runserver 0.0.0.0:8000"

timeout /t 3 /nobreak >nul

REM ── Demarrer le Frontend Next.js ────────────────────────────
echo [2/2] Demarrage du Frontend Next.js (port 3000)...
start "Frontend CNDD-FDD" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ============================================================
echo   Application disponible sur: http://localhost:3000
echo   API Backend sur:            http://localhost:8000/api
echo   Admin Django sur:           http://localhost:8000/admin
echo ============================================================
echo.
pause
