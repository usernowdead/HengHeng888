# PowerShell Script to Clear Git Credentials on Windows
# Run: .\CLEAR-CREDENTIALS.ps1

Write-Host "🔐 Clearing Git credentials..." -ForegroundColor Yellow

# Method 1: Clear Windows Credential Manager
Write-Host "`n📋 Checking Windows Credential Manager..." -ForegroundColor Cyan
$credentials = cmdkey /list | Select-String "git"
if ($credentials) {
    Write-Host "Found Git credentials:" -ForegroundColor Yellow
    $credentials | ForEach-Object {
        Write-Host "  - $_" -ForegroundColor Gray
        $target = ($_ -split ":")[1].Trim()
        if ($target) {
            Write-Host "    Removing: $target" -ForegroundColor Yellow
            cmdkey /delete:$target 2>$null
        }
    }
} else {
    Write-Host "No Git credentials found in Credential Manager" -ForegroundColor Green
}

# Method 2: Clear Git config credential helper
Write-Host "`n📋 Checking Git credential helper..." -ForegroundColor Cyan
$helper = git config --global credential.helper
if ($helper) {
    Write-Host "Current credential helper: $helper" -ForegroundColor Yellow
    Write-Host "You can remove it with: git config --global --unset credential.helper" -ForegroundColor Gray
} else {
    Write-Host "No global credential helper set" -ForegroundColor Green
}

# Method 3: Clear local Git config
Write-Host "`n📋 Checking local Git config..." -ForegroundColor Cyan
$localHelper = git config credential.helper
if ($localHelper) {
    Write-Host "Local credential helper: $localHelper" -ForegroundColor Yellow
} else {
    Write-Host "No local credential helper set" -ForegroundColor Green
}

Write-Host "`n✅ Credential clearing complete!" -ForegroundColor Green
Write-Host "`nNext step: Try pushing again:" -ForegroundColor Yellow
Write-Host "  git push -u origin main" -ForegroundColor White
Write-Host "`nWhen prompted:" -ForegroundColor Yellow
Write-Host "  Username: usernowdead" -ForegroundColor White
Write-Host "  Password: [Paste your Personal Access Token]" -ForegroundColor White

