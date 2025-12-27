# Alternative: Install PostgreSQL natively on Windows
Write-Host "=== Installing PostgreSQL (Alternative Method) ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will download and install PostgreSQL using Chocolatey." -ForegroundColor Yellow
Write-Host ""

# Check if Chocolatey is installed
$chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue
if (-not $chocoInstalled) {
    Write-Host "Chocolatey is not installed. Installing Chocolatey first..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    
    # Refresh environment
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

Write-Host "Installing PostgreSQL (this may take a while)..." -ForegroundColor Yellow
choco install postgresql15 --params '/Password:appstore_password' -y

Write-Host ""
Write-Host "PostgreSQL installation completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next, you need to:" -ForegroundColor Cyan
Write-Host "1. Create database: createdb -U postgres premium_appstore" -ForegroundColor Yellow
Write-Host "2. Create user: psql -U postgres -c `"CREATE USER appstore_user WITH PASSWORD 'appstore_password';`"" -ForegroundColor Yellow
Write-Host "3. Grant privileges: psql -U postgres -c `"GRANT ALL PRIVILEGES ON DATABASE premium_appstore TO appstore_user;`"" -ForegroundColor Yellow


