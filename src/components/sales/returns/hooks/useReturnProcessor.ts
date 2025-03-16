
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ReturnFormValues } from '../../saleFormSchema';
import { useAuth } from '@/hooks/useAuth';
import { Sale } from '@/types/sales';
import { updateInventoryStock } from '../../sale-data';

export function useReturnProcessor() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const processReturn = async (
    data: ReturnFormValues, 
    selectedSale: Sale | null,
    onComplete: () => void
  ) => {
    if (!user || !selectedSale) return;
    
    setIsProcessing(true);
    
    try {
      const totalAmount = data.items.reduce(
        (sum, item) => sum + (item.quantity * item.price), 
        0
      );
      
      // Create the return record
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
      
      // Add return items
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
      setIsProcessing(false);
    }
  };
  
  return {
    isProcessing,
    processReturn
  };
}
