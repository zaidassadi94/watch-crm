import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { SaleForm } from './SaleForm';
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
  
  useEffect(() => {
    setLocalOpen(open);
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
    setLocalOpen(false);
    onOpenChange(false);
  };

  const handleCancel = () => {
    form.reset();
    setLocalOpen(false);
    onOpenChange(false);
  };

  const { form, isSubmitting, onSubmit } = useSaleForm(
    sale, 
    user?.id, 
    handleSaved,
    handleCancel
  );

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
        if (!newOpen && !isSubmitting) {
          handleCancel();
        } else {
          setLocalOpen(newOpen);
          onOpenChange(newOpen);
        }
      }}
    >
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{sale ? 'Edit Sale' : 'Create New Sale'}</DialogTitle>
          <DialogDescription>
            {sale ? 'Update the details of this sale' : 'Enter the details for the new sale'}
          </DialogDescription>
        </DialogHeader>
        
        <SaleForm 
          form={form}
          customerSuggestions={customerSuggestions}
          showCustomerSuggestions={showCustomerSuggestions}
          setCustomerSearchTerm={setCustomerSearchTerm}
          selectCustomer={selectCustomer}
        />
      </DialogContent>
    </Dialog>
  );
}
