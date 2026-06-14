import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Generate a JWT token for a given user payload.
 * @param {object} payload - The payload to sign (typically { id, email }).
 * @returns {string} The signed JWT token.
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify a JWT token and return the decoded payload.
 * @param {string} token - The JWT token to verify.
 * @returns {object} The decoded payload.
 * @throws {Error} if token is invalid or expired.
 */
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
