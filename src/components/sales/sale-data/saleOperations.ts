
import { supabase } from '@/integrations/supabase/client';
import { SaleFormValues, SaleItemInternal } from '../saleFormSchema';
import { Sale } from '@/types/sales';
import { SaleItemWithInventory } from './loadSaleItems';

/**
 * Get original sale items for inventory restoration
 */
export async function getOriginalSaleItems(saleId: string): Promise<SaleItemWithInventory[]> {
  try {
    const { data, error } = await supabase
      .from('sale_items')
      .select('*')
      .eq('sale_id', saleId);
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching original sale items:', error);
    return [];
  }
}

/**
 * Create a new sale
 */
export async function createSale(
  data: SaleFormValues, 
  userId: string, 
  totalAmount: number, 
  totalProfit: number, 
  invoiceNumber: string | null
) {
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
  
  return newSale;
}

/**
 * Update an existing sale
 */
export async function updateSale(
  data: SaleFormValues, 
  existingSale: Sale, 
  totalAmount: number, 
  totalProfit: number, 
  invoiceNumber: string | null
) {
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
}

/**
 * Delete all items for a sale
 */
export async function deleteSaleItems(saleId: string) {
  const { error } = await supabase
    .from('sale_items')
    .delete()
    .eq('sale_id', saleId);

  if (error) throw error;
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
        inventory_id: item.inventory_id,
        sku: item.sku // Add SKU field for better inventory tracking
      }))
    );

  if (error) throw error;
}
