
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
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const formInitialized = useRef(false);
  const dialogMounted = useRef(false);
  
  // Local state for controlling dialog visibility
  const [localOpen, setLocalOpen] = useState(open);
  
  // Synchronize local state with prop
  useEffect(() => {
    if (open) {
      setLocalOpen(true);
    }
  }, [open]);
  
  // Mark component as mounted
  useEffect(() => {
    dialogMounted.current = true;
    
    // Cleanup on unmount
    return () => {
      dialogMounted.current = false;
    };
  }, []);
  
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

  // Safe dialog close handler
  const handleClose = () => {
    if (isFormSubmitting) return;
    
    setLocalOpen(false);
    
    // Delay the parent notification
    setTimeout(() => {
      if (dialogMounted.current) {
        onOpenChange(false);
      }
    }, 200);
  };

  // Handle successful save
  const handleSaved = () => {
    onSaved();
    handleClose();
  };

  // Create safe cancel handler
  const handleCancel = () => {
    if (isFormSubmitting) return;
    handleClose();
  };
  
  // Initialize form with error handling
  const { form, isSubmitting, onSubmit: formSubmit } = useSaleForm(
    sale, 
    user?.id, 
    handleSaved,
    handleCancel
  );

  // Enhanced form submission handler with error protection
  const handleFormSubmit = async (data: any) => {
    if (isFormSubmitting) return;
    
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
      if (dialogMounted.current) {
        setIsFormSubmitting(false);
      }
    }
  };

  // Initialize form data when dialog opens
  useEffect(() => {
    if (localOpen && !formInitialized.current && dialogMounted.current) {
      formInitialized.current = true;
      
      if (!sale) {
        // Initialize new sale form
        try {
          form.reset({
            customer_name: '',
            customer_email: '',
            customer_phone: '',
            payment_method: 'cash',
            status: 'completed',
            notes: '',
            items: [{ product_name: '', quantity: 1, price: 0, cost_price: 0 }]
          });
          updateProductSearchTerms(['']);
        } catch (error) {
          console.error("Error initializing new sale form:", error);
        }
      } else {
        // Fetch items for existing sale
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
    
    if (!localOpen) {
      formInitialized.current = false;
    }
  }, [sale, updateProductSearchTerms, localOpen, form]);

  // Product selection handler
  const selectProduct = (product: ProductSuggestion, index: number) => {
    form.setValue(`items.${index}.product_name`, `${product.brand} ${product.name} (${product.sku})`);
    form.setValue(`items.${index}.price`, product.price);
    form.setValue(`items.${index}.cost_price`, product.cost_price || 0);
    form.setValue(`items.${index}.inventory_id`, product.id);
    setShowProductSuggestions(null);
  };

  // Customer selection handler
  const selectCustomer = (customer: CustomerSuggestion) => {
    form.setValue('customer_name', customer.name);
    if (customer.email) form.setValue('customer_email', customer.email);
    if (customer.phone) form.setValue('customer_phone', customer.phone);
    setShowCustomerSuggestions(false);
  };

  // Don't render content if dialog isn't open
  if (!localOpen) {
    return null;
  }

  return (
    <Dialog 
      open={localOpen} 
      onOpenChange={(newOpen) => {
        if (!newOpen && !isFormSubmitting && !isSubmitting) {
          handleClose();
        }
      }}
    >
      <DialogContent 
        className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          if (isFormSubmitting || isSubmitting) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (isFormSubmitting || isSubmitting) {
            e.preventDefault();
          }
        }}
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
