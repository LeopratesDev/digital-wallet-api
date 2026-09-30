import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Account } from '../domain/entities/account.entity.js';
import {
  Transaction,
  TransactionType,
} from '../domain/entities/transaction.entity.js';
import type {
  DepositInput,
  OpenAccountInput,
  TransferInput,
} from '../../contracts/wallet.contract.js';
import { IdempotencyService } from './idempotency.service.js';

@Injectable()
export class WalletService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  async openAccount(input: OpenAccountInput): Promise<Account> {
    const repo = this.dataSource.getRepository(Account);
    const account = repo.create({ ...input, balance: '0' });
    return repo.save(account);
  }

  async getBalance(accountId: string): Promise<Account> {
    const account = await this.dataSource
      .getRepository(Account)
      .findOne({ where: { id: accountId } });
    if (!account) throw new NotFoundException('Conta não encontrada');
    return account;
  }

  async getStatement(accountId: string): Promise<Transaction[]> {
    await this.getBalance(accountId);
    return this.dataSource
      .getRepository(Transaction)
      .find({ where: { accountId }, order: { createdAt: 'DESC' } });
  }

  /**
   * Depósito e transferência rodam dentro de uma única transação de
   * banco (sem broker/worker) — a chave de idempotência é gravada na
   * mesma transação, então repetir a chave nunca duplica o efeito.
   */
  async deposit(input: DepositInput, idempotencyKey: string) {
    return this.runIdempotent(idempotencyKey, 'deposit', async (manager) => {
      const accountRepo = manager.getRepository(Account);
      const account = await accountRepo.findOne({
        where: { id: input.accountId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!account) throw new NotFoundException('Conta não encontrada');

      account.balance = (
        Number(account.balance) + input.amount
      ).toFixed(2);
      await accountRepo.save(account);

      await manager.getRepository(Transaction).insert({
        accountId: account.id,
        type: TransactionType.DEPOSIT,
        amount: input.amount.toFixed(2),
      });

      return { accountId: account.id, balance: account.balance };
    });
  }

  async transfer(input: TransferInput, idempotencyKey: string) {
    if (input.fromAccountId === input.toAccountId) {
      throw new BadRequestException('Conta de origem e destino são iguais');
    }

    return this.runIdempotent(idempotencyKey, 'transfer', async (manager) => {
      const accountRepo = manager.getRepository(Account);

      // Ordem determinística de lock (por id) evita deadlock entre
      // transferências concorrentes que envolvem as mesmas duas contas.
      const [firstId, secondId] = [input.fromAccountId, input.toAccountId].sort();
      const first = await accountRepo.findOne({
        where: { id: firstId },
        lock: { mode: 'pessimistic_write' },
      });
      const second = await accountRepo.findOne({
        where: { id: secondId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!first || !second) throw new NotFoundException('Conta não encontrada');

      const from = first.id === input.fromAccountId ? first : second;
      const to = first.id === input.fromAccountId ? second : first;

      if (Number(from.balance) < input.amount) {
        throw new ConflictException('Saldo insuficiente');
      }

      from.balance = (Number(from.balance) - input.amount).toFixed(2);
      to.balance = (Number(to.balance) + input.amount).toFixed(2);
      await accountRepo.save([from, to]);

      const txRepo = manager.getRepository(Transaction);
      await txRepo.insert([
        {
          accountId: from.id,
          type: TransactionType.TRANSFER_OUT,
          amount: input.amount.toFixed(2),
          relatedAccountId: to.id,
        },
        {
          accountId: to.id,
          type: TransactionType.TRANSFER_IN,
          amount: input.amount.toFixed(2),
          relatedAccountId: from.id,
        },
      ]);

      return {
        fromAccountId: from.id,
        toAccountId: to.id,
        amount: input.amount.toFixed(2),
      };
    });
  }

  private async runIdempotent<T>(
    idempotencyKey: string,
    endpoint: string,
    operation: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    return this.dataSource.transaction(async (manager) => {
      const cached = await this.idempotencyService.findResponse(
        manager,
        idempotencyKey,
      );
      if (cached !== undefined) return cached as T;

      const result = await operation(manager);
      await this.idempotencyService.saveResponse(
        manager,
        idempotencyKey,
        endpoint,
        result,
      );
      return result;
    });
  }
}
