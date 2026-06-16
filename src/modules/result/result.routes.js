import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import * as resultController from './result.controller.js';

const router = Router();

// Protect all result routes with auth middleware
router.use(authMiddleware);

// CRUD routes for results
router.post('/', resultController.createResult);
router.get('/', resultController.getResultsList);
router.get('/:id', resultController.getResultDetails);
router.get('/student/:studentId', resultController.getStudentHistory);
router.put('/:id', resultController.updateResult);
router.delete('/:id', resultController.deleteResult);
router.delete('/:id/terms/:termName', resultController.deleteTermResult);

export default router;
