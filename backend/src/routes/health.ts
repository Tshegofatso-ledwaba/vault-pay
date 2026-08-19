import { Router } from 'express';
import { healthCheckDatabase } from '../services/db.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  const dbStatus = await healthCheckDatabase();

  res.json({
    success: true,
    service: 'vaultpay-backend',
    status: 'ok',
    database: dbStatus,
  });
});
