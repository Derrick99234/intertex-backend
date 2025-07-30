import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AdminRoles } from 'src/common/utils/enums.utils';

export type AdminDocument = Admin & Document;

@Schema({ timestamps: true })
export class Admin {
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
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
