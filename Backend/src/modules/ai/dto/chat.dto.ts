import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class ChatHistoryMessageDto {
  @ApiProperty({ enum: ['user', 'assistant'] })
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @ApiProperty()
  @IsString()
  @MaxLength(4000)
  content: string;
}

export class ChatDto {
  @ApiProperty({ example: 'Tháng này tôi tiêu gì nhiều nhất?' })
  @IsString()
  @MaxLength(1000)
  message: string;

  @ApiPropertyOptional({
    type: [ChatHistoryMessageDto],
    description: 'Previous turns of the conversation, oldest first.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatHistoryMessageDto)
  history?: ChatHistoryMessageDto[];
}
