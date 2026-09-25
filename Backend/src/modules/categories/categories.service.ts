import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginated } from '../../common/dto/pagination.dto.js';
import type { CreateCategoryDto } from './dto/create-category.dto.js';
import type { ListCategoriesQueryDto } from './dto/list-categories-query.dto.js';
import type { UpdateCategoryDto } from './dto/update-category.dto.js';
import { Category } from './entities/category.entity.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async findAll(userId: string, query: ListCategoriesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where = {
      userId,
      ...(query.type ? { type: query.type } : {}),
    };

    const [items, total] = await this.categoriesRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginated(items, total, page, limit);
  }

  async findOne(userId: string, id: string) {
    const category = await this.categoriesRepository.findOne({
      where: { id, userId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async create(userId: string, dto: CreateCategoryDto) {
    await this.assertUnique(userId, dto.name, dto.type);
    const category = this.categoriesRepository.create({
      userId,
      name: dto.name.trim(),
      type: dto.type,
      icon: dto.icon.trim(),
    });
    return this.categoriesRepository.save(category);
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto) {
    const category = await this.findOne(userId, id);
    const nextName = dto.name?.trim() ?? category.name;
    const nextType = dto.type ?? category.type;

    if (nextName !== category.name || nextType !== category.type) {
      await this.assertUnique(userId, nextName, nextType, id);
    }

    if (dto.name !== undefined) category.name = dto.name.trim();
    if (dto.type !== undefined) category.type = dto.type;
    if (dto.icon !== undefined) category.icon = dto.icon.trim();

    return this.categoriesRepository.save(category);
  }

  async remove(userId: string, id: string) {
    const category = await this.findOne(userId, id);
    await this.categoriesRepository.remove(category);
  }

  private async assertUnique(
    userId: string,
    name: string,
    type: Category['type'],
    excludeId?: string,
  ) {
    const existing = await this.categoriesRepository.findOne({
      where: { userId, name: name.trim(), type },
    });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(
        'A category with this name and type already exists',
      );
    }
  }
}
