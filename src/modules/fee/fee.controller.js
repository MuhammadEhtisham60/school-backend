import * as feeService from './fee.service.js';
import { validateCreateFee, validateUpdateFee } from './fee.validation.js';
import { sendSuccess, sendError } from '../../utils/response.js';

/**
 * Create a new monthly fee record.
 */
export const createFee = async (req, res, next) => {
  try {
    const { isValid, errors } = validateCreateFee(req.body);
    if (!isValid) {
      return sendError(res, 'Validation failed', 400, errors);
    }

    const feeData = {
      ...req.body,
      status: req.body.status || 'Paid' // default status to Paid if not provided
    };

    const fee = await feeService.createFee(feeData, req.user?.id);
    return sendSuccess(res, 'Fee added successfully.', { data: fee }, 201);
  } catch (err) {
    if (err.status) {
      return sendError(res, err.message, err.status);
    }
    next(err);
  }
};

/**
 * Retrieve list of all monthly fee records.
 */
export const getAllFees = async (req, res, next) => {
  try {
    const result = await feeService.getAllFees(req.query);
    return sendSuccess(res, 'Fees list retrieved successfully.', {
      data: result.fees,
      pagination: result.pagination
    }, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieve monthly fees for a single student.
 */
export const getStudentFees = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const fees = await feeService.getStudentFees(studentId);
    return sendSuccess(res, 'Student fees retrieved successfully.', { data: fees }, 200);
  } catch (err) {
    if (err.status) {
      return sendError(res, err.message, err.status);
    }
    next(err);
  }
};

/**
 * Update a fee record.
 */
export const updateFee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isValid, errors } = validateUpdateFee(req.body);
    if (!isValid) {
      return sendError(res, 'Validation failed', 400, errors);
    }

    const updatedFee = await feeService.updateFee(id, req.body);
    return sendSuccess(res, 'Fee updated successfully.', { data: updatedFee }, 200);
  } catch (err) {
    if (err.status) {
      return sendError(res, err.message, err.status);
    }
    next(err);
  }
};

/**
 * Delete a fee record.
 */
export const deleteFee = async (req, res, next) => {
  try {
    const { id } = req.params;
    await feeService.deleteFee(id);
    return sendSuccess(res, 'Fee record deleted successfully.', {}, 200);
  } catch (err) {
    if (err.status) {
      return sendError(res, err.message, err.status);
    }
    next(err);
  }
};
