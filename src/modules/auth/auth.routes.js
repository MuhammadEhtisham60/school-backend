import { Router } from 'express';
import { signup, login, forgotPassword, verifyOtp, resendOtp, resetPassword } from './auth.controller.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/reset-password', resetPassword);

export default router;
