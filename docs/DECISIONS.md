# Decisões de arquitetura

## Escopo (método Keel)

O prompt original pedia arquitetura orientada a eventos completa (RabbitMQ +
worker assíncrono + Redis para idempotência + resposta `202 Accepted`).
Reduzi o escopo para o menor desenho que ainda prova o problema real —
consistência de saldo sob concorrência e idempotência de transações — sem
inflar a superfície de código em relação ao que este projeto precisa provar:

- **Sem RabbitMQ/worker**: depósito e transferência processam de forma
  síncrona, dentro de uma transação de banco (`DataSource.transaction`).
  O resultado é o mesmo (consistência garantida), só que sem operar um
  segundo processo (o worker) e um broker a mais em produção.
- **Idempotência no Postgres, não no Redis**: a chave enviada no header
  `idempotency-key` é gravada na mesma transação da operação. Como tudo é
  síncrono, não há problema de correr o Redis à parte do banco (ficar não
  isolado). Menos uma peça de infraestrutura para rodar localmente e no
  deploy.
- **Lock pessimista com ordem determinística**: em transferências, as duas
  contas são bloqueadas (`pessimistic_write`) sempre na mesma ordem (por
  `id`), evitando deadlock entre transferências concorrentes que envolvem
  as mesmas duas contas — esse é o ponto que normalmente pega dev júnior de
  surpresa em entrevista.

## Contratos declarativos (inspirado em GraphHelm/Keel)

Os schemas Zod em `src/contracts/` são a única fonte de verdade da forma dos
dados — controllers não redefinem validação, apenas aplicam
`ZodValidationPipe(schema)`. Se um worker assíncrono for adicionado no
futuro (ver "Próximos passos"), ele reaproveita os mesmos contratos sem
duplicar regras.

## Próximos passos (se o projeto evoluir)

- Migrar o processamento de transferência para fila (BullMQ ou RabbitMQ) se
  o volume justificar resposta assíncrona — os contratos em
  `src/contracts/` já estão prontos para isso.
- Testes de integração com Testcontainers (Postgres real).
- Rate limiting por usuário/IP (`@nestjs/throttler`).
- Autenticação (JWT) por conta/usuário.
- CI (GitHub Actions) + deploy (Railway/Render).
