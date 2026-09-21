import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateBudgetDto {
  @ApiPropertyOptional({
    format: 'uuid',
    nullable: true,
    description: 'Omit or null for overall monthly budget',
  })
  @IsOptional()
  @ValidateIf((_, v) => v != null && v !== '')
  @IsUUID()
  categoryId?: string | null;

  @ApiProperty({ example: 2000000, description: 'Monthly limit' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: '2026-09', description: 'Month as YYYY-MM' })
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'month must be YYYY-MM',
  })
  month: string;
}
