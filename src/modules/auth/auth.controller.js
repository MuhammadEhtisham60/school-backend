import * as authService from './auth.service.js';
import { validateSignup, validateLogin } from './auth.validation.js';
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
