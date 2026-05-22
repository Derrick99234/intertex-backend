import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('email.host');
    const port = this.configService.get<number>('email.port');
    const user = this.configService.get<string>('email.user');
    const pass = this.configService.get<string>('email.pass');
    const from = this.configService.get<string>('email.from');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: port || 587,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log('Email transport configured');
    } else {
      this.logger.warn(
        'Email not configured - set EMAIL_HOST, EMAIL_USER, EMAIL_PASS in .env',
      );
    }
  }

  get fromAddress(): string {
    return (
      this.configService.get<string>('email.from') || 'noreply@intertex.com'
    );
  }

  get isConfigured(): boolean {
    return this.transporter !== null;
  }

  async sendMail(options: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }) {
    if (!this.transporter) {
      this.logger.log(
        `[EMAIL STUB] To: ${options.to} | Subject: ${options.subject}`,
      );
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      this.logger.log(`Email sent to ${options.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
    }
  }

  async sendPasswordResetOtp(email: string, otp: string) {
    await this.sendMail({
      to: email,
      subject: 'Password Reset OTP',
      text: `Your password reset OTP is: ${otp}. It expires in 10 minutes.`,
      html: `<p>Your password reset OTP is: <strong>${otp}</strong></p><p>It expires in 10 minutes.</p>`,
    });
  }

  async sendCampaignEmail(options: {
    to: string;
    subject: string;
    html: string;
  }) {
    await this.sendMail(options);
  }
}
