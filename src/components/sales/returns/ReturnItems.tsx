
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { ReturnFormValues } from '../saleFormSchema';
import { ReturnItemForm } from './ReturnItemForm';
import { useSettings } from '@/hooks/useSettings';

interface ReturnItemsProps {
  form: UseFormReturn<ReturnFormValues>;
}

export function ReturnItems({ form }: ReturnItemsProps) {
  const { currencySymbol } = useSettings();
  const fields = form.watch('items');
  
  if (!fields?.length) {
    return null;
  }
  
  return (
    <div>
      <Label>Return Items</Label>
      <div className="space-y-2 mt-2">
        {fields.map((field, index) => (
          <ReturnItemForm 
            key={index}
            form={form}
            index={index}
            productName={field.product_name}
          />
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
