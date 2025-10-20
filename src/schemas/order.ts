import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';
import { Product } from './product.schema';

@Schema({ timestamps: true })
export class ProductItem {
  @Prop({ type: Types.ObjectId, ref: Product.name, required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: false })
  size?: string;
}

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  deliveryMethod: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ type: Date, default: Date.now })
  date: Date;

  @Prop({
    type: String,
    enum: ['pending', 'successful', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: [ProductItem], default: [] })
  products: ProductItem[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);
