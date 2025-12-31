import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import userRouter from './routes/userRoute.js';
import projectRouter from './routes/projectRoutes.js';
import { stripeWebhook } from './controllers/stripeWebhook.js';

const app = express();

/* Stripe webhook FIRST */
app.post(
  '/api/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

app.use(cors({
  origin: process.env.TRUSTED_ORIGIN?.split(',') || [],
  credentials: true,
}));

app.all('/api/auth/*', toNodeHandler(auth));
app.use(express.json({ limit: '50mb' }));

app.get('/', (_req, res) => {
  res.send('Server is Live!');
});

app.use('/api/user', userRouter);
app.use('/api/project', projectRouter);

export default app;
