Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
  [switch]$SkipDatabase,
  [switch]$SkipBackend,
  [switch]$SkipFrontend,
  [string]$FrontendHost = "0.0.0.0",
  [int]$FrontendPort = 5173,
  [string]$ApiUrl = "http://localhost:8080"
)

$root = Split-Path -Parent $PSScriptRoot
$databaseDir = Join-Path $root "database"
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"

if (-not $SkipDatabase) {
  Write-Host "[NetBank] Subindo banco Docker..." -ForegroundColor Cyan
  Push-Location $databaseDir
  try {
    docker compose up -d
  } finally {
    Pop-Location
  }
}

if (-not $SkipBackend) {
  Write-Host "[NetBank] Abrindo backend em nova janela..." -ForegroundColor Cyan
  $backendCommand = "Set-Location '$backendDir'; cmd /c mvnw.cmd spring-boot:run"
  Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand | Out-Null
}

if (-not $SkipFrontend) {
  Write-Host "[NetBank] Abrindo frontend em nova janela..." -ForegroundColor Cyan
  $frontendCommand = "Set-Location '$frontendDir'; `$env:VITE_API_URL='$ApiUrl'; npm.cmd run dev -- --host $FrontendHost --port $FrontendPort"
  Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand | Out-Null
}

Write-Host "[NetBank] Ambiente iniciado." -ForegroundColor Green
Write-Host "- Frontend local: http://localhost:$FrontendPort"
Write-Host "- Frontend na rede: http://<SEU-IP>:$FrontendPort"
Write-Host "- API esperada: $ApiUrl"