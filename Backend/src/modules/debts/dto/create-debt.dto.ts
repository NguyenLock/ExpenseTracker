import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { DebtDirection } from '../enums/debt.enums.js';

export class CreateDebtDto {
  @ApiProperty({ example: 'A' })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  personName: string;

  @ApiProperty({ example: 1817065, description: 'Amount per month / installment' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiProperty({ enum: DebtDirection, example: DebtDirection.I_OWE })
  @IsEnum(DebtDirection)
  direction: DebtDirection;

  @ApiProperty({
    example: '2026-09-24',
    description: 'First payment window start date (or single due date)',
  })
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({ example: 3, default: 1, description: 'Months / installments' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  installmentCount?: number;

  @ApiPropertyOptional({
    example: 24,
    description: 'Pay window start day of month (1–28)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(28)
  payWindowStartDay?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Pay window end day (1–28). If < start, ends next month.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(28)
  payWindowEndDay?: number;

  @ApiPropertyOptional({ example: 'Trả góp Shopee' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;

  @ApiPropertyOptional({
    description:
      'Auto-create income when installment is due (owed_to_me only)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  autoRecord?: boolean;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  walletId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  categoryId: string;
}
