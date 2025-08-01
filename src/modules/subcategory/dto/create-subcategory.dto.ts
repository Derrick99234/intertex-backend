import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsMongoId,
  IsBoolean,
} from 'class-validator';

export class CreateSubcategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsNotEmpty()
  @IsMongoId()
  category: string;
}
