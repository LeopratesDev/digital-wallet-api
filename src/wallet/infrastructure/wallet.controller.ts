import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WalletService } from '../application/wallet.service.js';
import type {
  DepositInput,
  OpenAccountInput,
  TransferInput,
} from '../../contracts/wallet.contract.js';
import {
  depositContract,
  openAccountContract,
  transferContract,
} from '../../contracts/wallet.contract.js';
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js';

@ApiTags('wallet')
@Controller('accounts')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(openAccountContract))
  openAccount(@Body() body: OpenAccountInput) {
    return this.walletService.openAccount(body);
  }

  @Get(':id')
  getBalance(@Param('id') id: string) {
    return this.walletService.getBalance(id);
  }

  @Get(':id/statement')
  getStatement(@Param('id') id: string) {
    return this.walletService.getStatement(id);
  }

  @Post('deposit')
  @UsePipes(new ZodValidationPipe(depositContract))
  deposit(
    @Body() body: DepositInput,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    if (!idempotencyKey) {
      throw new BadRequestException('Header idempotency-key é obrigatório');
    }
    return this.walletService.deposit(body, idempotencyKey);
  }

  @Post('transfer')
  @UsePipes(new ZodValidationPipe(transferContract))
  transfer(
    @Body() body: TransferInput,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    if (!idempotencyKey) {
      throw new BadRequestException('Header idempotency-key é obrigatório');
    }
    return this.walletService.transfer(body, idempotencyKey);
  }
}
