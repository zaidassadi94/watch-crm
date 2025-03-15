
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ReturnDialogProvider } from './ReturnDialogContext';
import { SaleSelector } from './SaleSelector';
import { ReturnItemsList } from './ReturnItemsList';
import { ReturnReason } from './ReturnReason';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

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
        </DialogHeader>
        
        <ReturnDialogProvider onComplete={handleComplete}>
          <div className="space-y-6">
            <SaleSelector />
            <ReturnItemsList />
            <ReturnReason />
            
            <DialogFooter className="flex flex-row justify-end gap-2 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </DialogFooter>
          </div>
        </ReturnDialogProvider>
      </DialogContent>
    </Dialog>
  );
}
