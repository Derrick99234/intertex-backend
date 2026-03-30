import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  BillingInformation,
  BillingInformationSchema,
} from '../../schemas/billing-information.schema';
import { BillingInformationService } from './billing-information.service';
import { BillingInformationController } from './billing-information.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BillingInformation.name, schema: BillingInformationSchema },
    ]),
    AuthModule,
  ],
  providers: [BillingInformationService],
  controllers: [BillingInformationController],
  exports: [BillingInformationService],
})
export class BillingInformationModule {}
