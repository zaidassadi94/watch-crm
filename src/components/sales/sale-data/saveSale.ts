
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
  
  console.log("Saving sale:", { 
    isUpdate: !!existingSale,
    userId,
    itemsCount: data.items.length,
    status: data.status
  });
  
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
    console.log("Updating existing sale:", existingSale.id);
    
    // Load original items and status before updating
    let originalItems: SaleItemWithInventory[] = [];
    let originalStatus = existingSale.status;
    
    try {
      originalItems = await loadSaleItems(existingSale.id);
      console.log("Original items:", originalItems);
    } catch (error) {
      console.error('Error fetching original sale items:', error);
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

    if (error) {
      console.error("Error updating sale:", error);
      throw error;
    }

    // Delete existing items
    const { error: deleteError } = await supabase
      .from('sale_items')
      .delete()
      .eq('sale_id', existingSale.id);

    if (deleteError) {
      console.error("Error deleting sale items:", deleteError);
      throw deleteError;
    }

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

    if (itemsError) {
      console.error("Error inserting sale items:", itemsError);
      throw itemsError;
    }
    
    // If status changed to completed, update inventory
    if (originalStatus !== 'completed' && data.status === 'completed') {
      console.log("Sale status changed to completed, updating inventory");
      
      for (const item of data.items) {
        if (item.inventory_id && item.product_name) {
          console.log("Updating inventory for item:", item);
          await updateInventoryStock({
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.price,
            cost_price: item.cost_price || 0,
            inventory_id: item.inventory_id
          }, true);
        } else {
          console.log("Skipping inventory update for item without inventory_id:", item);
        }
      }
    }
    
    return existingSale.id;
  } else {
    // Create new sale
    console.log("Creating new sale");
    
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

    if (error) {
      console.error("Error creating sale:", error);
      throw error;
    }

    console.log("New sale created:", newSale);

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

    if (itemsError) {
      console.error("Error inserting sale items:", itemsError);
      throw itemsError;
    }
    
    // Update inventory if new sale is completed
    if (data.status === 'completed') {
      console.log("New sale is completed, updating inventory");
      
      for (const item of data.items) {
        if (item.inventory_id && item.product_name) {
          console.log("Updating inventory for item:", item);
          await updateInventoryStock({
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.price,
            cost_price: item.cost_price || 0,
            inventory_id: item.inventory_id
          }, true);
        } else {
          console.log("Skipping inventory update for item without inventory_id:", item);
        }
      }
    }
    
    return newSale.id;
  }
}
