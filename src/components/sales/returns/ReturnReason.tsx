
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { ReturnFormValues } from '../saleFormSchema';

interface ReturnReasonProps {
  form: UseFormReturn<ReturnFormValues>;
}

export function ReturnReason({ form }: ReturnReasonProps) {
  return (
    <div>
      <Label htmlFor="reason">Reason for Return</Label>
      <Textarea 
        id="reason"
        placeholder="Enter reason for return"
        className="resize-none"
        {...form.register('reason')}
      />
    </div>
  );
}
