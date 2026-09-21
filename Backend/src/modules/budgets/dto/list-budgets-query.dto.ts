import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class ListBudgetsQueryDto {
  @ApiPropertyOptional({
    example: '2026-09',
    description: 'Month as YYYY-MM (defaults to current UTC month)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'month must be YYYY-MM',
  })
  month?: string;
}
