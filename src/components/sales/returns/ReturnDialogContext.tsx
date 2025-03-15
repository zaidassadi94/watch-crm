
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Sale } from '@/types/sales';
import { useToast } from '@/components/ui/use-toast';

interface ReturnDialogContextProps {
  sales: Sale[];
  selectedSale: Sale | null;
  handleSaleChange: (saleId: string) => Promise<{ saleData: Sale; itemsData: any[] } | null>;
}

const ReturnDialogContext = createContext<ReturnDialogContextProps | undefined>(undefined);

export function useReturnDialog() {
  const context = useContext(ReturnDialogContext);
  if (!context) {
    throw new Error('useReturnDialog must be used within a ReturnDialogProvider');
  }
  return context;
}

interface ReturnDialogProviderProps {
  children: ReactNode;
}

export function ReturnDialogProvider({ children }: ReturnDialogProviderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  React.useEffect(() => {
    const fetchSales = async () => {
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
    };
    
    fetchSales();
  }, [user, toast]);

  const handleSaleChange = async (saleId: string) => {
    if (!saleId) {
      setSelectedSale(null);
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

  const value = {
    sales,
    selectedSale,
    handleSaleChange
  };

  return (
    <ReturnDialogContext.Provider value={value}>
      {children}
    </ReturnDialogContext.Provider>
  );
}
