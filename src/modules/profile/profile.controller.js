import * as profileService from './profile.service.js';
import { sendSuccess } from '../../utils/response.js';

/**
 * Get profile of the currently logged-in user.
 */
export const getProfile = async (req, res, next) => {
  try {
    // req.user is populated by the authMiddleware (contains id and email)
    const profile = await profileService.getProfile(req.user.id);

    // Spread the profile details into the response to match the exact schema fields
    return sendSuccess(res, 'Profile retrieved successfully', profile, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Update profile of the currently logged-in user.
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName } = req.body;
    const updatedProfile = await profileService.updateProfile(req.user.id, { firstName, lastName });

    return sendSuccess(res, 'Profile updated successfully', updatedProfile, 200);
  } catch (err) {
    next(err);
  }
};
