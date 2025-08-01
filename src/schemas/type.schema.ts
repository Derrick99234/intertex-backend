import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { Subcategory } from './subcategory.schema';

@Schema({ timestamps: true })
export class ProductType extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ unique: true })
  slug: string;

  @Prop({ default: true })
  status: boolean;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Subcategory.name,
    required: true,
  })
  subcategory: Types.ObjectId;
}

export const ProductTypeSchema = SchemaFactory.createForClass(ProductType);

ProductTypeSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
  }
  next();
});
