import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AdminRoles } from '../common/utils/enums.utils';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Admin extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true, enum: AdminRoles, default: AdminRoles.ADMIN })
  role: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ select: false })
  passwordResetOtp?: string;

  @Prop({ select: false })
  passwordResetOtpExpiresAt?: Date;

  @Prop({ select: false })
  passwordResetToken?: string;

  @Prop({ select: false })
  passwordResetTokenExpiresAt?: Date;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
