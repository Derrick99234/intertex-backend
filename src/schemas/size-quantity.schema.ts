import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SizeQuantityDocument = SizeQuantity & Document;

@Schema({ _id: false })
export class SizeQuantity {
  @Prop({ required: true })
  size: string; // e.g., 'S', 'M', 'L', etc.

  @Prop({ required: true, min: 0 })
  quantity: number;
}

export const SizeQuantitySchema = SchemaFactory.createForClass(SizeQuantity);
