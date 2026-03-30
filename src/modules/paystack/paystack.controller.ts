import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { PaystackService } from './paystack.service';

@Controller('paystack')
export class PaystackController {
  constructor(private readonly paystackService: PaystackService) {}

  @Post('initialize')
  async initialize(
    @Body() body: { email: string; amount: number; metadata: any },
  ) {
    return this.paystackService.initializeTransaction(
      body.email,
      body.amount,
      body.metadata,
    );
  }

  @Get('verify')
  async verify(@Query('reference') reference: string) {
    return this.paystackService.verifyTransaction(reference);
  }
}
