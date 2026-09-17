import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class TransferWalletDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  fromWalletId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  toWalletId: string;

  @ApiProperty({ example: 1000000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ example: 'Chuyển sang MoMo' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}
