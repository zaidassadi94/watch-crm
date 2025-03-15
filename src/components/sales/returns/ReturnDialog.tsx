
import React, { useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Form } from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { returnFormSchema, ReturnFormValues } from '../saleFormSchema';
import { ReturnDialogProvider, useReturnDialog } from './ReturnDialogContext';
import { SaleSelector } from './SaleSelector';
import { ReturnReason } from './ReturnReason';
import { ReturnItemsList } from './ReturnItemsList';

interface ReturnDialogContentProps {
  onOpenChange: (open: boolean) => void;
}

function ReturnDialogContent({ onOpenChange }: ReturnDialogContentProps) {
  const { isSubmitting, selectedSale, fetchSales, processReturn } = useReturnDialog();
  
  const form = useForm<ReturnFormValues>({
    resolver: zodResolver(returnFormSchema),
    defaultValues: {
      sale_id: '',
      reason: '',
      items: []
    }
  });
  
  useEffect(() => {
    fetchSales();
  }, [fetchSales]);
  
  const onSubmit = async (data: ReturnFormValues) => {
    await processReturn(data);
    onOpenChange(false);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <SaleSelector form={form} />
          
          {selectedSale && (
            <>
              <ReturnReason form={form} />
              <ReturnItemsList form={form} />
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
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
  );
}

interface ReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function ReturnDialog({ open, onOpenChange, onComplete }: ReturnDialogProps) {
  return (
    <Dialog 
      open={open} 
      onOpenChange={(value) => {
        onOpenChange(value);
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Process Return</DialogTitle>
          <DialogDescription>
            Select a sale and items to return
          </DialogDescription>
        </DialogHeader>
        
        <ReturnDialogProvider onComplete={onComplete}>
          <ReturnDialogContent onOpenChange={onOpenChange} />
        </ReturnDialogProvider>
      </DialogContent>
    </Dialog>
  );
}
