import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';
import { Product } from './product.schema';

@Schema({ _id: false })
export class ProductItem {
  @Prop({ type: Types.ObjectId, ref: Product.name, required: true })
  product: Types.ObjectId;

  @Prop({ required: true })
  productName: string;

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

  @Prop({
    type: {
      deliveryAddress: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      alternativePhoneNumber: { type: String, required: false },
    },
    required: true,
  })
  deliveryInformation: {
    deliveryAddress: string;
    phoneNumber: string;
    alternativePhoneNumber?: string;
  };

  @Prop({ required: true })
  amount: number;

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
