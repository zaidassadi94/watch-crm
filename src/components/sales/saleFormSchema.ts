
import * as z from 'zod';

export const saleFormSchema = z.object({
  customer_name: z.string().min(2, 'Customer name is required'),
  customer_email: z.string().email('Invalid email').optional().or(z.literal('')),
  customer_phone: z.string().optional(),
  status: z.string(),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    product_name: z.string().min(1, 'Product name is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    price: z.number().min(0, 'Price must be 0 or higher'),
  })).min(1, 'At least one item is required'),
});

export type SaleFormValues = z.infer<typeof saleFormSchema>;

export interface SaleItemInternal {
  product_name: string;
  quantity: number;
  price: number;
}

export const calculateTotal = (items: SaleItemInternal[]) => {
  return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
};
