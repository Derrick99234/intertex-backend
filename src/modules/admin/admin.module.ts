import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from '../../schemas/admin.schema';
import { UserModule } from '../user/user.module';
import { Promotion, PromotionSchema } from '../../schemas/promotion.schema';
import { Feedback, FeedbackSchema } from '../../schemas/feedback.schema';
import { Order, OrderSchema } from '../../schemas/order';

@Module({
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: Promotion.name, schema: PromotionSchema },
      { name: Feedback.name, schema: FeedbackSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    UserModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
