import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
  IsMongoId,
} from 'class-validator';

export class CreateTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @IsNotEmpty()
  @IsMongoId()
  subcategory: string;
}
