import {
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBillingInformationDto {
  @IsString()
  deliveryAddress: string;

  @IsString()
  country: string;

  @IsString()
  state: string;

  @IsOptional()
  @IsString()
  additionalInformation?: string;

  @IsOptional()
  @IsString()
  secondPhoneNumber?: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  fullName: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
