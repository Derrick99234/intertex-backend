import { IsMongoId, IsNumber, Min, IsString } from 'class-validator';

export class AddToCartDto {
  @IsMongoId()
  product: string;

  @IsString()
  size: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}
