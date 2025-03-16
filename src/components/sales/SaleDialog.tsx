
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
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
  const [isClosing, setIsClosing] = useState(false);
  
  // Create handlers before form init to avoid timing issues
  const handleSaved = useCallback(() => {
    setIsClosing(true);
    onSaved();
    
    // Delay the dialog close slightly to allow the success toast to show first
    setTimeout(() => {
      onOpenChange(false);
      setIsClosing(false);
    }, 100);
  }, [onSaved, onOpenChange]);
  
  const handleCancel = useCallback(() => {
    if (isFormSubmitting || isClosing) return;
    
    setIsClosing(true);
    setTimeout(() => {
      onOpenChange(false);
      setIsClosing(false);
    }, 100);
  }, [isFormSubmitting, onOpenChange, isClosing]);
  
  // Initialize form with proper handlers
  const { form, isSubmitting, onSubmit: formSubmit } = useSaleForm(
    sale, 
    user?.id, 
    handleSaved,
    handleCancel
  );
  
  // Set up suggestions with proper initialization
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

  // Enhanced form submission handler with error protection
  const handleFormSubmit = useCallback(async (data: any) => {
    if (isFormSubmitting || isClosing) return;
    
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
      setIsFormSubmitting(false);
    }
  }, [formSubmit, isFormSubmitting, toast, isClosing]);

  // Initialize form data when sale changes
  useEffect(() => {
    if (!open) return; // Only initialize when dialog is open
    
    if (!sale) {
      // Initialize new sale form with empty values
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
    } else {
      // Fetch items for existing sale
      const fetchSaleItems = async () => {
        try {
          const { data, error } = await supabase
            .from('sale_items')
            .select('*')
            .eq('sale_id', sale.id);
            
          if (error) throw error;
            
          if (data && data.length > 0) {
            form.reset({
              customer_name: sale.customer_name || '',
              customer_email: sale.customer_email || '',
              customer_phone: sale.customer_phone || '',
              status: sale.status,
              payment_method: sale.payment_method || 'cash',
              notes: sale.notes || '',
              invoice_number: sale.invoice_number || '',
              items: data.map(item => ({
                product_name: item.product_name || '',
                quantity: item.quantity || 1,
                price: Number(item.price) || 0,
                cost_price: Number(item.cost_price) || 0,
                inventory_id: item.inventory_id || undefined
              }))
            });
            updateProductSearchTerms(Array(data.length).fill(""));
          } else {
            // If no items found, initialize with one empty item
            form.reset({
              customer_name: sale.customer_name || '',
              customer_email: sale.customer_email || '',
              customer_phone: sale.customer_phone || '',
              status: sale.status,
              payment_method: sale.payment_method || 'cash',
              notes: sale.notes || '',
              invoice_number: sale.invoice_number || '',
              items: [{ product_name: '', quantity: 1, price: 0, cost_price: 0 }]
            });
            updateProductSearchTerms(['']);
          }
        } catch (error) {
          console.error("Error fetching sale items:", error);
          toast({
            title: "Error loading sale details",
            description: "Could not load sale items. Please try again.",
            variant: "destructive",
          });
        }
      };
      
      fetchSaleItems();
    }
  }, [sale, open, updateProductSearchTerms, form, toast]);

  // Product selection handler
  const selectProduct = useCallback((product: ProductSuggestion, index: number) => {
    form.setValue(`items.${index}.product_name`, `${product.brand} ${product.name} (${product.sku})`);
    form.setValue(`items.${index}.price`, product.price);
    form.setValue(`items.${index}.cost_price`, product.cost_price || 0);
    form.setValue(`items.${index}.inventory_id`, product.id);
    setShowProductSuggestions(null);
  }, [form, setShowProductSuggestions]);

  // Customer selection handler
  const selectCustomer = useCallback((customer: CustomerSuggestion) => {
    form.setValue('customer_name', customer.name);
    if (customer.email) form.setValue('customer_email', customer.email);
    if (customer.phone) form.setValue('customer_phone', customer.phone);
    setShowCustomerSuggestions(false);
  }, [form, setShowCustomerSuggestions]);

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (!newOpen && !isFormSubmitting && !isSubmitting && !isClosing) {
          handleCancel();
        }
      }}
    >
      <DialogContent 
        className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          if (isFormSubmitting || isSubmitting || isClosing) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (isFormSubmitting || isSubmitting || isClosing) {
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
        
        <Form {...form}>
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
        </Form>
      </DialogContent>
    </Dialog>
  );
}
