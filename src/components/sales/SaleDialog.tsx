
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
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  
  console.log('SaleDialog rendered. Props open:', open, 'localOpen:', localOpen, 'isEdit:', !!sale);
  
  // Use local state to ensure dialog stays visible during form submission
  useEffect(() => {
    if (open) {
      console.log('Setting localOpen to true because open prop is true');
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

  // Initialize the form without handlers that could close the dialog
  const { form, isSubmitting, onSubmit: formSubmit } = useSaleForm(
    sale, 
    user?.id, 
    () => {}, // We'll handle this separately
    () => {}  // We'll handle this separately
  );

  // Safe handlers that won't close the dialog prematurely
  const handleSaved = () => {
    console.log('Sale saved, calling onSaved callback');
    onSaved();
    // Use setTimeout to prevent state update issues
    setTimeout(() => {
      console.log('Closing dialog after save');
      setLocalOpen(false);
      onOpenChange(false);
    }, 300); // Increased timeout to be safer
  };

  const handleCancel = () => {
    console.log('Cancelling, setting localOpen to false');
    if (!isFormSubmitting && !isSubmitting) {
      setLocalOpen(false);
      onOpenChange(false);
    }
  };

  // Enhanced form handling with submission state tracking
  const handleFormSubmit = async (data: any) => {
    console.log('Form submitted, setting isFormSubmitting to true');
    setIsFormSubmitting(true);
    
    try {
      console.log('Calling onSubmit with data:', data);
      await formSubmit(data);
      console.log('Form submission completed successfully');
      handleSaved();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      console.log('Form submission complete, setting isFormSubmitting to false');
      setIsFormSubmitting(false);
    }
  };

  // Update product search terms when form is loaded
  useEffect(() => {
    if (open) {
      console.log('Dialog open, initializing product search terms');
      
      // Special case: if the dialog is open but there is no sale to edit,
      // We need to initialize the form with initial values
      if (!sale) {
        form.reset({
          customer_name: '',
          customer_email: '',
          customer_phone: '',
          payment_method: 'cash',
          status: 'completed',
          notes: '',
          items: [{ product_name: '', quantity: 1, price: 0 }]
        });
      }
      
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
  }, [sale, updateProductSearchTerms, open, form]);

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

  return (
    <Dialog 
      open={localOpen} 
      onOpenChange={(newOpen) => {
        console.log('Dialog onOpenChange:', newOpen, 'isSubmitting:', isSubmitting, 'isFormSubmitting:', isFormSubmitting);
        // Only allow dialog to close when not submitting
        if (!isSubmitting && !isFormSubmitting && !newOpen) {
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
        
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
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
            isSubmitting={isSubmitting || isFormSubmitting}
            onCancel={handleCancel}
            isEditMode={!!sale}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
