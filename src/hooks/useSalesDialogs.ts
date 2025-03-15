
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

  const handleEditSale = useCallback((sale: Sale) => {
    console.log('Editing sale:', sale);
    // Set sale first, then open dialog
    setSelectedSale(sale);
    setTimeout(() => {
      setIsDialogOpen(true);
    }, 50);
  }, []);

  const handleCreateSale = useCallback(() => {
    console.log('Creating new sale - dialog should open');
    // Reset selected sale to null first
    setSelectedSale(null);
    // Then open dialog with a small delay
    setTimeout(() => {
      setIsDialogOpen(true);
    }, 50);
  }, []);

  const handleViewInvoice = useCallback(async (sale: Sale) => {
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
    }
  }, [toast]);

  const handleReturn = useCallback(() => {
    console.log('Opening return dialog');
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
    handleEditSale,
    handleCreateSale,
    handleViewInvoice,
    handleReturn
  };
}
