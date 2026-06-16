# Class API Frontend Integration Guide

This guide details how to integrate the backend **Class API** with the frontend using **Redux Toolkit Query (RTK Query)** to populate dropdown selections dynamically.

---

## 1. API Overview

The Class endpoint requires authentication. The request header must include:
```http
Authorization: Bearer <JWT_TOKEN>
```

### Endpoint Details

| HTTP Method | Route | Description |
| :--- | :--- | :--- |
| **GET** | `/api/classes/dropdown` | Retrieve a list of active, sorted classes formatted for selection fields |

---

## 2. Response Schema

### `GET /api/classes/dropdown`
This returns an array of objects containing `_id` and `name` of all active classes, ordered by `display_order`.

```json
{
  "success": true,
  "message": "Classes dropdown list retrieved successfully",
  "data": [
    {
      "_id": 1,
      "name": "Nursery"
    },
    {
      "_id": 2,
      "name": "KG"
    },
    {
      "_id": 3,
      "name": "1"
    },
    {
      "_id": 4,
      "name": "2"
    },
    {
      "_id": 5,
      "name": "3"
    }
  ]
}
```

> [!NOTE]
> The student creation database schema expects the `class` field to be saved as a **string** value matching the class name (e.g. `"Nursery"`, `"KG"`, `"1"`). Therefore, when mapping this data in the frontend select options, you should use the class `name` field as the form value.

---

## 3. Frontend RTK Query Implementation

Follow these steps to wire up the API in the React frontend codebase.

### Step 1: Register tags in the base API
Open [src/services/index.js](file:///c:/Users/l/Documents/MARN/school-frontend/src/services/index.js) and add `"Class"` to the `tagTypes` array:

```javascript
// src/services/index.js
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_APP_API_URL || "http://localhost:5000/api/",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Student", "StudentFees", "Fee", "StudentFeesList", "Result", "StudentResultHistory", "Class"],
  endpoints: () => ({}),
});
```

### Step 2: Create the RTK Query endpoint service
Create a new file [src/services/private/classService.js](file:///c:/Users/l/Documents/MARN/school-frontend/src/services/private/classService.js) and copy the following service code:

```javascript
import { baseApi } from "../index";

export const classApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/classes/dropdown
    getClassesDropdown: builder.query({
      query: () => ({
        url: "classes/dropdown",
        method: "GET",
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Class", id: _id })),
              { type: "Class", id: "DROPDOWN" },
            ]
          : [{ type: "Class", id: "DROPDOWN" }],
    }),
  }),
});

export const { useGetClassesDropdownQuery } = classApi;
```

---

## 4. Frontend Component Integration Examples

### Injecting Dynamic Classes in Student Admission Form
You can use `useGetClassesDropdownQuery` inside [AcademicInformation.jsx](file:///c:/Users/l/Documents/MARN/school-frontend/src/pages/Management/Students/admission/stepcomponent/AcademicInformation.jsx) to dynamically list available classes.

#### Implementation:

```jsx
import { Section } from "./Section";
import { FormikSelect, FormikText, FormikDatePicker } from "@/components/common/sharedfields";
import { useGetClassesDropdownQuery } from "@/services/private/classService";

export function AcademicInformation() {
  const { data: classesResponse, isLoading, error } = useGetClassesDropdownQuery();
  
  // Format options dynamically: value is the class name string, label is "Class <name>"
  const classOptions = classesResponse?.data?.map((c) => ({
    value: c.name,
    label: `Class ${c.name}`,
  })) || [];

  return (
    <Section title="Academic Information" desc="Class assignment and academic history">
      <FormikSelect
        name="class"
        label="Admission Class"
        placeholder={isLoading ? "Loading classes..." : "Select class"}
        required
        disabled={isLoading || !!error}
        options={classOptions}
      />
      <FormikSelect
        name="section"
        label="Section"
        placeholder="Select section"
        required
        options={["A", "B", "C", "D"].map((s) => ({ value: s, label: `Section ${s}` }))}
      />
      <FormikText
        name="class_fees"
        type="number"
        label="Monthly Class Fees (Rs.)"
        placeholder="e.g. 5000"
      />
      <FormikText name="prevSchool" label="Previous School" placeholder="School name" />
      <FormikText
        name="lastResult"
        type="number"
        label="Last Exam Result (%)"
        placeholder="e.g. 85"
      />
      <FormikDatePicker name="admissionDate" label="Admission Date" />
    </Section>
  );
}
```

---

## 5. Verification Checklist

Before wrapping up, verify that:
1. [ ] JWT Token headers are sent correctly (handled by base API).
2. [ ] The response payload is properly structured as `{ success: true, data: [...] }`.
3. [ ] If the backend fetch fails, the class selector gracefully displays an error state or disables input.
4. [ ] The select value sends the class `name` field string (e.g. `"10"`, `"KG"`) to match the backend student schema validation.
