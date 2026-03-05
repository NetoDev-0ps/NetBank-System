# Runbook: Banco DEV padrao (Docker + sincronizacao do legado local)

## Objetivo
Padronizar o banco de desenvolvimento em Docker para eliminar divergencia entre ambientes.

## Arquitetura padrao
- Banco oficial do projeto: PostgreSQL em Docker (`database/docker-compose.yml`)
- Porta host padrao do Docker: `5433`
- PostgreSQL local do Windows (se existir): manter em `5432` como legado

Essa separacao evita conexao acidental no banco errado.

## Setup inicial (uma vez)
1. Copie o arquivo de ambiente do banco Docker:
```powershell
cd C:\Users\pczaum\NetBank-System\database
copy .env.example .env
```

2. Copie o ambiente do backend:
```powershell
cd C:\Users\pczaum\NetBank-System\backend
copy .env.example .env
```

3. Verifique no backend `.env`:
```env
SPRING_PROFILES_ACTIVE=dev
DB_HOST=localhost
DB_PORT=5433
DB_NAME=bancodigital_db
DB_USER=postgres
DB_PASSWORD=Admin
```

## Subida diaria para testes
1. Suba o banco Docker:
```powershell
cd C:\Users\pczaum\NetBank-System\database
docker compose up -d
```

2. Suba o backend:
```powershell
cd C:\Users\pczaum\NetBank-System\backend
cmd /c mvnw.cmd spring-boot:run
```

3. Suba o frontend:
```powershell
cd C:\Users\pczaum\NetBank-System\frontend
npm install
npm run dev
```

## Sincronizar dados do Postgres local (5432) para Docker (5433)
Use esse fluxo quando quiser trazer seus dados atuais para o ambiente padrao.

Pre-requisitos:
- Docker Desktop ativo
- `pg_dump`, `pg_restore` e `psql` instalados (PATH ou pasta padrao do PostgreSQL)
- Banco Docker ja criado pelo backend/Flyway (suba backend pelo menos 1 vez)

Comando:
```powershell
cd C:\Users\pczaum\NetBank-System
powershell -ExecutionPolicy Bypass -File .\database\scripts\sync-local-data-to-docker.ps1
```

O script faz:
- exporta apenas dados do banco local
- preserva `flyway_schema_history` no alvo
- limpa tabelas de negocio no Docker
- restaura os dados no banco Docker

## Validacao rapida
- Health backend: `http://localhost:8080/actuator/health`
- Login gerente funciona
- Acoes de aprovar/excluir no painel gerente funcionam
- Contagens principais batem entre bancos (usuario, chave_pix, transacao)

## Operacao segura
- Para reset completo do banco Docker:
```powershell
cd C:\Users\pczaum\NetBank-System\database
docker compose down -v
docker compose up -d
```
Depois, suba o backend para o Flyway recriar schema.
