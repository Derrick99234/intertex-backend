import { IsString, MinLength } from 'class-validator';

export class ResetAdminPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
