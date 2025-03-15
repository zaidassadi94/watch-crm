
import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { UseFormReturn } from 'react-hook-form';
import { SaleFormValues } from './saleFormSchema';

interface SaleDialogActionsProps {
  form: UseFormReturn<SaleFormValues>;
  isSubmitting: boolean;
  onCancel: () => void;
  isEditMode?: boolean;
}

export function SaleDialogActions({ form, isSubmitting, onCancel, isEditMode }: SaleDialogActionsProps) {
  return (
    <DialogFooter className="flex flex-row justify-end gap-2 mt-6">
      <Button 
        type="button" 
        variant="outline" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isSubmitting) {
            onCancel();
          }
        }}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        onClick={(e) => {
          // Prevent event bubbling which can cause issues with dialog closing
          e.stopPropagation();
        }}
      >
        {isSubmitting 
          ? 'Saving...' 
          : isEditMode 
            ? 'Update Sale'
            : 'Create Sale'
        }
      </Button>
    </DialogFooter>
  );
}
