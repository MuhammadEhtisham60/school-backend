import { query } from '../../config/db.js';

/**
 * Retrieve user by primary key ID.
 * @param {number|string} id - User ID.
 * @returns {Promise<object|null>} The user record or null if not found.
 */
export const getUserById = async (id) => {
  const sql = 'SELECT * FROM users WHERE id = $1';
  const { rows } = await query(sql, [id]);
  return rows[0] || null;
};

/**
 * Update user first and last name.
 * @param {number|string} id - User ID.
 * @param {object} updateData - Data to update.
 * @param {string} updateData.firstName - Updated first name.
 * @param {string} updateData.lastName - Updated last name.
 * @returns {Promise<object>} The updated user record.
 */
export const updateUserById = async (id, { firstName, lastName }) => {
  const sql = `
    UPDATE users
    SET first_name = $1, last_name = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *
  `;
  const { rows } = await query(sql, [firstName, lastName, id]);
  return rows[0];
};
