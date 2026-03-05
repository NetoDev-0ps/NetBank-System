Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

param(
  [string]$Version = "1.0.1",
  [switch]$SkipChecks
)

$root = Split-Path -Parent $PSScriptRoot

function Assert-CleanWorktree {
  $status = git status --porcelain
  if ($LASTEXITCODE -ne 0) {
    throw "Falha ao ler estado do git."
  }
  if ($status) {
    throw "Worktree nao esta limpo. Commit/stash antes de criar tag."
  }
}

if (-not $SkipChecks) {
  & (Join-Path $root "scripts\validate-clean-machine.ps1")
}

Assert-CleanWorktree

$tag = "v$Version"
$existing = git tag --list $tag
if ($existing) {
  throw "Tag ja existe: $tag"
}

git tag -a $tag -m "NetBank release $tag"
if ($LASTEXITCODE -ne 0) {
  throw "Falha ao criar tag $tag"
}

Write-Host "[NetBank] Tag criada: $tag" -ForegroundColor Green
Write-Host "Proximo passo: git push origin main --tags"
