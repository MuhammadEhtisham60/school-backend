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
