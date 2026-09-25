import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GoalStatus } from '../enums/goal-status.enum.js';

export class GoalResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  targetAmount: number;

  @ApiProperty()
  savedAmount: number;

  @ApiProperty({ description: 'target − saved (min 0)' })
  remaining: number;

  @ApiProperty({ description: '0–100+ percent saved' })
  percentSaved: number;

  @ApiPropertyOptional({ nullable: true })
  deadline: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Suggested monthly if deadline set',
  })
  suggestedMonthly: number | null;

  @ApiPropertyOptional({ nullable: true })
  walletId: string | null;

  @ApiPropertyOptional()
  walletName?: string;

  @ApiProperty({ enum: GoalStatus })
  status: GoalStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
