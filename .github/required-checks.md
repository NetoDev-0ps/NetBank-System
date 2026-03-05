# GitHub Branch Protection (main)

## Objetivo
Bloquear merge sem verificacoes de qualidade e seguranca.

## Regras recomendadas
- Require a pull request before merging.
- Require approvals: minimo 1.
- Dismiss stale pull request approvals when new commits are pushed.
- Require status checks to pass before merging.
- Require branches to be up to date before merging.
- Restrict pushes that bypass pull request flow.

## Checks obrigatorios
- `backend-verify`
- `frontend-quality`
- `codeql-java-kotlin`
- `codeql-javascript-typescript`
- `gitleaks`

## Caminho
GitHub -> Settings -> Branches -> Add rule -> Branch name pattern: `main`.
