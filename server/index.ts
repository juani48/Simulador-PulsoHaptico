import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import swaggerUi from 'swagger-ui-express';
import { simulator } from './simulator.js';
import openapiDocument from './openapi.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.APP_PORT ?? 8080);

app.use(cors({
  origin: process.env.CORS_ORIGIN ?? '*',
  allowedHeaders: ['Content-Type', 'ngrok-skip-browser-warning']
}));
app.use(express.json());

app.get('/openapi.json', (_req, res) => res.json(openapiDocument));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

app.get('/api/get-data', (_req, res) => res.json(simulator.getCurrent()));
app.get('/api/history',  (_req, res) => res.json(simulator.getHistory()));
app.put('/api/data', (req, res) => {
  simulator.setData(req.body);
  res.json(simulator.getCurrent());
});

const distDir = path.resolve(__dirname, '..', 'dist');
app.use(express.static(distDir));
app.get('/{*splat}', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));

app.listen(PORT, () => {
  console.log(`Pulso Háptico Bridge → http://localhost:${PORT}`);
});
