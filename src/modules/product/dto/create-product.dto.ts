import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class SizeQuantityDto {
  @IsString()
  @IsNotEmpty()
  size: string;

  @Type(() => Number)
  @IsNumber()
  quantity: number;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsString()
  @IsNotEmpty()
  materials: string;

  @IsString()
  @IsNotEmpty()
  process: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SizeQuantityDto)
  inStock: SizeQuantityDto[];

  @IsString()
  @IsNotEmpty()
  offer: string;

  @IsString()
  @IsNotEmpty()
  features: string;

  @Type(() => Number)
  @IsNumber()
  ratings: number;

  //   @IsString()
  //   @IsNotEmpty()
  //   imageUrl: Express.Multer.File;

  //   @IsArray()
  //   @IsString({ each: true })
  //   otherImages: Array<Express.Multer.File>;

  @IsMongoId()
  productType: string;

  @IsMongoId()
  subcategory: string;
}
