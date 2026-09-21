import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BudgetResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiPropertyOptional({ nullable: true })
  categoryId: string | null;

  @ApiProperty()
  amount: number;

  @ApiProperty({ example: '2026-09' })
  month: string;

  @ApiProperty({ description: 'Spent in this month for the category (or all expenses if overall)' })
  spent: number;

  @ApiProperty({ description: 'amount − spent (can be negative)' })
  remaining: number;

  @ApiProperty({ description: '0–100+ percent of limit used' })
  percentUsed: number;

  @ApiProperty({ description: 'True when this is the overall monthly budget' })
  isOverall: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  categoryName?: string;

  @ApiPropertyOptional()
  categoryIcon?: string;
}
