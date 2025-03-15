
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { ReturnFormValues } from '../saleFormSchema';
import { useReturnDialog } from './ReturnDialogContext';
import { useSettings } from '@/hooks/useSettings';

interface ReturnItemsListProps {
  form: UseFormReturn<ReturnFormValues>;
}

export function ReturnItemsList({ form }: ReturnItemsListProps) {
  const { selectedSale } = useReturnDialog();
  const { currencySymbol } = useSettings();
  
  const { fields } = useFieldArray({
    control: form.control,
    name: "items"
  });
  
  if (!selectedSale || fields.length === 0) {
    return null;
  }
  
  return (
    <div>
      <Label>Return Items</Label>
      <div className="space-y-2 mt-2">
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-6">
              <p className="text-sm font-medium">{field.product_name}</p>
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
      
      <div className="flex justify-end text-lg font-bold mt-4">
        Total: {currencySymbol}
        {form.watch('items').reduce(
          (sum, item) => sum + (item.price * item.quantity), 
          0
        ).toFixed(2)}
      </div>
    </div>
  );
}
