
import React from 'react';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { ReturnFormValues } from '../saleFormSchema';
import { useSettings } from '@/hooks/useSettings';

interface ReturnItemFormProps {
  form: UseFormReturn<ReturnFormValues>;
  index: number;
  productName: string;
}

export function ReturnItemForm({ form, index, productName }: ReturnItemFormProps) {
  const { currencySymbol } = useSettings();
  
  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      <div className="col-span-6">
        <p className="text-sm font-medium">{productName}</p>
      </div>
      
      <div className="col-span-3">
        <FormField
          control={form.control}
          name={`items.${index}.quantity`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={form.watch(`items.${index}.max_quantity`) || 1}
                  {...field}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    const max = form.watch(`items.${index}.max_quantity`) || 1;
                    field.onChange(Math.min(Math.max(1, val), max));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="col-span-3 text-right">
        <p className="text-sm">
          {currencySymbol}{(form.watch(`items.${index}.price`) * form.watch(`items.${index}.quantity`)).toFixed(2)}
        </p>
      </div>
    </div>
  );
}
