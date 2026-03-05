# Runbook: Backup e Restore (PostgreSQL)

## Objetivo
Garantir backup consistente e restauracao rapida do banco `bancodigital_db`.

## Pre-requisitos
- Container `netbank-db` em execucao
- Acesso ao host onde o banco roda
- Espaco em disco suficiente

## Backup manual
```bash
mkdir -p backups

docker exec -t netbank-db pg_dump \
  -U postgres \
  -d bancodigital_db \
  -F c \
  -f /tmp/netbank-backup.dump

docker cp netbank-db:/tmp/netbank-backup.dump ./backups/netbank-backup-$(date +%Y%m%d-%H%M%S).dump
```

## Restore manual
1. Pare a aplicacao.
2. Restaure o dump:

```bash
docker cp ./backups/netbank-backup-AAAAmmdd-HHMMSS.dump netbank-db:/tmp/restore.dump

docker exec -t netbank-db psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS bancodigital_db;"
docker exec -t netbank-db psql -U postgres -d postgres -c "CREATE DATABASE bancodigital_db;"

docker exec -t netbank-db pg_restore \
  -U postgres \
  -d bancodigital_db \
  --no-owner \
  --no-privileges \
  /tmp/restore.dump
```

3. Rode validacoes:
- `SELECT COUNT(*)` nas tabelas principais
- `mvnw.cmd -q test`

## RPO / RTO recomendado
- RPO: 15 minutos
- RTO: 30 minutos

## Checklist pos-restore
- API sobe sem erro de migration
- Login gerente funciona
- Fluxo cliente + PIX funcional
- Auditoria continua gravando
