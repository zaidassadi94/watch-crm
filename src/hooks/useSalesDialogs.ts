
import { useState, useCallback, useRef } from 'react';
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
  
  // Use refs to track ongoing operations and prevent race conditions
  const operationInProgress = useRef(false);

  const handleEditSale = useCallback((sale: Sale) => {
    if (operationInProgress.current) {
      console.log('Operation already in progress, ignoring edit request');
      return;
    }
    
    operationInProgress.current = true;
    console.log('Editing sale:', sale);
    
    try {
      // First set the selected sale
      setSelectedSale(sale);
      
      // Then open dialog after a small delay to ensure state is updated
      setTimeout(() => {
        setIsDialogOpen(true);
      }, 50);
    } catch (error) {
      console.error('Error in handleEditSale:', error);
    } finally {
      // Reset operation flag
      setTimeout(() => {
        operationInProgress.current = false;
      }, 100);
    }
  }, []);

  const handleCreateSale = useCallback(() => {
    if (operationInProgress.current) {
      console.log('Operation already in progress, ignoring create request');
      return;
    }
    
    operationInProgress.current = true;
    console.log('Creating new sale');
    
    try {
      // Reset selected sale to null first
      setSelectedSale(null);
      
      // Then open dialog after a small delay to ensure state is updated
      setTimeout(() => {
        setIsDialogOpen(true);
      }, 50);
    } catch (error) {
      console.error('Error in handleCreateSale:', error);
    } finally {
      // Reset operation flag
      setTimeout(() => {
        operationInProgress.current = false;
      }, 100);
    }
  }, []);

  const handleViewInvoice = useCallback(async (sale: Sale) => {
    if (operationInProgress.current) {
      console.log('Operation already in progress, ignoring view invoice request');
      return;
    }
    
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
      }, 50);
    } catch (error: any) {
      toast({
        title: "Error loading invoice",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      // Reset operation flag
      setTimeout(() => {
        operationInProgress.current = false;
      }, 100);
    }
  }, [toast]);

  const handleReturn = useCallback(() => {
    if (operationInProgress.current) {
      console.log('Operation already in progress, ignoring return request');
      return;
    }
    
    operationInProgress.current = true;
    console.log('Opening return dialog');
    
    try {
      // Open return dialog
      setTimeout(() => {
        setIsReturnDialogOpen(true);
      }, 50);
    } catch (error) {
      console.error('Error in handleReturn:', error);
    } finally {
      // Reset operation flag
      setTimeout(() => {
        operationInProgress.current = false;
      }, 100);
    }
  }, []);

  // Create a safe setter for the dialog that handles state properly
  const safeSetIsDialogOpen = useCallback((open: boolean) => {
    console.log('Setting dialog open state to:', open);
    if (!open) {
      // When closing, ensure we reset selected sale
      setTimeout(() => {
        setSelectedSale(null);
      }, 100);
    }
    setIsDialogOpen(open);
  }, []);

  // Safe setter for invoice dialog
  const safeSetIsInvoiceDialogOpen = useCallback((open: boolean) => {
    if (!open) {
      // When closing, reset state with slight delay
      setTimeout(() => {
        setInvoiceSaleItems([]);
      }, 100);
    }
    setIsInvoiceDialogOpen(open);
  }, []);

  return {
    selectedSale,
    isDialogOpen,
    setIsDialogOpen: safeSetIsDialogOpen,
    isInvoiceDialogOpen,
    setIsInvoiceDialogOpen: safeSetIsInvoiceDialogOpen,
    isReturnDialogOpen,
    setIsReturnDialogOpen,
    invoiceSaleItems,
    handleEditSale,
    handleCreateSale,
    handleViewInvoice,
    handleReturn
  };
}
