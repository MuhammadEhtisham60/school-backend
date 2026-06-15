# Postman Testing & Frontend Integration Guide - Student Fee Management

This guide explains how to test the Student Fee Management APIs using Postman and integrate them with the React frontend using the existing **Redux Toolkit Query (RTK Query)** architecture.

---

## 1. Setup & Environment (Postman)

1. **Start the server**: Ensure the backend is running.
   ```bash
   npm run dev
   ```
2. **Base URL**: All Fee endpoints are prefixed with:
   `http://localhost:5000/api/fees`
3. **Authentication**: All routes are protected by JWT auth.
   - Go to the **Authorization** tab in Postman.
   - Select **Type**: **Bearer Token**.
   - Paste the JWT token (retrieve it by logging in or registering a user via the Auth APIs).

---

## 2. API Endpoints Reference (Postman)

### 1. Create Fee Record
Add a monthly fee against a student.
- **Method**: `POST`
- **URL**: `http://localhost:5000/api/fees`
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body (raw JSON)**:
  ```json
  {
    "studentId": "std_135428019",
    "month": "January",
    "amount": 5000,
    "paymentDate": "2026-06-15",
    "paymentMethod": "Cash",
    "status": "Paid",
    "remarks": "Monthly Tuition Fee"
  }
  ```
- **Validation Rules**:
  - `studentId` (string, required): Must exist in the `students` table.
  - `month` (string, required): Must be one of the valid month names (e.g. `January`, `February`, etc.).
  - `amount` (number, required): Must be greater than 0.
  - `paymentDate` (string, required): Must be in `YYYY-MM-DD` format.
  - `paymentMethod` (string, required): Any non-empty string.
  - `status` (string, optional): Defaults to `Paid` if omitted.
- **Expected Responses**:
  - **201 Created (Success)**:
    ```json
    {
      "success": true,
      "message": "Fee added successfully.",
      "data": {
        "id": 1,
        "studentId": {
          "id": "std_135428019",
          "name": "Ali Khan",
          "admissionNo": "std_135428019",
          "class": "Grade 5",
          "section": "Green",
          "rollNumber": "2026-268"
        },
        "month": "January",
        "amount": 5000,
        "paymentDate": "2026-06-15",
        "paymentMethod": "Cash",
        "status": "Paid",
        "remarks": "Monthly Tuition Fee",
        "createdBy": 1,
        "createdAt": "2026-06-15T20:30:46.000Z",
        "updatedAt": "2026-06-15T20:30:46.000Z"
      }
    }
    ```
  - **400 Bad Request (Duplicate)**:
    ```json
    {
      "success": false,
      "message": "Fee for this month already exists."
    }
    ```
  - **404 Not Found (Student Missing)**:
    ```json
    {
      "success": false,
      "message": "Student not found."
    }
    ```

---

### 2. Get All Fees
Get a list of all monthly fee records.
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/fees`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Query Parameters (Params Tab - Optional)**:
  - `page` (number, optional): Page index (default: `1`).
  - `limit` (number, optional): Records per page (default: `10`).
  - `search` (string, optional): Search by student's name.
  - `month` (string, optional): Filter by month (e.g., `January`).
  - `status` (string, optional): Filter by payment status (e.g., `Paid`, `Pending`).
- **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Fees list retrieved successfully.",
    "data": [
      {
        "id": 1,
        "studentId": {
          "id": "std_135428019",
          "name": "Ali Khan",
          "admissionNo": "std_135428019",
          "class": "Grade 5",
          "section": "Green",
          "rollNumber": "2026-268"
        },
        "month": "January",
        "amount": 5000,
        "paymentDate": "2026-06-15",
        "paymentMethod": "Cash",
        "status": "Paid",
        "remarks": "Monthly Tuition Fee",
        "createdBy": 1,
        "createdAt": "2026-06-15T20:30:46.000Z",
        "updatedAt": "2026-06-15T20:30:46.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
  ```

---

### 3. Get Student Fee Records
Get all monthly fee records of a specific student.
- **Method**: `GET`
- **URL**: `http://localhost:5000/api/fees/student/:studentId`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Postman Setup**: Replace `:studentId` with the student ID (e.g., `std_135428019`).
- **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Student fees retrieved successfully.",
    "data": [
      {
        "id": 1,
        "studentId": {
          "id": "std_135428019",
          "name": "Ali Khan",
          "admissionNo": "std_135428019",
          "class": "Grade 5",
          "section": "Green",
          "rollNumber": "2026-268"
        },
        "month": "January",
        "amount": 5000,
        "paymentDate": "2026-06-15",
        "paymentMethod": "Cash",
        "status": "Paid",
        "remarks": "Monthly Tuition Fee",
        "createdBy": 1,
        "createdAt": "2026-06-15T20:30:46.000Z",
        "updatedAt": "2026-06-15T20:30:46.000Z"
      }
    ]
  }
  ```

---

### 4. Update Fee Record
Update fields in a fee record. Changing `studentId` or `month` is forbidden.
- **Method**: `PUT`
- **URL**: `http://localhost:5000/api/fees/:id`
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Postman Setup**: Replace `:id` with the numerical fee record ID (e.g., `1`).
- **Body (raw JSON)**:
  ```json
  {
    "amount": 5500,
    "paymentDate": "2026-06-16",
    "paymentMethod": "EasyPaisa",
    "status": "Paid",
    "remarks": "Tuition Fee updated with penalty"
  }
  ```
- **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Fee updated successfully.",
    "data": {
      "id": 1,
      "studentId": {
        "id": "std_135428019",
        "name": "Ali Khan",
        "admissionNo": "std_135428019",
        "class": "Grade 5",
        "section": "Green",
        "rollNumber": "2026-268"
      },
      "month": "January",
      "amount": 5500,
      "paymentDate": "2026-06-16",
      "paymentMethod": "EasyPaisa",
      "status": "Paid",
      "remarks": "Tuition Fee updated with penalty",
      "createdBy": 1,
      "createdAt": "2026-06-15T20:30:46.000Z",
      "updatedAt": "2026-06-16T12:00:00.000Z"
    }
  }
  ```

---

### 5. Delete Fee Record
Delete a fee record.
- **Method**: `DELETE`
- **URL**: `http://localhost:5000/api/fees/:id`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Postman Setup**: Replace `:id` with the fee record ID (e.g., `1`).
- **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Fee record deleted successfully."
  }
  ```

---

## 3. Frontend Integration Guidelines (React / RTK Query)

The frontend project utilizes **Redux Toolkit Query (RTK Query)**. Follow these steps to integrate:

### Step 1: Add new tag types to the base API
Open your base API definition at `school-frontend/src/services/index.js` and ensure `"Fee"` and `"StudentFeesList"` are registered in `tagTypes`:
```javascript
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ ... }),
  tagTypes: ["Student", "StudentFees", "Fee", "StudentFeesList"], // <-- Add 'Fee' and 'StudentFeesList'
  endpoints: () => ({}),
});
```

### Step 2: Create `feeService.js` API injection
Create a new file `school-frontend/src/services/private/feeService.js` and paste the following content:
```javascript
import { baseApi } from "../index";

export const feeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/fees
    getFees: builder.query({
      query: (params) => ({
        url: "fees",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Fee", id })),
              { type: "Fee", id: "LIST" },
            ]
          : [{ type: "Fee", id: "LIST" }],
    }),

    // GET /api/fees/student/:studentId
    getStudentFeesList: builder.query({
      query: (studentId) => ({
        url: `fees/student/${studentId}`,
        method: "GET",
      }),
      providesTags: (result, error, studentId) => [
        { type: "StudentFeesList", id: studentId }
      ],
    }),

    // POST /api/fees
    createFee: builder.mutation({
      query: (body) => ({
        url: "fees",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { studentId }) => [
        { type: "Fee", id: "LIST" },
        { type: "StudentFeesList", id: studentId },
      ],
    }),

    // PUT /api/fees/:id
    updateFee: builder.mutation({
      query: ({ id, body }) => ({
        url: `fees/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id, studentId }) => [
        { type: "Fee", id },
        { type: "Fee", id: "LIST" },
        { type: "StudentFeesList", id: studentId },
      ],
    }),

    // DELETE /api/fees/:id
    deleteFee: builder.mutation({
      query: ({ id, studentId }) => ({
        url: `fees/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { studentId }) => [
        { type: "Fee", id: "LIST" },
        { type: "StudentFeesList", id: studentId },
      ],
    }),
  }),
});

export const {
  useGetFeesQuery,
  useGetStudentFeesListQuery,
  useCreateFeeMutation,
  useUpdateFeeMutation,
  useDeleteFeeMutation,
} = feeApi;
```

### Step 3: Integrate inside React Components
Use the auto-generated hooks to fetch or mutate fee data directly in your pages:

```jsx
import React, { useState } from 'react';
import { 
  useGetStudentFeesListQuery, 
  useCreateFeeMutation 
} from '../../../services/private/feeService';

const StudentFeeList = ({ studentId }) => {
  const { data, isLoading } = useGetStudentFeesListQuery(studentId);
  const [createFee, { isLoading: isCreating }] = useCreateFeeMutation();

  const handleAddFee = async () => {
    try {
      await createFee({
        studentId,
        month: 'January',
        amount: 5000,
        paymentDate: '2026-06-15',
        paymentMethod: 'Cash',
        remarks: 'Tuition Fee'
      }).unwrap();
      alert('Fee added successfully!');
    } catch (err) {
      alert(err.data?.message || 'Error occurred');
    }
  };

  if (isLoading) return <div>Loading fees...</div>;

  return (
    <div>
      <h3>Monthly Fee History</h3>
      <ul>
        {data?.data?.map((fee) => (
          <li key={fee.id}>
            {fee.month}: {fee.amount} PKR - {fee.status} ({fee.paymentMethod})
          </li>
        ))}
      </ul>
      <button onClick={handleAddFee} disabled={isCreating}>
        Add January Fee
      </button>
    </div>
  );
};
```
