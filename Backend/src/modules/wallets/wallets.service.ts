import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import type { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { paginated } from '../../common/dto/pagination.dto.js';
import type { CreateWalletDto } from './dto/create-wallet.dto.js';
import type { TransferWalletDto } from './dto/transfer-wallet.dto.js';
import type { UpdateWalletDto } from './dto/update-wallet.dto.js';
import { Wallet } from './entities/wallet.entity.js';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletsRepository: Repository<Wallet>,
    private readonly dataSource: DataSource,
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

  async transfer(userId: string, dto: TransferWalletDto) {
    if (dto.fromWalletId === dto.toWalletId) {
      throw new BadRequestException('Choose two different wallets');
    }

    return this.dataSource.transaction(async (manager) => {
      const wallets = manager.getRepository(Wallet);
      const from = await wallets.findOne({
        where: { id: dto.fromWalletId, userId },
      });
      const to = await wallets.findOne({
        where: { id: dto.toWalletId, userId },
      });

      if (!from || !to) {
        throw new NotFoundException('Wallet not found');
      }

      const fromBalance = Number(from.balance);
      if (fromBalance < dto.amount) {
        throw new BadRequestException('Insufficient balance');
      }

      from.balance = fromBalance - dto.amount;
      to.balance = Number(to.balance) + dto.amount;

      await wallets.save([from, to]);

      return {
        from: { id: from.id, name: from.name, balance: from.balance },
        to: { id: to.id, name: to.name, balance: to.balance },
        amount: dto.amount,
        note: dto.note?.trim() || null,
      };
    });
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
