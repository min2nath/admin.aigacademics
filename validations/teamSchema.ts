import { z } from 'zod';

export const TeamFormSchema = z.object({
  _id: z.string().optional(), // for Edit mode

  companyName: z
    .string()
    .min(1, 'Company name cannot be empty.')
    .max(50, 'Company name cannot exceed 50 characters.'),

  name: z
    .string()
    .min(1, 'Contact person name cannot be empty.')
    .max(30, 'Contact person name cannot exceed 30 characters.'),

  email: z
    .string()
    .email('Please enter a valid email address.')
    .max(30, 'Email cannot exceed 30 characters.'),

  mobile: z
    .string()
    .min(10, 'Mobile number must be 10 digits.')
    .max(10, 'Mobile number must be 10 digits.')
    .regex(/^\d{10}$/, 'Mobile number must contain only digits.'),

  status: z
    .string()
    .min(1, 'Status is required.')
    .max(30, 'Status cannot exceed 30 characters.'),
});

export type TeamFormValues = z.infer<typeof TeamFormSchema>;
