import { z } from 'zod';

export const SupplierFormSchema = z.object({
  _id: z.string().optional(), // for Edit mode

  supplierName: z
    .string()
    .min(1, 'Supplier name cannot be empty.')
    .max(50, 'Supplier name cannot exceed 50 characters.'),

  services: z
    .string()
    .min(1, 'Services cannot be empty.')
    .max(30, 'Services cannot exceed 30 characters.'),

  contactPersonName: z
    .string()
    .min(1, 'Contact person name cannot be empty.')
    .max(30, 'Contact person name cannot exceed 30 characters.'),

  contactPersonEmail: z
    .string()
    .email('Please enter a valid email address.')
    .max(30, 'Email cannot exceed 30 characters.'),

  contactPersonMobile: z
    .string()
    .min(10, 'Mobile must be 10 digits.')
    .max(10, 'Mobile must be 10 digits.')
    .regex(/^\d{10}$/, 'Mobile number must contain only digits.'),

  status: z
    .string()
    .min(1, 'Status is required.')
    .max(30, 'Status cannot exceed 30 characters.'),
});

export type SupplierFormValues = z.infer<typeof SupplierFormSchema>;
