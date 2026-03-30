// post.controller.ts
import {
  Body,
  Controller,
  Get,
  Post as HttpPost,
  Param,
  Delete,
  Patch,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { BlogPostService } from './blog.service';
import { CreateBlogPostDto } from './dto/create-blog.dto';
import { UpdateBlogPostDto } from './dto/update-blog.dto';
import { awsOption } from '../../configs/aws-s3.config';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AdminAuthGuard } from '../auth/guard/admin.guard';

@Controller('blog')
export class BlogPostController {
  constructor(private readonly postService: BlogPostService) {}

  @UseGuards(AdminAuthGuard)
  @HttpPost()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'imageCover', maxCount: 1 }], awsOption),
  )
  create(
    @UploadedFiles()
    files: {
      imageCover?: (Express.Multer.File & { location?: string })[];
    },
    @Body() createPostDto: CreateBlogPostDto,
  ) {
    const tags = Array.isArray(createPostDto.tags)
      ? createPostDto.tags
      : String(createPostDto.tags || '')
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);
    const imageCover = files.imageCover?.[0]?.location || createPostDto.imageCover;
    return this.postService.create({ ...createPostDto, tags }, imageCover);
  }

  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.postService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  @UseGuards(AdminAuthGuard)
  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'imageCover', maxCount: 1 }], awsOption),
  )
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdateBlogPostDto,
    @UploadedFiles()
    files: {
      imageCover?: (Express.Multer.File & { location?: string })[];
    },
  ) {
    const imageCover =
      files.imageCover?.[0]?.location || updatePostDto.imageCover;
    if (!imageCover) {
      return this.postService.update(id, updatePostDto);
    }
    return this.postService.update(id, updatePostDto, imageCover);
  }

  @UseGuards(AdminAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(id);
  }
}
