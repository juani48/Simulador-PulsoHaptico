import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import openapiDocument from './openapi.js';
import { simulator } from './simulator.js';

export function createApiRouter(): Router {
  const router = Router();

  router.get('/openapi.json', (_req, res) => res.json(openapiDocument));
  router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

  router.get('/api/get-data', (_req, res) => res.json(simulator.getCurrent()));
  router.get('/api/history', (_req, res) => res.json(simulator.getHistory()));
  router.put('/api/data', (req, res) => {
    simulator.setData(req.body);
    res.json(simulator.getCurrent());
  });

  return router;
}