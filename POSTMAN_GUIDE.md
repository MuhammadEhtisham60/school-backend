# Postman Testing Guide - Auth & Profile APIs

This guide explains how to test the Authentication and Profile APIs using Postman.

## 1. Setup & Environment

1. **Start the server**: Ensure the backend is running.
   ```bash
   npm run dev
   ```
   *Note: If the server fails to connect to the database, open the [.env](file:///c:/Users/l/Documents/school-backend/.env) file and update `DB_PASSWORD` with your PostgreSQL password.*

2. **Base URL**: All endpoints are prefixed with:
   `http://localhost:5000/api`

---

## 2. API Endpoints Reference

### 1. Signup (Register a new user)
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/auth/signup`
* **Body (raw JSON)**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "mySecurePassword123"
  }
  ```
* **Postman Setup**:
  1. Open a new tab in Postman.
  2. Set the method to **POST** and enter the URL.
  3. Go to the **Body** tab, select **raw**, and set the format to **JSON**.
  4. Paste the JSON payload above and click **Send**.
* **Expected Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "token": "YOUR_JWT_TOKEN_HERE",
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "createdAt": "2026-06-13T20:25:00.000Z",
      "updatedAt": "2026-06-13T20:25:00.000Z"
    }
  }
  ```

---

### 2. Login (Authenticate user)
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/auth/login`
* **Body (raw JSON)**:
  ```json
  {
    "email": "john.doe@example.com",
    "password": "mySecurePassword123"
  }
  ```
* **Postman Setup**:
  1. Set the method to **POST** and enter the URL.
  2. Go to the **Body** tab, select **raw**, set format to **JSON**.
  3. Paste the credentials and click **Send**.
* **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "YOUR_JWT_TOKEN_HERE",
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "createdAt": "2026-06-13T20:25:00.000Z",
      "updatedAt": "2026-06-13T20:25:00.000Z"
    }
  }
  ```
* **Action**: Copy the value of `"token"` from the response to use in the subsequent protected routes.

---

### 3. Get Profile (Retrieve logged-in user profile)
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/profile`
* **Postman Authorization Setup**:
  1. Set the method to **GET** and enter the URL.
  2. Go to the **Authorization** tab.
  3. Select **Type**: **Bearer Token**.
  4. Paste the JWT token you copied from the Login/Signup response into the **Token** field.
  5. Click **Send**.
* **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Profile retrieved successfully",
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "createdAt": "2026-06-13T20:25:00.000Z",
    "updatedAt": "2026-06-13T20:25:00.000Z"
  }
  ```

---

### 4. Update Profile (Update first & last name)
* **Method**: `PUT`
* **URL**: `http://localhost:5000/api/profile`
* **Body (raw JSON)**:
  ```json
  {
    "firstName": "Johnny",
    "lastName": "Smith"
  }
  ```
* **Postman Setup**:
  1. Set the method to **PUT** and enter the URL.
  2. Go to the **Authorization** tab. Select **Bearer Token** and paste the JWT token.
  3. Go to the **Body** tab, select **raw**, set format to **JSON**.
  4. Paste the JSON update payload above and click **Send**.
* **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "id": 1,
    "firstName": "Johnny",
    "lastName": "Smith",
    "email": "john.doe@example.com",
    "createdAt": "2026-06-13T20:25:00.000Z",
    "updatedAt": "2026-06-13T20:26:00.000Z"
  }
  ```

---

## 3. Testing Error Scenarios

* **Missing Token**: Attempt to access `GET /api/profile` without the Bearer token. You should receive a `401 Unauthorized` status code.
* **Invalid Input**: Attempt to Signup with a password shorter than 6 characters or a malformed email. You should receive a `400 Bad Request` status code with validation error messages.
* **Duplicate Email**: Attempt to Signup with an email that is already registered. You should receive a `400 Bad Request` stating the email is already registered.
