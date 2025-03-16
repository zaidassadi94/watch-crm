
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Sale } from '@/types/sales';
import { SaleItemWithInventory } from '../../sale-data/loadSaleItems';
import { useAuth } from '@/hooks/useAuth';

export function useSaleReturnData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [selectedSaleItems, setSelectedSaleItems] = useState<SaleItemWithInventory[]>([]);
  
  const fetchSales = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast({
        title: 'Error fetching sales',
        description: 'Could not load completed sales',
        variant: 'destructive'
      });
    }
  }, [user, toast]);
  
  const handleSaleChange = async (saleId: string) => {
    // Don't proceed if saleId is empty or invalid
    if (!saleId || saleId === '_empty') {
      setSelectedSale(null);
      setSelectedSaleItems([]);
      return null;
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
      setSelectedSaleItems(itemsData || []);
      
      return { saleData, itemsData: itemsData || [] };
    } catch (error) {
      console.error('Error fetching sale details:', error);
      toast({
        title: 'Error',
        description: 'Could not load sale details',
        variant: 'destructive'
      });
      return null;
    }
  };
  
  return {
    sales,
    selectedSale,
    selectedSaleItems,
    fetchSales,
    handleSaleChange,
    setSelectedSale,
    setSelectedSaleItems
  };
}
