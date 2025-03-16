
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

  // Handle safe dialog closing to prevent freezing
  const safeCloseDialog = useCallback(() => {
    if (isProcessing) return; // Do not close while processing
    setIsDialogOpen(false);
    clearState();
  }, [clearState, isProcessing]);

  // Set dialog open state with safeguards
  const safeSetDialogOpen = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      safeCloseDialog();
    } else {
      setIsDialogOpen(true);
    }
  }, [safeCloseDialog]);

  // Handle edit sale action
  const handleEditSale = useCallback(async (sale: Sale) => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      setSelectedSale(sale);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error preparing sale edit:", error);
      toast({
        title: "Error",
        description: "Could not load sale details for editing",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast, isProcessing]);

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
    setIsDialogOpen: safeSetDialogOpen,
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
    clearState
  };
}
