import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BudgetResponseDto } from '../../budgets/dto/budget-response.dto.js';
import { DebtResponseDto } from '../../debts/dto/debt-response.dto.js';
import { TransactionResponseDto } from '../../transactions/dto/transaction-response.dto.js';
import { WalletType } from '../../wallets/enums/wallet-type.enum.js';
import { DashboardPeriod } from './dashboard-query.dto.js';

export class DashboardWalletSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: WalletType })
  type: WalletType;

  @ApiProperty({ example: 0 })
  balance: number;
}

export class DashboardResponseDto {
  @ApiProperty({ enum: DashboardPeriod })
  period: DashboardPeriod;

  @ApiPropertyOptional({ nullable: true, example: '2026-09-15' })
  from: string | null;

  @ApiPropertyOptional({ nullable: true, example: '2026-09-17' })
  to: string | null;

  @ApiProperty({ example: 10000000 })
  totalIncome: number;

  @ApiProperty({ example: 4500000 })
  totalExpense: number;

  @ApiProperty({ example: 5500000 })
  totalSavings: number;

  @ApiProperty({ example: 3200000 })
  walletBalance: number;

  @ApiProperty({ type: [TransactionResponseDto] })
  recentTransactions: TransactionResponseDto[];

  @ApiProperty({ type: [DashboardWalletSummaryDto] })
  wallets: DashboardWalletSummaryDto[];

  @ApiProperty({ type: [DebtResponseDto] })
  debtReminders: DebtResponseDto[];

  @ApiProperty({ type: [BudgetResponseDto] })
  budgets: BudgetResponseDto[];
}
