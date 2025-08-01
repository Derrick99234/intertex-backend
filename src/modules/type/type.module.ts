import { Module } from '@nestjs/common';
import { TypeService } from './type.service';
import { TypeController } from './type.controller';
import { SubcategoryModule } from '../subcategory/subcategory.module';
import { ProductType, ProductTypeSchema } from 'src/schemas/type.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductType.name, schema: ProductTypeSchema },
    ]),
    SubcategoryModule,
  ],
  controllers: [TypeController],
  providers: [TypeService],
})
export class TypeModule {}
