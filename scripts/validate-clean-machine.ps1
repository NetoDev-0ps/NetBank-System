Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
  [switch]$SkipE2E
)

$root = Split-Path -Parent $PSScriptRoot
$databaseDir = Join-Path $root "database"
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"

function Invoke-Step {
  param(
    [Parameter(Mandatory = $true)][string]$Name,
    [Parameter(Mandatory = $true)][scriptblock]$Action
  )

  Write-Host "[NetBank] $Name" -ForegroundColor Cyan
  & $Action
}

function Assert-Command {
  param([Parameter(Mandatory = $true)][string]$Command)

  if (-not (Get-Command $Command -ErrorAction SilentlyContinue)) {
    throw "Comando obrigatorio nao encontrado: $Command"
  }
}

Assert-Command docker
Assert-Command node
Assert-Command npm
Assert-Command cmd

if (-not (Test-Path (Join-Path $backendDir ".env"))) {
  throw "Arquivo ausente: backend/.env (copie de backend/.env.example)"
}
if (-not (Test-Path (Join-Path $frontendDir ".env"))) {
  throw "Arquivo ausente: frontend/.env (copie de frontend/.env.example)"
}
if (-not (Test-Path (Join-Path $databaseDir ".env"))) {
  throw "Arquivo ausente: database/.env (copie de database/.env.example)"
}

Invoke-Step -Name "Subindo banco Docker" -Action {
  Push-Location $databaseDir
  try {
    docker compose up -d
  } finally {
    Pop-Location
  }
}

Invoke-Step -Name "Backend verify" -Action {
  Push-Location $backendDir
  try {
    cmd /c mvnw.cmd -q verify
  } finally {
    Pop-Location
  }
}

Invoke-Step -Name "Frontend install" -Action {
  Push-Location $frontendDir
  try {
    npm ci
  } finally {
    Pop-Location
  }
}

Invoke-Step -Name "Frontend coverage" -Action {
  Push-Location $frontendDir
  try {
    npm run test:coverage
  } finally {
    Pop-Location
  }
}

Invoke-Step -Name "Frontend lint" -Action {
  Push-Location $frontendDir
  try {
    npm run lint
  } finally {
    Pop-Location
  }
}

Invoke-Step -Name "Frontend build" -Action {
  Push-Location $frontendDir
  try {
    npm run build
  } finally {
    Pop-Location
  }
}

if (-not $SkipE2E) {
  Invoke-Step -Name "Frontend E2E" -Action {
    Push-Location $frontendDir
    try {
      npm run test:e2e
    } finally {
      Pop-Location
    }
  }
}

Write-Host "[NetBank] Validacao completa concluida com sucesso." -ForegroundColor Green
