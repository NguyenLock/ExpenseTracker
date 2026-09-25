import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class CopyBudgetsDto {
  @ApiProperty({ example: '2026-09' })
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'fromMonth must be YYYY-MM',
  })
  fromMonth: string;

  @ApiProperty({ example: '2026-10' })
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'toMonth must be YYYY-MM',
  })
  toMonth: string;
}
