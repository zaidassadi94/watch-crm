
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sale } from '@/pages/Sales';
import { useAuth } from '@/hooks/useAuth';
import { ProductSuggestion, CustomerSuggestion } from '@/types/inventory';
import { saleFormSchema, SaleFormValues, calculateTotal, SaleItemInternal } from './saleFormSchema';
import { CustomerForm } from './CustomerForm';
import { SaleItemForm } from './SaleItemForm';
import { useSuggestions } from './useSuggestions';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

interface SaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
  onSaved: () => void;
}

export function SaleDialog({ open, onOpenChange, sale, onSaved }: SaleDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    productSuggestions,
    showProductSuggestions,
    setShowProductSuggestions,
    productSearchTerms,
    updateProductSearchTerms,
    handleProductSearch,
    customerSuggestions,
    showCustomerSuggestions,
    setCustomerSearchTerm,
    setShowCustomerSuggestions
  } = useSuggestions(user?.id);

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      status: 'pending',
      payment_method: '',
      notes: '',
      items: [
        { product_name: '', quantity: 1, price: 0 }
      ],
    }
  });

  useEffect(() => {
    if (sale) {
      const fetchSaleItems = async () => {
        try {
          const { data, error } = await supabase
            .from('sale_items')
            .select('*')
            .eq('sale_id', sale.id);

          if (error) throw error;

          form.reset({
            customer_name: sale.customer_name,
            customer_email: sale.customer_email || '',
            customer_phone: sale.customer_phone || '',
            status: sale.status,
            payment_method: sale.payment_method || '',
            notes: sale.notes || '',
            items: data?.map(item => ({
              product_name: item.product_name,
              quantity: item.quantity,
              price: Number(item.price),
            })) || []
          });

          updateProductSearchTerms(data?.map(() => "") || []);
        } catch (error: any) {
          toast({
            title: "Error loading sale details",
            description: error.message,
            variant: "destructive",
          });
        }
      };

      fetchSaleItems();
    } else {
      form.reset({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        status: 'pending',
        payment_method: '',
        notes: '',
        items: [
          { product_name: '', quantity: 1, price: 0 }
        ],
      });
      updateProductSearchTerms(['']);
    }
  }, [sale, form, updateProductSearchTerms, toast]);

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

  const onSubmit = async (data: SaleFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Ensure items have all required properties for SaleItemInternal
      const saleItems: SaleItemInternal[] = data.items.map(item => ({
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price
      }));
      
      const totalAmount = calculateTotal(saleItems);

      if (sale) {
        const { error } = await supabase
          .from('sales')
          .update({
            customer_name: data.customer_name,
            customer_email: data.customer_email || null,
            customer_phone: data.customer_phone || null,
            total_amount: totalAmount,
            status: data.status,
            payment_method: data.payment_method || null,
            notes: data.notes || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', sale.id);

        if (error) throw error;

        const { error: deleteError } = await supabase
          .from('sale_items')
          .delete()
          .eq('sale_id', sale.id);

        if (deleteError) throw deleteError;

        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(
            data.items.map(item => ({
              sale_id: sale.id,
              product_name: item.product_name,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.quantity * item.price,
            }))
          );

        if (itemsError) throw itemsError;

        toast({
          title: "Sale updated",
          description: "Sale details have been updated successfully",
        });
      } else {
        const { data: newSale, error } = await supabase
          .from('sales')
          .insert({
            user_id: user.id,
            customer_name: data.customer_name,
            customer_email: data.customer_email || null,
            customer_phone: data.customer_phone || null,
            total_amount: totalAmount,
            status: data.status,
            payment_method: data.payment_method || null,
            notes: data.notes || null,
          })
          .select()
          .single();

        if (error) throw error;

        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(
            data.items.map(item => ({
              sale_id: newSale.id,
              product_name: item.product_name,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.quantity * item.price,
            }))
          );

        if (itemsError) throw itemsError;

        toast({
          title: "Sale created",
          description: "New sale has been created successfully",
        });
      }

      onOpenChange(false);
      onSaved();
    } catch (error: any) {
      toast({
        title: sale ? "Error updating sale" : "Error creating sale",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{sale ? 'Edit Sale' : 'Create New Sale'}</DialogTitle>
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
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any additional notes or details" 
                      className="min-h-24" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                  ? 'Saving...' 
                  : sale 
                    ? 'Update Sale'
                    : 'Create Sale'
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
