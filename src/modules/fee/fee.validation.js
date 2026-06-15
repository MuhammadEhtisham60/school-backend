const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const VALID_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

/**
 * Validate payload for creating a fee record.
 * @param {object} data - Request body.
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validateCreateFee = (data) => {
  const errors = {};

  // 1. studentId validation
  if (!data.studentId || typeof data.studentId !== 'string' || data.studentId.trim() === '') {
    errors.studentId = 'studentId is required';
  }

  // 2. month validation
  if (!data.month || typeof data.month !== 'string' || data.month.trim() === '') {
    errors.month = 'month is required';
  } else if (!VALID_MONTHS.includes(data.month.trim())) {
    errors.month = 'Invalid month name. Must be one of: ' + VALID_MONTHS.join(', ');
  }

  // 3. amount validation
  if (data.amount === undefined || data.amount === null || data.amount === '') {
    errors.amount = 'amount is required';
  } else {
    const amt = Number(data.amount);
    if (isNaN(amt) || amt <= 0) {
      errors.amount = 'amount must be a number greater than 0';
    }
  }

  // 4. paymentDate validation
  if (!data.paymentDate || typeof data.paymentDate !== 'string' || data.paymentDate.trim() === '') {
    errors.paymentDate = 'paymentDate is required';
  } else if (!DATE_REGEX.test(data.paymentDate.trim())) {
    errors.paymentDate = 'paymentDate must be in YYYY-MM-DD format';
  }

  // 5. paymentMethod validation
  if (!data.paymentMethod || typeof data.paymentMethod !== 'string' || data.paymentMethod.trim() === '') {
    errors.paymentMethod = 'paymentMethod is required';
  }

  // 6. status validation (optional, defaults to Paid)
  if (data.status !== undefined && data.status !== null) {
    if (typeof data.status !== 'string' || data.status.trim() === '') {
      errors.status = 'status must be a non-empty string';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate payload for updating a fee record.
 * @param {object} data - Request body.
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validateUpdateFee = (data) => {
  const errors = {};

  // 1. studentId and month are NOT allowed to change
  if (data.studentId !== undefined) {
    errors.studentId = 'Changing studentId is not allowed';
  }

  if (data.month !== undefined) {
    errors.month = 'Changing month is not allowed';
  }

  // 2. amount validation (optional)
  if (data.amount !== undefined && data.amount !== null && data.amount !== '') {
    const amt = Number(data.amount);
    if (isNaN(amt) || amt <= 0) {
      errors.amount = 'amount must be a number greater than 0';
    }
  }

  // 3. paymentDate validation (optional)
  if (data.paymentDate !== undefined && data.paymentDate !== null && data.paymentDate !== '') {
    if (typeof data.paymentDate !== 'string' || !DATE_REGEX.test(data.paymentDate.trim())) {
      errors.paymentDate = 'paymentDate must be in YYYY-MM-DD format';
    }
  }

  // 4. paymentMethod validation (optional)
  if (data.paymentMethod !== undefined && data.paymentMethod !== null) {
    if (typeof data.paymentMethod !== 'string' || data.paymentMethod.trim() === '') {
      errors.paymentMethod = 'paymentMethod must be a non-empty string';
    }
  }

  // 5. status validation (optional)
  if (data.status !== undefined && data.status !== null) {
    if (typeof data.status !== 'string' || data.status.trim() === '') {
      errors.status = 'status must be a non-empty string';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
