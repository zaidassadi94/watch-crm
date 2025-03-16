
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sale } from '@/types/sales';
import { SaleItemWithInventory } from '@/components/sales/sale-data';
import { useToast } from '@/components/ui/use-toast';

export function useSalesDialogs() {
  const { toast } = useToast();
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [invoiceSaleItems, setInvoiceSaleItems] = useState<SaleItemWithInventory[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Clear state when dialogs close
  const clearState = useCallback(() => {
    // Small delay to prevent UI conflicts
    setTimeout(() => {
      setSelectedSale(null);
      setInvoiceSaleItems([]);
    }, 300);
  }, []);

  // Handle edit sale action with better error management
  const handleEditSale = useCallback(async (sale: Sale) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      // Make sure we have a fresh copy of the sale
      const { data: freshSale, error: refreshError } = await supabase
        .from('sales')
        .select('*')
        .eq('id', sale.id)
        .single();
        
      if (refreshError) throw refreshError;
      
      // Use the fresh data to avoid stale state issues
      setSelectedSale(freshSale);
      
      // Important: Set dialog open AFTER setting the selected sale to avoid race conditions
      setTimeout(() => {
        setIsDialogOpen(true);
        setIsProcessing(false);
      }, 50);
      
    } catch (error) {
      console.error("Error preparing sale edit:", error);
      toast({
        title: "Error",
        description: "Could not load sale details for editing",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  }, [toast, isProcessing]);

  // Create a safe handle close that respects processing state
  const handleCloseDialog = useCallback(() => {
    if (isProcessing) return;
    
    setIsDialogOpen(false);
    clearState();
  }, [clearState, isProcessing]);

  // Handle create sale action
  const handleCreateSale = useCallback(() => {
    if (isProcessing) return;
    
    setSelectedSale(null);
    setIsDialogOpen(true);
  }, [isProcessing]);

  // Handle view invoice action
  const handleViewInvoice = useCallback(async (sale: Sale) => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      setSelectedSale(sale);
      // Load sale items
      const { data, error } = await supabase
        .from('sale_items')
        .select('*')
        .eq('sale_id', sale.id);
        
      if (error) throw error;
      
      setInvoiceSaleItems(data || []);
      setIsInvoiceDialogOpen(true);
    } catch (error) {
      console.error("Error loading invoice:", error);
      toast({
        title: "Error",
        description: "Could not load invoice details",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast, isProcessing]);

  // Handle return action
  const handleReturn = useCallback(() => {
    setIsReturnDialogOpen(true);
  }, []);

  return {
    selectedSale,
    isDialogOpen,
    setIsDialogOpen,
    isInvoiceDialogOpen,
    setIsInvoiceDialogOpen,
    isReturnDialogOpen,
    setIsReturnDialogOpen,
    invoiceSaleItems,
    isProcessing,
    handleEditSale,
    handleCreateSale,
    handleViewInvoice,
    handleReturn,
    clearState,
    handleCloseDialog
  };
}
