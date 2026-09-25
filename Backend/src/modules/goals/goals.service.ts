import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity.js';
import { CategoryType } from '../categories/enums/category-type.enum.js';
import { Debt } from '../debts/entities/debt.entity.js';
import { DebtDirection, DebtStatus } from '../debts/enums/debt.enums.js';
import { TransactionsService } from '../transactions/transactions.service.js';
import { Wallet } from '../wallets/entities/wallet.entity.js';
import type { ContributeGoalDto } from './dto/contribute-goal.dto.js';
import type { CreateGoalDto } from './dto/create-goal.dto.js';
import type {
  CreateFixedCostDto,
  UpdateFixedCostDto,
} from './dto/fixed-cost.dto.js';
import type { ListGoalsQueryDto } from './dto/list-goals-query.dto.js';
import type { PlanGoalDto } from './dto/plan-goal.dto.js';
import type { UpdateGoalDto } from './dto/update-goal.dto.js';
import { FixedCost } from './entities/fixed-cost.entity.js';
import { GoalContribution } from './entities/goal-contribution.entity.js';
import { SavingGoal } from './entities/saving-goal.entity.js';
import { GoalStatus } from './enums/goal-status.enum.js';
import { buildPlan, monthsLeftUntil } from './goals-planner.js';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(SavingGoal)
    private readonly goalsRepository: Repository<SavingGoal>,
    @InjectRepository(GoalContribution)
    private readonly contributionsRepository: Repository<GoalContribution>,
    @InjectRepository(FixedCost)
    private readonly fixedCostsRepository: Repository<FixedCost>,
    @InjectRepository(Wallet)
    private readonly walletsRepository: Repository<Wallet>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Debt)
    private readonly debtsRepository: Repository<Debt>,
    private readonly transactionsService: TransactionsService,
  ) {}

  async findAll(userId: string, query: ListGoalsQueryDto = {}) {
    const items = await this.goalsRepository.find({
      where: {
        userId,
        ...(query.status ? { status: query.status } : {}),
      },
      relations: { wallet: true },
      order: { createdAt: 'DESC' },
    });
    return items.map((item) => this.toGoalResponse(item));
  }

  async findOne(userId: string, id: string) {
    const goal = await this.goalsRepository.findOne({
      where: { id, userId },
      relations: { wallet: true },
    });
    if (!goal) throw new NotFoundException('Goal not found');
    return this.toGoalResponse(goal);
  }

  async create(userId: string, dto: CreateGoalDto) {
    if (dto.walletId) await this.assertWallet(userId, dto.walletId);

    const savedAmount = dto.savedAmount ?? 0;
    if (savedAmount > dto.targetAmount) {
      throw new BadRequestException('savedAmount cannot exceed targetAmount');
    }

    const status =
      savedAmount >= dto.targetAmount
        ? GoalStatus.COMPLETED
        : GoalStatus.ACTIVE;

    const goal = this.goalsRepository.create({
      userId,
      name: dto.name.trim(),
      targetAmount: dto.targetAmount,
      savedAmount,
      deadline: dto.deadline ? dto.deadline.slice(0, 10) : null,
      walletId: dto.walletId ?? null,
      status,
    });

    const saved = await this.goalsRepository.save(goal);
    return this.findOne(userId, saved.id);
  }

  async update(userId: string, id: string, dto: UpdateGoalDto) {
    const goal = await this.goalsRepository.findOne({ where: { id, userId } });
    if (!goal) throw new NotFoundException('Goal not found');

    if (dto.walletId) await this.assertWallet(userId, dto.walletId);

    if (dto.name !== undefined) goal.name = dto.name.trim();
    if (dto.targetAmount !== undefined) goal.targetAmount = dto.targetAmount;
    if (dto.savedAmount !== undefined) goal.savedAmount = dto.savedAmount;
    if (dto.deadline !== undefined) {
      goal.deadline = dto.deadline ? dto.deadline.slice(0, 10) : null;
    }
    if (dto.walletId !== undefined) goal.walletId = dto.walletId;
    if (dto.status !== undefined) goal.status = dto.status;

    if (Number(goal.savedAmount) >= Number(goal.targetAmount)) {
      goal.status = GoalStatus.COMPLETED;
    } else if (
      goal.status === GoalStatus.COMPLETED &&
      Number(goal.savedAmount) < Number(goal.targetAmount)
    ) {
      goal.status = GoalStatus.ACTIVE;
    }

    await this.goalsRepository.save(goal);
    return this.findOne(userId, id);
  }

  async remove(userId: string, id: string) {
    const goal = await this.goalsRepository.findOne({ where: { id, userId } });
    if (!goal) throw new NotFoundException('Goal not found');
    await this.goalsRepository.remove(goal);
  }

  async contribute(userId: string, id: string, dto: ContributeGoalDto) {
    const goal = await this.goalsRepository.findOne({ where: { id, userId } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.status === GoalStatus.CANCELLED) {
      throw new BadRequestException('Cannot contribute to a cancelled goal');
    }
    if (goal.status === GoalStatus.COMPLETED) {
      throw new BadRequestException('Goal is already completed');
    }

    const wallet = await this.assertWallet(userId, dto.fromWalletId);
    await this.assertCategory(userId, dto.categoryId, CategoryType.EXPENSE);

    if (Number(wallet.balance) < dto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const today = this.todayIso();
    const note =
      dto.note?.trim() || `Saving: ${goal.name}`;

    const transaction = await this.transactionsService.create(userId, {
      type: CategoryType.EXPENSE,
      amount: dto.amount,
      walletId: dto.fromWalletId,
      categoryId: dto.categoryId,
      note,
      transactionDate: today,
    });

    goal.savedAmount = Number(goal.savedAmount) + dto.amount;
    if (goal.savedAmount >= Number(goal.targetAmount)) {
      goal.status = GoalStatus.COMPLETED;
    }
    await this.goalsRepository.save(goal);

    await this.contributionsRepository.save(
      this.contributionsRepository.create({
        goalId: goal.id,
        userId,
        amount: dto.amount,
        fromWalletId: dto.fromWalletId,
        transactionId: transaction.id,
        note,
        contributedAt: today,
      }),
    );

    return this.findOne(userId, id);
  }

  async plan(userId: string, id: string, dto: PlanGoalDto) {
    const goal = await this.goalsRepository.findOne({ where: { id, userId } });
    if (!goal) throw new NotFoundException('Goal not found');

    const useDebts = dto.useDebts !== false;
    const committedDebts = useDebts
      ? await this.sumOpenIOweInstallments(userId)
      : 0;
    const fixed = await this.fixedCostsRepository.find({
      where: { userId, isActive: true },
    });
    const committedFixed = fixed.reduce((sum, f) => sum + Number(f.amount), 0);

    const result = buildPlan({
      targetAmount: Number(goal.targetAmount),
      savedAmount: Number(goal.savedAmount),
      deadline: goal.deadline ? String(goal.deadline).slice(0, 10) : null,
      today: this.todayIso(),
      monthlyIncome: dto.monthlyIncome,
      committedDebts,
      committedFixed,
      extraFixed: dto.extraFixed,
    });

    return {
      goal: this.toGoalResponse(goal),
      fixedCosts: fixed.map((f) => this.toFixedCostResponse(f)),
      ...result,
    };
  }

  // —— Fixed costs ——

  async listFixedCosts(userId: string) {
    const items = await this.fixedCostsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return items.map((item) => this.toFixedCostResponse(item));
  }

  async createFixedCost(userId: string, dto: CreateFixedCostDto) {
    const item = this.fixedCostsRepository.create({
      userId,
      label: dto.label.trim(),
      amount: dto.amount,
      isActive: dto.isActive ?? true,
    });
    const saved = await this.fixedCostsRepository.save(item);
    return this.toFixedCostResponse(saved);
  }

  async updateFixedCost(userId: string, id: string, dto: UpdateFixedCostDto) {
    const item = await this.fixedCostsRepository.findOne({
      where: { id, userId },
    });
    if (!item) throw new NotFoundException('Fixed cost not found');
    if (dto.label !== undefined) item.label = dto.label.trim();
    if (dto.amount !== undefined) item.amount = dto.amount;
    if (dto.isActive !== undefined) item.isActive = dto.isActive;
    const saved = await this.fixedCostsRepository.save(item);
    return this.toFixedCostResponse(saved);
  }

  async removeFixedCost(userId: string, id: string) {
    const item = await this.fixedCostsRepository.findOne({
      where: { id, userId },
    });
    if (!item) throw new NotFoundException('Fixed cost not found');
    await this.fixedCostsRepository.remove(item);
  }

  private async sumOpenIOweInstallments(userId: string) {
    const debts = await this.debtsRepository.find({
      where: {
        userId,
        status: DebtStatus.OPEN,
        direction: DebtDirection.I_OWE,
      },
    });
    // amount field = monthly installment (see debts create semantics)
    return debts.reduce((sum, d) => sum + Number(d.amount), 0);
  }

  private async assertWallet(userId: string, walletId: string) {
    const wallet = await this.walletsRepository.findOne({
      where: { id: walletId, userId },
    });
    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
  }

  private async assertCategory(
    userId: string,
    categoryId: string,
    type: CategoryType,
  ) {
    const category = await this.categoriesRepository.findOne({
      where: { id: categoryId, userId },
    });
    if (!category) throw new NotFoundException('Category not found');
    if (category.type !== type) {
      throw new BadRequestException(`Category must be ${type}`);
    }
    return category;
  }

  private todayIso() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private toGoalResponse(goal: SavingGoal) {
    const target = Number(goal.targetAmount);
    const saved = Number(goal.savedAmount);
    const remaining = Math.max(0, Math.round((target - saved) * 100) / 100);
    const percentSaved =
      target > 0 ? Math.round((saved / target) * 1000) / 10 : 0;
    const deadline = goal.deadline
      ? String(goal.deadline).slice(0, 10)
      : null;
    let suggestedMonthly: number | null = null;
    if (deadline && remaining > 0 && goal.status === GoalStatus.ACTIVE) {
      const months = monthsLeftUntil(deadline, this.todayIso());
      suggestedMonthly = Math.round((remaining / months) * 100) / 100;
    }

    return {
      id: goal.id,
      userId: goal.userId,
      name: goal.name,
      targetAmount: target,
      savedAmount: saved,
      remaining,
      percentSaved,
      deadline,
      suggestedMonthly,
      walletId: goal.walletId,
      walletName: goal.wallet?.name,
      status: goal.status,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    };
  }

  private toFixedCostResponse(item: FixedCost) {
    return {
      id: item.id,
      userId: item.userId,
      label: item.label,
      amount: Number(item.amount),
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
