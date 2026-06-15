import { query } from '../../config/db.js';

/**
 * Insert a new fee record.
 * @param {object} f - Fee details.
 * @returns {Promise<object>} The inserted database row.
 */
export const create = async (f) => {
  const sql = `
    INSERT INTO fees (
      student_id, month, amount, payment_date, payment_method, status, remarks, created_by
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8
    )
    RETURNING *
  `;
  const params = [
    f.studentId,
    f.month,
    f.amount,
    f.paymentDate,
    f.paymentMethod,
    f.status || 'Paid',
    f.remarks || null,
    f.createdBy || null
  ];

  const { rows } = await query(sql, params);
  return rows[0];
};

/**
 * Retrieve a fee by studentId and month (to check for duplicates).
 * @param {string} studentId
 * @param {string} month
 * @returns {Promise<object|null>} The matching fee record, or null.
 */
export const findByStudentAndMonth = async (studentId, month) => {
  const sql = 'SELECT * FROM fees WHERE student_id = $1 AND month = $2';
  const { rows } = await query(sql, [studentId, month]);
  return rows[0] || null;
};

/**
 * Retrieve a single fee record by its ID, with populated student info.
 * @param {number|string} id
 * @returns {Promise<object|null>} Populated fee record, or null.
 */
export const findById = async (id) => {
  const sql = `
    SELECT f.*, s.full_name, s.roll_no, s.class, s.section
    FROM fees f
    LEFT JOIN students s ON f.student_id = s.id
    WHERE f.id = $1
  `;
  const { rows } = await query(sql, [id]);
  return rows[0] || null;
};

/**
 * Retrieve all fees with optional filters, search, and pagination.
 * @param {object} filters
 * @returns {Promise<object[]>} Array of populated fee rows, with total_count in each row.
 */
export const findAll = async (filters = {}) => {
  const { search, month, status, limit = 10, offset = 0 } = filters;

  let sql = `
    SELECT f.*, s.full_name, s.roll_no, s.class, s.section, count(*) OVER() as total_count
    FROM fees f
    LEFT JOIN students s ON f.student_id = s.id
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 1;

  if (search) {
    sql += ` AND s.full_name ILIKE $${paramCount}`;
    params.push(`%${search}%`);
    paramCount++;
  }

  if (month) {
    sql += ` AND f.month = $${paramCount}`;
    params.push(month);
    paramCount++;
  }

  if (status) {
    sql += ` AND f.status = $${paramCount}`;
    params.push(status);
    paramCount++;
  }

  sql += ` ORDER BY f.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const { rows } = await query(sql, params);
  return rows;
};

/**
 * Retrieve all fees of a specific student, sorted by payment date / created date.
 * @param {string} studentId
 * @returns {Promise<object[]>} Array of populated fee rows.
 */
export const findByStudentId = async (studentId) => {
  const sql = `
    SELECT f.*, s.full_name, s.roll_no, s.class, s.section
    FROM fees f
    LEFT JOIN students s ON f.student_id = s.id
    WHERE f.student_id = $1
    ORDER BY f.payment_date DESC, f.created_at DESC
  `;
  const { rows } = await query(sql, [studentId]);
  return rows;
};

/**
 * Update a fee record dynamically.
 * @param {number|string} id - Fee record ID.
 * @param {object} f - Updatable fields.
 * @returns {Promise<object|null>} The updated fee record, or null.
 */
export const update = async (id, f) => {
  const fields = [];
  const params = [id];
  let paramCount = 2;

  const mapping = {
    amount: 'amount',
    paymentDate: 'payment_date',
    paymentMethod: 'payment_method',
    status: 'status',
    remarks: 'remarks'
  };

  for (const [key, dbCol] of Object.entries(mapping)) {
    if (f[key] !== undefined) {
      fields.push(`${dbCol} = $${paramCount}`);
      params.push(f[key]);
      paramCount++;
    }
  }

  if (fields.length === 0) {
    return findById(id);
  }

  const sql = `
    UPDATE fees
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;

  const { rows } = await query(sql, params);
  return rows[0] || null;
};

/**
 * Delete a fee record.
 * @param {number|string} id
 * @returns {Promise<boolean>} True if deleted, false if not found.
 */
export const remove = async (id) => {
  const sql = 'DELETE FROM fees WHERE id = $1 RETURNING id';
  const { rows } = await query(sql, [id]);
  return rows.length > 0;
};
