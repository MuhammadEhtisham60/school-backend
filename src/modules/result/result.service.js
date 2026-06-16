import * as resultModel from './result.model.js';
import { getStudentById } from '../student/student.repository.js';
import { calculateGradeAndGpa } from '../../utils/grading.js';

/**
 * Custom error helper.
 */
const createError = (message, status) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

/**
 * Format database raw joins into standard nested JSON response format.
 * @param {object} ar - Academic record row.
 * @param {object[]} termRows - Joined terms and subjects rows.
 * @returns {object} Formatted camelCase academic record.
 */
export const formatAcademicRecord = (ar, termRows = []) => {
  if (!ar) return null;

  const result = {
    id: ar.id,
    studentId: {
      id: ar.student_id,
      name: ar.full_name,
      admissionNo: ar.student_id,
      class: ar.student_class,
      section: ar.student_section,
      rollNumber: ar.student_roll
    },
    academicYear: ar.academic_year,
    class: ar.class,
    section: ar.section,
    rollNo: ar.roll_no,
    promotionStatus: ar.promotion_status,
    terms: {},
    createdAt: ar.created_at,
    updatedAt: ar.updated_at
  };

  // Group terms and their subjects
  termRows.forEach(row => {
    const termName = row.term_name;
    if (!result.terms[termName]) {
      result.terms[termName] = {
        id: row.id,
        totalMarks: Number(row.total_marks),
        obtainedMarks: Number(row.obtained_marks),
        percentage: Number(row.percentage),
        grade: row.grade,
        gpa: row.gpa !== null ? Number(row.gpa) : null,
        position: row.position !== null ? Number(row.position) : null,
        remarks: row.remarks,
        resultStatus: row.result_status,
        subjects: []
      };
    }

    if (row.subject_id) {
      result.terms[termName].subjects.push({
        id: row.subject_id,
        subjectName: row.subject_name,
        totalMarks: Number(row.subject_total),
        obtainedMarks: Number(row.subject_obtained),
        grade: row.subject_grade,
        gpa: row.subject_gpa !== null ? Number(row.subject_gpa) : null,
        status: row.subject_status,
        remarks: row.subject_remarks
      });
    }
  });

  return result;
};

/**
 * Create a new academic record along with terms and subjects.
 */
export const createResult = async (data) => {
  // 1. Verify student exists
  const student = await getStudentById(data.studentId);
  if (!student) {
    throw createError(`Student with ID ${data.studentId} not found.`, 404);
  }

  // 2. Prevent duplicate academic record for same Student + Academic Year + Class
  const existing = await resultModel.findByUniqueKeys(data.studentId, data.academicYear, data.class);
  if (existing) {
    throw createError(
      `Academic record for Student ${data.studentId} in Class "${data.class}" for Academic Year "${data.academicYear}" already exists.`,
      400
    );
  }

  // 3. Insert Academic Record
  const createdRecord = await resultModel.createAcademicRecord({
    studentId: data.studentId,
    academicYear: data.academicYear,
    class: data.class,
    section: data.section,
    rollNo: data.rollNo || student.roll_no,
    promotionStatus: data.promotionStatus
  });

  // 4. If terms data are provided, insert them
  if (data.terms && typeof data.terms === 'object') {
    for (const [termName, termData] of Object.entries(data.terms)) {
      await processAndUpsertTerm(createdRecord, termName, termData);
    }
  }

  return getResultDetails(createdRecord.id);
};

/**
 * Helper to process subjects, calculate term aggregates/grades/GPAs, and upsert term record.
 */
const processAndUpsertTerm = async (record, termName, termData) => {
  const subjects = termData.subjects || [];
  
  let totalMarks = 0;
  let obtainedMarks = 0;
  
  const processedSubjects = subjects.map(s => {
    const total = Number(s.totalMarks);
    const obtained = Number(s.obtainedMarks);
    
    totalMarks += total;
    obtainedMarks += obtained;
    
    const subjectPercentage = total > 0 ? (obtained / total) * 100 : 0;
    const { grade, gpa, status } = calculateGradeAndGpa(subjectPercentage);
    
    return {
      subjectName: s.subjectName,
      totalMarks: total,
      obtainedMarks: obtained,
      grade,
      gpa,
      status,
      remarks: s.remarks || ''
    };
  });

  const termPercentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
  const { grade: termGrade, gpa: termGpa, status: termStatus } = calculateGradeAndGpa(termPercentage);

  const termPayload = {
    totalMarks,
    obtainedMarks,
    percentage: parseFloat(termPercentage.toFixed(2)),
    grade: termGrade,
    gpa: termGpa,
    remarks: termData.remarks || '',
    resultStatus: termStatus
  };

  // Upsert term result row
  const termRow = await resultModel.upsertTermResult(record.id, termName, termPayload);

  // Clear existing subject marks to prevent duplicates/obsolete records and insert new ones
  await resultModel.clearSubjectMarks(termRow.id);

  for (const s of processedSubjects) {
    await resultModel.createSubjectMark(termRow.id, s);
  }

  // Recalculate rank positions for all students in this class/section/year/term
  await resultModel.recalculatePositions(record.academic_year, record.class, record.section, termName);
};

/**
 * Update an academic record and optional individual terms.
 */
export const updateResult = async (id, data) => {
  // 1. Verify record exists
  const existing = await resultModel.findById(id);
  if (!existing) {
    throw createError(`Academic record with ID ${id} not found.`, 404);
  }

  // 2. Update core academic record details (rollNo, promotionStatus, section)
  const updatedRecord = await resultModel.updateAcademicRecord(id, {
    rollNo: data.rollNo,
    promotionStatus: data.promotionStatus,
    section: data.section
  });

  // 3. Process terms updates if provided
  if (data.terms && typeof data.terms === 'object') {
    for (const [termName, termData] of Object.entries(data.terms)) {
      await processAndUpsertTerm(updatedRecord, termName, termData);
    }
  }

  // If section changed, we should trigger rank recalculation for both the old section and new section
  if (data.section && data.section !== existing.section) {
    // Recalculate positions for all terms in the old section
    const termRows = await resultModel.findTermsAndSubjectsByRecordId(id);
    const uniqueTerms = [...new Set(termRows.map(r => r.term_name))];
    for (const termName of uniqueTerms) {
      await resultModel.recalculatePositions(existing.academic_year, existing.class, existing.section, termName);
      await resultModel.recalculatePositions(updatedRecord.academic_year, updatedRecord.class, updatedRecord.section, termName);
    }
  }

  return getResultDetails(id);
};

/**
 * Get detailed academic record by ID.
 */
export const getResultDetails = async (id) => {
  const ar = await resultModel.findById(id);
  if (!ar) {
    throw createError(`Academic record with ID ${id} not found.`, 404);
  }

  const termRows = await resultModel.findTermsAndSubjectsByRecordId(id);
  return formatAcademicRecord(ar, termRows);
};

/**
 * Get results with optional filters.
 */
export const getResultsList = async (query = {}) => {
  const filters = {
    academicYear: query.academicYear || null,
    classVal: query.class || null,
    section: query.section || null,
    studentId: query.studentId || null,
    term: query.term || null,
    limit: query.limit ? parseInt(query.limit, 10) : 100,
    offset: query.offset ? parseInt(query.offset, 10) : 0
  };

  const records = await resultModel.findAll(filters);
  
  // Resolve terms/subjects for all matches in parallel
  const results = await Promise.all(
    records.map(async ar => {
      const termRows = await resultModel.findTermsAndSubjectsByRecordId(ar.id);
      return formatAcademicRecord(ar, termRows);
    })
  );

  return results;
};

/**
 * Get complete academic history of a student.
 */
export const getStudentHistory = async (studentId) => {
  const student = await getStudentById(studentId);
  if (!student) {
    throw createError(`Student with ID ${studentId} not found.`, 404);
  }

  const records = await resultModel.findHistoryByStudentId(studentId);
  
  // Resolve terms/subjects in parallel
  const results = await Promise.all(
    records.map(async ar => {
      const termRows = await resultModel.findTermsAndSubjectsByRecordId(ar.id);
      return formatAcademicRecord(ar, termRows);
    })
  );

  return results;
};

/**
 * Delete an academic record.
 */
export const deleteResult = async (id) => {
  const existing = await resultModel.findById(id);
  if (!existing) {
    throw createError(`Academic record with ID ${id} not found.`, 404);
  }

  // Fetch terms to trigger rank recalculation after deletion
  const termRows = await resultModel.findTermsAndSubjectsByRecordId(id);
  const uniqueTerms = [...new Set(termRows.map(r => r.term_name))];

  await resultModel.removeAcademicRecord(id);

  // Recalculate positions after student is removed from ranks
  for (const termName of uniqueTerms) {
    await resultModel.recalculatePositions(existing.academic_year, existing.class, existing.section, termName);
  }

  return true;
};

/**
 * Delete a single term result.
 */
export const deleteTermResult = async (id, termName) => {
  const record = await resultModel.findById(id);
  if (!record) {
    throw createError(`Academic record with ID ${id} not found.`, 404);
  }

  const deleted = await resultModel.removeTermResult(id, termName);
  if (!deleted) {
    throw createError(`Term result "${termName}" not found in academic record.`, 404);
  }

  // Recalculate rank positions for remaining students
  await resultModel.recalculatePositions(record.academic_year, record.class, record.section, termName);

  return getResultDetails(id);
};
