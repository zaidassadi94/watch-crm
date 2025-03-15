
import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { InventoryFormValues } from './InventoryFormSchema';

interface PriceFieldsProps {
  form: UseFormReturn<InventoryFormValues>;
  currencySymbol: string;
}

export function PriceFields({ form, currencySymbol }: PriceFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="cost_price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cost Price ({currencySymbol}) *</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                step="0.01" 
                min="0" 
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                value={field.value}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>MRP/Selling Price ({currencySymbol}) *</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                step="0.01" 
                min="0" 
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                value={field.value}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
