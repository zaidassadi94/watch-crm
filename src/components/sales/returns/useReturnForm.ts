
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { returnFormSchema, ReturnFormValues } from '../saleFormSchema';
import { updateInventoryStock } from '../sale-data';
import { Sale } from '@/types/sales';

interface SaleItemWithInventory {
  id: string;
  sale_id: string;
  product_name: string;
  quantity: number;
  price: number;
  cost_price: number | null;
  subtotal: number;
  created_at: string;
  inventory_id?: string;
}

export function useReturnForm(onComplete: () => void) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [saleItems, setSaleItems] = useState<SaleItemWithInventory[]>([]);
  
  const form = useForm<ReturnFormValues>({
    resolver: zodResolver(returnFormSchema),
    defaultValues: {
      sale_id: '',
      reason: '',
      items: []
    }
  });
  
  const handleSaleChange = async (saleId: string) => {
    form.setValue('sale_id', saleId);
    
    if (!saleId) {
      setSelectedSale(null);
      setSaleItems([]);
      form.setValue('items', []);
      return;
    }
    
    try {
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .select('*')
        .eq('id', saleId)
        .single();
        
      if (saleError) throw saleError;
      setSelectedSale(saleData);
      
      const { data: itemsData, error: itemsError } = await supabase
        .from('sale_items')
        .select('*')
        .eq('sale_id', saleId);
        
      if (itemsError) throw itemsError;
      setSaleItems(itemsData || []);
      
      const formItems = itemsData.map((item: SaleItemWithInventory) => ({
        product_name: item.product_name,
        quantity: 1,
        price: item.price,
        cost_price: item.cost_price || 0,
        inventory_id: item.inventory_id,
        max_quantity: item.quantity
      }));
      
      form.setValue('items', formItems);
    } catch (error) {
      console.error('Error fetching sale details:', error);
      toast({
        title: 'Error',
        description: 'Could not load sale details',
        variant: 'destructive'
      });
    }
  };
  
  const processReturn = async (data: ReturnFormValues) => {
    if (!user || !selectedSale) return;
    
    setIsSubmitting(true);
    
    try {
      const totalAmount = data.items.reduce(
        (sum, item) => sum + (item.quantity * item.price), 
        0
      );
      
      const { data: returnData, error: returnError } = await supabase
        .from('returns')
        .insert({
          sale_id: data.sale_id,
          user_id: user.id,
          reason: data.reason,
          total_amount: totalAmount,
          status: 'completed'
        })
        .select()
        .single();
        
      if (returnError) throw returnError;
      
      const returnItems = data.items.map(item => ({
        return_id: returnData.id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        cost_price: item.cost_price || 0,
        subtotal: item.quantity * item.price
      }));
      
      const { error: itemsError } = await supabase
        .from('return_items')
        .insert(returnItems);
        
      if (itemsError) throw itemsError;
      
      // Update the sale status to "returned"
      const { error: updateSaleError } = await supabase
        .from('sales')
        .update({ status: 'returned' })
        .eq('id', data.sale_id);
        
      if (updateSaleError) throw updateSaleError;
      
      // Update inventory for each returned item
      for (const item of data.items) {
        if (item.inventory_id) {
          await updateInventoryStock({
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.price,
            cost_price: item.cost_price || 0,
            inventory_id: item.inventory_id
          }, false); // false for return (increases stock)
        }
      }
      
      toast({
        title: 'Return processed',
        description: 'Return has been successfully processed',
      });
      
      onComplete();
    } catch (error: any) {
      console.error('Error processing return:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process return',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    selectedSale,
    saleItems,
    handleSaleChange,
    processReturn
  };
}
