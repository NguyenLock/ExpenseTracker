import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DebtDirection, DebtStatus } from '../enums/debt.enums.js';

export class DebtResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  personName: string;

  @ApiProperty({ description: 'Amount per installment / month' })
  amount: number;

  @ApiProperty({ description: 'Total = amount × installmentCount' })
  totalAmount: number;

  @ApiProperty()
  installmentCount: number;

  @ApiProperty()
  paidInstallments: number;

  @ApiProperty({ description: 'Amount for the next / current installment' })
  installmentAmount: number;

  @ApiPropertyOptional({ nullable: true })
  payWindowStartDay: number | null;

  @ApiPropertyOptional({ nullable: true })
  payWindowEndDay: number | null;

  @ApiPropertyOptional({ nullable: true })
  windowStart: string | null;

  @ApiPropertyOptional({ nullable: true })
  windowEnd: string | null;

  @ApiProperty({ enum: DebtDirection })
  direction: DebtDirection;

  @ApiProperty()
  dueDate: string;

  @ApiPropertyOptional({ nullable: true })
  note: string | null;

  @ApiProperty({ enum: DebtStatus })
  status: DebtStatus;

  @ApiProperty()
  autoRecord: boolean;

  @ApiProperty()
  walletId: string;

  @ApiProperty()
  categoryId: string;

  @ApiPropertyOptional({ nullable: true })
  transactionId: string | null;

  @ApiPropertyOptional({ nullable: true })
  settledAt: Date | null;

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

  @ApiPropertyOptional()
  isOverdue?: boolean;

  @ApiPropertyOptional()
  isDueToday?: boolean;

  @ApiPropertyOptional()
  isInPayWindow?: boolean;
}
