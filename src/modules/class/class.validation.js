/**
 * Validate class creation payload.
 * @param {object} data - Request body containing class details.
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validateCreateClass = (data) => {
  const errors = {};

  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    errors.name = 'Class name is required';
  }

  if (data.id !== undefined && (typeof data.id !== 'string' || data.id.trim() === '')) {
    errors.id = 'Class ID must be a non-empty string';
  }

  if (data.displayOrder !== undefined && data.displayOrder !== null) {
    const num = Number(data.displayOrder);
    if (isNaN(num) || !Number.isInteger(num) || num < 0) {
      errors.displayOrder = 'Display order must be a positive integer or zero';
    }
  }

  if (data.isActive !== undefined && data.isActive !== null && data.isActive !== '') {
    const val = String(data.isActive).toLowerCase();
    if (val !== 'true' && val !== 'false' && typeof data.isActive !== 'boolean') {
      errors.isActive = 'isActive must be a boolean value';
    }
  }

  if (data.subjects !== undefined && data.subjects !== null) {
    if (!Array.isArray(data.subjects)) {
      errors.subjects = 'Subjects must be an array of strings';
    } else {
      const invalidSubjects = data.subjects.filter(
        (sub) => typeof sub !== 'string' || sub.trim() === ''
      );
      if (invalidSubjects.length > 0) {
        errors.subjects = 'All subjects must be non-empty strings';
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate class update payload.
 * @param {object} data - Request body containing class details.
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validateUpdateClass = (data) => {
  const errors = {};

  if (data.name !== undefined && (!data.name || typeof data.name !== 'string' || data.name.trim() === '')) {
    errors.name = 'Class name cannot be empty';
  }

  if (data.displayOrder !== undefined && data.displayOrder !== null) {
    const num = Number(data.displayOrder);
    if (isNaN(num) || !Number.isInteger(num) || num < 0) {
      errors.displayOrder = 'Display order must be a positive integer or zero';
    }
  }

  if (data.isActive !== undefined && data.isActive !== null && data.isActive !== '') {
    const val = String(data.isActive).toLowerCase();
    if (val !== 'true' && val !== 'false' && typeof data.isActive !== 'boolean') {
      errors.isActive = 'isActive must be a boolean value';
    }
  }

  if (data.subjects !== undefined && data.subjects !== null) {
    if (!Array.isArray(data.subjects)) {
      errors.subjects = 'Subjects must be an array of strings';
    } else {
      const invalidSubjects = data.subjects.filter(
        (sub) => typeof sub !== 'string' || sub.trim() === ''
      );
      if (invalidSubjects.length > 0) {
        errors.subjects = 'All subjects must be non-empty strings';
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
