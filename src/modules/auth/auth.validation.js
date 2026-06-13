const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate signup payload.
 * @param {object} data - The request body.
 * @returns {object} { isValid: boolean, errors: string[] }
 */
export const validateSignup = (data) => {
  const { firstName, lastName, email, password, schoolName, address, contact, academicSession } = data;
  const errors = [];

  if (!firstName || typeof firstName !== 'string' || firstName.trim() === '') {
    errors.push('firstName is required and must be a non-empty string');
  }

  if (!lastName || typeof lastName !== 'string' || lastName.trim() === '') {
    errors.push('lastName is required and must be a non-empty string');
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    errors.push('email is required and must be a valid email address');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('password is required and must be at least 6 characters long');
  }

  if (!schoolName || typeof schoolName !== 'string' || schoolName.trim() === '') {
    errors.push('schoolName is required and must be a non-empty string');
  }

  if (!address || typeof address !== 'string' || address.trim() === '') {
    errors.push('address is required and must be a non-empty string');
  }

  if (!contact || typeof contact !== 'string' || contact.trim() === '') {
    errors.push('contact is required and must be a non-empty string');
  }

  if (!academicSession || typeof academicSession !== 'string' || academicSession.trim() === '') {
    errors.push('academicSession is required and must be a non-empty string');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate login payload.
 * @param {object} data - The request body.
 * @returns {object} { isValid: boolean, errors: string[] }
 */
export const validateLogin = (data) => {
  const { email, password } = data;
  const errors = [];

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    errors.push('email is required and must be a valid email address');
  }

  if (!password || typeof password !== 'string' || password.trim() === '') {
    errors.push('password is required and must be a non-empty string');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
