// src/modules/subcategory/schemas/subcategory.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { Category } from './category.schema';

@Schema({ timestamps: true })
export class Subcategory extends Document {
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
    ref: Category.name,
    required: true,
  })
  category: Types.ObjectId;
}

export const SubcategorySchema = SchemaFactory.createForClass(Subcategory);

// Automatically generate slug if not provided
SubcategorySchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
  }
  next();
});
