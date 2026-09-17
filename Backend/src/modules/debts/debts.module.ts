import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../categories/entities/category.entity.js';
import { TransactionsModule } from '../transactions/transactions.module.js';
import { Wallet } from '../wallets/entities/wallet.entity.js';
import { DebtsController } from './debts.controller.js';
import { DebtsService } from './debts.service.js';
import { Debt } from './entities/debt.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Debt, Wallet, Category]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TransactionsModule,
  ],
  controllers: [DebtsController],
  providers: [DebtsService],
  exports: [DebtsService],
})
export class DebtsModule {}
