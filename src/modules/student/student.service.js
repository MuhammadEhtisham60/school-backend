import * as studentRepository from './student.repository.js';

/**
 * Custom error helper.
 */
const createError = (message, status) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

/**
 * Format a date object/string to YYYY-MM-DD format safely.
 */
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
};

/**
 * Convert database row (snake_case) to client response format (camelCase).
 */
export const formatStudent = (s) => {
  if (!s) return null;
  return {
    id: s.id,
    fullName: s.full_name,
    fatherName: s.father_name,
    dob: formatDate(s.dob),
    gender: s.gender,
    rollNo: s.roll_no,
    cnic: s.cnic,
    photo: s.photo,
    class: s.class,
    section: s.section,
    prevSchool: s.prev_school,
    lastResult: s.last_result !== null ? Number(s.last_result) : null,
    admissionDate: formatDate(s.admission_date),
    mobile: s.mobile,
    altContact: s.alt_contact,
    email: s.email,
    city: s.city,
    address: s.address,
    fatherFullName: s.father_full_name,
    fatherCNIC: s.father_cnic,
    occupation: s.occupation,
    fatherPhone: s.father_phone,
    motherName: s.mother_name,
    motherPhone: s.mother_phone,
    blood: s.blood,
    emergency: s.emergency,
    medical: s.medical,
    disability: s.disability,
    transport: s.transport,
    busRoute: s.bus_route,
    hostel: s.hostel,
    studentPhoto: s.student_photo,
    bFormCopy: s.b_form_copy,
    prevResultCard: s.prev_result_card,
    guardianCnic: s.guardian_cnic,
    isActive: s.is_active,
    is_active: s.is_active, // user requested return of is_active specifically
    fees: typeof s.fees === 'string' ? JSON.parse(s.fees) : (s.fees || {}),
    createdAt: s.created_at,
    updatedAt: s.updated_at
  };
};

/**
 * Helper to generate random student ID: std_xxxxxxxx (9 random digits)
 */
const generateStudentId = () => {
  const randNum = Math.floor(100000000 + Math.random() * 900000000); // 9 digits
  return `std_${randNum}`;
};

/**
 * Helper to auto-generate a roll number
 */
const generateRollNo = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(100 + Math.random() * 900); // 3 digits
  return `${year}-${rand}`;
};

/**
 * Initialize 12-month fee records for a new student.
 */
const initializeFees = (defaultAmount = 5000) => {
  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  const feesObj = {};
  months.forEach(month => {
    feesObj[month] = {
      status: 'pending',
      amount: defaultAmount,
      paid_amount: 0,
      due_amount: defaultAmount,
      paid_at: null,
      remarks: ''
    };
  });
  return feesObj;
};

/**
 * Create a new student record (Admission).
 */
export const enrollStudent = async (data, files = {}) => {
  // Generate student ID
  const studentId = generateStudentId();
  
  // Set defaults and process formats
  const rollNo = data.rollNo && data.rollNo.trim() !== '' ? data.rollNo.trim() : generateRollNo();
  const lastResult = data.lastResult !== undefined && data.lastResult !== null && data.lastResult !== '' ? Number(data.lastResult) : null;
  const admissionDate = data.admissionDate && data.admissionDate.trim() !== '' ? data.admissionDate.trim() : new Date().toISOString().split('T')[0];

  // Cast transport/hostel strings to boolean
  const transport = String(data.transport).toLowerCase() === 'true';
  const hostel = String(data.hostel).toLowerCase() === 'true';
  const busRoute = data.busRoute || '';

  // Parse is_active status
  let isActive = true;
  if (data.is_active !== undefined) {
    isActive = String(data.is_active).toLowerCase() === 'true';
  } else if (data.isActive !== undefined) {
    isActive = String(data.isActive).toLowerCase() === 'true';
  }

  // Initialize 12 months fees (defaults to 5000)
  const defaultFeeAmount = data.monthlyFee ? Number(data.monthlyFee) : 5000;
  const fees = initializeFees(defaultFeeAmount);

  // Process files: extract paths/filenames for columns
  const photo = files.photo ? `/uploads/${files.photo[0].filename}` : (data.photo || null);
  const studentPhoto = files.studentPhoto ? `/uploads/${files.studentPhoto[0].filename}` : (data.studentPhoto || null);
  const bFormCopy = files.bFormCopy ? `/uploads/${files.bFormCopy[0].filename}` : (data.bFormCopy || null);
  const prevResultCard = files.prevResultCard ? `/uploads/${files.prevResultCard[0].filename}` : (data.prevResultCard || null);
  const guardianCnic = files.guardianCnic ? `/uploads/${files.guardianCnic[0].filename}` : (data.guardianCnic || null);

  const studentPayload = {
    id: studentId,
    fullName: data.fullName.trim(),
    fatherName: data.fatherName.trim(),
    dob: data.dob.trim(),
    gender: data.gender.trim(),
    rollNo,
    cnic: data.cnic || null,
    photo,
    class: data.class.trim(),
    section: data.section.trim(),
    prevSchool: data.prevSchool || null,
    lastResult,
    admissionDate,
    mobile: data.mobile.trim(),
    altContact: data.altContact || null,
    email: data.email || null,
    city: data.city || null,
    address: data.address || null,
    fatherFullName: data.fatherFullName || null,
    fatherCNIC: data.fatherCNIC || null,
    occupation: data.occupation || null,
    fatherPhone: data.fatherPhone || null,
    motherName: data.motherName || null,
    motherPhone: data.motherPhone || null,
    blood: data.blood || null,
    emergency: data.emergency || null,
    medical: data.medical || null,
    disability: data.disability || null,
    transport,
    busRoute,
    hostel,
    studentPhoto,
    bFormCopy,
    prevResultCard,
    guardianCnic,
    isActive,
    fees
  };

  const student = await studentRepository.createStudent(studentPayload);
  return formatStudent(student);
};

/**
 * Get all students list with optional filters.
 */
export const getStudentsList = async (filters = {}) => {
  const serviceFilters = { ...filters };
  if (filters.is_active !== undefined) {
    serviceFilters.isActive = filters.is_active;
  }
  const students = await studentRepository.getStudentsList(serviceFilters);
  return students.map(formatStudent);
};

/**
 * Get detailed student information by ID.
 */
export const getStudentDetails = async (id) => {
  const student = await studentRepository.getStudentById(id);
  if (!student) {
    throw createError(`Student with ID ${id} not found.`, 404);
  }
  return formatStudent(student);
};

/**
 * Update an existing student's profile.
 */
export const updateStudent = async (id, data, files = {}) => {
  const existing = await studentRepository.getStudentById(id);
  if (!existing) {
    throw createError(`Student with ID ${id} not found.`, 404);
  }

  // Parse types if provided
  const updatePayload = {};

  const textFields = [
    'fullName', 'fatherName', 'dob', 'gender', 'rollNo', 'cnic', 'class', 'section',
    'prevSchool', 'mobile', 'altContact', 'email', 'city', 'address', 'fatherFullName',
    'fatherCNIC', 'occupation', 'fatherPhone', 'motherName', 'motherPhone', 'blood',
    'emergency', 'medical', 'disability', 'busRoute'
  ];

  for (const field of textFields) {
    if (data[field] !== undefined) {
      updatePayload[field] = data[field] === '' ? null : data[field];
    }
  }

  if (data.lastResult !== undefined) {
    updatePayload.lastResult = data.lastResult === '' || data.lastResult === null ? null : Number(data.lastResult);
  }

  if (data.admissionDate !== undefined) {
    updatePayload.admissionDate = data.admissionDate === '' || data.admissionDate === null ? null : data.admissionDate;
  }

  if (data.transport !== undefined) {
    updatePayload.transport = String(data.transport).toLowerCase() === 'true';
  }

  if (data.hostel !== undefined) {
    updatePayload.hostel = String(data.hostel).toLowerCase() === 'true';
  }

  // Handle is_active update
  let updateIsActive;
  if (data.is_active !== undefined) {
    updateIsActive = String(data.is_active).toLowerCase() === 'true';
  } else if (data.isActive !== undefined) {
    updateIsActive = String(data.isActive).toLowerCase() === 'true';
  }
  if (updateIsActive !== undefined) {
    updatePayload.isActive = updateIsActive;
  }

  // Handle files
  if (files.photo) updatePayload.photo = `/uploads/${files.photo[0].filename}`;
  else if (data.photo !== undefined) updatePayload.photo = data.photo;

  if (files.studentPhoto) updatePayload.studentPhoto = `/uploads/${files.studentPhoto[0].filename}`;
  else if (data.studentPhoto !== undefined) updatePayload.studentPhoto = data.studentPhoto;

  if (files.bFormCopy) updatePayload.bFormCopy = `/uploads/${files.bFormCopy[0].filename}`;
  else if (data.bFormCopy !== undefined) updatePayload.bFormCopy = data.bFormCopy;

  if (files.prevResultCard) updatePayload.prevResultCard = `/uploads/${files.prevResultCard[0].filename}`;
  else if (data.prevResultCard !== undefined) updatePayload.prevResultCard = data.prevResultCard;

  if (files.guardianCnic) updatePayload.guardianCnic = `/uploads/${files.guardianCnic[0].filename}`;
  else if (data.guardianCnic !== undefined) updatePayload.guardianCnic = data.guardianCnic;

  const updated = await studentRepository.updateStudent(id, updatePayload);
  return formatStudent(updated);
};

/**
 * Delete a student by ID.
 */
export const deleteStudent = async (id) => {
  const existing = await studentRepository.getStudentById(id);
  if (!existing) {
    throw createError(`Student with ID ${id} not found.`, 404);
  }
  return studentRepository.deleteStudent(id);
};

/**
 * Retrieve a student's 12-month fees.
 */
export const getStudentFees = async (id) => {
  const student = await studentRepository.getStudentById(id);
  if (!student) {
    throw createError(`Student with ID ${id} not found.`, 404);
  }
  return typeof student.fees === 'string' ? JSON.parse(student.fees) : (student.fees || {});
};

/**
 * Update monthly fee record parameters.
 */
export const updateMonthlyFee = async (id, month, data) => {
  const student = await studentRepository.getStudentById(id);
  if (!student) {
    throw createError(`Student with ID ${id} not found.`, 404);
  }

  const fees = typeof student.fees === 'string' ? JSON.parse(student.fees) : (student.fees || {});
  const normalizedMonth = month.toLowerCase();
  if (!fees[normalizedMonth]) {
    throw createError(`Invalid month name: ${month}`, 400);
  }

  const monthRecord = fees[normalizedMonth];

  // Update provided fields
  if (data.amount !== undefined) monthRecord.amount = Number(data.amount);
  if (data.paid_amount !== undefined) monthRecord.paid_amount = Number(data.paid_amount);
  if (data.remarks !== undefined) monthRecord.remarks = data.remarks;
  if (data.paid_at !== undefined) monthRecord.paid_at = data.paid_at || null;

  // Recalculate remaining due amount
  monthRecord.due_amount = monthRecord.amount - monthRecord.paid_amount;

  // Auto update status based on payment if not explicitly overridden
  if (data.status !== undefined) {
    monthRecord.status = data.status;
  } else {
    if (monthRecord.paid_amount === 0) {
      monthRecord.status = 'pending';
    } else if (monthRecord.paid_amount === monthRecord.amount) {
      monthRecord.status = 'paid';
    } else {
      monthRecord.status = 'partial';
    }
  }

  await studentRepository.updateStudentFees(id, fees);
  return fees[normalizedMonth];
};

/**
 * Record a payment for a specific month.
 */
export const payMonthlyFee = async (id, month, data) => {
  const student = await studentRepository.getStudentById(id);
  if (!student) {
    throw createError(`Student with ID ${id} not found.`, 404);
  }

  const fees = typeof student.fees === 'string' ? JSON.parse(student.fees) : (student.fees || {});
  const normalizedMonth = month.toLowerCase();
  if (!fees[normalizedMonth]) {
    throw createError(`Invalid month name: ${month}`, 400);
  }

  const monthRecord = fees[normalizedMonth];

  // Extract payment value (supports both "amount" and "paid_amount" keys)
  const payVal = Number(data.amount !== undefined ? data.amount : (data.paid_amount !== undefined ? data.paid_amount : 0));
  if (isNaN(payVal) || payVal <= 0) {
    throw createError('Payment amount must be a number greater than 0', 400);
  }

  const newPaidAmount = monthRecord.paid_amount + payVal;
  if (newPaidAmount > monthRecord.amount) {
    throw createError(`Payment of ${payVal} would exceed the remaining month fee limit. Total paid cannot exceed ${monthRecord.amount}.`, 400);
  }

  monthRecord.paid_amount = newPaidAmount;
  monthRecord.due_amount = monthRecord.amount - monthRecord.paid_amount;

  // Automatically update status based on payment amount
  if (monthRecord.paid_amount === monthRecord.amount) {
    monthRecord.status = 'paid';
  } else {
    monthRecord.status = 'partial';
  }

  monthRecord.paid_at = data.paid_at || new Date().toISOString().split('T')[0];
  if (data.remarks !== undefined) monthRecord.remarks = data.remarks;

  await studentRepository.updateStudentFees(id, fees);
  return fees[normalizedMonth];
};
