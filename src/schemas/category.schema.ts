import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import slugify from 'slugify';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, unique: true })
  slug: string;

  @Prop({ type: Boolean, required: true, default: true })
  status: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.pre<CategoryDocument>('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});
