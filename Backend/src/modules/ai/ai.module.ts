import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../categories/entities/category.entity.js';
import { Transaction } from '../transactions/entities/transaction.entity.js';
import { TransactionsModule } from '../transactions/transactions.module.js';
import { Wallet } from '../wallets/entities/wallet.entity.js';
import { AiClientService } from './ai-client.service.js';
import { AiController } from './ai.controller.js';
import { AiService } from './ai.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Wallet, Category]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TransactionsModule,
  ],
  controllers: [AiController],
  providers: [AiClientService, AiService],
})
export class AiModule {}
