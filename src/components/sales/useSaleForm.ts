import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sale } from '@/pages/Sales';
import { saleFormSchema, SaleFormValues, calculateTotal, SaleItemInternal } from './saleFormSchema';
import { getStockStatusBasedOnLevel } from '@/components/inventory/dialog/InventoryFormSchema';

interface SaleItemWithInventory {
  id: string;
  sale_id: string;
  product_name: string;
  quantity: number;
  price: number;
  cost_price: number | null;
  subtotal: number;
  created_at: string;
  inventory_id?: string;
}

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

  const generateInvoiceNumber = async () => {
    try {
      const { data, error } = await supabase.rpc('nextval', { seq_name: 'invoice_number_seq' });
      
      if (error) throw error;
      
      const invoiceNumber = `INV-${String(data).padStart(8, '0')}`;
      return invoiceNumber;
    } catch (error) {
      console.error('Error generating invoice number:', error);
      return `INV-${Date.now()}`;
    }
  };

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
      
      const saleItems: SaleItemInternal[] = data.items.map(item => ({
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        cost_price: item.cost_price || 0,
        inventory_id: item.inventory_id
      }));
      
      const calculation = calculateTotal(saleItems);
      const totalAmount = calculation.totalPrice;
      const totalProfit = calculation.totalProfit;
      
      let invoiceNumber = data.invoice_number;
      if (data.status === 'completed' && !invoiceNumber) {
        invoiceNumber = await generateInvoiceNumber();
      }

      if (sale) {
        let originalItems: any[] = [];
        if (sale.status !== 'completed' && data.status === 'completed') {
          const { data: itemsData } = await supabase
            .from('sale_items')
            .select('*')
            .eq('sale_id', sale.id);
            
          originalItems = itemsData || [];
        }
        
        const { error } = await supabase
          .from('sales')
          .update({
            customer_name: data.customer_name,
            customer_email: data.customer_email || null,
            customer_phone: data.customer_phone || null,
            total_amount: totalAmount,
            total_profit: totalProfit,
            status: data.status,
            payment_method: data.payment_method || null,
            notes: data.notes || null,
            invoice_number: invoiceNumber,
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
              cost_price: item.cost_price || 0,
              subtotal: item.quantity * item.price,
              inventory_id: item.inventory_id
            }))
          );

        if (itemsError) throw itemsError;
        
        if (sale.status !== 'completed' && data.status === 'completed') {
          for (const item of data.items) {
            if (item.inventory_id) {
              const { data: inventoryData, error: inventoryError } = await supabase
                .from('inventory')
                .select('stock_level, stock_status')
                .eq('id', item.inventory_id)
                .single();
                
              if (inventoryError && inventoryError.code !== 'PGRST116') {
                console.error('Error fetching inventory:', inventoryError);
                continue;
              }
              
              if (inventoryData) {
                const newStockLevel = Math.max(0, inventoryData.stock_level - item.quantity);
                const newStockStatus = getStockStatusBasedOnLevel(newStockLevel);
                
                await supabase
                  .from('inventory')
                  .update({
                    stock_level: newStockLevel,
                    stock_status: newStockStatus,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', item.inventory_id);
              }
            }
          }
        }

        toast({
          title: "Sale updated",
          description: "Sale details have been updated successfully",
        });
      } else {
        const { data: newSale, error } = await supabase
          .from('sales')
          .insert({
            user_id: userId,
            customer_name: data.customer_name,
            customer_email: data.customer_email || null,
            customer_phone: data.customer_phone || null,
            total_amount: totalAmount,
            total_profit: totalProfit,
            status: data.status,
            payment_method: data.payment_method || null,
            notes: data.notes || null,
            invoice_number: invoiceNumber,
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
              cost_price: item.cost_price || 0,
              subtotal: item.quantity * item.price,
              inventory_id: item.inventory_id
            }))
          );

        if (itemsError) throw itemsError;
        
        if (data.status === 'completed') {
          for (const item of data.items) {
            if (item.inventory_id) {
              const { data: inventoryData, error: inventoryError } = await supabase
                .from('inventory')
                .select('stock_level, stock_status')
                .eq('id', item.inventory_id)
                .single();
                
              if (inventoryError && inventoryError.code !== 'PGRST116') {
                console.error('Error fetching inventory:', inventoryError);
                continue;
              }
              
              if (inventoryData) {
                const newStockLevel = Math.max(0, inventoryData.stock_level - item.quantity);
                const newStockStatus = getStockStatusBasedOnLevel(newStockLevel);
                
                await supabase
                  .from('inventory')
                  .update({
                    stock_level: newStockLevel,
                    stock_status: newStockStatus,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', item.inventory_id);
              }
            }
          }
        }

        toast({
          title: "Sale created",
          description: "New sale has been created successfully",
        });
      }

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
