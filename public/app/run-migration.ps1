# Run migration script
$sqlFile = "backend\migrations\001_initial_schema.sql"
$sqlContent = Get-Content $sqlFile -Raw

$sqlContent | docker exec -i premium_appstore_db psql -U appstore_user -d premium_appstore

if ($LASTEXITCODE -eq 0) {
    Write-Host "Migration completed successfully!" -ForegroundColor Green
} else {
    Write-Host "Migration failed!" -ForegroundColor Red
}


