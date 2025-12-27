# PowerShell script to setup database with Docker
Write-Host "Setting up Premium App Store Database..." -ForegroundColor Green

# Check if Docker is installed
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerInstalled) {
    Write-Host "Error: Docker is not installed!" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternatively, you can install PostgreSQL directly and run migrations manually." -ForegroundColor Yellow
    exit 1
}

# Start PostgreSQL container
Write-Host "Starting PostgreSQL container..." -ForegroundColor Yellow
docker-compose up -d

# Wait a bit for container to start
Start-Sleep -Seconds 5

# Check if container is running
$containerRunning = docker ps --filter "name=premium_appstore_db" --format "{{.Names}}" | Select-String "premium_appstore_db"
if ($containerRunning) {
    Write-Host "Database container is running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Install sqlx-cli: cargo install sqlx-cli" -ForegroundColor Cyan
    Write-Host "2. Run migrations: cd backend && sqlx migrate run" -ForegroundColor Cyan
} else {
    Write-Host "Warning: Could not verify container is running. Please check manually: docker ps" -ForegroundColor Yellow
}


