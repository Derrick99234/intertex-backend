import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AdminRoles } from '../common/utils/enums.utils';

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
