# Reserva Verde Goa - one-click PowerShell deploy
# Right-click this file -> "Run with PowerShell", or from a terminal:
#   .\deploy.ps1

Set-Location -Path $PSScriptRoot

Write-Host ""
Write-Host "============================================================"
Write-Host "  RESERVA VERDE GOA - Deploying to Vercel"
Write-Host "============================================================"
Write-Host "  Folder:  $PSScriptRoot"
Write-Host "  Project: reserva-varde-goa"
Write-Host "============================================================"
Write-Host ""

if (-not (Test-Path "index.html")) {
    Write-Host "ERROR: index.html not found in this folder." -ForegroundColor Red
    Read-Host "Press Enter to close"
    exit 1
}

Write-Host "Running: npx vercel --prod"
Write-Host ""

npx vercel --prod

Write-Host ""
Write-Host "============================================================"
Write-Host "  Done. Production URL printed above."
Write-Host "  Open: https://reserva-varde-goa.vercel.app"
Write-Host "  Hard-refresh with Ctrl+F5 to bust the cache."
Write-Host "============================================================"
Write-Host ""
Read-Host "Press Enter to close"
