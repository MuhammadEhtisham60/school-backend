import { Router } from 'express';
import { getProfile, updateProfile } from './profile.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

// Protect all profile routes with JWT middleware
router.use(authMiddleware);

router.get('/', getProfile);
router.put('/', updateProfile);

export default router;
