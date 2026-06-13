# React.js Frontend Integration Guide - Auth & Profile Module

This guide details how to integrate the backend Authentication and Profile APIs with a React.js application.

---

## 1. HTTP Client Configuration (Axios)

First, set up a centralized Axios client that automatically appends the JWT bearer token to every request if it exists in local storage.

### `src/services/api.js`
```javascript
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
```

---

## 2. API Service Layer

Define the functions matching your backend API routes for clean importing.

### `src/services/authService.js`
```javascript
import API from './api';

export const signup = async (firstName, lastName, email, password, schoolName, address, contact, academicSession) => {
  const response = await API.post('/auth/signup', { firstName, lastName, email, password, schoolName, address, contact, academicSession });
  return response.data; // Returns { success, message, token, user }
};

export const login = async (email, password) => {
  const response = await API.post('/auth/login', { email, password });
  return response.data; // Returns { success, message, token, user }
};

export const getProfile = async () => {
  const response = await API.get('/profile');
  return response.data; // Returns { success, message, id, firstName, lastName, email, createdAt, updatedAt }
};

export const updateProfile = async (firstName, lastName) => {
  const response = await API.put('/profile', { firstName, lastName });
  return response.data; // Returns { success, message, id, firstName, lastName, email, createdAt, updatedAt }
};
```

---

## 3. Global Authentication Context & Provider

Manage the login state globally so components can access the logged-in user's details and trigger logout.

### `src/context/AuthContext.js`
```javascript
import React, { createContext, useState, useEffect, useContext } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profileData = await authService.getProfile();
          // Extract user fields from flat response
          setUser({
            id: profileData.id,
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            email: profileData.email,
            schoolName: profileData.schoolName,
            address: profileData.address,
            contact: profileData.contact,
            academicSession: profileData.academicSession,
          });
        } catch (error) {
          console.error('Invalid token, logging out...');
          handleLogout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const handleSignup = async (firstName, lastName, email, password, schoolName, address, contact, academicSession) => {
    const data = await authService.signup(firstName, lastName, email, password, schoolName, address, contact, academicSession);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  const handleLogin = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const handleUpdateProfile = async (firstName, lastName) => {
    const updatedUser = await authService.updateProfile(firstName, lastName);
    setUser({
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      schoolName: updatedUser.schoolName,
      address: updatedUser.address,
      contact: updatedUser.contact,
      academicSession: updatedUser.academicSession,
    });
    return updatedUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup: handleSignup,
        login: handleLogin,
        logout: handleLogout,
        updateProfile: handleUpdateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

## 4. Protected Route Wrapper (React Router v6)

Redirect unauthenticated users to the `/login` route.

### `src/components/ProtectedRoute.js`
```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading authentication state...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

---

## 5. Sample Integration Components

### Login Form Component (`src/components/Login.js`)
```javascript
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/profile'); // Redirect on success
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Invalid credentials.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '300px', margin: 'auto' }}>
      <h2>Login</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <button type="submit">Sign In</button>
    </form>
  );
};

export default Login;
```

### Profile Dashboard Component (`src/components/Profile.js`)
```javascript
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await updateProfile(firstName, lastName);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto' }}>
      <h2>User Profile</h2>
      {message && <div style={{ color: 'green' }}>{message}</div>}
      
      {!isEditing ? (
        <div>
          <p><strong>First Name:</strong> {user?.firstName}</p>
          <p><strong>Last Name:</strong> {user?.lastName}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        </div>
      ) : (
        <form onSubmit={handleSave}>
          <div>
            <label>First Name:</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <div>
            <label>Last Name:</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <p><strong>Email (Read Only):</strong> {user?.email}</p>
          <button type="submit">Save</button>
          <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
        </form>
      )}

      <hr />
      <button onClick={logout} style={{ backgroundColor: 'red', color: 'white' }}>
        Log Out
      </button>
    </div>
  );
};

export default Profile;
```
