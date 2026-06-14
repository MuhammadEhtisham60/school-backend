import { query } from '../../config/db.js';

/**
 * Insert a new student record.
 * @param {object} s - Student fields (camelCase keys map to snake_case db columns).
 * @returns {Promise<object>} The inserted database row.
 */
export const createStudent = async (s) => {
  const sql = `
    INSERT INTO students (
      id, full_name, father_name, dob, gender, roll_no, cnic, photo, class, section,
      prev_school, last_result, admission_date, mobile, alt_contact, email, city, address,
      father_full_name, father_cnic, occupation, father_phone, mother_name, mother_phone,
      blood, emergency, medical, disability, transport, bus_route, hostel,
      student_photo, b_form_copy, prev_result_card, guardian_cnic
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18,
      $19, $20, $21, $22, $23, $24,
      $25, $26, $27, $28, $29, $30, $31,
      $32, $33, $34, $35
    )
    RETURNING *
  `;

  const params = [
    s.id, s.fullName, s.fatherName, s.dob, s.gender, s.rollNo, s.cnic, s.photo, s.class, s.section,
    s.prevSchool, s.lastResult, s.admissionDate, s.mobile, s.altContact, s.email, s.city, s.address,
    s.fatherFullName, s.fatherCNIC, s.occupation, s.fatherPhone, s.motherName, s.motherPhone,
    s.blood, s.emergency, s.medical, s.disability, s.transport, s.busRoute, s.hostel,
    s.studentPhoto, s.bFormCopy, s.prevResultCard, s.guardianCnic
  ];

  const { rows } = await query(sql, params);
  return rows[0];
};

/**
 * Retrieve a list of students with optional search/filter logic.
 * @param {object} filters - Filtering options (e.g. search, class, section, limit, offset).
 * @returns {Promise<object[]>} Array of database rows.
 */
export const getStudentsList = async (filters = {}) => {
  const { search, class: classFilter, section, limit = 100, offset = 0 } = filters;
  
  let sql = 'SELECT * FROM students WHERE 1=1';
  const params = [];
  let paramCount = 1;

  if (search) {
    sql += ` AND (full_name ILIKE $${paramCount} OR roll_no ILIKE $${paramCount} OR id ILIKE $${paramCount})`;
    params.push(`%${search}%`);
    paramCount++;
  }

  if (classFilter) {
    sql += ` AND class = $${paramCount}`;
    params.push(classFilter);
    paramCount++;
  }

  if (section) {
    sql += ` AND section = $${paramCount}`;
    params.push(section);
    paramCount++;
  }

  sql += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const { rows } = await query(sql, params);
  return rows;
};

/**
 * Retrieve a single student by primary key ID.
 * @param {string} id - The custom student ID.
 * @returns {Promise<object|null>} Student record or null if not found.
 */
export const getStudentById = async (id) => {
  const sql = 'SELECT * FROM students WHERE id = $1';
  const { rows } = await query(sql, [id]);
  return rows[0] || null;
};

/**
 * Update an existing student record dynamically.
 * @param {string} id - The student ID.
 * @param {object} s - Fields to update.
 * @returns {Promise<object|null>} The updated student record or null if not found.
 */
export const updateStudent = async (id, s) => {
  // Build dynamic UPDATE query
  const fields = [];
  const params = [id];
  let paramCount = 2;

  const mapping = {
    fullName: 'full_name',
    fatherName: 'father_name',
    dob: 'dob',
    gender: 'gender',
    rollNo: 'roll_no',
    cnic: 'cnic',
    photo: 'photo',
    class: 'class',
    section: 'section',
    prevSchool: 'prev_school',
    lastResult: 'last_result',
    admissionDate: 'admission_date',
    mobile: 'mobile',
    altContact: 'alt_contact',
    email: 'email',
    city: 'city',
    address: 'address',
    fatherFullName: 'father_full_name',
    fatherCNIC: 'father_cnic',
    occupation: 'occupation',
    fatherPhone: 'father_phone',
    motherName: 'mother_name',
    motherPhone: 'mother_phone',
    blood: 'blood',
    emergency: 'emergency',
    medical: 'medical',
    disability: 'disability',
    transport: 'transport',
    busRoute: 'bus_route',
    hostel: 'hostel',
    studentPhoto: 'student_photo',
    bFormCopy: 'b_form_copy',
    prevResultCard: 'prev_result_card',
    guardianCnic: 'guardian_cnic'
  };

  for (const [key, dbCol] of Object.entries(mapping)) {
    if (s[key] !== undefined) {
      fields.push(`${dbCol} = $${paramCount}`);
      params.push(s[key]);
      paramCount++;
    }
  }

  if (fields.length === 0) {
    // Nothing to update, just fetch
    return getStudentById(id);
  }

  const sql = `
    UPDATE students
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;

  const { rows } = await query(sql, params);
  return rows[0] || null;
};

/**
 * Delete a student by ID.
 * @param {string} id - Student ID.
 * @returns {Promise<boolean>} True if deleted, false if not found.
 */
export const deleteStudent = async (id) => {
  const sql = 'DELETE FROM students WHERE id = $1 RETURNING id';
  const { rows } = await query(sql, [id]);
  return rows.length > 0;
};
