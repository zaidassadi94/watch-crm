
import React, { useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { SaleFormValues } from '../saleFormSchema';
import { ProductSuggestion } from '@/types/inventory';
import { useInventoryData } from '@/hooks/useInventoryData';

interface QuantityFieldProps {
  form: UseFormReturn<SaleFormValues>;
  index: number;
  isFirstItem: boolean;
  productSuggestions: ProductSuggestion[];
}

export function QuantityField({ 
  form, 
  index, 
  isFirstItem,
  productSuggestions 
}: QuantityFieldProps) {
  const { inventory } = useInventoryData();
  
  // Get the current inventory_id and update max stock whenever it changes
  const inventoryId = form.watch(`items.${index}.inventory_id`);
  
  useEffect(() => {
    if (inventoryId) {
      // Find the matching product in inventory to get stock level
      const product = inventory.find(p => p.id === inventoryId);
      
      if (product) {
        // If current quantity exceeds stock, adjust it
        const currentQty = form.getValues(`items.${index}.quantity`);
        if (currentQty > product.stock_level) {
          form.setValue(`items.${index}.quantity`, Math.max(1, product.stock_level));
        }
      }
    }
  }, [inventoryId, inventory, form, index]);

  return (
    <FormField
      control={form.control}
      name={`items.${index}.quantity`}
      render={({ field }) => {
        // Find the matching product in inventory to get stock level
        const product = inventory.find(p => p.id === inventoryId);
        const maxStock = product ? product.stock_level : 999;
        const isOutOfStock = maxStock <= 0;
        
        return (
          <FormItem className="w-full sm:w-20">
            <FormLabel className={isFirstItem ? "" : "sr-only"}>
              Qty
            </FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min={1}
                max={maxStock} 
                {...field}
                className={isOutOfStock ? "border-red-300" : ""}
                disabled={isOutOfStock}
                onChange={e => {
                  const val = parseInt(e.target.value) || 1;
                  // Limit quantity to available stock
                  if (inventoryId && product) {
                    field.onChange(Math.min(Math.max(1, val), maxStock));
                  } else {
                    field.onChange(Math.max(1, val));
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
