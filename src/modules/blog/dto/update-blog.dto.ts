import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogPostDto } from './create-blog.dto';

export class UpdateBlogPostDto extends PartialType(CreateBlogPostDto) {}
