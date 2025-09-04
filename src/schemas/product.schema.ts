import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { ProductType } from './type.schema';
import { SizeQuantity, SizeQuantitySchema } from './size-quantity.schema';
import { Subcategory } from './subcategory.schema';
import { Category } from './category.schema';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  materials: string;

  @Prop({ required: true })
  process: string;

  @Prop({ type: [SizeQuantitySchema], default: [] })
  inStock: SizeQuantity[];

  @Prop({ required: true })
  offer: string;

  @Prop({ required: true })
  features: string;

  @Prop({ required: true })
  ratings: number;

  @Prop({ required: true })
  imageUrl: string;

  @Prop()
  slug: string;

  @Prop({ type: [String], default: [] })
  otherImages: string[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: ProductType.name,
    required: true,
  })
  productType: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Subcategory.name,
    required: true,
  })
  subcategory: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.pre('save', function (next) {
  if (!this.slug && this.productName) {
    this.slug = this.productName.toLowerCase().replace(/\s+/g, '-');
  }
  next();
});
