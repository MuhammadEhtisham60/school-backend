import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import * as classController from './class.controller.js';

const router = Router();

// Apply authentication middleware to class routes
router.use(authMiddleware);

// GET /api/classes/dropdown
router.get('/dropdown', classController.getClassesDropdown);

export default router;
