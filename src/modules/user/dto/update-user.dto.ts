import { IsBoolean, IsEmail, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  dob: string;

  @IsString()
  gender: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString()
  countryOfResidence: string;

  @IsString()
  phone: string;

  @IsString()
  city: string;

  @IsString()
  streetAddress: string;

  @IsBoolean()
  isActive?: boolean;
}
