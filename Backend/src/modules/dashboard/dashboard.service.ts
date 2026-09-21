import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { BudgetsService } from '../budgets/budgets.service.js';
import { CategoryType } from '../categories/enums/category-type.enum.js';
import { DebtsService } from '../debts/debts.service.js';
import { Transaction } from '../transactions/entities/transaction.entity.js';
import { Wallet } from '../wallets/entities/wallet.entity.js';
import {
  DashboardPeriod,
  type DashboardQueryDto,
} from './dto/dashboard-query.dto.js';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(Wallet)
    private readonly walletsRepository: Repository<Wallet>,
    private readonly debtsService: DebtsService,
    private readonly budgetsService: BudgetsService,
  ) {}

  async getOverview(userId: string, query: DashboardQueryDto) {
    const period = query.period ?? DashboardPeriod.WEEK;
    const range = this.resolveRange(period);

    // Settle auto receivables first so income/balance reflect today.
    const debtReminders = await this.debtsService.getReminders(userId);

    const [totalIncome, totalExpense, walletBalance, recent, wallets, budgets] =
      await Promise.all([
        this.sumTransactions(userId, CategoryType.INCOME, range),
        this.sumTransactions(userId, CategoryType.EXPENSE, range),
        this.sumWalletBalances(userId),
        this.transactionsRepository.find({
          where: {
            userId,
            ...(range
              ? { transactionDate: Between(range.from, range.to) }
              : {}),
          },
          relations: { wallet: true, category: true },
          order: { transactionDate: 'DESC', createdAt: 'DESC' },
          take: 5,
        }),
        this.walletsRepository.find({
          where: { userId },
          order: { balance: 'DESC', name: 'ASC' },
        }),
        this.budgetsService.findAll(userId, {
          month: this.currentMonth(),
        }),
      ]);

    return {
      period,
      from: range?.from ?? null,
      to: range?.to ?? null,
      totalIncome,
      totalExpense,
      totalSavings: totalIncome - totalExpense,
      walletBalance,
      recentTransactions: recent.map((transaction) => ({
        id: transaction.id,
        userId: transaction.userId,
        walletId: transaction.walletId,
        categoryId: transaction.categoryId,
        amount: transaction.amount,
        type: transaction.type,
        note: transaction.note,
        transactionDate: String(transaction.transactionDate).slice(0, 10),
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        walletName: transaction.wallet?.name,
        categoryName: transaction.category?.name,
        categoryIcon: transaction.category?.icon,
      })),
      wallets: wallets.map((wallet) => ({
        id: wallet.id,
        name: wallet.name,
        type: wallet.type,
        balance: wallet.balance,
      })),
      debtReminders,
      budgets,
    };
  }

  private currentMonth() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  private resolveRange(period: DashboardPeriod) {
    if (period === DashboardPeriod.ALL) return null;

    const now = new Date();
    const to = this.toIsoDate(now);
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (period === DashboardPeriod.WEEK) {
      const mondayOffset = (start.getDay() + 6) % 7;
      start.setDate(start.getDate() - mondayOffset);
    } else {
      start.setDate(1);
    }

    return { from: this.toIsoDate(start), to };
  }

  private toIsoDate(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private async sumTransactions(
    userId: string,
    type: CategoryType,
    range: { from: string; to: string } | null,
  ) {
    const qb = this.transactionsRepository
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.amount), 0)', 'total')
      .where('t.user_id = :userId', { userId })
      .andWhere('t.type = :type', { type });

    if (range) {
      qb.andWhere('t.transaction_date BETWEEN :from AND :to', range);
    }

    const row = await qb.getRawOne<{ total: string }>();
    return Number(row?.total ?? 0);
  }

  private async sumWalletBalances(userId: string) {
    const row = await this.walletsRepository
      .createQueryBuilder('w')
      .select('COALESCE(SUM(w.balance), 0)', 'total')
      .where('w.user_id = :userId', { userId })
      .getRawOne<{ total: string }>();

    return Number(row?.total ?? 0);
  }
}
