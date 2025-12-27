# Start Frontend Server
Write-Host "`n=== Starting Frontend Server ===`n" -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\frontend"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Create .env.local if it doesn't exist
if (-not (Test-Path ".env.local")) {
    @"
NEXT_PUBLIC_API_URL=http://localhost:3001
"@ | Out-File -FilePath ".env.local" -Encoding utf8
    Write-Host "Created .env.local file" -ForegroundColor Green
}

Write-Host "`nStarting Next.js development server..." -ForegroundColor Green
Write-Host "Frontend will be available at: http://localhost:3000`n" -ForegroundColor Cyan

npm run dev
