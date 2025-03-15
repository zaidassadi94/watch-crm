
import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { returnFormSchema, ReturnFormValues } from '../saleFormSchema';
import { SaleItemInternal, calculateTotal } from '../saleFormSchema';
import { Sale } from '@/types/sales';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SaleSelector } from './SaleSelector';
import { ReturnItemsList } from './ReturnItemsList';
import { ReturnReason } from './ReturnReason';
import { ReturnDialogProvider, useReturnDialog } from './ReturnDialogContext';

function ReturnDialogContent({ onClose }: { onClose: () => void }) {
  const { 
    form, 
    selectedSaleItems,
    isSubmitting,
    fetchSales,
    processReturn 
  } = useReturnDialog();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(processReturn)} className="space-y-6">
        <SaleSelector />
        
        {selectedSaleItems.length > 0 && (
          <>
            <ReturnItemsList />
            <ReturnReason />
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Process Return"}
              </Button>
            </div>
          </>
        )}
      </form>
    </Form>
  );
}

export function ReturnDialog({
  open,
  setOpen,
  onComplete
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onComplete: () => void;
}) {
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Process Return</DialogTitle>
        </DialogHeader>
        
        <ReturnDialogProvider onComplete={onComplete}>
          <ReturnDialogContent onClose={handleClose} />
        </ReturnDialogProvider>
      </DialogContent>
    </Dialog>
  );
}
