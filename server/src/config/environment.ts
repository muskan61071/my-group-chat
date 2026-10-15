import 'dotenv/config';

export const env = {
  PORT: Number(process.env.PORT || 8080),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
  INVITE_CODE_PEPPER: process.env.INVITE_CODE_PEPPER || 'chat-pepper-default-salt',
  JWT_SECRET: process.env.JWT_SECRET || 'chat-jwt-secret-key-2026',
};
