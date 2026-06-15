import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import * as feeController from './fee.controller.js';

const router = Router();

// Protect all fee routes with auth middleware
router.use(authMiddleware);

// CRUD endpoints for fees
router.post('/', feeController.createFee);
router.get('/', feeController.getAllFees);
router.get('/student/:studentId', feeController.getStudentFees);
router.put('/:id', feeController.updateFee);
router.delete('/:id', feeController.deleteFee);

export default router;
