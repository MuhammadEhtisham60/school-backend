import { verifyToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';

/**
 * Middleware to protect routes using JWT authentication.
 * Expects Bearer token in Authorization header.
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return sendError(res, 'Access denied. Invalid token format.', 401);
    }

    try {
      const decoded = verifyToken(token);
      // Decoded token contains user id and email (e.g. { id: 1, email: 'john@example.com' })
      req.user = decoded;
      next();
    } catch (jwtErr) {
      return sendError(res, 'Invalid or expired token.', 401);
    }
  } catch (err) {
    next(err);
  }
};
