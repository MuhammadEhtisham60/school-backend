import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';
import authRouter from '../modules/auth/auth.routes.js';
import profileRouter from '../modules/profile/profile.routes.js';
import studentRouter from '../modules/student/student.routes.js';
import feeRouter from '../modules/fee/fee.routes.js';
import resultRouter from '../modules/result/result.routes.js';
import classRouter from '../modules/class/class.routes.js';

export const apiRouter = Router();

// Health check route
apiRouter.get('/health', getHealth);

// Auth routes
apiRouter.use('/auth', authRouter);

// Profile routes
apiRouter.use('/profile', profileRouter);

// Student routes
apiRouter.use('/students', studentRouter);

// Fee routes
apiRouter.use('/fees', feeRouter);

// Result routes
apiRouter.use('/results', resultRouter);

// Class routes
apiRouter.use('/classes', classRouter);

