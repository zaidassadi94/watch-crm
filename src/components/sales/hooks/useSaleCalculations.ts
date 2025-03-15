
import { SaleItemInternal } from '../saleFormSchema';

/**
 * Calculate totals for a set of sale items
 */
export function calculateSaleTotals(items: SaleItemInternal[]) {
  const totalPrice = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const totalCost = items.reduce((sum, item) => sum + (item.quantity * (item.cost_price || 0)), 0);
  const totalProfit = totalPrice - totalCost;
  const marginPercentage = totalPrice > 0 ? (totalProfit / totalPrice) * 100 : 0;
  
  return {
    totalPrice,
    totalCost,
    totalProfit,
    marginPercentage
  };
}

/**
 * Generate an invoice number for a new sale
 */
export async function generateInvoiceNumber(supabase: any) {
  try {
    const { data, error } = await supabase.rpc('nextval', { seq_name: 'invoice_number_seq' });
    
    if (error) throw error;
    
    // Format the number as a 4-digit string with leading zeros
    const invoiceNumber = `#${String(data).padStart(4, '0')}`;
    return invoiceNumber;
  } catch (error) {
    console.error('Error generating invoice number:', error);
    // Fallback invoice number in case of error
    return `#${Date.now().toString().substr(-4)}`;
  }
}

/**
 * Update inventory stock levels when items are sold or returned
 */
export async function updateInventoryStock(supabase: any, item: SaleItemInternal, completion: boolean) {
  if (!item.inventory_id) return;
  
  try {
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select('stock_level, stock_status')
      .eq('id', item.inventory_id)
      .single();
      
    if (inventoryError && inventoryError.code !== 'PGRST116') {
      console.error('Error fetching inventory:', inventoryError);
      return;
    }
    
    if (inventoryData) {
      // If completing sale, reduce stock. Otherwise no change needed
      const stockChange = completion ? -item.quantity : 0;
      const newStockLevel = Math.max(0, inventoryData.stock_level + stockChange);
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
  } catch (error) {
    console.error('Error updating inventory:', error);
  }
}

/**
 * Determine stock status based on level
 */
export function getStockStatusBasedOnLevel(level: number): string {
  if (level <= 0) return 'out_of_stock';
  if (level <= 5) return 'low_stock';
  return 'in_stock';
}
