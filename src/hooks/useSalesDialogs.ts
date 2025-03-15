
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
  
  // Clean way to handle dialog state
  const safeSetIsDialogOpen = useCallback((open: boolean) => {
    if (!open) {
      setIsDialogOpen(false);
      // Reset selected sale after dialog closes
      setTimeout(() => {
        setSelectedSale(null);
      }, 300);
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
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: "Error loading invoice",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast, isLoading]);

  const handleReturn = useCallback(() => {
    if (isLoading) return;
    setIsReturnDialogOpen(true);
  }, [isLoading]);

  // Safe handlers for dialog states
  const safeSetIsInvoiceDialogOpen = useCallback((open: boolean) => {
    if (!open) {
      setIsInvoiceDialogOpen(false);
      // Reset items after dialog closes
      setTimeout(() => {
        setInvoiceSaleItems([]);
      }, 300);
    } else {
      setIsInvoiceDialogOpen(open);
    }
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
    handleReturn,
    isLoading
  };
}
