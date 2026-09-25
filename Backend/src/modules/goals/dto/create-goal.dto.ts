import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateGoalDto {
  @ApiProperty({ example: 'Build PC' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 18000000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  targetAmount: number;

  @ApiPropertyOptional({ example: 5000000, description: 'Already saved' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  savedAmount?: number;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @ValidateIf((_, v) => v != null && v !== '')
  @IsDateString()
  deadline?: string | null;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @ValidateIf((_, v) => v != null && v !== '')
  @IsUUID()
  walletId?: string | null;
}
