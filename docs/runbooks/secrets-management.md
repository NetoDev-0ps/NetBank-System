# Runbook: Secrets Management (Production)

## Objetivo
Padronizar gestao de segredos em ambiente corporativo sem manter valores sensiveis no repositorio.

## Padrao recomendado
- Armazenar segredos somente em gerenciador dedicado (AWS Secrets Manager, GCP Secret Manager, Azure Key Vault ou HashiCorp Vault).
- Injetar segredos no runtime via variaveis de ambiente no deploy.
- Nunca versionar `.env` de producao.

## Segredos obrigatorios
- `JWT_SECRET`
- `JWT_PREVIOUS_SECRETS` (durante rotacao)
- `ADMIN_PASSWORD_HASH`
- `DB_URL`, `DB_USER`, `DB_PASSWORD`

## Rotacao segura de JWT
1. Gerar novo segredo com 32+ caracteres aleatorios.
2. Publicar novo valor em `JWT_SECRET` e mover o segredo anterior para `JWT_PREVIOUS_SECRETS`.
3. Fazer deploy gradual.
4. Aguardar expiracao maxima de tokens antigos.
5. Remover segredo antigo de `JWT_PREVIOUS_SECRETS`.

## Checklist de release
- Segredos carregados pelo orquestrador (Kubernetes, ECS, etc.).
- `SPRING_PROFILES_ACTIVE=prod`.
- `AUTH_COOKIE_SECURE=true`.
- `FLYWAY_BASELINE_ON_MIGRATE=false` para base nova/limpa.

## Resposta a incidente
- Revogar segredo comprometido no manager.
- Rotacionar imediatamente JWT (com segredo anterior temporario).
- Forcar novo login com expiracao curta.
- Revisar logs por `correlationId` e horario do incidente.
