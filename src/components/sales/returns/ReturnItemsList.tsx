
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ReturnFormValues } from '../saleFormSchema';
import { useReturnDialog } from './ReturnDialogContext';
import { useSettings } from '@/hooks/useSettings';

interface ReturnItemsListProps {
  form: UseFormReturn<ReturnFormValues>;
}

export function ReturnItemsList({ form }: ReturnItemsListProps) {
  const { selectedSaleItems } = useReturnDialog();
  const { currencySymbol } = useSettings();
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Return Items</h3>
      <div className="space-y-2">
        {form.watch('items').map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-3 items-center">
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
                        max={item.max_quantity || 1}
                        {...field}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          const max = item.max_quantity || 1;
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
