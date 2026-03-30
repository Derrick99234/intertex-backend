import {
  BadRequestException,
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
  Query,
  UseGuards,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { awsOption } from '../../configs/aws-s3.config';
import { AdminAuthGuard } from '../auth/guard/admin.guard';
import { validateDto } from '../../common/utils/dto-validation.util';
@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    // private configService: ConfigService,
  ) {}

  @UseGuards(AdminAuthGuard)
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
    @Body() body: Record<string, any>,
  ) {
    const createProductDto = await validateDto(
      CreateProductDto,
      this.normalizeProductBody(body),
    );

    const resolvedImageUrl =
      files.imageUrl?.[0]?.location ||
      createProductDto.imageUrl ||
      undefined;
    if (!resolvedImageUrl) {
      throw new BadRequestException('Main product image is required');
    }

    const otherImages = [
      ...(files.otherImages?.map((f) => f.location).filter(Boolean) || []),
      ...((createProductDto.otherImages || []).filter(Boolean) as string[]),
    ];

    const product = await this.productService.create(
      createProductDto,
      resolvedImageUrl,
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

  @Get('search')
  async searchProducts(
    @Query('keyword') keyword: string,
    @Query('sort') sort: string,
    @Query('category') categorySlug?: string,
    @Query('subcategory') subcategorySlug?: string,
    @Query('productType') productTypeSlug?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
  ) {
    const filters = {
      categorySlug,
      subcategorySlug,
      productTypeSlug,
      minPrice,
      maxPrice,
      sort: sort as 'newest' | 'price_asc' | 'price_desc',
    };

    const products = await this.productService.searchProducts(keyword, filters);
    return { products };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productService.findOne(id);
    return {
      message: 'Product found',
      product,
    };
  }

  @UseGuards(AdminAuthGuard)
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
    @Body() body: Record<string, any>,
  ) {
    const updateProductDto = await validateDto(
      UpdateProductDto,
      this.normalizeProductBody(body),
    );
    const newImages = files.otherImages?.map((f) => f.location) || [];
    const imageUrl =
      files.imageUrl?.[0]?.location || updateProductDto.imageUrl || undefined;

    const product = await this.productService.update(
      id,
      updateProductDto,
      newImages,
      imageUrl,
    );

    return {
      message: 'Product updated successfully',
      product,
    };
  }

  @UseGuards(AdminAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return await this.productService.remove(id);
  }

  @Get('category/:slug')
  async fetchProductsByCategory(@Param('slug') slug: string) {
    const products = await this.productService.fetchProductsByCategory(slug);
    return {
      message: 'Products by category retrieved successfully',
      products,
    };
  }

  @Get('type/:slug')
  async fetchProductsByType(@Param('slug') slug: string) {
    const products = await this.productService.fetchProductsByType(slug);
    return {
      message: 'Products by type retrieved successfully',
      products,
    };
  }

  @Get('subcategory/:catSlug/:subSlug')
  async fetchProductsBySubcategory(
    @Param('catSlug') categoryId: string,
    @Param('subSlug') subcategoryId: string,
  ) {
    const products = await this.productService.fetchProductsBySubcategory(
      categoryId,
      subcategoryId,
    );
    return {
      message: 'Products by subcategory retrieved successfully',
      products,
    };
  }

  @Get('product/:productSlug')
  async fetchProductBySlug(@Param('productSlug') productSlug: string) {
    const product = await this.productService.fetchProductBySlug(productSlug);
    return {
      message: 'Product retrieved successfully',
      product,
    };
  }

  private normalizeProductBody(body: Record<string, any>) {
    const normalized: Record<string, any> = { ...body };
    const inStockMap = new Map<number, Record<string, any>>();

    for (const [key, value] of Object.entries(body)) {
      const match = key.match(/^inStock\[(\d+)\]\[(\w+)\]$/);
      if (!match) {
        continue;
      }

      const [, index, field] = match;
      const current = inStockMap.get(Number(index)) || {};
      current[field] = value;
      inStockMap.set(Number(index), current);
      delete normalized[key];
    }

    if (inStockMap.size > 0) {
      normalized.inStock = [...inStockMap.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([, item]) => item);
    } else if (typeof body.inStock === 'string') {
      try {
        normalized.inStock = JSON.parse(body.inStock);
      } catch {
        throw new BadRequestException('Invalid inStock payload');
      }
    }

    if (typeof body.otherImages === 'string') {
      normalized.otherImages = body.otherImages
        .split(',')
        .map((image: string) => image.trim())
        .filter(Boolean);
    }

    if (typeof body.deleteImages === 'string') {
      normalized.deleteImages = body.deleteImages
        .split(',')
        .map((image: string) => image.trim())
        .filter(Boolean);
    }

    return normalized;
  }
}
