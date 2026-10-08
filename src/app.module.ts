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
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Account, Transaction, IdempotencyKey],
      synchronize: process.env.DB_SYNC !== 'false',
    }),
    WalletModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
