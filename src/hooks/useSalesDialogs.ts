
import { useState, useCallback } from 'react';
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
  
  // Improved dialog state management to prevent freezing
  const safeSetIsDialogOpen = useCallback((open: boolean) => {
    if (!open) {
      // Close the dialog immediately
      setIsDialogOpen(false);
      // Reset selected sale with a delay to prevent UI jank
      setTimeout(() => {
        setSelectedSale(null);
      }, 100);
    } else {
      setIsDialogOpen(true);
    }
  }, []);

  const handleEditSale = useCallback((sale: Sale) => {
    if (isLoading) return;
    setSelectedSale(sale);
    safeSetIsDialogOpen(true);
  }, [safeSetIsDialogOpen, isLoading]);

  const handleCreateSale = useCallback(() => {
    if (isLoading) return;
    setSelectedSale(null);
    safeSetIsDialogOpen(true);
  }, [safeSetIsDialogOpen, isLoading]);

  const handleViewInvoice = useCallback(async (sale: Sale) => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
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

  const handleReturn = useCallback(() => {
    if (isLoading) return;
    setIsReturnDialogOpen(true);
  }, [isLoading]);

  // Improved dialog state handlers
  const safeSetIsInvoiceDialogOpen = useCallback((open: boolean) => {
    setIsInvoiceDialogOpen(open);
    if (!open) {
      // Clear items only after dialog animation has completed
      setTimeout(() => {
        setInvoiceSaleItems([]);
      }, 100);
    }
  }, []);

  const safeSetIsReturnDialogOpen = useCallback((open: boolean) => {
    setIsReturnDialogOpen(open);
    if (!open && selectedSale) {
      // Reset selected sale after return dialog closes
      setTimeout(() => {
        setSelectedSale(null);
      }, 100);
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
