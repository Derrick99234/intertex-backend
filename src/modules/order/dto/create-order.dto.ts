import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ProductItemDto {
  @IsString()
  @IsNotEmpty()
  product: string;

  @IsOptional()
  @IsString()
  productName?: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  size?: string;
}

class DeliveryInformationDto {
  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  alternativePhoneNumber?: string;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  deliveryMethod: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DeliveryInformationDto)
  deliveryInformation: DeliveryInformationDto;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductItemDto)
  products: ProductItemDto[];
}
