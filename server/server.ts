import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import userRouter from './routes/userRoute.js';
import projectRouter from './routes/projectRoutes.js';
import { stripeWebhook } from './controllers/stripeWebhook.js';

const app = express();

/* =========================
   STRIPE WEBHOOK (FIRST)
========================= */
app.post(
  '/api/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

/* =========================
   CORS CONFIG
========================= */
const allowedOrigins = [
  'https://buildgen.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server / curl / SSR
      if (!origin) return callback(null, true);

      // Allow production frontend
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // 🔥 Allow all Vercel preview deployments
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// REQUIRED for preflight requests
app.options('*', cors());

/* =========================
   AUTH
========================= */
app.all('/api/auth/*', toNodeHandler(auth));

/* =========================
   BODY PARSER
========================= */
app.use(express.json({ limit: '50mb' }));

/* =========================
   HEALTH CHECK
========================= */
app.get('/', (_req, res) => {
  res.send('Server is Live!');
});

/* =========================
   ROUTES
========================= */
app.use('/api/user', userRouter);
app.use('/api/project', projectRouter);

/* =========================
   EXPORT FOR VERCEL
========================= */
export default app;
