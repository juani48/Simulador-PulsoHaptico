import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import openapiDocument from './openapi.js';
import { simulator } from './simulator.js';
import { DYSREGULATING_FACTORS } from './types.js';

export function createApiRouter(): Router {
  const router = Router();

  router.get('/openapi.json', (_req, res) => res.json(openapiDocument));
  router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

  router.get('/api/data', (_req, res) => res.json(simulator.getCurrent()));
  router.get('/api/activities', (_req, res) => res.json(simulator.getActivities()));
  router.put('/api/activities/:id', (req, res) => {
    const { canBeDisturbing, dysregulatingFactors } = req.body ?? {};
    if (
      typeof canBeDisturbing !== 'boolean' ||
      !Array.isArray(dysregulatingFactors) ||
      dysregulatingFactors.length === 0 ||
      dysregulatingFactors.some(
        (factor: unknown) => !DYSREGULATING_FACTORS.includes(factor as typeof DYSREGULATING_FACTORS[number])
      )
    ) {
      res.status(400).json({
        error: 'canBeDisturbing debe ser booleano y dysregulatingFactors debe ser una lista no vacía'
      });
      return;
    }

    try {
      simulator.setActivitySettings(req.params.id, { canBeDisturbing, dysregulatingFactors });
      res.json(simulator.getActivities());
    } catch (error) {
      res.status(404).json({ error: error instanceof Error ? error.message : 'Actividad no encontrada' });
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
    if (typeof req.body?.selectedActivity === 'string') {
      simulator.selectActivity(req.body.selectedActivity);
    }
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