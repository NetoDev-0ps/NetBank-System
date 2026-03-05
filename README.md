# NetBank System

Monorepo full-stack de banco digital (cliente + gerente) com foco em regras de negocio, seguranca e experiencia mobile-first.

## O que e
NetBank e um projeto de portfolio que simula um banco digital real: cadastro de cliente, aprovacao por gerente, login com sessao segura, primeiro acesso com bonus, operacoes PIX e auditoria de acoes sensiveis.

## Stack
- Backend: Java 21, Spring Boot 4, Spring Security, JPA/Hibernate, Flyway, Actuator
- Frontend: React 19, Vite 7, TailwindCSS, Framer Motion
- Banco: PostgreSQL (Docker)
- Testes: JUnit (integracao + unit), Playwright (E2E)

## Arquitetura
- `frontend/`: aplicacao web
- `backend/`: API REST
- `database/`: `docker-compose` do PostgreSQL
- `docs/runbooks/`: operacao (dev DB, backup/restore, release/rollback, secrets)
- `ops/observability/`: Prometheus e alertas
- `scripts/`: automacao local para subir/resetar ambiente

## Features principais
### Cliente
- Cadastro com validacoes de CPF, telefone, email, data de nascimento e senha
- Login com `cpf + email + senha`
- Primeiro acesso com bonus transacional e persistencia de `primeiroLogin=false`
- Dashboard com saldo e area PIX

### Gerente
- Login administrativo por email/senha
- Painel com paginacao e filtros
- Aprovacao/recusa/suspensao/bloqueio conforme transicoes validas
- Exclusao de cliente com tratamento de vinculos

### Seguranca
- JWT em cookie HttpOnly (`NETBANK_AUTH`)
- CSRF (`XSRF-TOKEN` / `X-XSRF-TOKEN`)
- Captcha humano
- Protecao anti-bruteforce de login persistida em banco
- Auditoria de operacoes criticas

### Dados e migracoes
- Flyway como fonte unica de schema (`backend/src/main/resources/db/migration`)
- Sem SQL init magico
- `ddl-auto=validate` nos perfis de aplicacao

## Fluxos demo
1. Cadastro de cliente
2. Login gerente + aprovacao da conta
3. Login cliente
4. Primeiro acesso aplica bonus e desliga flag `primeiroLogin`
5. Gerente altera status e o comportamento de login muda conforme regra

## Endpoints principais
### Auth
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /auth/csrf`
- `GET /auth/captcha/challenge`
- `POST /auth/captcha/verify`

### Usuarios
- `POST /usuarios`
- `GET /usuarios/{id}`
- `GET /usuarios/paginado`
- `PATCH /usuarios/{id}/primeiro-acesso-concluido`
- `PATCH /usuarios/{id}/status`
- `DELETE /usuarios/{id}`

### PIX
- `GET /pix/status/{usuarioId}`
- `POST /pix/configurar-senha`
- `POST /pix/registrar-chave`
- `GET /pix/preview/{chave}`
- `POST /pix/transferir`

## Setup rapido (Windows)
### 1) Preparar arquivos `.env`
```bash
cd backend
copy .env.example .env
cd ..\frontend
copy .env.example .env
cd ..\database
copy .env.example .env
```

### 2) Reset limpo do banco
```bash
powershell -ExecutionPolicy Bypass -File scripts/reset-dev.ps1
```

### 3) Subir stack completa (DB + backend + frontend)
```bash
powershell -ExecutionPolicy Bypass -File scripts/start-dev.ps1
```

### 4) Acesso local
- Front: `http://localhost:5173`
- API: `http://localhost:8080`

### 5) Acesso pelo celular (mesma rede)
Use o script com host aberto e API no IP local:
```bash
powershell -ExecutionPolicy Bypass -File scripts/start-dev.ps1 -FrontendHost 0.0.0.0 -ApiUrl http://SEU_IP_LOCAL:8080
```
Abra no celular: `http://SEU_IP_LOCAL:5173`

## Variaveis de ambiente
- Backend: `backend/.env.example`
- Frontend: `frontend/.env.example`
- Database: `database/.env.example`

## Qualidade e testes
### Backend
```bash
cd backend
cmd /c mvnw.cmd -q verify
```

### Frontend
```bash
cd frontend
npm run test:coverage
npm run lint
npm run build
npm run test:e2e
```

## CI
Pipeline em `.github/workflows/ci.yml` com:
- backend `verify` + package
- frontend coverage + lint + build + e2e

## E2E coberto
- Smoke de autenticacao gerente
- Cadastro -> aprovacao gerente -> login cliente
- Primeiro acesso -> bonus -> persistencia de `primeiroLogin=false`
- Suspensao/reativacao de cliente alterando comportamento de login

## Galeria
### Demo GIF
![Demo Flow](docs/assets/screenshots/demo-flow.gif)

### Capturas
![Tela 1](docs/assets/screenshots/01-business-people.png)
![Tela 2](docs/assets/screenshots/02-app-interface.png)
![Tela 3](docs/assets/screenshots/03-credit-cards.png)

## Decisoes tecnicas
- Maquina de estados de conta no backend (transicoes invalidas retornam erro estavel)
- Primeiro acesso fechado ponta a ponta (persistencia + retorno atualizado)
- Sessao confirmada por backend (`/auth/me`) para evitar falso positivo de login no front
- Delete de usuario com limpeza de vinculos para evitar quebra de integridade

## Publicacao final
Checklist de fechamento em: `docs/runbooks/final-freeze-checklist.md`

## Credenciais dev (bootstrap)
- Gerente: `admin@netbank.com.br`
- Senha inicial: definida via `ADMIN_PASSWORD_HASH` no `.env` do backend

## Deploy publico (portfolio)
- Backend + Postgres: `render.yaml` (Render Blueprint)
- Frontend: `frontend/vercel.json` (Vercel)
- Guia completo: `docs/runbooks/deploy-portfolio.md`

## Governanca GitHub
- CI obrigatorio no `main`: `.github/workflows/ci.yml`
- CodeQL: `.github/workflows/codeql.yml`
- Secret scanning: `.github/workflows/secret-scan.yml`
- Dependabot: `.github/dependabot.yml`
- Regras de branch protection: `.github/required-checks.md`

## Release oficial
### Validacao completa em maquina limpa
```bash
powershell -ExecutionPolicy Bypass -File scripts/validate-clean-machine.ps1
```

### Criar tag da release
```bash
powershell -ExecutionPolicy Bypass -File scripts/release-tag.ps1 -Version 1.0.1 -SkipChecks
```

### Publicar
```bash
git push origin main --tags
```

## Links de demonstracao (preencher apos deploy)
- Frontend: `https://SEU_FRONTEND`
- API: `https://SUA_API`
- Health: `https://SUA_API/actuator/health`\n\n## Licenca
MIT - ver arquivo [LICENSE](LICENSE).

