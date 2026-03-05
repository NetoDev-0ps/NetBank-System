param(
  [string]$SourceHost = "localhost",
  [int]$SourcePort = 5432,
  [string]$SourceDatabase = "bancodigital_db",
  [string]$SourceUser = "postgres",
  [string]$SourcePassword = "Admin",

  [string]$TargetHost = "localhost",
  [int]$TargetPort = 5433,
  [string]$TargetDatabase = "bancodigital_db",
  [string]$TargetUser = "postgres",
  [string]$TargetPassword = "Admin",

  [string]$DumpPath = ""
)

$ErrorActionPreference = "Stop"

function Resolve-PgTool {
  param([string]$ToolName)

  $fromPath = Get-Command $ToolName -ErrorAction SilentlyContinue
  if ($fromPath -and $fromPath.Source) {
    return $fromPath.Source
  }

  $patterns = @(
    (Join-Path $env:ProgramFiles "PostgreSQL\\*\\bin\\$ToolName.exe"),
    (Join-Path $env:ProgramFiles "PostgreSQL\\*\\pgAdmin 4\\runtime\\$ToolName.exe")
  )

  $pf86 = ${env:ProgramFiles(x86)}
  if (-not [string]::IsNullOrWhiteSpace($pf86)) {
    $patterns += (Join-Path $pf86 "PostgreSQL\\*\\bin\\$ToolName.exe")
  }

  $candidates = @()
  foreach ($pattern in $patterns) {
    $candidates += Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue
  }

  if ($candidates.Count -gt 0) {
    return ($candidates | Sort-Object FullName -Descending | Select-Object -First 1).FullName
  }

  throw "Comando '$ToolName' nao encontrado no PATH nem nas instalacoes padrao do PostgreSQL."
}

$pgDump = Resolve-PgTool "pg_dump"
$pgRestore = Resolve-PgTool "pg_restore"
$psql = Resolve-PgTool "psql"

if ([string]::IsNullOrWhiteSpace($DumpPath)) {
  $DumpPath = Join-Path $env:TEMP "netbank-local-data.dump"
}

$truncateFile = Join-Path $env:TEMP "netbank-truncate-target.sql"
$truncateSql = @"
SELECT format('TRUNCATE TABLE public.%I RESTART IDENTITY CASCADE;', tablename)
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename <> 'flyway_schema_history';
\gexec
"@

try {
  Write-Host "[1/4] Exportando dados do banco local ${SourceHost}:$SourcePort/$SourceDatabase ..." -ForegroundColor Cyan
  $env:PGPASSWORD = $SourcePassword
  & $pgDump `
    -h $SourceHost `
    -p $SourcePort `
    -U $SourceUser `
    -d $SourceDatabase `
    -F c `
    --data-only `
    --exclude-table=flyway_schema_history `
    -f $DumpPath
  if ($LASTEXITCODE -ne 0) {
    throw "Falha ao exportar dados do banco local."
  }

  Write-Host "[2/4] Limpando dados no banco Docker ${TargetHost}:$TargetPort/$TargetDatabase (mantendo flyway_schema_history) ..." -ForegroundColor Cyan
  $truncateSql | Set-Content -Path $truncateFile -Encoding ASCII
  $env:PGPASSWORD = $TargetPassword
  & $psql `
    -h $TargetHost `
    -p $TargetPort `
    -U $TargetUser `
    -d $TargetDatabase `
    -v ON_ERROR_STOP=1 `
    -f $truncateFile
  if ($LASTEXITCODE -ne 0) {
    throw "Falha ao limpar tabelas no banco Docker."
  }

  Write-Host "[3/4] Restaurando dados no banco Docker ..." -ForegroundColor Cyan
  & $pgRestore `
    -h $TargetHost `
    -p $TargetPort `
    -U $TargetUser `
    -d $TargetDatabase `
    --data-only `
    --disable-triggers `
    --no-owner `
    --no-privileges `
    $DumpPath
  if ($LASTEXITCODE -ne 0) {
    throw "Falha ao restaurar dados no banco Docker."
  }

  Write-Host "[4/4] Sincronizacao concluida com sucesso." -ForegroundColor Green
  Write-Host "Dump gerado em: $DumpPath"
}
finally {
  $env:PGPASSWORD = $null
  if (Test-Path $truncateFile) {
    Remove-Item -Path $truncateFile -Force
  }
}
