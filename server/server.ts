import express, { Request, Response } from 'express';
import 'dotenv/config';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth';
import userRouter from './routes/userRoute';
import projectRouter from './routes/projectRoutes';
import { stripeWebhook } from './controllers/stripeWebhook';

const app = express();

const corsOptions = {
  origin: process.env.TRUSTED_ORIGIN?.split(',') || [],
  credentials: true,
};

app.use(cors(corsOptions));

// Stripe webhook MUST be before json middleware
app.post(
  '/api/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

// Auth
app.all('/api/auth/{*any}', toNodeHandler(auth));

// Body parser
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/', (req: Request, res: Response) => {
  res.send('Server is Live!');
});

// Routes
app.use('/api/user', userRouter);
app.use('/api/project', projectRouter);

/**
 * ❌ DO NOT app.listen() on Vercel
 * ✅ Export app instead
 */
export default app;
