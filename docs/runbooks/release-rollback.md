# Runbook: Release e Rollback

## Objetivo
Padronizar release com rollback rapido e seguro.

## Estrategia
- Release em tag imutavel
- Banco com Flyway (`ddl-auto=validate`)
- Rollback por reversao de imagem + restore se necessario

## Passos de release
1. CI verde (`backend verify`, `frontend test/lint/build`).
2. Gerar artefatos versionados.
3. Aplicar deploy em staging.
4. Validar smoke tests:
- `/actuator/health`
- login gerente
- login cliente
- transferencias PIX
5. Promover para producao.

## Criticos para abortar release
- Erro de migration Flyway
- Taxa 5xx > 5% por 10 minutos
- p95 > 1.2s por 10 minutos

## Rollback rapido (aplicacao)
1. Reverter para imagem/tag anterior.
2. Reiniciar servico.
3. Confirmar `health` e metricas em normalizacao.

## Rollback de dados (quando necessario)
1. Congelar trafego de escrita.
2. Executar restore do backup mais recente validado.
3. Validar integridade das tabelas criticas.
4. Reabrir trafego gradualmente.

## Checklist pos-rollback
- API saudavel em `/actuator/health`
- Fluxo de autenticacao ok
- Auditoria recebendo eventos
- Alertas encerrados

## Donos por etapa
- Deploy/rollback: engenharia de plataforma
- Banco: engenharia backend
- Validacao funcional: engenharia QA
- Comunicacao incidente: responsavel on-call
