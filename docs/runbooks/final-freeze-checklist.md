# Final Freeze Checklist (Portfolio)

## Objetivo
Garantir que o projeto fique em estado de publicacao com operacao previsivel, testes verdes, seguranca automatizada e setup reproduzivel em maquina limpa.

## Checklist tecnico
- [x] Banco controlado por Flyway (`ddl-auto=validate`, `sql.init=never`).
- [x] JWT sem fallback inseguro no profile `dev`.
- [x] Fluxo unico de auth com `POST /auth/login` e sessao validada por `GET /auth/me`.
- [x] Primeiro acesso com bonus e retorno de payload atualizado.
- [x] Maquina de estados de conta com erro estavel `TRANSICAO_STATUS_INVALIDA`.
- [x] Exclusao de cliente com limpeza de vinculos para evitar quebra de integridade.

## Checklist de testes
- [x] `backend`: `cmd /c mvnw.cmd -q verify`
- [x] `frontend`: `npm run test:coverage`
- [x] `frontend`: `npm run lint`
- [x] `frontend`: `npm run build`
- [x] `frontend`: `npm run test:e2e`

## Checklist de seguranca e governance
- [x] CI padronizado em PR/push para `main`.
- [x] CodeQL para Java e JavaScript/TypeScript.
- [x] Gitleaks para secret scanning no pipeline.
- [x] Dependabot para Maven, NPM e GitHub Actions.
- [ ] Branch protection habilitada no GitHub com checks obrigatorios (`.github/required-checks.md`).

## Checklist operacional
- [x] Script de reset de banco: `scripts/reset-dev.ps1`
- [x] Script de start da stack: `scripts/start-dev.ps1`
- [x] Script de validacao em maquina limpa: `scripts/validate-clean-machine.ps1`
- [x] Script para criar tag de release: `scripts/release-tag.ps1`
- [x] `.env.example` para backend, frontend e database
- [x] README com setup em 5 minutos e fluxo para celular

## Checklist de deploy de demonstracao
- [x] `backend/Dockerfile` para deploy em plataforma cloud
- [x] `render.yaml` para blueprint do backend + postgres
- [x] `frontend/vercel.json` para fallback de SPA
- [x] Runbook de deploy publico: `docs/runbooks/deploy-portfolio.md`
- [ ] URLs publicas adicionadas no README

## Fluxo de release (manual)
1. Garantir worktree limpo.
2. Rodar validacao completa:
   - `powershell -ExecutionPolicy Bypass -File scripts/validate-clean-machine.ps1`
3. Criar tag:
   - `powershell -ExecutionPolicy Bypass -File scripts/release-tag.ps1 -Version 1.0.1 -SkipChecks`
4. Push da branch e tags:
   - `git push origin main --tags`
5. Publicar release no GitHub com resumo do `CHANGELOG.md`.

## Rollback
Seguir `docs/runbooks/release-rollback.md`.
