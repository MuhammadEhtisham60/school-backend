import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import * as classController from './class.controller.js';

const router = Router();

// Apply authentication middleware to class routes
router.use(authMiddleware);

// GET /api/classes
router.get('/', classController.getClasses);

// GET /api/classes/dropdown (Must be defined before /:id)
router.get('/dropdown', classController.getClassesDropdown);

// GET /api/classes/:id
router.get('/:id', classController.getClassById);

// POST /api/classes
router.post('/', classController.createClass);

// PUT /api/classes/:id
router.put('/:id', classController.updateClass);

// DELETE /api/classes/:id
router.delete('/:id', classController.deleteClass);

export default router;
