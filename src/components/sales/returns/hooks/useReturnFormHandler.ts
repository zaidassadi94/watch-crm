
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReturnFormValues, returnFormSchema } from '../../saleFormSchema';
import { useToast } from '@/components/ui/use-toast';
import { Sale } from '@/types/sales';
import { SaleItemWithInventory } from '../../sale-data/loadSaleItems';

export function useReturnFormHandler() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ReturnFormValues>({
    resolver: zodResolver(returnFormSchema),
    defaultValues: {
      sale_id: '',
      reason: '',
      items: []
    }
  });
  
  const prepareFormItems = (
    itemsData: SaleItemWithInventory[]
  ) => {
    const formItems = itemsData.map((item: SaleItemWithInventory) => ({
      product_name: item.product_name,
      quantity: 1,
      price: item.price,
      cost_price: item.cost_price || 0,
      inventory_id: item.inventory_id,
      max_quantity: item.quantity
    }));
    
    form.setValue('items', formItems);
  };

  const resetForm = () => {
    form.reset({
      sale_id: '',
      reason: '',
      items: []
    });
  };
  
  return {
    form,
    isSubmitting,
    setIsSubmitting,
    prepareFormItems,
    resetForm
  };
}
