import { z } from 'zod';

/**
 * Contratos declarativos da Wallet API, isolados da camada HTTP.
 * Qualquer controller/worker futuro deve importar destes esquemas
 * em vez de redefinir validação — é a única fonte de verdade do payload.
 */

export const openAccountContract = z.object({
  ownerName: z.string().min(3).max(120),
  ownerDocument: z.string().min(11).max(14),
});
export type OpenAccountInput = z.infer<typeof openAccountContract>;

export const depositContract = z.object({
  accountId: z.string().uuid(),
  amount: z.number().positive(),
});
export type DepositInput = z.infer<typeof depositContract>;

export const transferContract = z.object({
  fromAccountId: z.string().uuid(),
  toAccountId: z.string().uuid(),
  amount: z.number().positive(),
});
export type TransferInput = z.infer<typeof transferContract>;

export const idempotencyKeyHeaderContract = z.string().min(10).max(128);
