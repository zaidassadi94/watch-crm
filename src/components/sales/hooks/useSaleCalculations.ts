
// Export all calculation functions from the calculations directory
export { calculateSaleTotals, generateInvoiceNumber, getStockStatusBasedOnLevel } from './calculations';

/**
 * Update inventory stock levels when items are sold or returned
 * @deprecated Use updateInventoryStock from sale-data instead
 */
export async function updateInventoryStock(supabase: any, item: any, completion: boolean) {
  console.warn('This function is deprecated. Use updateInventoryStock from sale-data instead');
  
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
