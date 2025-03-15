
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { SaleFormValues } from '../saleFormSchema';
import { useSettings } from '@/hooks/useSettings';

interface PriceFieldProps {
  form: UseFormReturn<SaleFormValues>;
  index: number;
  isFirstItem: boolean;
  fieldName: `items.${number}.price` | `items.${number}.cost_price`;
  label: string;
}

export function PriceField({ 
  form, 
  index, 
  isFirstItem,
  fieldName,
  label
}: PriceFieldProps) {
  const { currencySymbol } = useSettings();
  
  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem className="w-full sm:w-28">
          <FormLabel className={isFirstItem ? "" : "sr-only"}>
            {label} ({currencySymbol})
          </FormLabel>
          <FormControl>
            <Input 
              type="number" 
              step="0.01" 
              min="0" 
              {...field}
              onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
