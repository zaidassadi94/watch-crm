
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ReturnFormValues } from '../saleFormSchema';
import { Sale } from '@/types/sales';
import { useSettings } from '@/hooks/useSettings';

interface SaleSelectionProps {
  form: UseFormReturn<ReturnFormValues>;
  sales: Sale[];
  onSaleChange: (saleId: string) => void;
}

export function SaleSelection({ form, sales, onSaleChange }: SaleSelectionProps) {
  const { currencySymbol } = useSettings();
  
  return (
    <div>
      <Label htmlFor="sale">Select Sale</Label>
      <Select 
        onValueChange={onSaleChange} 
        value={form.watch('sale_id')}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a sale" />
        </SelectTrigger>
        <SelectContent>
          {sales.map(sale => (
            <SelectItem key={sale.id} value={sale.id}>
              {sale.customer_name} - {currencySymbol}{sale.total_amount.toFixed(2)} - {new Date(sale.created_at).toLocaleDateString()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
