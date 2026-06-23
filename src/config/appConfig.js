import dotenv from "dotenv";

dotenv.config();

export const config = {
  dbUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  otpJwtSecret: process.env.OTP_JWT_SECRET,
  port: process.env.PORT,

  // Brevo Config
  emailHost: process.env.EMAIL_HOST,
  emailPort: process.env.EMAIL_PORT,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,

  //PayHere
  payHereMerchantId: process.env.PAYHERE_MERCHANT_ID,
  payHepayHereMerchantSecret: process.env.PAYHERE_MERCHANT_SECRET,
};
