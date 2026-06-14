# Postman Testing Guide - Student CRUD APIs

This guide explains how to test the Student Admission and CRUD APIs using Postman.

## 1. Setup & Environment

1. **Start the server**: Ensure the backend is running.
   ```bash
   npm run dev
   ```
2. **Base URL**: All Student endpoints are prefixed with:
   `http://localhost:5000/api/students`
3. **Authentication**: All routes are protected. You MUST provide a Bearer JWT Token in the headers:
   - Go to the **Authorization** tab in Postman.
   - Select **Type**: **Bearer Token**.
   - Paste the JWT token (which you can get by logging in or registering a user via the Auth APIs).

---

## 2. API Endpoints Reference

### 1. Create Student (Admission)
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/students/admission` (or `/api/students/enroll`)
- **Headers**:
  - `Authorization: Bearer <token>`
- **Postman Setup**:
  1. Set method to **POST** and enter the URL.
  2. Go to the **Body** tab, select **form-data** (do NOT use raw JSON, as this endpoint accepts file uploads).
  3. Enter the following key-value pairs:

#### Body Parameters (form-data):

| Key | Type | Value (Example) | Description |
| :--- | :--- | :--- | :--- |
| `fullName` | Text | Ali Khan | **Required**. Student's full name. |
| `fatherName` | Text | Ahmed Khan | **Required**. Father's name. |
| `dob` | Text | 2015-05-14 | **Required** (Format: `YYYY-MM-DD`). |
| `gender` | Text | Male | **Required** (Options: `Male`, `Female`, `Other`). |
| `class` | Text | 5 | **Required** (Target class). |
| `section` | Text | A | **Required** (Section assignment). |
| `mobile` | Text | 0300-1234567 | **Required** (Primary contact). |
| `rollNo` | Text | 2026-001 | *Optional*. If left empty, backend auto-generates it. |
| `cnic` | Text | 12345-1234567-1 | *Optional* (B-Form/CNIC number). |
| `prevSchool` | Text | Beaconhouse | *Optional*. |
| `lastResult` | Text | 85 | *Optional* (Previous exam percentage). |
| `admissionDate`| Text | 2026-06-14 | *Optional* (Defaults to today's date). |
| `transport` | Text | false | *Optional* (Defaults to `false`). |
| `hostel` | Text | false | *Optional* (Defaults to `false`). |
| `is_active` | Text | true | *Optional*. Status flag (`true`: active, `false`: inactive). Defaults to `true`. |
| `photo` | **File** | *[Select Image File]* | *Optional* (Profile photo). |
| `studentPhoto` | **File** | *[Select Image File]* | *Optional* (Documents photo). |
| `bFormCopy` | **File** | *[Select PDF/Image]* | *Optional* (CNIC/B-Form copy). |
| `prevResultCard`| **File** | *[Select PDF/Image]* | *Optional* (Previous result card). |
| `guardianCnic` | **File** | *[Select PDF/Image]* | *Optional* (Guardian CNIC copy). |

*Note: In Postman, to upload a file, change the key type from **Text** to **File** by hovering over the key field and selecting the dropdown.*

- **Expected Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Student admitted successfully",
    "data": {
      "id": "std_963473456",
      "fullName": "Ali Khan",
      "fatherName": "Ahmed Khan",
      "rollNo": "2026-001",
      "class": "5",
      "section": "A",
      "admissionDate": "2026-06-14",
      "photo": "/uploads/photo-1781423600412-918445536.png",
      "studentPhoto": "/uploads/studentPhoto-1781423600413-931429342.png",
      "createdAt": "2026-06-14T12:00:00.000Z",
      "updatedAt": "2026-06-14T12:00:00.000Z"
    }
  }
  ```

---

### 2. Get Students List
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/students`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Query Parameters (Params tab in Postman - Optional)**:
  - `search` (Search by student name, roll number, or ID)
  - `class` (Filter by class)
  - `section` (Filter by section)
  - `is_active` or `isActive` (Filter by active status: `true` or `false`)
  - `limit` (Pagination limit, default: 100)
  - `offset` (Pagination offset, default: 0)

- **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Students list retrieved successfully",
    "students": [
      {
        "id": "std_963473456",
        "fullName": "Ali Khan",
        "fatherName": "Ahmed Khan",
        "rollNo": "2026-001",
        "class": "5",
        "section": "A",
        "mobile": "0300-1234567",
        "isActive": true,
        "is_active": true
      }
    ]
  }
  ```

---

### 3. Get Student Details
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/students/:id`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Postman Setup**: Replace `:id` in the URL with the actual student ID (e.g. `std_963473456`).

- **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Student details retrieved successfully",
    "student": {
      "id": "std_963473456",
      "fullName": "Ali Khan",
      "fatherName": "Ahmed Khan",
      "dob": "2015-05-14",
      "gender": "Male",
      "rollNo": "2026-001",
      "class": "5",
      "section": "A",
      "mobile": "0300-1234567",
      "photo": "/uploads/photo-1781423600412-918445536.png",
      "transport": false,
      "busRoute": "",
      "hostel": false,
      "isActive": true,
      "is_active": true,
      "createdAt": "2026-06-14T12:00:00.000Z",
      "updatedAt": "2026-06-14T12:00:00.000Z"
    }
  }
  ```

---

### 4. Update Student Details
- **Method**: `PUT`
- **URL**: `http://localhost:5000/api/students/:id`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Postman Setup**:
  1. Replace `:id` in URL with the student ID to update.
  2. Go to **Body** tab, select **form-data**.
  3. Append fields you wish to update (e.g. `fullName`, `class`, or upload new documents).

- **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Student updated successfully",
    "student": {
      "id": "std_963473456",
      "fullName": "Ali Khan Updated",
      "class": "6",
      "section": "B",
      "updatedAt": "2026-06-14T12:05:00.000Z"
    }
  }
  ```

---

### 5. Delete Student
- **Method**: `DELETE`
- **URL**: `http://localhost:5000/api/students/:id`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Postman Setup**: Replace `:id` with the student ID to remove.

- **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Student deleted successfully"
  }
  ```

---

### 6. Get Student Fee Details
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/students/:id/fees`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Postman Setup**: Replace `:id` with the student ID.

- **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Student fee details retrieved successfully",
    "fees": {
      "january": {
        "status": "pending",
        "amount": 5000,
        "paid_amount": 0,
        "due_amount": 5000,
        "paid_at": null,
        "remarks": ""
      },
      "february": {
        "status": "paid",
        "amount": 5000,
        "paid_amount": 5000,
        "due_amount": 0,
        "paid_at": "2026-06-14",
        "remarks": "Paid in full"
      }
    }
  }
  ```

---

### 7. Update Monthly Fee Details
- **Method**: `PATCH`
- **URL**: `http://localhost:5000/api/students/:id/fees/:month`
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Postman Setup**:
  1. Replace `:id` with the student ID, and `:month` with a valid month (e.g. `january` or `february`).
  2. Go to **Body** tab, select **raw**, choose **JSON**, and paste a payload.
- **Body (raw JSON)**:
  ```json
  {
    "amount": 6000,
    "paid_amount": 2000,
    "paid_at": "2026-06-14",
    "remarks": "Partial fee update"
  }
  ```
- **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Monthly fee details updated successfully",
    "month": {
      "status": "partial",
      "amount": 6000,
      "paid_amount": 2000,
      "due_amount": 4000,
      "paid_at": "2026-06-14",
      "remarks": "Partial fee update"
    }
  }
  ```

---

### 8. Mark Fee as Paid (Incremental Payment)
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/students/:id/fees/:month/pay`
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Postman Setup**:
  1. Replace `:id` with the student ID, and `:month` with the month name (e.g. `january`).
  2. Go to **Body** tab, select **raw**, choose **JSON**, and paste the payment amount.
- **Body (raw JSON)**:
  ```json
  {
    "amount": 4000,
    "remarks": "Final payment"
  }
  ```
- **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Fee payment recorded successfully",
    "month": {
      "status": "paid",
      "amount": 6000,
      "paid_amount": 6000,
      "due_amount": 0,
      "paid_at": "2026-06-14",
      "remarks": "Final payment"
    }
  }
  ```

---

## 3. Testing Error Scenarios

- **Unauthorized (401)**: Remove the `Authorization` header and request any endpoint. You should get a `401 Unauthorized` status.
- **Validation Failed (400)**: Try sending a POST to `/admission` without a `fullName` or `mobile`. The response will be `400 Bad Request` containing:
  ```json
  {
    "success": false,
    "message": "Validation failed",
    "errors": {
      "fullName": "Full name is required",
      "mobile": "Mobile number is required"
    }
  }
  ```
- **Student Not Found (404)**: Request details for an ID that doesn't exist (e.g. `/api/students/std_non_existent`). You will get `404 Not Found`.
