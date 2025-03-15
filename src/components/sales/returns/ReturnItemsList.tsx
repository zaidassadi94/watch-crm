
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { ReturnFormValues } from '../saleFormSchema';
import { useSettings } from '@/hooks/useSettings';
import { useReturnDialog } from './ReturnDialogContext';

interface ReturnItemsListProps {
  form: UseFormReturn<ReturnFormValues>;
}

export function ReturnItemsList({ form }: ReturnItemsListProps) {
  const { currencySymbol } = useSettings();
  const { selectedSale } = useReturnDialog();
  
  if (!selectedSale) return null;
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Return Items</h3>
      
      <div className="space-y-2">
        {form.watch('items').map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-6">
              <p className="text-sm font-medium">{item.product_name}</p>
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
        ))}
      </div>
      
      <div className="flex justify-end text-lg font-bold">
        Total: {currencySymbol}
        {form.watch('items').reduce(
          (sum, item) => sum + (item.price * item.quantity), 
          0
        ).toFixed(2)}
      </div>
    </div>
  );
}
