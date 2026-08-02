import { z } from 'zod';

export const studentSchema = z.object({
  student_id: z.string().min(3, 'Student ID must be at least 3 characters'),
  admission_no: z.string().min(1, 'Admission Number is required'),
  roll_number: z.string().min(1, 'Roll Number is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  father_name: z.string().min(2, "Father's Name must be at least 2 characters"),
  dob: z.string().min(1, 'Date of Birth is required'),
  gender: z.enum(['Male', 'Female', 'Other']),
  class_name: z.enum(['6th', '7th', '8th', '9th', '10th']),
  session: z.string().min(1, 'Academic Session is required'),
  photo_url: z.string().optional().nullable(),
  status: z.enum(['Active', 'Inactive', 'Passed Out', 'Transferred']).default('Active'),
});

export const facultySchema = z.object({
  name: z.string().min(2, 'Full Name is required'),
  qualification: z.string().min(2, 'Qualification is required'),
  designation: z.string().min(2, 'Designation is required'),
  subject: z.string().min(2, 'Primary Subject is required'),
  experience: z.string().min(1, 'Years of experience is required'),
  phone: z.string().optional().nullable(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  photo_url: z.string().optional().nullable(),
  status: z.enum(['Active', 'On Leave', 'Retired']).default('Active'),
});

export const resultDetailSchema = z.object({
  subject_name: z.string().min(1, 'Subject is required'),
  total_marks: z.number().min(1, 'Total marks must be > 0'),
  obtained_marks: z.number().min(0, 'Obtained marks cannot be negative'),
});

export const excelResultRowSchema = z.object({
  class_name: z.enum(['6th', '7th', '8th', '9th', '10th']),
  session: z.string().min(1),
  student_id: z.string().min(1),
  roll_number: z.string().min(1),
  student_name: z.string().min(1),
  father_name: z.string().min(1),
  subject_name: z.string().min(1),
  total_marks: z.number().min(1),
  obtained_marks: z.number().min(0),
});
