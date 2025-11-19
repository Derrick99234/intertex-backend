import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BlogPostDocument = BlogPost & Document;

@Schema({ timestamps: true })
export class BlogPost {
  @Prop({ required: true })
  title: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ required: true })
  description: string;

  @Prop()
  slug: string;

  @Prop()
  imageCover: string; // store image URL or path
}

export const BlogPostSchema = SchemaFactory.createForClass(BlogPost);

BlogPostSchema.pre('save', function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title.toLowerCase().replace(/\s+/g, '-');
  }
  next();
});
