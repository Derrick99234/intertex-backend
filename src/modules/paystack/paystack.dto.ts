import { IsEmail, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class PaystackInitializeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsString()
  @IsOptional()
  currency?: string;
}
