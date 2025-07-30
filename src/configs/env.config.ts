export const envConfig = () => ({
  db: {
    uri: process.env.DB_URI,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    adminSecret: process.env.ADMIN_JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
  },
  admin: {
    email: process.env.SUPER_ADMIN_EMAIL,
    phoneNumber: process.env.SUPER_ADMIN_PHONE,
    password: process.env.SUPER_ADMIN_PASSWORD,
  },
});
