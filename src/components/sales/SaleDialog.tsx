
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from '@/components/ui/dialog';
import { Sale } from '@/types/sales';
import { useAuth } from '@/hooks/useAuth';
import { ProductSuggestion, CustomerSuggestion } from '@/types/inventory';
import { supabase } from '@/integrations/supabase/client';
import { CustomerForm } from './CustomerForm';
import { SaleItemForm } from './SaleItemForm';
import { SaleNotesField } from './SaleNotesField';
import { SaleDialogActions } from './SaleDialogActions';
import { useSaleForm } from './hooks/useSaleForm';
import { useSuggestions } from './useSuggestions';

interface SaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
  onSaved: () => void;
}

export function SaleDialog({ open, onOpenChange, sale, onSaved }: SaleDialogProps) {
  const { user } = useAuth();
  const [localOpen, setLocalOpen] = useState(false);
  
  // Use local state to ensure dialog stays visible during form submission
  useEffect(() => {
    if (open) {
      setLocalOpen(true);
    }
  }, [open]);
  
  const {
    productSuggestions,
    showProductSuggestions,
    setShowProductSuggestions,
    productSearchTerms,
    updateProductSearchTerms,
    handleProductSearch,
    customerSuggestions,
    showCustomerSuggestions,
    setShowCustomerSuggestions,
    setCustomerSearchTerm
  } = useSuggestions(user?.id);

  const handleSaved = () => {
    onSaved();
    // Use setTimeout to prevent state update issues
    setTimeout(() => {
      setLocalOpen(false);
      onOpenChange(false);
    }, 100);
  };

  const handleCancel = () => {
    setLocalOpen(false);
    onOpenChange(false);
  };

  const { form, isSubmitting, onSubmit } = useSaleForm(
    sale, 
    user?.id, 
    handleSaved,
    handleCancel
  );

  // Update product search terms when form is loaded
  useEffect(() => {
    if (open) {
      if (sale) {
        const fetchSaleItems = async () => {
          try {
            const { data } = await supabase
              .from('sale_items')
              .select('*')
              .eq('sale_id', sale.id);
              
            if (data) {
              updateProductSearchTerms(data.map(() => "") || []);
            }
          } catch (error) {
            console.error("Error fetching sale items:", error);
          }
        };
        
        fetchSaleItems();
      } else {
        updateProductSearchTerms(['']);
      }
    }
  }, [sale, updateProductSearchTerms, open]);

  const selectProduct = (product: ProductSuggestion, index: number) => {
    form.setValue(`items.${index}.product_name`, `${product.brand} ${product.name} (${product.sku})`);
    form.setValue(`items.${index}.price`, product.price);
    form.setValue(`items.${index}.cost_price`, product.cost_price || 0);
    form.setValue(`items.${index}.inventory_id`, product.id);
    setShowProductSuggestions(null);
  };

  const selectCustomer = (customer: CustomerSuggestion) => {
    form.setValue('customer_name', customer.name);
    if (customer.email) form.setValue('customer_email', customer.email);
    if (customer.phone) form.setValue('customer_phone', customer.phone);
    setShowCustomerSuggestions(false);
  };

  // Explicitly log dialog state for debugging
  console.log('SaleDialog state:', { open, localOpen, isSubmitting });

  return (
    <Dialog 
      open={localOpen} 
      onOpenChange={(newOpen) => {
        console.log('Dialog onOpenChange:', newOpen, 'isSubmitting:', isSubmitting);
        // Only allow dialog to close when not submitting
        if (!isSubmitting && !newOpen) {
          handleCancel();
        }
      }}
    >
      <DialogContent 
        className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>{sale ? 'Edit Sale' : 'Create New Sale'}</DialogTitle>
          <DialogDescription>
            {sale ? 'Update the details of this sale' : 'Enter the details for the new sale'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CustomerForm 
            form={form}
            customerSuggestions={customerSuggestions}
            showCustomerSuggestions={showCustomerSuggestions}
            setCustomerSearchTerm={setCustomerSearchTerm}
            selectCustomer={selectCustomer}
          />
          
          <SaleItemForm
            form={form}
            productSuggestions={productSuggestions}
            showProductSuggestions={showProductSuggestions}
            setShowProductSuggestions={setShowProductSuggestions}
            productSearchTerms={productSearchTerms}
            handleProductSearch={handleProductSearch}
            selectProduct={selectProduct}
          />
          
          <SaleNotesField form={form} />
          
          <SaleDialogActions
            form={form}
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
            isEditMode={!!sale}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
