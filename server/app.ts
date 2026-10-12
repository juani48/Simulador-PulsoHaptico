import cors from 'cors';
import express, { type Express } from 'express';
import path from 'node:path';
import { serverConfig } from './config.js';
import { createApiRouter } from './routes.js';

export function createApp(distDirectory: string): Express {
  const app = express();

  app.use(cors({
    origin: serverConfig.corsOrigin,
    allowedHeaders: ['Content-Type', 'ngrok-skip-browser-warning']
  }));
  app.use(express.json());
  app.use(createApiRouter());

  app.use(express.static(distDirectory));
  app.get('/{*splat}', (_req, res) => {
    res.sendFile(path.join(distDirectory, 'index.html'));
  });

  return app;
}