import dotenv from 'dotenv';
dotenv.config();

export const paystackConfig = {
  secretKey: process.env.PAYSTACK_SECRET_KEY,
  webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET,
  baseUrl: 'https://api.paystack.co',
};
