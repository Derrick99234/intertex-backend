import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Product } from './product.schema';

@Schema({ timestamps: true })
export class Cart extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop([
    {
      product: { type: Types.ObjectId, ref: Product.name, required: true },
      size: { type: String, required: true },
      quantity: { type: Number, required: true, default: 1 },
    },
  ])
  items: {
    product: Types.ObjectId;
    size: string;
    quantity: number;
  }[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
