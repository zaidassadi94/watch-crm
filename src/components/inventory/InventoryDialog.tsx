
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSettings } from '@/hooks/useSettings';
import { InventoryItem } from '@/types/inventory';
import { InventoryForm } from './dialog/InventoryForm';

interface InventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  onSaved: () => void;
}

export function InventoryDialog({ open, onOpenChange, item, onSaved }: InventoryDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localOpen, setLocalOpen] = useState(false);
  const { currencySymbol } = useSettings();
  
  useEffect(() => {
    // Control local state based on props
    setLocalOpen(open);
  }, [open]);

  const handleCancel = () => {
    setLocalOpen(false);
    onOpenChange(false);
  };

  return (
    <Dialog 
      open={localOpen} 
      onOpenChange={(newOpen) => {
        if (!newOpen && !isSubmitting) {
          handleCancel();
        } else {
          setLocalOpen(newOpen);
          onOpenChange(newOpen);
        }
      }}
    >
      <DialogContent className="max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        
        <InventoryForm 
          item={item} 
          onSaved={() => {
            setLocalOpen(false);
            onOpenChange(false);
            onSaved();
          }}
          onCancel={handleCancel}
          currencySymbol={currencySymbol}
        />
      </DialogContent>
    </Dialog>
  );
}
