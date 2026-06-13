import crypto from 'crypto';
import * as authRepository from './auth.repository.js';
import { hashPassword, comparePassword } from '../../utils/bcrypt.js';
import { generateToken } from '../../utils/jwt.js';
import { sendEmail } from '../../utils/email.js';

/**
 * Custom error helper
 */
const createError = (message, status) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

/**
 * Format database user record (snake_case) to client response structure (camelCase)
 */
const formatUser = (user) => ({
  id: user.id,
  firstName: user.first_name,
  lastName: user.last_name,
  email: user.email,
  schoolName: user.school_name,
  address: user.address,
  contact: user.contact,
  academicSession: user.academic_session,
  createdAt: user.created_at,
  updatedAt: user.updated_at
});

/**
 * Register a new user.
 */
export const signup = async (userData) => {
  const { firstName, lastName, email, password, schoolName, address, contact, academicSession } = userData;

  // Verify unique email
  const existingUser = await authRepository.getUserByEmail(email);
  if (existingUser) {
    throw createError('Email is already registered.', 400);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Save to database
  const user = await authRepository.createUser({
    firstName,
    lastName,
    email,
    hashedPassword,
    schoolName,
    address,
    contact,
    academicSession
  });

  // Generate token
  const token = generateToken({ id: user.id, email: user.email });

  return {
    token,
    user: formatUser(user)
  };
};

/**
 * Login user and authenticate credentials.
 */
export const login = async ({ email, password }) => {
  // Find user
  const user = await authRepository.getUserByEmail(email);
  if (!user) {
    throw createError('Invalid email or password.', 401);
  }

  // Compare passwords
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw createError('Invalid email or password.', 401);
  }

  // Generate token
  const token = generateToken({ id: user.id, email: user.email });

  return {
    token,
    user: formatUser(user)
  };
};

/**
 * Initiate password reset by generating and sending a 6-digit OTP.
 */
export const forgotPassword = async (email) => {
  const user = await authRepository.getUserByEmail(email);
  if (!user) {
    throw createError('User with this email does not exist.', 404);
  }

  // Generate secure 6-digit numeric OTP
  const otp = crypto.randomInt(100000, 1000000).toString();
  
  // Set expiry to 5 minutes from now
  const expiry = new Date(Date.now() + 5 * 60 * 1000);

  // Save to database
  await authRepository.updateResetOtp(email, otp, expiry);

  // Send email containing the OTP
  const subject = 'Password Reset OTP';
  const text = `Hello,\n\nYou requested a password reset. Your 6-digit OTP code is: ${otp}.\n\nThis OTP will expire in 5 minutes. Please do not share this code with anyone.\n\nIf you did not request this, you can ignore this email.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
      <p>Hello,</p>
      <p>You requested a password reset. Use the following 6-digit OTP code to complete the process:</p>
      <div style="text-align: center; margin: 20px 0;">
        <span style="font-size: 24px; font-weight: bold; background: #f4f4f4; padding: 10px 20px; border-radius: 5px; letter-spacing: 5px; display: inline-block;">${otp}</span>
      </div>
      <p>This OTP is valid for exactly <strong>5 minutes</strong>. For security reasons, please do not share this OTP with anyone.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777; text-align: center;">This is an automated message, please do not reply.</p>
    </div>
  `;

  await sendEmail({ to: email, subject, text, html });
  return { email };
};

/**
 * Verify if the OTP matches and has not expired.
 */
export const verifyOtp = async (email, otp) => {
  const user = await authRepository.getUserByEmail(email);
  if (!user) {
    throw createError('User with this email does not exist.', 404);
  }

  if (user.reset_otp !== otp) {
    throw createError('Invalid OTP.', 400);
  }

  if (!user.reset_otp_expiry || new Date(user.reset_otp_expiry) < new Date()) {
    throw createError('OTP has expired.', 400);
  }

  return { email, verified: true };
};

/**
 * Resend a new OTP, invalidating the previous one.
 */
export const resendOtp = async (email) => {
  const user = await authRepository.getUserByEmail(email);
  if (!user) {
    throw createError('User with this email does not exist.', 404);
  }

  // Generate new OTP
  const otp = crypto.randomInt(100000, 1000000).toString();
  const expiry = new Date(Date.now() + 5 * 60 * 1000);

  // Update in DB (overwriting previous)
  await authRepository.updateResetOtp(email, otp, expiry);

  // Send email containing the OTP
  const subject = 'Resent: Password Reset OTP';
  const text = `Hello,\n\nHere is your new 6-digit OTP code for password reset: ${otp}.\n\nThis OTP will expire in 5 minutes. Please do not share this code with anyone.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #333; text-align: center;">New Password Reset OTP</h2>
      <p>Hello,</p>
      <p>Here is your new 6-digit OTP code to reset your password:</p>
      <div style="text-align: center; margin: 20px 0;">
        <span style="font-size: 24px; font-weight: bold; background: #f4f4f4; padding: 10px 20px; border-radius: 5px; letter-spacing: 5px; display: inline-block;">${otp}</span>
      </div>
      <p>This OTP is valid for exactly <strong>5 minutes</strong>. Please do not share this OTP with anyone.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777; text-align: center;">This is an automated message, please do not reply.</p>
    </div>
  `;

  await sendEmail({ to: email, subject, text, html });
  return { email };
};

/**
 * Reset user password. Verify OTP, match confirmation, hash password, and save.
 */
export const resetPassword = async ({ email, otp, password, confirmPassword }) => {
  if (password !== confirmPassword) {
    throw createError('Passwords do not match.', 400);
  }

  // Check OTP validity before permitting password change
  await verifyOtp(email, otp);

  // Hash the new password using bcrypt utility
  const hashedPassword = await hashPassword(password);

  // Update password and clear OTP/expiry atomically
  await authRepository.updatePasswordAndClearOtp(email, hashedPassword);

  return { email };
};
