Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$databaseDir = Join-Path $root "database"

if (-not (Test-Path $databaseDir)) {
  throw "Diretorio de banco nao encontrado: $databaseDir"
}

Write-Host "[NetBank] Resetando banco Docker..." -ForegroundColor Cyan
Push-Location $databaseDir
try {
  docker compose down -v
  docker compose up -d
} finally {
  Pop-Location
}

Write-Host "[NetBank] Banco resetado com sucesso." -ForegroundColor Green