import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Account } from './account.entity.js';

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  TRANSFER_OUT = 'TRANSFER_OUT',
  TRANSFER_IN = 'TRANSFER_IN',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Account, (account) => account.transactions)
  account: Relation<Account>;

  @Column()
  accountId: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column('decimal', { precision: 14, scale: 2 })
  amount: string;

  @Column({ nullable: true })
  relatedAccountId?: string;

  @CreateDateColumn()
  createdAt: Date;
}
