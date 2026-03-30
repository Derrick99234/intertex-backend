import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateBlogPostDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  imageCover?: string;
}
