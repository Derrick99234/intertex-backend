import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateBlogPostDto {
  @IsString()
  title: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  imageCover?: string;
}
