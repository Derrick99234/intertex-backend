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
  secondPhoneNumber?: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  fullName: string;

  @IsOptional()
  isDefault: boolean;
}
