// post.controller.ts
import {
  Controller,
  Get,
  Post as HttpPost,
  Body,
  Param,
  Delete,
  Put,
  UploadedFiles,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { BlogPostService } from './blog.service';
import { UpdateBlogPostDto } from './dto/update-blog.dto';
import { awsOption } from 'src/configs/aws-s3.config';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';

@Controller('blog')
export class BlogPostController {
  constructor(private readonly postService: BlogPostService) {}

  @HttpPost()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'imageCover', maxCount: 1 }], awsOption),
  )
  create(
    @UploadedFiles()
    files: {
      imageCover?: (Express.Multer.File & { location?: string })[];
    },
    @Body() createPostDto: any,
  ) {
    const tags = createPostDto.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    const imageCover = files.imageCover?.[0]?.location;
    return this.postService.create({ ...createPostDto, tags }, imageCover);
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
  @UseInterceptors(FileInterceptor('imageCover'))
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdateBlogPostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      return this.postService.update(id, updatePostDto);
    }
    return this.postService.update(id, updatePostDto, file.path);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(id);
  }
}
