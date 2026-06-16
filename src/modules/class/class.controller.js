import * as classService from './class.service.js';
import { validateCreateClass, validateUpdateClass } from './class.validation.js';
import { sendSuccess, sendError } from '../../utils/response.js';

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

/**
 * Handle GET /api/classes request (full list with subjects).
 */
export const getClasses = async (req, res, next) => {
  try {
    const classes = await classService.getClassesList();
    return sendSuccess(res, 'Classes list retrieved successfully', { data: classes }, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Handle GET /api/classes/:id request.
 */
export const getClassById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cls = await classService.getClassById(id);
    return sendSuccess(res, 'Class details retrieved successfully', { data: cls }, 200);
  } catch (err) {
    if (err.message === 'Class not found') {
      return sendError(res, err.message, 404);
    }
    next(err);
  }
};

/**
 * Handle POST /api/classes request.
 */
export const createClass = async (req, res, next) => {
  try {
    const { isValid, errors } = validateCreateClass(req.body);
    if (!isValid) {
      return sendError(res, 'Validation failed', 400, errors);
    }

    const newClass = await classService.createClass(req.body);
    return sendSuccess(res, 'Class created successfully', { data: newClass }, 201);
  } catch (err) {
    if (err.message.includes('already exists')) {
      return sendError(res, err.message, 400);
    }
    next(err);
  }
};

/**
 * Handle PUT /api/classes/:id request.
 */
export const updateClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isValid, errors } = validateUpdateClass(req.body);
    if (!isValid) {
      return sendError(res, 'Validation failed', 400, errors);
    }

    const updatedClass = await classService.updateClass(id, req.body);
    return sendSuccess(res, 'Class updated successfully', { data: updatedClass }, 200);
  } catch (err) {
    if (err.message === 'Class not found') {
      return sendError(res, err.message, 404);
    }
    if (err.message.includes('already exists')) {
      return sendError(res, err.message, 400);
    }
    next(err);
  }
};

/**
 * Handle DELETE /api/classes/:id request.
 */
export const deleteClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    await classService.deleteClass(id);
    return sendSuccess(res, 'Class deleted successfully', {}, 200);
  } catch (err) {
    if (err.message === 'Class not found or already deleted') {
      return sendError(res, err.message, 404);
    }
    next(err);
  }
};
