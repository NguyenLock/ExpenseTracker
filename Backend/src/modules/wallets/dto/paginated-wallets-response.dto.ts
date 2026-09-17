import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../../common/dto/pagination.dto.js';
import { WalletResponseDto } from './wallet-response.dto.js';

export class PaginatedWalletsResponseDto extends PaginationMetaDto {
  @ApiProperty({ type: [WalletResponseDto] })
  items: WalletResponseDto[];
}
