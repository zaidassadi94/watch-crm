
import * as z from 'zod';

export const customerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  type: z.enum(["Regular", "VIP"]),
  status: z.enum(["Active", "Inactive"]),
  communication_preferences: z.object({
    sms: z.boolean().default(true),
    whatsapp: z.boolean().default(false)
  }).default({ sms: true, whatsapp: false })
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;
