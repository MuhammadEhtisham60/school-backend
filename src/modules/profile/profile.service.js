import * as profileRepository from './profile.repository.js';

/**
 * Custom error helper.
 */
const createError = (message, status) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

/**
 * Format database user record (snake_case) to client response structure (camelCase).
 */
const formatUser = (user) => ({
  id: user.id,
  firstName: user.first_name,
  lastName: user.last_name,
  email: user.email,
  createdAt: user.created_at,
  updatedAt: user.updated_at
});

/**
 * Retrieve user profile details.
 */
export const getProfile = async (userId) => {
  const user = await profileRepository.getUserById(userId);
  if (!user) {
    throw createError('User profile not found.', 404);
  }
  return formatUser(user);
};

/**
 * Update user profile details.
 */
export const updateProfile = async (userId, { firstName, lastName }) => {
  const user = await profileRepository.getUserById(userId);
  if (!user) {
    throw createError('User profile not found.', 404);
  }

  if (!firstName || typeof firstName !== 'string' || firstName.trim() === '') {
    throw createError('firstName is required and must be a non-empty string.', 400);
  }

  if (!lastName || typeof lastName !== 'string' || lastName.trim() === '') {
    throw createError('lastName is required and must be a non-empty string.', 400);
  }

  const updatedUser = await profileRepository.updateUserById(userId, {
    firstName: firstName.trim(),
    lastName: lastName.trim()
  });

  return formatUser(updatedUser);
};
