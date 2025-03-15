
import * as z from 'zod';

export const customerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  type: z.enum(["Regular", "VIP"]),
  status: z.enum(["Active", "Inactive"]),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;
