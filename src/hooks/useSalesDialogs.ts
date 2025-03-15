
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
    console.log('Editing sale:', sale);
    
    // Only proceed if no operation is in progress
    if (operationInProgress.current) {
      console.log('Operation already in progress, ignoring edit request');
      return;
    }
    
    operationInProgress.current = true;
    
    // Set sale first
    setSelectedSale(sale);
    
    // Then open dialog with a small delay
    setTimeout(() => {
      setIsDialogOpen(true);
      // Reset operation flag after dialog is opened
      operationInProgress.current = false;
    }, 50);
  }, []);

  const handleCreateSale = useCallback(() => {
    console.log('Creating new sale - dialog should open');
    
    // Only proceed if no operation is in progress
    if (operationInProgress.current) {
      console.log('Operation already in progress, ignoring create request');
      return;
    }
    
    operationInProgress.current = true;
    
    // Reset selected sale to null first
    setSelectedSale(null);
    
    // Then open dialog with a small delay
    setTimeout(() => {
      setIsDialogOpen(true);
      // Reset operation flag after dialog is opened
      operationInProgress.current = false;
    }, 50);
  }, []);

  const handleViewInvoice = useCallback(async (sale: Sale) => {
    // Only proceed if no operation is in progress
    if (operationInProgress.current) {
      return;
    }
    
    operationInProgress.current = true;
    
    try {
      const { data, error } = await supabase
        .from('sale_items')
        .select('*')
        .eq('sale_id', sale.id);
        
      if (error) throw error;
      
      setSelectedSale(sale);
      setInvoiceSaleItems(data || []);
      setIsInvoiceDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "Error loading invoice",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      // Reset operation flag after completion
      operationInProgress.current = false;
    }
  }, [toast]);

  const handleReturn = useCallback(() => {
    console.log('Opening return dialog');
    
    // Only proceed if no operation is in progress
    if (operationInProgress.current) {
      return;
    }
    
    operationInProgress.current = true;
    
    setIsReturnDialogOpen(true);
    
    // Reset operation flag shortly after
    setTimeout(() => {
      operationInProgress.current = false;
    }, 50);
  }, []);

  // Create a safe setter for the dialog that handles the operationInProgress flag
  const safeSetIsDialogOpen = useCallback((open: boolean) => {
    if (!open) {
      // When closing, ensure we reset any state that needs resetting
      setSelectedSale(null);
    }
    setIsDialogOpen(open);
  }, []);

  return {
    selectedSale,
    isDialogOpen,
    setIsDialogOpen: safeSetIsDialogOpen,
    isInvoiceDialogOpen,
    setIsInvoiceDialogOpen,
    isReturnDialogOpen,
    setIsReturnDialogOpen,
    invoiceSaleItems,
    handleEditSale,
    handleCreateSale,
    handleViewInvoice,
    handleReturn
  };
}
