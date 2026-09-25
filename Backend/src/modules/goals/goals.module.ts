import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../categories/entities/category.entity.js';
import { Debt } from '../debts/entities/debt.entity.js';
import { TransactionsModule } from '../transactions/transactions.module.js';
import { Wallet } from '../wallets/entities/wallet.entity.js';
import { FixedCost } from './entities/fixed-cost.entity.js';
import { GoalContribution } from './entities/goal-contribution.entity.js';
import { SavingGoal } from './entities/saving-goal.entity.js';
import { FixedCostsController } from './fixed-costs.controller.js';
import { GoalsController } from './goals.controller.js';
import { GoalsService } from './goals.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SavingGoal,
      GoalContribution,
      FixedCost,
      Wallet,
      Category,
      Debt,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TransactionsModule,
  ],
  controllers: [GoalsController, FixedCostsController],
  providers: [GoalsService],
  exports: [GoalsService],
})
export class GoalsModule {}
