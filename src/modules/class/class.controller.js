import * as classService from './class.service.js';
import { sendSuccess } from '../../utils/response.js';

/**
 * Handle GET /api/classes/dropdown request.
 */
export const getClassesDropdown = async (req, res, next) => {
  try {
    const classes = await classService.getClassesDropdown();
    return sendSuccess(res, 'Classes dropdown list retrieved successfully', { data: classes }, 200);
  } catch (err) {
    next(err);
  }
};
