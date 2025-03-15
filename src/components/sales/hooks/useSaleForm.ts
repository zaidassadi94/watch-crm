
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { Sale } from '@/pages/Sales';
import { saleFormSchema, SaleFormValues } from '../saleFormSchema';
import { loadSaleItems, saveSale, SaleItemWithInventory } from './useSaleDataAccess';

export function useSaleForm(sale: Sale | null, userId: string | undefined, onSuccess: () => void, onCancel: () => void) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      status: 'pending',
      payment_method: '',
      notes: '',
      invoice_number: '',
      items: [
        { product_name: '', quantity: 1, price: 0, cost_price: 0 }
      ],
    }
  });

  // Load sale data if editing
  useEffect(() => {
    if (sale) {
      const fetchSaleItems = async () => {
        try {
          const data = await loadSaleItems(sale.id);

          form.reset({
            customer_name: sale.customer_name,
            customer_email: sale.customer_email || '',
            customer_phone: sale.customer_phone || '',
            status: sale.status,
            payment_method: sale.payment_method || '',
            notes: sale.notes || '',
            invoice_number: sale.invoice_number || '',
            items: data?.map(item => ({
              product_name: item.product_name,
              quantity: item.quantity,
              price: Number(item.price),
              cost_price: Number(item.cost_price || 0),
              inventory_id: item.inventory_id
            })) || []
          });
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
        invoice_number: '',
        items: [
          { product_name: '', quantity: 1, price: 0, cost_price: 0 }
        ],
      });
    }
  }, [sale, form, toast]);

  // Form submission handler
  const onSubmit = async (data: SaleFormValues) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await saveSale(data, userId, sale);
      
      toast({
        title: sale ? "Sale updated" : "Sale created",
        description: sale 
          ? "Sale details have been updated successfully" 
          : "New sale has been created successfully",
      });

      onSuccess();
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

  return {
    form,
    isSubmitting,
    onSubmit,
  };
}
