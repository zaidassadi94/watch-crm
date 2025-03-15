
import * as z from 'zod';

export const inventoryFormSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  brand: z.string().min(1, 'Brand is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  stock_level: z.number().min(0, 'Stock level must be 0 or more'),
  stock_status: z.string(),
  price: z.number().min(0, 'Price must be 0 or more'),
  cost_price: z.number().min(0, 'Cost price must be 0 or more'),
  description: z.string().optional(),
  image_url: z.string().optional().or(z.literal('')),
});

export type InventoryFormValues = z.infer<typeof inventoryFormSchema>;

export const getStockStatusText = (status: string) => {
  switch (status) {
    case 'in_stock': return 'In Stock';
    case 'low_stock': return 'Low Stock';
    case 'out_of_stock': return 'Out of Stock';
    default: return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  }
};

export const getStockStatusBasedOnLevel = (level: number, threshold = 5) => {
  if (level <= 0) return 'out_of_stock';
  if (level <= threshold) return 'low_stock';
  return 'in_stock';
};
