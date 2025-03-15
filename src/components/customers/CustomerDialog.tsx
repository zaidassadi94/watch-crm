import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Customer } from './useCustomerManagement';
import { CustomerForm } from './forms/CustomerForm';
import { useCustomerForm } from './hooks/useCustomerForm';

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onSaved: () => void;
}

export function CustomerDialog({ open, onOpenChange, customer, onSaved }: CustomerDialogProps) {
  const [localOpen, setLocalOpen] = useState(false);
  
  // Initialize form and handlers
  const { 
    form, 
    isSubmitting, 
    onSubmit, 
    handleClose 
  } = useCustomerForm(customer, onSaved, () => onOpenChange(false));

  // Keep local state in sync with props
  useEffect(() => {
    setLocalOpen(open);
  }, [open]);

  return (
    <Dialog 
      open={localOpen} 
      onOpenChange={(newOpen) => {
        if (!newOpen && !isSubmitting) {
          handleClose();
        } else {
          setLocalOpen(newOpen);
          onOpenChange(newOpen);
        }
      }}
    >
      <DialogContent 
        className="sm:max-w-md overflow-y-auto max-h-[90vh]" 
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>{customer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          <CustomerForm 
            form={form}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            onCancel={handleClose}
            isEditMode={!!customer}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
