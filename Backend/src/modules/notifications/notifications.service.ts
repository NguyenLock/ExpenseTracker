import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CategoryType } from '../categories/enums/category-type.enum.js';
import { Transaction } from '../transactions/entities/transaction.entity.js';
import { User } from '../users/entities/user.entity.js';
import type { ListNotificationsQueryDto } from './dto/list-notifications-query.dto.js';
import { Notification } from './entities/notification.entity.js';
import { NotificationType } from './enums/notification-type.enum.js';
import {
  datesOf,
  lastCompletedMonth,
  lastCompletedWeek,
  percentChange,
  previousMonth,
  previousWeek,
  toIsoDate,
  type Period,
} from './notification-periods.js';

type CategoryRow = {
  type: CategoryType;
  categoryName: string | null;
  cur: string;
  prev: string;
  cnt: string;
};

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(userId: string, query: ListNotificationsQueryDto) {
    await this.ensurePeriodSummaries(userId);

    const [items, unreadCount] = await Promise.all([
      this.notificationsRepository.find({
        where: { userId },
        order: { createdAt: 'DESC', periodTo: 'DESC' },
        take: query.limit ?? 10,
      }),
      this.notificationsRepository.count({
        where: { userId, readAt: IsNull() },
      }),
    ]);

    return {
      // ponytail: one aggregate query per item (limit ≤ 50); batch into one query if the list grows.
      items: await Promise.all(items.map((item) => this.toResponse(item))),
      unreadCount,
    };
  }

  async markRead(userId: string, id: string) {
    const notification = await this.notificationsRepository.findOne({
      where: { id, userId },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.readAt) return;
    notification.readAt = new Date();
    await this.notificationsRepository.save(notification);
  }

  async markAllRead(userId: string) {
    await this.notificationsRepository.update(
      { userId, readAt: IsNull() },
      { readAt: new Date() },
    );
  }

  /** Lazily creates the latest completed week/month summary — no backfill, idempotent. */
  private async ensurePeriodSummaries(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) return;

    // ponytail: server-local timezone decides week/month boundaries; add a per-user timezone if users span zones.
    const today = toIsoDate(new Date());
    const registeredOn = toIsoDate(user.createdAt);
    const candidates: [NotificationType, Period][] = [
      [NotificationType.WEEKLY_SUMMARY, lastCompletedWeek(today)],
      [NotificationType.MONTHLY_SUMMARY, lastCompletedMonth(today)],
    ];
    const values = candidates
      .filter(([, period]) => period.to >= registeredOn)
      .map(([type, period]) => ({
        userId,
        type,
        periodKey: period.key,
        periodFrom: period.from,
        periodTo: period.to,
        readAt: null,
      }));
    if (values.length === 0) return;

    await this.notificationsRepository
      .createQueryBuilder()
      .insert()
      .into(Notification)
      .values(values)
      .orIgnore()
      .execute();
  }

  async findOne(userId: string, id: string) {
    const notification = await this.notificationsRepository.findOne({
      where: { id, userId },
    });
    if (!notification) throw new NotFoundException('Notification not found');

    const { current, previous } = this.periodsOf(notification);
    const [rows, dailyRows] = await Promise.all([
      this.categoryRows(userId, current, previous),
      this.dailyExpenseRows(userId, current, previous),
    ]);

    const totals = new Map(dailyRows.map((r) => [r.date, Number(r.total)]));
    const currentDates = datesOf(current);
    const previousDates = datesOf(previous);
    const daily = Array.from(
      { length: Math.max(currentDates.length, previousDates.length) },
      (_, i) => ({
        day: i + 1,
        currentDate: currentDates[i] ?? null,
        previousDate: previousDates[i] ?? null,
        current: currentDates[i] ? (totals.get(currentDates[i]) ?? 0) : 0,
        previous: previousDates[i] ? (totals.get(previousDates[i]) ?? 0) : 0,
      }),
    );

    const categories = rows
      .filter((r) => r.type === CategoryType.EXPENSE)
      .map((r) => ({
        name: r.categoryName ?? 'Other',
        current: Number(r.cur),
        previous: Number(r.prev),
      }))
      .filter((c) => c.current > 0 || c.previous > 0)
      .sort((a, b) => b.current - a.current || b.previous - a.previous);

    return {
      ...this.baseResponse(notification, current, previous),
      summary: this.summarize(rows),
      detail: { daily, categories },
    };
  }

  private periodsOf(notification: Notification) {
    const current: Period = {
      from: String(notification.periodFrom).slice(0, 10),
      to: String(notification.periodTo).slice(0, 10),
      key: notification.periodKey,
    };
    const previous =
      notification.type === NotificationType.WEEKLY_SUMMARY
        ? previousWeek(current)
        : previousMonth(current);
    return { current, previous };
  }

  private baseResponse(
    notification: Notification,
    current: Period,
    previous: Period,
  ) {
    return {
      id: notification.id,
      type: notification.type,
      periodKey: notification.periodKey,
      periodFrom: current.from,
      periodTo: current.to,
      previousFrom: previous.from,
      previousTo: previous.to,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
    };
  }

  private async toResponse(notification: Notification) {
    const { current, previous } = this.periodsOf(notification);
    const rows = await this.categoryRows(
      notification.userId,
      current,
      previous,
    );
    return {
      ...this.baseResponse(notification, current, previous),
      summary: this.summarize(rows),
    };
  }

  /** Expense per day across both (contiguous) periods. */
  private dailyExpenseRows(userId: string, current: Period, previous: Period) {
    return this.transactionsRepository
      .createQueryBuilder('t')
      .select("to_char(t.transaction_date, 'YYYY-MM-DD')", 'date')
      .addSelect('SUM(t.amount)', 'total')
      .where('t.user_id = :userId', { userId })
      .andWhere('t.type = :type', { type: CategoryType.EXPENSE })
      .andWhere('t.transaction_date BETWEEN :pf AND :ct', {
        pf: previous.from,
        ct: current.to,
      })
      .andWhere(
        'NOT EXISTS (SELECT 1 FROM goal_contributions gc WHERE gc.transaction_id = t.id)',
      )
      .groupBy('t.transaction_date')
      .getRawMany<{ date: string; total: string }>();
  }

  /** One query covers both periods (they are contiguous) grouped by type + category. */
  private categoryRows(userId: string, current: Period, previous: Period) {
    return this.transactionsRepository
      .createQueryBuilder('t')
      .leftJoin('t.category', 'c')
      .select('t.type', 'type')
      .addSelect('c.name', 'categoryName')
      .addSelect(
        'COALESCE(SUM(CASE WHEN t.transaction_date BETWEEN :cf AND :ct THEN t.amount ELSE 0 END), 0)',
        'cur',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN t.transaction_date BETWEEN :pf AND :pt THEN t.amount ELSE 0 END), 0)',
        'prev',
      )
      .addSelect(
        'SUM(CASE WHEN t.transaction_date BETWEEN :cf AND :ct THEN 1 ELSE 0 END)',
        'cnt',
      )
      .where('t.user_id = :userId')
      .andWhere('t.transaction_date BETWEEN :pf AND :ct')
      // Saving-goal contributions are savings, not spending.
      .andWhere(
        'NOT EXISTS (SELECT 1 FROM goal_contributions gc WHERE gc.transaction_id = t.id)',
      )
      .groupBy('t.type')
      .addGroupBy('t.category_id')
      .addGroupBy('c.name')
      .setParameters({
        userId,
        cf: current.from,
        ct: current.to,
        pf: previous.from,
        pt: previous.to,
      })
      .getRawMany<CategoryRow>();
  }

  private summarize(rows: CategoryRow[]) {
    let income = 0;
    let expense = 0;
    let previousIncome = 0;
    let previousExpense = 0;
    let transactionCount = 0;
    let topIncrease: {
      name: string;
      amount: number;
      previousAmount: number;
      delta: number;
      changePercent: number | null;
    } | null = null;

    for (const row of rows) {
      const cur = Number(row.cur);
      const prev = Number(row.prev);
      transactionCount += Number(row.cnt);
      if (row.type === CategoryType.INCOME) {
        income += cur;
        previousIncome += prev;
        continue;
      }
      expense += cur;
      previousExpense += prev;
      const delta = cur - prev;
      if (delta > 0 && (!topIncrease || delta > topIncrease.delta)) {
        topIncrease = {
          name: row.categoryName ?? 'Other',
          amount: cur,
          previousAmount: prev,
          delta,
          changePercent: percentChange(cur, prev),
        };
      }
    }

    return {
      income,
      expense,
      net: income - expense,
      previousIncome,
      previousExpense,
      incomeChangePercent: percentChange(income, previousIncome),
      expenseChangePercent: percentChange(expense, previousExpense),
      transactionCount,
      topIncrease,
    };
  }
}
