
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form } from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Sale } from '@/types/sales';
import { useToast } from '@/components/ui/use-toast';
import { useReturnForm } from './useReturnForm';
import { SaleSelection } from './SaleSelection';
import { ReturnReason } from './ReturnReason';
import { ReturnItems } from './ReturnItems';

interface ReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function ReturnDialog({ open, onOpenChange, onComplete }: ReturnDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [localOpen, setLocalOpen] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  
  const { 
    form, 
    isSubmitting, 
    selectedSale, 
    handleSaleChange, 
    processReturn 
  } = useReturnForm(onComplete);
  
  // Use local state to ensure dialog stays visible during form submission
  useEffect(() => {
    if (open) {
      setLocalOpen(true);
      fetchSales();
    }
  }, [open]);
  
  const fetchSales = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast({
        title: 'Error fetching sales',
        description: 'Could not load completed sales',
        variant: 'destructive'
      });
    }
  };
  
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
        if (!newOpen && !isSubmitting) {
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
      </DialogContent>
    </Dialog>
  );
}
