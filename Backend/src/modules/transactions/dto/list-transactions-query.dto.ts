import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { CategoryType } from '../../categories/enums/category-type.enum.js';

export class ListTransactionsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: CategoryType })
  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;

  @ApiPropertyOptional({
    example: '2026-09-01',
    description: 'Inclusive start date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    example: '2026-09-17',
    description: 'Inclusive end date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
