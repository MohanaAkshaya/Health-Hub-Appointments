import { z } from 'zod';

export const appointmentSchema = z.object({
  patient_id: z.string().uuid(),
  doctor_id: z.string().uuid(),
  appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  appointment_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional().or(z.literal('')),
});

export const departmentSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional().or(z.literal('')),
});

export const doctorInfoSchema = z.object({
  specialization: z.string().trim().min(1, 'Specialization is required').max(100, 'Specialization must be less than 100 characters'),
  qualification: z.string().trim().min(1, 'Qualification is required').max(200, 'Qualification must be less than 200 characters'),
  experience_years: z.number().int().min(0, 'Experience must be positive').max(70, 'Experience must be less than 70 years'),
  fullName: z.string().trim().min(1, 'Full name is required').max(100, 'Full name must be less than 100 characters'),
  email: z.string().email('Invalid email address').max(255, 'Email must be less than 255 characters'),
});

export const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type DepartmentInput = z.infer<typeof departmentSchema>;
export type DoctorInfoInput = z.infer<typeof doctorInfoSchema>;
