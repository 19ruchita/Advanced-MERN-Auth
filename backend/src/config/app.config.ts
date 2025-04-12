import { getEnv } from "../common/utils/get-env";
import dotenv from "dotenv";
dotenv.config();

const appConfig = () => {
  const appOrigin = getEnv("APP_ORIGIN", "http://localhost:3000");

  // Ensure APP_ORIGIN is a string and handle possible issues
  const allowedOrigins: string[] = typeof appOrigin === "string"
    ? appOrigin.split(",").map(origin => origin.trim())
    : [];

  return {
    NODE_ENV: getEnv("NODE_ENV", "development"),
    APP_ORIGIN: allowedOrigins,  // Use allowedOrigins here
    PORT: getEnv("PORT", "5000"),
    BASE_PATH: getEnv("BASE_PATH", "/api/v1"),
    MONGO_URI: getEnv("MONGO_URI"),
    JWT: {
      SECRET: getEnv("JWT_SECRET"),
      EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "15m"),
      REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
      REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "30d"),
    },
    MAILER_SENDER: getEnv("MAILER_SENDER"),
    RESEND_API_KEY: getEnv("RESEND_API_KEY"),
  };
};


export const config = appConfig();
