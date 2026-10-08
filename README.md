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

**Deploy:** https://digital-wallet-api-production-887f.up.railway.app  
**Swagger:** https://digital-wallet-api-production-887f.up.railway.app/docs

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

Deployado no Railway com PostgreSQL. Para detalhes de arquitetura e decisões de design, ver
[docs/DECISIONS.md](docs/DECISIONS.md).
