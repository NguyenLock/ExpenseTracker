import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { paginated } from '../../common/dto/pagination.dto.js';
import { Category } from '../categories/entities/category.entity.js';
import { CategoryType } from '../categories/enums/category-type.enum.js';
import { Wallet } from '../wallets/entities/wallet.entity.js';
import type { CreateTransactionDto } from './dto/create-transaction.dto.js';
import type { ListTransactionsQueryDto } from './dto/list-transactions-query.dto.js';
import type { UpdateTransactionDto } from './dto/update-transaction.dto.js';
import { Transaction } from './entities/transaction.entity.js';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(Wallet)
    private readonly walletsRepository: Repository<Wallet>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(userId: string, query: ListTransactionsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [items, total] = await this.transactionsRepository.findAndCount({
      where: {
        userId,
        ...(query.type ? { type: query.type } : {}),
      },
      relations: { wallet: true, category: true },
      order: { transactionDate: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginated(
      items.map((item) => this.toResponse(item)),
      total,
      page,
      limit,
    );
  }

  async findOne(userId: string, id: string) {
    const transaction = await this.transactionsRepository.findOne({
      where: { id, userId },
      relations: { wallet: true, category: true },
    });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return this.toResponse(transaction);
  }

  async create(userId: string, dto: CreateTransactionDto) {
    await this.assertWallet(userId, dto.walletId);
    await this.assertCategory(userId, dto.categoryId, dto.type);

    return this.dataSource.transaction(async (manager) => {
      const transaction = manager.create(Transaction, {
        userId,
        walletId: dto.walletId,
        categoryId: dto.categoryId,
        amount: dto.amount,
        type: dto.type,
        note: dto.note?.trim() || null,
        transactionDate: dto.transactionDate.slice(0, 10),
      });

      const saved = await manager.save(transaction);
      await this.applyBalanceDelta(
        manager.getRepository(Wallet),
        userId,
        dto.walletId,
        this.signedAmount(dto.type, dto.amount),
      );

      const full = await manager.findOne(Transaction, {
        where: { id: saved.id, userId },
        relations: { wallet: true, category: true },
      });
      return this.toResponse(full!);
    });
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    const existing = await this.transactionsRepository.findOne({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException('Transaction not found');
    }

    const nextWalletId = dto.walletId ?? existing.walletId;
    const nextCategoryId = dto.categoryId ?? existing.categoryId;
    const nextType = dto.type ?? existing.type;
    const nextAmount = dto.amount ?? existing.amount;

    await this.assertWallet(userId, nextWalletId);
    await this.assertCategory(userId, nextCategoryId, nextType);

    return this.dataSource.transaction(async (manager) => {
      const wallets = manager.getRepository(Wallet);
      const txs = manager.getRepository(Transaction);

      // Reverse previous effect, then apply new.
      await this.applyBalanceDelta(
        wallets,
        userId,
        existing.walletId,
        -this.signedAmount(existing.type, existing.amount),
      );

      existing.walletId = nextWalletId;
      existing.categoryId = nextCategoryId;
      existing.type = nextType;
      existing.amount = nextAmount;
      if (dto.note !== undefined) {
        existing.note = dto.note?.trim() ? dto.note.trim() : null;
      }
      if (dto.transactionDate !== undefined) {
        existing.transactionDate = dto.transactionDate.slice(0, 10);
      }

      await txs.save(existing);

      await this.applyBalanceDelta(
        wallets,
        userId,
        nextWalletId,
        this.signedAmount(nextType, nextAmount),
      );

      const full = await txs.findOne({
        where: { id, userId },
        relations: { wallet: true, category: true },
      });
      return this.toResponse(full!);
    });
  }

  async remove(userId: string, id: string) {
    const existing = await this.transactionsRepository.findOne({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException('Transaction not found');
    }

    await this.dataSource.transaction(async (manager) => {
      await this.applyBalanceDelta(
        manager.getRepository(Wallet),
        userId,
        existing.walletId,
        -this.signedAmount(existing.type, existing.amount),
      );
      await manager.getRepository(Transaction).remove(existing);
    });
  }

  private signedAmount(type: CategoryType, amount: number) {
    return type === CategoryType.INCOME ? amount : -amount;
  }

  private async applyBalanceDelta(
    wallets: Repository<Wallet>,
    userId: string,
    walletId: string,
    delta: number,
  ) {
    if (delta === 0) return;

    const wallet = await wallets.findOne({ where: { id: walletId, userId } });
    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    wallet.balance = Number(wallet.balance) + delta;
    await wallets.save(wallet);
  }

  private async assertWallet(userId: string, walletId: string) {
    const wallet = await this.walletsRepository.findOne({
      where: { id: walletId, userId },
    });
    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }
  }

  private async assertCategory(
    userId: string,
    categoryId: string,
    type: CategoryType,
  ) {
    const category = await this.categoriesRepository.findOne({
      where: { id: categoryId, userId },
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }
    if (category.type !== type) {
      throw new BadRequestException('Category type must match transaction type');
    }
  }

  private toResponse(transaction: Transaction) {
    return {
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
    };
  }
}
