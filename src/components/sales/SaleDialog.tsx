
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Sale } from '@/pages/Sales';
import { useAuth } from '@/hooks/useAuth';
import { ProductSuggestion, CustomerSuggestion } from '@/types/inventory';
import { supabase } from '@/integrations/supabase/client';
import { CustomerForm } from './CustomerForm';
import { SaleItemForm } from './SaleItemForm';
import { SaleNotesField } from './SaleNotesField';
import { SaleDialogActions } from './SaleDialogActions';
import { useSaleForm } from './useSaleForm';
import { useSuggestions } from './useSuggestions';

interface SaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
  onSaved: () => void;
}

export function SaleDialog({ open, onOpenChange, sale, onSaved }: SaleDialogProps) {
  const { user } = useAuth();
  
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

  const { form, isSubmitting, onSubmit } = useSaleForm(
    sale, 
    user?.id, 
    () => {
      onSaved();
      onOpenChange(false);
    },
    () => {
      // Ensure proper cleanup on cancel
      form.reset(); 
      onOpenChange(false);
    }
  );

  useEffect(() => {
    // Update product search terms when the sale items change
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
    setShowProductSuggestions(null);
  };

  const selectCustomer = (customer: CustomerSuggestion) => {
    form.setValue('customer_name', customer.name);
    if (customer.email) form.setValue('customer_email', customer.email);
    if (customer.phone) form.setValue('customer_phone', customer.phone);
    setShowCustomerSuggestions(false);
  };

  const handleCancel = () => {
    // Explicit cancel handler to ensure dialog closes properly
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        // Handle dialog close via the X button or clicking outside
        if (!newOpen && !isSubmitting) {
          handleCancel();
        } else {
          onOpenChange(newOpen);
        }
      }}
    >
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{sale ? 'Edit Sale' : 'Create New Sale'}</DialogTitle>
          <DialogDescription>
            {sale ? 'Update the details of this sale' : 'Enter the details for the new sale'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
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
              isSubmitting={isSubmitting} 
              onCancel={handleCancel}
              isEditMode={!!sale}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
