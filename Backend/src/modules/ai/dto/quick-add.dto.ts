import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class QuickAddDto {
  @ApiProperty({ example: 'ăn trưa 50k ở highland bằng tiền mặt' })
  @IsString()
  @MinLength(2)
  @MaxLength(500)
  text: string;
}
