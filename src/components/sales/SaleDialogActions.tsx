
import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

interface SaleDialogActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  isEditMode: boolean;
}

export function SaleDialogActions({ isSubmitting, onCancel, isEditMode }: SaleDialogActionsProps) {
  return (
    <DialogFooter className="flex flex-row justify-end gap-2 mt-6">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting}>
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
