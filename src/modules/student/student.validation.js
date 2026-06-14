const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validate student creation payload.
 * @param {object} data - Request body containing student details.
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validateCreateStudent = (data) => {
  const errors = {};

  // 1. Basic Info
  if (!data.fullName || typeof data.fullName !== 'string' || data.fullName.trim() === '') {
    errors.fullName = 'Full name is required';
  }

  if (!data.fatherName || typeof data.fatherName !== 'string' || data.fatherName.trim() === '') {
    errors.fatherName = "Father's name is required";
  }

  if (!data.dob || typeof data.dob !== 'string' || data.dob.trim() === '') {
    errors.dob = 'Date of birth is required';
  } else if (!DATE_REGEX.test(data.dob)) {
    errors.dob = 'Date of birth must be in YYYY-MM-DD format';
  }

  if (!data.gender || typeof data.gender !== 'string' || data.gender.trim() === '') {
    errors.gender = 'Gender is required';
  } else if (!['Male', 'Female', 'Other'].includes(data.gender.trim())) {
    errors.gender = 'Gender must be Male, Female, or Other';
  }

  // 2. Academic Info
  if (!data.class || typeof data.class !== 'string' || data.class.trim() === '') {
    errors.class = 'Class is required';
  }

  if (!data.section || typeof data.section !== 'string' || data.section.trim() === '') {
    errors.section = 'Section is required';
  }

  // Last exam result validation (optional)
  if (data.lastResult !== undefined && data.lastResult !== null && data.lastResult !== '') {
    const num = Number(data.lastResult);
    if (isNaN(num) || num < 0 || num > 100) {
      errors.lastResult = 'Last result must be a number between 0 and 100';
    }
  }

  // Admission Date validation (optional)
  if (data.admissionDate && typeof data.admissionDate === 'string' && data.admissionDate.trim() !== '') {
    if (!DATE_REGEX.test(data.admissionDate)) {
      errors.admissionDate = 'Admission date must be in YYYY-MM-DD format';
    }
  }

  // 3. Contact Info
  if (!data.mobile || typeof data.mobile !== 'string' || data.mobile.trim() === '') {
    errors.mobile = 'Mobile number is required';
  }

  if (data.email && typeof data.email === 'string' && data.email.trim() !== '') {
    if (!EMAIL_REGEX.test(data.email.trim())) {
      errors.email = 'Email format is invalid';
    }
  }

  // 4. Transport/Hostel validation
  if (data.transport !== undefined && data.transport !== null && data.transport !== '') {
    const val = String(data.transport).toLowerCase();
    if (val !== 'true' && val !== 'false') {
      errors.transport = 'Transport must be a boolean value';
    }
  }

  if (data.hostel !== undefined && data.hostel !== null && data.hostel !== '') {
    const val = String(data.hostel).toLowerCase();
    if (val !== 'true' && val !== 'false') {
      errors.hostel = 'Hostel must be a boolean value';
    }
  }

  // is_active/isActive validation
  const isActiveVal = data.is_active !== undefined ? data.is_active : data.isActive;
  if (isActiveVal !== undefined && isActiveVal !== null && isActiveVal !== '') {
    const val = String(isActiveVal).toLowerCase();
    if (val !== 'true' && val !== 'false') {
      errors.is_active = 'is_active must be a boolean value';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate student update payload (similar to create, but elements are optional if not PUT, 
 * but since we are doing PUT, we can run similar checks but allow flexibility).
 * @param {object} data - Request body containing student details.
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validateUpdateStudent = (data) => {
  // We can reuse the validateCreateStudent rules, but if it is partial, we validate what is provided.
  // For PUT, we expect a complete resource, so validateCreateStudent works. Let's make it flexible
  // but ensure required fields are validated if they are passed.
  const errors = {};

  if (data.fullName !== undefined && (!data.fullName || typeof data.fullName !== 'string' || data.fullName.trim() === '')) {
    errors.fullName = 'Full name is required';
  }

  if (data.fatherName !== undefined && (!data.fatherName || typeof data.fatherName !== 'string' || data.fatherName.trim() === '')) {
    errors.fatherName = "Father's name is required";
  }

  if (data.dob !== undefined) {
    if (!data.dob || typeof data.dob !== 'string' || data.dob.trim() === '') {
      errors.dob = 'Date of birth is required';
    } else if (!DATE_REGEX.test(data.dob)) {
      errors.dob = 'Date of birth must be in YYYY-MM-DD format';
    }
  }

  if (data.gender !== undefined) {
    if (!data.gender || typeof data.gender !== 'string' || data.gender.trim() === '') {
      errors.gender = 'Gender is required';
    } else if (!['Male', 'Female', 'Other'].includes(data.gender.trim())) {
      errors.gender = 'Gender must be Male, Female, or Other';
    }
  }

  if (data.class !== undefined && (!data.class || typeof data.class !== 'string' || data.class.trim() === '')) {
    errors.class = 'Class is required';
  }

  if (data.section !== undefined && (!data.section || typeof data.section !== 'string' || data.section.trim() === '')) {
    errors.section = 'Section is required';
  }

  if (data.lastResult !== undefined && data.lastResult !== null && data.lastResult !== '') {
    const num = Number(data.lastResult);
    if (isNaN(num) || num < 0 || num > 100) {
      errors.lastResult = 'Last result must be a number between 0 and 100';
    }
  }

  if (data.admissionDate !== undefined && data.admissionDate !== null && data.admissionDate !== '') {
    if (!DATE_REGEX.test(data.admissionDate)) {
      errors.admissionDate = 'Admission date must be in YYYY-MM-DD format';
    }
  }

  if (data.mobile !== undefined && (!data.mobile || typeof data.mobile !== 'string' || data.mobile.trim() === '')) {
    errors.mobile = 'Mobile number is required';
  }

  if (data.email !== undefined && data.email !== null && data.email.trim() !== '') {
    if (!EMAIL_REGEX.test(data.email.trim())) {
      errors.email = 'Email format is invalid';
    }
  }

  if (data.transport !== undefined && data.transport !== null && data.transport !== '') {
    const val = String(data.transport).toLowerCase();
    if (val !== 'true' && val !== 'false') {
      errors.transport = 'Transport must be a boolean value';
    }
  }

  if (data.hostel !== undefined && data.hostel !== null && data.hostel !== '') {
    const val = String(data.hostel).toLowerCase();
    if (val !== 'true' && val !== 'false') {
      errors.hostel = 'Hostel must be a boolean value';
    }
  }

  // is_active/isActive validation
  const updateIsActiveVal = data.is_active !== undefined ? data.is_active : data.isActive;
  if (updateIsActiveVal !== undefined && updateIsActiveVal !== null && updateIsActiveVal !== '') {
    const val = String(updateIsActiveVal).toLowerCase();
    if (val !== 'true' && val !== 'false') {
      errors.is_active = 'is_active must be a boolean value';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate monthly fee updates.
 */
export const validateFeeUpdate = (data, month) => {
  const errors = {};
  const validMonths = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  
  if (!month || !validMonths.includes(month.toLowerCase())) {
    errors.month = 'Invalid month name. Must be a valid month of the year.';
  }

  let validatedAmount = null;
  if (data.amount !== undefined && data.amount !== null && data.amount !== '') {
    const amt = Number(data.amount);
    if (isNaN(amt) || amt < 0) {
      errors.amount = 'Amount cannot be negative';
    } else {
      validatedAmount = amt;
    }
  }

  if (data.paid_amount !== undefined && data.paid_amount !== null && data.paid_amount !== '') {
    const paidAmt = Number(data.paid_amount);
    if (isNaN(paidAmt) || paidAmt < 0) {
      errors.paid_amount = 'Paid amount cannot be negative';
    }

    if (validatedAmount !== null && paidAmt > validatedAmount) {
      errors.paid_amount = 'Paid amount cannot exceed total amount';
    }
  }

  if (data.status !== undefined && data.status !== null && data.status !== '') {
    if (!['pending', 'paid', 'partial', 'overdue'].includes(data.status)) {
      errors.status = 'Status must be pending, paid, partial, or overdue';
    }
  }

  if (data.paid_at !== undefined && data.paid_at !== null && data.paid_at !== '') {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.paid_at)) {
      errors.paid_at = 'Payment date must be in YYYY-MM-DD format (YYYY-MM-DD)';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate single monthly fee payment.
 */
export const validateFeePayment = (data, month) => {
  const errors = {};
  const validMonths = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

  if (!month || !validMonths.includes(month.toLowerCase())) {
    errors.month = 'Invalid month name. Must be a valid month of the year.';
  }

  const amt = data.amount !== undefined ? data.amount : data.paid_amount;
  if (amt === undefined || amt === null || amt === '') {
    errors.amount = 'Payment amount is required';
  } else {
    const numAmt = Number(amt);
    if (isNaN(numAmt) || numAmt <= 0) {
      errors.amount = 'Payment amount must be a number greater than 0';
    }
  }

  if (data.paid_at !== undefined && data.paid_at !== null && data.paid_at !== '') {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.paid_at)) {
      errors.paid_at = 'Payment date must be in YYYY-MM-DD format (YYYY-MM-DD)';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
