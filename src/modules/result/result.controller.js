import * as resultService from './result.service.js';
import { validateCreateResult, validateUpdateResult } from './result.validation.js';
import { sendSuccess, sendError } from '../../utils/response.js';

/**
 * Create a new academic record with terms.
 */
export const createResult = async (req, res, next) => {
  try {
    const { isValid, errors } = validateCreateResult(req.body);
    if (!isValid) {
      return sendError(res, 'Validation failed', 400, errors);
    }

    const result = await resultService.createResult(req.body);
    return sendSuccess(res, 'Academic record created successfully.', { data: result }, 201);
  } catch (err) {
    if (err.status) {
      return sendError(res, err.message, err.status);
    }
    next(err);
  }
};

/**
 * Get results with optional filters.
 */
export const getResultsList = async (req, res, next) => {
  try {
    const results = await resultService.getResultsList(req.query);
    return sendSuccess(res, 'Results retrieved successfully.', { data: results }, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Get specific academic record details by ID.
 */
export const getResultDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await resultService.getResultDetails(id);
    return sendSuccess(res, 'Result details retrieved successfully.', { data: result }, 200);
  } catch (err) {
    if (err.status) {
      return sendError(res, err.message, err.status);
    }
    next(err);
  }
};

/**
 * Get complete result history of a student by studentId.
 */
export const getStudentHistory = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const history = await resultService.getStudentHistory(studentId);
    return sendSuccess(res, 'Student result history retrieved successfully.', { data: history }, 200);
  } catch (err) {
    if (err.status) {
      return sendError(res, err.message, err.status);
    }
    next(err);
  }
};

/**
 * Update academic record or terms.
 */
export const updateResult = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isValid, errors } = validateUpdateResult(req.body);
    if (!isValid) {
      return sendError(res, 'Validation failed', 400, errors);
    }

    const updated = await resultService.updateResult(id, req.body);
    return sendSuccess(res, 'Result record updated successfully.', { data: updated }, 200);
  } catch (err) {
    if (err.status) {
      return sendError(res, err.message, err.status);
    }
    next(err);
  }
};

/**
 * Delete an entire academic record.
 */
export const deleteResult = async (req, res, next) => {
  try {
    const { id } = req.params;
    await resultService.deleteResult(id);
    return sendSuccess(res, 'Result record deleted successfully.', {}, 200);
  } catch (err) {
    if (err.status) {
      return sendError(res, err.message, err.status);
    }
    next(err);
  }
};

/**
 * Delete a single term result.
 */
export const deleteTermResult = async (req, res, next) => {
  try {
    const { id, termName } = req.params;
    const updated = await resultService.deleteTermResult(id, termName);
    return sendSuccess(res, `Term result "${termName}" deleted successfully.`, { data: updated }, 200);
  } catch (err) {
    if (err.status) {
      return sendError(res, err.message, err.status);
    }
    next(err);
  }
};
