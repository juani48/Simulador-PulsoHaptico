import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config();

export const serverConfig = {
  port: Number(process.env.APP_PORT ?? 8080),
  corsOrigin: process.env.CORS_ORIGIN ?? '*'
};

export function getDistDirectory(serverDirectory: string): string {
  return path.resolve(serverDirectory, '..', 'dist');
}