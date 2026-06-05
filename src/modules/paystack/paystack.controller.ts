import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PaystackService } from './paystack.service';
import { AuthGuard } from '../auth/guard/auth.guard';

@SkipThrottle()
@Controller('paystack')
export class PaystackController {
  constructor(private readonly paystackService: PaystackService) {}

  @UseGuards(AuthGuard)
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

  @UseGuards(AuthGuard)
  @Get('verify')
  async verify(@Query('reference') reference: string) {
    return this.paystackService.verifyTransaction(reference);
  }
}
