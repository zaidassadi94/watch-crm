
import React, { useState, useEffect, useRef } from 'react';
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
import { useToast } from '@/components/ui/use-toast';

interface SaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
  onSaved: () => void;
}

export function SaleDialog({ open, onOpenChange, sale, onSaved }: SaleDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [localOpen, setLocalOpen] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const formInitialized = useRef(false);
  
  // Use the same pattern as other working dialogs
  useEffect(() => {
    if (open) {
      setLocalOpen(true);
    } else {
      // Only close if we're not in the middle of submitting
      if (!isFormSubmitting) {
        setLocalOpen(false);
      }
    }
  }, [open, isFormSubmitting]);
  
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

  // Initialize the form with proper handlers
  const handleSaved = () => {
    onSaved();
    setTimeout(() => {
      setLocalOpen(false);
      onOpenChange(false);
    }, 100);
  };

  const handleCancel = () => {
    if (!isFormSubmitting && !isSubmitting) {
      setLocalOpen(false);
      onOpenChange(false);
    }
  };

  // Initialize the form with the handlers
  const { form, isSubmitting, onSubmit: formSubmit } = useSaleForm(
    sale, 
    user?.id, 
    handleSaved,
    handleCancel
  );

  // Enhanced form handling with submission state tracking
  const handleFormSubmit = async (data: any) => {
    setIsFormSubmitting(true);
    
    try {
      await formSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "There was a problem submitting the form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Update product search terms when form is loaded
  useEffect(() => {
    if (open && !formInitialized.current) {
      formInitialized.current = true;
      
      // If dialog is open but there is no sale to edit, initialize with default values
      if (!sale) {
        try {
          form.reset({
            customer_name: '',
            customer_email: '',
            customer_phone: '',
            payment_method: 'cash',
            status: 'completed',
            notes: '',
            items: [{ product_name: '', quantity: 1, price: 0 }]
          });
          updateProductSearchTerms(['']);
        } catch (error) {
          console.error("Error initializing form:", error);
        }
      } else {
        const fetchSaleItems = async () => {
          try {
            const { data, error } = await supabase
              .from('sale_items')
              .select('*')
              .eq('sale_id', sale.id);
              
            if (error) throw error;
              
            if (data) {
              updateProductSearchTerms(Array(data.length).fill(""));
            }
          } catch (error) {
            console.error("Error fetching sale items:", error);
          }
        };
        
        fetchSaleItems();
      }
    }
    
    // Reset the initialization flag when dialog closes
    if (!open) {
      formInitialized.current = false;
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
        // Only allow dialog to close when not submitting
        if (!isSubmitting && !isFormSubmitting && !newOpen) {
          handleCancel();
        }
      }}
    >
      <DialogContent 
        className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>{sale ? 'Edit Sale' : 'Create New Sale'}</DialogTitle>
          <DialogDescription>
            {sale ? 'Update the details of this sale' : 'Enter the details for the new sale'}
          </DialogDescription>
        </DialogHeader>
        
        {localOpen && (
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
        )}
      </DialogContent>
    </Dialog>
  );
}
