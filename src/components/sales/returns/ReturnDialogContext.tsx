
import React, { createContext, useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { returnFormSchema, ReturnFormValues } from '../saleFormSchema';
import { Sale } from '@/types/sales';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { updateInventoryStock } from '../hooks/sale-data';

interface SaleItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  cost_price: number;
  inventory_id?: string;
}

interface ReturnDialogContextProps {
  form: ReturnContextForm;
  sales: Sale[];
  selectedSaleItems: SaleItem[];
  selectedSale: Sale | null;
  isSubmitting: boolean;
  fetchSales: () => Promise<void>;
  handleSaleSelect: (saleId: string) => Promise<void>;
  handleSaleChange: (saleId: string) => Promise<{itemsData: any[]} | null>;
  processReturn: (data: ReturnFormValues) => Promise<void>;
}

type ReturnContextForm = ReturnType<typeof useForm<ReturnFormValues>>;

const ReturnDialogContext = createContext<ReturnDialogContextProps | undefined>(undefined);

export function useReturnDialog() {
  const context = useContext(ReturnDialogContext);
  if (context === undefined) {
    throw new Error('useReturnDialog must be used within a ReturnDialogProvider');
  }
  return context;
}

interface ReturnDialogProviderProps {
  children: React.ReactNode;
  onComplete: () => void;
}

export function ReturnDialogProvider({ children, onComplete }: ReturnDialogProviderProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedSaleItems, setSelectedSaleItems] = useState<SaleItem[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReturnFormValues>({
    resolver: zodResolver(returnFormSchema),
    defaultValues: {
      sale_id: '',
      reason: '',
      items: []
    }
  });

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
      
      setSales(data as Sale[]);
    } catch (error: any) {
      toast({
        title: "Error fetching sales",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaleSelect = async (saleId: string) => {
    if (!saleId) {
      setSelectedSaleItems([]);
      setSelectedSale(null);
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
      
      const { data, error } = await supabase
        .from('sale_items')
        .select('*')
        .eq('sale_id', saleId);
        
      if (error) throw error;
      
      setSelectedSaleItems(data);
      
      // Set the items in the form
      form.setValue('items', data.map(item => ({
        product_name: item.product_name,
        quantity: 1, // Default to returning 1 item
        price: item.price,
        cost_price: item.cost_price || 0,
        inventory_id: item.inventory_id,
        max_quantity: item.quantity, // Maximum returnable is what was purchased
      })));
    } catch (error: any) {
      toast({
        title: "Error loading sale items",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleSaleChange = async (saleId: string) => {
    if (!saleId) {
      setSelectedSaleItems([]);
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
      setSelectedSaleItems(itemsData || []);
      
      return { itemsData };
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
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to process returns",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Calculate return amount and profit adjustment
      const returnTotal = data.items.reduce(
        (sum, item) => sum + (item.quantity * item.price), 
        0
      );
      
      const profitAdjustment = data.items.reduce(
        (sum, item) => sum + (item.quantity * (item.price - (item.cost_price || 0))), 
        0
      );
      
      // Add return record
      const { data: returnData, error } = await supabase
        .from('returns')
        .insert({
          user_id: user.id,
          sale_id: data.sale_id,
          total_amount: returnTotal,  // Changed from return_amount to total_amount
          reason: data.reason || null,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Add return items
      const { error: itemsError } = await supabase
        .from('return_items')
        .insert(
          data.items
            .filter(item => item.quantity > 0) // Only include items with quantity
            .map(item => ({
              return_id: returnData.id,
              product_name: item.product_name,
              quantity: item.quantity,
              price: item.price,
              cost_price: item.cost_price || 0,
              subtotal: item.quantity * item.price,
              inventory_id: item.inventory_id
            }))
        );
        
      if (itemsError) throw itemsError;
      
      // Update original sale total and profit
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .select('total_amount, total_profit')
        .eq('id', data.sale_id)
        .single();
        
      if (saleError) throw saleError;
      
      const updatedAmount = Math.max(0, saleData.total_amount - returnTotal);
      const updatedProfit = Math.max(0, saleData.total_profit - profitAdjustment);
      
      const { error: updateError } = await supabase
        .from('sales')
        .update({
          total_amount: updatedAmount,
          total_profit: updatedProfit,
          status: updatedAmount === 0 ? 'returned' : 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', data.sale_id);
        
      if (updateError) throw updateError;
      
      // Update inventory for returned items
      for (const item of data.items) {
        if (item.quantity > 0 && item.inventory_id) {
          await updateInventoryStock({
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.price,
            cost_price: item.cost_price || 0,
            inventory_id: item.inventory_id
          }, false);
        }
      }
      
      toast({
        title: "Return processed",
        description: `Return for ${returnTotal.toFixed(2)} has been processed successfully`,
      });
      
      // Reset form and close dialog
      form.reset();
      setSelectedSaleItems([]);
      onComplete();
    } catch (error: any) {
      toast({
        title: "Error processing return",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const value = {
    form,
    sales,
    selectedSaleItems,
    selectedSale,
    isSubmitting,
    fetchSales,
    handleSaleSelect,
    handleSaleChange,
    processReturn
  };

  return (
    <ReturnDialogContext.Provider value={value}>
      {children}
    </ReturnDialogContext.Provider>
  );
}
