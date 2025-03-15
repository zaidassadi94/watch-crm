
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { SaleFormValues } from '../saleFormSchema';
import { ProductSuggestion } from '@/types/inventory';

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
  return (
    <FormField
      control={form.control}
      name={`items.${index}.quantity`}
      render={({ field }) => {
        // Get the current inventory_id
        const inventoryId = form.watch(`items.${index}.inventory_id`);
        
        // Find the matching product in suggestions to get stock level
        const product = productSuggestions.find(p => p.id === inventoryId);
        const maxStock = product ? product.stock_level : 999;
        
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
