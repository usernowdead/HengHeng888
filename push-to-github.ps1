# PowerShell Script to Push to GitHub
# Run: .\push-to-github.ps1

Write-Host "🚀 Preparing to push to GitHub..." -ForegroundColor Green

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initializing git repository..." -ForegroundColor Yellow
    git init
}

# Pre-configured for usernowdead
$username = "usernowdead"
$email = "chanathip302010@gmail.com"

# Set git config
git config user.name $username
git config user.email $email
Write-Host "✅ Git config set:" -ForegroundColor Green
Write-Host "   Username: $username" -ForegroundColor Cyan
Write-Host "   Email: $email" -ForegroundColor Cyan

# Ask for repository name
$repoName = Read-Host "`nEnter repository name (default: payplearn)"
    if ([string]::IsNullOrWhiteSpace($repoName)) {
        $repoName = "payplearn"
}

# Add all files
Write-Host "`n📦 Adding files..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "💾 Committing..." -ForegroundColor Yellow
git commit -m "Initial commit - Ready for deployment"

# Check if remote exists
$remoteExists = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n⚠️  Remote 'origin' already exists!" -ForegroundColor Yellow
    $remove = Read-Host "Do you want to remove and add new one? (y/n)"
    if ($remove -eq "y" -or $remove -eq "Y") {
        git remote remove origin
        Write-Host "✅ Removed old remote" -ForegroundColor Green
    } else {
        Write-Host "❌ Cancelled" -ForegroundColor Red
        exit 1
    }
}

# Add remote
$remoteUrl = "https://github.com/$username/$repoName.git"
Write-Host "`n🔗 Adding remote: $remoteUrl" -ForegroundColor Yellow
git remote add origin $remoteUrl

# Set branch to main
git branch -M main

Write-Host "`n✨ Ready to push!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  1. Make sure you've created the repository on GitHub: https://github.com/$username/$repoName" -ForegroundColor White
Write-Host "  2. Run: git push -u origin main" -ForegroundColor White
Write-Host "  3. Enter your GitHub username and Personal Access Token when prompted" -ForegroundColor White

$pushNow = Read-Host "`nDo you want to push now? (y/n)"
if ($pushNow -eq "y" -or $pushNow -eq "Y") {
    Write-Host "`n🚀 Pushing to GitHub..." -ForegroundColor Yellow
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Successfully pushed to GitHub!" -ForegroundColor Green
        Write-Host "🌐 Repository: https://github.com/$username/$repoName" -ForegroundColor Cyan
    } else {
        Write-Host "`n❌ Push failed. Please check the error above." -ForegroundColor Red
    }
} else {
    Write-Host "`n📝 You can push later by running: git push -u origin main" -ForegroundColor Cyan
}

