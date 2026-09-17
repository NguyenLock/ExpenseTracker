import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
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

  @ApiProperty({ example: 100000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiProperty({ enum: DebtDirection, example: DebtDirection.I_OWE })
  @IsEnum(DebtDirection)
  direction: DebtDirection;

  @ApiProperty({ example: '2026-09-25' })
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({ example: 'Trả nợ cà phê' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;

  @ApiProperty({
    description:
      'Auto-create income on due date (only for owed_to_me). Reminders only for i_owe.',
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
