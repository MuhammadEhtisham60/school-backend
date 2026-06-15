import * as feeModel from './fee.model.js';
import { getStudentById } from '../student/student.repository.js';

/**
 * Custom error helper.
 */
const createError = (message, status) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

/**
 * Standardize fee record response.
 * Maps snake_case database fields to camelCase and embeds populated student info.
 */
export const formatFee = (f) => {
  if (!f) return null;
  return {
    id: f.id,
    studentId: {
      id: f.student_id,
      name: f.full_name,
      admissionNo: f.student_id, // student_id acts as admission number
      class: f.class,
      section: f.section,
      rollNumber: f.roll_no
    },
    month: f.month,
    amount: Number(f.amount),
    paymentDate: f.payment_date ? new Date(f.payment_date).toISOString().split('T')[0] : null,
    paymentMethod: f.payment_method,
    status: f.status,
    remarks: f.remarks,
    createdBy: f.created_by,
    createdAt: f.created_at,
    updatedAt: f.updated_at
  };
};

/**
 * Add a new monthly fee record against a student.
 */
export const createFee = async (feeData, userId) => {
  // 1. Verify student exists
  const student = await getStudentById(feeData.studentId);
  if (!student) {
    throw createError('Student not found.', 404);
  }

  // 2. Prevent duplicate fee for the same student and month
  const existingFee = await feeModel.findByStudentAndMonth(feeData.studentId, feeData.month);
  if (existingFee) {
    throw createError('Fee for this month already exists.', 400);
  }

  // 3. Create fee record
  const createdRaw = await feeModel.create({
    ...feeData,
    createdBy: userId
  });

  // 4. Fetch with populated student info
  const populated = await feeModel.findById(createdRaw.id);
  return formatFee(populated);
};

/**
 * Retrieve list of all fees with pagination and optional filters.
 */
export const getAllFees = async (query = {}) => {
  const limit = query.limit ? parseInt(query.limit, 10) : 10;
  const page = query.page ? parseInt(query.page, 10) : 1;
  const offset = (page - 1) * limit;

  const filters = {
    search: query.search || null,
    month: query.month || null,
    status: query.status || null,
    limit,
    offset
  };

  const rows = await feeModel.findAll(filters);
  const total = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;

  return {
    fees: rows.map(formatFee),
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Retrieve all monthly fee records of a specific student.
 */
export const getStudentFees = async (studentId) => {
  // Verify student exists
  const student = await getStudentById(studentId);
  if (!student) {
    throw createError('Student not found.', 404);
  }

  const rows = await feeModel.findByStudentId(studentId);
  return rows.map(formatFee);
};

/**
 * Update an existing fee record.
 */
export const updateFee = async (id, updateData) => {
  // Verify fee exists
  const existingFee = await feeModel.findById(id);
  if (!existingFee) {
    throw createError('Fee record not found.', 404);
  }

  // Update record (ignores studentId and month in feeModel.update)
  await feeModel.update(id, updateData);

  // Fetch updated record with populated student details
  const updated = await feeModel.findById(id);
  return formatFee(updated);
};

/**
 * Delete a fee record by ID.
 */
export const deleteFee = async (id) => {
  // Verify fee exists
  const existingFee = await feeModel.findById(id);
  if (!existingFee) {
    throw createError('Fee record not found.', 404);
  }

  return feeModel.remove(id);
};
