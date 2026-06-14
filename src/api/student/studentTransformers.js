/**
 * Transforms standard student data object (including file fields)
 * into a FormData instance suitable for multipart/form-data POST/PUT requests.
 * 
 * @param {object} data - Student form/JSON data.
 * @returns {FormData} Form data instance ready for submission.
 */
export const transformStudentToFormData = (data) => {
  // If we are executing in a non-browser environment, return the object as-is or mock FormData
  if (typeof FormData === 'undefined') {
    return data;
  }

  const formData = new FormData();

  const textFields = [
    // Basic Info
    'fullName', 'fatherName', 'dob', 'gender', 'rollNo', 'cnic',
    // Academic Info
    'class', 'section', 'prevSchool', 'lastResult', 'admissionDate',
    // Contact Info
    'mobile', 'altContact', 'email', 'city', 'address',
    // Parent / Guardian Details
    'fatherFullName', 'fatherCNIC', 'occupation', 'fatherPhone', 'motherName', 'motherPhone',
    // Health Info
    'blood', 'emergency', 'medical', 'disability',
    // Transport / Hostel
    'transport', 'busRoute', 'hostel',
    // Status flag
    'isActive', 'is_active'
  ];

  // Append text/primitive fields
  textFields.forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      formData.append(field, String(data[field]));
    }
  });

  // Append binary uploads
  const fileFields = ['photo', 'studentPhoto', 'bFormCopy', 'prevResultCard', 'guardianCnic'];
  fileFields.forEach((fileKey) => {
    if (data[fileKey]) {
      if (data[fileKey] instanceof File) {
        formData.append(fileKey, data[fileKey]);
      } else if (data[fileKey] && typeof data[fileKey] === 'object' && data[fileKey].originFileObj instanceof File) {
        // Handle Ant Design upload structure
        formData.append(fileKey, data[fileKey].originFileObj);
      } else if (data[fileKey] && (data[fileKey].name || data[fileKey].size)) {
        // Fallback for file-like objects
        formData.append(fileKey, data[fileKey]);
      }
    }
  });

  return formData;
};
