# Backend Authentication & Profile Module

## Tech Stack

Build the backend using:

* Node.js
* Express.js
* PostgreSQL
* JWT Authentication
* bcrypt for password hashing

---

# Database Configuration

Use the following PostgreSQL database:

* **Database Name:** `edu-school`
* **Host:** `localhost`
* **Port:** `5432`
* **Username:** `postgres`

Store all database credentials and secrets inside a `.env` file.

---

# Project Structure

Create a clean and scalable project structure:

```text
src/
│
├── config/
│   └── db.js
│
├── modules/
│   ├── auth/
│   │   ├── auth.controller.js
│   │   ├── auth.service.js
│   │   ├── auth.repository.js
│   │   ├── auth.routes.js
│   │   └── auth.validation.js
│   │
│   └── profile/
│       ├── profile.controller.js
│       ├── profile.service.js
│       ├── profile.repository.js
│       └── profile.routes.js
│
├── middleware/
│   ├── auth.middleware.js
│   └── error.middleware.js
│
├── utils/
│   ├── jwt.js
│   ├── bcrypt.js
│   └── response.js
│
├── app.js
└── server.js
```

---

# Database Schema

Create a `users` table with the following fields:

| Column     | Type                       |
| ---------- | -------------------------- |
| id         | Auto Increment Primary Key |
| first_name | VARCHAR                    |
| last_name  | VARCHAR                    |
| email      | VARCHAR (Unique)           |
| password   | VARCHAR (Hashed)           |
| created_at | TIMESTAMP                  |
| updated_at | TIMESTAMP                  |

---

# Authentication Module

Create a complete **Auth** module.

## 1. Signup API

### Endpoint

```http
POST /api/auth/signup
```

### Request Body

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "12345678"
}
```

### Requirements

* Validate all input fields.
* `email` must be unique.
* Hash the password using **bcrypt** before saving.
* Save the user into PostgreSQL.
* Generate a JWT token after successful signup.
* Return:

  * Success message
  * JWT token
  * User details (excluding password)

---

## 2. Login API

### Endpoint

```http
POST /api/auth/login
```

### Request Body

```json
{
  "email": "john@example.com",
  "password": "12345678"
}
```

### Requirements

* Verify the email exists.
* Compare the password using bcrypt.
* Return JWT token on successful login.
* Return appropriate error messages for invalid credentials.

---

# Profile Module

Create a separate **Profile** module.

---

## 1. Get Profile API

### Endpoint

```http
GET /api/profile
```

### Requirements

* Protected route using JWT authentication.
* Return the logged-in user's profile.
* Do **not** return the password.

### Example Response

```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

## 2. Update Profile API

### Endpoint

```http
PUT /api/profile
```

### Request Body

```json
{
  "firstName": "Johnny",
  "lastName": "Smith"
}
```

### Requirements

* Protected route using JWT authentication.
* Allow updating only:

  * `firstName`
  * `lastName`
* Do **not** allow updating:

  * Email
  * Password
* Return the updated profile.

---

# General Requirements

* Follow **Controller → Service → Repository** architecture.
* Use **Express Router**.
* Use **async/await** throughout the project.
* Use **parameterized SQL queries** to prevent SQL injection.
* Implement proper request validation.
* Implement centralized error handling middleware.
* Use JWT authentication for protected routes.
* Hash passwords using bcrypt.
* Keep all secrets and configuration in `.env`.
* Return consistent API responses for success and errors.
* Write clean, modular, scalable, and production-ready code following best practices.

---

# Expected APIs

| Method | Endpoint           | Description                  |
| ------ | ------------------ | ---------------------------- |
| POST   | `/api/auth/signup` | Register a new user          |
| POST   | `/api/auth/login`  | Login user                   |
| GET    | `/api/profile`     | Get logged-in user's profile |
| PUT    | `/api/profile`     | Update first and last name   |
