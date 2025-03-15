
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { returnFormSchema, ReturnFormValues } from '../saleFormSchema';
import { Sale } from '@/types/sales';
import { updateInventoryStock } from '../sale-data';

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

interface ReturnDialogContextProps {
  form: ReturnFormReturn;
  selectedSale: Sale | null;
  selectedSaleItems: SaleItemWithInventory[];
  sales: Sale[]; 
  isSubmitting: boolean;
  fetchSales: () => Promise<void>;
  handleSaleChange: (saleId: string) => Promise<void>;
  processReturn: (data: ReturnFormValues) => Promise<void>;
}

type ReturnFormReturn = ReturnType<typeof useForm<ReturnFormValues>>;

const ReturnDialogContext = createContext<ReturnDialogContextProps | undefined>(undefined);

export function ReturnDialogProvider({ 
  children, 
  onComplete 
}: { 
  children: React.ReactNode;
  onComplete: () => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [selectedSaleItems, setSelectedSaleItems] = useState<SaleItemWithInventory[]>([]);
  
  const form = useForm<ReturnFormValues>({
    resolver: zodResolver(returnFormSchema),
    defaultValues: {
      sale_id: '',
      reason: '',
      items: []
    }
  });
  
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
    // Don't proceed if saleId is _empty or invalid
    if (!saleId || saleId === '_empty') {
      setSelectedSale(null);
      setSelectedSaleItems([]);
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
      setSelectedSaleItems(itemsData || []);
      
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
      
      form.reset();
      setSelectedSale(null);
      setSelectedSaleItems([]);
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
  
  const contextValue: ReturnDialogContextProps = {
    form,
    selectedSale,
    selectedSaleItems,
    sales,
    isSubmitting,
    fetchSales,
    handleSaleChange,
    processReturn
  };
  
  return (
    <ReturnDialogContext.Provider value={contextValue}>
      {children}
    </ReturnDialogContext.Provider>
  );
}

export function useReturnDialog() {
  const context = useContext(ReturnDialogContext);
  if (context === undefined) {
    throw new Error('useReturnDialog must be used within a ReturnDialogProvider');
  }
  return context;
}
