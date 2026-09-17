import { ApiProperty } from '@nestjs/swagger';
import { WalletType } from '../enums/wallet-type.enum.js';

export class WalletResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: WalletType })
  type: WalletType;

  @ApiProperty({ example: 0 })
  balance: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
