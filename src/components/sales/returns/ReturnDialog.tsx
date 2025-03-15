
import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { returnFormSchema, ReturnFormValues } from '../saleFormSchema';
import { useReturnDialog, ReturnDialogProvider } from './ReturnDialogContext';
import { SaleSelector } from './SaleSelector';
import { ReturnItemsList } from './ReturnItemsList';
import { ReturnReason } from './ReturnReason';
import { Button } from '@/components/ui/button';
import { Sale } from '@/types/sales'; // Import from types instead of pages

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
