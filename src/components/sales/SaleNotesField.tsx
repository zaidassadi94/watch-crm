
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { SaleFormValues } from './saleFormSchema';

interface SaleNotesFieldProps {
  form: UseFormReturn<SaleFormValues>;
}

export function SaleNotesField({ form }: SaleNotesFieldProps) {
  return (
    <FormField
      control={form.control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Notes</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Add any additional notes or details" 
              className="min-h-24" 
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
