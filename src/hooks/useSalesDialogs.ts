
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Sale } from '@/types/sales';

export function useSalesDialogs() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [invoiceSaleItems, setInvoiceSaleItems] = useState<any[]>([]);
  
  // Use refs to track ongoing operations
  const operationInProgress = useRef(false);
  
  // Cleanup function when component unmounts
  useEffect(() => {
    return () => {
      // Reset all states when component unmounts
      setIsDialogOpen(false);
      setSelectedSale(null);
      setIsInvoiceDialogOpen(false);
      setIsReturnDialogOpen(false);
      setInvoiceSaleItems([]);
    };
  }, []);

  const handleEditSale = useCallback((sale: Sale) => {
    if (operationInProgress.current) return;
    
    operationInProgress.current = true;
    
    try {
      // First set the selected sale
      setSelectedSale(sale);
      
      // Then after a small delay, open the dialog
      setTimeout(() => {
        setIsDialogOpen(true);
        operationInProgress.current = false;
      }, 50);
    } catch (error) {
      console.error('Error in handleEditSale:', error);
      operationInProgress.current = false;
    }
  }, []);

  const handleCreateSale = useCallback(() => {
    if (operationInProgress.current) return;
    
    operationInProgress.current = true;
    
    try {
      // Reset selected sale to null
      setSelectedSale(null);
      
      // Then open dialog after a small delay
      setTimeout(() => {
        setIsDialogOpen(true);
        operationInProgress.current = false;
      }, 50);
    } catch (error) {
      console.error('Error in handleCreateSale:', error);
      operationInProgress.current = false;
    }
  }, []);

  const handleViewInvoice = useCallback(async (sale: Sale) => {
    if (operationInProgress.current) return;
    
    operationInProgress.current = true;
    
    try {
      // First set the sale
      setSelectedSale(sale);
      
      // Fetch sale items
      const { data, error } = await supabase
        .from('sale_items')
        .select('*')
        .eq('sale_id', sale.id);
        
      if (error) throw error;
      
      // Set the items
      setInvoiceSaleItems(data || []);
      
      // Open the dialog after all data is ready
      setTimeout(() => {
        setIsInvoiceDialogOpen(true);
        operationInProgress.current = false;
      }, 50);
    } catch (error: any) {
      operationInProgress.current = false;
      toast({
        title: "Error loading invoice",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleReturn = useCallback(() => {
    if (operationInProgress.current) return;
    
    operationInProgress.current = true;
    
    try {
      // Open return dialog
      setTimeout(() => {
        setIsReturnDialogOpen(true);
        operationInProgress.current = false;
      }, 50);
    } catch (error) {
      console.error('Error in handleReturn:', error);
      operationInProgress.current = false;
    }
  }, []);

  // Safe setters for dialog states
  const safeSetIsDialogOpen = useCallback((open: boolean) => {
    if (!open) {
      // When closing, reset selected sale with a delay
      setIsDialogOpen(false);
      setTimeout(() => {
        setSelectedSale(null);
      }, 300);
    } else {
      setIsDialogOpen(open);
    }
  }, []);

  const safeSetIsInvoiceDialogOpen = useCallback((open: boolean) => {
    if (!open) {
      // When closing, reset state with a delay
      setIsInvoiceDialogOpen(false);
      setTimeout(() => {
        setInvoiceSaleItems([]);
      }, 300);
    } else {
      setIsInvoiceDialogOpen(open);
    }
  }, []);

  const safeSetIsReturnDialogOpen = useCallback((open: boolean) => {
    setIsReturnDialogOpen(open);
  }, []);

  return {
    selectedSale,
    isDialogOpen,
    setIsDialogOpen: safeSetIsDialogOpen,
    isInvoiceDialogOpen,
    setIsInvoiceDialogOpen: safeSetIsInvoiceDialogOpen,
    isReturnDialogOpen,
    setIsReturnDialogOpen: safeSetIsReturnDialogOpen,
    invoiceSaleItems,
    handleEditSale,
    handleCreateSale,
    handleViewInvoice,
    handleReturn
  };
}
