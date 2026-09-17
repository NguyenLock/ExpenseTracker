import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { paginated } from '../../common/dto/pagination.dto.js';
import type { CreateWalletDto } from './dto/create-wallet.dto.js';
import type { UpdateWalletDto } from './dto/update-wallet.dto.js';
import { Wallet } from './entities/wallet.entity.js';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletsRepository: Repository<Wallet>,
  ) {}

  async findAll(userId: string, query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [items, total] = await this.walletsRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginated(items, total, page, limit);
  }

  async findOne(userId: string, id: string) {
    const wallet = await this.walletsRepository.findOne({
      where: { id, userId },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    return wallet;
  }

  async create(userId: string, dto: CreateWalletDto) {
    await this.assertUnique(userId, dto.name);
    const wallet = this.walletsRepository.create({
      userId,
      name: dto.name.trim(),
      type: dto.type,
      balance: dto.balance ?? 0,
    });
    return this.walletsRepository.save(wallet);
  }

  async update(userId: string, id: string, dto: UpdateWalletDto) {
    const wallet = await this.findOne(userId, id);
    const nextName = dto.name?.trim() ?? wallet.name;

    if (nextName !== wallet.name) {
      await this.assertUnique(userId, nextName, id);
    }

    if (dto.name !== undefined) wallet.name = dto.name.trim();
    if (dto.type !== undefined) wallet.type = dto.type;
    if (dto.balance !== undefined) wallet.balance = dto.balance;

    return this.walletsRepository.save(wallet);
  }

  async remove(userId: string, id: string) {
    const wallet = await this.findOne(userId, id);
    await this.walletsRepository.remove(wallet);
  }

  private async assertUnique(
    userId: string,
    name: string,
    excludeId?: string,
  ) {
    const existing = await this.walletsRepository.findOne({
      where: { userId, name: name.trim() },
    });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('A wallet with this name already exists');
    }
  }
}
