import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import userRouter from './routes/userRoute.js';
import projectRouter from './routes/projectRoutes.js';
import { stripeWebhook } from './controllers/stripeWebhook.js';

const app = express();

/* ============================
   STRIPE WEBHOOK (FIRST)
============================ */
app.post(
  '/api/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

/* ============================
   CORS (FIXED)
============================ */
const allowedOrigins = [
  'https://buildgen.vercel.app',   // production frontend
  'http://localhost:5173'          // local dev
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow non-browser requests (like curl, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

/* 🔥 REQUIRED: preflight support */
app.options('*', cors());

/* ============================
   AUTH
============================ */
app.all('/api/auth/*', toNodeHandler(auth));

/* ============================
   BODY PARSER
============================ */
app.use(express.json({ limit: '50mb' }));

/* ============================
   HEALTH CHECK
============================ */
app.get('/', (_req, res) => {
  res.send('Server is Live!');
});

/* ============================
   ROUTES
============================ */
app.use('/api/user', userRouter);
app.use('/api/project', projectRouter);

/* ============================
   EXPORT FOR VERCEL
============================ */
export default app;
