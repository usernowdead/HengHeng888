# Full setup script for Premium App Store
Write-Host "=== Premium App Store Full Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "Checking Docker..." -ForegroundColor Yellow
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerInstalled) {
    Write-Host "ERROR: Docker is not installed!" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Try to start Docker Desktop if not running
Write-Host "Checking if Docker Desktop is running..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "Docker is running!" -ForegroundColor Green
} catch {
    Write-Host "Docker Desktop is not running. Attempting to start..." -ForegroundColor Yellow
    $dockerPath = "${env:ProgramFiles}\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerPath) {
        Start-Process $dockerPath
        Write-Host "Waiting for Docker Desktop to start (30 seconds)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        
        $retries = 0
        $maxRetries = 10
        while ($retries -lt $maxRetries) {
            try {
                docker ps | Out-Null
                Write-Host "Docker is now running!" -ForegroundColor Green
                break
            } catch {
                $retries++
                Write-Host "Waiting for Docker... ($retries/$maxRetries)" -ForegroundColor Yellow
                Start-Sleep -Seconds 3
            }
        }
        
        if ($retries -eq $maxRetries) {
            Write-Host "ERROR: Could not start Docker Desktop. Please start it manually." -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "ERROR: Docker Desktop executable not found. Please start it manually." -ForegroundColor Red
        exit 1
    }
}

# Start PostgreSQL
Write-Host ""
Write-Host "Starting PostgreSQL container..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to start PostgreSQL container" -ForegroundColor Red
    exit 1
}

Write-Host "Waiting for PostgreSQL to be ready (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if container is running
$containerRunning = docker ps --filter "name=premium_appstore_db" --format "{{.Names}}" | Select-String "premium_appstore_db"
if (-not $containerRunning) {
    Write-Host "WARNING: Container might not be running. Check with: docker ps" -ForegroundColor Yellow
} else {
    Write-Host "PostgreSQL container is running!" -ForegroundColor Green
}

# Check Rust
Write-Host ""
Write-Host "Checking Rust..." -ForegroundColor Yellow
$cargoInstalled = Get-Command cargo -ErrorAction SilentlyContinue
if (-not $cargoInstalled) {
    Write-Host "ERROR: Rust/Cargo is not installed!" -ForegroundColor Red
    Write-Host "Please install Rust from: https://rustup.rs/" -ForegroundColor Yellow
    exit 1
}
Write-Host "Rust is installed!" -ForegroundColor Green

# Install sqlx-cli if not installed
Write-Host ""
Write-Host "Checking sqlx-cli..." -ForegroundColor Yellow
$sqlxInstalled = Get-Command sqlx -ErrorAction SilentlyContinue
if (-not $sqlxInstalled) {
    Write-Host "Installing sqlx-cli (this may take a few minutes)..." -ForegroundColor Yellow
    cargo install sqlx-cli --features postgres
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install sqlx-cli" -ForegroundColor Red
        exit 1
    }
    Write-Host "sqlx-cli installed!" -ForegroundColor Green
} else {
    Write-Host "sqlx-cli is already installed!" -ForegroundColor Green
}

# Run migrations
Write-Host ""
Write-Host "Running database migrations..." -ForegroundColor Yellow
Set-Location backend
$env:DATABASE_URL = "postgresql://appstore_user:appstore_password@localhost:5432/premium_appstore"
sqlx migrate run

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to run migrations" -ForegroundColor Red
    Write-Host "You may need to wait a bit longer for PostgreSQL to be ready." -ForegroundColor Yellow
    Write-Host "Try running manually: cd backend && sqlx migrate run" -ForegroundColor Yellow
    Set-Location ..
    exit 1
}

Write-Host "Migrations completed!" -ForegroundColor Green
Set-Location ..

# Create .env files if not exist
Write-Host ""
Write-Host "Creating .env files..." -ForegroundColor Yellow

if (-not (Test-Path "backend\.env")) {
    @"
DATABASE_URL=postgresql://appstore_user:appstore_password@localhost:5432/premium_appstore
PORT=3001
"@ | Out-File -FilePath "backend\.env" -Encoding utf8
    Write-Host "Created backend\.env" -ForegroundColor Green
}

if (-not (Test-Path "frontend\.env.local")) {
    @"
NEXT_PUBLIC_API_URL=http://localhost:3001
"@ | Out-File -FilePath "frontend\.env.local" -Encoding utf8
    Write-Host "Created frontend\.env.local" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start backend: cd backend && cargo run" -ForegroundColor Yellow
Write-Host "2. Start frontend: cd frontend && npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "Or use the provided scripts:" -ForegroundColor Cyan
Write-Host "  .\start-backend.ps1" -ForegroundColor Yellow
Write-Host "  .\start-frontend.ps1" -ForegroundColor Yellow


