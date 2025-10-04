// src/billing-information/dto/create-billing-information.dto.ts
import {
  IsMongoId,
  IsOptional,
  IsString,
  IsPhoneNumber,
} from 'class-validator';

export class CreateBillingInformationDto {
  @IsMongoId()
  user: string;

  @IsString()
  deliveryAddress: string;

  @IsString()
  region: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  additionalInformation?: string;

  @IsOptional()
  @IsPhoneNumber()
  secondPhoneNumber?: string;

  @IsPhoneNumber()
  phoneNumber: string;

  @IsString()
  fullName: string;
}
