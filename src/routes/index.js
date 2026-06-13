import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';
import authRouter from '../modules/auth/auth.routes.js';
import profileRouter from '../modules/profile/profile.routes.js';

export const apiRouter = Router();

// Health check route
apiRouter.get('/health', getHealth);

// Auth routes
apiRouter.use('/auth', authRouter);

// Profile routes
apiRouter.use('/profile', profileRouter);

