import { IsString } from 'class-validator';

export class CreateBlogPostDto {
  @IsString()
  title: string;

  @IsString()
  tags?: string[];

  @IsString()
  description: string;
}
