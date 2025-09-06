import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { TypeModule } from '../type/type.module';
import { CategoryModule } from '../category/category.module';
import { SubcategoryModule } from '../subcategory/subcategory.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    TypeModule,
    CategoryModule,
    SubcategoryModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
