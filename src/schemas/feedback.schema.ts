import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Feedback extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, enum: ['new', 'read', 'resolved'], default: 'new' })
  status: string;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
