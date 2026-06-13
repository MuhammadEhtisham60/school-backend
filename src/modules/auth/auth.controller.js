import * as authService from './auth.service.js';
import {
  validateSignup,
  validateLogin,
  validateForgotPassword,
  validateVerifyOtp,
  validateResendOtp,
  validateResetPassword
} from './auth.validation.js';
import { sendSuccess, sendError } from '../../utils/response.js';

/**
 * Handle user signup request.
 */
export const signup = async (req, res, next) => {
  try {
    const { isValid, errors } = validateSignup(req.body);
    if (!isValid) {
      return sendError(res, 'Validation failed.', 400, errors);
    }

    const { token, user } = await authService.signup(req.body);

    return sendSuccess(res, 'User registered successfully', { token, user }, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Handle user login request.
 */
export const login = async (req, res, next) => {
  try {
    const { isValid, errors } = validateLogin(req.body);
    if (!isValid) {
      return sendError(res, 'Validation failed.', 400, errors);
    }

    const { token, user } = await authService.login(req.body);

    return sendSuccess(res, 'Login successful', { token, user }, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Handle forgot password request.
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { isValid, errors } = validateForgotPassword(req.body);
    if (!isValid) {
      return sendError(res, 'Validation failed.', 400, errors);
    }

    const { email } = req.body;
    await authService.forgotPassword(email);

    return sendSuccess(res, 'OTP sent to your registered email address successfully.', {}, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Handle verify OTP request.
 */
export const verifyOtp = async (req, res, next) => {
  try {
    const { isValid, errors } = validateVerifyOtp(req.body);
    if (!isValid) {
      return sendError(res, 'Validation failed.', 400, errors);
    }

    const { email, otp } = req.body;
    const result = await authService.verifyOtp(email, otp);

    return sendSuccess(res, 'OTP verified successfully.', result, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Handle resend OTP request.
 */
export const resendOtp = async (req, res, next) => {
  try {
    const { isValid, errors } = validateResendOtp(req.body);
    if (!isValid) {
      return sendError(res, 'Validation failed.', 400, errors);
    }

    const { email } = req.body;
    await authService.resendOtp(email);

    return sendSuccess(res, 'A new OTP has been sent to your email successfully.', {}, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Handle reset password request.
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { isValid, errors } = validateResetPassword(req.body);
    if (!isValid) {
      return sendError(res, 'Validation failed.', 400, errors);
    }

    await authService.resetPassword(req.body);

    return sendSuccess(res, 'Password reset successfully. You can now login with your new password.', {}, 200);
  } catch (err) {
    next(err);
  }
};
