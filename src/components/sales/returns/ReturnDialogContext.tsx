
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Sale } from '@/pages/Sales';
import { ReturnFormValues } from '../saleFormSchema';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

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

interface ReturnDialogContextType {
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  selectedSale: Sale | null;
  setSelectedSale: React.Dispatch<React.SetStateAction<Sale | null>>;
  saleItems: SaleItemWithInventory[];
  setSaleItems: React.Dispatch<React.SetStateAction<SaleItemWithInventory[]>>;
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  fetchSales: () => Promise<void>;
  handleSaleChange: (saleId: string) => Promise<void>;
  processReturn: (data: ReturnFormValues) => Promise<void>;
}

const ReturnDialogContext = createContext<ReturnDialogContextType | null>(null);

export function ReturnDialogProvider({ children, onComplete }: { children: ReactNode, onComplete: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [saleItems, setSaleItems] = useState<SaleItemWithInventory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  const handleSaleChange = async (saleId: string) => {
    if (!saleId) {
      setSelectedSale(null);
      setSaleItems([]);
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
      setSaleItems(itemsData || []);
      
      return {
        saleData,
        itemsData: itemsData || []
      };
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
      
      for (const item of data.items) {
        if (item.inventory_id) {
          const { data: inventoryData, error: inventoryError } = await supabase
            .from('inventory')
            .select('stock_level, stock_status')
            .eq('id', item.inventory_id)
            .single();
            
          if (inventoryError && inventoryError.code !== 'PGRST116') {
            console.error('Error fetching inventory:', inventoryError);
            continue;
          }
          
          if (inventoryData) {
            const newStockLevel = inventoryData.stock_level + item.quantity;
            let newStockStatus = inventoryData.stock_status;
            
            if (newStockLevel > 0 && inventoryData.stock_status === 'out_of_stock') {
              newStockStatus = newStockLevel <= 5 ? 'low_stock' : 'in_stock';
            } else if (newStockLevel > 5 && inventoryData.stock_status === 'low_stock') {
              newStockStatus = 'in_stock';
            }
            
            await supabase
              .from('inventory')
              .update({
                stock_level: newStockLevel,
                stock_status: newStockStatus,
                updated_at: new Date().toISOString()
              })
              .eq('id', item.inventory_id);
              
            console.log(`Updated inventory for ${item.product_name}: new stock level = ${newStockLevel}`);
          }
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
  
  return (
    <ReturnDialogContext.Provider
      value={{
        sales,
        setSales,
        selectedSale,
        setSelectedSale,
        saleItems,
        setSaleItems,
        isSubmitting,
        setIsSubmitting,
        fetchSales,
        handleSaleChange,
        processReturn
      }}
    >
      {children}
    </ReturnDialogContext.Provider>
  );
}

export const useReturnDialog = () => {
  const context = useContext(ReturnDialogContext);
  if (!context) {
    throw new Error('useReturnDialog must be used within a ReturnDialogProvider');
  }
  return context;
};
