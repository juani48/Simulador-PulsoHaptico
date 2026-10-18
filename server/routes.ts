import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import openapiDocument from './openapi.js';
import { simulator } from './simulator.js';

export function createApiRouter(): Router {
  const router = Router();

  router.get('/openapi.json', (_req, res) => res.json(openapiDocument));
  router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

  router.get('/api/data', (_req, res) => res.json(simulator.getCurrent()));
  router.get('/api/profiles', (_req, res) => res.json(simulator.getProfiles()));
  router.put('/api/profile', (req, res) => {
    try {
      if (typeof req.body?.profileId !== 'string') {
        res.status(400).json({ error: 'profileId debe ser una cadena' });
        return;
      }
      res.json(simulator.selectProfile(req.body.profileId));
    } catch (error) {
      res.status(404).json({ error: error instanceof Error ? error.message : 'Perfil no encontrado' });
    }
  });
  router.get('/api/history', (_req, res) => res.json(simulator.getHistory()));
  router.get('/api/scenarios', (_req, res) => res.json(simulator.getScenarios()));
  router.get('/api/scenario-status', (_req, res) => res.json(simulator.getScenarioStatus()));
  router.post('/api/scenarios/:id/start', (req, res) => {
    try {
      res.json(simulator.startScenario(req.params.id));
    } catch (error) {
      res.status(404).json({ error: error instanceof Error ? error.message : 'Escenario no encontrado' });
    }
  });
  router.put('/api/data', (req, res) => {
    simulator.setData(req.body);
    res.json(simulator.getCurrent());
  });
  router.put('/api/social-battery', (req, res) => {
    const value = req.body?.socialBattery;
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100) {
      res.status(400).json({ error: 'socialBattery debe ser un número entre 0 y 100' });
      return;
    }

    simulator.setSocialBattery(value);
    res.json(simulator.getCurrent());
  });

  return router;
}