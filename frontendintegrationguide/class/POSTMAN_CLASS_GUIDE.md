# Postman Testing Guide - Class CRUD APIs

This guide explains how to test the Class CRUD and Subject Association APIs using Postman.

## 1. Setup & Environment

1. **Start the server**: Ensure the backend is running.
   ```bash
   npm run dev
   ```
2. **Base URL**: All Class endpoints are prefixed with:
   `http://localhost:5000/api/classes`
3. **Authentication**: All routes are protected. You MUST provide a Bearer JWT Token in the headers:
   - Go to the **Authorization** tab in Postman.
   - Select **Type**: **Bearer Token**.
   - Paste the JWT token (which you can get by logging in or registering a user via the Auth APIs).

---

## 2. API Endpoints Reference

### 1. List All Classes
Retrieve all non-deleted classes, along with their associated subjects.
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/classes`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Classes list retrieved successfully",
    "data": [
      {
        "id": "1",
        "name": "Class 1",
        "displayOrder": 3,
        "isActive": true,
        "subjects": ["Mathematics", "English", "General Science"]
      },
      {
        "id": "2",
        "name": "Class 2",
        "displayOrder": 4,
        "isActive": true,
        "subjects": ["Mathematics", "English", "General Knowledge"]
      }
    ]
  }
  ```

---

### 2. Get Classes Dropdown
Retrieve a minimal list of active and non-deleted classes sorted by display order (primarily used to populate dropdown select boxes).
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/classes/dropdown`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Classes dropdown list retrieved successfully",
    "data": [
      {
        "_id": "1",
        "name": "Class 1"
      },
      {
        "_id": "2",
        "name": "Class 2"
      }
    ]
  }
  ```

---

### 3. Get Class Details
Retrieve the details of a specific class including its subjects list.
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/classes/:id`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Postman Setup**: Replace `:id` with the actual class ID (e.g. `1` or `nursery`).
- **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Class details retrieved successfully",
    "data": {
      "id": "1",
      "name": "Class 1",
      "displayOrder": 3,
      "isActive": true,
      "subjects": ["Mathematics", "English", "General Science"]
    }
  }
  ```

---

### 4. Create Class
Add a new class and assign subjects.
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/classes`
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body (raw JSON)**:
  ```json
  {
    "name": "Class 13",
    "displayOrder": 15,
    "isActive": true,
    "subjects": ["Advanced Algebra", "Computer Science", "Physics"]
  }
  ```
  *(Note: If `id` is not supplied, it will be automatically generated as `13` slugified. You can optionally pass `"id": "custom-id"` in the body).*

- **Expected Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Class created successfully",
    "data": {
      "id": "13",
      "name": "Class 13",
      "displayOrder": 15,
      "isActive": true,
      "subjects": ["Advanced Algebra", "Computer Science", "Physics"]
    }
  }
  ```

---

### 5. Update Class Details
Modify an existing class's fields or replace its subjects list.
- **Method**: `PUT`
- **URL**: `http://localhost:5000/api/classes/:id`
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Postman Setup**: Replace `:id` with the class ID to update (e.g., `13`).
- **Body (raw JSON)**:
  ```json
  {
    "name": "Class 13 Senior",
    "displayOrder": 15,
    "isActive": true,
    "subjects": ["Discrete Mathematics", "Data Structures", "Physics"]
  }
  ```
- **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Class updated successfully",
    "data": {
      "id": "13",
      "name": "Class 13 Senior",
      "displayOrder": 15,
      "isActive": true,
      "subjects": ["Discrete Mathematics", "Data Structures", "Physics"]
    }
  }
  ```

---

### 6. Delete (Remove) Class
Soft delete a class by marking it as deleted.
- **Method**: `DELETE`
- **URL**: `http://localhost:5000/api/classes/:id`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Postman Setup**: Replace `:id` with the class ID to remove (e.g. `13`).
- **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Class deleted successfully"
  }
  ```

---

## 3. Testing Error Scenarios

- **Unauthorized (401)**: Request any route without the `Authorization` header.
- **Validation Failed (400)**: Send a POST request without the `name` field:
  ```json
  {
    "isActive": true
  }
  ```
  Response:
  ```json
  {
    "success": false,
    "message": "Validation failed",
    "errors": {
      "name": "Class name is required"
    }
  }
  ```
- **Class Not Found (404)**: Attempt to GET or PUT a class ID that does not exist.
  Response:
  ```json
  {
    "success": false,
    "message": "Class not found"
  }
  ```
- **Duplicate Class Name Conflict (400)**: Create a class with a name that is already in use by an active class.
  Response:
  ```json
  {
    "success": false,
    "message": "Class name \"Class 1\" already exists."
  }
  ```
