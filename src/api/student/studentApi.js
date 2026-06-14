import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { STUDENT_ENDPOINTS } from './studentEndpoints.js';
import { transformStudentToFormData } from './studentTransformers.js';

/**
 * Student management API slice using Redux Toolkit Query.
 * Includes query/mutation definitions for Get List, Get Details, Create, Update, and Delete.
 */
export const studentApi = createApi({
  reducerPath: 'studentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      // Retrieve JWT authorization token from standard storage if it exists
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Student'],
  endpoints: (builder) => ({
    // 1. Get Student List
    getStudentsList: builder.query({
      query: (params) => ({
        url: STUDENT_ENDPOINTS.LIST,
        method: 'GET',
        params, // maps filters like search, class, and section
      }),
      providesTags: (result) =>
        result && result.students
          ? [
              ...result.students.map(({ id }) => ({ type: 'Student', id })),
              { type: 'Student', id: 'LIST' },
            ]
          : [{ type: 'Student', id: 'LIST' }],
    }),

    // 2. Get Student Details
    getStudentDetails: builder.query({
      query: (id) => ({
        url: STUDENT_ENDPOINTS.DETAILS(id),
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Student', id }],
    }),

    // 3. Create Student (Admission)
    createStudent: builder.mutation({
      query: (studentData) => {
        const body = transformStudentToFormData(studentData);
        // Note: fetchBaseQuery automatically strips manual Content-Type header
        // when body is FormData to let the browser set the boundary correctly.
        return {
          url: STUDENT_ENDPOINTS.ADMISSION,
          method: 'POST',
          body,
        };
      },
      invalidatesTags: [{ type: 'Student', id: 'LIST' }],
    }),

    // 4. Update Student
    updateStudent: builder.mutation({
      query: ({ id, studentData }) => {
        const body = transformStudentToFormData(studentData);
        return {
          url: STUDENT_ENDPOINTS.UPDATE(id),
          method: 'PUT',
          body,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Student', id },
        { type: 'Student', id: 'LIST' },
      ],
    }),

    // 5. Delete Student
    deleteStudent: builder.mutation({
      query: (id) => ({
        url: STUDENT_ENDPOINTS.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Student', id },
        { type: 'Student', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks for integration in React components
export const {
  useGetStudentsListQuery,
  useGetStudentDetailsQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
} = studentApi;
export default studentApi;
