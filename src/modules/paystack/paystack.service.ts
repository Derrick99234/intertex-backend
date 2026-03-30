// paystack.service.ts
import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaystackService {
  constructor(private readonly configService: ConfigService) {}

  async initializeTransaction(
    email: string,
    amount: number,
    metadata: Record<string, any>,
  ) {
    const secretKey = this.configService.get<string>('paystack.secretKey');
    const callbackUrl = this.configService.get<string>('paystack.callbackUrl');

    if (!secretKey) {
      return {
        status: false,
        message:
          'Paystack is not configured. Add PAYSTACK_SECRET_KEY to enable live payments.',
        data: {
          authorization_url: null,
          access_code: null,
          reference: metadata?.reference || null,
        },
      };
    }

    try {
      const response = await axios.post(
        `https://api.paystack.co/transaction/initialize`,
        {
          email,
          amount,
          metadata,
          callback_url: callbackUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Paystack Init Error',
        400,
      );
    }
  }

  async verifyTransaction(reference: string) {
    const secretKey = this.configService.get<string>('paystack.secretKey');

    if (!secretKey) {
      return {
        status: false,
        message:
          'Paystack is not configured. Add PAYSTACK_SECRET_KEY to enable live verification.',
        data: {
          reference,
          status: 'pending',
        },
      };
    }

    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: { Authorization: `Bearer ${secretKey}` },
        },
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Paystack Verify Error',
        400,
      );
    }
  }
}
