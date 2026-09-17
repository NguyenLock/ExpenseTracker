import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity.js';
import { CategoryType } from '../categories/enums/category-type.enum.js';
import { TransactionsService } from '../transactions/transactions.service.js';
import { Wallet } from '../wallets/entities/wallet.entity.js';
import type { CreateDebtDto } from './dto/create-debt.dto.js';
import type { ListDebtsQueryDto } from './dto/list-debts-query.dto.js';
import type { UpdateDebtDto } from './dto/update-debt.dto.js';
import { Debt } from './entities/debt.entity.js';
import { DebtDirection, DebtStatus } from './enums/debt.enums.js';

@Injectable()
export class DebtsService {
  constructor(
    @InjectRepository(Debt)
    private readonly debtsRepository: Repository<Debt>,
    @InjectRepository(Wallet)
    private readonly walletsRepository: Repository<Wallet>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    private readonly transactionsService: TransactionsService,
  ) {}

  async findAll(userId: string, query: ListDebtsQueryDto = {}) {
    await this.processDueAutos(userId);

    const items = await this.debtsRepository.find({
      where: {
        userId,
        ...(query.status ? { status: query.status } : {}),
        ...(query.direction ? { direction: query.direction } : {}),
      },
      relations: { wallet: true, category: true },
      order: { dueDate: 'ASC', createdAt: 'DESC' },
    });

    return items.map((item) => this.toResponse(item));
  }

  async getReminders(userId: string) {
    await this.processDueAutos(userId);

    const today = this.todayIso();
    const open = await this.debtsRepository.find({
      where: { userId, status: DebtStatus.OPEN },
      relations: { wallet: true, category: true },
      order: { dueDate: 'ASC' },
    });

    // Remind: anything due today or overdue, plus upcoming within 7 days.
    const weekAhead = this.addDaysIso(today, 7);
    return open
      .filter((debt) => debt.dueDate <= weekAhead)
      .map((item) => this.toResponse(item));
  }

  async create(userId: string, dto: CreateDebtDto) {
    const expectedType =
      dto.direction === DebtDirection.I_OWE
        ? CategoryType.EXPENSE
        : CategoryType.INCOME;

    await this.assertWallet(userId, dto.walletId);
    await this.assertCategory(userId, dto.categoryId, expectedType);

    const autoRecord =
      dto.direction === DebtDirection.OWED_TO_ME
        ? Boolean(dto.autoRecord)
        : false;

    const debt = this.debtsRepository.create({
      userId,
      personName: dto.personName.trim(),
      amount: dto.amount,
      direction: dto.direction,
      dueDate: dto.dueDate.slice(0, 10),
      note: dto.note?.trim() || null,
      autoRecord,
      walletId: dto.walletId,
      categoryId: dto.categoryId,
      status: DebtStatus.OPEN,
      transactionId: null,
      settledAt: null,
    });

    const saved = await this.debtsRepository.save(debt);
    await this.processDueAutos(userId);
    return this.findOne(userId, saved.id);
  }

  async update(userId: string, id: string, dto: UpdateDebtDto) {
    const debt = await this.debtsRepository.findOne({ where: { id, userId } });
    if (!debt) throw new NotFoundException('Debt not found');
    if (debt.status !== DebtStatus.OPEN) {
      throw new BadRequestException('Only open debts can be updated');
    }

    const nextDirection = dto.direction ?? debt.direction;
    const nextWalletId = dto.walletId ?? debt.walletId;
    const nextCategoryId = dto.categoryId ?? debt.categoryId;
    const expectedType =
      nextDirection === DebtDirection.I_OWE
        ? CategoryType.EXPENSE
        : CategoryType.INCOME;

    await this.assertWallet(userId, nextWalletId);
    await this.assertCategory(userId, nextCategoryId, expectedType);

    if (dto.personName !== undefined) debt.personName = dto.personName.trim();
    if (dto.amount !== undefined) debt.amount = dto.amount;
    if (dto.direction !== undefined) debt.direction = dto.direction;
    if (dto.dueDate !== undefined) debt.dueDate = dto.dueDate.slice(0, 10);
    if (dto.note !== undefined) {
      debt.note = dto.note?.trim() ? dto.note.trim() : null;
    }
    if (dto.walletId !== undefined) debt.walletId = dto.walletId;
    if (dto.categoryId !== undefined) debt.categoryId = dto.categoryId;
    if (dto.autoRecord !== undefined) {
      debt.autoRecord =
        nextDirection === DebtDirection.OWED_TO_ME
          ? Boolean(dto.autoRecord)
          : false;
    } else if (dto.direction === DebtDirection.I_OWE) {
      debt.autoRecord = false;
    }

    await this.debtsRepository.save(debt);
    await this.processDueAutos(userId);
    return this.findOne(userId, id);
  }

  async settle(userId: string, id: string) {
    const debt = await this.debtsRepository.findOne({ where: { id, userId } });
    if (!debt) throw new NotFoundException('Debt not found');
    if (debt.status !== DebtStatus.OPEN) {
      throw new BadRequestException('Debt is already settled');
    }

    return this.settleDebt(userId, debt);
  }

  async remove(userId: string, id: string) {
    const debt = await this.debtsRepository.findOne({ where: { id, userId } });
    if (!debt) throw new NotFoundException('Debt not found');
    await this.debtsRepository.remove(debt);
  }

  /** Create income for due auto receivables. Safe to call often. */
  async processDueAutos(userId: string) {
    const today = this.todayIso();
    const due = await this.debtsRepository.find({
      where: {
        userId,
        status: DebtStatus.OPEN,
        direction: DebtDirection.OWED_TO_ME,
        autoRecord: true,
        dueDate: LessThanOrEqual(today),
      },
    });

    for (const debt of due) {
      try {
        await this.settleDebt(userId, debt);
      } catch {
        // Skip broken rows (missing wallet/category) so one bad debt doesn't block others.
      }
    }
  }

  private async settleDebt(userId: string, debt: Debt) {
    const type =
      debt.direction === DebtDirection.I_OWE
        ? CategoryType.EXPENSE
        : CategoryType.INCOME;

    const note =
      debt.note?.trim() ||
      (debt.direction === DebtDirection.I_OWE
        ? `Trả nợ ${debt.personName}`
        : `${debt.personName} trả nợ`);

    const transaction = await this.transactionsService.create(userId, {
      type,
      amount: debt.amount,
      walletId: debt.walletId,
      categoryId: debt.categoryId,
      note,
      transactionDate: debt.dueDate.slice(0, 10),
    });

    debt.status = DebtStatus.SETTLED;
    debt.settledAt = new Date();
    debt.transactionId = transaction.id;
    await this.debtsRepository.save(debt);

    return this.findOne(userId, debt.id);
  }

  private async findOne(userId: string, id: string) {
    const debt = await this.debtsRepository.findOne({
      where: { id, userId },
      relations: { wallet: true, category: true },
    });
    if (!debt) throw new NotFoundException('Debt not found');
    return this.toResponse(debt);
  }

  private async assertWallet(userId: string, walletId: string) {
    const wallet = await this.walletsRepository.findOne({
      where: { id: walletId, userId },
    });
    if (!wallet) throw new BadRequestException('Wallet not found');
  }

  private async assertCategory(
    userId: string,
    categoryId: string,
    type: CategoryType,
  ) {
    const category = await this.categoriesRepository.findOne({
      where: { id: categoryId, userId },
    });
    if (!category) throw new BadRequestException('Category not found');
    if (category.type !== type) {
      throw new BadRequestException(
        type === CategoryType.EXPENSE
          ? 'Use an expense category when you owe someone'
          : 'Use an income category when someone owes you',
      );
    }
  }

  private todayIso() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private addDaysIso(iso: string, days: number) {
    const [y, m, d] = iso.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  }

  private toResponse(debt: Debt) {
    const today = this.todayIso();
    const dueDate = String(debt.dueDate).slice(0, 10);
    return {
      id: debt.id,
      userId: debt.userId,
      personName: debt.personName,
      amount: debt.amount,
      direction: debt.direction,
      dueDate,
      note: debt.note,
      status: debt.status,
      autoRecord: debt.autoRecord,
      walletId: debt.walletId,
      categoryId: debt.categoryId,
      transactionId: debt.transactionId,
      settledAt: debt.settledAt,
      createdAt: debt.createdAt,
      updatedAt: debt.updatedAt,
      walletName: debt.wallet?.name,
      categoryName: debt.category?.name,
      categoryIcon: debt.category?.icon,
      isOverdue: debt.status === DebtStatus.OPEN && dueDate < today,
      isDueToday: debt.status === DebtStatus.OPEN && dueDate === today,
    };
  }
}
