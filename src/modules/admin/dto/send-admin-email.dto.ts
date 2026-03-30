import { IsIn, IsString } from 'class-validator';

export class SendAdminEmailDto {
  @IsString()
  subject: string;

  @IsString()
  @IsIn(['all-subscribers', 'all-users', 'customers'])
  audience: string;

  @IsString()
  message: string;
}
