import * as authRepository from './auth.repository.js';
import { hashPassword, comparePassword } from '../../utils/bcrypt.js';
import { generateToken } from '../../utils/jwt.js';

/**
 * Custom error helper
 */
const createError = (message, status) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

/**
 * Format database user record (snake_case) to client response structure (camelCase)
 */
const formatUser = (user) => ({
  id: user.id,
  firstName: user.first_name,
  lastName: user.last_name,
  email: user.email,
  schoolName: user.school_name,
  address: user.address,
  contact: user.contact,
  academicSession: user.academic_session,
  createdAt: user.created_at,
  updatedAt: user.updated_at
});

/**
 * Register a new user.
 */
export const signup = async (userData) => {
  const { firstName, lastName, email, password, schoolName, address, contact, academicSession } = userData;

  // Verify unique email
  const existingUser = await authRepository.getUserByEmail(email);
  if (existingUser) {
    throw createError('Email is already registered.', 400);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Save to database
  const user = await authRepository.createUser({
    firstName,
    lastName,
    email,
    hashedPassword,
    schoolName,
    address,
    contact,
    academicSession
  });

  // Generate token
  const token = generateToken({ id: user.id, email: user.email });

  return {
    token,
    user: formatUser(user)
  };
};

/**
 * Login user and authenticate credentials.
 */
export const login = async ({ email, password }) => {
  // Find user
  const user = await authRepository.getUserByEmail(email);
  if (!user) {
    throw createError('Invalid email or password.', 401);
  }

  // Compare passwords
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw createError('Invalid email or password.', 401);
  }

  // Generate token
  const token = generateToken({ id: user.id, email: user.email });

  return {
    token,
    user: formatUser(user)
  };
};
