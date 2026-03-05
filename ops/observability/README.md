# Observabilidade Externa (Prometheus)

## O que ja esta habilitado na API
- `/actuator/health`
- `/actuator/info`
- `/actuator/metrics`
- `/actuator/prometheus`

## Como subir Prometheus local
1. Monte os arquivos deste diretorio em um container Prometheus.
2. Exemplo de comando:

```bash
docker run --name netbank-prometheus \
  -p 9090:9090 \
  -v ${PWD}/ops/observability/prometheus.yml:/etc/prometheus/prometheus.yml \
  -v ${PWD}/ops/observability/alerts.yml:/etc/prometheus/alerts.yml \
  prom/prometheus
```

3. Abra `http://localhost:9090`.

## Alertas incluidos
- `NetbankApiDown`
- `NetbankHigh5xxRate`
- `NetbankHighP95Latency`

## Recomendacao de producao
- Expor `/actuator/prometheus` apenas em rede interna.
- Integrar Alertmanager para notificar Slack/PagerDuty/email.
- Definir SLO oficial para disponibilidade e latencia.
