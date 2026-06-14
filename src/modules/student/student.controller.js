import * as studentService from './student.service.js';
import { validateCreateStudent, validateUpdateStudent } from './student.validation.js';
import { sendSuccess, sendError } from '../../utils/response.js';

/**
 * Enroll a new student (Admission).
 */
export const enrollStudent = async (req, res, next) => {
  try {
    const { isValid, errors } = validateCreateStudent(req.body);
    if (!isValid) {
      return sendError(res, 'Validation failed', 400, errors);
    }

    // req.files is populated by multer if multipart/form-data is processed
    const student = await studentService.enrollStudent(req.body, req.files);

    return sendSuccess(res, 'Student admitted successfully', { data: student }, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Get students list.
 */
export const getStudentsList = async (req, res, next) => {
  try {
    const { search, class: classFilter, section, limit, offset } = req.query;
    const filters = {
      search,
      class: classFilter,
      section,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined
    };

    const students = await studentService.getStudentsList(filters);
    return sendSuccess(res, 'Students list retrieved successfully', { students }, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Get student details.
 */
export const getStudentDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await studentService.getStudentDetails(id);
    return sendSuccess(res, 'Student details retrieved successfully', { student }, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Update an existing student record.
 */
export const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { isValid, errors } = validateUpdateStudent(req.body);
    if (!isValid) {
      return sendError(res, 'Validation failed', 400, errors);
    }

    const updatedStudent = await studentService.updateStudent(id, req.body, req.files);
    return sendSuccess(res, 'Student updated successfully', { student: updatedStudent }, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a student by ID.
 */
export const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    await studentService.deleteStudent(id);
    return sendSuccess(res, 'Student deleted successfully', {}, 200);
  } catch (err) {
    next(err);
  }
};
