import express, { type Request, type Response } from 'express';
import 'dotenv/config';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import userRouter from './routes/userRoute.js';
import projectRouter from './routes/projectRoutes.js';
import { stripeWebhook } from './controllers/stripeWebhook.js';

const app = express();

app.post(
  '/api/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

const allowedOrigins = [
  'https://buildgen.vercel.app',
];

app.use(
  cors({
    origin: (origin: string | undefined, callback: Function) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.options('*', cors());

app.all('/api/auth/*', toNodeHandler(auth));

app.use(express.json({ limit: '50mb' }));

app.get('/', (_req: Request, res: Response) => {
  res.send('Server is Live!');
});

app.use('/api/user', userRouter);
app.use('/api/project', projectRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
