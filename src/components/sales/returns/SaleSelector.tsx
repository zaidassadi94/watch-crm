
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { useReturnDialog } from './ReturnDialogContext';
import { ReturnFormValues } from '../saleFormSchema';
import { useSettings } from '@/hooks/useSettings';

interface SaleSelectorProps {
  form: UseFormReturn<ReturnFormValues>;
}

export function SaleSelector({ form }: SaleSelectorProps) {
  const { sales, handleSaleChange } = useReturnDialog();
  const { currencySymbol } = useSettings();
  
  const onSaleSelect = async (saleId: string) => {
    form.setValue('sale_id', saleId);
    const result = await handleSaleChange(saleId);
    
    if (result) {
      const { itemsData } = result;
      
      const formItems = itemsData.map((item: any) => ({
        product_name: item.product_name,
        quantity: 1,
        price: item.price,
        cost_price: item.cost_price || 0,
        inventory_id: item.inventory_id,
        max_quantity: item.quantity
      }));
      
      form.setValue('items', formItems);
    } else {
      form.setValue('items', []);
    }
  };
  
  return (
    <div>
      <Label htmlFor="sale">Select Sale</Label>
      <Select 
        onValueChange={onSaleSelect} 
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
