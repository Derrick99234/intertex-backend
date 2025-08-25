// post.controller.ts
import {
  Controller,
  Get,
  Post as HttpPost,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { BlogPostService } from './blog.service';
import { CreateBlogPostDto } from './dto/create-blog.dto';
import { UpdateBlogPostDto } from './dto/update-blog.dto';

@Controller('blog')
export class BlogPostController {
  constructor(private readonly postService: BlogPostService) {}

  @HttpPost()
  create(@Body() createPostDto: CreateBlogPostDto) {
    return this.postService.create(createPostDto);
  }

  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdateBlogPostDto) {
    return this.postService.update(id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(id);
  }
}
