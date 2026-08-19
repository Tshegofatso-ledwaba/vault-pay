import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { healthRouter } from './routes/health.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, service: 'vaultpay-backend', status: 'ok' });
});

app.use('/api/health-check', healthRouter);

app.get('/', (_req, res) => {
  res.json({
    name: 'VaultPay Backend',
    status: 'running',
    environment: env.nodeEnv,
    databaseConfigured: Boolean(env.databaseUrl),
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`VaultPay backend listening on http://localhost:${env.port}`);
});
