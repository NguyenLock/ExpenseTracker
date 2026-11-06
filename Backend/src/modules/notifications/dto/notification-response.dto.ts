import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../enums/notification-type.enum.js';

export class TopCategoryChangeDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  previousAmount: number;

  @ApiProperty({ description: 'amount − previousAmount (always > 0)' })
  delta: number;

  @ApiPropertyOptional({ nullable: true, description: 'null = new this period' })
  changePercent: number | null;
}

export class PeriodSummaryDto {
  @ApiProperty()
  income: number;

  @ApiProperty({ description: 'Excludes saving-goal contributions' })
  expense: number;

  @ApiProperty()
  net: number;

  @ApiProperty()
  previousIncome: number;

  @ApiProperty()
  previousExpense: number;

  @ApiPropertyOptional({ nullable: true, description: 'null = previous was 0' })
  incomeChangePercent: number | null;

  @ApiPropertyOptional({ nullable: true, description: 'null = previous was 0' })
  expenseChangePercent: number | null;

  @ApiProperty({ description: 'Transactions in the period (0 = maybe forgot to log)' })
  transactionCount: number;

  @ApiPropertyOptional({ type: TopCategoryChangeDto, nullable: true })
  topIncrease: TopCategoryChangeDto | null;
}

export class NotificationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @ApiProperty({ example: '2026-W39' })
  periodKey: string;

  @ApiProperty({ example: '2026-09-21' })
  periodFrom: string;

  @ApiProperty({ example: '2026-09-27' })
  periodTo: string;

  @ApiProperty()
  previousFrom: string;

  @ApiProperty()
  previousTo: string;

  @ApiPropertyOptional({ nullable: true })
  readAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: PeriodSummaryDto })
  summary: PeriodSummaryDto;
}

export class DailyExpenseDto {
  @ApiProperty({ description: '1-based day index within the period' })
  day: number;

  @ApiPropertyOptional({ nullable: true, description: 'null when the current period is shorter' })
  currentDate: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'null when the previous period is shorter' })
  previousDate: string | null;

  @ApiProperty()
  current: number;

  @ApiProperty()
  previous: number;
}

export class CategoryComparisonDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  current: number;

  @ApiProperty()
  previous: number;
}

export class NotificationDetailDataDto {
  @ApiProperty({ type: [DailyExpenseDto] })
  daily: DailyExpenseDto[];

  @ApiProperty({ type: [CategoryComparisonDto], description: 'Expense categories, current desc' })
  categories: CategoryComparisonDto[];
}

export class NotificationDetailResponseDto extends NotificationResponseDto {
  @ApiProperty({ type: NotificationDetailDataDto })
  detail: NotificationDetailDataDto;
}

export class NotificationListResponseDto {
  @ApiProperty({ type: [NotificationResponseDto] })
  items: NotificationResponseDto[];

  @ApiProperty()
  unreadCount: number;
}
