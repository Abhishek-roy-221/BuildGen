import express, { Request, Response } from 'express';
import 'dotenv/config';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth';
import userRouter from './routes/userRoute';
import projectRouter from './routes/projectRoutes';
import { stripeWebhook } from './controllers/stripeWebhook';

const app = express();

/* 🔥 Stripe webhook MUST be FIRST — no middleware before this */
app.post(
  '/api/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

/* CORS */
const corsOptions = {
  origin: process.env.TRUSTED_ORIGIN?.split(',') || [],
  credentials: true,
};
app.use(cors(corsOptions));

/* Auth — Express syntax */
app.all('/api/auth/*', toNodeHandler(auth));

/* JSON parser */
app.use(express.json({ limit: '50mb' }));

/* Health check */
app.get('/', (_req: Request, res: Response) => {
  res.send('Server is Live!');
});

/* Routes */
app.use('/api/user', userRouter);
app.use('/api/project', projectRouter);

/* ✅ Export app — DO NOT listen on a port */
export default app;
