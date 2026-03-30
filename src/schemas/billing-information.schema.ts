import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class BillingInformation extends Document {
  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  user: Types.ObjectId;

  @Prop()
  deliveryAddress: string;

  @Prop()
  country: string;

  @Prop()
  state: string;

  @Prop()
  additionalInformation: string;

  @Prop()
  secondPhoneNumber: string;

  @Prop()
  phoneNumber: string;

  @Prop()
  fullName: string;

  @Prop({ default: false })
  isDefault: boolean;
}

export const BillingInformationSchema =
  SchemaFactory.createForClass(BillingInformation);
