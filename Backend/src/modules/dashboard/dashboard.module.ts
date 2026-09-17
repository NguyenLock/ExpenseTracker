import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DebtsModule } from '../debts/debts.module.js';
import { Transaction } from '../transactions/entities/transaction.entity.js';
import { Wallet } from '../wallets/entities/wallet.entity.js';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Wallet]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    DebtsModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
