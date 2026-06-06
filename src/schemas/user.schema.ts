import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      if ('password' in ret) {
        delete ret.password;
      }
      return ret;
    },
  },
})
export class User extends Document {
  @Prop()
  fullName: string;

  @Prop()
  dob: string;

  @Prop()
  gender: string;

  @Prop({ index: true })
  email: string;

  @Prop({ select: false })
  password: string;

  @Prop()
  countryOfResidence: string;

  @Prop()
  stateOfResidence: string;

  @Prop()
  phone: string;

  @Prop()
  city: string;

  @Prop()
  streetAddress: string;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ select: false, index: true })
  passwordResetOtp?: string;

  @Prop({ select: false })
  passwordResetOtpExpiresAt?: Date;

  @Prop({ select: false })
  passwordResetToken?: string;

  @Prop({ select: false })
  passwordResetTokenExpiresAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
