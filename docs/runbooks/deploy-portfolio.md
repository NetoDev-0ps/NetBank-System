# Runbook: Deploy Publico de Portfolio

## Objetivo
Publicar frontend e backend com URLs estaveis para avaliacao de recrutadores.

## Topologia recomendada
- Frontend: Vercel
- Backend API: Render Web Service
- Banco: Render PostgreSQL (gerenciado)

## 1) Deploy do backend (Render)
1. Crie um novo Blueprint no Render apontando para este repositorio.
2. Selecione o arquivo `render.yaml` na raiz.
3. Preencha os env vars com `sync: false`:
   - `JWT_SECRET`
   - `ADMIN_PASSWORD_HASH`
   - `CORS_ALLOWED_ORIGINS`
4. No `CORS_ALLOWED_ORIGINS`, use a URL final do frontend (ex: `https://netbank-portfolio.vercel.app`).
5. Aguarde o deploy e valide:
   - `GET https://SUA_API/actuator/health`

## 2) Deploy do frontend (Vercel)
1. Importe a pasta `frontend` como projeto no Vercel.
2. Configure a variavel:
   - `VITE_API_URL=https://SUA_API_RENDER`
3. Garanta que o projeto usa `frontend/vercel.json` para SPA fallback.
4. Publique e valide:
   - Acesso na URL publica
   - Login gerente/cliente
   - Fluxo de primeiro acesso

## 3) Validacao final de demonstracao
- `cadastro -> aprovacao gerente -> login cliente`
- `primeiro login -> bonus -> primeiroLogin=false`
- `suspensao/bloqueio/reativacao` refletindo no login
- `PIX` (preview e transferencia)

## 4) URLs estaveis para README
Atualize o README com:
- Frontend: `https://SEU_FRONTEND`
- API: `https://SUA_API`
- Health: `https://SUA_API/actuator/health`

## 5) Politica de release
- Deploy somente com CI verde.
- Tag semantica obrigatoria (`v1.0.1`, `v1.0.2`, ...).
- Nao fazer deploy direto da branch sem PR aprovado.
