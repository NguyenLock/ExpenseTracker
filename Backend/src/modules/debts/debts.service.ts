import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    const open = await this.debtsRepository.find({
      where: { userId, status: DebtStatus.OPEN },
      relations: { wallet: true, category: true },
      order: { dueDate: 'ASC' },
    });

    return open
      .map((item) => this.toResponse(item))
      .filter(
        (debt) =>
          debt.isInPayWindow ||
          debt.isOverdue ||
          debt.isDueToday ||
          this.isUpcoming(debt.windowEnd ?? debt.dueDate, 7),
      );
  }

  async create(userId: string, dto: CreateDebtDto) {
    const expectedType =
      dto.direction === DebtDirection.I_OWE
        ? CategoryType.EXPENSE
        : CategoryType.INCOME;

    await this.assertWallet(userId, dto.walletId);
    await this.assertCategory(userId, dto.categoryId, expectedType);
    this.assertPayWindow(dto.payWindowStartDay, dto.payWindowEndDay);

    const installmentCount = dto.installmentCount ?? 1;
    const autoRecord =
      dto.direction === DebtDirection.OWED_TO_ME
        ? Boolean(dto.autoRecord)
        : false;

    const debt = this.debtsRepository.create({
      userId,
      personName: dto.personName.trim(),
      amount: dto.amount,
      installmentCount,
      paidInstallments: 0,
      payWindowStartDay: dto.payWindowStartDay ?? null,
      payWindowEndDay: dto.payWindowEndDay ?? null,
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
    if (debt.paidInstallments > 0) {
      throw new BadRequestException(
        'Cannot edit a debt after installments have been paid',
      );
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

    const nextStart =
      dto.payWindowStartDay !== undefined
        ? dto.payWindowStartDay
        : debt.payWindowStartDay;
    const nextEnd =
      dto.payWindowEndDay !== undefined
        ? dto.payWindowEndDay
        : debt.payWindowEndDay;
    this.assertPayWindow(nextStart ?? undefined, nextEnd ?? undefined);

    if (dto.personName !== undefined) debt.personName = dto.personName.trim();
    if (dto.amount !== undefined) debt.amount = dto.amount;
    if (dto.direction !== undefined) debt.direction = dto.direction;
    if (dto.dueDate !== undefined) debt.dueDate = dto.dueDate.slice(0, 10);
    if (dto.installmentCount !== undefined) {
      debt.installmentCount = dto.installmentCount;
    }
    if (dto.payWindowStartDay !== undefined) {
      debt.payWindowStartDay = dto.payWindowStartDay;
    }
    if (dto.payWindowEndDay !== undefined) {
      debt.payWindowEndDay = dto.payWindowEndDay;
    }
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

    return this.payInstallment(userId, debt);
  }

  async remove(userId: string, id: string) {
    const debt = await this.debtsRepository.findOne({ where: { id, userId } });
    if (!debt) throw new NotFoundException('Debt not found');
    await this.debtsRepository.remove(debt);
  }

  async processDueAutos(userId: string) {
    const today = this.todayIso();
    const due = await this.debtsRepository.find({
      where: {
        userId,
        status: DebtStatus.OPEN,
        direction: DebtDirection.OWED_TO_ME,
        autoRecord: true,
      },
    });

    for (const debt of due) {
      let current: Debt | null = debt;
      while (current && current.status === DebtStatus.OPEN) {
        const window = this.currentWindow(current);
        const triggerDate =
          window?.end ?? String(current.dueDate).slice(0, 10);
        if (today < triggerDate) break;
        try {
          await this.payInstallment(userId, current);
          current = await this.debtsRepository.findOne({
            where: { id: debt.id, userId },
          });
        } catch {
          break;
        }
      }
    }
  }

  private async payInstallment(userId: string, debt: Debt) {
    const type =
      debt.direction === DebtDirection.I_OWE
        ? CategoryType.EXPENSE
        : CategoryType.INCOME;

    const installmentAmount = this.installmentAmountFor(debt);
    const paidNext = debt.paidInstallments + 1;
    const noteBase =
      debt.note?.trim() ||
      (debt.direction === DebtDirection.I_OWE
        ? `Trả nợ ${debt.personName}`
        : `${debt.personName} trả nợ`);
    const note =
      debt.installmentCount > 1
        ? `${noteBase} (${paidNext}/${debt.installmentCount})`
        : noteBase;

    const window = this.currentWindow(debt);
    const transactionDate =
      this.todayIso() <= (window?.end ?? String(debt.dueDate).slice(0, 10))
        ? this.todayIso()
        : (window?.end ?? String(debt.dueDate).slice(0, 10));

    const transaction = await this.transactionsService.create(userId, {
      type,
      amount: installmentAmount,
      walletId: debt.walletId,
      categoryId: debt.categoryId,
      note,
      transactionDate,
    });

    debt.paidInstallments = paidNext;
    debt.transactionId = transaction.id;

    if (paidNext >= debt.installmentCount) {
      debt.status = DebtStatus.SETTLED;
      debt.settledAt = new Date();
    }

    await this.debtsRepository.save(debt);
    return this.findOne(userId, debt.id);
  }

  private installmentAmountFor(debt: Debt) {
    const monthly = Number(debt.amount);
    const count = Math.max(1, debt.installmentCount);
    if (debt.paidInstallments >= count) return 0;
    return monthly;
  }

  private currentWindow(debt: Debt) {
    return this.windowFor(debt, debt.paidInstallments);
  }

  private windowFor(debt: Debt, index: number) {
    const startDay = debt.payWindowStartDay;
    const endDay = debt.payWindowEndDay;
    if (!startDay || !endDay) return null;

    const anchor = String(debt.dueDate).slice(0, 10);
    const [ay, am] = anchor.split('-').map(Number);
    // First cycle month = month of dueDate; then + index months
    let year = ay;
    let month = am - 1 + index;
    year += Math.floor(month / 12);
    month = ((month % 12) + 12) % 12;

    const start = new Date(year, month, startDay);
    let endYear = year;
    let endMonth = month;
    if (endDay < startDay) {
      endMonth += 1;
      if (endMonth > 11) {
        endMonth = 0;
        endYear += 1;
      }
    }
    const end = new Date(endYear, endMonth, endDay);

    return {
      start: this.toIsoDate(start),
      end: this.toIsoDate(end),
    };
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

  private assertPayWindow(start?: number | null, end?: number | null) {
    if ((start == null) !== (end == null)) {
      throw new BadRequestException(
        'Provide both pay window start and end days, or neither',
      );
    }
  }

  private todayIso() {
    return this.toIsoDate(new Date());
  }

  private toIsoDate(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private isUpcoming(iso: string, withinDays: number) {
    const today = this.todayIso();
    if (iso < today) return false;
    const [y, m, d] = today.split('-').map(Number);
    const limit = new Date(y, m - 1, d);
    limit.setDate(limit.getDate() + withinDays);
    return iso <= this.toIsoDate(limit);
  }

  private toResponse(debt: Debt) {
    const today = this.todayIso();
    const dueDate = String(debt.dueDate).slice(0, 10);
    const window = this.currentWindow(debt);
    const windowStart = window?.start ?? null;
    const windowEnd = window?.end ?? null;
    const effectiveDue = windowEnd ?? dueDate;

    const isInPayWindow = Boolean(
      windowStart &&
        windowEnd &&
        today >= windowStart &&
        today <= windowEnd,
    );

    return {
      id: debt.id,
      userId: debt.userId,
      personName: debt.personName,
      amount: debt.amount,
      totalAmount:
        Math.round(
          Number(debt.amount) * Math.max(1, debt.installmentCount) * 100,
        ) / 100,
      installmentCount: debt.installmentCount,
      paidInstallments: debt.paidInstallments,
      installmentAmount: this.installmentAmountFor(debt),
      payWindowStartDay: debt.payWindowStartDay,
      payWindowEndDay: debt.payWindowEndDay,
      windowStart,
      windowEnd,
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
      isOverdue:
        debt.status === DebtStatus.OPEN &&
        !isInPayWindow &&
        effectiveDue < today,
      isDueToday:
        debt.status === DebtStatus.OPEN &&
        (today === effectiveDue || isInPayWindow),
      isInPayWindow:
        debt.status === DebtStatus.OPEN ? isInPayWindow : false,
    };
  }
}
