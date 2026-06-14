# React.js Frontend Integration Guide - Forgot Password Flow

This guide details how to integrate the backend Forgot Password, Verify OTP, Resend OTP, and Reset Password APIs with a React.js application.

---

## 1. API Service Layer

Add the following API functions to your authentication service file to communicate with the forgot password endpoints.

### `src/services/authService.js`
```javascript
import API from './api';

/**
 * Step 1: Request a password reset OTP code
 * @param {string} email - Registered email address.
 * @returns {Promise<object>} Returns { success, message }
 */
export const forgotPassword = async (email) => {
  const response = await API.post('/auth/forgot-password', { email });
  return response.data;
};

/**
 * Step 2: Verify the received OTP
 * @param {string} email - User email address.
 * @param {string} otp - 6-digit numeric OTP.
 * @returns {Promise<object>} Returns { success, message, email, verified }
 */
export const verifyOtp = async (email, otp) => {
  const response = await API.post('/auth/verify-otp', { email, otp });
  return response.data;
};

/**
 * Step 2b: Resend a new OTP code if expired/lost
 * @param {string} email - User email address.
 * @returns {Promise<object>} Returns { success, message }
 */
export const resendOtp = async (email) => {
  const response = await API.post('/auth/resend-otp', { email });
  return response.data;
};

/**
 * Step 3: Reset the password to a new value
 * @param {string} email - User email address.
 * @param {string} otp - 6-digit verified OTP.
 * @param {string} password - New password.
 * @param {string} confirmPassword - Confirmation of new password.
 * @returns {Promise<object>} Returns { success, message }
 */
export const resetPassword = async (email, otp, password, confirmPassword) => {
  const response = await API.post('/auth/reset-password', {
    email,
    otp,
    password,
    confirmPassword,
  });
  return response.data;
};
```

---

## 2. Recommended Frontend Flow Structure

We recommend separating the forgot password journey into three logical steps using a state machine (single route with multiple step renders) or separate sub-routes.

Here is a full integration example using a single component managed by state:

### `src/pages/auth/ForgotPasswordFlow.jsx`
```javascript
import React, { useState, useEffect } from 'react';
import * as authService from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const STEPS = {
  REQUEST: 'REQUEST',
  VERIFY: 'VERIFY',
  RESET: 'RESET'
};

const ForgotPasswordFlow = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.REQUEST);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Timer for resend cooldown (5 minutes / 300 seconds)
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle Step 1: Submit Email
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setMessage('A 6-digit OTP code has been sent to your email.');
      setStep(STEPS.VERIFY);
      setCountdown(300); // Start 5-minute cooldown
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await authService.verifyOtp(email, otp);
      setMessage('OTP verified successfully. Please enter your new password.');
      setStep(STEPS.RESET);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await authService.resendOtp(email);
      setMessage('A new OTP code has been sent to your email.');
      setCountdown(300); // Reset cooldown
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await authService.resetPassword(email, otp, password, confirmPassword);
      alert('Password updated successfully. Redirecting to login page...');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      {message && <div style={{ color: 'green', marginBottom: '10px' }}>{message}</div>}

      {step === STEPS.REQUEST && (
        <form onSubmit={handleRequestOtp}>
          <h2>Forgot Password</h2>
          <p>Enter your registered email address to receive a 6-digit OTP code.</p>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {loading ? 'Sending...' : 'Send OTP Code'}
          </button>
        </form>
      )}

      {step === STEPS.VERIFY && (
        <form onSubmit={handleVerifyOtp}>
          <h2>Verify OTP Code</h2>
          <p>We've sent a code to <strong>{email}</strong>. It will expire in 5 minutes.</p>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>6-Digit OTP</label>
            <input 
              type="text" 
              maxLength="6"
              value={otp} 
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
              required 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', letterSpacing: '4px', textAlign: 'center', fontSize: '18px' }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '10px' }}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          
          <button 
            type="button" 
            onClick={handleResendOtp}
            disabled={countdown > 0 || loading}
            style={{ width: '100%', padding: '10px', background: 'none', color: countdown > 0 ? '#aaa' : '#007bff', border: '1px solid #ddd', borderRadius: '4px', cursor: countdown > 0 ? 'not-allowed' : 'pointer' }}
          >
            {countdown > 0 ? `Resend OTP in ${Math.floor(countdown / 60)}:${('0' + (countdown % 60)).slice(-2)}` : 'Resend OTP'}
          </button>
        </form>
      )}

      {step === STEPS.RESET && (
        <form onSubmit={handleResetPassword}>
          <h2>Reset Password</h2>
          <p>Set a new, secure password for your account.</p>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>New Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordFlow;
```

---

## 3. Best Practices & Security Hints

* **Numeric OTPs Only**: Frontend numeric filtering (`value.replace(/\D/g, '')`) ensures users only enter valid integer sequences.
* **OTP Erasure on Success**: Once a password has been reset successfully, any attempts to call the verification/reset routes again with the same OTP will yield a `400 Bad Request` validation error, confirming that the token has been successfully discarded on the server.
* **Resend Cooldown**: Prevent request spamming by displaying a timer button cooldown (e.g. 5 minutes countdown) matched with the server-side expiration of OTP keys.
