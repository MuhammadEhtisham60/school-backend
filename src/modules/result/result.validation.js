const VALID_TERMS = ['First Term', 'Mid Term', 'Final Term'];

/**
 * Validates a single term object.
 * @param {object} term 
 * @param {string} termName 
 * @returns {object} errors object for the term
 */
const validateTermData = (term, termName) => {
  const errors = {};

  if (!term || typeof term !== 'object') {
    errors.term = `${termName} must be an object`;
    return errors;
  }

  if (!term.subjects || !Array.isArray(term.subjects) || term.subjects.length === 0) {
    errors.subjects = `${termName} must contain a non-empty array of subjects`;
  } else {
    term.subjects.forEach((subj, idx) => {
      const subjectErrors = {};
      
      if (!subj.subjectName || typeof subj.subjectName !== 'string' || subj.subjectName.trim() === '') {
        subjectErrors.subjectName = 'Subject name is required';
      }

      if (subj.totalMarks === undefined || subj.totalMarks === null || subj.totalMarks === '') {
        subjectErrors.totalMarks = 'Total marks is required';
      } else {
        const total = Number(subj.totalMarks);
        if (isNaN(total) || total <= 0) {
          subjectErrors.totalMarks = 'Total marks must be a number greater than 0';
        }
      }

      if (subj.obtainedMarks === undefined || subj.obtainedMarks === null || subj.obtainedMarks === '') {
        subjectErrors.obtainedMarks = 'Obtained marks is required';
      } else {
        const obtained = Number(subj.obtainedMarks);
        if (isNaN(obtained) || obtained < 0) {
          subjectErrors.obtainedMarks = 'Obtained marks must be a positive number or zero';
        }

        if (subj.totalMarks !== undefined && subj.totalMarks !== null && subj.totalMarks !== '') {
          const total = Number(subj.totalMarks);
          if (!isNaN(total) && !isNaN(obtained) && obtained > total) {
            subjectErrors.obtainedMarks = 'Obtained marks cannot exceed total marks';
          }
        }
      }

      if (Object.keys(subjectErrors).length > 0) {
        errors[`subject_${idx}`] = subjectErrors;
      }
    });
  }

  if (term.position !== undefined && term.position !== null && term.position !== '') {
    const pos = Number(term.position);
    if (isNaN(pos) || !Number.isInteger(pos) || pos <= 0) {
      errors.position = 'Position must be a positive integer';
    }
  }

  return errors;
};

/**
 * Validate academic record creation payload.
 * @param {object} data 
 * @returns {object} { isValid, errors }
 */
export const validateCreateResult = (data) => {
  const errors = {};

  if (!data.studentId || typeof data.studentId !== 'string' || data.studentId.trim() === '') {
    errors.studentId = 'studentId is required';
  }

  if (!data.academicYear || typeof data.academicYear !== 'string' || data.academicYear.trim() === '') {
    errors.academicYear = 'academicYear is required';
  }

  if (!data.class || typeof data.class !== 'string' || data.class.trim() === '') {
    errors.class = 'class is required';
  }

  if (!data.section || typeof data.section !== 'string' || data.section.trim() === '') {
    errors.section = 'section is required';
  }

  if (data.terms !== undefined && data.terms !== null) {
    if (typeof data.terms !== 'object' || Array.isArray(data.terms)) {
      errors.terms = 'terms must be an object containing term names as keys';
    } else {
      const termErrors = {};
      for (const [key, termVal] of Object.entries(data.terms)) {
        if (!VALID_TERMS.includes(key)) {
          termErrors[key] = `Invalid term name. Allowed values: ${VALID_TERMS.join(', ')}`;
        } else {
          const singleTermErr = validateTermData(termVal, key);
          if (Object.keys(singleTermErr).length > 0) {
            termErrors[key] = singleTermErr;
          }
        }
      }
      if (Object.keys(termErrors).length > 0) {
        errors.terms = termErrors;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate academic record update payload.
 * @param {object} data 
 * @returns {object} { isValid, errors }
 */
export const validateUpdateResult = (data) => {
  const errors = {};

  // Don't allow modification of core identifying keys
  if (data.studentId !== undefined) {
    errors.studentId = 'Changing studentId is not allowed';
  }

  if (data.academicYear !== undefined) {
    errors.academicYear = 'Changing academicYear is not allowed';
  }

  if (data.class !== undefined) {
    errors.class = 'Changing class is not allowed';
  }

  if (data.terms !== undefined && data.terms !== null) {
    if (typeof data.terms !== 'object' || Array.isArray(data.terms)) {
      errors.terms = 'terms must be an object containing term names as keys';
    } else {
      const termErrors = {};
      for (const [key, termVal] of Object.entries(data.terms)) {
        if (!VALID_TERMS.includes(key)) {
          termErrors[key] = `Invalid term name. Allowed values: ${VALID_TERMS.join(', ')}`;
        } else {
          const singleTermErr = validateTermData(termVal, key);
          if (Object.keys(singleTermErr).length > 0) {
            termErrors[key] = singleTermErr;
          }
        }
      }
      if (Object.keys(termErrors).length > 0) {
        errors.terms = termErrors;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
