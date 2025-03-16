
import { supabase } from '@/integrations/supabase/client';
import { Sale } from '@/types/sales';
import { SaleFormValues, SaleItemInternal } from '../saleFormSchema';
import { loadSaleItems, SaleItemWithInventory } from './loadSaleItems';

/**
 * Create a new sale record in the database
 */
export async function createSale(
  data: SaleFormValues,
  userId: string,
  totalAmount: number,
  totalProfit: number,
  invoiceNumber: string | null
) {
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
  return newSale;
}

/**
 * Update an existing sale in the database
 */
export async function updateSale(
  data: SaleFormValues,
  existingSale: Sale,
  totalAmount: number,
  totalProfit: number,
  invoiceNumber: string | null
) {
  console.log("Updating existing sale:", existingSale.id);
  
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
}

/**
 * Delete all items for a sale
 */
export async function deleteSaleItems(saleId: string) {
  const { error } = await supabase
    .from('sale_items')
    .delete()
    .eq('sale_id', saleId);

  if (error) {
    console.error("Error deleting sale items:", error);
    throw error;
  }
}

/**
 * Add items to a sale
 */
export async function addSaleItems(saleId: string, items: SaleFormValues['items']) {
  const { error } = await supabase
    .from('sale_items')
    .insert(
      items.map(item => ({
        sale_id: saleId,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        cost_price: item.cost_price || 0,
        subtotal: item.quantity * item.price,
        inventory_id: item.inventory_id
      }))
    );

  if (error) {
    console.error("Error inserting sale items:", error);
    throw error;
  }
}

/**
 * Load original items for a sale
 */
export async function getOriginalSaleItems(saleId: string): Promise<SaleItemWithInventory[]> {
  try {
    return await loadSaleItems(saleId);
  } catch (error) {
    console.error('Error fetching original sale items:', error);
    return [];
  }
}
