
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form } from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';
import { ReturnDialogProvider } from './ReturnDialogContext';
import { SaleSelection } from './SaleSelection';
import { ReturnReason } from './ReturnReason';
import { ReturnItems } from './ReturnItems';

interface ReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function ReturnDialog({ open, onOpenChange, onComplete }: ReturnDialogProps) {
  const [localOpen, setLocalOpen] = useState(false);
  
  // Use local state to ensure dialog stays visible during form submission
  useEffect(() => {
    if (open) {
      setLocalOpen(true);
    }
  }, [open]);
  
  const handleComplete = () => {
    onComplete();
    setLocalOpen(false);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalOpen(false);
    onOpenChange(false);
  };
  
  return (
    <Dialog 
      open={localOpen} 
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          handleCancel();
        }
      }}
    >
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Process Return</DialogTitle>
          <DialogDescription>
            Select a sale and items to return
          </DialogDescription>
        </DialogHeader>
        
        <ReturnDialogProvider onComplete={handleComplete}>
          {({ form, isSubmitting, selectedSale, sales, handleSaleChange, processReturn }) => (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(processReturn)} className="space-y-6">
                <SaleSelection 
                  form={form} 
                  sales={sales} 
                  onSaleChange={handleSaleChange} 
                />
                
                {selectedSale && (
                  <>
                    <ReturnReason form={form} />
                    <ReturnItems form={form} />
                  </>
                )}
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !selectedSale || form.watch('items').length === 0}
                  >
                    <Undo2 className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Processing...' : 'Process Return'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </ReturnDialogProvider>
      </DialogContent>
    </Dialog>
  );
}
