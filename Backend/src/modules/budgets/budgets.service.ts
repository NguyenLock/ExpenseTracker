import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity.js';
import { CategoryType } from '../categories/enums/category-type.enum.js';
import { Transaction } from '../transactions/entities/transaction.entity.js';
import type { CopyBudgetsDto } from './dto/copy-budgets.dto.js';
import type { CreateBudgetDto } from './dto/create-budget.dto.js';
import type { ListBudgetsQueryDto } from './dto/list-budgets-query.dto.js';
import type { UpdateBudgetDto } from './dto/update-budget.dto.js';
import { Budget } from './entities/budget.entity.js';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetsRepository: Repository<Budget>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
  ) {}

  async findAll(userId: string, query: ListBudgetsQueryDto = {}) {
    const month = query.month ?? this.currentMonth();
    const items = await this.budgetsRepository.find({
      where: { userId, month },
      relations: { category: true },
      order: { createdAt: 'ASC' },
    });

    // Overall first, then category budgets
    items.sort((a, b) => {
      if (a.categoryId == null && b.categoryId != null) return -1;
      if (a.categoryId != null && b.categoryId == null) return 1;
      return 0;
    });

    return Promise.all(items.map((item) => this.toResponse(item)));
  }

  async create(userId: string, dto: CreateBudgetDto) {
    const categoryId =
      dto.categoryId === undefined || dto.categoryId === ''
        ? null
        : dto.categoryId;

    if (categoryId) {
      await this.assertExpenseCategory(userId, categoryId);
    }

    const existing = await this.budgetsRepository.findOne({
      where: {
        userId,
        month: dto.month,
        categoryId: categoryId == null ? IsNull() : categoryId,
      },
    });
    if (existing) {
      throw new ConflictException(
        categoryId
          ? 'A budget for this category already exists in this month'
          : 'An overall budget already exists for this month',
      );
    }

    const budget = this.budgetsRepository.create({
      userId,
      categoryId,
      amount: dto.amount,
      month: dto.month,
    });
    const saved = await this.budgetsRepository.save(budget);
    return this.findOne(userId, saved.id);
  }

  async update(userId: string, id: string, dto: UpdateBudgetDto) {
    const budget = await this.budgetsRepository.findOne({
      where: { id, userId },
    });
    if (!budget) throw new NotFoundException('Budget not found');

    if (dto.amount !== undefined) budget.amount = dto.amount;
    await this.budgetsRepository.save(budget);
    return this.findOne(userId, id);
  }

  async remove(userId: string, id: string) {
    const budget = await this.budgetsRepository.findOne({
      where: { id, userId },
    });
    if (!budget) throw new NotFoundException('Budget not found');
    await this.budgetsRepository.remove(budget);
  }

  async copy(userId: string, dto: CopyBudgetsDto) {
    if (dto.fromMonth === dto.toMonth) {
      throw new BadRequestException('fromMonth and toMonth must differ');
    }

    const source = await this.budgetsRepository.find({
      where: { userId, month: dto.fromMonth },
    });
    if (source.length === 0) {
      throw new BadRequestException('No budgets to copy in the source month');
    }

    let created = 0;
    let skipped = 0;

    for (const item of source) {
      const exists = await this.budgetsRepository.findOne({
        where: {
          userId,
          month: dto.toMonth,
          categoryId: item.categoryId == null ? IsNull() : item.categoryId,
        },
      });
      if (exists) {
        skipped += 1;
        continue;
      }
      await this.budgetsRepository.save(
        this.budgetsRepository.create({
          userId,
          categoryId: item.categoryId,
          amount: item.amount,
          month: dto.toMonth,
        }),
      );
      created += 1;
    }

    const items = await this.findAll(userId, { month: dto.toMonth });
    return { created, skipped, items };
  }

  private async findOne(userId: string, id: string) {
    const budget = await this.budgetsRepository.findOne({
      where: { id, userId },
      relations: { category: true },
    });
    if (!budget) throw new NotFoundException('Budget not found');
    return this.toResponse(budget);
  }

  private async assertExpenseCategory(userId: string, categoryId: string) {
    const category = await this.categoriesRepository.findOne({
      where: { id: categoryId, userId },
    });
    if (!category) throw new BadRequestException('Category not found');
    if (category.type !== CategoryType.EXPENSE) {
      throw new BadRequestException('Budgets only apply to expense categories');
    }
  }

  private async spentFor(
    userId: string,
    categoryId: string | null,
    month: string,
  ) {
    const { start, end } = this.monthBounds(month);
    const qb = this.transactionsRepository
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.amount), 0)', 'total')
      .where('t.userId = :userId', { userId })
      .andWhere('t.type = :type', { type: CategoryType.EXPENSE })
      .andWhere('t.transactionDate BETWEEN :start AND :end', { start, end });

    if (categoryId) {
      qb.andWhere('t.categoryId = :categoryId', { categoryId });
    }

    const raw = await qb.getRawOne<{ total: string }>();
    return Math.round(Number(raw?.total ?? 0) * 100) / 100;
  }

  private async toResponse(budget: Budget) {
    const spent = await this.spentFor(
      budget.userId,
      budget.categoryId,
      budget.month,
    );
    const amount = Number(budget.amount);
    const remaining = Math.round((amount - spent) * 100) / 100;
    const percentUsed =
      amount > 0 ? Math.round((spent / amount) * 1000) / 10 : 0;
    const isOverall = budget.categoryId == null;

    return {
      id: budget.id,
      userId: budget.userId,
      categoryId: budget.categoryId,
      amount,
      month: budget.month,
      spent,
      remaining,
      percentUsed,
      isOverall,
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt,
      categoryName: isOverall
        ? 'All expenses'
        : budget.category?.name,
      categoryIcon: budget.category?.icon,
    };
  }

  private currentMonth() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  private monthBounds(month: string) {
    const [y, m] = month.split('-').map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    return {
      start: `${month}-01`,
      end: `${month}-${String(lastDay).padStart(2, '0')}`,
    };
  }
}
