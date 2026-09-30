import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { IdempotencyKey } from '../domain/entities/idempotency-key.entity.js';

@Injectable()
export class IdempotencyService {
  async findResponse(
    manager: EntityManager,
    key: string,
  ): Promise<unknown> {
    const existing = await manager.findOne(IdempotencyKey, { where: { key } });
    return existing?.response;
  }

  async saveResponse(
    manager: EntityManager,
    key: string,
    endpoint: string,
    response: unknown,
  ): Promise<void> {
    await manager.insert(IdempotencyKey, {
      key,
      endpoint,
      response: response as object,
    });
  }
}
