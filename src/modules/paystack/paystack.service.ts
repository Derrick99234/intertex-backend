// paystack.service.ts
import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PaystackService {
  //   private readonly baseUrl = process.env.PAYSTACK_BASE_URL;
  private readonly secretKey = process.env.TEST_PAYSTACK_SECRET_KEY;

  async initializeTransaction(
    email: string,
    amount: number,
    callbackUrl: string,
  ) {
    try {
      const response = await axios.post(
        `https://api.paystack.co/transaction/initialize`,
        {
          email,
          amount: amount,
          callback_url: callbackUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
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
    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: { Authorization: `Bearer ${this.secretKey}` },
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
