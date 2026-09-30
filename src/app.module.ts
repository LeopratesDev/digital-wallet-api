import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { WalletModule } from './wallet/wallet.module.js';
import { Account } from './wallet/domain/entities/account.entity.js';
import { Transaction } from './wallet/domain/entities/transaction.entity.js';
import { IdempotencyKey } from './wallet/domain/entities/idempotency-key.entity.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_NAME ?? 'digital_wallet',
      entities: [Account, Transaction, IdempotencyKey],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    WalletModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
