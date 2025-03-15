
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
    cost_price: z.number().min(0, 'Cost price must be 0 or higher').optional(),
  })).min(1, 'At least one item is required'),
});

export type SaleFormValues = z.infer<typeof saleFormSchema>;

export interface SaleItemInternal {
  product_name: string;
  quantity: number;
  price: number;
  cost_price?: number;
}

export const calculateTotal = (items: SaleItemInternal[]) => {
  const totalPrice = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const totalCost = items.reduce((sum, item) => sum + (item.quantity * (item.cost_price || 0)), 0);
  const totalProfit = totalPrice - totalCost;
  const marginPercentage = totalPrice > 0 ? (totalProfit / totalPrice) * 100 : 0;
  
  return {
    totalPrice,
    totalCost,
    totalProfit,
    marginPercentage
  };
};
