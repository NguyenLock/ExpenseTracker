import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../categories/entities/category.entity.js';
import { Transaction } from '../transactions/entities/transaction.entity.js';
import { BudgetsController } from './budgets.controller.js';
import { BudgetsService } from './budgets.service.js';
import { Budget } from './entities/budget.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Budget, Category, Transaction]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [BudgetsController],
  providers: [BudgetsService],
  exports: [BudgetsService],
})
export class BudgetsModule {}
