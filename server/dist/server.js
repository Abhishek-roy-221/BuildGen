import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import userRouter from './routes/userRoute.js';
import projectRouter from './routes/projectRoutes.js';
import { stripeWebhook } from './controllers/stripeWebhook.js';
const app = express();
/* Stripe webhook MUST come first */
app.post('/api/stripe', express.raw({ type: 'application/json' }), stripeWebhook);
/* CORS */
app.use(cors({
    origin: process.env.TRUSTED_ORIGIN?.split(',') || [],
    credentials: true,
}));
/* Auth (Express 4 compatible wildcard) */
app.all('/api/auth/*', toNodeHandler(auth));
/* Body parser */
app.use(express.json({ limit: '50mb' }));
/* Health check */
app.get('/', (_req, res) => {
    res.send('Server is Live!');
});
/* Routes */
app.use('/api/user', userRouter);
app.use('/api/project', projectRouter);
/* REQUIRED for Vercel */
export default app;
