import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryType } from '../../categories/enums/category-type.enum.js';

export class TransactionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  walletId: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty({ example: 125000 })
  amount: number;

  @ApiProperty({ enum: CategoryType })
  type: CategoryType;

  @ApiPropertyOptional({ nullable: true })
  note: string | null;

  @ApiProperty({ example: '2026-09-17' })
  transactionDate: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  walletName?: string;

  @ApiPropertyOptional()
  categoryName?: string;

  @ApiPropertyOptional()
  categoryIcon?: string;
}
