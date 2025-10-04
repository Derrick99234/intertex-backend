// src/billing-information/billing-information.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  BillingInformation,
  BillingInformationSchema,
} from 'src/schemas/billing-information.schema';
import { BillingInformationService } from './billing-information.service';
import { BillingInformationController } from './billing-information.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BillingInformation.name, schema: BillingInformationSchema },
    ]),
  ],
  providers: [BillingInformationService],
  controllers: [BillingInformationController],
  exports: [BillingInformationService],
})
export class BillingInformationModule {}
