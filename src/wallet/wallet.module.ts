import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './domain/entities/account.entity.js';
import { Transaction } from './domain/entities/transaction.entity.js';
import { IdempotencyKey } from './domain/entities/idempotency-key.entity.js';
import { WalletService } from './application/wallet.service.js';
import { IdempotencyService } from './application/idempotency.service.js';
import { WalletController } from './infrastructure/wallet.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Transaction, IdempotencyKey])],
  controllers: [WalletController],
  providers: [WalletService, IdempotencyService],
})
export class WalletModule {}
