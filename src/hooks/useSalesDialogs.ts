
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
    setIsDialogOpen(open);
    
    // Reset selected sale after dialog closes with a delay to prevent UI freeze
    if (!open) {
      setTimeout(() => {
        setSelectedSale(null);
      }, 300);
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

  // Safe handlers for dialog states
  const safeSetIsInvoiceDialogOpen = useCallback((open: boolean) => {
    setIsInvoiceDialogOpen(open);
    
    // Reset items after dialog closes with a delay
    if (!open) {
      setTimeout(() => {
        setInvoiceSaleItems([]);
      }, 300);
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
    handleReturn,
    isLoading
  };
}
