# Restart Backend Server
Write-Host "`n=== Restarting Backend Server ===`n" -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\backend"

# Kill existing backend processes
Write-Host "Stopping existing backend processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*cargo*" -or $_.ProcessName -like "*premium-appstore-backend*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    @"
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/premium_appstore
PORT=3001
"@ | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "Created .env file" -ForegroundColor Green
}

Write-Host "`nBuilding and starting backend server..." -ForegroundColor Green
Write-Host "Backend will be available at: http://localhost:3001`n" -ForegroundColor Cyan

cargo run


