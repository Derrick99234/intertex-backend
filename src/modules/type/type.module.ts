import { forwardRef, Module } from '@nestjs/common';
import { TypeService } from './type.service';
import { TypeController } from './type.controller';
import { SubcategoryModule } from '../subcategory/subcategory.module';
import { ProductType, ProductTypeSchema } from '../../schemas/type.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryModule } from '../category/category.module';
import { ProductModule } from '../product/product.module';
import { OrdersModule } from '../order/order.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductType.name, schema: ProductTypeSchema },
    ]),
    SubcategoryModule,
    CategoryModule,
    ProductModule,
    OrdersModule,
  ],
  controllers: [TypeController],
  providers: [TypeService],
  exports: [TypeService],
})
export class TypeModule {}
