/**
 * Send a standardized success API response.
 * @param {object} res - Express response object.
 * @param {string} message - Response message.
 * @param {object} data - Data to include in the response.
 * @param {number} statusCode - HTTP status code (default: 200).
 */
export const sendSuccess = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data
  });
};

/**
 * Send a standardized error API response.
 * @param {object} res - Express response object.
 * @param {string} message - Error message.
 * @param {number} statusCode - HTTP status code (default: 500).
 * @param {any} [errors] - Optional detailed validation or system errors.
 */
export const sendError = (res, message, statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors })
  });
};
