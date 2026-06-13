import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';

export const apiRouter = Router();

// Health check route
apiRouter.get('/health', getHealth);
