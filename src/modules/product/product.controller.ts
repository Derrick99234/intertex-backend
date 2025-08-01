// src/modules/product/product.controller.ts
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Patch,
  Delete,
  UploadedFiles,
  UseInterceptors,
  HttpStatus,
  HttpCode,
  HttpException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
// import { createMulterS3Options } from 'src/configs/aws-s3.config';
import { ConfigService } from '@nestjs/config';
import { awsOption } from 'src/configs/aws-s3.config';
@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    // private configService: ConfigService,
  ) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'imageUrl', maxCount: 1 },
        { name: 'otherImages', maxCount: 5 },
      ],
      awsOption,
    ),
  )
  async create(
    @UploadedFiles()
    files: {
      imageUrl?: (Express.Multer.File & { location?: string })[];
      otherImages?: (Express.Multer.File & { location?: string })[];
    },
    @Body() createProductDto: CreateProductDto,
  ) {
    if (!files.imageUrl || files.imageUrl.length === 0) {
      throw new HttpException('Main product image is required', 400);
    }

    const imageUrl = files.imageUrl?.[0]?.location;
    const otherImages = files.otherImages?.map((f) => f.location);

    const product = await this.productService.create(
      createProductDto,
      imageUrl,
      otherImages,
    );

    return {
      message: 'Product created successfully',
      product,
    };
  }

  @Get()
  async findAll() {
    const products = await this.productService.findAll();
    return {
      message: 'All products retrieved',
      products,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productService.findOne(id);
    return {
      message: 'Product found',
      product,
    };
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'imageUrl', maxCount: 1 },
        { name: 'otherImages', maxCount: 5 },
      ],
      awsOption,
    ),
  )
  async update(
    @Param('id') id: string,
    @UploadedFiles()
    files: {
      imageUrl?: (Express.Multer.File & { location?: string })[];
      otherImages?: (Express.Multer.File & { location?: string })[];
    },
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const imageUrl = files.imageUrl?.[0]?.location;
    const otherImages = files.otherImages?.map((f) => f.location);

    const product = await this.productService.update(
      id,
      updateProductDto,
      imageUrl,
      otherImages,
    );

    return {
      message: 'Product updated successfully',
      product,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return await this.productService.remove(id);
  }
}
