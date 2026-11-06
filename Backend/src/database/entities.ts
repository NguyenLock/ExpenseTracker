import { RefreshToken } from '../modules/auth/entities/refresh-token.entity.js';
import { Budget } from '../modules/budgets/entities/budget.entity.js';
import { Category } from '../modules/categories/entities/category.entity.js';
import { Debt } from '../modules/debts/entities/debt.entity.js';
import { FixedCost } from '../modules/goals/entities/fixed-cost.entity.js';
import { GoalContribution } from '../modules/goals/entities/goal-contribution.entity.js';
import { SavingGoal } from '../modules/goals/entities/saving-goal.entity.js';
import { Notification } from '../modules/notifications/entities/notification.entity.js';
import { TransactionTemplate } from '../modules/transaction-templates/entities/transaction-template.entity.js';
import { Transaction } from '../modules/transactions/entities/transaction.entity.js';
import { User } from '../modules/users/entities/user.entity.js';
import { Wallet } from '../modules/wallets/entities/wallet.entity.js';

/** Explicit list so migrations do not depend on Nest autoLoadEntities. */
export const entities = [
  User,
  RefreshToken,
  Category,
  Wallet,
  Transaction,
  TransactionTemplate,
  Debt,
  Budget,
  Notification,
  SavingGoal,
  GoalContribution,
  FixedCost,
];
