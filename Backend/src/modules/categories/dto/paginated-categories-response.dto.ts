import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../../common/dto/pagination.dto.js';
import { CategoryResponseDto } from './category-response.dto.js';

export class PaginatedCategoriesResponseDto extends PaginationMetaDto {
  @ApiProperty({ type: [CategoryResponseDto] })
  items: CategoryResponseDto[];
}
