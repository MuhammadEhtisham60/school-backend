import { query } from '../../config/db.js';

/**
 * Retrieve active and non-deleted classes sorted by display order.
 * @returns {Promise<object[]>} Array of database rows.
 */
export const getClassesDropdown = async () => {
  const sql = `
    SELECT id, name 
    FROM classes 
    WHERE is_active = true AND is_deleted = false 
    ORDER BY display_order ASC
  `;
  const { rows } = await query(sql);
  return rows;
};

/**
 * Retrieve all non-deleted classes sorted by display order, including their subjects.
 * @returns {Promise<object[]>} Array of classes.
 */
export const getClassesList = async () => {
  const sql = `
    SELECT c.id, c.name, c.display_order as "displayOrder", c.is_active as "isActive", c.created_at, c.updated_at,
           COALESCE(
             JSON_AGG(cs.subject_name ORDER BY cs.id) FILTER (WHERE cs.subject_name IS NOT NULL), 
             '[]'::json
           ) as subjects
    FROM classes c
    LEFT JOIN class_subjects cs ON c.id = cs.class_id
    WHERE c.is_deleted = false
    GROUP BY c.id
    ORDER BY c.display_order ASC
  `;
  const { rows } = await query(sql);
  return rows;
};

/**
 * Retrieve a single class by ID, including its subjects.
 * @param {string} id - Class ID
 * @returns {Promise<object|null>} Class record or null if not found.
 */
export const getClassById = async (id) => {
  const sql = `
    SELECT c.id, c.name, c.display_order as "displayOrder", c.is_active as "isActive", c.is_deleted as "isDeleted", c.created_at, c.updated_at,
           COALESCE(
             JSON_AGG(cs.subject_name ORDER BY cs.id) FILTER (WHERE cs.subject_name IS NOT NULL), 
             '[]'::json
           ) as subjects
    FROM classes c
    LEFT JOIN class_subjects cs ON c.id = cs.class_id
    WHERE c.id = $1 AND c.is_deleted = false
    GROUP BY c.id
  `;
  const { rows } = await query(sql, [id]);
  return rows[0] || null;
};

/**
 * Get the current maximum display order to calculate the next index automatically.
 * @returns {Promise<number>} Max display order.
 */
export const getMaxDisplayOrder = async () => {
  const sql = 'SELECT MAX(display_order) as max FROM classes WHERE is_deleted = false';
  const { rows } = await query(sql);
  return rows[0]?.max || 0;
};

/**
 * Insert a new class.
 * @param {object} client - The DB client (for transaction).
 * @param {object} classData - Class data (id, name, displayOrder, isActive).
 * @returns {Promise<object>} The inserted database row.
 */
export const createClass = async (client, classData) => {
  const sql = `
    INSERT INTO classes (id, name, display_order, is_active)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, display_order as "displayOrder", is_active as "isActive"
  `;
  const params = [
    classData.id,
    classData.name,
    classData.displayOrder,
    classData.isActive !== undefined ? classData.isActive : true
  ];
  const { rows } = await client.query(sql, params);
  return rows[0];
};

/**
 * Update an existing class details.
 * @param {object} client - The DB client (for transaction).
 * @param {string} id - Class ID to update.
 * @param {object} classData - Fields to update (name, displayOrder, isActive).
 * @returns {Promise<object>} The updated database row.
 */
export const updateClass = async (client, id, classData) => {
  // Build dynamic UPDATE query
  const fields = [];
  const params = [id];
  let paramCount = 2;

  const mapping = {
    name: 'name',
    displayOrder: 'display_order',
    isActive: 'is_active'
  };

  for (const [key, dbCol] of Object.entries(mapping)) {
    if (classData[key] !== undefined) {
      fields.push(`${dbCol} = $${paramCount}`);
      params.push(classData[key]);
      paramCount++;
    }
  }

  if (fields.length === 0) {
    const { rows } = await client.query('SELECT id, name, display_order as "displayOrder", is_active as "isActive" FROM classes WHERE id = $1', [id]);
    return rows[0];
  }

  const sql = `
    UPDATE classes
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id, name, display_order as "displayOrder", is_active as "isActive"
  `;

  const { rows } = await client.query(sql, params);
  return rows[0];
};

/**
 * Soft delete a class by marking is_deleted = true.
 * @param {string} id - Class ID
 * @returns {Promise<boolean>} True if updated.
 */
export const softDeleteClass = async (id) => {
  const sql = 'UPDATE classes SET is_deleted = true, is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id';
  const { rows } = await query(sql, [id]);
  return rows.length > 0;
};

/**
 * Bulk insert subjects for a class.
 * @param {object} client - DB client.
 * @param {string} classId - Class ID.
 * @param {string[]} subjects - Array of subject names.
 */
export const addSubjectsToClass = async (client, classId, subjects) => {
  if (!subjects || subjects.length === 0) return;
  const values = [];
  const valuePlaceholders = [];
  let index = 1;
  for (const subject of subjects) {
    values.push(classId, subject.trim());
    valuePlaceholders.push(`($${index}, $${index + 1})`);
    index += 2;
  }
  const sql = `
    INSERT INTO class_subjects (class_id, subject_name)
    VALUES ${valuePlaceholders.join(', ')}
    ON CONFLICT (class_id, subject_name) DO NOTHING
  `;
  await client.query(sql, values);
};

/**
 * Remove all subjects for a class (used during update).
 * @param {object} client - DB client.
 * @param {string} classId - Class ID.
 */
export const clearSubjectsForClass = async (client, classId) => {
  const sql = 'DELETE FROM class_subjects WHERE class_id = $1';
  await client.query(sql, [classId]);
};

/**
 * Check if a class name exists (case insensitive, ignoring is_deleted).
 * @param {string} name - Class name.
 * @param {string} [excludeId] - Class ID to exclude from query (for updates).
 * @returns {Promise<boolean>} True if exists.
 */
export const checkClassNameExists = async (name, excludeId = null) => {
  let sql = 'SELECT id FROM classes WHERE LOWER(name) = LOWER($1) AND is_deleted = false';
  const params = [name];
  if (excludeId) {
    sql += ' AND id != $2';
    params.push(excludeId);
  }
  const { rows } = await query(sql, params);
  return rows.length > 0;
};
