import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { CategoryType } from '../../categories/enums/category-type.enum.js';

export class CreateTransactionTemplateDto {
  @ApiProperty({ example: 'Cà phê sáng' })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  label: string;

  @ApiProperty({ enum: CategoryType })
  @IsEnum(CategoryType)
  type: CategoryType;

  @ApiProperty({ example: 17000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  walletId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({ example: 'Highlands' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}
