
import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { returnFormSchema, ReturnFormValues } from '../saleFormSchema';
import { useReturnDialog, ReturnDialogProvider } from './ReturnDialogContext';
import { SaleSelector } from './SaleSelector';
import { ReturnItemsList } from './ReturnItemsList';
import { ReturnReason } from './ReturnReason';
import { Button } from '@/components/ui/button';
import { Sale } from '@/types/sales';

function ReturnDialogContent({ onClose }: { onClose: () => void }) {
  const { 
    form, 
    selectedSaleItems,
    isSubmitting,
    fetchSales,
    processReturn 
  } = useReturnDialog();

  React.useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(processReturn)} className="space-y-6">
        <SaleSelector form={form} />
        
        {selectedSaleItems.length > 0 && (
          <>
            <ReturnItemsList form={form} />
            <ReturnReason form={form} />
            
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
  onOpenChange,
  onComplete
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}) {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen => {
      // Only allow closing if user explicitly clicks close button
      // This prevents issues with the dialog disappearing unexpectedly
      if (!setOpen) {
        onOpenChange(false);
      }
    }}>
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
