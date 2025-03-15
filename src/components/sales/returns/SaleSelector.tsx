
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ReturnFormValues } from '../saleFormSchema';
import { useReturnDialog } from './ReturnDialogContext';

interface SaleSelectorProps {
  form: UseFormReturn<ReturnFormValues>;
}

export function SaleSelector({ form }: SaleSelectorProps) {
  const { handleSaleChange, sales } = useReturnDialog();
  
  return (
    <FormField
      control={form.control}
      name="sale_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Select Sale</FormLabel>
          <FormControl>
            <Select 
              onValueChange={(value) => {
                field.onChange(value);
                handleSaleChange(value);
              }}
              value={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a sale to return" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">-- Select a sale --</SelectItem>
                {sales.map(sale => (
                  <SelectItem key={sale.id} value={sale.id}>
                    {sale.customer_name} - {sale.invoice_number || 'No invoice'} - {new Date(sale.created_at).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
