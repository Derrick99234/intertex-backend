import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Promotion extends Document {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({
    required: true,
    enum: ['percentage', 'fixed'],
    default: 'percentage',
  })
  discountType: string;

  @Prop({ required: true, min: 0 })
  discountValue: number;

  @Prop({ required: true, enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Prop()
  startsAt?: Date;

  @Prop()
  endsAt?: Date;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);
