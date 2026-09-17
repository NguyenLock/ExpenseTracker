import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity.js';
import type { CategoryType } from '../categories/enums/category-type.enum.js';
import { Wallet } from '../wallets/entities/wallet.entity.js';
import type { CreateTransactionTemplateDto } from './dto/create-transaction-template.dto.js';
import type { UpdateTransactionTemplateDto } from './dto/update-transaction-template.dto.js';
import { TransactionTemplate } from './entities/transaction-template.entity.js';

@Injectable()
export class TransactionTemplatesService {
  constructor(
    @InjectRepository(TransactionTemplate)
    private readonly templatesRepository: Repository<TransactionTemplate>,
    @InjectRepository(Wallet)
    private readonly walletsRepository: Repository<Wallet>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async findAll(userId: string) {
    const items = await this.templatesRepository.find({
      where: { userId },
      relations: { wallet: true, category: true },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
    return items.map((item) => this.toResponse(item));
  }

  async create(userId: string, dto: CreateTransactionTemplateDto) {
    await this.assertWallet(userId, dto.walletId);
    await this.assertCategory(userId, dto.categoryId, dto.type);

    const count = await this.templatesRepository.count({ where: { userId } });
    const label = dto.label.trim();
    const template = this.templatesRepository.create({
      userId,
      label,
      type: dto.type,
      amount: dto.amount,
      walletId: dto.walletId,
      categoryId: dto.categoryId,
      note: dto.note?.trim() || label,
      sortOrder: count,
    });

    const saved = await this.templatesRepository.save(template);
    return this.findOne(userId, saved.id);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateTransactionTemplateDto,
  ) {
    const template = await this.templatesRepository.findOne({
      where: { id, userId },
    });
    if (!template) {
      throw new NotFoundException('Shortcut not found');
    }

    const nextType = dto.type ?? template.type;
    const nextWalletId = dto.walletId ?? template.walletId;
    const nextCategoryId = dto.categoryId ?? template.categoryId;

    await this.assertWallet(userId, nextWalletId);
    await this.assertCategory(userId, nextCategoryId, nextType);

    if (dto.label !== undefined) template.label = dto.label.trim();
    if (dto.type !== undefined) template.type = dto.type;
    if (dto.amount !== undefined) template.amount = dto.amount;
    if (dto.walletId !== undefined) template.walletId = dto.walletId;
    if (dto.categoryId !== undefined) template.categoryId = dto.categoryId;
    if (dto.note !== undefined) {
      template.note = dto.note?.trim()
        ? dto.note.trim()
        : template.label;
    } else if (dto.label !== undefined && !template.note) {
      template.note = template.label;
    }

    await this.templatesRepository.save(template);
    return this.findOne(userId, id);
  }

  async remove(userId: string, id: string) {
    const template = await this.templatesRepository.findOne({
      where: { id, userId },
    });
    if (!template) {
      throw new NotFoundException('Shortcut not found');
    }
    await this.templatesRepository.remove(template);
  }

  private async findOne(userId: string, id: string) {
    const template = await this.templatesRepository.findOne({
      where: { id, userId },
      relations: { wallet: true, category: true },
    });
    if (!template) {
      throw new NotFoundException('Shortcut not found');
    }
    return this.toResponse(template);
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
      throw new BadRequestException('Category type must match shortcut type');
    }
  }

  private toResponse(template: TransactionTemplate) {
    return {
      id: template.id,
      userId: template.userId,
      label: template.label,
      type: template.type,
      amount: template.amount,
      walletId: template.walletId,
      categoryId: template.categoryId,
      note: template.note,
      sortOrder: template.sortOrder,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      walletName: template.wallet?.name,
      categoryName: template.category?.name,
      categoryIcon: template.category?.icon,
    };
  }
}
