import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginated } from '../../common/dto/pagination.dto.js';
import { Category } from '../categories/entities/category.entity.js';
import { Wallet } from '../wallets/entities/wallet.entity.js';
import type { CreateTransactionDto } from './dto/create-transaction.dto.js';
import type { ListTransactionsQueryDto } from './dto/list-transactions-query.dto.js';
import type { UpdateTransactionDto } from './dto/update-transaction.dto.js';
import { Transaction } from './entities/transaction.entity.js';
import type { CategoryType } from '../categories/enums/category-type.enum.js';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(Wallet)
    private readonly walletsRepository: Repository<Wallet>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
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

    const transaction = this.transactionsRepository.create({
      userId,
      walletId: dto.walletId,
      categoryId: dto.categoryId,
      amount: dto.amount,
      type: dto.type,
      note: dto.note?.trim() || null,
      transactionDate: dto.transactionDate.slice(0, 10),
    });

    const saved = await this.transactionsRepository.save(transaction);
    return this.findOne(userId, saved.id);
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    const transaction = await this.transactionsRepository.findOne({
      where: { id, userId },
    });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    const nextWalletId = dto.walletId ?? transaction.walletId;
    const nextCategoryId = dto.categoryId ?? transaction.categoryId;
    const nextType = dto.type ?? transaction.type;

    await this.assertWallet(userId, nextWalletId);
    await this.assertCategory(userId, nextCategoryId, nextType);

    if (dto.walletId !== undefined) transaction.walletId = dto.walletId;
    if (dto.categoryId !== undefined) transaction.categoryId = dto.categoryId;
    if (dto.amount !== undefined) transaction.amount = dto.amount;
    if (dto.type !== undefined) transaction.type = dto.type;
    if (dto.note !== undefined) {
      transaction.note = dto.note?.trim() ? dto.note.trim() : null;
    }
    if (dto.transactionDate !== undefined) {
      transaction.transactionDate = dto.transactionDate.slice(0, 10);
    }

    await this.transactionsRepository.save(transaction);
    return this.findOne(userId, id);
  }

  async remove(userId: string, id: string) {
    const transaction = await this.transactionsRepository.findOne({
      where: { id, userId },
    });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    await this.transactionsRepository.remove(transaction);
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
