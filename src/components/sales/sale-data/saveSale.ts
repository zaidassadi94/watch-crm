
import { supabase } from '@/integrations/supabase/client';
import { Sale } from '@/types/sales';
import { SaleFormValues } from '../saleFormSchema';
import { SaleItemInternal } from '../saleFormSchema';
import { calculateSaleTotals, generateInvoiceNumber } from '../hooks/calculations';
import { loadSaleItems, SaleItemWithInventory } from './loadSaleItems';
import { updateInventoryStock } from './updateInventoryStock';

/**
 * Save or update a sale in the database
 */
export async function saveSale(
  data: SaleFormValues, 
  userId: string, 
  existingSale: Sale | null = null
) {
  if (!userId) {
    throw new Error('User ID is required to save a sale');
  }
  
  const saleItems: SaleItemInternal[] = data.items.map(item => ({
    product_name: item.product_name,
    quantity: item.quantity,
    price: item.price,
    cost_price: item.cost_price || 0,
    inventory_id: item.inventory_id
  }));
  
  const calculation = calculateSaleTotals(saleItems);
  const totalAmount = calculation.totalPrice;
  const totalProfit = calculation.totalProfit;
  
  let invoiceNumber = data.invoice_number;
  if (data.status === 'completed' && !invoiceNumber) {
    invoiceNumber = await generateInvoiceNumber(supabase);
  }

  // Update existing sale
  if (existingSale) {
    let originalItems: SaleItemWithInventory[] = [];
    let originalStatus = existingSale.status;
    
    if (originalStatus !== 'completed' && data.status === 'completed') {
      try {
        originalItems = await loadSaleItems(existingSale.id);
      } catch (error) {
        console.error('Error fetching original sale items:', error);
      }
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
      .eq('id', existingSale.id);

    if (error) throw error;

    // Delete existing items
    const { error: deleteError } = await supabase
      .from('sale_items')
      .delete()
      .eq('sale_id', existingSale.id);

    if (deleteError) throw deleteError;

    // Insert new items
    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(
        data.items.map(item => ({
          sale_id: existingSale.id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
          cost_price: item.cost_price || 0,
          subtotal: item.quantity * item.price,
          inventory_id: item.inventory_id
        }))
      );

    if (itemsError) throw itemsError;
    
    // Update inventory if status changed to completed
    if (originalStatus !== 'completed' && data.status === 'completed') {
      for (const item of data.items) {
        if (item.inventory_id && item.product_name) {
          await updateInventoryStock({
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.price,
            cost_price: item.cost_price || 0,
            inventory_id: item.inventory_id
          }, true);
        }
      }
    }
    
    return existingSale.id;
  } else {
    // Create new sale
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

    // Insert new items
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
    
    // Update inventory if new sale is completed
    if (data.status === 'completed') {
      for (const item of data.items) {
        if (item.inventory_id && item.product_name) {
          await updateInventoryStock({
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.price,
            cost_price: item.cost_price || 0,
            inventory_id: item.inventory_id
          }, true);
        }
      }
    }
    
    return newSale.id;
  }
}
