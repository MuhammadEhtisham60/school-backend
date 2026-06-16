export const GRADING_SCALE = [
  { minPercentage: 90, grade: 'A+', gpa: 4.0, status: 'Pass' },
  { minPercentage: 80, grade: 'A', gpa: 3.7, status: 'Pass' },
  { minPercentage: 70, grade: 'B', gpa: 3.0, status: 'Pass' },
  { minPercentage: 60, grade: 'C', gpa: 2.0, status: 'Pass' },
  { minPercentage: 50, grade: 'D', gpa: 1.0, status: 'Pass' },
  { minPercentage: 0, grade: 'F', gpa: 0.0, status: 'Fail' }
];

/**
 * Calculates grade, GPA, and pass/fail status based on a percentage.
 * @param {number} percentage 
 * @returns {object} { grade, gpa, status }
 */
export const calculateGradeAndGpa = (percentage) => {
  const rounded = Math.round(percentage * 100) / 100;
  for (const rule of GRADING_SCALE) {
    if (rounded >= rule.minPercentage) {
      return {
        grade: rule.grade,
        gpa: rule.gpa,
        status: rule.status
      };
    }
  }
  return { grade: 'F', gpa: 0.0, status: 'Fail' };
};
