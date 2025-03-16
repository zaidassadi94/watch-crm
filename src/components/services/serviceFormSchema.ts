
import * as z from 'zod';

export const serviceFormSchema = z.object({
  customer_name: z.string().min(2, 'Customer name is required'),
  customer_email: z.string().email('Invalid email').optional().or(z.literal('')),
  customer_phone: z.string().optional(),
  watch_brand: z.string().min(1, 'Watch brand is required'),
  watch_model: z.string().optional(),
  serial_number: z.string().optional(),
  service_type: z.string().min(1, 'Service type is required'),
  description: z.string().optional(),
  status: z.string(),
  estimated_completion: z.string().optional().or(z.literal('')),
  price: z.number().optional().nullable(),
  payment_status: z.string().default('unpaid'),
  payment_method: z.string().optional().or(z.literal('')),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
