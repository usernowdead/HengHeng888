# PowerShell script to build locally with environment variables

$env:JWT_SECRET = "2738f975f5de03fb0171ad81d475df7d5b0164c450098e43c0fbe3e11114bfab474af0430b4fcccb6472f38bf3911cbfe76d3f5a0bb4ae0ff8c33a6fafdae80c"
$env:DATABASE_URL = "postgresql://placeholder:placeholder@localhost:5432/placeholder"
$env:NODE_ENV = "production"

Write-Host "Environment variables set:" -ForegroundColor Green
Write-Host "  JWT_SECRET: $($env:JWT_SECRET.Substring(0, 20))..." -ForegroundColor Gray
Write-Host "  DATABASE_URL: $($env:DATABASE_URL)" -ForegroundColor Gray
Write-Host ""
Write-Host "Starting build..." -ForegroundColor Yellow

npm run build

