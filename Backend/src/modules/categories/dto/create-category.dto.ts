import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { CategoryType } from '../enums/category-type.enum.js';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Food' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @ApiProperty({ enum: CategoryType, example: CategoryType.EXPENSE })
  @IsEnum(CategoryType)
  type: CategoryType;

  @ApiProperty({ example: 'utensils' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  icon: string;
}
