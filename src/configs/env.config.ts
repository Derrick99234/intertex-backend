export const envConfig = () => ({
  db: {
    uri: process.env.DB_URI,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    adminSecret: process.env.ADMIN_JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    resetSecret: process.env.JWT_RESET_SECRET,
  },
  admin: {
    email: process.env.SUPER_ADMIN_EMAIL,
    phoneNumber: process.env.SUPER_ADMIN_PHONE,
    password: process.env.SUPER_ADMIN_PASSWORD,
  },
  cors: {
    origin: process.env.CORS_ORIGIN,
  },
  aws: {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
    AWS_REGION: process.env.AWS_REGION,
  },
  paystack: {
    secretKey:
      process.env.PAYSTACK_SECRET_KEY || process.env.TEST_PAYSTACK_SECRET_KEY,
    callbackUrl: process.env.PAYSTACK_CALLBACK_URL,
  },
  email: {
    from: process.env.EMAIL_FROM,
  },
});
