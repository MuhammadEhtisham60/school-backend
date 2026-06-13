import { query } from '../../config/db.js';

/**
 * Find a user by their email address.
 * @param {string} email - User email.
 * @returns {Promise<object|null>} The user record or null if not found.
 */
export const getUserByEmail = async (email) => {
  const sql = 'SELECT * FROM users WHERE email = $1';
  const { rows } = await query(sql, [email]);
  return rows[0] || null;
};

/**
 * Insert a new user into the database.
 * @param {object} userData - User information.
 * @param {string} userData.firstName - First name.
 * @param {string} userData.lastName - Last name.
 * @param {string} userData.email - User email.
 * @param {string} userData.hashedPassword - Hashed password.
 * @returns {Promise<object>} The created user record.
 */
export const createUser = async ({ firstName, lastName, email, hashedPassword }) => {
  const sql = `
    INSERT INTO users (first_name, last_name, email, password)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const { rows } = await query(sql, [firstName, lastName, email, hashedPassword]);
  return rows[0];
};
