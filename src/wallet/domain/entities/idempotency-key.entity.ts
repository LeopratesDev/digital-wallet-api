import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

/**
 * Persisted idempotency guard: since this project runs requests
 * synchronously (no message broker), the key is stored in Postgres
 * within the same transaction as the operation it protects.
 */
@Entity('idempotency_keys')
export class IdempotencyKey {
  @PrimaryColumn()
  key: string;

  @Column()
  endpoint: string;

  @Column('jsonb')
  response: unknown;

  @CreateDateColumn()
  createdAt: Date;
}
