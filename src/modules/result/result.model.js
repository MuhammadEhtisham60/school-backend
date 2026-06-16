import { query } from '../../config/db.js';

/**
 * Insert a new academic record.
 * @param {object} ar - Academic record details.
 * @returns {Promise<object>} The inserted row.
 */
export const createAcademicRecord = async (ar) => {
  const sql = `
    INSERT INTO academic_records (
      student_id, academic_year, class, section, roll_no, promotion_status
    ) VALUES (
      $1, $2, $3, $4, $5, $6
    )
    RETURNING *
  `;
  const params = [
    ar.studentId,
    ar.academicYear,
    ar.class,
    ar.section,
    ar.rollNo || null,
    ar.promotionStatus || null
  ];

  const { rows } = await query(sql, params);
  return rows[0];
};

/**
 * Find academic record by Student ID + Academic Year + Class.
 */
export const findByUniqueKeys = async (studentId, academicYear, classVal) => {
  const sql = `
    SELECT ar.*, s.full_name, s.roll_no as student_roll, s.class as student_class, s.section as student_section
    FROM academic_records ar
    LEFT JOIN students s ON ar.student_id = s.id
    WHERE ar.student_id = $1 AND ar.academic_year = $2 AND ar.class = $3
  `;
  const { rows } = await query(sql, [studentId, academicYear, classVal]);
  return rows[0] || null;
};

/**
 * Find academic record by its ID.
 */
export const findById = async (id) => {
  const sql = `
    SELECT ar.*, s.full_name, s.roll_no as student_roll, s.class as student_class, s.section as student_section
    FROM academic_records ar
    LEFT JOIN students s ON ar.student_id = s.id
    WHERE ar.id = $1
  `;
  const { rows } = await query(sql, [id]);
  return rows[0] || null;
};

/**
 * Retrieve term results and subject marks for an academic record.
 */
export const findTermsAndSubjectsByRecordId = async (recordId) => {
  const sql = `
    SELECT tr.*, 
           sm.id as subject_id, sm.subject_name, sm.total_marks as subject_total, 
           sm.obtained_marks as subject_obtained, sm.grade as subject_grade, 
           sm.gpa as subject_gpa, sm.status as subject_status, sm.remarks as subject_remarks
    FROM term_results tr
    LEFT JOIN subject_marks sm ON tr.id = sm.term_result_id
    WHERE tr.academic_record_id = $1
    ORDER BY tr.term_name, sm.subject_name
  `;
  const { rows } = await query(sql, [recordId]);
  return rows;
};

/**
 * Find all academic records matching filters.
 */
export const findAll = async (filters = {}) => {
  const { academicYear, classVal, section, studentId, term, limit = 100, offset = 0 } = filters;

  let sql = `
    SELECT ar.*, s.full_name, s.roll_no as student_roll, s.class as student_class, s.section as student_section
    FROM academic_records ar
    LEFT JOIN students s ON ar.student_id = s.id
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 1;

  if (studentId) {
    sql += ` AND ar.student_id = $${paramCount}`;
    params.push(studentId);
    paramCount++;
  }

  if (academicYear) {
    sql += ` AND ar.academic_year = $${paramCount}`;
    params.push(academicYear);
    paramCount++;
  }

  if (classVal) {
    sql += ` AND ar.class = $${paramCount}`;
    params.push(classVal);
    paramCount++;
  }

  if (section) {
    sql += ` AND ar.section = $${paramCount}`;
    params.push(section);
    paramCount++;
  }

  if (term) {
    sql += ` AND EXISTS (
      SELECT 1 FROM term_results tr 
      WHERE tr.academic_record_id = ar.id AND tr.term_name = $${paramCount}
    )`;
    params.push(term);
    paramCount++;
  }

  sql += ` ORDER BY ar.academic_year DESC, ar.class ASC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const { rows } = await query(sql, params);
  return rows;
};

/**
 * Retrieve full history for a student.
 */
export const findHistoryByStudentId = async (studentId) => {
  const sql = `
    SELECT ar.*, s.full_name, s.roll_no as student_roll, s.class as student_class, s.section as student_section
    FROM academic_records ar
    LEFT JOIN students s ON ar.student_id = s.id
    WHERE ar.student_id = $1
    ORDER BY ar.academic_year DESC, ar.class ASC
  `;
  const { rows } = await query(sql, [studentId]);
  return rows;
};

/**
 * Update general fields of an academic record.
 */
export const updateAcademicRecord = async (id, fieldsToUpdate) => {
  const fields = [];
  const params = [id];
  let paramCount = 2;

  const mapping = {
    rollNo: 'roll_no',
    promotionStatus: 'promotion_status',
    section: 'section'
  };

  for (const [key, dbCol] of Object.entries(mapping)) {
    if (fieldsToUpdate[key] !== undefined) {
      fields.push(`${dbCol} = $${paramCount}`);
      params.push(fieldsToUpdate[key]);
      paramCount++;
    }
  }

  if (fields.length === 0) {
    return findById(id);
  }

  const sql = `
    UPDATE academic_records
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;

  const { rows } = await query(sql, params);
  return rows[0] || null;
};

/**
 * Delete an entire academic record.
 */
export const removeAcademicRecord = async (id) => {
  const sql = 'DELETE FROM academic_records WHERE id = $1 RETURNING id';
  const { rows } = await query(sql, [id]);
  return rows.length > 0;
};

/**
 * Upsert term result.
 */
export const upsertTermResult = async (academicRecordId, termName, t) => {
  const sql = `
    INSERT INTO term_results (
      academic_record_id, term_name, total_marks, obtained_marks, percentage, grade, gpa, remarks, result_status
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9
    )
    ON CONFLICT (academic_record_id, term_name) DO UPDATE SET
      total_marks = EXCLUDED.total_marks,
      obtained_marks = EXCLUDED.obtained_marks,
      percentage = EXCLUDED.percentage,
      grade = EXCLUDED.grade,
      gpa = EXCLUDED.gpa,
      remarks = EXCLUDED.remarks,
      result_status = EXCLUDED.result_status,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  const params = [
    academicRecordId,
    termName,
    t.totalMarks,
    t.obtainedMarks,
    t.percentage,
    t.grade,
    t.gpa || null,
    t.remarks || null,
    t.resultStatus
  ];

  const { rows } = await query(sql, params);
  return rows[0];
};

/**
 * Clear existing subjects for a term result.
 */
export const clearSubjectMarks = async (termResultId) => {
  const sql = 'DELETE FROM subject_marks WHERE term_result_id = $1';
  await query(sql, [termResultId]);
};

/**
 * Insert subject marks.
 */
export const createSubjectMark = async (termResultId, s) => {
  const sql = `
    INSERT INTO subject_marks (
      term_result_id, subject_name, total_marks, obtained_marks, grade, gpa, status, remarks
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8
    )
    RETURNING *
  `;
  const params = [
    termResultId,
    s.subjectName,
    s.totalMarks,
    s.obtainedMarks,
    s.grade || null,
    s.gpa !== undefined ? s.gpa : null,
    s.status || null,
    s.remarks || null
  ];

  const { rows } = await query(sql, params);
  return rows[0];
};

/**
 * Recalculate rank positions for students in the same class, section, academic year, and term.
 */
export const recalculatePositions = async (academicYear, classVal, section, termName) => {
  const sql = `
    WITH ranked AS (
      SELECT tr.id,
             RANK() OVER (ORDER BY tr.obtained_marks DESC) as new_pos
      FROM term_results tr
      JOIN academic_records ar ON tr.academic_record_id = ar.id
      WHERE ar.academic_year = $1 AND ar.class = $2 AND ar.section = $3 AND tr.term_name = $4
    )
    UPDATE term_results tr
    SET position = r.new_pos
    FROM ranked r
    WHERE tr.id = r.id;
  `;
  await query(sql, [academicYear, classVal, section, termName]);
};

/**
 * Delete a term result for an academic record.
 */
export const removeTermResult = async (academicRecordId, termName) => {
  const sql = 'DELETE FROM term_results WHERE academic_record_id = $1 AND term_name = $2 RETURNING id';
  const { rows } = await query(sql, [academicRecordId, termName]);
  return rows.length > 0;
};
