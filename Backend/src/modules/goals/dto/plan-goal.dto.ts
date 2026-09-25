import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class PlanGoalDto {
  @ApiProperty({
    example: 15000000,
    description: 'Monthly income (salary). Required for available calc.',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monthlyIncome: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'Extra one-off fixed costs this month',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  extraFixed?: number;

  @ApiPropertyOptional({
    default: true,
    description: 'Include open i_owe installment amounts in committed',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return true;
    if (typeof value === 'boolean') return value;
    return value === 'true' || value === true || value === 1 || value === '1';
  })
  @IsBoolean()
  useDebts?: boolean;
}
