# Changelog

## [1.0.3] - 2026-03-05
### Changed
- Sincronizacao da documentacao de release para `v1.0.2` em README/checklist.`n- `scripts/release-tag.ps1` com versao padrao atualizada para `1.0.2`.`n`n## [1.0.2] - 2026-03-05
### Added
- Pipeline de seguranca no GitHub:
  - `codeql.yml` (Java + JavaScript/TypeScript)
  - `secret-scan.yml` (Gitleaks)
  - `.github/dependabot.yml`
- Guia de branch protection com checks obrigatorios em `.github/required-checks.md`.
- Arquivos de deploy de portfolio:
  - `backend/Dockerfile`
  - `backend/.dockerignore`
  - `render.yaml`
  - `frontend/vercel.json`
- Runbook de deploy publico em `docs/runbooks/deploy-portfolio.md`.
- Script de validacao completa em maquina limpa: `scripts/validate-clean-machine.ps1`.
- Script de tag de release: `scripts/release-tag.ps1`.

### Changed
- CI refinado para PR/push na branch `main` com concorrencia controlada.
- README com secoes de deploy, governance e release oficial.
- Checklist final ampliado para incluir seguranca automatizada e deploy publico.

## [1.0.1] - 2026-03-05
### Added
- Suite E2E critica com fluxos completos:
  - cadastro -> aprovacao gerente -> login cliente
  - primeiro acesso com bonus e persistencia de `primeiroLogin=false`
  - suspensao/reativacao alterando comportamento de login
- Scripts de operacao local:
  - `scripts/start-dev.ps1`
  - `scripts/reset-dev.ps1`
- Checklist de congelamento para publicacao em `docs/runbooks/final-freeze-checklist.md`.

### Changed
- `RegistrationPage` modularizado em componentes/utis dedicados.
- `PixAreaPage` modularizado com extracao do fluxo para `pix/PixFlowContent.jsx`.
- `UsuarioService` modularizado com politicas de status, normalizacao e mapeamento extraidos.
- `PixService` modularizado com extracao de regras de chave/idempotencia.
- `backend/.env.example` ajustado para `FLYWAY_BASELINE_ON_MIGRATE=false`.
- `application-dev.yaml` sem fallback inseguro para `JWT_SECRET`.

### Removed
- Duplicidade de `ProjectOverviewPage` nao utilizada em `frontend/src/pages/home`.

## [1.0.0] - 2026-03-05
### Added
- Landing page premium do banco e pagina de apresentacao para recrutadores.
- Camada de sanitizacao de texto para corrigir caracteres quebrados no frontend.
- Frontend `.env.example`.
- Galeria de imagens e GIF de demonstracao no README.
- Licenca MIT.

### Changed
- Fluxo de rotas: pagina de apresentacao em `/` e home do banco em `/home`.
- Flyway padronizado como fonte unica de schema no setup de desenvolvimento.
- Testes de integracao backend configurados para validar schema com Flyway.

### Fixed
- Primeiro acesso com retorno consistente de usuario atualizado.
- Regras de status e acoes de gerente alinhadas entre front e backend.
- Correcoes de textos com encoding quebrado em pontos criticos.


