# PowerShell script to start Backend server
Write-Host "Starting Premium App Store Backend..." -ForegroundColor Green

# Check if Rust is installed
$rustInstalled = Get-Command cargo -ErrorAction SilentlyContinue
if (-not $rustInstalled) {
    Write-Host "Error: Rust/Cargo is not installed!" -ForegroundColor Red
    Write-Host "Please install Rust from: https://rustup.rs/" -ForegroundColor Yellow
    exit 1
}

# Check if .env file exists
if (-not (Test-Path "backend\.env")) {
    Write-Host "Creating backend\.env file..." -ForegroundColor Yellow
    @"
DATABASE_URL=postgresql://appstore_user:appstore_password@localhost:5432/premium_appstore
PORT=3001
"@ | Out-File -FilePath "backend\.env" -Encoding utf8
    Write-Host "Created backend\.env file. Please check the DATABASE_URL if needed." -ForegroundColor Yellow
}

# Change to backend directory
Set-Location backend

# Build and run
Write-Host "Building and starting backend server..." -ForegroundColor Green
cargo run


