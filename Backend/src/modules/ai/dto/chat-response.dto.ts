import { ApiProperty } from '@nestjs/swagger';

export class ChatResponseDto {
  @ApiProperty({ example: 'Tháng này bạn chi nhiều nhất cho Ăn uống: 2.450.000đ.' })
  reply: string;
}
