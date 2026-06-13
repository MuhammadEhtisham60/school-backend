import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Send an email using SMTP or fallback to console logging if credentials are not configured.
 * @param {object} options - Mail options.
 * @param {string} options.to - Recipient email.
 * @param {string} options.subject - Email subject.
 * @param {string} options.text - Plain text content.
 * @param {string} options.html - HTML content.
 * @returns {Promise<boolean>} Resolves to true if sent (or logged), rejects on error.
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || 'no-reply@edu-school.com';

  if (!host || !user || !pass) {
    console.log('\n==================================================');
    console.log('📬  [EMAIL UTILITY] SMTP Credentials not fully configured.');
    console.log('📬  Printing email to console in developer mode:');
    console.log(`📬  TO:      ${to}`);
    console.log(`📬  FROM:    ${from}`);
    console.log(`📬  SUBJECT: ${subject}`);
    console.log('📬  BODY (TEXT):');
    console.log(text);
    console.log('==================================================\n');
    return true;
  }

  const transporter = nodemailer.createTransport({
    host,
    port: parseInt(port || '587', 10),
    secure: port === '465', // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });

  const mailOptions = {
    from,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL UTILITY] Email successfully sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL UTILITY] Error sending email to ${to}:`, error);
    throw error;
  }
};
