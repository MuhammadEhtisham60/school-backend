# Student Admission API Contract

This document outlines the API contract for the Student Admission feature. The frontend form is split into a multi-step stepper, but all data is submitted at once upon final step completion.

## Endpoint Details

- **Path:** `/api/students/admission` (or `/api/students/enroll`)
- **Method:** `POST`
- **Content-Type:** `multipart/form-data` (Required for uploading file attachments alongside textual form data)
- **Headers:** 
  - `Authorization: Bearer <token>` (If authenticated)

---

## Fields Specifications

Here is the classification of required and optional fields based on the frontend Formik validation schema and form layout.

### 1. Basic Information

| Field Name | Type | Required? | Source Step | Description / Validation |
| :--- | :--- | :--- | :--- | :--- |
| `fullName` | String | **Yes** | Basic Info | Student's full name. Cannot be empty. |
| `fatherName` | String | **Yes** | Basic Info | Father's name. Cannot be empty. |
| `dob` | String (Date) | **Yes** | Basic Info | Date of Birth (Format: `YYYY-MM-DD`). |
| `gender` | String | **Yes** | Basic Info | Options: `Male`, `Female`, `Other`. |
| `rollNo` | String | No | Basic Info | Student's roll number. If empty, the backend should auto-generate it. |
| `cnic` | String | No | Basic Info | B-Form or CNIC (e.g., `12345-1234567-1`). |
| `photo` | File | No | Basic Info | Student's profile image file. |

### 2. Academic Information

| Field Name | Type | Required? | Source Step | Description / Validation |
| :--- | :--- | :--- | :--- | :--- |
| `class` | String | **Yes** | Academic | Target class for admission (e.g., `"Nursery"`, `"KG"`, `"1"` - `"12"`). |
| `section` | String | **Yes** | Academic | Class section assignment (e.g., `"A"`, `"B"`, `"C"`, `"D"`). |
| `prevSchool` | String | No | Academic | Previous school name. |
| `lastResult` | Number | No | Academic | Last exam result percentage (e.g. `85`). |
| `admissionDate`| String (Date) | No | Academic | Date of admission (Format: `YYYY-MM-DD`). |

### 3. Contact Information

| Field Name | Type | Required? | Source Step | Description / Validation |
| :--- | :--- | :--- | :--- | :--- |
| `mobile` | String | **Yes** | Contact | Primary mobile number (e.g., `0300-1234567`). |
| `altContact` | String | No | Contact | Alternate contact number. |
| `email` | String | No | Contact | Contact email (Must be a valid email format or null). |
| `city` | String | No | Contact | Current city (e.g. `"Faisalabad"`). |
| `address` | String | No | Contact | Full residential address. |

### 4. Parent / Guardian Details

| Field Name | Type | Required? | Source Step | Description / Validation |
| :--- | :--- | :--- | :--- | :--- |
| `fatherFullName` | String | No | Guardian | Father's full name. |
| `fatherCNIC` | String | No | Guardian | Father's CNIC number (e.g., `12345-1234567-1`). |
| `occupation` | String | No | Guardian | Father's occupation. |
| `fatherPhone` | String | No | Guardian | Father's contact number. |
| `motherName` | String | No | Guardian | Mother's name. |
| `motherPhone` | String | No | Guardian | Mother's contact number. |

### 5. Health Information

| Field Name | Type | Required? | Source Step | Description / Validation |
| :--- | :--- | :--- | :--- | :--- |
| `blood` | String | No | Health | Blood group (e.g., `A+`, `A-`, `B+`, `B-`, `O+`, `O-`, `AB+`, `AB-`). |
| `emergency` | String | No | Health | Emergency contact number. |
| `medical` | String | No | Health | Details of allergies/chronic conditions. |
| `disability` | String | No | Health | Description of physical disability if any. |

### 6. Transport / Hostel (Commented Out on Frontend)

> [!NOTE]
> The transport step has been temporarily commented out on the frontend. The following fields will not be sent from the active UI steps, but are defined in the initial state and should be handled by the backend with default values.

| Field Name | Type | Required? | Default | Description / Validation |
| :--- | :--- | :--- | :--- | :--- |
| `transport` | Boolean | No | `false` | Indicates if transport service is requested. |
| `busRoute` | String | No | `""` | Assigned bus route. |
| `hostel` | Boolean | No | `false` | Indicates if hostel facility is requested. |

### 7. Documents Upload (Now Step 6 on Frontend)

All file attachments should be sent as binary parts in the multipart form-data.

| Field Name | Type | Required? | Source Step | Description |
| :--- | :--- | :--- | :--- | :--- |
| `studentPhoto` | File | No | Documents | Copy of student's official photograph (PDF, PNG, JPG). |
| `bFormCopy` | File | No | Documents | Scanned copy of B-Form / CNIC. |
| `prevResultCard`| File | No | Documents | Scanned copy of previous school's result card. |
| `guardianCnic` | File | No | Documents | Scanned copy of guardian's CNIC. |

---

## Example Request (Multipart Form-Data Representation)

When submitting, the fields are appended to `FormData`:

```javascript
const formData = new FormData();

// Required Text Fields
formData.append("fullName", "Ali Khan");
formData.append("fatherName", "Ahmed Khan");
formData.append("dob", "2015-05-14");
formData.append("gender", "Male");
formData.append("class", "5");
formData.append("section", "A");
formData.append("mobile", "0300-1234567");

// Optional Text Fields
formData.append("rollNo", "2026-001");
formData.append("cnic", "12345-1234567-1");
formData.append("prevSchool", "Beaconhouse School System");
formData.append("lastResult", "85");
formData.append("admissionDate", "2026-06-14");
formData.append("altContact", "0321-7654321");
formData.append("email", "student@example.com");
formData.append("city", "Faisalabad");
formData.append("address", "House # 12, Street 3, Eden Garden");
formData.append("fatherFullName", "Ahmed Khan");
formData.append("fatherCNIC", "12345-1234567-1");
formData.append("occupation", "Software Engineer");
formData.append("fatherPhone", "0300-9876543");
formData.append("motherName", "Saira Bibi");
formData.append("motherPhone", "0300-1122334");
formData.append("blood", "O+");
formData.append("emergency", "0300-9999999");
formData.append("medical", "Dust allergy");
formData.append("disability", "None");

// Transport / Hostel Defaults
formData.append("transport", "false");
formData.append("busRoute", "");
formData.append("hostel", "false");

// Binary File Uploads (Optional)
formData.append("photo", fileObject1);           // Basic Info photo
formData.append("studentPhoto", fileObject2);    // Documents photo
formData.append("bFormCopy", fileObject3);
formData.append("prevResultCard", fileObject4);
formData.append("guardianCnic", fileObject5);
```

---

## Example Responses

### 1. Success Response (`201 Created`)

```json
{
  "success": true,
  "message": "Student admitted successfully",
  "data": {
    "id": "std_982347293",
    "fullName": "Ali Khan",
    "fatherName": "Ahmed Khan",
    "rollNo": "2026-001",
    "class": "5",
    "section": "A",
    "admissionDate": "2026-06-14",
    "createdAt": "2026-06-14T12:00:00.000Z"
  }
}
```

### 2. Validation Error Response (`400 Bad Request`)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "fullName": "Full name is required",
    "dob": "Date of birth is required",
    "mobile": "Mobile number is required"
  }
}
```
