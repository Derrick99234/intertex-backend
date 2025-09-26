// src/cart/dto/update-cart.dto.ts
import { IsNumber, Min, IsString } from 'class-validator';

export class UpdateCartDto {
  @IsString()
  product: string;

  @IsString()
  size: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}
