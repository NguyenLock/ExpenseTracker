import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../../common/dto/pagination.dto.js';
import { TransactionResponseDto } from './transaction-response.dto.js';

export class PaginatedTransactionsResponseDto extends PaginationMetaDto {
  @ApiProperty({ type: [TransactionResponseDto] })
  items: TransactionResponseDto[];
}
