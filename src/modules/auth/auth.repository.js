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
export const createUser = async ({ firstName, lastName, email, hashedPassword, schoolName, address, contact, academicSession }) => {
  const sql = `
    INSERT INTO users (first_name, last_name, email, password, school_name, address, contact, academic_session)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  const { rows } = await query(sql, [
    firstName,
    lastName,
    email,
    hashedPassword,
    schoolName,
    address,
    contact,
    academicSession
  ]);
  return rows[0];
};

/**
 * Update reset OTP and expiry for a user.
 * @param {string} email - User email.
 * @param {string} otp - The 6-digit OTP code.
 * @param {Date} expiry - The expiry timestamp.
 * @returns {Promise<object>} The updated user record.
 */
export const updateResetOtp = async (email, otp, expiry) => {
  const sql = `
    UPDATE users
    SET reset_otp = $1, reset_otp_expiry = $2
    WHERE email = $3
    RETURNING *
  `;
  const { rows } = await query(sql, [otp, expiry, email]);
  return rows[0] || null;
};

/**
 * Clear reset OTP and expiry for a user.
 * @param {string} email - User email.
 * @returns {Promise<object>} The updated user record.
 */
export const clearResetOtp = async (email) => {
  const sql = `
    UPDATE users
    SET reset_otp = NULL, reset_otp_expiry = NULL
    WHERE email = $1
    RETURNING *
  `;
  const { rows } = await query(sql, [email]);
  return rows[0] || null;
};

/**
 * Update user's password and clear OTP/expiry.
 * @param {string} email - User email.
 * @param {string} hashedPassword - Hashed password.
 * @returns {Promise<object>} The updated user record.
 */
export const updatePasswordAndClearOtp = async (email, hashedPassword) => {
  const sql = `
    UPDATE users
    SET password = $1, reset_otp = NULL, reset_otp_expiry = NULL
    WHERE email = $2
    RETURNING *
  `;
  const { rows } = await query(sql, [hashedPassword, email]);
  return rows[0] || null;
};
