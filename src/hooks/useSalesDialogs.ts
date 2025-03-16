
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
  const [isLoading, setIsLoading] = useState(false);
  
  // Use refs to track state for cleanup functions
  const dialogCleanupTimeoutRef = useRef<number | null>(null);
  const invoiceCleanupTimeoutRef = useRef<number | null>(null);
  const returnCleanupTimeoutRef = useRef<number | null>(null);
  
  // Dialog state management with safety checks
  const safeSetIsDialogOpen = useCallback((open: boolean) => {
    // Clear any pending timeouts to prevent state conflicts
    if (dialogCleanupTimeoutRef.current !== null) {
      clearTimeout(dialogCleanupTimeoutRef.current);
      dialogCleanupTimeoutRef.current = null;
    }
    
    if (!open) {
      // Close the dialog immediately
      setIsDialogOpen(false);
      
      // Reset selected sale with a delay to prevent UI jank
      dialogCleanupTimeoutRef.current = window.setTimeout(() => {
        setSelectedSale(null);
        dialogCleanupTimeoutRef.current = null;
      }, 300);
    } else {
      setIsDialogOpen(true);
    }
  }, []);

  // Handle edit sale with safety checks
  const handleEditSale = useCallback((sale: Sale) => {
    if (isLoading) return;
    
    // Clear any pending dialog cleanup
    if (dialogCleanupTimeoutRef.current !== null) {
      clearTimeout(dialogCleanupTimeoutRef.current);
      dialogCleanupTimeoutRef.current = null;
    }
    
    setSelectedSale(sale);
    safeSetIsDialogOpen(true);
  }, [safeSetIsDialogOpen, isLoading]);

  // Handle create sale with safety checks
  const handleCreateSale = useCallback(() => {
    if (isLoading) return;
    
    // Clear any pending dialog cleanup
    if (dialogCleanupTimeoutRef.current !== null) {
      clearTimeout(dialogCleanupTimeoutRef.current);
      dialogCleanupTimeoutRef.current = null;
    }
    
    setSelectedSale(null);
    safeSetIsDialogOpen(true);
  }, [safeSetIsDialogOpen, isLoading]);

  // Handle view invoice with safety checks
  const handleViewInvoice = useCallback(async (sale: Sale) => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      
      // Clear any pending invoice cleanup
      if (invoiceCleanupTimeoutRef.current !== null) {
        clearTimeout(invoiceCleanupTimeoutRef.current);
        invoiceCleanupTimeoutRef.current = null;
      }
      
      setSelectedSale(sale);
      
      const { data, error } = await supabase
        .from('sale_items')
        .select('*')
        .eq('sale_id', sale.id);
        
      if (error) throw error;
      
      setInvoiceSaleItems(data || []);
      setIsInvoiceDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "Error loading invoice",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, isLoading]);

  // Handle return with safety checks
  const handleReturn = useCallback(() => {
    if (isLoading) return;
    
    // Clear any pending return cleanup
    if (returnCleanupTimeoutRef.current !== null) {
      clearTimeout(returnCleanupTimeoutRef.current);
      returnCleanupTimeoutRef.current = null;
    }
    
    setIsReturnDialogOpen(true);
  }, [isLoading]);

  // Improved dialog state handlers with cleanup management
  const safeSetIsInvoiceDialogOpen = useCallback((open: boolean) => {
    // Clear any pending timeouts
    if (invoiceCleanupTimeoutRef.current !== null) {
      clearTimeout(invoiceCleanupTimeoutRef.current);
      invoiceCleanupTimeoutRef.current = null;
    }
    
    setIsInvoiceDialogOpen(open);
    
    if (!open) {
      // Clear items only after dialog animation has completed
      invoiceCleanupTimeoutRef.current = window.setTimeout(() => {
        setInvoiceSaleItems([]);
        invoiceCleanupTimeoutRef.current = null;
      }, 300);
    }
  }, []);

  const safeSetIsReturnDialogOpen = useCallback((open: boolean) => {
    // Clear any pending timeouts
    if (returnCleanupTimeoutRef.current !== null) {
      clearTimeout(returnCleanupTimeoutRef.current);
      returnCleanupTimeoutRef.current = null;
    }
    
    setIsReturnDialogOpen(open);
    
    if (!open && selectedSale) {
      // Reset selected sale after return dialog closes
      returnCleanupTimeoutRef.current = window.setTimeout(() => {
        setSelectedSale(null);
        returnCleanupTimeoutRef.current = null;
      }, 300);
    }
  }, [selectedSale]);

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
    handleReturn,
    isLoading
  };
}
