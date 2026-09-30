@echo off
REM Reserva Verde Goa — one-click deploy to Vercel
REM Just double-click this file in Windows Explorer.

setlocal
cd /d "%~dp0"

echo.
echo ============================================================
echo   RESERVA VERDE GOA — Deploying to Vercel
echo ============================================================
echo   Folder: %CD%
echo   Project: reserva-varde-goa
echo ============================================================
echo.

REM Run the deploy via PowerShell so the execution policy + npx work
powershell -NoProfile -ExecutionPolicy Bypass -Command "npx vercel --prod"

echo.
echo ============================================================
echo   Deploy complete. Production URL printed above.
echo   Press any key to close this window.
echo ============================================================
pause >nul
