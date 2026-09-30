# Digital Wallet API

API de carteira digital: abertura de conta, depósito, transferência entre
contas com controle de concorrência, extrato e idempotência — feita por
[Leonardo Prates](https://github.com/LeopratesDev) como projeto de portfólio
para vagas júnior de back-end.

## Stack

NestJS (Node.js/TypeScript) · PostgreSQL · TypeORM · Zod · Swagger

## Funcionalidades

- `POST /accounts` — abrir conta
- `GET /accounts/:id` — consultar saldo
- `GET /accounts/:id/statement` — extrato de transações
- `POST /accounts/deposit` — depósito (requer header `idempotency-key`)
- `POST /accounts/transfer` — transferência entre contas (requer header
  `idempotency-key`)

Documentação interativa em `/docs` (Swagger) após subir a aplicação.

## Como rodar

```bash
npm install
cp .env.example .env   # ajuste as credenciais do Postgres
npm run start:dev
```

Requer um Postgres local ou em container acessível pelas variáveis em
`.env`.

## Decisões de arquitetura

Ver [docs/DECISIONS.md](docs/DECISIONS.md) — explica por que o projeto usa
processamento síncrono com transação de banco em vez de fila/worker, como a
idempotência é garantida, e como evitar deadlock em transferências
concorrentes.

## Status

🚧 Em desenvolvimento — próximos passos em
[docs/DECISIONS.md](docs/DECISIONS.md#próximos-passos-se-o-projeto-evoluir).
